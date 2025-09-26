import type { FlightResult, FlightSearchParams, SearchResult } from './types';
import { mockSearch } from './mock';
import { googleProvider } from './google';
import { buildDeepLinkFromSearchParams } from './util';
import { loadJSON } from '../../../lib/persist';

type CacheEntry = { ts: number; data: SearchResult };
const CACHE = new Map<string, CacheEntry>();
const INFLIGHT = new Map<string, AbortController>();

const TTL_MS = 5 * 60 * 1000; // 5 minutes

function key(p: FlightSearchParams) {
  return `${p.origin}|${p.dest}|${p.date}|${p.retDate||''}|${p.adults||1}|${p.bags||0}|${p.cabin||'E'}|${p.nonstop?'1':'0'}`;
}

export async function searchFlights(p: FlightSearchParams, opts?: { signal?: AbortSignal }): Promise<SearchResult>{
  const k = key(p);
  const now = Date.now();
  const cached = CACHE.get(k);
  if (cached && now - cached.ts < TTL_MS) {
    return cached.data;
  }

  // Abort any in-flight for same key
  const prev = INFLIGHT.get(k);
  if (prev) { try { prev.abort(); } catch {} }
  const ac = new AbortController();
  INFLIGHT.set(k, ac);
  if (opts?.signal) {
    opts.signal.addEventListener('abort', () => ac.abort(), { once: true });
  }

  try {
    // Provider selection: if real provider configured (future), use it; otherwise default to mock for in-app results.
  // Determine provider from local persisted setting first, then env
  const localProvider = loadJSON('travel.provider', undefined) as string | undefined;
  const provider = localProvider || ((import.meta as any).env?.VITE_TRAVEL_PROVIDER as string | undefined);
    if (!provider || provider === 'mock') {
      const results = await mockSearch(p, { signal: ac.signal });
      const link = buildDeepLinkFromSearchParams(p);
      const data: SearchResult = { results, deepLink: link, provider: 'mock' };
      CACHE.set(k, { ts: now, data });
      return data;
    }
    // Fallback: deep-link only
    const { deepLink } = await googleProvider(p);
    const data: SearchResult = { results: [], deepLink, provider: 'google' };
    CACHE.set(k, { ts: now, data });
    return data;
  } catch (err) {
    // On error give deep-link as last resort
    const link = buildDeepLinkFromSearchParams(p);
    const data: SearchResult = { results: [] as FlightResult[], deepLink: link, provider: 'google' };
    CACHE.set(k, { ts: now, data });
    return data;
  } finally {
    INFLIGHT.delete(k);
  }
}
