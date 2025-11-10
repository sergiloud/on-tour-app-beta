import type { FlightResult } from '../../travel/providers/types';

// Estimate CO2 in kg using a simple distance approximation if no distance available:
// duration (h) * 750 km/h * 0.115 kg/km per passenger (very rough; tooltip must say est.)
export function estimateCO2kg(r: FlightResult): number {
  const hours = Math.max(0, (r.durationM || 0) / 60);
  const km = hours * 750;
  const kg = km * 0.115;
  return Math.round(kg);
}

export function pricePerHour(r: FlightResult): number | null {
  const hours = (r.durationM || 0) / 60;
  if (!r.price || hours <= 0) return null;
  return r.price / hours;
}

export function isRedEye(r: FlightResult): boolean {
  // Rough heuristic: dep after 21:00 local or arr before 06:00 local
  try {
    const dep = new Date(r.dep); const arr = new Date(r.arr);
    const depH = dep.getHours(); const arrH = arr.getHours();
    return depH >= 21 || arrH < 6;
  } catch { return false; }
}

export type CompareBadge = 'bestPrice' | 'bestTime' | 'bestBalance';

export function computeBestBadges(list: FlightResult[]): Record<string, CompareBadge[]> {
  const badges: Record<string, CompareBadge[]> = {};
  if (!list.length) return badges;
  const byPrice = [...list].filter(x=>x.price>0).sort((a,b)=> a.price - b.price)[0];
  const byTime = [...list].sort((a,b)=> a.durationM - b.durationM)[0];
  // balance = normalized price + normalized duration
  const minP = Math.min(...list.map(x=>x.price||Infinity));
  const maxP = Math.max(...list.map(x=>x.price||0));
  const minT = Math.min(...list.map(x=>x.durationM||Infinity));
  const maxT = Math.max(...list.map(x=>x.durationM||0));
  let bestBalance: FlightResult | undefined;
  let bestScore = Infinity;
  for (const r of list) {
    const pN = (r.price - minP) / Math.max(1, (maxP - minP));
    const tN = (r.durationM - minT) / Math.max(1, (maxT - minT));
    const s = pN + tN;
    if (s < bestScore) { bestScore = s; bestBalance = r; }
  }
  if (byPrice) badges[byPrice.id] = [...(badges[byPrice.id]||[]), 'bestPrice'];
  if (byTime) badges[byTime.id] = [...(badges[byTime.id]||[]), 'bestTime'];
  if (bestBalance) badges[bestBalance.id] = [...(badges[bestBalance.id]||[]), 'bestBalance'];
  return badges;
}
