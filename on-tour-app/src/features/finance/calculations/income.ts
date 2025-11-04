/**
 * Income Calculations Module
 * REFINE-003: Extract income-specific functions from FinanceCalc namespace
 *
 * Handles gross income and run rate calculations
 */

/**
 * Calculate gross income in base currency
 *
 * @example
 * const gross = calculateGrossIncome(10000, 1.0);
 * // returns 10000 (in base EUR)
 */
export function calculateGrossIncome(
  fee: number,
  fxRate: number
): number {
  if (fee < 0 || fxRate <= 0) {
    throw new Error('Invalid fee or fxRate');
  }
  return fee * fxRate;
}

/**
 * Round number to 2 decimal places (currency)
 *
 * @example
 * const rounded = roundCurrency(1234.567);
 * // returns 1234.57
 */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Calculate monthly run rate based on current performance
 *
 * @example
 * // Day 15: earned 5000, what's the monthly projection?
 * const monthlyRate = calculateMonthlyRunRate(5000, 15);
 * // returns 10000
 */
export function calculateMonthlyRunRate(
  currentMonthIncome: number,
  dayOfMonth: number
): number {
  if (dayOfMonth < 1 || dayOfMonth > 31) {
    throw new Error('Day of month must be 1-31');
  }
  if (currentMonthIncome < 0) throw new Error('Income cannot be negative');

  return roundCurrency((currentMonthIncome / dayOfMonth) * 30);
}
