// Professional finance data types for tour management
// Replaces scattered legacy finance types with unified, production-ready interfaces

export type CurrencyCode = 'EUR' | 'USD' | 'GBP' | 'JPY' | 'CAD' | 'AUD' | 'CHF' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF';

export type ExpenseCategory = 
  | 'travel-flights'
  | 'travel-ground'
  | 'accommodation'
  | 'production-sound'
  | 'production-lights' 
  | 'production-stage'
  | 'crew-fees'
  | 'crew-per-diem'
  | 'marketing-promotion'
  | 'marketing-digital'
  | 'merchandise'
  | 'catering'
  | 'insurance'
  | 'visas-permits'
  | 'equipment-rental'
  | 'transportation-freight'
  | 'venue-expenses'
  | 'admin-fees'
  | 'other';

export type TransactionStatus = 'draft' | 'pending' | 'paid' | 'overdue' | 'cancelled' | 'disputed';

export type SplitBasis = 'gross' | 'net' | 'after-expenses';

export interface Money {
  /** Amount in the specified currency */
  amount: number;
  /** Currency code */
  currency: CurrencyCode;
  /** Exchange rate used for conversion (if applicable) */
  exchangeRate?: number;
  /** Amount converted to base currency (EUR for this app) */
  baseCurrencyAmount: number;
  /** Timestamp when exchange rate was captured */
  exchangeRateDate?: Date;
}

export interface TaxDetails {
  /** Withholding tax rate (0.0 to 1.0) */
  whtRate?: number;
  /** VAT/Sales tax rate (0.0 to 1.0) */
  vatRate?: number;
  /** Amount after withholding tax */
  netOfWHT: number;
  /** Withholding tax amount */
  whtAmount: number;
  /** VAT amount (if applicable) */
  vatAmount?: number;
  /** Tax country code */
  taxCountry?: string;
  /** Tax registration details */
  taxId?: string;
}

