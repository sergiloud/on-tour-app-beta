/**
 * Financial Analysis Module
 * REFINE-003: Extract analysis functions from FinanceCalc namespace
 *
 * Handles settlement, conflict resolution, currency conversion, statistics, and aggregations
 */

import { roundCurrency } from './income';

/**
 * Settlement distribution: split net income among parties
 *
 * @example
 * const settlement = settleShow({
 *   net: 5700,
 *   fee: 10000,
 *   artistShare: 0.70,
 *   mgmtShareOfFee: 0.15,
 *   bookingShareOfFee: 0.10
 * });
 * // returns { artist: 3990, management: 1500, booking: 1000 }
 */
export function settleShow(params: {
  net: number;
  fee: number;
  artistShare: number;      // % of net (e.g., 0.70)
  mgmtShareOfFee: number;   // % of fee
  bookingShareOfFee: number; // % of fee
}): { artist: number; management: number; booking: number } {
  const { net, fee, artistShare, mgmtShareOfFee, bookingShareOfFee } = params;

  if (artistShare < 0 || artistShare > 1) {
    throw new Error('Artist share must be 0-1');
  }
  if (mgmtShareOfFee < 0 || mgmtShareOfFee > 1) {
    throw new Error('Management share must be 0-1');
  }
  if (bookingShareOfFee < 0 || bookingShareOfFee > 1) {
    throw new Error('Booking share must be 0-1');
  }

  return {
    artist: net * artistShare,
    management: fee * mgmtShareOfFee,
    booking: fee * bookingShareOfFee
  };
}

/**
 * Detect if two show versions conflict
 * Conflict = different versions AND different modification times
 *
 * @example
 * const hasConflict = detectConflict(localShow, remoteShow);
 */
export function detectConflict(
  local: { __version: number; __modifiedAt: number },
  remote: { __version: number; __modifiedAt: number }
): boolean {
  return (
    local.__version !== remote.__version &&
    local.__modifiedAt !== remote.__modifiedAt
  );
}

/**
 * Resolve conflict between two versions using last-write-wins strategy
 *
 * @example
 * const resolved = resolveConflict(localShow, remoteShow);
 */
export function resolveConflict<T extends { __modifiedAt: number }>(
  local: T,
  remote: T
): T {
  // More recent timestamp wins
  if (local.__modifiedAt > remote.__modifiedAt) {
    return local;
  } else {
    return remote;
  }
}

/**
 * Format currency for display
 *
 * @example
 * const formatted = formatCurrency(1234.56, 'EUR');
 * // returns "€1,234.56"
 */
export function formatCurrency(amount: number, currency: string = 'EUR'): string {
  const rounded = roundCurrency(amount);
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  });
  return formatter.format(rounded);
}

/**
 * Convert amount from one currency to another using exchange rates
 *
 * @param amount Amount to convert
 * @param fromRate Exchange rate of source currency to base
 * @param toRate Exchange rate of target currency to base
 * @returns Converted amount
 *
 * @example
 * // Convert 12000 USD to EUR (USD 0.92, EUR 1.0)
 * const eur = convertCurrency(12000, 0.92, 1.0);
 * // returns 13043.48
 */
export function convertCurrency(
  amount: number,
  fromRate: number,
  toRate: number
): number {
  if (fromRate <= 0) throw new Error('Source exchange rate must be positive');
  if (toRate <= 0) throw new Error('Target exchange rate must be positive');

  return roundCurrency((amount * toRate) / fromRate);
}

/**
 * Calculate margin percentage
 *
 * @example
 * // Revenue 10000, Costs 3000 = 70% margin
 * const margin = calculateMarginPct(10000, 3000);
 * // returns 70
 */
export function calculateMarginPct(revenue: number, costs: number): number {
  if (revenue < 0) throw new Error('Revenue cannot be negative');
  if (costs < 0) throw new Error('Costs cannot be negative');
  if (revenue === 0) return 0;

  return roundCurrency(((revenue - costs) / revenue) * 100);
}

/**
 * Calculate breakeven point
 *
 * @example
 * // Fixed: 1000, Variable: 5 per unit, Price: 10 per unit
 * // Breakeven = 1000 / (10 - 5) = 200 units
 * const breakeven = calculateBreakeven(1000, 5, 10);
 * // returns 200
 */
export function calculateBreakeven(
  fixedCosts: number,
  variableCostPerUnit: number,
  unitPrice: number
): number {
  if (fixedCosts < 0) throw new Error('Fixed costs cannot be negative');
  if (variableCostPerUnit < 0) throw new Error('Variable cost cannot be negative');
  if (unitPrice <= variableCostPerUnit) {
    throw new Error('Unit price must exceed variable cost');
  }

  return Math.ceil(fixedCosts / (unitPrice - variableCostPerUnit));
}

/**
 * Aggregate financial data by country
 *
 * @example
 * const shows = [
 *   { country: 'ES', net: 5000 },
 *   { country: 'ES', net: 3000 },
 *   { country: 'FR', net: 4500 }
 * ];
 * const breakdown = aggregateByCountry(shows);
 * // returns { ES: 8000, FR: 4500 }
 */
