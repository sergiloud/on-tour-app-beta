/**
 * Pure Finance Calculation Functions (Legacy Import)
 *
 * REFINE-003: This file now acts as a compatibility layer
 * All functions have been moved to modular files in ./calculations/
 *
 * For new code, prefer importing directly from:
 * - import { calculateGrossIncome } from '@/features/finance/calculations/income'
 * - import { calculateCommissions } from '@/features/finance/calculations/commissions'
 * - etc.
 *
 * This file will be deprecated in v5.2.0
 */

// Re-export everything from the modular structure for backward compatibility
export { FinanceCalc, default } from './calculations/index';
export type { Cost } from './calculations/costs';
