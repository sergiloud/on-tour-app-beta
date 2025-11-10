/**
 * Commissions Breakdown Pie Chart
 * Muestra la distribución de comisiones por comisionista
 * Responde: "¿Quién se lleva qué comisión?"
 */

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import type { CommissionsBreakdown } from '../../types/financeV3';

interface Props {
  breakdown: CommissionsBreakdown;
  fmtMoney: (amount: number) => string;
}

const COMMISSION_COLORS = [
  'rgba(239, 68, 68, 0.8)',   // red-500
  'rgba(249, 115, 22, 0.8)',  // orange-500
  'rgba(245, 158, 11, 0.8)',  // amber-500
  'rgba(234, 179, 8, 0.8)',   // yellow-500
  'rgba(132, 204, 22, 0.8)',  // lime-500
];

export const CommissionsPieChart: React.FC<Props> = ({ breakdown, fmtMoney }) => {
  if (breakdown.total === 0 || breakdown.byCommissioner.length === 0) {
    return (
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Distribución de Comisiones
        </h3>
        <p className="text-sm text-slate-300 dark:text-white/50 mb-4">
          ¿Quién se lleva qué comisión?
        </p>
        <div className="flex items-center justify-center h-64 text-slate-300 dark:text-white/40">
          <p>No hay comisiones en este período</p>
        </div>
      </div>
    );
  }

  const chartData = breakdown.byCommissioner.map((item, idx) => ({
    name: item.name,
    value: item.total,
    percentage: item.percentage,
    count: item.count,
    color: COMMISSION_COLORS[idx % COMMISSION_COLORS.length]
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="glass rounded-lg border border-slate-300 dark:border-white/20 px-3 py-2 shadow-xl">
        <p className="text-sm font-medium text-slate-900 dark:text-white mb-1">{data.name}</p>
        <p className="text-lg font-bold text-slate-900 dark:text-white">{fmtMoney(data.value)}</p>
        <p className="text-sm text-slate-400 dark:text-white/60">{data.percentage.toFixed(1)}% del total</p>
        <p className="text-xs text-slate-400 dark:text-white/40 mt-1">{data.count} show{data.count !== 1 ? 's' : ''}</p>
      </div>
    );
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    if (percent < 0.05) return null; // No mostrar labels para segmentos muy pequeños

    return (
      <text
        x={x}
        y={y}
        fill="currentColor" className="text-slate-900 dark:text-white"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;

    return (
      <div className="flex flex-col gap-2 mt-4">
        {payload.map((entry: any, index: number) => {
          const item = breakdown.byCommissioner[index];
          if (!item) return null;

          return (
            <div key={`legend-${index}`} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-slate-600 dark:text-white/80">{entry.value}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-slate-400 dark:text-white/60 text-xs">{item.count} show{item.count !== 1 ? 's' : ''}</span>
                <span className="text-slate-900 dark:text-white font-medium tabular-nums">{fmtMoney(item.total)}</span>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Distribución de Comisiones
        </h3>
        <p className="text-sm text-slate-300 dark:text-white/50">
          ¿Quién se lleva qué comisión?
        </p>
      </div>

      {/* Total comisiones */}
      <div className="mb-4 text-center">
        <p className="text-sm text-slate-300 dark:text-white/50 mb-1">Total Comisiones</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{fmtMoney(breakdown.total)}</p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={2}
            dataKey="value"
            label={<CustomLabel />}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend content={renderLegend} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};
