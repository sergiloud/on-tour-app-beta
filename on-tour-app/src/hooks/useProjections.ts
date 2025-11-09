/**
 * useProjections Hook - Predictive Financial Analytics
 *
 * Calcula proyecciones financieras basadas en datos históricos usando:
 * - Moving Average (promedio móvil)
 * - Linear Regression (tendencia)
 * - Seasonal patterns (patrones estacionales)
 *
 * ALGORITMOS:
 * 1. Moving Average: Suaviza fluctuaciones y revela tendencias
 * 2. Linear Trend: Predice crecimiento/decrecimiento futuro
 * 3. What-If Simulator: Proyecciones con escenarios modificados
 *
 * USO:
 * const { projections, forecast, whatIf } = useProjections(transactions);
 * const optimisticScenario = whatIf({ incomeGrowth: 0.15 });
 */

import { useMemo } from 'react';
import type { TransactionV3 } from '../types/financeV3';
import { startOfMonth, endOfMonth, addMonths, format, parseISO } from 'date-fns';

/**
 * Datos históricos mensuales agregados
 */
export interface MonthlyData {
  /** Mes en formato YYYY-MM */
  month: string;
  /** Ingresos del mes */
  income: number;
  /** Gastos del mes */
  expenses: number;
  /** Balance neto */
  balance: number;
  /** Número de transacciones */
  transactionCount: number;
}

/**
 * Punto de proyección futura
 */
export interface ProjectionPoint {
  /** Mes proyectado (YYYY-MM) */
  month: string;
  /** Ingreso proyectado */
  projectedIncome: number;
  /** Gasto proyectado */
  projectedExpenses: number;
  /** Balance proyectado */
  projectedBalance: number;
  /** Nivel de confianza (0-1) */
  confidence: number;
}

/**
 * Escenario "What If"
 */
export interface WhatIfScenario {
  /** Crecimiento mensual de ingresos (0.1 = +10%) */
  incomeGrowth?: number;
  /** Reducción mensual de gastos (-0.1 = -10%) */
  expenseReduction?: number;
  /** Número de meses a proyectar */
  months?: number;
}

/**
 * Resultado del análisis de proyecciones
 */
export interface ProjectionsAnalysis {
  /** Datos históricos mensuales */
  historical: MonthlyData[];
  /** Proyecciones futuras (3-12 meses) */
  forecast: ProjectionPoint[];
  /** Tendencia de ingresos (€/mes) */
  incomeTrend: number;
  /** Tendencia de gastos (€/mes) */
  expensesTrend: number;
  /** Promedio móvil de ingresos (últimos 3 meses) */
  incomeMovingAvg: number;
  /** Promedio móvil de gastos (últimos 3 meses) */
  expensesMovingAvg: number;
  /** Función para simular escenarios */
  whatIf: (scenario: WhatIfScenario) => ProjectionPoint[];
}

/**
 * Hook para calcular proyecciones financieras
 */
