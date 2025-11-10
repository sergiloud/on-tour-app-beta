import { useEffect, useMemo, useState } from 'react';
import { norm } from '../../../lib/travel/text';
import { findAirport } from '../../../lib/airports';

// Result shape used by AirportAutocomplete (includes a display string)
export type Airport = { iata: string; city: string; country: string; display: string; name?: string };

export function useAirportsSearch(term: string){
  const [results, setResults] = useState<Airport[]>([]);
  const q = useMemo(()=> norm(term||''), [term]);
  useEffect(()=>{
    if (!q || q.length < 2) { setResults([]); return; }
    // Use dataset helper and adapt to display-friendly entries
    const found = findAirport(term || '').slice(0, 8).map(a => ({
      iata: a.iata,
      city: a.city,
      country: a.country,
      name: (a as any).name,
      display: `${a.city} (${a.iata}), ${a.country}`
    }));
    setResults(found);
  }, [q, term]);
  return results;
}
