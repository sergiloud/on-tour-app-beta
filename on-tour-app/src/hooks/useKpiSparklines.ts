import { useMemo } from 'react';
import { useFinance } from '../context/FinanceContext';

export type KpiSparklines = {
  incomeSeries: number[];
  costsSeries: number[];
  netSeries: number[];
  prevMonth: { income: number; costs: number; net: number };
};

// Centralizes KPI sparkline prep (7-point tails + prev month values)
export function useKpiSparklines(): KpiSparklines {
  const { snapshot, monthlySeries } = useFinance();

  return useMemo(() => {
    const tail = (arr: number[]) => arr.slice(-7);
    const asOf = new Date(snapshot.asOf);
    const monthKey = `${asOf.getFullYear()}-${String(asOf.getMonth() + 1).padStart(2, '0')}`;
    const idx = monthlySeries.months.indexOf(monthKey);
    const prevIdx = (idx === -1 ? monthlySeries.months.length - 1 : idx) - 1;
    const prevMonth = {
      income: prevIdx >= 0 ? monthlySeries.income[prevIdx] : 0,
      costs: prevIdx >= 0 ? monthlySeries.costs[prevIdx] : 0,
      net: prevIdx >= 0 ? monthlySeries.net[prevIdx] : 0,
    };
    const i = tail(monthlySeries.income);
    const c = tail(monthlySeries.costs);
    const n = tail(monthlySeries.net);
    // Stabilize references if values did not change compared to previous memoized values
    // (Relies on React closure over last return value)
    let last: KpiSparklines | undefined;
    try { last = (useKpiSparklines as any)._last as KpiSparklines | undefined; } catch {}
    const same = (a?: number[], b?: number[]) => !!a && !!b && a.length === b.length && a.every((v, idx) => v === b[idx]);
    const next: KpiSparklines = {
      incomeSeries: last && same(last.incomeSeries, i) ? last.incomeSeries : i,
      costsSeries: last && same(last.costsSeries, c) ? last.costsSeries : c,
      netSeries: last && same(last.netSeries, n) ? last.netSeries : n,
      prevMonth,
    };
    try { (useKpiSparklines as any)._last = next; } catch {}
    return next;
  }, [monthlySeries, snapshot.asOf]);
}