export function useProjections(
  transactions: readonly TransactionV3[],
  forecastMonths: number = 6
): ProjectionsAnalysis {
  return useMemo(() => {
    // ========================================================================
    // PASO 1: Agrupar transacciones por mes
    // ========================================================================
    const monthlyMap = new Map<string, MonthlyData>();

    for (const t of transactions) {
      if (t.status !== 'paid') continue; // Solo transacciones completadas

      const date = parseISO(t.date);
      const monthKey = format(date, 'yyyy-MM');

      if (!monthlyMap.has(monthKey)) {
        monthlyMap.set(monthKey, {
          month: monthKey,
          income: 0,
          expenses: 0,
          balance: 0,
          transactionCount: 0,
        });
      }

      const monthData = monthlyMap.get(monthKey)!;
      monthData.transactionCount++;

      if (t.type === 'income') {
        monthData.income += t.amount;
      } else {
        monthData.expenses += t.amount;
      }

      monthData.balance = monthData.income - monthData.expenses;
    }

    // Convertir a array y ordenar cronológicamente
    const historical = Array.from(monthlyMap.values()).sort((a, b) =>
      a.month.localeCompare(b.month)
    );

    // Si no hay datos históricos, retornar valores por defecto
    if (historical.length === 0) {
      return {
        historical: [],
        forecast: [],
        incomeTrend: 0,
        expensesTrend: 0,
        incomeMovingAvg: 0,
        expensesMovingAvg: 0,
        whatIf: () => [],
      };
    }

    // ========================================================================
    // PASO 2: Calcular Moving Average (últimos 3 meses)
    // ========================================================================
    const recentMonths = historical.slice(-3);
    const incomeMovingAvg =
      recentMonths.reduce((sum, m) => sum + m.income, 0) / recentMonths.length;
    const expensesMovingAvg =
      recentMonths.reduce((sum, m) => sum + m.expenses, 0) / recentMonths.length;

    // ========================================================================
    // PASO 3: Calcular Linear Trend (regresión lineal simple)
    // ========================================================================
    const { incomeTrend, expensesTrend } = calculateLinearTrend(historical);

    // ========================================================================
    // PASO 4: Generar proyecciones futuras
    // ========================================================================
    const lastMonthData = historical[historical.length - 1];
    if (!lastMonthData) {
      return {
        historical: [],
        forecast: [],
        incomeTrend: 0,
        expensesTrend: 0,
        incomeMovingAvg: 0,
        expensesMovingAvg: 0,
        whatIf: () => [],
      };
    }

    const lastMonth = parseISO(lastMonthData.month + '-01');
    const forecast: ProjectionPoint[] = [];

    for (let i = 1; i <= forecastMonths; i++) {
      const projectedMonth = addMonths(lastMonth, i);
      const monthKey = format(projectedMonth, 'yyyy-MM');

      // Proyección usando tendencia lineal + moving average
      const projectedIncome = incomeMovingAvg + incomeTrend * i;
      const projectedExpenses = expensesMovingAvg + expensesTrend * i;

      // Confianza disminuye con el tiempo (100% → 50% en 6 meses)
      const confidence = Math.max(0.5, 1 - i * 0.08);

      forecast.push({
        month: monthKey,
        projectedIncome: Math.max(0, projectedIncome),
        projectedExpenses: Math.max(0, projectedExpenses),
        projectedBalance: projectedIncome - projectedExpenses,
        confidence,
      });
    }

    // ========================================================================
    // PASO 5: Función "What If" para escenarios personalizados
    // ========================================================================
    const whatIf = (scenario: WhatIfScenario): ProjectionPoint[] => {
      const {
        incomeGrowth = 0,
        expenseReduction = 0,
        months = forecastMonths,
      } = scenario;

      const customForecast: ProjectionPoint[] = [];

      for (let i = 1; i <= months; i++) {
        const projectedMonth = addMonths(lastMonth, i);
        const monthKey = format(projectedMonth, 'yyyy-MM');

        // Aplicar crecimiento compuesto
        const growthFactor = Math.pow(1 + incomeGrowth, i);
        const reductionFactor = Math.pow(1 + expenseReduction, i);

        const projectedIncome = (incomeMovingAvg + incomeTrend * i) * growthFactor;
        const projectedExpenses = (expensesMovingAvg + expensesTrend * i) * reductionFactor;

        const confidence = Math.max(0.3, 1 - i * 0.1); // Menor confianza en escenarios

        customForecast.push({
          month: monthKey,
          projectedIncome: Math.max(0, projectedIncome),
          projectedExpenses: Math.max(0, projectedExpenses),
          projectedBalance: projectedIncome - projectedExpenses,
          confidence,
        });
      }

      return customForecast;
    };

    return {
      historical,
      forecast,
      incomeTrend,
      expensesTrend,
      incomeMovingAvg,
      expensesMovingAvg,
      whatIf,
    };
  }, [transactions, forecastMonths]);
}

/**
 * Calcula tendencia lineal usando regresión lineal simple
 * Fórmula: y = mx + b
 * Donde m (pendiente) representa la tendencia €/mes
 */
function calculateLinearTrend(data: MonthlyData[]): {
  incomeTrend: number;
  expensesTrend: number;
} {
  if (data.length < 2) {
    return { incomeTrend: 0, expensesTrend: 0 };
  }

  const n = data.length;

  // Crear índices numéricos para los meses (0, 1, 2, ...)
  const x = Array.from({ length: n }, (_, i) => i);
  const yIncome = data.map(d => d.income);
  const yExpenses = data.map(d => d.expenses);

  // Calcular tendencia de ingresos
  const incomeTrend = calculateSlope(x, yIncome);

  // Calcular tendencia de gastos
  const expensesTrend = calculateSlope(x, yExpenses);

  return { incomeTrend, expensesTrend };
}

/**
 * Calcula la pendiente (slope) de una regresión lineal
 * Fórmula: m = (n·Σ(xy) - Σx·Σy) / (n·Σ(x²) - (Σx)²)
 */
function calculateSlope(x: number[], y: number[]): number {
  const n = x.length;
  if (n === 0) return 0;

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * (y[i] ?? 0), 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);

  const numerator = n * sumXY - sumX * sumY;
  const denominator = n * sumX2 - sumX * sumX;

  if (denominator === 0) return 0;

  return numerator / denominator;
}

/**
 * Exporta proyecciones a CSV
 */
export function exportProjectionsToCSV(
  historical: MonthlyData[],
  forecast: ProjectionPoint[],
  filename: string = 'financial-projections.csv'
): void {
  const rows: string[] = [];

  // Header
  rows.push('Mes,Tipo,Ingresos,Gastos,Balance,Confianza');

  // Historical data
  for (const h of historical) {
    rows.push(
      `${h.month},Histórico,${h.income.toFixed(2)},${h.expenses.toFixed(2)},${h.balance.toFixed(2)},1.00`
    );
  }

  // Forecast data
  for (const f of forecast) {
    rows.push(
      `${f.month},Proyección,${f.projectedIncome.toFixed(2)},${f.projectedExpenses.toFixed(2)},${f.projectedBalance.toFixed(2)},${f.confidence.toFixed(2)}`
    );
  }

  // Create and download CSV
  const csvContent = rows.join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
