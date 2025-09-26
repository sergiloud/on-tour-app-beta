import { showStore } from '../../shared/showStore';
import type { FinanceSnapshot, FinanceShow, BreakdownEntry, MarginBreakdown, ForecastPoint } from './types';

// Previously applied a 45% heuristic cost. For the curated dataset we want net === fee unless explicit costs are provided.
const EXPENSE_RATE = 0; // effectively disabled heuristic

function monthRange(d = new Date()) {
  const start = new Date(d.getFullYear(), d.getMonth(), 1);
  const end = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59, 999);
  return { start, end };
}

export function buildFinanceSnapshotFromShows(shows: FinanceShow[], now = new Date()): FinanceSnapshot {
  const asOf = now.toISOString();
  const { start, end } = monthRange(now);
  const inMonth = shows.filter(s => {
    const t = new Date(s.date).getTime();
    return t >= start.getTime() && t <= end.getTime();
  });
  const inYear = shows.filter(s => new Date(s.date).getFullYear() === now.getFullYear());

  const sumIncome = (list: FinanceShow[]) => list.reduce((acc, s) => acc + (s.status !== 'offer' ? s.fee : 0), 0);
  // Expense now only counts if an explicit cost field is provided; otherwise zero so net = fee.
  const showCost = (s: FinanceShow) => s.status !== 'offer' ? (typeof s.cost === 'number' ? s.cost : 0) : 0;
  const sumExpenses = (list: FinanceShow[]) => list.reduce((acc, s) => acc + showCost(s), 0);

  const monthIncome = sumIncome(inMonth);
  const monthExpenses = sumExpenses(inMonth);
  const yearIncome = sumIncome(inYear);
  const yearExpenses = sumExpenses(inYear);

  const pending = shows.filter(s => s.status === 'pending').reduce((acc, s) => acc + s.fee, 0);

  // Margin breakdown utilities
  const groupBy = <K extends keyof FinanceShow>(key: K, list: FinanceShow[]): BreakdownEntry[] => {
    const map = new Map<string, BreakdownEntry>();
    for (const s of list) {
      const k = (s[key] as unknown as string) || '—';
      const income = s.status !== 'offer' ? s.fee : 0;
      const expenses = showCost(s);
      const entry = map.get(k) || { key: k, income: 0, expenses: 0, net: 0, count: 0 };
      entry.income += income;
      entry.expenses += expenses;
      entry.net = entry.income - entry.expenses;
      entry.count += 1;
      map.set(k, entry);
    }
    return Array.from(map.values()).sort((a,b)=> b.net - a.net);
  };

  const breakdown: MarginBreakdown = {
    byRoute: groupBy('route', inYear),
    byVenue: groupBy('venue', inYear),
    byPromoter: groupBy('promoter', inYear)
  };

  // Simple forecast placeholder: next 6 months projecting flat net from current month
  const next: ForecastPoint[] = Array.from({ length: 6 }, (_, i) => {
    const d2 = new Date(now);
    d2.setMonth(d2.getMonth() + i + 1);
    const monthKey = `${d2.getFullYear()}-${String(d2.getMonth() + 1).padStart(2, '0')}`;
    const baseline = monthIncome - monthExpenses;
    return { month: monthKey, net: Math.round(baseline), p50: Math.round(baseline), p90: Math.round(baseline * 1.15) };
  });

  const inflows = monthIncome;
  const outflows = monthExpenses;

  return {
    asOf,
    shows,
    month: {
      start: start.toISOString(),
      end: end.toISOString(),
      income: Math.round(monthIncome),
      expenses: Math.round(monthExpenses),
      net: Math.round(monthIncome - monthExpenses)
    },
    year: {
      income: Math.round(yearIncome),
      expenses: Math.round(yearExpenses),
      net: Math.round(yearIncome - yearExpenses)
    },
    pending: Math.round(pending),
    breakdown,
    forecast: { next },
    cashflow: { month: { inflows: Math.round(inflows), outflows: Math.round(outflows), net: Math.round(inflows - outflows) }, pending: Math.round(pending) }
  };
}

export function buildFinanceSnapshot(now = new Date()): FinanceSnapshot {
  const shows = showStore.getAll() as unknown as FinanceShow[];
  return buildFinanceSnapshotFromShows(shows, now);
}
