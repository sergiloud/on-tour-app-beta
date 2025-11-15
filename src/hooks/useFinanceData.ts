import { useMemo, useCallback } from 'react';
import type { TransactionV3 } from '../types/financeV3';
import { calculateProfitabilityAnalysis } from '../lib/profitabilityHelpers';
import { determineGroupingMode, groupTransactionsByPeriod, calculateAccumulatedBudget } from '../lib/financeHelpers';
import { useFinanceTargets } from '../context/FinanceTargetsContext';
import Papa from 'papaparse';

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface FinanceTargets {
  yearNet: number;
  pending: number;
  expensesMonth: number;
  netMonth: number;
  incomeMonth: number;
  costsMonth: number;
}

export interface PeriodKPIs {
  income: number;
  expenses: number;
  balance: number;
  pending: number;
  invoiceTotal?: number; // Total facturado (Income + VAT)
  totalVAT?: number; // Total VAT acumulado
}

export interface ComparisonKPIs {
  income: {
    current: number;
    comparison: number;
    delta: number;
    deltaPercent: number;
  };
  expenses: {
    current: number;
    comparison: number;
    delta: number;
    deltaPercent: number;
  };
  balance: {
    current: number;
    comparison: number;
    delta: number;
    deltaPercent: number;
  };
  pending: {
    current: number;
    comparison: number;
    delta: number;
    deltaPercent: number;
  };
}

export interface IncomeVsExpensesDataPoint {
  month: string;
  ingresos: number;
  gastos: number;
  neto: number;
  // Datos de comparación opcionales
  ingresosComparacion?: number;
  gastosComparacion?: number;
  netoComparacion?: number;
}

export interface BudgetVsRealDataPoint {
  fecha: string;
  presupuesto: number;
  real: number;
  diferencia: number;
}

export interface CategoryDataPoint {
  name: string;
  value: number;
}

export interface ExpensesByCategoryDataPoint {
  category: string;
  amount: number;
}

export interface BudgetCategory {
  category: string;
  budget: number;
  spent: number;
  percentage: number;
}

// Categorías de gastos estándar
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

/**
 * Tipo de retorno explícito del hook useFinanceData
 *
 * Beneficios:
 * - Autocompletado mejorado en el editor
 * - Contrato claro de lo que el hook provee
 * - Readonly previene mutaciones accidentales
 * - Facilita refactoring y mantenimiento
 */
export interface UseFinanceDataReturn {
  // Transacciones filtradas por período (solo lectura)
  readonly filteredTransactionsV3: readonly TransactionV3[];

  // Análisis de rentabilidad completo
  readonly profitabilityAnalysis: ReturnType<typeof calculateProfitabilityAnalysis>;

  // KPIs del período
  readonly periodKPIs: Readonly<PeriodKPIs>;

  // KPIs de comparación (solo cuando hay período de comparación activo)
  readonly comparisonKPIs: Readonly<ComparisonKPIs> | null;

  // Datos para gráficos (solo lectura para prevenir mutaciones)
  readonly incomeVsExpensesData: readonly IncomeVsExpensesDataPoint[];
  readonly budgetVsRealData: readonly BudgetVsRealDataPoint[];
  readonly categoryData: readonly CategoryDataPoint[];
  readonly expensesByCategory: readonly ExpensesByCategoryDataPoint[];

  // Datos para presupuestos
  readonly budgetCategories: readonly BudgetCategory[];

  // Operaciones sobre los datos
  readonly exportToCSV: () => void;
}

/**
 * Custom hook que centraliza todos los cálculos derivados del módulo de finanzas
 *
 * ARQUITECTURA MEJORADA:
 * - Obtiene targets del contexto (desacoplamiento total)
 * - Recibe solo datos esenciales como parámetros
 * - Cachea todos los cálculos con useMemo
 *
 * Ventajas:
 * - Separa la lógica de negocio de la presentación
 * - Reutilizable en diferentes componentes
 * - Testeable de forma aislada
 * - Optimizado para performance
 * - Tipo de retorno explícito para mejor DX
 * - No depende de props para configuración (usa contexto)
 */
