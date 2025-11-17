/**
 * Profitability Waterfall Chart
 * Visualiza el flujo de dinero desde Ingreso Bruto hasta Beneficio Neto
 * Muestra claramente: Bruto → -Comisiones → -WHT → Neto → -Gastos → Beneficio
 */

import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';
import type { ProfitabilityAnalysis } from '../../types/financeV3';
import { generateWaterfallData } from '../../lib/profitabilityHelpers';
import { t } from '../../lib/i18n';

interface Props {
  analysis: ProfitabilityAnalysis;
  fmtMoney: (amount: number) => string;
}

const COLORS = {
  positive: 'rgba(16, 185, 129, 0.8)', // accent green
  negative: 'rgba(251, 146, 60, 0.8)',  // amber-400
  total: 'rgba(59, 130, 246, 0.8)'     // blue-500
};

export const ProfitabilityWaterfallChart: React.FC<Props> = ({ analysis, fmtMoney }) => {
  // Memoizar datos del waterfall para evitar recalcular en cada render
  const data = useMemo(() => generateWaterfallData(analysis), [analysis]);

  // Preparar datos para recharts usando barras "flotantes"
  const chartData = useMemo(() => data.map(point => ({
    name: point.name,
    value: Math.abs(point.value),
    start: point.start || 0,
    actualValue: point.value,
    type: point.type
  })), [data]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    const value = data.actualValue;
    const isNegative = value < 0;

    return (
      <div className="glass rounded-xl border border-slate-300 dark:border-white/20 px-3 py-2 shadow-xl backdrop-blur-md">
        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{data.name}</p>
        <p className={`text-lg font-bold tabular-nums ${isNegative ? 'text-amber-400' : 'text-accent-400'}`}>
          {isNegative ? '-' : '+'}{fmtMoney(Math.abs(value))}
        </p>
        {data.type === 'total' && (
          <p className="text-xs text-slate-300 dark:text-white/50 mt-1">Total acumulado</p>
        )}
      </div>
    );
  };

  const CustomLabel = (props: any) => {
    const { x, y, width, value, payload } = props;

    // Validar que payload existe
    if (!payload || payload.actualValue === undefined) {
      return null;
    }

    const actualValue = payload.actualValue;

    return (
      <text
        x={x + width / 2}
        y={actualValue >= 0 ? y - 8 : y + 20}
        fill="rgba(255, 255, 255, 0.9)"
        textAnchor="middle"
        fontSize={12}
        fontWeight={600}
      >
        {fmtMoney(Math.abs(actualValue))}
      </text>
    );
  };

  return (
    <div className="glass rounded-xl border border-theme p-6 hover:border-accent-500/30 transition-all">
      <div className="mb-5">
        <div className="flex items-center gap-3 mb-1.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
            <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
            {t('finance.chart.profitability.title') || 'Profitability Analysis'}
          </h3>
        </div>
        <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">
          {t('finance.chart.profitability.subtitle') || 'Cash flow from gross revenue to net profit'}
        </p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={chartData} margin={{ top: 30, right: 20, bottom: 20, left: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" />
          <XAxis
            dataKey="name"
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            angle={-15}
            textAnchor="end"
            height={60}
          />
          <YAxis
            stroke="rgba(255, 255, 255, 0.5)"
            tick={{ fill: 'rgba(255, 255, 255, 0.7)', fontSize: 12 }}
            tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
          />
          <Tooltip content={<CustomTooltip />} />
          <ReferenceLine y={0} stroke="rgba(255, 255, 255, 0.3)" strokeDasharray="3 3" />
          <Bar
            dataKey="value"
            radius={[4, 4, 0, 0]}
            label={<CustomLabel />}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[entry.type as keyof typeof COLORS]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      {/* Leyenda personalizada */}
      <div className="mt-4 flex items-center justify-center gap-6 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.positive }}></div>
          <span className="text-slate-400 dark:text-white/60">{t('finance.chart.profitability.income') || 'Income'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.negative }}></div>
          <span className="text-slate-400 dark:text-white/60">{t('finance.chart.profitability.deductions') || 'Deductions'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded" style={{ backgroundColor: COLORS.total }}></div>
          <span className="text-slate-400 dark:text-white/60">{t('finance.chart.profitability.totals') || 'Totals'}</span>
        </div>
      </div>

      {/* Resumen de márgenes - Diseño profesional */}
      <div className="mt-6 grid grid-cols-2 gap-4">
        <div className="glass rounded-xl p-4 border border-theme hover:border-accent-500/30 transition-all">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium mb-2">
            {t('finance.chart.profitability.grossMargin') || 'Gross Margin'}
          </p>
          <p className={`text-2xl font-bold tabular-nums ${analysis.grossMargin >= 0 ? 'text-white' : 'text-red-400'}`}>
            {analysis.grossMargin.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-300 dark:text-white/30 mt-1">
            {t('finance.chart.profitability.onGrossFee') || 'on gross fee'}
          </p>
        </div>
        <div className="glass rounded-xl p-4 border border-theme hover:border-accent-500/30 transition-all">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium mb-2">
            {t('finance.chart.profitability.netMargin') || 'Net Margin'}
          </p>
          <p className={`text-2xl font-bold tabular-nums ${analysis.netMargin >= 0 ? 'text-white' : 'text-red-400'}`}>
            {analysis.netMargin.toFixed(1)}%
          </p>
          <p className="text-xs text-slate-300 dark:text-white/30 mt-1">
            {t('finance.chart.profitability.onNetRevenue') || 'on net revenue'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(ProfitabilityWaterfallChart);