export interface FinancialEntity {
  id: string;
  organizationId: string;
  /** Related show ID (if expense/income is show-specific) */
  showId?: string;
  /** Transaction date */
  date: Date;
  /** Amount with currency information */
  amount: Money;
  /** Expense/income category */
  category: ExpenseCategory;
  /** Vendor/payer name */
  vendor?: string;
  /** Transaction description */
  description: string;
  /** Payment status */
  status: TransactionStatus;
  /** File attachments (receipts, contracts, etc.) */
  attachments?: string[];
  /** Tax calculation details */
  taxInfo?: TaxDetails;
  /** Reference number (invoice, receipt, etc.) */
  reference?: string;
  /** Payment method */
  paymentMethod?: string;
  /** Settlement information */
  settlementId?: string;
  /** Tags for additional categorization */
  tags?: string[];
  /** Automatically categorized flag */
  autoCategorizationConfidence?: number;
  /** User who created/modified */
  createdBy: string;
  updatedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SplitConfiguration {
  id: string;
  organizationId: string;
  name: string;
  /** Management fee configuration */
  managementFee: {
    percentage: number;
    basis: SplitBasis;
    capAmount?: number; // Maximum fee amount
  };
  /** Booking agency fee configuration */
  bookingFee: {
    percentage: number;
    basis: SplitBasis;
    capAmount?: number;
  };
  /** Artist split configuration */
  artistSplit: {
    percentage: number;
    afterExpenses: boolean;
  };
  /** Label recoupment (if applicable) */
  labelRecoup?: {
    amount: number;
    priority: number; // Payment priority order
    recoupFromMerch: boolean;
  };
  /** Tour advance recoupment */
  tourAdvance?: {
    totalAmount: number;
    remainingAmount: number;
    recoupmentRate: number; // Percentage of net to recoup
  };
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Settlement {
  id: string;
  showId: string;
  organizationId: string;
  /** Total show revenue breakdown */
  revenue: {
    guarantee: Money;
    ticketSales: Money;
    merchandise: Money;
    other: Money;
    total: Money;
  };
  /** Expense breakdown */
  expenses: {
    production: Money;
    travel: Money;
    crew: Money;
    marketing: Money;
    other: Money;
    total: Money;
  };
  /** Split calculations */
  splits: {
    management: Money;
    booking: Money;
    artist: Money;
    label?: Money;
    recoupment?: Money;
  };
  /** Tax calculations */
  taxes: TaxDetails;
  /** Net amount to artist after all deductions */
  netToArtist: Money;
  /** Payment schedule */
  paymentSchedule: Array<{
    recipient: 'artist' | 'management' | 'booking' | 'label';
    amount: Money;
    dueDate: Date;
    status: TransactionStatus;
    reference?: string;
  }>;
  /** Settlement status */
  status: 'draft' | 'pending-approval' | 'approved' | 'paid' | 'disputed';
  /** Settlement date */
  settlementDate: Date;
  /** Configuration used for this settlement */
  splitConfigId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CashflowProjection {
  id: string;
  organizationId: string;
  /** Projection period */
  startDate: Date;
  endDate: Date;
  /** Monthly cashflow forecast */
  monthlyProjections: Array<{
    month: Date;
    projectedIncome: Money;
    projectedExpenses: Money;
    netCashflow: Money;
    confidence: number; // 0.0 to 1.0
    scenarios: {
      optimistic: Money;
      realistic: Money;
      pessimistic: Money;
    };
  }>;
  /** Key assumptions used in projection */
  assumptions: {
    averageShowFee: Money;
    showsPerMonth: number;
    expenseRatio: number; // Expenses as % of revenue
    seasonalityFactors: Record<string, number>;
  };
  /** Risk factors identified */
  risks: Array<{
    description: string;
    impact: 'low' | 'medium' | 'high';
    probability: number;
    mitigation?: string;
  }>;
  lastUpdated: Date;
  createdBy: string;
}

export interface BudgetTemplate {
  id: string;
  organizationId: string;
  name: string;
  /** Tour type this template is for */
  tourType: 'club' | 'festival' | 'arena' | 'stadium' | 'private';
  /** Geographic markets */
  markets: string[];
  /** Budget categories with typical amounts */
  categories: Record<ExpenseCategory, {
    budgetAmount: Money;
    variance: number; // Typical +/- variance
    notes?: string;
  }>;
  /** Historical performance of this template */
  performance: {
    timesUsed: number;
    averageVariance: number;
    successRate: number; // % of time under budget
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface FinancialAlert {
  id: string;
  organizationId: string;
  type: 'budget-variance' | 'payment-overdue' | 'forecast-risk' | 'expense-anomaly' | 'opportunity';
  severity: 'info' | 'warning' | 'critical';
  title: string;
  description: string;
  /** Related entity IDs */
  relatedIds?: {
    showId?: string;
    expenseId?: string;
    settlementId?: string;
  };
  /** Suggested actions */
  suggestions?: string[];
  /** Alert triggers */
  triggers: {
    condition: string;
    threshold?: number;
    metric?: string;
  };
  isRead: boolean;
  isActionable: boolean;
  createdAt: Date;
  dismissedAt?: Date;
}

// Utility types for common calculations
export interface ShowFinancialSummary {
  showId: string;
  totalRevenue: Money;
  totalExpenses: Money;
  grossProfit: Money;
  netProfit: Money;
  profitMargin: number;
  roi: number; // Return on investment
  expenseBreakdown: Record<ExpenseCategory, Money>;
  compareToAverage: {
    revenueVariance: number;
    expenseVariance: number;
    profitVariance: number;
  };
}

export interface TourFinancialSummary {
  tourId: string;
  totalShows: number;
  totalRevenue: Money;
  totalExpenses: Money;
  avgRevenuePerShow: Money;
  avgExpensesPerShow: Money;
  bestPerformingShow: {
    showId: string;
    profit: Money;
  };
  worstPerformingShow: {
    showId: string;
    profit: Money;
  };
  profitability: {
    gross: Money;
    net: Money;
    margin: number;
  };
  cashflowTiming: {
    advancesReceived: Money;
    settlementsOwed: Money;
    netCashPosition: Money;
  };
}

// Validation and helper types
export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ExchangeRate {
  from: CurrencyCode;
  to: CurrencyCode;
  rate: number;
  date: Date;
  source: string;
}

export interface CurrencyPreferences {
  baseCurrency: CurrencyCode;
  displayCurrencies: CurrencyCode[];
  autoConversion: boolean;
  rateUpdateFrequency: 'realtime' | 'daily' | 'manual';
}
