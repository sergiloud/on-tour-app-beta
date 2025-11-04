/**
 * Tax Calculations Module
 * REFINE-003: Extract tax-specific functions from FinanceCalc namespace
 *
 * Handles withholding tax (WHT) calculations
 */

/**
 * Calculate withholding tax (WHT) on amount
 *
 * @param amount - Base amount (fee or net depending on applicationPoint)
 * @param whtPct - WHT percentage (e.g., 15 for 15%)
 * @param applicationPoint - Whether WHT is on 'gross' fee or 'net' (after commissions)
 *
 * @example
 * // WHT on gross
 * const wht = calculateWHT(10000, 15, 'gross');
 * // returns 1500
 *
 * // WHT on net
 * const net = 8200; // After commissions
 * const whtOnNet = calculateWHT(net, 15, 'net');
 * // returns 1230
 */
export function calculateWHT(
  amount: number,
  whtPct: number,
  applicationPoint: 'gross' | 'net' = 'gross'
): number {
  if (whtPct < 0 || whtPct > 100) {
    throw new Error('WHT percentage must be 0-100');
  }
  if (amount < 0) {
    throw new Error('Amount cannot be negative');
  }
  return amount * (whtPct / 100);
}
