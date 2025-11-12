/**
 * Agency Configuration for Danny Avila
 *
 * This file manages booking and management agencies with date-based rules
 */

import { AgencyConfig, ContinentCode } from '../context/SettingsContext';
import { loadSettings, saveSettings } from './persist';

/**
 * Generate initial agencies for Danny Avila
 *
 * Agencies:
 * 1. UTA (Booking) - 10% commission on Americas shows
 * 2. Shushi 3000 (Booking) - 10% after UTA on Americas, 15% on all other regions
 * 3. Creative Primates (Management) - 15% commission, after UTA on Americas
 *
 * Active period: January 1, 2025 - July 31, 2025
 */
export function generateInitialAgencies(): { booking: AgencyConfig[]; management: AgencyConfig[] } {
  const bookingAgencies: AgencyConfig[] = [
    {
      id: 'booking-uta-americas',
      name: 'UTA',
      type: 'booking',
      commissionPct: 10,
      territoryMode: 'continents',
      continents: ['NA', 'SA'], // North America + South America
      notes: '10% of gross fee on Americas shows. Active Jan 1 - Jul 31, 2025'
    },
    {
      id: 'booking-shushi3000',
      name: 'Shushi 3000',
      type: 'booking',
      commissionPct: 15, // Default 15% for non-Americas
      territoryMode: 'worldwide',
      notes: '10% after UTA on Americas shows, 15% gross fee on all other regions. Active Jan 1 - Jul 31, 2025'
      // Note: The 10% after UTA logic for Americas will need to be handled in the calculation logic
      // This agency applies worldwide but with special rules for Americas
    }
  ];

  const managementAgencies: AgencyConfig[] = [
    {
      id: 'management-creative-primates',
      name: 'Creative Primates',
      type: 'management',
      commissionPct: 15,
      territoryMode: 'worldwide',
      notes: '15% of gross fee worldwide, after UTA on Americas. Active Jan 1 - Jul 31, 2025'
      // Note: The "after UTA" logic for Americas will need to be handled in the calculation logic
    }
  ];

  return { booking: bookingAgencies, management: managementAgencies };
}

/**
 * Load demo agencies from localStorage
 */
export function loadAgencies(): { booking: AgencyConfig[]; management: AgencyConfig[] } {
  try {
    const settings = loadSettings() as any;
    // console.log('[agencies] loadAgencies - settings from localStorage:', settings);
    return {
      booking: settings.bookingAgencies || [],
      management: settings.managementAgencies || []
    };
  } catch (e) {
    console.error('[agencies] loadAgencies error:', e);
    return { booking: [], management: [] };
  }
}

/**
 * Save agencies to localStorage
 */
export function saveAgencies(booking: AgencyConfig[], management: AgencyConfig[]) {
  try {
    const settings = loadSettings() as any;
    // console.log('[agencies] saveAgencies - current settings:', settings);
    // console.log('[agencies] saveAgencies - booking to save:', booking);
    // console.log('[agencies] saveAgencies - management to save:', management);

    const updated = {
      ...settings,
      bookingAgencies: booking,
      managementAgencies: management
    };

    saveSettings(updated as any);
    // console.log('[agencies] saveAgencies - saved to localStorage:', updated);

    // Dispatch event to trigger context reload
    try {
      window.dispatchEvent(new CustomEvent('storage', { detail: { key: 'settings-v1' } }));
      // console.log('[agencies] Dispatched storage event');
    } catch (e) {
      console.error('[agencies] Failed to dispatch event:', e);
    }
  } catch (e) {
    console.error('[agencies] Failed to save agencies:', e);
  }
}

/**
 * Load Danny Avila's demo agencies
 * This function merges demo agencies with existing ones, avoiding duplicates
 */
