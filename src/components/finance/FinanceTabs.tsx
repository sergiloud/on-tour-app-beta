/**
 * FinanceTabs - Bundle consolidado de todos los tabs de Finance
 * 
 * OPTIMIZACIÓN DE RENDIMIENTO:
 * En lugar de lazy-load individual por tab (4 network requests), este archivo
 * agrupa todos los tabs en un solo bundle. Esto elimina delays de navegación
 * entre tabs, mejorando la UX dramáticamente.
 * 
 * TRADE-OFF:
 * - Bundle inicial ~20-30KB más grande
 * - Navegación entre tabs instantánea (0ms delay vs 200-500ms)
 * - Justificado porque Finance es módulo core y usuarios navegan entre tabs frecuentemente
 */

// Re-export todos los tabs desde un solo punto
export { default as DashboardTab } from './DashboardTab';
export { default as TransactionsTab } from './TransactionsTab';
export { default as BudgetsTab } from './BudgetsTab';
export { default as ProjectionsTab } from './ProjectionsTab';
