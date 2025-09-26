import { describe, it, expect } from 'vitest';
import { selectMonthlySeries, selectNetSeries, selectThisMonth } from '../features/finance/selectors';
import type { FinanceSnapshot } from '../features/finance/types';

const makeSnap = (asOf: string, dates: Array<{ date: string; fee: number; status: 'confirmed'|'pending'|'offer' }>): FinanceSnapshot => ({
  asOf,
  shows: dates.map((d,i)=> ({ id: String(i), date: d.date, fee: d.fee, status: d.status } as any)),
  month: { start: '', end: '', income: 0, expenses: 0, net: 0 },
  year: { income: 0, expenses: 0, net: 0 },
  pending: 0,
});

describe('selectors period awareness', () => {
  it('aggregates across months present in filtered snapshot', () => {
    const s = makeSnap('2025-12-31T00:00:00Z', [
      { date: '2024-11-10', fee: 100, status: 'confirmed' },
      { date: '2025-01-15', fee: 200, status: 'confirmed' },
      { date: '2025-02-20', fee: 300, status: 'confirmed' },
    ]);
    const ms = selectMonthlySeries(s);
    expect(ms.months).toEqual(['2024-11','2025-01','2025-02']);
    const ns = selectNetSeries(s);
    expect(ns.map(p=>p.month)).toEqual(['2024-11','2025-01','2025-02']);
  });

  it('thisMonth aligns to snapshot asOf month', () => {
    const s = makeSnap('2025-02-28T00:00:00Z', [
      { date: '2025-01-15', fee: 200, status: 'confirmed' },
      { date: '2025-02-20', fee: 300, status: 'confirmed' },
    ]);
    const tm = selectThisMonth(s);
    expect(tm.monthKey).toBe('2025-02');
  });
});
