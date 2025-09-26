import { computeShowFinance, summarizeMonth } from './finance-calcs';
import { demoShows } from '../../../data/demo';
import type { FinanceSnapshot, FinanceShowSummary, FinanceExpense, ForecastScenario, FinanceAnomaly } from './finance-types';
import { generateForecastScenarios } from './forecasting-engine';

function buildBaselineForecast(ref: Date) {
  const pts = [] as Array<{ month: string; value: number }>;
  const d = new Date(ref);
  for(let i=0;i<6;i++){
    const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
    const base = 20000 + 3000 * Math.sin(i/2);
    pts.push({ month: key, value: Math.round(base) });
    d.setMonth(d.getMonth()+1);
  }
  return pts;
}

export function buildSnapshot(ref = new Date()): FinanceSnapshot {
  const month = ref.getMonth();
  const year = ref.getFullYear();
  const showsInMonth = demoShows.filter(s => { const d = new Date(s.date); return d.getMonth()===month && d.getFullYear()===year; });

  const showSummaries: FinanceShowSummary[] = showsInMonth.map(s => {
    const f = computeShowFinance(s.id, s);
    const marginPct = f.income ? Math.round((f.net / f.income) * 100) : 0;
    return { id: s.id, date: s.date, city: s.city, venue: s.venue, income: f.income, expenses: f.expenses, net: f.net, payable: f.payable, marginPct };
  });

  const kpiMonth = summarizeMonth(demoShows, month, year);
  const prev = new Date(ref); prev.setMonth(month - 1);
  const prevSum = summarizeMonth(demoShows, prev.getMonth(), prev.getFullYear());
  const marginPct = kpiMonth.income ? Math.round((kpiMonth.net / kpiMonth.income) * 100) : 0;

  const expenses: FinanceExpense[] = showSummaries.flatMap(sh => {
    const f = computeShowFinance(sh.id, demoShows.find(d => d.id === sh.id));
    return f.items.map((it, idx) => ({
      id: `${sh.id}:${idx}`,
      showId: sh.id,
      category: it.label.startsWith('Fee') ? 'Income' : 'Expense',
      type: it.val >= 0 ? 'income' : 'expense',
      amount: Math.abs(it.val),
      date: sh.date,
      description: it.label
    }));
  });

  // Multi-scenario forecasts (baseline/optimistic/pessimistic)
  const forecasts: ForecastScenario[] = generateForecastScenarios({ refDate: ref });
  const incomeTotal = kpiMonth.income || 1;
  const anomalies: FinanceAnomaly[] = expenses
    .filter(e => e.type === 'expense' && e.amount > incomeTotal * 0.3)
    .map(e => ({ id: `anom:${e.id}`, type: 'expense-spike', date: e.date, amount: e.amount, category: e.category, note: 'Large single expense >30% income' }));

  return {
    generatedAt: new Date().toISOString(),
    period: { month, year },
    kpis: { income: kpiMonth.income, expenses: kpiMonth.expenses, net: kpiMonth.net, payable: 0, marginPct, previousNet: prevSum.net },
    shows: showSummaries,
    expenses,
    forecasts,
  anomalies,
  selectedScenarioId: forecasts[0]?.id
  };
}
