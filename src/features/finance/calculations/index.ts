/**
 * Finance Calculations - Central Index
 * REFINE-003: Modular organization of finance calculations
 *
 * Exports all calculation functions from specialized modules:
 * - income.ts: Gross income, run rates
 * - commissions.ts: Commission calculations
 * - taxes.ts: Withholding tax (WHT)
 * - costs.ts: Cost aggregation, net income
 * - analysis.ts: Settlement, statistics, aggregations, etc.
 */

// Import all functions from specialized modules
import * as IncomeModule from './income';
import * as CommissionsModule from './commissions';
import * as TaxesModule from './taxes';
import * as CostsModule from './costs';
import * as AnalysisModule from './analysis';

// Re-export everything for backward compatibility
export * from './income';
export * from './commissions';
export * from './taxes';
export * from './costs';
export * from './analysis';

// Also export a namespace for existing code that uses FinanceCalc.method()
export const FinanceCalc = {
  // Income
  calculateGrossIncome: IncomeModule.calculateGrossIncome,
  roundCurrency: IncomeModule.roundCurrency,
  calculateMonthlyRunRate: IncomeModule.calculateMonthlyRunRate,

  // Commissions
  calculateCommissions: CommissionsModule.calculateCommissions,

  // Taxes
  calculateWHT: TaxesModule.calculateWHT,

  // Costs
  calculateTotalCosts: CostsModule.calculateTotalCosts,
  calculateNet: CostsModule.calculateNet,

  // Analysis
  settleShow: AnalysisModule.settleShow,
  detectConflict: AnalysisModule.detectConflict,
  resolveConflict: AnalysisModule.resolveConflict,
  formatCurrency: AnalysisModule.formatCurrency,
  convertCurrency: AnalysisModule.convertCurrency,
  calculateMarginPct: AnalysisModule.calculateMarginPct,
  calculateBreakeven: AnalysisModule.calculateBreakeven,
  aggregateByCountry: AnalysisModule.aggregateByCountry,
  aggregateByRoute: AnalysisModule.aggregateByRoute,
  aggregateByVenue: AnalysisModule.aggregateByVenue,
  calculateStatistics: AnalysisModule.calculateStatistics,
  calculateVariance: AnalysisModule.calculateVariance,
  validateShowFinancialData: AnalysisModule.validateShowFinancialData,
};

export default FinanceCalc;
