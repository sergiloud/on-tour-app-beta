export type CabinClass = 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST';
export type Currency = 'EUR'|'USD'|'GBP';

export type FlightDeepLinkParams = {
  from: string; // IATA or city
  to: string;   // IATA or city
  depart: string; // YYYY-MM-DD
  back?: string;  // YYYY-MM-DD (optional, round trip)
  adults?: number; // default 1
  bags?: number;   // default 0
  cabin?: CabinClass; // default ECONOMY
  lang?: string; // e.g., 'en', 'es'
  currency?: Currency; // default USD
};

// Builds a robust Google Flights deep link. Google sometimes changes hash params; we include a
// conservative hash-style link and a human-readable `q` fallback query.
export function buildGoogleFlightsUrl(p: FlightDeepLinkParams): { url: string; fallback: string } {
  const adults = Math.max(1, Math.min(9, Math.floor(p.adults ?? 1)));
  const bags = Math.max(0, Math.min(5, Math.floor(p.bags ?? 0)));
  const cabin: CabinClass = p.cabin ?? 'ECONOMY';
  const lang = p.lang ?? 'en';
  const currency = (p.currency ?? 'USD');
  const encode = (s: string) => encodeURIComponent(s.trim());
  const leg1 = `${encode(p.from)}.${encode(p.to)}.${p.depart}`;
  const legs = p.back ? `${leg1}*${encode(p.to)}.${encode(p.from)}.${p.back}` : leg1;
  // Hash format parameters (subject to change by Google; still widely supported)
  const cabinCode = cabin === 'ECONOMY' ? 'e' : cabin === 'PREMIUM_ECONOMY' ? 'pe' : cabin === 'BUSINESS' ? 'b' : 'f';
  const hash = `#flt=${legs};c:${currency};rd:0;t:${cabinCode};sc:b${bags};px:${adults}`;
  const base = `https://www.google.com/travel/flights`;
  const url = `${base}?hl=${encodeURIComponent(lang)}${hash}`;
  // Fallback natural language query for resiliency
  const parts = [
    `from ${p.from}`,
    `to ${p.to}`,
    `on ${p.depart}`,
    p.back ? `return ${p.back}` : '',
    adults ? `${adults} adults` : '',
    bags ? `${bags} bags` : '',
    cabin ? `${cabin.replace('_', ' ').toLowerCase()}` : '',
  ].filter(Boolean);
  const q = encodeURIComponent(parts.join(' '));
  const fallback = `${base}?hl=${encodeURIComponent(lang)}&q=${q}`;
  return { url, fallback };
}

// Multi-segment: builds #flt with multiple legs joined by *
export type MultiLeg = { from: string; to: string; date: string };
export type MultiSegmentParams = {
  legs: MultiLeg[];
  adults?: number;
  bags?: number;
  cabin?: CabinClass;
  lang?: string;
  currency?: Currency;
};

export function buildGoogleFlightsMultiUrl(p: MultiSegmentParams): { url: string; fallback: string }{
  const adults = Math.max(1, Math.min(9, Math.floor(p.adults ?? 1)));
  const bags = Math.max(0, Math.min(5, Math.floor(p.bags ?? 0)));
  const cabin: CabinClass = p.cabin ?? 'ECONOMY';
  const lang = p.lang ?? 'en';
  const currency = (p.currency ?? 'USD');
  const encode = (s: string) => encodeURIComponent(s.trim());
  const legs = (p.legs||[]).map(l => `${encode(l.from)}.${encode(l.to)}.${l.date}`).join('*');
  const cabinCode = cabin === 'ECONOMY' ? 'e' : cabin === 'PREMIUM_ECONOMY' ? 'pe' : cabin === 'BUSINESS' ? 'b' : 'f';
  const hash = `#flt=${legs};c:${currency};rd:0;t:${cabinCode};sc:b${bags};px:${adults}`;
  const base = `https://www.google.com/travel/flights`;
  const url = `${base}?hl=${encodeURIComponent(lang)}${hash}`;
  const qParts = p.legs.map(l => `from ${l.from} to ${l.to} on ${l.date}`);
  qParts.push(`${adults} adults`, `${bags} bags`, cabin.replace('_', ' ').toLowerCase());
  const fallback = `${base}?hl=${encodeURIComponent(lang)}&q=${encodeURIComponent(qParts.join(' ; '))}`;
  return { url, fallback };
}
