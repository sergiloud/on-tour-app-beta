import { useMemo } from 'react';
import type { CalEvent } from '../components/calendar/types';
import { countryLabel } from '../lib/countries';

type Inputs = {
  shows: Array<{ id: string; date: string; city: string; country: string; status: string }>;
  travel: Array<{ id: string; date: string; title: string; city?: string; status?: string; start?: string; end?: string }>;
  lang: 'en' | 'es';
  kinds: { shows: boolean; travel: boolean };
  filters?: { status?: { confirmed: boolean; pending: boolean; offer: boolean } };
  toDateOnlyTz: (iso: string, tz: string) => string;
  tz: string;
};

export function useCalendarEvents({ shows, travel, lang, kinds, filters, toDateOnlyTz, tz }: Inputs) {
  return useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const push = (d: string, ev: CalEvent) => {
      const arr = map.get(d) || [];
      arr.push(ev);
      map.set(d, arr);
    };
    const allowStatus = (s?: string) => {
      if (!filters?.status) return true;
      if (s === 'confirmed') return !!filters.status.confirmed;
      if (s === 'pending') return !!filters.status.pending;
      if (s === 'offer') return !!filters.status.offer;
      return true;
    };
    if (kinds.shows) for (const s of shows) {
      if (!allowStatus(s.status)) continue;
      const d = toDateOnlyTz(s.date, tz);
      push(d, { id: `show:${s.id}`, date: d, kind: 'show', title: `${s.city}, ${countryLabel(s.country, lang)}` , meta: '', status: s.status });
    }
    if (kinds.travel) for (const it of travel) {
      if (!allowStatus(it.status)) continue;
      const d = toDateOnlyTz(it.date, tz);
      push(d, { id: `travel:${it.id}`, date: d, kind: 'travel', title: it.title, meta: it.city || '', status: it.status, start: it.start, end: it.end });
    }
    return map;
  }, [shows, travel, lang, kinds.shows, kinds.travel, tz, filters?.status?.confirmed, filters?.status?.pending, filters?.status?.offer]);
}
