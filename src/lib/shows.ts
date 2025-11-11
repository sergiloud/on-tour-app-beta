/**
 * Show model for tour management
 * User: Danny Avila
 */
export type Show = {
  id: string;
  tenantId?: string;
  userId?: string;         // User ID who owns this show (for Firestore sync)
  name?: string; // show / festival / venue display name
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string; // ISO start date
  endDate?: string; // ISO end date (optional for multi-day shows/tours)
  fee: number;              // Stored in original currency (feeCurrency)
  feeCurrency?: 'EUR' | 'USD' | 'GBP' | 'AUD'; // Original contract currency
  fxRateToBase?: number;    // Cached rate used to convert fee->base at confirmation time
  fxRateDate?: string;      // ISO date when FX rate was locked (for accounting)
  fxRateSource?: string;    // Where the rate came from: 'locked' | 'today' | 'system'
  status: 'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed';
  paid?: boolean;           // Payment status
  // Optional extended metadata
  venue?: string;          // Venue name (string for backward compatibility)
  venueId?: string;        // Venue ID (links to venueStore)
  promoter?: string;       // Promoter name (string for backward compatibility)
  promoterId?: string;     // Promoter contact ID (links to contactStore)
  whtPct?: number;         // Withholding tax percent (0-100)
  mgmtAgency?: string;     // Management agency name
  bookingAgency?: string;  // Booking agency name
  notes?: string;
  cost?: number;           // Show production costs

  // Synchronization fields (CRITICAL for multi-tab, offline, backend sync)
  __version: number;       // Increments on every change (detect conflicts)
  __modifiedAt: number;    // Timestamp of last modification (epoch ms)
  __modifiedBy: string;    // User ID or session ID that made the change
};

// Ensure __version is always present (default 0 for new shows)
export function normalizeShow(show: Partial<Show>): Show {
  return {
    ...show,
    __version: show.__version ?? 0,
    __modifiedAt: show.__modifiedAt ?? Date.now(),
    __modifiedBy: show.__modifiedBy ?? 'system'
  } as Show;
}

// Backward compatibility
export type DemoShow = Show;

export function getShows(): Show[] { return []; }
export function getUpcomingShows(_n = 6): Show[] { return []; }