export function loadUserAgencies() {
  try {
    const existing = loadAgencies();

    const initial = generateInitialAgencies();

    // Filter out any existing agencies with the same IDs to avoid duplicates
    const initialBookingIds = new Set(initial.booking.map((a: AgencyConfig) => a.id));
    const initialManagementIds = new Set(initial.management.map((a: AgencyConfig) => a.id));

    const filteredExistingBooking = existing.booking.filter((a: AgencyConfig) => !initialBookingIds.has(a.id));
    const filteredExistingManagement = existing.management.filter((a: AgencyConfig) => !initialManagementIds.has(a.id));

    // Merge: initial agencies first, then existing
    const mergedBooking = [...initial.booking, ...filteredExistingBooking];
    const mergedManagement = [...initial.management, ...filteredExistingManagement];

    saveAgencies(mergedBooking, mergedManagement);
    // console.log('[agencies] Agencies saved to localStorage');

    return {
      loaded: true,
      booking: mergedBooking.length,
      management: mergedManagement.length
    };
  } catch (e) {
    console.error('[agencies] Failed to load demo agencies:', e);
    return { loaded: false, error: String(e) };
  }
}

/**
 * Clear all agencies
 */
export function clearAgencies() {
  try {
    saveAgencies([], []);
    return { cleared: true };
  } catch (e) {
    console.error('Failed to clear agencies:', e);
    return { cleared: false, error: String(e) };
  }
}

/**
 * Force replace with initial agencies (useful for testing)
 */
export function forceReplaceAgencies() {
  try {
    const initial = generateInitialAgencies();
    saveAgencies(initial.booking, initial.management);
    return {
      replaced: true,
      booking: initial.booking.length,
      management: initial.management.length
    };
  } catch (e) {
    console.error('Failed to force replace agencies:', e);
    return { replaced: false, error: String(e) };
  }
}

// Backward compatibility
export const loadDemoAgencies = loadUserAgencies;
export const forceReplaceDemoAgencies = forceReplaceAgencies;
export const generateDannyAvilaAgencies = generateInitialAgencies;

/**
 * Check if show date is within active agency period (Jan 1 - Jul 31, 2025)
 */
export function isWithinAgencyPeriod(showDate: string): boolean {
  try {
    const date = new Date(showDate);
    const startDate = new Date('2025-01-01');
    const endDate = new Date('2025-07-31');
    return date >= startDate && date <= endDate;
  } catch {
    return false;
  }
}

/**
 * Get applicable agencies for a show based on date, territory, and status
 */
