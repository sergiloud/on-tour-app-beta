/**
 * ProjectionsTab - Financial Projections & Forecasting
 *
 * Muestra proyecciones financieras basadas en datos históricos con:
 * - Gráfico de forecast (histórico + proyectado)
 * - Métricas de tendencia
 * - Exportación CSV
 *
 * FEATURES:
 * - Moving average visualization
 * - Linear trend analysis
 * - Confidence intervals
 */

import React from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  Download,
  Target,
  AlertCircle,
  Info,
  Calendar,
  Activity,
  BarChart2,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { slideUp, staggerFast } from '../../lib/animations';
import type { TransactionV3 } from '../../types/financeV3';
import {
  useProjections,
  exportProjectionsToCSV,
} from '../../hooks/useProjections';

export interface ProjectionsTabProps {
  /** Transacciones para análisis */
  transactions: readonly TransactionV3[];
  /** Función de formateo de dinero */
  fmtMoney: (amount: number) => string;
}

/**
 * Componente de la pestaña Proyecciones
 */
export function ProjectionsTab({ transactions, fmtMoney }: ProjectionsTabProps) {
  const {
    historical,
    forecast,
    incomeTrend,
    expensesTrend,
    incomeMovingAvg,
    expensesMovingAvg,
  } = useProjections(transactions, 6);

  // Combinar datos históricos y proyectados para el gráfico
  const chartData = [
    ...historical.map(h => ({
      month: h.month,
      ingresos: h.income,
      gastos: h.expenses,
      balance: h.balance,
      type: 'historical' as const,
    })),
    ...forecast.map(f => ({
      month: f.month,
      ingresosProyectados: f.projectedIncome,
      gastosProyectados: f.projectedExpenses,
      balanceProyectado: f.projectedBalance,
      confianza: f.confidence,
      type: 'forecast' as const,
    })),
  ];

  // Handler para exportar CSV
  const handleExportCSV = () => {
    exportProjectionsToCSV(historical, forecast, 'proyecciones-financieras.csv');
  };

  // Si no hay datos históricos suficientes
  if (historical.length < 2) {
    return (
      <motion.div
        variants={slideUp}
        className="glass rounded-xl border border-slate-200 dark:border-white/10 p-8 text-center"
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 flex items-center justify-center">
            <AlertCircle className="w-8 h-8 text-amber-400" />
          </div>
          <h3 className="text-xl font-semibold text-theme-primary">
            Datos Insuficientes
          </h3>
          <p className="text-slate-400 dark:text-white/60 max-w-md">
            Se necesitan al menos 2 meses de datos históricos para generar
            proyecciones financieras. Añade más transacciones para ver el
            análisis predictivo.
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      variants={staggerFast}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      {/* Info Card - Metodología */}
      <motion.div variants={slideUp} className="glass rounded-xl border border-blue-500/20 bg-blue-500/5 p-5">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shadow-sm border border-white/5">
            <Activity className="w-5 h-5 text-blue-400" />
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
                  Proyecciones Financieras
                </h3>
                <p className="text-xs text-slate-400 dark:text-white/60">
                  Basado en {historical.length} meses de datos históricos. Proyección de 6 meses usando regresión lineal y promedios móviles.
                </p>
              </div>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                onClick={handleExportCSV}
                className="px-3 py-2 bg-blue-500/20 border border-blue-500/30 rounded-lg text-xs text-blue-400 hover:bg-blue-500/30 transition-all font-medium flex items-center gap-2"
              >
                <Download className="w-3.5 h-3.5" />
                Exportar CSV
              </motion.button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* KPIs Grid */}
      <motion.div
        variants={slideUp}
        className="grid grid-cols-1 md:grid-cols-2 gap-5"
      >
        {/* Balance Proyectado */}
        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          className="glass rounded-xl p-5 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
              <Target className="w-5 h-5 text-accent-400" />
            </div>
          </div>
          <div className="space-y-1 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">
              Balance Proyectado
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {fmtMoney(forecast.reduce((sum, f) => sum + f.projectedBalance, 0))}
            </div>
            <div className="text-xs text-slate-200 dark:text-white/30">Próximos 6 meses</div>
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 dark:text-white/40 mb-1">Ingresos</p>
              <p className="text-accent-400 font-semibold">
                {fmtMoney(forecast.reduce((sum, f) => sum + f.projectedIncome, 0))}
              </p>
            </div>
            <div>
              <p className="text-slate-400 dark:text-white/40 mb-1">Gastos</p>
              <p className="text-amber-400 font-semibold">
                {fmtMoney(forecast.reduce((sum, f) => sum + f.projectedExpenses, 0))}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Tendencias */}
        <motion.div
          whileHover={{ scale: 1.01, y: -1 }}
          className="glass rounded-xl p-5 border border-slate-200 dark:border-white/10 hover:border-blue-500/30 transition-all group"
        >
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/10 flex items-center justify-center shadow-sm border border-white/5">
              <Activity className="w-5 h-5 text-blue-400" />
            </div>
          </div>
          <div className="space-y-1 mb-4">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">
              Tendencias Detectadas
            </div>
            <div className="text-3xl font-bold text-slate-900 dark:text-white tabular-nums">
              {incomeTrend >= 0 ? '+' : ''}{fmtMoney(incomeTrend)}
            </div>
            <div className="text-xs text-slate-200 dark:text-white/30">Ingresos/mes</div>
          </div>
          <div className="pt-3 border-t border-slate-200 dark:border-white/10 grid grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-slate-400 dark:text-white/40 mb-1">Gastos/mes</p>
              <p className="text-amber-400 font-semibold">
                {expensesTrend >= 0 ? '+' : ''}{fmtMoney(expensesTrend)}
              </p>
            </div>
            <div>
              <p className="text-slate-400 dark:text-white/40 mb-1">Balance promedio</p>
              <p className="text-blue-400 font-semibold">
                {fmtMoney(forecast.reduce((sum, f) => sum + f.projectedBalance, 0) / forecast.length)}
              </p>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Gráfico de Proyecciones */}
      <motion.div
        variants={slideUp}
        className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5 hover:border-accent-500/30 transition-all"
      >
        <div className="mb-5">
          <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">
            Evolución Financiera
          </h3>
          <p className="text-xs text-slate-300 dark:text-white/50">
            Líneas sólidas: datos reales • Líneas punteadas: proyección
          </p>
        </div>

        <ResponsiveContainer width="100%" height={400}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
            <XAxis
              dataKey="month"
              stroke="#ffffff40"
              tick={{ fill: '#ffffff70', fontSize: 11 }}
              tickLine={{ stroke: '#ffffff20' }}
            />
            <YAxis
              stroke="#ffffff40"
              tick={{ fill: '#ffffff70', fontSize: 11 }}
              tickLine={{ stroke: '#ffffff20' }}
              tickFormatter={(value) => `${(value / 1000).toFixed(0)}k€`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0a0f1a',
                border: '1px solid rgba(255,255,255,0.1)',
                borderRadius: '8px',
                padding: '12px',
              }}
              labelStyle={{
                color: '#fff',
                marginBottom: '8px',
                fontWeight: 600,
                fontSize: '12px',
              }}
              itemStyle={{ color: '#fff', fontSize: '12px', padding: '2px 0' }}
              formatter={(value: number, name: string) => [fmtMoney(value), name]}
            />
            <Legend
              wrapperStyle={{ paddingTop: '20px' }}
              iconType="line"
              iconSize={14}
            />

            {/* Histórico */}
            <Area
              type="monotone"
              dataKey="ingresos"
              stroke="#10b981"
              strokeWidth={2}
              fill="url(#incomeGradient)"
              name="Ingresos Reales"
              connectNulls
            />
            <Area
              type="monotone"
              dataKey="gastos"
              stroke="#f59e0b"
              strokeWidth={2}
              fill="url(#expenseGradient)"
              name="Gastos Reales"
              connectNulls
            />

            {/* Proyección */}
            <Line
              type="monotone"
              dataKey="ingresosProyectados"
              stroke="#10b981"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#10b981', strokeWidth: 2, stroke: '#0a0f1a' }}
              name="Ingresos Proyectados"
              connectNulls
            />
            <Line
              type="monotone"
              dataKey="gastosProyectados"
              stroke="#f59e0b"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={{ r: 3, fill: '#f59e0b', strokeWidth: 2, stroke: '#0a0f1a' }}
              name="Gastos Proyectados"
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Tabla de proyección mensual */}
      <motion.div
        variants={slideUp}
        className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden hover:border-accent-500/30 transition-all"
      >
        <div className="p-5 border-b border-theme">
          <h3 className="text-base font-semibold text-theme-primary">Desglose Mensual</h3>
          <p className="text-xs text-slate-300 dark:text-white/50 mt-1">Proyección detallada con nivel de confianza</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-interactive">
              <tr className="border-b border-theme">
                <th className="px-5 py-3 text-left text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">Mes</th>
                <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">Ingresos</th>
                <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">Gastos</th>
                <th className="px-5 py-3 text-right text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">Balance</th>
                <th className="px-5 py-3 text-center text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium">Confianza</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-white/5">
              {forecast.map((f) => (
                <tr key={f.month} className="hover:bg-slate-50 dark:bg-white/[0.03] transition-colors">
                  <td className="px-5 py-3 text-sm text-white font-medium">
                    {new Date(f.month + '-01').toLocaleDateString('es-ES', { month: 'short', year: 'numeric' })}
                  </td>
                  <td className="px-5 py-3 text-sm text-accent-400 text-right font-semibold tabular-nums">
                    {fmtMoney(f.projectedIncome)}
                  </td>
                  <td className="px-5 py-3 text-sm text-amber-400 text-right font-semibold tabular-nums">
                    {fmtMoney(f.projectedExpenses)}
                  </td>
                  <td className="px-5 py-3 text-sm text-right font-semibold tabular-nums">
                    <span className={f.projectedBalance >= 0 ? 'text-accent-400' : 'text-red-400'}>
                      {fmtMoney(f.projectedBalance)}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 h-1.5 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full transition-all"
                          style={{ width: `${f.confidence * 100}%` }}
                        />
                      </div>
                      <span className="text-xs text-slate-400 dark:text-white/60 font-medium min-w-[2.5rem] text-right tabular-nums">
                        {Math.round(f.confidence * 100)}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}

              {/* Fila de totales */}
              <tr className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-t border-white/20">
                <td className="px-5 py-4 text-xs text-slate-500 dark:text-white/70 font-semibold uppercase">Total 6 Meses</td>
                <td className="px-5 py-4 text-sm text-accent-400 text-right font-bold tabular-nums">
                  {fmtMoney(forecast.reduce((sum, f) => sum + f.projectedIncome, 0))}
                </td>
                <td className="px-5 py-4 text-sm text-amber-400 text-right font-bold tabular-nums">
                  {fmtMoney(forecast.reduce((sum, f) => sum + f.projectedExpenses, 0))}
                </td>
                <td className="px-5 py-4 text-sm text-right font-bold tabular-nums">
                  <span className={forecast.reduce((sum, f) => sum + f.projectedBalance, 0) >= 0 ? 'text-accent-400' : 'text-red-400'}>
                    {fmtMoney(forecast.reduce((sum, f) => sum + f.projectedBalance, 0))}
                  </span>
                </td>
                <td className="px-5 py-4"></td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Resumen de Proyecciones eliminado - ya está en el KPI principal */}
    </motion.div>
  );
}

export default React.memo(ProjectionsTab);
