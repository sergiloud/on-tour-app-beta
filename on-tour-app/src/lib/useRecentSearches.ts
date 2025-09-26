import { useState, useCallback, useEffect } from 'react';
import { loadJSON, pushRecent } from './persist';

// Define la estructura de una búsqueda para poder guardarla
export type FlightSearch = {
  origin: string;
  destination: string;
  departDate: string;
  returnDate?: string;
};

const RECENT_SEARCHES_KEY = 'travel:recent-searches';

export function useRecentSearches() {
  // migrate from legacy key used in SmartFlightSearch if present
  const [recents, setRecents] = useState<FlightSearch[]>(() => {
    const legacy = loadJSON<any[]>('travel.recent', []);
    const mapped: FlightSearch[] = Array.isArray(legacy)
      ? legacy.map((x: any) => ({
          origin: x.origin ?? x.from ?? '',
          destination: x.dest ?? x.to ?? '',
          departDate: x.date ?? x.depart ?? '',
          returnDate: x.retDate ?? x.return ?? undefined,
        }))
      : [];
    const current = loadJSON<FlightSearch[]>(RECENT_SEARCHES_KEY, []);
    return current.length ? current : mapped;
  });

  useEffect(() => {
    // Persist current list if it came from legacy
    if (recents && recents.length) {
      try { localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recents)); } catch {}
    }
  }, []);

  const addRecentSearch = useCallback((search: FlightSearch) => {
    const newRecents = pushRecent(RECENT_SEARCHES_KEY, search, { max: 5, dedupeBy: s => `${s.origin}-${s.destination}-${s.departDate}-${s.returnDate||''}` });
    setRecents(newRecents);
  }, []);

  return { recentSearches: recents, addRecentSearch };
}
