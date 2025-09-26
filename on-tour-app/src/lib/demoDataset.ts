import { DemoShow } from './demoShows';
import { showStore } from '../shared/showStore';
import { trackEvent } from './telemetry';

/**
 * Curated demo dataset.
 * NOTE: Replace placeholder entries with real provided list (date, city, fee) when available.
 * Keep IDs stable (prefix demo-) for idempotent loading and safe duplicate detection.
 */
export const DEMO_SHOWS: DemoShow[] = [
  // Added early 2025 shows (user provided)
  { id:'demo-2025-01-01-m2-miami', name:'M2 Miami', date:'2025-01-01', city:'Miami', country:'US', lat:25.7617, lng:-80.1918, fee:18400, status:'confirmed' },
  { id:'demo-2025-02-07-daer-nightclub', name:'DAER Nightclub', date:'2025-10-03', city:'Hollywood', country:'US', lat:26.0112, lng:-80.1495, fee:9200, status:'postponed' },
  { id:'demo-2025-02-08-club-77', name:'Club 77', date:'2025-02-08', city:'Hamilton', country:'CA', lat:43.2557, lng:-79.8711, fee:6900, status:'confirmed' },
  { id:'demo-2025-02-14-bauhaus', name:'Bauhaus', date:'2025-02-14', city:'Houston', country:'US', lat:29.7604, lng:-95.3698, fee:6486, status:'confirmed' },
  { id:'demo-2025-02-15-kingdom-nightclub', name:'Kingdom Nightclub', date:'2025-02-15', city:'Austin', country:'US', lat:30.2672, lng:-97.7431, fee:5566, status:'confirmed' },
  { id:'demo-2025-02-28-ora-nightclub', name:'Ora Nightclub', date:'2025-02-28', city:'Seattle', country:'US', lat:47.6062, lng:-122.3321, fee:4600, status:'confirmed' },
  // Exact curated list provided by user (only these shows; no commissions applied)
  { id:'demo-2025-03-01-exchange-la', name:'Exchange LA', date:'2025-03-01', city:'Los Angeles', country:'US', lat:34.0522, lng:-118.2437, fee:11508, status:'confirmed' },
  { id:'demo-2025-03-07-get-lucky-festival', name:'Get Lucky Festival US', date:'2025-03-07', city:'Salt Lake City', country:'US', lat:40.7608, lng:-111.8910, fee:6140, status:'confirmed' },
  { id:'demo-2025-03-07-get-lucky-afters', name:'Get Lucky Afters US', date:'2025-03-07', city:'Salt Lake City', country:'US', lat:40.7608, lng:-111.8910, fee:3703, status:'confirmed' },
  { id:'demo-2025-03-08-premier-nightclub', name:'Premier Nightclub US', date:'2025-03-08', city:'Atlantic City', country:'US', lat:39.3643, lng:-74.4229, fee:11578, status:'confirmed' },
  { id:'demo-2025-03-14-trio-charlotte', name:'Trio Charlotte', date:'2025-03-14', city:'Charlotte', country:'US', lat:35.2271, lng:-80.8431, fee:4620, status:'confirmed' },
  { id:'demo-2025-03-15-temple-denver', name:'Temple Nightclub Denver', date:'2025-03-15', city:'Denver', country:'US', lat:39.7392, lng:-104.9903, fee:6140, status:'confirmed' },
  { id:'demo-2025-03-21-commonwealth-underground', name:'Commonwealth Underground', date:'2025-03-21', city:'Las Vegas', country:'US', lat:36.1699, lng:-115.1398, fee:4816, status:'confirmed' },
  { id:'demo-2025-03-22-celebrities-vancouver', name:'Celebrities Vancouver', date:'2025-03-22', city:'Vancouver', country:'CA', lat:49.2827, lng:-123.1207, fee:6261, status:'confirmed' },
  { id:'demo-2025-03-27-paradox-with-acraze', name:'Paradox with Acraze', date:'2025-03-27', city:'Miami', country:'US', lat:25.7617, lng:-80.1918, fee:1949, status:'confirmed' },
  { id:'demo-2025-03-28-district-atlanta', name:'District Atlanta', date:'2025-03-28', city:'Atlanta', country:'US', lat:33.749, lng:-84.388, fee:7922, status:'confirmed' },
  { id:'demo-2025-03-29-beyond-wonderland-socal', name:'Beyond Wonderland SoCal', date:'2025-03-29', city:'San Bernardino', country:'US', lat:34.1083, lng:-117.2898, fee:6852, status:'confirmed' },
  { id:'demo-2025-03-29-beyond-wonderland-socal-after', name:'Beyond Wonderland SoCal After', date:'2025-03-29', city:'San Bernardino', country:'US', lat:34.1083, lng:-117.2898, fee:4752, status:'confirmed' },
  { id:'demo-2025-04-04-royale-boston', name:'Royale Boston', date:'2025-04-04', city:'Boston', country:'US', lat:42.3601, lng:-71.0589, fee:7131, status:'confirmed' },
  { id:'demo-2025-04-05-strawberry-pool-miami', name:'Strawberry Pool Miami', date:'2025-04-05', city:'Miami Beach', country:'US', lat:25.7907, lng:-80.13, fee:6943, status:'confirmed' },
  { id:'demo-2025-04-10-lane-23-malaysia', name:'Lane 23 Malaysia', date:'2025-04-10', city:'Kuala Lumpur', country:'MY', lat:3.139, lng:101.6869, fee:9000, status:'confirmed' },
  { id:'demo-2025-04-13-s2o-festival', name:'S2O Festival', date:'2025-04-13', city:'Bangkok', country:'TH', lat:13.7563, lng:100.5018, fee:13931, status:'confirmed' },
  { id:'demo-2025-04-13-s2o-festival-afters', name:'S2O Festival Afters', date:'2025-04-13', city:'Bangkok', country:'TH', lat:13.7563, lng:100.5018, fee:6691, status:'confirmed' },
  { id:'demo-2025-04-17-fayy-club', name:'Fayy Club', date:'2025-04-17', city:'Hong Kong', country:'HK', lat:22.3193, lng:114.1694, fee:5500, status:'confirmed' },
  { id:'demo-2025-04-18-illuzion-patong', name:'Illuzion', date:'2025-04-18', city:'Patong', country:'TH', lat:7.8966, lng:98.2965, fee:4629, status:'confirmed' },
  { id:'demo-2025-04-25-ministry-of-fun', name:'Ministry of Fun', date:'2025-04-25', city:'Banská Bystrica', country:'SK', lat:48.7363, lng:19.1462, fee:8000, status:'confirmed' },
  { id:'demo-2025-04-26-ritter-butzke', name:'Ritter Butzke', date:'2025-04-26', city:'Berlin', country:'DE', lat:52.52, lng:13.405, fee:2500, status:'confirmed' },
  { id:'demo-2025-04-30-misa-chile', name:'Misa Chile', date:'2025-04-30', city:'Santiago', country:'CL', lat:-33.4489, lng:-70.6693, fee:9683, status:'confirmed' },
  { id:'demo-2025-05-03-silo-ny', name:'Silo NY', date:'2025-05-03', city:'Brooklyn', country:'US', lat:40.6782, lng:-73.9442, fee:14313, status:'confirmed' },
  { id:'demo-2025-05-10-yalta-club', name:'Yalta Club', date:'2025-05-10', city:'Sofia', country:'BG', lat:42.6977, lng:23.3219, fee:6500, status:'confirmed' },
  { id:'demo-2025-05-16-hotel-edc-las-vegas', name:'Hotel EDC Las Vegas', date:'2025-05-16', city:'Las Vegas', country:'US', lat:36.1699, lng:-115.1398, fee:2200, status:'confirmed' },
  { id:'demo-2025-05-18-edc-las-vegas', name:'EDC Las Vegas', date:'2025-05-18', city:'Las Vegas', country:'US', lat:36.1699, lng:-115.1398, fee:6180, status:'confirmed' },
  { id:'demo-2025-05-29-society-doha', name:'Society Doha', date:'2025-05-29', city:'Doha', country:'QA', lat:25.2854, lng:51.531, fee:13500, status:'confirmed' },
  { id:'demo-2025-06-06-mosaic-kansas', name:'Mosaic Kansas', date:'2025-06-06', city:'Kansas City', country:'US', lat:39.0997, lng:-94.5786, fee:9527, status:'confirmed' },
  { id:'demo-2025-06-07-beyond-wonderland-chicago', name:'Beyond Wonderland Chicago', date:'2025-06-07', city:'Chicago', country:'US', lat:41.8781, lng:-87.6298, fee:7122, status:'confirmed' },
  { id:'demo-2025-06-07-beyond-wonderland-after', name:'Beyond Wonderland After', date:'2025-06-07', city:'Chicago', country:'US', lat:41.8781, lng:-87.6298, fee:5276, status:'confirmed' },
  { id:'demo-2025-06-14-drifted-dallas', name:'Drifted Dallas', date:'2025-06-14', city:'Dallas', country:'US', lat:32.7767, lng:-96.797, fee:35229, status:'confirmed' },
  { id:'demo-2025-06-28-raise-tokyo', name:'Raise Tokyo', date:'2025-06-28', city:'Tokyo', country:'JP', lat:35.6762, lng:139.6503, fee:16000, status:'confirmed' },
  { id:'demo-2025-07-12-s2o-taiwan-after', name:'S2O Taiwan After', date:'2025-07-12', city:'Taipei', country:'TW', lat:25.033, lng:121.5654, fee:5975, status:'confirmed' },
  { id:'demo-2025-07-12-s2o-taiwan', name:'S2O Taiwan', date:'2025-07-12', city:'Taipei', country:'TW', lat:25.033, lng:121.5654, fee:21893, status:'confirmed' },
  { id:'demo-2025-07-19-cavo-paradiso-mykonos', name:'Cavo Paradiso Mykonos', date:'2025-07-19', city:'Mykonos', country:'GR', lat:37.4467, lng:25.3289, fee:10000, status:'confirmed' },
  { id:'demo-2025-07-25-palm-tree-orlando', name:'Palm Tree Orlando', date:'2025-07-25', city:'Orlando', country:'US', lat:28.5383, lng:-81.3792, fee:7173, status:'confirmed' },
  { id:'demo-2025-07-26-night-we-met', name:'Night We Met', date:'2025-07-26', city:'Nashville', country:'US', lat:36.1627, lng:-86.7816, fee:5630, status:'confirmed' },
  { id:'demo-2025-08-01-veld-festival', name:'VELD Festival', date:'2025-08-01', city:'Toronto', country:'CA', lat:43.6532, lng:-79.3832, fee:8118, status:'confirmed' },
  { id:'demo-2025-08-01-veld-afters', name:'VELD Afters', date:'2025-08-01', city:'Toronto', country:'CA', lat:43.6532, lng:-79.3832, fee:4370, status:'confirmed' },
  { id:'demo-2025-08-02-premier-nightclub', name:'Premier Nightclub', date:'2025-08-02', city:'Atlantic City', country:'US', lat:39.3643, lng:-74.4229, fee:11578, status:'confirmed' },
  { id:'demo-2025-08-07-medusa-beach-club', name:'Medusa Beach Club', date:'2025-08-07', city:'Cullera', country:'ES', lat:39.1667, lng:-0.25, fee:6000, status:'confirmed' },
  { id:'demo-2025-08-15-input-barcelona', name:'Input Barcelona', date:'2025-08-15', city:'Barcelona', country:'ES', lat:41.3851, lng:2.1734, fee:3000, status:'confirmed' },
  { id:'demo-2025-08-29-wabi-fun-mendoza', name:'Wabi Fun Mendoza', date:'2025-08-29', city:'Mendoza', country:'AR', lat:-32.8895, lng:-68.8458, fee:11586, status:'confirmed' },
  { id:'demo-2025-08-30-hangar-33-montevideo', name:'Hangar 33 Montevideo', date:'2025-08-30', city:'Ciudad de la Costa', country:'UY', lat:-34.8384, lng:-55.9879, fee:4371, status:'confirmed' },
  { id:'demo-2025-09-05-morocco-buenos-aires', name:'Morocco Buenos Aires', date:'2025-09-05', city:'Buenos Aires', country:'AR', lat:-34.6037, lng:-58.3816, fee:4456, status:'confirmed' },
  { id:'demo-2025-09-06-santa-fe', name:'Santa Fe', date:'2025-09-06', city:'Santa Fe', country:'AR', lat:-31.6333, lng:-60.7, fee:7007, status:'confirmed' },
  { id:'demo-2025-09-12-pre-party-nocturnal', name:'Pre Party Nocturnal', date:'2025-09-12', city:'San Bernardino', country:'US', lat:34.1083, lng:-117.2898, fee:6850, status:'confirmed' },
  { id:'demo-2025-09-13-nocturnal-wonderland', name:'Nocturnal Wonderland', date:'2025-09-13', city:'San Bernardino', country:'US', lat:34.1083, lng:-117.2898, fee:11024, status:'confirmed' },
  // Added late 2025 shows (user provided)
  { id:'demo-2025-09-20-holy-techno-poznan', name:'Holy Techno Poznan', date:'2025-09-20', city:'Poznań', country:'PL', lat:52.4064, lng:16.9252, fee:8050, status:'confirmed' },
  { id:'demo-2025-10-17-tap1-copenhagen', name:'Danny Avila | Gravity w/ Miss Monique @ TAP1', date:'2025-10-17', city:'Copenhagen', country:'DK', lat:55.6761, lng:12.5683, fee:5350, status:'confirmed' },
  { id:'demo-2025-10-18-vertigo-alicante', name:'Vertigo Alicante', date:'2025-10-18', city:'Alicante', country:'ES', lat:38.3452, lng:-0.4810, fee:5202, status:'confirmed' },
  { id:'demo-2025-11-22-vertigo-murcia', name:'Vertigo Murcia', date:'2025-11-22', city:'Murcia', country:'ES', lat:37.9922, lng:-1.1307, fee:5202, status:'confirmed' },
  { id:'demo-2025-12-05-epic-prague', name:'Epic Prague', date:'2025-12-05', city:'Prague', country:'CZ', lat:50.0755, lng:14.4378, fee:9700, status:'confirmed' },
];

