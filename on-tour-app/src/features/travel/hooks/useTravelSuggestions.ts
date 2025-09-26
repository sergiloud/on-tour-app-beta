import { useMemo } from 'react';
import type { DemoShow } from '../../../lib/demoShows';

export type TravelSuggestion = {
  originCity: string;
  destinationCity: string;
  originShowId: string;
  destinationShowId: string;
  // Suggested date window (ISO YYYY-MM-DD)
  fromDate: string;
  toDate: string;
};

/**
 * Given a list of shows (ideally confirmed), suggest travel legs between consecutive shows in different cities.
 * If shows are on the same city, no suggestion is produced for that pair.
 */
export function useTravelSuggestions(shows: DemoShow[] = []): TravelSuggestion[] {
  return useMemo(() => {
    const ordered = shows.slice().sort((a,b)=> new Date(a.date).getTime() - new Date(b.date).getTime());
    const out: TravelSuggestion[] = [];
    for (let i = 0; i < ordered.length - 1; i++) {
      const a = ordered[i];
      const b = ordered[i+1];
      if (!a || !b) continue;
      if ((a.city||'').trim().toLowerCase() === (b.city||'').trim().toLowerCase()) continue;
      const arrive = new Date(a.date);
      const depart = new Date(b.date);
      // suggest a one-day window ending the day of the next show
      const from = new Date(arrive); from.setDate(from.getDate()+0); // same day
      const to = new Date(depart); // day of next show
      const pad = (n:number)=> String(n).padStart(2,'0');
      const toISO = (d:Date)=> `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
      out.push({
        originCity: a.city,
        destinationCity: b.city,
        originShowId: a.id,
        destinationShowId: b.id,
        fromDate: toISO(from),
        toDate: toISO(to)
      });
    }
    return out;
  }, [shows]);
}
