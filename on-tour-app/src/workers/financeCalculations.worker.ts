/**
 * Web Worker para cálculos financieros pesados
 *
 * ESTRATEGIA SIMPLIFICADA:
 * Este worker ejecuta los mismos cálculos que useFinanceData pero en un hilo separado.
 * No duplicamos lógica compleja, sino que importamos las mismas funciones helper.
 *
 * Beneficios:
 * - Ejecuta en hilo separado sin bloquear la UI
 * - Mantiene la app fluida con 10,000+ transacciones
 * - Reutiliza lógica existente (DRY principle)
 * - Percepción de velocidad mejorada
 *
 * Cálculos delegados:
 * - profitabilityAnalysis (análisis completo de rentabilidad)
 * - categoryData (agregación por categoría)
 * - expensesByCategory (análisis de gastos)
 */

import { calculateProfitabilityAnalysis } from '../lib/profitabilityHelpers';
import type { TransactionV3 } from '../types/financeV3';
import type {
  CategoryDataPoint,
  ExpensesByCategoryDataPoint,
} from '../hooks/useFinanceData';

// Categorías de gastos (duplicado necesario en worker)
const EXPENSE_CATEGORIES = [
  'Alojamiento',
  'Transporte',
  'Dietas',
  'Producción',
  'Marketing',
  'Personal',
  'Logística',
  'Otros'
];

export interface WorkerInput {
  transactions: readonly TransactionV3[];
}

export interface WorkerOutput {
  profitabilityAnalysis: ReturnType<typeof calculateProfitabilityAnalysis>;
  categoryData: CategoryDataPoint[];
  expensesByCategory: ExpensesByCategoryDataPoint[];
  computationTime: number; // Para monitoring de performance
  error?: string; // For error reporting
}

/**
 * Safe validator for transaction data
 */
function isValidTransaction(t: unknown): t is TransactionV3 {
  if (!t || typeof t !== 'object') return false;
  const tx = t as Partial<TransactionV3>;
  return (
    typeof tx.id === 'string' &&
    typeof tx.amount === 'number' &&
    !isNaN(tx.amount) &&
    (tx.type === 'income' || tx.type === 'expense')
  );
}

/**
 * Agrupa gastos por categoría para gráficos de pie/donut
 * Optimized with Map instead of object for better performance
 * Enhanced with error handling and validation
 */
