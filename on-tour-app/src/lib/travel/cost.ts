import type { Cost, Trip } from '../../services/trips';

export type FXRateMap = Record<string, number>; // e.g., { USD: 1.06, GBP: 0.86 } vs EUR base

export function toCurrency(amount: number, from: string, to: string, rates: FXRateMap): number {
  if (!amount || from === to) return amount || 0;
  const base = 1; // assume EUR base when rates are expressed relative to EUR
  // If rates defined as 1 EUR = rates[USD], to convert X USD -> EUR: X / rates[USD]
  // Then EUR -> target: * rates[target]
  const fromRate = rates[from] || 1;
  const toRate = rates[to] || 1;
  const eur = amount / fromRate;
  return eur * toRate;
}

export function sumTripCosts(trip: Trip, currency: string, rates: FXRateMap): { total: number; byCategory: Record<string, number> } {
  const byCategory: Record<string, number> = {};
  const costs = trip.costs || [];
  let total = 0;
  for (const c of costs) {
    const cur = c.currency || currency as any;
    const val = toCurrency(c.amount || 0, cur, currency, rates);
    total += val;
    byCategory[c.category] = (byCategory[c.category] || 0) + val;
  }
  return { total: Math.round(total), byCategory: Object.fromEntries(Object.entries(byCategory).map(([k,v])=>[k, Math.round(v)])) };
}
