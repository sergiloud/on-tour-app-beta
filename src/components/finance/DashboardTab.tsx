import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp, TrendingDown, Wallet,
  Plus, BarChart3, Receipt, PieChart as PieChartIcon
} from 'lucide-react';
import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';
import { slideUp, staggerFast } from '../../lib/animations';
import { t } from '../../lib/i18n';
import { ProfitabilityWaterfallChart } from './ProfitabilityWaterfallChart';
import { FinancialDistributionPieChart } from './FinancialDistributionPieChart';
import type { TransactionV3, ProfitabilityAnalysis } from '../../types/financeV3';
import type {
  PeriodKPIs,
  ComparisonKPIs,
  IncomeVsExpensesDataPoint,
  CategoryDataPoint
} from '../../hooks/useFinanceData';

// Colores semánticos del sistema de diseño v2.0
const CHART_COLORS = {
  income: 'rgba(16, 185, 129, 0.8)',    // accent/emerald - Ingresos
  expense: 'rgba(251, 146, 60, 0.8)',   // amber - Gastos
  net: 'rgba(59, 130, 246, 0.8)',       // blue - Balance/Neto
  categories: [
    'rgba(139, 92, 246, 0.8)',   // purple-500
    'rgba(59, 130, 246, 0.8)',   // blue-500
    'rgba(16, 185, 129, 0.7)',   // accent/emerald
    'rgba(251, 146, 60, 0.7)',   // amber
    'rgba(236, 72, 153, 0.7)',   // pink-500
    'rgba(139, 92, 246, 0.6)',   // purple-500 dim
    'rgba(59, 130, 246, 0.6)',   // blue-500 dim
    'rgba(156, 163, 175, 0.6)',  // gray-400
  ]
};

export interface DashboardTabProps {
  /** KPIs del período actual */
  periodKPIs: PeriodKPIs;

  /** KPIs de comparación (opcional, solo cuando hay comparación activa) */
  comparisonKPIs?: ComparisonKPIs | null;

  /** Análisis de rentabilidad completo */
  profitabilityAnalysis: ProfitabilityAnalysis;

  /** Datos para gráfico Ingresos vs Gastos */
  incomeVsExpensesData: readonly IncomeVsExpensesDataPoint[];

  /** Datos para gráfico de categorías */
  categoryData: readonly CategoryDataPoint[];

  /** Transacciones recientes (top 5) */
  recentTransactions: readonly TransactionV3[];

  /** Función de formateo de dinero */
  fmtMoney: (amount: number) => string;

  /** Callback para cambiar a pestaña de transacciones */
  onViewAllTransactions: () => void;

  /** Callback para abrir modal de añadir transacción */
  onAddTransaction: () => void;

  /** Callback para drill-down: navegar a transacciones con filtros */
  onDrillDown?: (filters: { type?: 'income' | 'expense'; category?: string }) => void;
}

/**
 * Componente de la pestaña Dashboard del módulo de Finanzas
 *
 * DISEÑO UX MEJORADO:
 * - Hero Section: Balance destacado como métrica principal
 * - Jerarquía Visual: De lo importante a los detalles
 * - Interactividad: KPIs y gráficos permiten drill-down
 *
 * Responsabilidades:
 * - Mostrar KPIs con jerarquía (hero + secundarios)
 * - Renderizar gráficos de análisis interactivos
 * - Mostrar lista de transacciones recientes
 * - Accesos directos para añadir ingresos/gastos
 * - Drill-down a transacciones con filtros aplicados
 */
