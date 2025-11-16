export interface Show {
  id: string;
  date: string;
  venue: {
    name: string;
    capacity: number;
    location: string;
  };
  revenue: number;
  expenses: number;
  ticketsSold: number;
  status: 'scheduled' | 'completed' | 'cancelled';
}

export interface FinancialMetrics {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  profitMargin: number;
  averageTicketPrice: number;
  utilizationRate: number;
  revenuePerShow: number;
  breakEvenTickets: number;
}

export interface ForecastResult {
  projectedRevenue: number[];
  projectedExpenses: number[];
  projectedProfit: number[];
  confidenceInterval: number[];
  trendSlope: number;
  seasonalityFactor: number;
}

export interface ScenarioAnalysis {
  currentRevenue: number;
  currentExpenses: number;
  currentProfit: number;
  projectedRevenue: number;
  projectedExpenses: number;
  projectedProfit: number;
  profitChangePercent: number;
  newTicketPrice: number;
  projectedTickets: number;
}

export interface WasmFinancialEngineInterface {
  calculateMetrics(shows: Show[]): Promise<FinancialMetrics>;
  forecastRevenue(shows: Show[], monthsAhead: number): Promise<ForecastResult>;
  scenarioAnalysis(
    shows: Show[], 
    ticketPriceChange: number, 
    capacityChange: number, 
    expenseChange: number
  ): Promise<ScenarioAnalysis>;
  isInitialized(): boolean;
}