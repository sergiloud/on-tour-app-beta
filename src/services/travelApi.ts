export type Itinerary = {
  id: string;
  date: string;
  title: string;
  team: 'A'|'B';
  city?: string;
  status?: string;
  description?: string; // Event description/notes
  location?: string; // Event location/venue
  buttonColor?: 'emerald' | 'amber' | 'sky' | 'rose' | 'purple' | 'cyan';
  // Event type (travel, personal, meeting, soundcheck, etc.)
  btnType?: 'travel' | 'personal' | 'meeting' | 'soundcheck' | 'rehearsal' | 'interview' | 'other';
  // Flight/travel info
  departure?: string;  // City code (e.g., 'BCN')
  destination?: string; // City code (e.g., 'LIS')
  startTime?: string; // ISO time (e.g., '2025-11-08T10:30:00Z')
  // Multi-day support
  endDate?: string; // End date for multi-day travel (YYYY-MM-DD)
};
export type ItineraryFilters = { from?: string; to?: string; team?: 'all'|'A'|'B' };

import { logger } from '../lib/logger';

// Helper to check if a location is valid (not a junk value)
export function isValidLocation(location: string | undefined, title?: string, btnType?: string): boolean {
  if (!location || typeof location !== 'string') return false;

  const locTrimmed = location.trim();
  if (locTrimmed.length < 3) return false;

  const locLower = locTrimmed.toLowerCase();
  const titleLower = title?.toLowerCase() || '';
  const btnTypeLower = btnType?.toLowerCase() || '';
  const knownEventTypes = ['show', 'travel', 'soundcheck', 'rehearsal', 'interview', 'personal', 'meeting', 'other', 'holidays'];

  // Invalid if it matches title, btnType, or is a known event type
  if (locLower === titleLower || locLower === btnTypeLower || knownEventTypes.includes(locLower)) {
    return false;
  }

  // Invalid if location contains the title (e.g., "TRAVEL → Travel" contains "travel")
  if (titleLower && locLower.includes(titleLower)) {
    return false;
  }

  // Invalid if location contains the btnType
  if (btnTypeLower && locLower.includes(btnTypeLower)) {
    return false;
  }

  // Invalid if location contains any known event type
  for (const eventType of knownEventTypes) {
    if (locLower.includes(eventType)) {
      return false;
    }
  }

  return true;
}

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

    // Always run cleanup on fetch to ensure invalid locations are removed
    cleanupItineraryLocations();

    // Re-fetch after cleanup
    const rawAfterCleanup = localStorage.getItem('travel:itineraries');
    all = rawAfterCleanup ? JSON.parse(rawAfterCleanup) as Itinerary[] : [];
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

// NUCLEAR OPTION: Remove ALL location fields from ALL itineraries (one-time cleanup)
export function nuclearCleanupLocations(): void {
  try {
    const raw = localStorage.getItem('travel:itineraries');
    if (!raw) return;

    const list: Itinerary[] = JSON.parse(raw);
    let modified = false;

    const cleaned = list.map(it => {
      if (it.location) {
        modified = true;
        logger.info('[travelApi NUCLEAR] Removing ALL locations', { location: it.location, title: it.title, id: it.id });
        const { location, ...rest } = it;
        return rest;
      }
      return it;
    });

    if (modified) {
      logger.info('[travelApi NUCLEAR] Cleanup complete - removed ALL location fields', { count: list.length });
      localStorage.setItem('travel:itineraries', JSON.stringify(cleaned));
      cache.clear();
      _emitUpdated(keyOf({}), cleaned);
    }
  } catch (err) {
    logger.error('[travelApi] Nuclear cleanup error', err as Error);
  }
}

// Migration: Clean up existing itineraries where location equals btnType or is a known event type
// This removes invalid location values that were set from previous versions
// Runs every time the app loads to ensure cleanup happens
export function cleanupItineraryLocations(): void {
  try {
    const raw = localStorage.getItem('travel:itineraries');
    if (!raw) return; // Nothing to clean

    const list: Itinerary[] = JSON.parse(raw);

    let modified = false;
    const cleaned = list.map(it => {
      // If location exists and is NOT valid, remove it
      if (it.location && !isValidLocation(it.location, it.title, it.btnType)) {
        modified = true;
        logger.info('[travelApi] Removing invalid location', { location: it.location, id: it.id, title: it.title });
        const { location, ...rest } = it;
        return rest;
      }
      return it;
    });

    if (modified) {
      const withLocation = cleaned.filter((c: any) => c.location).length;
      const removed = list.length - withLocation;
      logger.info('[travelApi] Cleaned up invalid location values', { removed, remaining: withLocation });
      localStorage.setItem('travel:itineraries', JSON.stringify(cleaned));
      cache.clear();
      _emitUpdated(keyOf({}), cleaned);
    }
  } catch (err) {
    logger.error('[travelApi] Error during location cleanup', err as Error);
  }
}

// Persist a single itinerary (create or update) and emit update events
// Automatically validates and cleans invalid location values before saving
export async function saveItinerary(it: Itinerary): Promise<Itinerary> {
  try {
    let cleanedIt = { ...it };

    // Remove location if it's invalid using helper
    if (!isValidLocation(cleanedIt.location, cleanedIt.title, cleanedIt.btnType)) {
      const { location, ...rest } = cleanedIt;
      cleanedIt = rest;
    }

    const raw = localStorage.getItem('travel:itineraries');
    const list: Itinerary[] = raw ? JSON.parse(raw) : [];
    const idx = list.findIndex(i => i.id === it.id);
    if (idx >= 0) {
      // For updates, merge but ensure location is removed if cleanedIt removed it
      const existing = list[idx];
      if (existing) {
        const updated = { ...existing, ...cleanedIt };
        // If cleanedIt had location removed, make sure it's removed from updated too
        if (!cleanedIt.location && existing.location) {
          const { location, ...rest } = updated;
          list[idx] = rest;
        } else {
          list[idx] = updated;
        }
      }
    } else {
      list.push(cleanedIt);
    }

    localStorage.setItem('travel:itineraries', JSON.stringify(list));
    // Invalidate cache and emit update for all keys (subscribers ignore key match in callers)
    cache.clear();
    _emitUpdated(keyOf({}), list);
    return cleanedIt;
  } catch (err) {
    logger.error('[saveItinerary] Error', err as Error, { itineraryId: it.id });
    throw err;
  }
}

// Remove an itinerary by id and emit update
export async function removeItinerary(id: string): Promise<void> {
  try {
    const raw = localStorage.getItem('travel:itineraries');
    const list: Itinerary[] = raw ? JSON.parse(raw) : [];
    const newList = list.filter(i => i.id !== id);
    localStorage.setItem('travel:itineraries', JSON.stringify(newList));
    cache.clear();
    _emitUpdated(keyOf({}), newList);
  } catch (err) {
    throw err;
  }
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
    try {
      cb({ type: 'updated', key, data });
    } catch (e) {
      logger.error('[travelApi] Subscriber callback error', e as Error, { key });
    }
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
