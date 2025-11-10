import { describe, it, expect } from 'vitest';
import { buildFinanceSnapshot } from '../features/finance/snapshot';
import { selectStatusBreakdown } from '../features/finance/selectors';

describe('Finance status breakdown', () => {
  it('sums counts and totals per status', () => {
    const snap = buildFinanceSnapshot(new Date());
    const b = selectStatusBreakdown(snap);
    const totalCount = b.confirmed.count + b.pending.count + b.offer.count;
    expect(totalCount).toBe(snap.shows.length);
    const totalSum = b.confirmed.total + b.pending.total + b.offer.total;
    const rawSum = snap.shows.reduce((acc, s) => acc + s.fee, 0);
    expect(Math.round(totalSum)).toBe(Math.round(rawSum));
  });
});