export function agenciesForShow(
  show: any,
  bookingAgencies: AgencyConfig[],
  managementAgencies: AgencyConfig[]
): { booking: AgencyConfig[]; management: AgencyConfig[] } {
  // Filter out offers - no commissions on offers
  if (show.status === 'offer') {
    return { booking: [], management: [] };
  }

  // REMOVED: Agency period filter - calculate commissions for ALL shows with agencies
  // The period filter should be controlled by the Finance tab date selector, not here
  // if (!isWithinAgencyPeriod(show.date)) {
  //   return { booking: [], management: [] };
  // }

  // Determine continent from country code
  const getContinent = (countryCode: string): ContinentCode | null => {
    // North America
    if (['US', 'CA', 'MX'].includes(countryCode)) return 'NA';
    // South America
    if (['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'GF'].includes(countryCode)) return 'SA';
    // Europe
    if (['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'PL', 'PT', 'CZ', 'GR', 'IE', 'HU', 'RO'].includes(countryCode)) return 'EU';
    // Asia
    if (['CN', 'JP', 'KR', 'IN', 'TH', 'SG', 'MY', 'ID', 'PH', 'VN', 'TW', 'HK'].includes(countryCode)) return 'AS';
    // Africa
    if (['ZA', 'EG', 'NG', 'KE', 'MA', 'GH', 'TN', 'UG', 'ET', 'DZ'].includes(countryCode)) return 'AF';
    // Oceania
    if (['AU', 'NZ', 'FJ', 'PG'].includes(countryCode)) return 'OC';
    return null; // Unknown
  };

  const continent = getContinent(show.country);
  if (!continent) return { booking: [], management: [] };

  const isAmericas = continent === 'NA' || continent === 'SA';

  // Filter booking agencies
  const applicableBooking = bookingAgencies.filter(agency => {
    if (agency.territoryMode === 'worldwide') return true;
    if (agency.territoryMode === 'continents' && agency.continents) {
      return agency.continents.includes(continent);
    }
    return false;
  });

  // Filter management agencies (usually worldwide)
  const applicableManagement = managementAgencies.filter(agency => {
    if (agency.territoryMode === 'worldwide') return true;
    if (agency.territoryMode === 'continents' && agency.continents) {
      return agency.continents.includes(continent);
    }
    return false;
  });

  return {
    booking: applicableBooking,
    management: applicableManagement
  };
}

/**
 * Compute total commission for a show from a list of agencies
 * Handles cascading calculation for Danny Avila's specific rules:
 * - UTA: 10% of gross fee on Americas
 * - Shushi 3000: 10% after UTA on Americas, 15% gross on other regions
 * - Creative Primates: 15% after UTA on Americas, 15% gross on other regions
 * 
 * IMPORTANT: Only applies commission if the show has an agency selected (mgmtAgency or bookingAgency).
 * If no agency is selected in the show modal selector, commission = 0.
 */
export function computeCommission(show: any, agencies: AgencyConfig[]): number {
  if (!show || !agencies || agencies.length === 0) return 0;
  if (show.status === 'offer') return 0;

  const fee = show.fee || 0;
  if (fee <= 0) return 0;

  // NEW: Only apply commission if show has an agency selected
  const hasAgencySelected = !!(show.mgmtAgency || show.bookingAgency);
  if (!hasAgencySelected) return 0;

  // Determine if show is in Americas
  const getContinent = (countryCode: string): ContinentCode | null => {
    if (['US', 'CA', 'MX'].includes(countryCode)) return 'NA';
    if (['BR', 'AR', 'CL', 'CO', 'PE', 'VE', 'EC', 'BO', 'PY', 'UY', 'GY', 'SR', 'GF'].includes(countryCode)) return 'SA';
    if (['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'CH', 'AT', 'SE', 'NO', 'DK', 'FI', 'PL', 'PT', 'CZ', 'GR', 'IE', 'HU', 'RO'].includes(countryCode)) return 'EU';
    if (['CN', 'JP', 'KR', 'IN', 'TH', 'SG', 'MY', 'ID', 'PH', 'VN', 'TW', 'HK'].includes(countryCode)) return 'AS';
    if (['ZA', 'EG', 'NG', 'KE', 'MA', 'GH', 'TN', 'UG', 'ET', 'DZ'].includes(countryCode)) return 'AF';
    if (['AU', 'NZ', 'FJ', 'PG'].includes(countryCode)) return 'OC';
    return null;
  };

  const continent = getContinent(show.country);
  const isAmericas = continent === 'NA' || continent === 'SA';

  let totalCommission = 0;

  // Special handling for Danny Avila's cascading rules
  const utaAgency = agencies.find(a => a.name === 'UTA');
  const shushiAgency = agencies.find(a => a.name === 'Shushi 3000');
  const creativePrimatesAgency = agencies.find(a => a.name === 'Creative Primates');

  if (isAmericas) {
    // Americas: Cascading calculation

    // 1. UTA first: 10% of gross
    if (utaAgency) {
      const utaCommission = fee * (utaAgency.commissionPct / 100);
      totalCommission += utaCommission;
    }

    // 2. Shushi 3000: 10% after UTA (of remaining)
    if (shushiAgency) {
      const afterUTA = fee - (utaAgency ? fee * (utaAgency.commissionPct / 100) : 0);
      const shushiCommission = afterUTA * 0.10; // 10% for Americas
      totalCommission += shushiCommission;
    }

    // 3. Creative Primates: 15% after UTA
    if (creativePrimatesAgency) {
      const afterUTA = fee - (utaAgency ? fee * (utaAgency.commissionPct / 100) : 0);
      const creativePrimatesCommission = afterUTA * (creativePrimatesAgency.commissionPct / 100);
      totalCommission += creativePrimatesCommission;
    }
  } else {
    // Non-Americas: Gross calculation (no cascading)
    agencies.forEach(agency => {
      const commission = fee * (agency.commissionPct / 100);
      totalCommission += commission;
    });
  }

  return totalCommission;
}
