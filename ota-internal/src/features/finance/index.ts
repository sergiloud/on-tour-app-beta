// Finance Feature Barrel Export
// Central entry point for all finance-related exports.
// Import from here to avoid deep paths and enable tree-shaking.

export { FinanceCoreProvider, useFinanceCore, useFinanceChartSeries } from './core/finance-core';
export { buildSnapshot } from './core/build-snapshot';
export { selectKpiTrend, selectExpenseByCategory, selectMonthlySeries, validateSnapshot, selectActiveScenario, selectAnomalySummary, selectProfitabilityTimeline } from './core/finance-selectors';
export { generateForecastScenarios, selectScenario } from './core/forecasting-engine';
export { startFinanceRealtime, stopFinanceRealtime, onFinanceSnapshot, getCurrentFinanceSnapshot } from './core/finance-realtime';
export type { FinanceSnapshot, FinanceExpense, FinanceShowSummary, KPISet, ForecastScenario, FinanceAnomaly, FinanceCoreApi } from './core/finance-types';

export { default as FinanceDashboard } from './components/FinanceDashboard';
export { default as ExecutiveSummary } from './components/ExecutiveSummary';
export { default as TransactionsTable } from './components/TransactionsTable';
export { default as ProfitabilityTimeline } from './components/ProfitabilityTimeline';
export { ChartSkeleton, TableSkeleton, KpiSkeletonRow } from './components/Skeletons';

// Deprecated (for migration)
export * from './ui/finance-ui';
