import { describe, it, expect } from 'vitest';
import { monthKeyFromDate, rangeForPreset, setMonthClosed, isMonthClosed } from '../features/finance/period';

describe('finance period utils', () => {
  it('monthKeyFromDate builds YYYY-MM', () => {
    expect(monthKeyFromDate(new Date('2025-09-22'))).toBe('2025-09');
  });

  it('rangeForPreset MTD', () => {
    const r = rangeForPreset('MTD', new Date('2025-09-22'));
    expect(r.from).toBe('2025-09-01');
    expect(r.to).toBe('2025-09-22');
  });

  it('rangeForPreset LAST_MONTH', () => {
    const r = rangeForPreset('LAST_MONTH', new Date('2025-09-22'));
    expect(r.from).toBe('2025-08-01');
    expect(r.to).toBe('2025-08-31');
  });

  it('closed month persistence', () => {
    const key = '2025-09';
    setMonthClosed(key, false);
    expect(isMonthClosed(key)).toBe(false);
    setMonthClosed(key, true);
    expect(isMonthClosed(key)).toBe(true);
    setMonthClosed(key, false);
    expect(isMonthClosed(key)).toBe(false);
  });
});
