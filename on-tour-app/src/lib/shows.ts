/**
 * Show model for tour management
 * User: Danny Avila
 */
export type Show = {
  id: string;
  tenantId?: string;
  name?: string; // show / festival / venue display name
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string; // ISO
  fee: number;              // Stored in original currency (feeCurrency)
  feeCurrency?: 'EUR' | 'USD' | 'GBP' | 'AUD'; // Original contract currency
  fxRateToBase?: number;    // Cached rate used to convert fee->base at confirmation time
  status: 'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed';
  paid?: boolean;           // Payment status
  // Optional extended metadata
  venue?: string;
  whtPct?: number;         // Withholding tax percent (0-100)
  mgmtAgency?: string;     // Management agency name
  bookingAgency?: string;  // Booking agency name
  notes?: string;
  cost?: number;           // Show production costs
};

// Backward compatibility
export type DemoShow = Show;

export function getShows(): Show[] { return []; }
export function getUpcomingShows(_n = 6): Show[] { return []; }

