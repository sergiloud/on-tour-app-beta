/**
 * Prophecy Dataset - Shows data for Prophecy artist
 * Based on real tour dates from 2022-2025
 */

import type { Show } from './shows';

// Helper to create coordinates for major cities
const cityCoords: Record<string, [number, number]> = {
  'Limassol': [34.6851, 33.0436],
  'Tokyo': [35.6762, 139.6503],
  'Taipei City': [25.0330, 121.5654],
  'Taipei': [25.0330, 121.5654],
  'Hannover': [52.3759, 9.7320],
  'Timișoara': [45.7489, 21.2087],
  'Alicante': [38.3452, -0.4810],
  'Ibiza': [38.9067, 1.4206],
  'Neustadt-Glewe': [53.3642, 11.5817],
  'Hamburg': [53.5511, 9.9937],
  'Schwerin': [53.6355, 11.4013],
  'London': [51.5074, -0.1278],
  'Teruel': [40.3453, -1.1064],
  'Marbella': [36.5101, -4.8824],
  'Prague': [50.0755, 14.4378],
  'Madrid': [40.4168, -3.7038],
  'Xinyi District': [25.0330, 121.5654],
  'Berlin': [52.5200, 13.4050],
  'Cologne': [50.9375, 6.9603],
  'Formigal': [42.7742, -0.3350],
  'Bangkok': [13.7563, 100.5018],
  'Ostrava': [49.8209, 18.2625],
};

const getCoords = (city: string): [number, number] => cityCoords[city] || [0, 0];

