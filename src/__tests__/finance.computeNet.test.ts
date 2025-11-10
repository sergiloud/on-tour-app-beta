import { describe, it, expect } from 'vitest';
import { computeNet, breakdownNet } from '../lib/computeNet';

describe('computeNet', () => {
  it('returns full fee when no deductions', () => {
    expect(computeNet({ fee: 1000 })).toBe(1000);
  });

  it('applies withholding tax percentage', () => {
    // 10% WHT on 1000 => 100 deducted
    expect(computeNet({ fee: 1000, whtPct: 10 })).toBe(900);
  });

  it('applies management + booking commissions', () => {
    // mgmt 5% + booking 10% => 15% of 1000 = 150
    expect(computeNet({ fee: 1000, mgmtPct: 5, bookingPct: 10 })).toBe(850);
  });

  it('subtracts costs aggregation', () => {
    expect(computeNet({ fee: 1000, costs: [{ amount: 100 }, { amount: 50 }] })).toBe(850);
  });

  it('combines all deductions', () => {
    // fee 2000, wht 5% => 100, commissions 5%+5%=10% => 200, costs 300 => net 1400
    expect(computeNet({ fee: 2000, whtPct: 5, mgmtPct: 5, bookingPct: 5, costs: [{ amount: 200 }, { amount: 100 }] })).toBe(1400);
  });

  it('handles undefined and zero gracefully', () => {
    expect(computeNet({})).toBe(0);
    expect(computeNet({ fee: 0, whtPct: 50, costs: [{ amount: 999 }]})).toBe(-999);
  });
});

describe('breakdownNet', () => {
  it('returns detailed components consistent with computeNet', () => {
    const inputs = { fee: 1500, whtPct: 8, mgmtPct: 4, bookingPct: 6, costs: [{ amount: 120 }, { amount: 30 }] };
    const b = breakdownNet(inputs);
    const recomputed = computeNet(inputs);
    expect(b.net).toBeCloseTo(recomputed, 6);
    expect(b.wht).toBeCloseTo(1500 * 0.08, 6);
    expect(b.mgmt).toBeCloseTo(1500 * 0.04, 6);
    expect(b.booking).toBeCloseTo(1500 * 0.06, 6);
    expect(b.commissions).toBeCloseTo(b.mgmt + b.booking, 6);
    expect(b.totalCosts).toBe(150);
  });

  it('defaults to zeros when no inputs', () => {
    const b = breakdownNet({});
    expect(b).toEqual({ fee: 0, wht: 0, mgmt: 0, booking: 0, commissions: 0, totalCosts: 0, net: 0 });
  });
});
