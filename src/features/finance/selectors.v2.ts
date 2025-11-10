import type { FinanceShow, FinanceSnapshot } from './types';
import { regionOfCountry } from '../../lib/geo';

export type BreakdownKey = 'route' | 'venue' | 'promoter' | 'country' | 'region' | 'agency';
export type V2BreakdownEntry = { key: string; income: number; expenses: number; net: number; count: number };
export type V2Breakdowns = Record<BreakdownKey, V2BreakdownEntry[]>;

function bucket<K extends string>(shows: FinanceShow[], getKey: (s: FinanceShow) => K): Record<K, V2BreakdownEntry> {
  const m = new Map<K, V2BreakdownEntry>();
  for (const sh of shows) {
    if (sh.status === 'offer' || sh.status === 'canceled' || sh.status === 'archived') continue;
    const k = getKey(sh);
    const cur = m.get(k) || { key: k, income: 0, expenses: 0, net: 0, count: 0 } as V2BreakdownEntry;
    cur.income += sh.fee;
    const cost = typeof (sh as any).cost === 'number' ? (sh as any).cost : 0;
    cur.expenses += cost;
    cur.net += (sh.fee - cost);
    cur.count += 1;
    m.set(k, cur);
  }
  return Object.fromEntries(m.entries()) as Record<K, V2BreakdownEntry>;
}

export function selectBreakdownsV2(s: FinanceSnapshot): V2Breakdowns {
  const byRoute = Object.values(bucket(s.shows, sh => (sh.route || '—') as string));
  const byVenue = Object.values(bucket(s.shows, sh => (sh.venue || '—') as string));
  const byPromoter = Object.values(bucket(s.shows, sh => (sh.promoter || '—') as string));
  const byCountry = Object.values(bucket(s.shows, sh => (sh.country || '—') as string));
  const byRegion = Object.values(bucket(s.shows, sh => (regionOfCountry(sh.country) || '—') as string));
  // Placeholder for agency; data model may carry booking/management agency fields in future
  const byAgency = [] as V2BreakdownEntry[];
  const sort = (arr: V2BreakdownEntry[]) => arr.sort((a, b) => b.net - a.net);
  return {
    route: sort(byRoute),
    venue: sort(byVenue),
    promoter: sort(byPromoter),
    country: sort(byCountry),
    region: sort(byRegion),
    agency: byAgency
  } as V2Breakdowns;
}

export type ExpectedPipeline = {
  total: number;
  stages: { p100: number; p60: number; p30: number };
};

export function selectExpectedPipelineV2(s: FinanceSnapshot): ExpectedPipeline {
  let p100 = 0, p60 = 0, p30 = 0;
  for (const sh of s.shows) {
    const cost = typeof (sh as any).cost === 'number' ? (sh as any).cost : 0;
    const net = sh.fee - cost;
    if (sh.status === 'confirmed') p100 += net;
    else if (sh.status === 'pending') p60 += net * 0.6;
    else if (sh.status === 'offer') p30 += net * 0.3;
  }
  const total = Math.round(p100 + p60 + p30);
  return { total, stages: { p100: Math.round(p100), p60: Math.round(p60), p30: Math.round(p30) } };
}

export type AgingBuckets = { bucket: string; amount: number }[];

export function selectARAgingV2(s: FinanceSnapshot): AgingBuckets {
  // Simple proxy: assume confirmed shows are receivables; age by how many days since show date
  const buckets: Record<string, number> = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
  const now = new Date(s.asOf || Date.now()).getTime();
  for (const sh of s.shows) {
    if (sh.status !== 'confirmed') continue;
    const cost = typeof (sh as any).cost === 'number' ? (sh as any).cost : 0;
    const net = Math.max(0, sh.fee - cost);
    const days = Math.floor((now - new Date(sh.date).getTime()) / (24 * 60 * 60 * 1000));
    let k: keyof typeof buckets = '0-30';
    if (days <= 30) k = '0-30';
    else if (days <= 60) k = '31-60';
    else if (days <= 90) k = '61-90';
    else k = '90+' as any;
    const bucket = buckets[k];
    if (bucket !== undefined) buckets[k] = bucket + net;
  }
  return Object.entries(buckets).map(([bucket, amount]) => ({ bucket, amount: Math.round(amount) }));
}
