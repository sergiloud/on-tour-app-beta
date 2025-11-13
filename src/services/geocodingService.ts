/**
 * Geocoding service using country-based coordinates
 * Converts city + country to approximate coordinates (lat, lng)
 * Uses country center + deterministic city offset to spread shows geographically
 */

import { logger } from '../lib/logger';

interface GeocodeResult {
  lat: number;
  lng: number;
  city: string;
  country: string;
}

// Cache to avoid repeated calculations
const geocodeCache = new Map<string, GeocodeResult | null>();

// Country center coordinates (same as InteractiveMap.tsx)
const countryCoordinates: Record<string, [number, number]> = {
  US: [-95.7129, 37.0902],
  GB: [-3.4360, 55.3781],
  FR: [2.2137, 46.2276],
  DE: [10.4515, 51.1657],
  ES: [-3.7492, 40.4637],
  IT: [12.5674, 41.8719],
  NL: [5.2913, 52.1326],
  BE: [4.4699, 50.5039],
  CH: [8.2275, 46.8182],
  AT: [14.5501, 47.5162],
  PT: [-8.2245, 39.3999],
  SE: [18.6435, 60.1282],
  NO: [8.4689, 60.4720],
  DK: [9.5018, 56.2639],
  FI: [25.7482, 61.9241],
  PL: [19.1451, 51.9194],
  CZ: [15.4730, 49.8175],
  AU: [133.7751, -25.2744],
  JP: [138.2529, 36.2048],
  CN: [104.1954, 35.8617],
  BR: [-51.9253, -14.2350],
  MX: [-102.5528, 23.6345],
  CA: [-106.3468, 56.1304],
  AR: [-63.6167, -38.4161],
  CL: [-71.5430, -35.6751],
  CO: [-74.2973, 4.5709],
  VN: [108.2772, 14.0583],
  TH: [100.9925, 15.8700],
  SG: [103.8198, 1.3521],
  MY: [101.9758, 4.2105],
  IN: [78.9629, 20.5937],
  AE: [53.8478, 23.4241],
  SA: [45.0792, 23.8859],
  ZA: [22.9375, -30.5595],
  EG: [30.8025, 26.8206],
  KE: [37.9062, -0.0236],
  NG: [8.6753, 9.0820],
  GR: [21.8243, 39.0742],
  TR: [35.2433, 38.9637],
  RU: [105.3188, 61.5240],
  UA: [31.1656, 48.3794],
  IE: [-8.2439, 53.4129],
  NZ: [174.8860, -40.9006],
  KR: [127.7669, 35.9078],
  HK: [114.1694, 22.3193],
  TW: [120.9605, 23.6978],
};

/**
 * Simple hash function to generate deterministic offset from city name
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}

/**
 * Get coordinates for a city and country
 * @param city City name
 * @param country Country code (ISO 3166-1 alpha-2, e.g., 'ES', 'US')
 * @returns Coordinates or null if not found
 */
export async function geocodeLocation(
  city: string,
  country: string
): Promise<GeocodeResult | null> {
  if (!city || !country) return null;

  // Create cache key
  const cacheKey = `${city.toLowerCase()}-${country.toLowerCase()}`;

  // Check cache first
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey) || null;
  }

  // Get country coordinates
  const countryCode = country.toUpperCase();
  const baseCoords = countryCoordinates[countryCode];

  if (!baseCoords) {
    logger.warn('[Geocoding] Unknown country code', { country });
    geocodeCache.set(cacheKey, null);
    return null;
  }

  // Generate deterministic offset based on city name
  // This spreads cities within a country across a ~2-3 degree range
  const hash = hashString(city.toLowerCase());
  const latOffset = ((hash % 200) - 100) / 50; // -2 to +2 degrees
  const lngOffset = (((hash >> 8) % 200) - 100) / 50; // -2 to +2 degrees

  const result: GeocodeResult = {
    lat: baseCoords[1] + latOffset,
    lng: baseCoords[0] + lngOffset,
    city,
    country,
  };

  logger.info('[Geocoding] Geocoded location', { city, country, lat: result.lat.toFixed(4), lng: result.lng.toFixed(4) });

  // Cache the result
  geocodeCache.set(cacheKey, result);

  return result;
}

/**
 * Geocode multiple locations in batch
 * No rate limiting needed since this is a local calculation
 */
export async function geocodeBatch(
  locations: Array<{ city: string; country: string; id: string }>
): Promise<Map<string, GeocodeResult | null>> {
  const results = new Map<string, GeocodeResult | null>();

  for (const loc of locations) {
    if (!loc) continue;
    const result = await geocodeLocation(loc.city, loc.country);
    results.set(loc.id, result);
  }

  return results;
}

/**
 * Clear the geocoding cache
 */
export function clearGeocodeCache() {
  geocodeCache.clear();
}

/**
 * Get cache statistics
 */
export function getGeocodeStats() {
  return {
    cacheSize: geocodeCache.size,
    cached: Array.from(geocodeCache.entries())
      .filter(([_, v]) => v !== null)
      .map(([k, v]) => ({ key: k, ...v })),
  };
}
