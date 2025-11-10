/**
 * Commissions Calculations Module
 * REFINE-003: Extract commission-specific functions from FinanceCalc namespace
 *
 * Handles management and booking commission calculations
 */

/**
 * Calculate total commissions from fee
 *
 * @example
 * const commissions = calculateCommissions(10000, 10, 8);
 * // returns { management: 1000, booking: 800 }
 */
export function calculateCommissions(
  fee: number,
  mgmtPct: number,
  bookingPct: number
): { management: number; booking: number } {
  if (mgmtPct < 0 || mgmtPct > 100 || bookingPct < 0 || bookingPct > 100) {
    throw new Error('Commission percentages must be 0-100');
  }
  return {
    management: fee * (mgmtPct / 100),
    booking: fee * (bookingPct / 100)
  };
}