export const PROPHECY_SHOWS: Show[] = [
  // 2022
  { id: 'proph_001', name: 'PROPHECY | Danny Avila pres. Mainstage Techno', date: '2022-07-31', city: 'Limassol', country: 'CY', venue: 'Guaba Beach Bar', fee: 0, ...getShowDefaults('Limassol', '2022-07-31') },
  { id: 'proph_002', name: 'PROPHECY | Mainstage Techno daytime session (tbc)', date: '2022-08-14', city: 'Tokyo', country: 'JP', venue: 'Sel Octagon Tokyo', fee: 0, notes: 'tbc by agency', ...getShowDefaults('Tokyo', '2022-08-14') },
  { id: 'proph_003', name: 'PROPHECY | S2O Taiwan Songkran Music Festival 2022', date: '2022-08-27', city: 'Taipei City', country: 'TW', venue: 'Dajia Riverside Park', fee: 0, ...getShowDefaults('Taipei City', '2022-08-27') },
  { id: 'proph_004', name: 'PROPHECY | S2O Taiwan Songkran Music Festival 2022', date: '2022-08-28', city: 'Taipei City', country: 'TW', venue: 'Dajia Riverside Park', fee: 0, ...getShowDefaults('Taipei City', '2022-08-28') },
  { id: 'proph_005', name: 'PROPHECY | S2O Taiwan Songkran Music Festival 2022 AFTERPARTY', date: '2022-08-28', city: 'Taipei', country: 'TW', venue: 'Wave', fee: 0, ...getShowDefaults('Taipei', '2022-08-28') },
  { id: 'proph_006', name: 'PROPHECY | Fairground', date: '2022-12-03', city: 'Hannover', country: 'DE', venue: 'Hannover Exhibition Grounds - Hall 2, 3 & 4', fee: 1500, ...getShowDefaults('Hannover', '2022-12-03') },
  { id: 'proph_007', name: 'PROPHECY | Festival of Lights', date: '2022-12-31', city: 'Timișoara', country: 'RO', venue: 'Maria Theresia Bastion', fee: 0, notes: 'TBC - slot before Danny', ...getShowDefaults('Timișoara', '2022-12-31') },

  // 2023
  { id: 'proph_008', name: 'PROPHECY | Pool Sessions', date: '2023-05-20', city: 'Alicante', country: 'ES', venue: 'Marmarela Club', fee: 2000, notes: "100% headline slot of artists choice", ...getShowDefaults('Alicante', '2023-05-20') },
  { id: 'proph_009', name: 'PROPHECY | Future Rave at Hï Ibiza', date: '2023-06-23', city: 'Ibiza', country: 'ES', venue: 'Hï Ibiza', fee: 1215, ...getShowDefaults('Ibiza', '2023-06-23') },
  { id: 'proph_009b', name: 'PROPHECY | Future Rave at Hï Ibiza', date: '2023-06-24', city: 'Ibiza', country: 'ES', venue: 'Hï Ibiza', fee: 1215, ...getShowDefaults('Ibiza', '2023-06-24') },
  { id: 'proph_010', name: 'PROPHECY | Marmarela Club', date: '2023-07-08', city: 'Alicante', country: 'ES', venue: 'Marmarela Club', fee: 2000, notes: "100% headline slot of artists choice", ...getShowDefaults('Alicante', '2023-07-08') },
  { id: 'proph_011', name: 'PROPHECY | Airbeat One 2023', date: '2023-07-15', city: 'Neustadt-Glewe', country: 'DE', venue: 'Flugplatz Neustadt-Glewe', fee: 1000, notes: 'tbc by Agency', ...getShowDefaults('Neustadt-Glewe', '2023-07-15') },
  { id: 'proph_012', name: 'PROPHECY | Docks', date: '2023-11-11', city: 'Hamburg', country: 'DE', venue: 'Docks', fee: 0, ...getShowDefaults('Hamburg', '2023-11-11') },

  // 2024
  { id: 'proph_013', name: 'PROPHECY | Und draußen tanzt der Bär', date: '2024-05-09', city: 'Schwerin', country: 'DE', venue: 'Freilichtbühne Schwerin', fee: 1000, ...getShowDefaults('Schwerin', '2024-05-09') },
  { id: 'proph_014', name: 'PROPHECY | FUTURE X TEK Pres. DANNY AVILA', date: '2024-05-31', city: 'London', country: 'GB', venue: 'Ministry Of Sound Club', fee: 750, ...getShowDefaults('London', '2024-05-31', 'GBP') },
  { id: 'proph_015', name: 'PROPHECY | El Ajo 2024', date: '2024-07-05', city: 'Teruel', country: 'ES', venue: 'Peña El Ajo', fee: 2000, ...getShowDefaults('Teruel', '2024-07-05') },
  { id: 'proph_016', name: 'PROPHECY | Future Rave at Hï Ibiza', date: '2024-07-26', city: 'Ibiza', country: 'ES', venue: 'Hï Ibiza', fee: 1215, ...getShowDefaults('Ibiza', '2024-07-26') },
  { id: 'proph_016b', name: 'PROPHECY | Future Rave at Hï Ibiza', date: '2024-07-27', city: 'Ibiza', country: 'ES', venue: 'Hï Ibiza', fee: 1215, ...getShowDefaults('Ibiza', '2024-07-27') },
  { id: 'proph_017', name: 'PROPHECY | Playa Padre', date: '2024-08-07', city: 'Marbella', country: 'ES', venue: 'Playa Padre', fee: 0, ...getShowDefaults('Marbella', '2024-08-07') },
  { id: 'proph_018', name: 'PROPHECY | Momento', date: '2024-08-07', city: 'Marbella', country: 'ES', venue: 'Momento Marbella', fee: 0, ...getShowDefaults('Marbella', '2024-08-07') },
  { id: 'proph_019', name: 'PROPHECY | Epic', date: '2024-10-12', city: 'Prague', country: 'CZ', venue: 'Epic', fee: 500, ...getShowDefaults('Prague', '2024-10-12') },
  { id: 'proph_020', name: 'PROPHECY | Bassmnt Madrid', date: '2024-11-01', city: 'Madrid', country: 'ES', venue: 'Bassmnt Madrid', fee: 500, ...getShowDefaults('Madrid', '2024-11-01') },
  { id: 'proph_021', name: 'PROPHECY | Ultra Taiwan Resistance', date: '2024-11-16', city: 'Taipei', country: 'TW', venue: 'Dajia Riverside Park', fee: 2000, ...getShowDefaults('Taipei', '2024-11-16', 'USD') },
  { id: 'proph_022', name: 'PROPHECY | Ultra Official Afterparty', date: '2024-11-16', city: 'Xinyi District', country: 'TW', venue: 'Ai Nightclub', fee: 1500, ...getShowDefaults('Xinyi District', '2024-11-16', 'USD') },
  { id: 'proph_023', name: 'PROPHECY | Docks w/ Oliver Heldens', date: '2024-11-22', city: 'Hamburg', country: 'DE', venue: 'Docks', fee: 1000, ...getShowDefaults('Hamburg', '2024-11-22') },
  { id: 'proph_023b', name: 'PROPHECY | Docks w/ Oliver Heldens', date: '2024-11-23', city: 'Hamburg', country: 'DE', venue: 'Docks', fee: 1000, ...getShowDefaults('Hamburg', '2024-11-23') },
  { id: 'proph_024', name: 'PROPHECY | Verti Music Hall w/ Timmy Trumpet', date: '2024-11-23', city: 'Berlin', country: 'DE', venue: 'Verti Music Hall', fee: 750, notes: 'tbc', ...getShowDefaults('Berlin', '2024-11-23') },
  { id: 'proph_025', name: 'PROPHECY | Fairground Festival 2024', date: '2024-11-30', city: 'Hannover', country: 'DE', venue: 'Hannover Exhibition Grounds - Hall 2, 3 & 4', fee: 1500, notes: 'tbc', ...getShowDefaults('Hannover', '2024-11-30') },

  // 2025
  { id: 'proph_026', name: 'PROPHECY | Bootshaus w/ Morten', date: '2025-01-10', city: 'Cologne', country: 'DE', venue: 'Bootshaus', fee: 1000, ...getShowDefaults('Cologne', '2025-01-10') },
  { id: 'proph_027', name: 'PROPHECY | Marchica', date: '2025-02-07', city: 'Formigal', country: 'ES', venue: 'Formigal', fee: 3500, ...getShowDefaults('Formigal', '2025-02-07') },
  { id: 'proph_028', name: 'PROPHECY | S2O Festival Thailand', date: '2025-04-13', city: 'Bangkok', country: 'TH', venue: 'Rajamangala National Stadium', fee: 4000, ...getShowDefaults('Bangkok', '2025-04-13', 'USD') },
  { id: 'proph_029', name: 'PROPHECY | Beats For Love Festival', date: '2025-07-03', city: 'Ostrava', country: 'CZ', venue: 'DOV Industrial site', fee: 2425, ...getShowDefaults('Ostrava', '2025-07-03') },
];

