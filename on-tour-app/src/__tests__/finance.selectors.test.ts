import { describe, it, expect } from 'vitest';
import { buildFinanceSnapshot } from '../features/finance/snapshot';
import { selectKpis, selectNetSeries } from '../features/finance/selectors';

describe('Finance snapshot & selectors', () => {
  it('computes non-negative month net and pending', () => {
    const snap = buildFinanceSnapshot(new Date());
    const k = selectKpis(snap);
    expect(k.pending).toBeGreaterThanOrEqual(0);
    expect(k.incomeMonth).toBeGreaterThanOrEqual(0);
    expect(k.costsMonth).toBeGreaterThanOrEqual(0);
    expect(k.netMonth).toBeCloseTo(k.incomeMonth - k.costsMonth, 0);
  });

  it('produces a net series for current year', () => {
    const snap = buildFinanceSnapshot(new Date());
    const series = selectNetSeries(snap);
    expect(Array.isArray(series)).toBe(true);
    // months formatted as YYYY-MM
    for (const p of series) {
      expect(p.month).toMatch(/^\d{4}-\d{2}$/);
      expect(typeof p.net).toBe('number');
    }
  });
});
