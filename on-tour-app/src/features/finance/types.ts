export type FinanceShow = {
  id: string;
  name?: string; // display name of show/festival
  city: string;
  country: string;
  lat: number;
  lng: number;
  date: string; // ISO
  fee: number;
  feeCurrency?: 'EUR' | 'USD' | 'GBP' | 'AUD'; // ADDED: Currency for fee (defaults to EUR)
  status: 'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed';
  // Optional enrichment fields (used for breakdowns/costs)
  route?: string; // e.g., EU/US/LatAm tour leg or internal routing key
  venue?: string; // venue name or code
  promoter?: string; // promoter/company name
  cost?: number; // explicit cost if known; no heuristic applied elsewhere
};

export type BreakdownEntry = {
  key: string;
  income: number;
  expenses: number;
  net: number;
  count: number;
};

export type MarginBreakdown = {
  byRoute: BreakdownEntry[];
  byVenue: BreakdownEntry[];
  byPromoter: BreakdownEntry[];
};

export type ForecastPoint = { month: string; net: number; p50?: number; p90?: number };

export type CashflowMetrics = {
  month: { inflows: number; outflows: number; net: number };
  pending: number; // pending receivables as a proxy of near-term inflows
};

export type FinanceSnapshot = {
  asOf: string; // ISO date
  shows: FinanceShow[];
  month: {
    start: string;
    end: string;
    income: number;
    expenses: number;
    net: number;
  };
  year: {
    income: number;
    expenses: number;
    net: number;
  };
  pending: number;
  // Enriched analytics
  breakdown?: MarginBreakdown;
  forecast?: { next: ForecastPoint[] };
  cashflow?: CashflowMetrics;
};
