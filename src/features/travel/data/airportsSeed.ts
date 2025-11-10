export type AirportSeed = { iata: string; city: string; country: string; display: string; priority?: number };

// Tiny built-in seed; will be replaced by dynamic dataset + worker.
export const AIRPORTS_SEED: AirportSeed[] = [
  { iata: 'MAD', city: 'Madrid', country: 'ES', display: 'Madrid (MAD), Spain', priority: 10 },
  { iata: 'BCN', city: 'Barcelona', country: 'ES', display: 'Barcelona (BCN), Spain', priority: 9 },
  { iata: 'CDG', city: 'Paris', country: 'FR', display: 'Paris Charles de Gaulle (CDG), France', priority: 9 },
  { iata: 'ORY', city: 'Paris', country: 'FR', display: 'Paris Orly (ORY), France', priority: 7 },
  { iata: 'JFK', city: 'New York', country: 'US', display: 'New York (JFK), USA', priority: 10 },
  { iata: 'EWR', city: 'New York', country: 'US', display: 'Newark (EWR), USA', priority: 8 },
  { iata: 'LHR', city: 'London', country: 'GB', display: 'London Heathrow (LHR), UK', priority: 10 },
  { iata: 'LGW', city: 'London', country: 'GB', display: 'London Gatwick (LGW), UK', priority: 7 },
  { iata: 'FRA', city: 'Frankfurt', country: 'DE', display: 'Frankfurt (FRA), Germany', priority: 8 },
  { iata: 'AMS', city: 'Amsterdam', country: 'NL', display: 'Amsterdam (AMS), Netherlands', priority: 8 }
];

// Lightweight synonyms to support localized names in NLP (can be extended or replaced by dataset alt names)
const SYN = new Map<string, string>([
  ['nueva york', 'new york'],
  ['londres', 'london'],
  ['milan', 'milan'],
  ['milán', 'milan'],
  ['paris', 'paris'],
  ['parís', 'paris'],
]);

export function findAirportByToken(token: string): AirportSeed | undefined {
  const t = token.trim();
  if (!t) return undefined;
  const upper = t.toUpperCase();
  let lower = t.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
  if (SYN.has(lower)) lower = SYN.get(lower)!;
  // Exact IATA first
  const iata = AIRPORTS_SEED.find(a => a.iata === upper);
  if (iata) return iata;
  // City match by startsWith, then includes, choose highest priority
  const candidates = AIRPORTS_SEED.map(a => {
    const city = a.city.normalize('NFD').replace(/\p{Diacritic}/gu,'').toLowerCase();
    let score = 0;
    if (city === lower) score += 100;
    else if (city.startsWith(lower)) score += 80;
    else if (city.includes(lower)) score += 50;
    return { a, score: score + (a.priority||0) };
  }).filter(x => x.score > 0)
    .sort((x,y)=> y.score - x.score);
  return candidates[0]?.a;
}
