/**
 * Finance V3 - Helpers para análisis de rentabilidad
 * Funciones para calcular comisiones, WHT y métricas de rentabilidad
 *
 * INTEGRACIÓN CON DATOS REALES:
 * - Usa FinanceShow con fee, whtPct, costs[], y agencias desde settings
 * - Calcula comisiones dinámicamente usando el sistema de agencias existente
 * - Compatible con datos existentes sin necesidad de migración
 */

import type {
  TransactionV3,
  ProfitabilityAnalysis,
  CommissionsBreakdown,
  FinancialDistribution,
  WaterfallDataPoint,
  Commission
} from '../types/financeV3';
import type { FinanceShow } from '../features/finance/types';
import { agenciesForShow, computeCommission } from './agencies';
import { loadSettings } from './persist';/**
 * Calcula el análisis completo de rentabilidad desde transacciones
 */
export function calculateProfitabilityAnalysis(
  transactions: TransactionV3[]
): ProfitabilityAnalysis {
  let grossIncome = 0;
  let totalCommissions = 0;
  let totalWHT = 0;
  let netIncome = 0;
  let totalExpenses = 0;

  const commissionsByName = new Map<string, { total: number; count: number }>();
  const expensesByCategory = new Map<string, { total: number; count: number }>();
  const expensesByType = new Map<string, { total: number; count: number }>();

  transactions.forEach(t => {
    if (t.type === 'income' && t.incomeDetail && t.status === 'paid') {
      const detail = t.incomeDetail;
      grossIncome += detail.grossFee;
      netIncome += detail.netIncome;

      // Agregar comisiones
      detail.commissions.forEach(c => {
        totalCommissions += c.amount;
        const existing = commissionsByName.get(c.name) || { total: 0, count: 0 };
        commissionsByName.set(c.name, {
          total: existing.total + c.amount,
          count: existing.count + 1
        });
      });

      // Agregar WHT
      if (detail.withholdingTax) {
        totalWHT += detail.withholdingTax.amount;
      }
    } else if (t.type === 'expense' && t.status === 'paid') {
      totalExpenses += t.amount;

      // Agrupar por categoría
      const category = t.category || 'Sin categoría';
      const existingCat = expensesByCategory.get(category) || { total: 0, count: 0 };
      expensesByCategory.set(category, {
        total: existingCat.total + t.amount,
        count: existingCat.count + 1
      });

      // Agrupar por tipo (si existe en metadata)
      const expenseType = (t as any).expenseType || (t as any).type || 'Otros';
      const existingType = expensesByType.get(expenseType) || { total: 0, count: 0 };
      expensesByType.set(expenseType, {
        total: existingType.total + t.amount,
        count: existingType.count + 1
      });
    }
  });

  const netProfit = netIncome - totalExpenses;
  const grossMargin = grossIncome > 0 ? (netProfit / grossIncome) * 100 : 0;
  const netMargin = netIncome > 0 ? (netProfit / netIncome) * 100 : 0;

  // Construir breakdown de comisiones
  const byCommissioner = Array.from(commissionsByName.entries())
    .map(([name, data]) => ({
      name,
      total: data.total,
      percentage: totalCommissions > 0 ? (data.total / totalCommissions) * 100 : 0,
      count: data.count
    }))
    .sort((a, b) => b.total - a.total);

  const commissionsBreakdown: CommissionsBreakdown = {
    total: totalCommissions,
    byCommissioner
  };

  // Construir distribución financiera completa
  const commissions = Array.from(commissionsByName.entries())
    .map(([name, data]) => ({
      name,
      amount: data.total,
      percentage: grossIncome > 0 ? (data.total / grossIncome) * 100 : 0,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount);

  const expensesByCat = Array.from(expensesByCategory.entries())
    .map(([category, data]) => ({
      category,
      amount: data.total,
      percentage: grossIncome > 0 ? (data.total / grossIncome) * 100 : 0,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount);

  const expensesByTyp = Array.from(expensesByType.entries())
    .map(([type, data]) => ({
      type,
      amount: data.total,
      percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
      count: data.count
    }))
    .sort((a, b) => b.amount - a.amount);

  const financialDistribution: FinancialDistribution = {
    totalCommissions,
    commissions,
    totalWHT,
    totalExpenses,
    expensesByCategory: expensesByCat,
    expensesByType: expensesByTyp,
    netIncome: netProfit
  };

  return {
    grossIncome,
    totalCommissions,
    totalWHT,
    netIncome,
    totalExpenses,
    netProfit,
    grossMargin,
    netMargin,
    commissionsBreakdown,
    financialDistribution
  };
}

/**
 * Genera datos para el Waterfall Chart
 */
export function generateWaterfallData(analysis: ProfitabilityAnalysis): WaterfallDataPoint[] {
  const data: WaterfallDataPoint[] = [];
  let current = 0;

  // 1. Ingreso Bruto (inicio)
  data.push({
    name: 'Ingreso Bruto',
    value: analysis.grossIncome,
    start: 0,
    end: analysis.grossIncome,
    type: 'positive'
  });
  current = analysis.grossIncome;

  // 2. Comisiones (resta)
  if (analysis.totalCommissions > 0) {
    data.push({
      name: 'Comisiones',
      value: -analysis.totalCommissions,
      start: current - analysis.totalCommissions,
      end: current,
      type: 'negative'
    });
    current -= analysis.totalCommissions;
  }

  // 3. WHT (resta)
  if (analysis.totalWHT > 0) {
    data.push({
      name: 'Retenciones (WHT)',
      value: -analysis.totalWHT,
      start: current - analysis.totalWHT,
      end: current,
      type: 'negative'
    });
    current -= analysis.totalWHT;
  }

  // 4. Ingreso Neto (subtotal)
  data.push({
    name: 'Ingreso Neto',
    value: analysis.netIncome,
    start: 0,
    end: analysis.netIncome,
    type: 'total'
  });

  // 5. Gastos (resta)
  if (analysis.totalExpenses > 0) {
    data.push({
      name: 'Gastos',
      value: -analysis.totalExpenses,
      start: current - analysis.totalExpenses,
      end: current,
      type: 'negative'
    });
    current -= analysis.totalExpenses;
  }

  // 6. Beneficio Neto (final)
  data.push({
    name: 'Beneficio Neto',
    value: analysis.netProfit,
    start: 0,
    end: analysis.netProfit,
    type: analysis.netProfit >= 0 ? 'positive' : 'negative'
  });

  return data;
}

/**
 * Calcula comisiones desde un show usando el sistema de agencias existente
 */
export function calculateCommissionsFromShow(
  show: FinanceShow
): Commission[] {
  const commissions: Commission[] = [];

  try {
    const settings = loadSettings() as any;
    const bookingAgencies = settings.bookingAgencies || [];
    const managementAgencies = settings.managementAgencies || [];

    // Convertir FinanceShow a formato Show para agenciesForShow
    const showForAgencies = {
      id: show.id,
      name: show.name || '',
      city: show.city,
      country: show.country,
      lat: show.lat,
      lng: show.lng,
      date: show.date,
      fee: show.fee,
      status: show.status,
      mgmtAgency: (show as any).mgmtAgency,       // Include selected agencies
      bookingAgency: (show as any).bookingAgency  // for commission calculation
    };

    const applicable = agenciesForShow(showForAgencies, bookingAgencies, managementAgencies);
    const allAgencies = [...applicable.booking, ...applicable.management];

    if (allAgencies.length > 0) {
      const totalCommission = computeCommission(showForAgencies, allAgencies);

      // Desglosar por agencia
      // Nota: computeCommission devuelve el total, aquí lo distribuimos proporcionalmente
      const totalPct = allAgencies.reduce((sum, a) => sum + a.commissionPct, 0);

      allAgencies.forEach(agency => {
        const pct = agency.commissionPct;
        const amount = (show.fee * pct) / 100;

        commissions.push({
          name: agency.name,
          percentage: pct,
          amount: amount
        });
      });
    }
  } catch (e) {
    console.error('[profitability] Error calculating commissions:', e);
  }

  return commissions;
}

/**
 * Calcula WHT desde un show usando whtPct existente
 */
export function calculateWHTFromShow(
  show: FinanceShow
): { percentage: number; amount: number; country: string } | null {
  const whtPct = (show as any).whtPct || 0;

  if (whtPct <= 0) return null;

  return {
    percentage: whtPct,
    amount: (show.fee * whtPct) / 100,
    country: show.country
  };
}

/**
 * Calcula costes totales desde el array de costs del show
 */
export function calculateShowCosts(show: FinanceShow): number {
  const costs = (show as any).costs || [];
  return costs.reduce((sum: number, cost: any) => sum + (cost.amount || 0), 0);
}

/**
 * Convierte FinanceShow a TransactionV3 con detalle completo
 */
export function showToTransactionV3(show: FinanceShow): TransactionV3[] {
  const transactions: TransactionV3[] = [];

  // Calcular componentes
  const commissions = calculateCommissionsFromShow(show);
  const withholdingTax = calculateWHTFromShow(show);
  const totalCommissions = sumCommissions(commissions);
  const totalWHT = withholdingTax?.amount || 0;
  const netIncome = show.fee - totalCommissions - totalWHT;

  // Transacción de ingreso con detalle
  transactions.push({
    id: `income-${show.id}`,
    date: show.date,
    description: `Show en ${show.city}`,
    category: 'Ingresos por Shows',
    type: 'income',
    amount: netIncome,
    status: 'paid',
    incomeDetail: {
      grossFee: show.fee,
      commissions: commissions,
      withholdingTax: withholdingTax || undefined,
      netIncome: netIncome,
      currency: show.feeCurrency || 'EUR'
    },
    tripTitle: show.name,
    showId: show.id
  });

  // Transacciones de gastos desde costs[]
  const costs = (show as any).costs || [];
  costs.forEach((cost: any, idx: number) => {
    const transaction: any = {
      id: `expense-${show.id}-${idx}`,
      date: show.date,
      description: cost.description || cost.item || `Coste ${show.city}`,
      category: cost.category || 'Producción',
      type: 'expense',
      amount: cost.amount || 0,
      status: cost.status || 'paid',
      showId: show.id
    };

    // Añadir el tipo de gasto si existe (del campo 'type' en costs)
    if (cost.type) {
      transaction.expenseType = cost.type;
    }

    transactions.push(transaction);
  });

  return transactions;
}

/**
 * Formatea un número como porcentaje
 */
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Calcula el total de comisiones de una lista
 */
export function sumCommissions(commissions: Commission[]): number {
  return commissions.reduce((sum, c) => sum + c.amount, 0);
}