function getShowDefaults(city: string, date: string, currency: 'EUR' | 'USD' | 'GBP' = 'EUR') {
  const [lat, lng] = getCoords(city);
  return {
    lat,
    lng,
    tenantId: 'org_artist_prophecy', // Associate shows with Prophecy tenant
    feeCurrency: currency,
    status: 'confirmed' as const,
    __version: 1,
    __modifiedAt: new Date(date).getTime(),
    __modifiedBy: 'user_prophecy',
  };
}

/**
 * Load Prophecy demo data into the shows store
 * For Firebase users: does NOT auto-load, use migration script instead
 * For demo users: loads to localStorage
 */
export async function loadProphecyData(): Promise<{ added: number; total: number }> {
  try {
    const { isFirebaseConfigured } = await import('./firebase');
    
    if (isFirebaseConfigured()) {
      console.warn('[Prophecy Dataset] Firebase detected. Use migration script to import data to Firestore.');
      return { added: 0, total: PROPHECY_SHOWS.length };
    } else {
      // Demo mode: load to localStorage
      localStorage.setItem('shows-store-v3', JSON.stringify(PROPHECY_SHOWS));
      console.log(`[Prophecy Dataset] Loaded ${PROPHECY_SHOWS.length} Prophecy shows to localStorage (demo mode)`);
      return { added: PROPHECY_SHOWS.length, total: PROPHECY_SHOWS.length };
    }
  } catch (error) {
    console.error('[Prophecy Dataset] Error loading data:', error);
    return { added: 0, total: 0 };
  }
}