export function useFinanceData(
  transactionsV3: TransactionV3[],
  dateRange: DateRange,
  isInPeriod: (date: string) => boolean,
  selectedPeriod: string,  // Para nombre de archivo de exportación
  comparisonPeriodChecker?: (date: string) => boolean  // Opcional: para comparación
): UseFinanceDataReturn {
  // Obtener targets del contexto (configuración centralizada)
  const { targets } = useFinanceTargets();

  // Filtrar transacciones por período
  const filteredTransactionsV3 = useMemo(() => {
    return transactionsV3.filter(t => isInPeriod(t.date));
  }, [transactionsV3, isInPeriod]);

  // Análisis de rentabilidad completo (waterfall, distribución, etc.)
  const profitabilityAnalysis = useMemo(() => {
    return calculateProfitabilityAnalysis(filteredTransactionsV3);
  }, [filteredTransactionsV3]);

  // KPIs del período actual
  const periodKPIs = useMemo<PeriodKPIs>(() => {
    const income = filteredTransactionsV3
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = filteredTransactionsV3
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const pending = filteredTransactionsV3
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

    // Calcular totales de VAT e Invoice
    const totalVAT = filteredTransactionsV3
      .filter(t => t.type === 'income' && t.status === 'paid' && t.incomeDetail?.vat)
      .reduce((sum, t) => sum + (t.incomeDetail!.vat!.amount || 0), 0);

    const invoiceTotal = filteredTransactionsV3
      .filter(t => t.type === 'income' && t.status === 'paid' && t.incomeDetail?.invoiceTotal)
      .reduce((sum, t) => sum + (t.incomeDetail!.invoiceTotal || t.incomeDetail!.grossFee), 0);

    return {
      income,
      expenses,
      balance: income - expenses,
      pending,
      totalVAT,
      invoiceTotal: invoiceTotal > 0 ? invoiceTotal : undefined
    };
  }, [filteredTransactionsV3]);

  // KPIs de comparación (solo si hay período de comparación activo)
  const comparisonKPIs = useMemo<ComparisonKPIs | null>(() => {
    if (!comparisonPeriodChecker) return null;

    // Filtrar transacciones del período de comparación
    const comparisonTransactions = transactionsV3.filter(t => comparisonPeriodChecker(t.date));

    const compIncome = comparisonTransactions
      .filter(t => t.type === 'income' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const compExpenses = comparisonTransactions
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .reduce((sum, t) => sum + t.amount, 0);

    const compPending = comparisonTransactions
      .filter(t => t.status === 'pending')
      .reduce((sum, t) => sum + (t.type === 'income' ? t.amount : -t.amount), 0);

    const compBalance = compIncome - compExpenses;

    // Calcular deltas
    const calculateDelta = (current: number, comparison: number) => {
      const delta = current - comparison;
      const deltaPercent = comparison !== 0 ? (delta / comparison) * 100 : 0;
      return { current, comparison, delta, deltaPercent };
    };

    return {
      income: calculateDelta(periodKPIs.income, compIncome),
      expenses: calculateDelta(periodKPIs.expenses, compExpenses),
      balance: calculateDelta(periodKPIs.balance, compBalance),
      pending: calculateDelta(periodKPIs.pending, compPending)
    };
  }, [transactionsV3, comparisonPeriodChecker, periodKPIs]);

  // Datos para gráfico Ingresos vs Gastos (con agrupamiento dinámico)
  const incomeVsExpensesData = useMemo<IncomeVsExpensesDataPoint[]>(() => {
    const groupingMode = determineGroupingMode(dateRange.startDate, dateRange.endDate);
    const grouped = groupTransactionsByPeriod(
      filteredTransactionsV3,
      groupingMode,
      dateRange.startDate,
      dateRange.endDate
    );

    // Si hay comparación, también agrupar las transacciones del período de comparación
    let comparisonGrouped: typeof grouped = [];
    if (comparisonPeriodChecker) {
      const comparisonTransactions = transactionsV3.filter(t => comparisonPeriodChecker(t.date));
      // Usar el mismo groupingMode para mantener consistencia
      comparisonGrouped = groupTransactionsByPeriod(
        comparisonTransactions,
        groupingMode,
        dateRange.startDate, // Mantener mismo rango para alineación
        dateRange.endDate
      );
    }

    return grouped.map((g, index) => {
      const baseData = {
        month: g.label,
        ingresos: g.income,
        gastos: g.expenses,
        neto: g.net
      };

      // Añadir datos de comparación si existen
      if (comparisonGrouped.length > 0 && comparisonGrouped[index]) {
        return {
          ...baseData,
          ingresosComparacion: comparisonGrouped[index].income,
          gastosComparacion: comparisonGrouped[index].expenses,
          netoComparacion: comparisonGrouped[index].net
        };
      }

      return baseData;
    });
  }, [filteredTransactionsV3, dateRange, transactionsV3, comparisonPeriodChecker]);

  // Datos para gráfico Presupuesto vs Real
  const budgetVsRealData = useMemo<BudgetVsRealDataPoint[]>(() => {
    const totalBudget = targets.expensesMonth;
    const budgetPerDay = totalBudget / 30; // Asumiendo presupuesto mensual

    return calculateAccumulatedBudget(
      filteredTransactionsV3,
      budgetPerDay,
      dateRange.startDate,
      dateRange.endDate
    ).map(d => ({
      fecha: d.label,
      presupuesto: Math.round(d.budgetAcc),
      real: Math.round(d.realAcc),
      diferencia: Math.round(d.difference)
    }));
  }, [filteredTransactionsV3, dateRange, targets.expensesMonth]);

  // Datos para gráfico de categorías de gasto (pie chart)
  const categoryData = useMemo<CategoryDataPoint[]>(() => {
    const categoryTotals = new Map<string, number>();

    filteredTransactionsV3
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .forEach(t => {
        const current = categoryTotals.get(t.category) || 0;
        categoryTotals.set(t.category, current + t.amount);
      });

    return Array.from(categoryTotals.entries())
      .map(([category, value]) => ({ name: category, value }))
      .sort((a, b) => b.value - a.value);
  }, [filteredTransactionsV3]);

  // Gastos por categoría para distribución financiera
  const expensesByCategory = useMemo<ExpensesByCategoryDataPoint[]>(() => {
    const categoryMap = new Map<string, number>();

    filteredTransactionsV3
      .filter(t => t.type === 'expense' && t.status === 'paid')
      .forEach(t => {
        const current = categoryMap.get(t.category) || 0;
        categoryMap.set(t.category, current + t.amount);
      });

    return Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);
  }, [filteredTransactionsV3]);

  // Calcular categorías de presupuesto
  const budgetCategories = useMemo<BudgetCategory[]>(() => {
    return EXPENSE_CATEGORIES.map(cat => {
      const spent = categoryData.find(c => c.name === cat)?.value || 0;
      const budget = targets.expensesMonth / EXPENSE_CATEGORIES.length;
      return {
        category: cat,
        budget,
        spent,
        percentage: budget > 0 ? (spent / budget) * 100 : 0
      };
    });
  }, [categoryData, targets.expensesMonth]);

  // OPERACIÓN: Exportar transacciones a CSV
  const exportToCSV = useCallback(() => {
    const exportData = filteredTransactionsV3.map(t => ({
      Fecha: new Date(t.date).toLocaleDateString('es-ES'),
      Descripción: t.description,
      Categoría: t.category,
      Tipo: t.type === 'income' ? 'Ingreso' : 'Gasto',
      Importe: t.amount,
      'Fee Bruto': t.incomeDetail?.grossFee || '',
      'VAT %': t.incomeDetail?.vat?.percentage || '',
      'VAT Importe': t.incomeDetail?.vat?.amount || '',
      'Total Factura': t.incomeDetail?.invoiceTotal || '',
      Comisiones: t.incomeDetail?.commissions.reduce((sum, c) => sum + c.amount, 0) || '',
      'WHT %': t.incomeDetail?.withholdingTax?.percentage || '',
      'WHT Importe': t.incomeDetail?.withholdingTax?.amount || '',
      Estado: t.status === 'paid' ? 'Pagado' : 'Pendiente',
      Show: t.tripTitle || ''
    }));

    const csv = Papa.unparse(exportData);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `transacciones_${selectedPeriod}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  }, [filteredTransactionsV3, selectedPeriod]);

  return {
    // Transacciones filtradas
    filteredTransactionsV3,

    // Análisis de rentabilidad
    profitabilityAnalysis,

    // KPIs
    periodKPIs,
    comparisonKPIs,

    // Datos para gráficos
    incomeVsExpensesData,
    budgetVsRealData,
    categoryData,
    expensesByCategory,

    // Datos para presupuestos
    budgetCategories,

    // Operaciones sobre los datos
    exportToCSV,
  };
}
