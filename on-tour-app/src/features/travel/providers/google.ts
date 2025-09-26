import type { FlightSearchParams, SearchResult } from './types';
import { buildDeepLinkFromSearchParams } from './util';

export async function googleProvider(p: FlightSearchParams): Promise<SearchResult>{
  // Build a robust Google Flights deep link; do not scrape or call Google.
  const url = buildDeepLinkFromSearchParams(p);
  return { results: [], deepLink: url, provider: 'google' };
}

// Future: multi-segment provider entry point (kept internal for now)
// Note: multi-segment deep links will be added when UI supports segment building.