function calculateCategoryData(transactions: readonly TransactionV3[]): CategoryDataPoint[] {
  try {
    const categoryMap = new Map<string, number>();

    // Optimized with for...of and single filter+forEach
    for (const t of transactions) {
      if (!isValidTransaction(t)) continue;

      if (t.type === 'expense' && t.status === 'paid') {
        const amount = Math.abs(t.amount); // Ensure positive values
        categoryMap.set(t.category, (categoryMap.get(t.category) || 0) + amount);
      }
    }

    // Convert to array and sort in single pass
    return Array.from(categoryMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('[Worker] Error calculating category data:', error);
    return [];
  }
}

/**
 * Calcula gastos por categoría estándar
 * Optimized with direct object access instead of array methods
 * Enhanced with error handling and validation
 */
function calculateExpensesByCategory(transactions: readonly TransactionV3[]): ExpensesByCategoryDataPoint[] {
  try {
    const categoryMap: Record<string, number> = {};

    // Inicializar todas las categorías en 0
    for (const cat of EXPENSE_CATEGORIES) {
      categoryMap[cat] = 0;
    }

    // Sumar gastos - optimized with for...of and direct property access
    for (const t of transactions) {
      if (!isValidTransaction(t)) continue;

      if (t.type === 'expense' && t.status === 'paid') {
        const amount = Math.abs(t.amount); // Ensure positive values
        const current = categoryMap[t.category];
        if (current !== undefined) {
          categoryMap[t.category] = current + amount;
        }
      }
    }

    return Object.entries(categoryMap).map(([category, amount]) => ({
      category,
      amount,
    }));
  } catch (error) {
    console.error('[Worker] Error calculating expenses by category:', error);
    return EXPENSE_CATEGORIES.map(cat => ({ category: cat, amount: 0 }));
  }
}

/**
 * Función principal del worker - Realiza todos los cálculos pesados
 * Optimized with early exit and memoization
 * Enhanced with comprehensive error handling
 */
self.onmessage = (event: MessageEvent<WorkerInput>) => {
  const startTime = performance.now();

  try {
    const { transactions } = event.data;

    // Validate input data
    if (!transactions || !Array.isArray(transactions)) {
      throw new Error('Invalid transactions data: expected array');
    }

    // Create empty profitability analysis for fallback
    const emptyProfitability: ReturnType<typeof calculateProfitabilityAnalysis> = {
      grossIncome: 0,
      totalCommissions: 0,
      totalWHT: 0,
      netIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      grossMargin: 0,
      netMargin: 0,
      commissionsBreakdown: {
        total: 0,
        byCommissioner: []
      },
      financialDistribution: {
        totalCommissions: 0,
        commissions: [],
        totalWHT: 0,
        totalExpenses: 0,
        expensesByCategory: [],
        expensesByType: [],
        netIncome: 0
      }
    };

    // Early exit if no transactions
    if (transactions.length === 0) {
      self.postMessage({
        profitabilityAnalysis: emptyProfitability,
        categoryData: [],
        expensesByCategory: EXPENSE_CATEGORIES.map(category => ({ category, amount: 0 })),
        computationTime: performance.now() - startTime,
      });
      return;
    }

    // Filter valid transactions only
    const validTransactions = transactions.filter(isValidTransaction);

    if (validTransactions.length === 0) {
      console.warn('[Worker] No valid transactions found');
    }

    // Ejecutar cálculos pesados en paralelo cuando sea posible
    // Convertir a mutable array para funciones helper que esperan TransactionV3[]
    const mutableTransactions = [...validTransactions];

    // Calculate sequentially with error handling for each step
    let profitabilityAnalysis = emptyProfitability;
    let categoryData: CategoryDataPoint[] = [];
    let expensesByCategory: ExpensesByCategoryDataPoint[] = [];

    try {
      profitabilityAnalysis = calculateProfitabilityAnalysis(mutableTransactions);
    } catch (error) {
      console.error('[Worker] Error in profitability analysis:', error);
    }

    try {
      categoryData = calculateCategoryData(validTransactions);
    } catch (error) {
      console.error('[Worker] Error in category data:', error);
    }

    try {
      expensesByCategory = calculateExpensesByCategory(validTransactions);
    } catch (error) {
      console.error('[Worker] Error in expenses by category:', error);
      expensesByCategory = EXPENSE_CATEGORIES.map(cat => ({ category: cat, amount: 0 }));
    }

    const computationTime = performance.now() - startTime;

    const result: WorkerOutput = {
      profitabilityAnalysis,
      categoryData,
      expensesByCategory,
      computationTime,
    };

    // Enviar resultados de vuelta al hilo principal
    self.postMessage(result);

  } catch (error) {
    console.error('[Worker] Fatal error:', error);
    // Enviar error al hilo principal with valid structure
    const errorResult: WorkerOutput = {
      profitabilityAnalysis: {
        grossIncome: 0,
        totalCommissions: 0,
        totalWHT: 0,
        netIncome: 0,
        totalExpenses: 0,
        netProfit: 0,
        grossMargin: 0,
        netMargin: 0,
        commissionsBreakdown: {
          total: 0,
          byCommissioner: []
        },
        financialDistribution: {
          totalCommissions: 0,
          commissions: [],
          totalWHT: 0,
          totalExpenses: 0,
          expensesByCategory: [],
          expensesByType: [],
          netIncome: 0
        }
      },
      categoryData: [],
      expensesByCategory: EXPENSE_CATEGORIES.map(category => ({ category, amount: 0 })),
      computationTime: performance.now() - startTime,
      error: error instanceof Error ? error.message : 'Unknown worker error',
    };
    self.postMessage(errorResult);
  }
};

// Handle worker errors
self.onerror = (error) => {
  console.error('[Worker] Unhandled error:', error);
  return true; // Prevent default error handling
};

// Confirmar que el worker está listo
self.postMessage({ type: 'ready' });