export function DashboardTab({
  periodKPIs,
  comparisonKPIs,
  profitabilityAnalysis,
  incomeVsExpensesData,
  categoryData,
  recentTransactions,
  fmtMoney,
  onViewAllTransactions,
  onAddTransaction,
  onDrillDown,
}: DashboardTabProps) {
  // Obtener modo de comparación del contexto para label correcto
  const comparisonMode = useMemo(() =>
    comparisonKPIs ?
      (comparisonKPIs.income.comparison !== 0 ? 'previous' : 'yearAgo') :
      undefined,
    [comparisonKPIs]
  );

  // Memoize balance status to avoid recalculation
  const balanceStatus = useMemo(() => ({
    isPositive: periodKPIs.balance >= 0,
    statusText: periodKPIs.balance >= 0 ? '✓ Superávit saludable' : '⚠ Déficit detectado',
    colorClass: periodKPIs.balance >= 0 ? 'text-accent-400' : 'text-red-400'
  }), [periodKPIs.balance]);

  return (
    <div className="space-y-6">
      {/* 🎯 HERO SECTION - Métrica Principal: Balance Neto */}
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 hover:border-blue-500/30 transition-fast">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shadow-lg border border-white/5">
              <Wallet className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium mb-2">Balance del Período</div>
              <div className={`text-5xl font-bold tabular-nums mb-2 ${balanceStatus.colorClass}`}>
                {fmtMoney(periodKPIs.balance)}
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="text-slate-300 dark:text-white/50">
                  {balanceStatus.statusText}
                </span>
                <span className="text-slate-300 dark:text-slate-200 dark:text-white/30">•</span>
                <button
                  onClick={() => onDrillDown?.({})}
                  className="text-accent-400 hover:text-accent-300 transition-colors font-medium flex items-center gap-1.5"
                >
                  Ver detalle
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Mini stats secundarios */}
          <div className="grid grid-cols-2 gap-4 w-full md:w-auto">
            <button
              onClick={() => onDrillDown?.({ type: 'income' })}
              className="glass rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 transition-fast group cursor-pointer text-left"
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium mb-1">
                {t('finance.dashboard.netIncome') || 'Net Income'}
              </div>
              <div className="text-xl font-bold text-accent-400 tabular-nums group-hover:scale-105 transition-transform">
                {fmtMoney(periodKPIs.income)}
              </div>
              {periodKPIs.invoiceTotal && periodKPIs.invoiceTotal > periodKPIs.income && (
                <div className="text-xs text-blue-400 mt-1 tabular-nums">
                  Factura: {fmtMoney(periodKPIs.invoiceTotal)}
                </div>
              )}
            </button>
            <button
              onClick={() => onDrillDown?.({ type: 'expense' })}
              className="glass rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:border-amber-500/30 transition-fast group cursor-pointer text-left"
            >
              <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium mb-1">
                {t('finance.dashboard.expenses') || 'Expenses'}
              </div>
              <div className="text-xl font-bold text-amber-400 tabular-nums group-hover:scale-105 transition-transform-fast">
                {fmtMoney(periodKPIs.expenses)}
              </div>
              {periodKPIs.totalVAT && periodKPIs.totalVAT > 0 && (
                <div className="text-xs text-green-400 mt-1 tabular-nums">
                  VAT: +{fmtMoney(periodKPIs.totalVAT)}
                </div>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* SECCIÓN: Análisis de Rentabilidad */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Waterfall Chart - Flujo de Rentabilidad */}
        <div>
          <ProfitabilityWaterfallChart
            analysis={profitabilityAnalysis}
            fmtMoney={fmtMoney}
          />
        </div>

        {/* Pie Chart - Distribución Financiera Completa */}
        <div>
          <FinancialDistributionPieChart
            distribution={profitabilityAnalysis.financialDistribution}
            grossIncome={profitabilityAnalysis.grossIncome}
            fmtMoney={fmtMoney}
          />
        </div>
      </div>

      {/* Gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Gráfico Ingresos vs Gastos */}
        <div className="lg:col-span-2 glass rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-accent-500/30 transition-fast">
          <div className="flex items-start justify-between mb-5">
            <div>
              <div className="flex items-center gap-3 mb-1.5">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
                  <BarChart3 className="w-5 h-5 text-accent-400" />
                </div>
                <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Ingresos vs Gastos</h3>
              </div>
              <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">Evolución temporal del flujo de caja</p>

              {/* Legend con indicador de comparación */}
              {comparisonKPIs && (
                <div className="ml-[52px] mt-2 flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 bg-accent-400"></div>
                    <span className="text-slate-400 dark:text-white/60">Período actual</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-0.5 border-t-2 border-dashed border-accent-400/50"></div>
                    <span className="text-slate-400 dark:text-white/60">Comparación</span>
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 px-2.5 py-1.5 rounded-lg bg-interactive border border-slate-200 dark:border-white/10 font-medium">Últimos 6 meses</span>
          </div>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={[...incomeVsExpensesData]}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.income} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.income} stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={CHART_COLORS.expense} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={CHART_COLORS.expense} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={document.documentElement.dataset.theme === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.05)'}
              />
              <XAxis
                dataKey="month"
                stroke={document.documentElement.dataset.theme === 'light' ? '#64748b' : 'rgba(255,255,255,0.3)'}
                style={{ fontSize: '12px' }}
              />
              <YAxis
                stroke={document.documentElement.dataset.theme === 'light' ? '#64748b' : 'rgba(255,255,255,0.3)'}
                style={{ fontSize: '12px' }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: document.documentElement.dataset.theme === 'light' ? 'rgba(255, 255, 255, 0.95)' : 'rgba(15, 23, 42, 0.95)',
                  border: document.documentElement.dataset.theme === 'light' ? '1px solid rgba(0,0,0,0.1)' : '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '12px',
                  fontSize: '12px'
                }}
                formatter={(value: number) => fmtMoney(value)}
              />

              {/* Series principales */}
              <Area
                type="monotone"
                dataKey="ingresos"
                stroke={CHART_COLORS.income}
                fillOpacity={1}
                fill="url(#colorIncome)"
                strokeWidth={2}
                name={t('finance.chart.income')}
              />
              <Area
                type="monotone"
                dataKey="gastos"
                stroke={CHART_COLORS.expense}
                fillOpacity={1}
                fill="url(#colorExpense)"
                strokeWidth={2}
                name={t('finance.chart.expenses')}
              />

              {/* Series de comparación (solo si existen datos) */}
              {comparisonKPIs && incomeVsExpensesData.some(d => d.ingresosComparacion !== undefined) && (
                <>
                  <Area
                    type="monotone"
                    dataKey="ingresosComparacion"
                    stroke={CHART_COLORS.income}
                    strokeDasharray="5 5"
                    fillOpacity={0}
                    strokeWidth={2}
                    strokeOpacity={0.5}
                    name={t('finance.chart.incomeComparison')}
                  />
                  <Area
                    type="monotone"
                    dataKey="gastosComparacion"
                    stroke={CHART_COLORS.expense}
                    strokeDasharray="5 5"
                    fillOpacity={0}
                    strokeWidth={2}
                    strokeOpacity={0.5}
                    name={t('finance.chart.expensesComparison')}
                  />
                </>
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Gráfico de Categorías */}
        <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-accent-500/30 transition-fast">
          <div className="mb-5">
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-600/10 flex items-center justify-center shadow-sm border border-white/5">
                <PieChartIcon className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Gastos por Categoría</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">Distribución de egresos</p>
          </div>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie
                  data={categoryData as any}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {categoryData.map((_, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={CHART_COLORS.categories[index % CHART_COLORS.categories.length]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(15, 23, 42, 0.95)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '12px',
                    fontSize: '12px'
                  }}
                  formatter={(value: number) => fmtMoney(value)}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-[280px] flex items-center justify-center text-slate-300 dark:text-white/30 text-sm">
              No hay datos de gastos en este período
            </div>
          )}
        </div>
      </div>

      {/* Transacciones Recientes */}
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6 hover:border-accent-500/30 transition-fast">
        <div className="flex items-start justify-between mb-5">
          <div>
            <div className="flex items-center gap-3 mb-1.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
                <Receipt className="w-5 h-5 text-accent-400" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">Transacciones Recientes</h3>
            </div>
            <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">Últimos movimientos registrados</p>
          </div>
          <button
            onClick={onViewAllTransactions}
            className="text-xs text-accent-400 hover:text-accent-300 transition-colors flex items-center gap-1.5 font-medium"
          >
            Ver todas
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
        <div className="space-y-2.5">
          {recentTransactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/10 hover:border-accent-500/20 hover:bg-slate-100 dark:bg-white/[0.06] transition-fast cursor-pointer group"
            >
              <div className="flex items-center gap-3.5">
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${
                  transaction.type === 'income'
                    ? 'from-accent-500/20 to-accent-600/10 border border-accent-500/10'
                    : 'from-amber-500/20 to-amber-600/10 border border-amber-500/10'
                } flex items-center justify-center shadow-sm border border-white/5`}>
                  {transaction.type === 'income' ? (
                    <TrendingUp className="w-5 h-5 text-accent-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-amber-400" />
                  )}
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900 dark:text-white mb-0.5">{transaction.description}</p>
                  <div className="flex items-center gap-2 text-xs text-slate-300 dark:text-white/40">
                    <span>{new Date(transaction.date).toLocaleDateString()}</span>
                    <span>•</span>
                    <span>{transaction.category}</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <p className={`text-base font-semibold tabular-nums mb-1 ${
                  transaction.type === 'income' ? 'text-accent-400' : 'text-amber-400'
                }`}>
                  {transaction.type === 'income' ? '+' : '−'}{fmtMoney(transaction.amount)}
                </p>
                <span className={`inline-block text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-md border font-medium ${
                  transaction.status === 'paid'
                    ? 'bg-accent-500/10 text-accent-400 border-accent-500/20'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                }`}>
                  {transaction.status === 'paid' ? 'Pagado' : 'Pendiente'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Accesos Directos */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={onAddTransaction}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5 hover:border-accent-500/30 hover:bg-slate-50 dark:bg-white/[0.03] transition-fast text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm border border-white/5">
              <Plus className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white tracking-tight mb-0.5">Añadir Ingreso</p>
              <p className="text-xs text-slate-300 dark:text-white/40">Registra un nuevo ingreso</p>
            </div>
          </div>
        </button>

        <button
          onClick={onAddTransaction}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5 hover:border-amber-500/30 hover:bg-slate-50 dark:bg-white/[0.03] transition-fast text-left group"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500/20 to-amber-600/10 flex items-center justify-center group-hover:scale-105 transition-transform shadow-sm border border-white/5">
              <Plus className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <p className="text-base font-semibold text-slate-900 dark:text-white tracking-tight mb-0.5">Añadir Gasto</p>
              <p className="text-xs text-slate-300 dark:text-white/40">Registra un nuevo gasto</p>
            </div>
          </div>
        </button>
      </div>
    </div>
  );
}

export default React.memo(DashboardTab);
