export type FlightSearchParams = {
  origin: string; // IATA or city
  dest: string;   // IATA or city
  date: string;   // YYYY-MM-DD
  retDate?: string; // YYYY-MM-DD
  adults?: number;
  bags?: number; // total bags (carry-on assumed by UX); providers may ignore
  nonstop?: boolean;
  cabin?: 'E'|'W'|'B'|'F'; // Economy, Premium/EconomyPlus, Business, First
};

export type FlightResult = {
  id: string;
  origin: string;
  dest: string;
  dep: string; // ISO
  arr: string; // ISO
  durationM: number;
  stops: number; // 0 nonstop
  price: number;
  currency: string;
  carrier?: string;
  deepLink?: string;
};

// Phase 0+ additions (backward compatible)
export type FlightSegment = { origin: string; dest: string; date: string };
export type MultiFlightSearchParams = {
  segments: FlightSegment[];
  adults?: number;
  bags?: number;
  nonstop?: boolean;
  cabin?: 'E'|'W'|'B'|'F';
};

export type SearchResult = { results: FlightResult[]; deepLink?: string; provider?: string };
