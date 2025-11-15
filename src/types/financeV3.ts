/**
 * Finance V3 - Modelo de datos enriquecido con comisiones y WHT
 * Este modelo proporciona transparencia total sobre la distribución de ingresos
 */

/**
 * Detalle de una comisión individual
 */
export interface Commission {
  /** Nombre del comisionista (ej: "Agencia de Booking", "Manager", "Promotor") */
  name: string;
  /** Porcentaje de comisión (0-100) */
  percentage: number;
  /** Cantidad en euros */
  amount: number;
}

/**
 * Detalle del Withholding Tax (Retención fiscal)
 */
export interface WithholdingTax {
  /** Porcentaje de retención (0-100) */
  percentage: number;
  /** Cantidad en euros */
  amount: number;
  /** País que aplica la retención (opcional) */
  country?: string;
}

/**
 * Detalle del VAT (IVA - Impuesto sobre el Valor Añadido)
 */
export interface VAT {
  /** Porcentaje de IVA (0-30) */
  percentage: number;
  /** Cantidad en euros */
  amount: number;
}

/**
 * Detalle granular de un ingreso
 * Desglosa cómo se distribuye cada euro desde el fee bruto hasta el neto
 */
export interface IncomeDetail {
  /** Fee bruto acordado (antes de comisiones y retenciones) */
  grossFee: number;

  /** IVA/VAT aplicado (se suma al fee para factura al cliente) */
  vat?: VAT;

  /** Total de factura (grossFee + VAT - lo que paga el cliente) */
  invoiceTotal?: number;

  /** Lista de comisiones aplicadas */
  commissions: Commission[];

  /** Retención fiscal aplicada (opcional) */
  withholdingTax?: WithholdingTax;

  /** Ingreso neto final (grossFee - comisiones - WHT, sin incluir VAT) */
  netIncome: number;

  /** Moneda del ingreso */
  currency?: string;
}

/**
 * Transacción extendida con soporte para detalle de ingresos
 */
export interface TransactionV3 {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'income' | 'expense';

  /**
   * Cantidad principal de la transacción
   * - Para income: es el netIncome (después de comisiones y WHT)
   * - Para expense: es el gasto total
   */
  amount: number;

  status: 'paid' | 'pending';

  /** Detalle de ingreso (solo para type='income') */
  incomeDetail?: IncomeDetail;

  /** Referencia al show/trip si aplica */
  tripTitle?: string;
  showId?: string;
}

/**
 * Estadísticas agregadas de comisiones
 */
export interface CommissionsBreakdown {
  /** Total de comisiones pagadas */
  total: number;

  /** Desglose por comisionista */
  byCommissioner: Array<{
    name: string;
    total: number;
    percentage: number; // % del total de comisiones
    count: number; // Número de transacciones
  }>;
}

/**
 * Distribución financiera completa (comisiones + gastos por categoría)
 */
export interface FinancialDistribution {
  /** Total de comisiones */
  totalCommissions: number;

  /** Desglose de comisiones por agencia/comisionista */
  commissions: Array<{
    name: string;
    amount: number;
    percentage: number; // % del ingreso bruto
    count: number;
  }>;

  /** Total de retenciones WHT */
  totalWHT: number;

  /** Total de gastos */
  totalExpenses: number;

  /** Desglose de gastos por categoría */
  expensesByCategory: Array<{
    category: string;
    amount: number;
    percentage: number; // % del ingreso bruto
    count: number;
  }>;

  /** Desglose de gastos por tipo (del campo 'type' en costs) */
  expensesByType: Array<{
    type: string;
    amount: number;
    percentage: number; // % del total de gastos
    count: number;
  }>;

  /** Ingreso neto final */
  netIncome: number;
}

/**
 * Análisis de rentabilidad completo
 */
export interface ProfitabilityAnalysis {
  /** Ingreso bruto total (suma de grossFee) */
  grossIncome: number;

  /** Total de comisiones pagadas */
  totalCommissions: number;

  /** Total de WHT pagado */
  totalWHT: number;

  /** Ingreso neto (después de comisiones y WHT) */
  netIncome: number;

  /** Gastos totales */
  totalExpenses: number;

  /** Beneficio neto final (netIncome - expenses) */
  netProfit: number;

  /** Margen bruto (%) = (netProfit / grossIncome) * 100 */
  grossMargin: number;

  /** Margen neto (%) = (netProfit / netIncome) * 100 */
  netMargin: number;

  /** Desglose de comisiones */
  commissionsBreakdown: CommissionsBreakdown;

  /** Distribución financiera completa (comisiones + gastos detallados) */
  financialDistribution: FinancialDistribution;
}

/**
 * Punto de datos para el Waterfall Chart
 */
export interface WaterfallDataPoint {
  name: string;
  value: number;
  /** Para barras "flotantes" en recharts */
  start?: number;
  end?: number;
  /** Tipo de barra para colorear */
  type: 'positive' | 'negative' | 'total';
}
