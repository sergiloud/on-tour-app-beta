// Clean slate model types with no seeded data.
export type DemoShow = {
  id: string;
  name?: string; // show / festival / venue display name
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string; // ISO
  fee: number;              // Stored in original currency (feeCurrency)
  feeCurrency?: 'EUR'|'USD'|'GBP'|'AUD'; // Original contract currency (defaults to settings currency if absent)
  fxRateToBase?: number;    // Cached rate used to convert fee->base at confirmation time
  status: 'confirmed'|'pending'|'offer'|'canceled'|'archived'|'postponed';
  // Optional extended metadata captured via editor UI
  venue?: string;          // Venue name separate from show/festival brand
  whtPct?: number;         // Withholding tax percent (0-100)
  mgmtAgency?: string;     // Selected management agency name (id stable via settings; storing name is fine for demo)
  bookingAgency?: string;  // Selected booking agency name
  notes?: string;          // Free-form notes
};

// All generation and mock data removed; new accounts start empty.
export function getDemoShows(): DemoShow[] { return []; }
export function getUpcomingShows(_n=6): DemoShow[] { return []; }