export function aggregateByCountry(
  shows: Array<{ country: string; net: number }>
): Record<string, number> {
  const breakdown: Record<string, number> = {};

  for (const show of shows) {
    if (show.net < 0) continue; // Exclude losses

    if (!breakdown[show.country]) {
      breakdown[show.country] = 0;
    }
    breakdown[show.country] = roundCurrency((breakdown[show.country] ?? 0) + show.net);
  }

  return breakdown;
}

/**
 * Aggregate financial data by route
 *
 * @example
 * const shows = [
 *   { route: 'Europe2025', net: 5000 },
 *   { route: 'US2025', net: 4500 }
 * ];
 * const breakdown = aggregateByRoute(shows);
 * // returns { Europe2025: 5000, US2025: 4500 }
 */
export function aggregateByRoute(
  shows: Array<{ route: string; net: number }>
): Record<string, number> {
  const breakdown: Record<string, number> = {};

  for (const show of shows) {
    if (show.net < 0) continue;

    if (!breakdown[show.route]) {
      breakdown[show.route] = 0;
    }
    breakdown[show.route] = roundCurrency((breakdown[show.route] ?? 0) + show.net);
  }

  return breakdown;
}

/**
 * Aggregate financial data by venue
 *
 * @example
 * const shows = [
 *   { venue: 'Palacio Real', net: 5000 },
 *   { venue: 'Gran Via Theatre', net: 4500 }
 * ];
 * const breakdown = aggregateByVenue(shows);
 * // returns { 'Palacio Real': 5000, 'Gran Via Theatre': 4500 }
 */
export function aggregateByVenue(
  shows: Array<{ venue: string; net: number }>
): Record<string, number> {
  const breakdown: Record<string, number> = {};

  for (const show of shows) {
    if (show.net < 0) continue;

    if (!breakdown[show.venue]) {
      breakdown[show.venue] = 0;
    }
    breakdown[show.venue] = roundCurrency((breakdown[show.venue] ?? 0) + show.net);
  }

  return breakdown;
}

/**
 * Calculate summary statistics for a dataset
 *
 * @example
 * const amounts = [1000, 2000, 3000, 4000, 5000];
 * const stats = calculateStatistics(amounts);
 * // returns { total: 15000, average: 3000, min: 1000, max: 5000, count: 5, stdDev: 1414.21 }
 */
export function calculateStatistics(amounts: number[]): {
  total: number;
  average: number;
  min: number;
  max: number;
  count: number;
  stdDev: number;
} {
  if (amounts.length === 0) {
    throw new Error('Must provide at least one amount');
  }

  const total = amounts.reduce((sum, a) => sum + a, 0);
  const average = total / amounts.length;
  const min = Math.min(...amounts);
  const max = Math.max(...amounts);
  const count = amounts.length;

  // Standard deviation
  const variance = amounts.reduce((sum, a) => sum + Math.pow(a - average, 2), 0) / count;
  const stdDev = Math.sqrt(variance);

  return {
    total: roundCurrency(total),
    average: roundCurrency(average),
    min,
    max,
    count,
    stdDev: roundCurrency(stdDev),
  };
}

/**
 * Calculate variance (change) between two periods
 *
 * @example
 * // Current month: 15000, Previous month: 10000
 * const variance = calculateVariance(15000, 10000);
 * // returns { absolute: 5000, percentage: 50, trend: 'up' }
 */
export function calculateVariance(
  current: number,
  previous: number
): {
  absolute: number;
  percentage: number;
  trend: 'up' | 'down' | 'neutral';
} {
  const absolute = current - previous;
  const percentage = previous === 0 ? 0 : (absolute / previous) * 100;

  let trend: 'up' | 'down' | 'neutral' = 'neutral';
  if (Math.abs(percentage) < 0.01) {
    trend = 'neutral';
  } else if (absolute > 0) {
    trend = 'up';
  } else if (absolute < 0) {
    trend = 'down';
  }

  return {
    absolute: roundCurrency(absolute),
    percentage: roundCurrency(percentage),
    trend,
  };
}

/**
 * Validate financial data completeness
 *
 * @example
 * const result = validateShowFinancialData({
 *   fee: 10000,
 *   whtPct: 15,
 *   mgmtAgencyPct: 10
 * });
 * // returns { isValid: false, missingFields: ['fxRate', 'bookingAgencyPct'] }
 */
export function validateShowFinancialData(show: Partial<{
  fee: number;
  feeCurrency: string;
  whtPct: number;
  mgmtAgencyPct: number;
  bookingAgencyPct: number;
  costs: Array<{ id: string; type: string; amount: number; desc?: string }>;
  fxRate: number;
}>): {
  isValid: boolean;
  missingFields: string[];
} {
  const required = ['fee', 'feeCurrency', 'whtPct', 'mgmtAgencyPct', 'bookingAgencyPct', 'fxRate'];
  const missingFields = required.filter(field => !(field in show));

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}
