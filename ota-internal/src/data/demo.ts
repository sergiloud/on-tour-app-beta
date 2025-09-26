import { getLocale } from '../shared/i18n';

export type ShowStatus = 'confirmed' | 'tentative' | 'cancelled' | 'overdue' | 'pending';

export interface Show {
  id: string;
  date: string; // ISO date
  city: string;
  venue: string;
  status: ShowStatus;
  feeEUR: number; // gross placeholder
  lat?: number; // optional geocoded latitude
  lng?: number; // optional geocoded longitude
}

export interface TravelSegment {
  id: string;
  date: string; // ISO date
  kind: 'flight' | 'hotel' | 'transfer';
  title: string;
  meta: string;
}

// Demo dataset (kept tiny and readable)
const y = new Date().getFullYear();
const m = new Date().getMonth();

export const demoShows: Show[] = [
  { id: 's1', date: new Date(y, m, 15).toISOString(), city: 'Berlin', venue: 'Kesselhaus', status: 'confirmed', feeEUR: 4500 },
  { id: 's2', date: new Date(y, m, 20).toISOString(), city: 'Madrid', venue: 'La Riviera', status: 'overdue', feeEUR: 5200 },
  { id: 's3', date: new Date(y, m, 25).toISOString(), city: 'Paris', venue: 'Le Trianon', status: 'tentative', feeEUR: 4000 },
  { id: 's4', date: new Date(y, m - 1, 28).toISOString(), city: 'Lisbon', venue: 'Coliseu', status: 'confirmed', feeEUR: 3800 },
  { id: 's5', date: new Date(y, m - 2, 7).toISOString(), city: 'Warsaw', venue: 'Progresja', status: 'confirmed', feeEUR: 3000 },
];

export const demoTravel: TravelSegment[] = [
  { id: 't1', date: new Date(y, m, 14, 9).toISOString(), kind: 'flight', title: 'Berlin flight', meta: 'BCN → BER · 09:25' },
  { id: 't2', date: new Date(y, m, 18, 13).toISOString(), kind: 'transfer', title: 'Venue transfer', meta: 'Hotel → Arena · 13:00' },
  { id: 't3', date: new Date(y, m, 24).toISOString(), kind: 'hotel', title: 'Paris hotel', meta: 'Check-in · Trianon area' },
];

export function euros(n: number): string {
  let currency: 'EUR'|'USD'|'GBP' = 'EUR';
  try {
    const raw = localStorage.getItem('ota:settings:v1');
    if (raw) {
      const s = JSON.parse(raw);
      if (s && (s.defaultCurrency === 'EUR' || s.defaultCurrency === 'USD' || s.defaultCurrency === 'GBP')) {
        currency = s.defaultCurrency;
      }
    }
  } catch {}
  try {
    const loc = getLocale ? getLocale() : undefined;
    return new Intl.NumberFormat(loc || undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(n);
  } catch {
    const sym = currency === 'USD' ? '$' : currency === 'GBP' ? '£' : '€';
    return `${sym}${Math.round(n).toLocaleString()}`;
  }
}

function inSameMonth(d: Date, ref: Date): boolean {
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth();
}

export function getKpis(now = new Date(), shows: Show[] = demoShows) {
  // YTD includes all confirmed/paid-like statuses up to today
  const ytd = shows
    .filter(s => {
      const d = new Date(s.date);
      return d.getFullYear() === now.getFullYear() && d <= now && (s.status === 'confirmed' || s.status === 'overdue');
    })
    .reduce((sum, s) => sum + s.feeEUR, 0);

  const month = shows
    .filter(s => inSameMonth(new Date(s.date), now))
    .reduce((sum, s) => sum + s.feeEUR, 0);

  return { ytd, month };
}

export function getCurrentMonthShows(ref = new Date(), shows: Show[] = demoShows): Show[] {
  return shows.filter(s => inSameMonth(new Date(s.date), ref));
}

export function getPendingItems(shows: Show[] = demoShows): Show[] {
  return shows.filter(s => s.status === 'overdue' || s.status === 'pending');
}

export function getUpcomingTravel(ref = new Date(), travel: TravelSegment[] = demoTravel): TravelSegment[] {
  const now = +ref;
  const in30d = now + 30 * 24 * 3600 * 1000;
  return travel.filter(t => {
    const ts = +new Date(t.date);
    return ts >= now && ts <= in30d;
  }).sort((a, b) => +new Date(a.date) - +new Date(b.date));
}
