// Shared finance domain types
export interface FinanceExpense {
  id: string;
  showId?: string;
  category: string;
  type: 'income' | 'expense';
  amount: number;
  date: string;
  description?: string;
  meta?: Record<string, any>;
}

export interface FinanceShowSummary {
  id: string;
  date: string;
  city?: string;
  venue?: string;
  income: number;
  expenses: number;
  net: number;
  payable: number;
  marginPct: number;
}

export interface KPISet {
  income: number;
  expenses: number;
  net: number;
  payable: number;
  marginPct: number;
  previousNet?: number;
}

export interface ForecastPoint { month: string; value: number; }
export interface ForecastScenarioMeta {
  id: string; // scenario key (baseline|optimistic|pessimistic|custom)
  label: string; // human label
  kind?: 'baseline' | 'optimistic' | 'pessimistic' | 'custom';
  confidence?: number; // 0-1 subjective confidence rating
  assumptions?: string[]; // free-form assumption notes
}
export interface ForecastScenario extends ForecastScenarioMeta { series: ForecastPoint[]; }

export interface FinanceAnomaly {
  id: string;
  type: 'expense-spike' | 'income-drop';
  date: string;
  amount: number;
  category?: string;
  note?: string;
}

export interface FinanceSnapshot {
  generatedAt: string;
  period: { month: number; year: number };
  kpis: KPISet;
  shows: FinanceShowSummary[];
  expenses: FinanceExpense[];
  forecasts: ForecastScenario[];
  anomalies?: FinanceAnomaly[];
  selectedScenarioId?: string; // active scenario for UI overlays
}

export interface FinanceCoreApi {
  snapshot: FinanceSnapshot | null;
  refresh(): Promise<void>;
  getShow(id: string): FinanceShowSummary | undefined;
  getMonthSeries(monthsBack?: number): Array<{ month: string; income: number; expenses: number; net: number }>;
  setScenario?(id: string): void;
  listScenarios?(): { id: string; label: string }[];
}
