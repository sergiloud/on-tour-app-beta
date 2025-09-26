// Lightweight static FX rates approximator.
// For the demo we keep a coarse monthly table (YYYY-MM) mapping to rates vs EUR (base).
// In a real app this would come from a service + persisted snapshot on show confirmation.

const MONTHLY_RATES: Record<string, { [ccy: string]: number }> = {
  // 2025 approximate demo values
  '2025-01': { USD: 1.09, GBP: 0.86, AUD: 1.63 },
  '2025-02': { USD: 1.08, GBP: 0.85, AUD: 1.62 },
  '2025-03': { USD: 1.07, GBP: 0.86, AUD: 1.61 },
  '2025-04': { USD: 1.07, GBP: 0.85, AUD: 1.60 },
  '2025-05': { USD: 1.08, GBP: 0.84, AUD: 1.59 },
  '2025-06': { USD: 1.07, GBP: 0.84, AUD: 1.58 },
  '2025-07': { USD: 1.06, GBP: 0.83, AUD: 1.58 },
  '2025-08': { USD: 1.07, GBP: 0.84, AUD: 1.59 },
  '2025-09': { USD: 1.08, GBP: 0.85, AUD: 1.60 },
};

export type SupportedCurrency = 'EUR'|'USD'|'GBP'|'AUD';

// Return rate to convert FROM given ccy TO base (EUR). If base requested, 1.
export function getRateToEUR(isoDate: string|undefined|null, ccy: SupportedCurrency): number|undefined {
  if(ccy==='EUR') return 1;
  if(!isoDate) return undefined;
  const y = isoDate.slice(0,4); const m = isoDate.slice(5,7);
  const key = `${y}-${m}`;
  const row = MONTHLY_RATES[key];
  if(!row) return undefined;
  return row[ccy];
}

export function convertToBase(amount: number, isoDate: string|undefined|null, from: SupportedCurrency, base: SupportedCurrency): { value: number; rate: number }|undefined {
  if(isNaN(amount)) return undefined;
  if(from === base) return { value: amount, rate: 1 };
  // Only EUR is base in our static table; if base != EUR we convert via EUR.
  const viaEURRate = getRateToEUR(isoDate, from);
  if(!viaEURRate) return undefined;
  if(base === 'EUR') return { value: amount / viaEURRate, rate: viaEURRate };
  // Convert from source -> EUR -> base: amount -> eurValue -> baseValue
  const eurVal = amount / viaEURRate;
  const baseViaEURRate = getRateToEUR(isoDate, base);
  if(!baseViaEURRate) return undefined;
  // baseViaEURRate = BASE per 1 EUR. So eurVal * baseViaEURRate
  const baseValue = eurVal * baseViaEURRate;
  const effectiveRate = baseValue / amount; // overall multiplier from from->base
  return { value: baseValue, rate: effectiveRate };
}
