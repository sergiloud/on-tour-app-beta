/**
 * Costs Calculations Module
 * REFINE-003: Extract cost-specific functions from FinanceCalc namespace
 *
 * Handles cost aggregation and net income calculations
 */

export type Cost = {
  id: string;
  type: string;      // Category: Sound, Light, Transport, etc.
  amount: number;    // Cost in base currency
  desc?: string;
};

/**
 * Calculate total costs from cost array
 *
 * @example
 * const costs = [
 *   { id: '1', type: 'Sound', amount: 500 },
 *   { id: '2', type: 'Light', amount: 300 }
 * ];
 * const total = calculateTotalCosts(costs);
 * // returns 800
 */
export function calculateTotalCosts(costs: Cost[]): number {
  return costs.reduce((sum, c) => {
    if (c.amount < 0) throw new Error(`Invalid cost amount: ${c.amount}`);
    return sum + c.amount;
  }, 0);
}

/**
 * Calculate net income after all deductions
 *
 * Net = Fee - Commissions - WHT - Costs
 *
 * @example
 * const net = calculateNet({
 *   grossFee: 10000,
 *   commissions: { management: 1000, booking: 800 },
 *   wht: 1500,
 *   totalCosts: 1000
 * });
 * // returns 5700
 */
export function calculateNet(params: {
  grossFee: number;
  commissions: { management: number; booking: number };
  wht: number;
  totalCosts: number;
}): number {
  const { grossFee, commissions, wht, totalCosts } = params;

  if (grossFee < 0) throw new Error('Gross fee cannot be negative');
  if (wht < 0) throw new Error('WHT cannot be negative');
  if (totalCosts < 0) throw new Error('Total costs cannot be negative');

  return (
    grossFee -
    commissions.management -
    commissions.booking -
    wht -
    totalCosts
  );
}
