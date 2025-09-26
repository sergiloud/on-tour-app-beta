// Shows module (scaffold)
// Responsible for loading shows (demo + local overrides), basic queries (next show, month shows)
import type { Show } from '../../../data/demo';
import { demoShows } from '../../../data/demo';

const LOCAL_PREFIX = 'show:';

export function loadShows(): Show[] {
  // Merge demo shows with local overrides (future: persistence layer)
  const base = [...demoShows];
  // Apply local overrides if exist
  return base.map(s => {
    try {
      const raw = localStorage.getItem(LOCAL_PREFIX + s.id);
      if (!raw) return s;
      return { ...s, ...JSON.parse(raw) };
    } catch { return s; }
  });
}

export function getNextShow(today = new Date()): Show | undefined {
  return loadShows()
    .filter(s => new Date(s.date).getTime() >= today.getTime())
    .sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}

export function getMonthShows(d = new Date()): Show[] {
  const m = d.getMonth();
  const y = d.getFullYear();
  return loadShows().filter(s => {
    const dt = new Date(s.date);
    return dt.getMonth() === m && dt.getFullYear() === y;
  }).sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
}

export function addLocalShow(show: Show) {
  try { localStorage.setItem(LOCAL_PREFIX + show.id, JSON.stringify(show)); } catch {}
}

export function createNewShowDefaults(): Show {
  const id = 'show-' + Math.random().toString(36).slice(2,9);
  const date = new Date();
  date.setDate(date.getDate() + 7);
  return {
    id,
    date: date.toISOString(),
    city: 'City',
    country: 'Country',
    venue: 'Venue',
    feeEUR: 0,
    status: 'Tentative' as any
  } as Show;
}
