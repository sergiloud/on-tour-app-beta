// Finance selectors & memoized derivations
// These operate on FinanceSnapshot structure produced by finance-core.
// Keep pure & side-effect free; consumers can wrap in useMemo/useSyncExternalStore.

import type { FinanceSnapshot, ForecastScenario } from './finance-types';

// Simple in-memory memo cache keyed by object identity + string param signature.
const cache = new WeakMap<object, Map<string, any>>();
function memo<TObj extends object, TResult>(root: TObj, key: string, calc: () => TResult): TResult {
  let m = cache.get(root);
  if(!m){ m = new Map(); cache.set(root, m); }
  if(m.has(key)) return m.get(key);
  const val = calc();
  m.set(key, val);
  return val;
}

// Trend for a KPI across forecast horizon (actual months first, then forecast months)
export function selectKpiTrend(snapshot: FinanceSnapshot, kpi: keyof FinanceSnapshot['kpis']){
  return memo(snapshot, `kpiTrend:${String(kpi)}`, () => {
    const currentVal = snapshot.kpis[kpi];
    const historical = [{ label: 'current', value: currentVal }];
    // Flatten forecast scenarios into comparable series
    const scenarios = (snapshot.forecasts || []).map(s => ({ id: s.id, label: s.label, points: s.series.map(pt => ({ month: pt.month, value: pt.value })) }));
    return { historical, scenarios };
  });
}

// Expense totals by category (negative amounts aggregated absolute for visualization)
export function selectExpenseByCategory(snapshot: FinanceSnapshot){
  return memo(snapshot, 'expenseByCategory', () => {
    const catMap: Record<string, { total: number; count: number; }> = {};
    for(const ex of snapshot.expenses){
      const amt = Math.abs(ex.amount);
      const key = ex.category || 'Uncategorized';
      const bucket = catMap[key] || (catMap[key] = { total: 0, count: 0 });
      bucket.total += amt;
      bucket.count += 1;
    }
    return Object.entries(catMap).map(([category, v]) => ({ category, total: v.total, count: v.count })).sort((a,b)=> b.total - a.total);
  });
}

// Monthly revenue & expense series for charts (using snapshot.shows summaries)
export function selectMonthlySeries(snapshot: FinanceSnapshot){
  return memo(snapshot, 'monthlySeries', () => {
    const byMonth: Record<string, { revenue: number; expenses: number; margin: number; }> = {};
    for(const show of snapshot.shows){
      const m = show.date.slice(0,7);
      if(!byMonth[m]) byMonth[m] = { revenue: 0, expenses: 0, margin: 0 };
  byMonth[m].revenue += show.income;
  byMonth[m].expenses += show.expenses;
    }
    return Object.entries(byMonth).map(([month, v]) => ({ month, revenue: v.revenue, expenses: v.expenses, margin: +( (v.revenue ? (v.revenue - v.expenses)/v.revenue : 0) * 100 ).toFixed(2) })).sort((a,b)=> a.month.localeCompare(b.month));
  });
}

// Validate internal consistency (exported for invariant script)
export function validateSnapshot(snapshot: FinanceSnapshot){
  const totalRevenue = snapshot.shows.reduce((s,x)=> s + x.income, 0);
  const totalExpenses = snapshot.shows.reduce((s,x)=> s + x.expenses, 0);
  const expectedNet = totalRevenue - totalExpenses;
  const pass = Math.abs(expectedNet - snapshot.kpis.net) < 0.01;
  return { pass, totalRevenue, totalExpenses, expectedNet, kpiNet: snapshot.kpis.net };
}

// Active forecast scenario resolution
export function selectActiveScenario(snapshot: FinanceSnapshot): ForecastScenario | undefined {
  return (snapshot.forecasts || []).find(s => s.id === snapshot.selectedScenarioId) || snapshot.forecasts?.[0];
}

// Count of anomalies grouped by severity type
export function selectAnomalySummary(snapshot: FinanceSnapshot){
  return memo(snapshot, 'anomalySummary', () => {
    const res = { total: snapshot.anomalies?.length || 0, expenseSpike: 0, incomeDrop: 0 };
    snapshot.anomalies?.forEach(a => { if(a.type === 'expense-spike') res.expenseSpike++; else if(a.type === 'income-drop') res.incomeDrop++; });
    return res;
  });
}

// Profitability timeline (net margin per month sorted chronologically)
export function selectProfitabilityTimeline(snapshot: FinanceSnapshot){
  return memo(snapshot, 'profitTimeline', () => {
    const byMonth: Record<string, { net: number; income: number; } > = {};
    snapshot.shows.forEach(sh => {
      const m = sh.date.slice(0,7);
      const b = byMonth[m] || (byMonth[m] = { net: 0, income: 0 });
      b.net += sh.net;
      b.income += sh.income;
    });
    return Object.entries(byMonth).map(([month, v]) => ({ month, marginPct: v.income ? +( (v.net / v.income)*100 ).toFixed(2) : 0 })).sort((a,b)=> a.month.localeCompare(b.month));
  });
}