/** Flag key to record that demo data was loaded (for UI affordances) */
const DEMO_FLAG_KEY = 'shows-demo-loaded-v1';

// Assign WHT defaults by geography for demo data. Precedence: city > state (CA) > country.
function assignDemoWht(s: DemoShow): DemoShow {
  if (s.whtPct != null) return s;
  const city = (s.city||'').toLowerCase();
  const country = (s.country||'').toUpperCase();
  // City-specific overrides
  if (city === 'los angeles') return { ...s, whtPct: 37 };
  // Minimal California city list to cover our dataset and common cases
  const CA_CITIES = new Set<string>([
    'los angeles','san bernardino','san diego','san francisco','oakland','sacramento','san jose','long beach','anaheim','irvine','santa monica','fresno','riverside','stockton','chula vista','glendale','pasadena','bakersfield','santa ana'
  ]);
  if (country === 'US' && CA_CITIES.has(city)) return { ...s, whtPct: 37 };
  // Country-level defaults
  const byCountry: Record<string, number> = {
    US: 30,
    CA: 15,
    DE: 15.8,
    TW: 20,
    ES: 19,
    CZ: 15,
  };
  const pct = byCountry[country];
  return pct != null ? { ...s, whtPct: pct } : s;
}

export function loadDemoData(force=false) {
  const existing = showStore.getAll();
  const already = localStorage.getItem(DEMO_FLAG_KEY) === '1';
  if (already && !force) return { loaded:false, reason:'already' } as const;
  // Merge without duplicating existing demo IDs
  const existingIds = new Set(existing.map(s=>s.id));
  const toAdd = DEMO_SHOWS.filter(s=> !existingIds.has(s.id)).map(assignDemoWht);
  showStore.setAll([...existing, ...toAdd]);
  try { localStorage.setItem(DEMO_FLAG_KEY, '1'); } catch {}
  try { trackEvent('shows.demo.seed', { count: toAdd.length }); } catch {}
  return { loaded:true, added: toAdd.length } as const;
}

export function clearAllShows() {
  showStore.setAll([]);
  try { localStorage.removeItem(DEMO_FLAG_KEY); } catch {}
  try { trackEvent('shows.demo.clear'); } catch {}
}

export function isDemoLoaded() {
  return localStorage.getItem(DEMO_FLAG_KEY) === '1';
}

/** Hard replace: wipes current shows and loads exactly DEMO_SHOWS (no merge). */
export function forceReplaceDemoData() {
  showStore.setAll(DEMO_SHOWS.map(assignDemoWht));
  try { localStorage.setItem(DEMO_FLAG_KEY, '1'); } catch {}
  try { trackEvent('shows.demo.forceReplace', { count: DEMO_SHOWS.length }); } catch {}
  return { replaced: true, count: DEMO_SHOWS.length } as const;
}
