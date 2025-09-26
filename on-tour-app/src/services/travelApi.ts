export type Itinerary = { id: string; date: string; title: string; team: 'A'|'B'; city?: string; status?: string };
export type ItineraryFilters = { from?: string; to?: string; team?: 'all'|'A'|'B' };

type FetchOptions = { signal?: AbortSignal; ttlMs?: number };

// Simple in-memory cache keyed by filter range+team
const cache = new Map<string, { stamp: number; data: Itinerary[] }>();
const defaultTTL = 5 * 60 * 1000; // 5 minutes
function keyOf({ from = '', to = '', team = 'all' }: ItineraryFilters) {
  return `${from}|${to}|${team}`;
}

// In this prototype, itineraries are user/persisted data, not derived from shows.
// We keep them in localStorage under the key "travel:itineraries".
export async function fetchItineraries(filters: ItineraryFilters = {}): Promise<Itinerary[]> {
  const { from, to, team = 'all' } = filters;
  const fromTs = from ? new Date(from).getTime() : -Infinity;
  const toTs = to ? new Date(to + 'T23:59:59.999Z').getTime() : Infinity;
  let all: Itinerary[] = [];
  try {
    const raw = localStorage.getItem('travel:itineraries');
    all = raw ? JSON.parse(raw) as Itinerary[] : [];
  } catch {
    all = [];
  }
  const list = all
    .filter(it => {
      const t = new Date(it.date).getTime();
      return t >= fromTs && t <= toTs;
    })
    .filter(it => team === 'all' || it.team === team)
    .sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
  return list;
}

// Cached + abortable variant. Returns data with cache awareness; respects AbortSignal.
export async function fetchItinerariesCached(filters: ItineraryFilters = {}, opts: FetchOptions = {}): Promise<{ data: Itinerary[]; fromCache: boolean }>{
  const key = keyOf(filters);
  const now = Date.now();
  const ttl = typeof opts.ttlMs === 'number' ? Math.max(0, opts.ttlMs) : defaultTTL;
  const cached = cache.get(key);
  if (cached && (now - cached.stamp) < ttl) {
    return { data: cached.data, fromCache: true };
  }
  // Respect abort even if work is sync/fast
  if (opts.signal?.aborted) {
    // Mirror fetch semantics
    const err = new DOMException('Aborted', 'AbortError');
    throw err;
  }
  // Perform fresh read + filter
  const data = await fetchItineraries(filters);
  if (opts.signal?.aborted) {
    const err = new DOMException('Aborted', 'AbortError');
    throw err;
  }
  cache.set(key, { stamp: now, data });
  return { data, fromCache: false };
}

export function clearItinerariesCache() {
  cache.clear();
}

// Gentle refresh/events: notify listeners when itineraries update for a given key
type ItinerariesEvent = { type: 'updated'; key: string; data: Itinerary[] };
const _subs = new Set<(e: ItinerariesEvent) => void>();
export function onItinerariesUpdated(cb: (e: ItinerariesEvent) => void) {
  _subs.add(cb);
  return () => { _subs.delete(cb); };
}
function _emitUpdated(key: string, data: Itinerary[]) {
  _subs.forEach(cb => {
    try { cb({ type: 'updated', key, data }); } catch {}
  });
}

// Returns cached data immediately when valid; if served from cache or offline, schedule a gentle refresh
export async function fetchItinerariesGentle(filters: ItineraryFilters = {}, opts: FetchOptions = {}) {
  const key = keyOf(filters);
  const res = await fetchItinerariesCached(filters, opts).catch((err) => { throw err; });
  // If we served from cache, try a background refresh when possible
  const doRefresh = async () => {
    try {
      const fresh = await fetchItineraries(filters);
      cache.set(key, { stamp: Date.now(), data: fresh });
      _emitUpdated(key, fresh);
    } catch {}
  };
  const offline = typeof navigator !== 'undefined' && (navigator as any).onLine === false;
  if (res.fromCache || offline) {
    if (offline && typeof window !== 'undefined') {
      const onceOnline = () => {
        window.removeEventListener('online', onceOnline);
        // Run soon after coming online
        setTimeout(() => { doRefresh(); }, 250);
      };
      window.addEventListener('online', onceOnline, { once: true });
    } else {
      // Next tick refresh attempt
      setTimeout(() => { doRefresh(); }, 0);
    }
  }
  return res;
}
