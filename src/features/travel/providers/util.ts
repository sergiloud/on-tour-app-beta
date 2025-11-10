import { buildGoogleFlightsUrl, type CabinClass } from '../../../lib/travel/deeplink';
import type { FlightSearchParams } from './types';
import { getLang } from '../../../lib/i18n';
import { loadSettings } from '../../../lib/persist';

// Normalize short cabin code (E/W/B/F) to CabinClass used by deep link builder
export function toCabin(code: 'E'|'W'|'B'|'F' | undefined): CabinClass {
  if (code === 'E') return 'ECONOMY';
  if (code === 'W') return 'PREMIUM_ECONOMY';
  if (code === 'B') return 'BUSINESS';
  return 'FIRST';
}

// Central helper to construct a Google Flights deep link from FlightSearchParams
export function buildDeepLinkFromSearchParams(p: FlightSearchParams): string {
  const lang = getLang();
  const settings = (()=>{ try { return loadSettings(); } catch { return {}; } })() as any;
  const { url } = buildGoogleFlightsUrl({
    from: p.origin,
    to: p.dest,
    depart: p.date,
    back: p.retDate,
    adults: p.adults,
    bags: p.bags,
    cabin: toCabin(p.cabin),
    lang,
    currency: (settings.currency as any) || 'USD'
  });
  return url;
}
