/**
 * Financial Distribution Pie Chart
 * Gráfico circular interactivo completo que muestra:
 * - Comisiones desglosadas por agencia
 * - Gastos desglosados por categoría
 * - Click para drill-down y filtrado de tabla
 */

import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, Sector } from 'recharts';
import type { ProfitabilityAnalysis } from '../../types/financeV3';

interface Props {
  analysis: ProfitabilityAnalysis;
  expenses: Array<{ category: string; amount: number }>;
  fmtMoney: (amount: number) => string;
  onSegmentClick?: (type: 'commission' | 'expense', name: string) => void;
}

const COLORS = {
  // Comisiones - tonos rojos/naranjas
  commissions: [
    'rgba(239, 68, 68, 0.9)',   // red-500
    'rgba(249, 115, 22, 0.9)',  // orange-500
    'rgba(245, 158, 11, 0.9)',  // amber-500
  ],
  // Gastos - tonos azules/morados
  expenses: [
    'rgba(59, 130, 246, 0.9)',   // blue-500
    'rgba(139, 92, 246, 0.9)',   // violet-500
    'rgba(168, 85, 247, 0.9)',   // purple-500
    'rgba(236, 72, 153, 0.9)',   // pink-500
    'rgba(14, 165, 233, 0.9)',   // sky-500
    'rgba(34, 197, 94, 0.9)',    // green-500
    'rgba(132, 204, 22, 0.9)',   // lime-500
    'rgba(234, 179, 8, 0.9)',    // yellow-500
  ]
};

export const FinancialDistributionChart: React.FC<Props> = ({
  analysis,
  expenses,
  fmtMoney,
  onSegmentClick
}) => {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // Preparar datos combinados
  const chartData: Array<{
    name: string;
    value: number;
    type: 'commission' | 'expense';
    percentage: number;
    color: string;
  }> = [];

  let totalAmount = 0;

  // Añadir comisiones
  analysis.commissionsBreakdown.byCommissioner.forEach((item, idx) => {
    totalAmount += item.total;
    chartData.push({
      name: item.name,
      value: item.total,
      type: 'commission',
      percentage: 0, // Se calculará después
      color: COLORS.commissions[idx % COLORS.commissions.length] || COLORS.commissions[0]
    });
  });

  // Añadir gastos
  expenses.forEach((item, idx) => {
    totalAmount += item.amount;
    chartData.push({
      name: item.category,
      value: item.amount,
      type: 'expense',
      percentage: 0,
      color: COLORS.expenses[idx % COLORS.expenses.length] || COLORS.expenses[0]
    });
  });

  // Calcular porcentajes
  chartData.forEach(item => {
    item.percentage = totalAmount > 0 ? (item.value / totalAmount) * 100 : 0;
  });

  // Ordenar por valor descendente
  chartData.sort((a, b) => b.value - a.value);

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;

    return (
      <div className="glass rounded-lg border border-slate-300 dark:border-white/20 px-4 py-3 shadow-xl min-w-[200px]">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: data.color }}
          />
          <p className="text-sm font-medium text-slate-900 dark:text-white">{data.name}</p>
        </div>
        <p className="text-xl font-bold text-white mb-1">{fmtMoney(data.value)}</p>
        <div className="flex items-center justify-between text-xs">
          <span className={`px-2 py-0.5 rounded ${
            data.type === 'commission'
              ? 'bg-red-500/20 text-red-300'
              : 'bg-blue-500/20 text-blue-300'
          }`}>
            {data.type === 'commission' ? 'Comisión' : 'Gasto'}
          </span>
          <span className="text-slate-400 dark:text-white/60">{data.percentage.toFixed(1)}%</span>
        </div>
      </div>
    );
  };

  const renderActiveShape = (props: any) => {
    const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } = props;

    return (
      <g>
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius}
          outerRadius={outerRadius + 8}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
        <Sector
          cx={cx}
          cy={cy}
          innerRadius={innerRadius - 4}
          outerRadius={innerRadius}
          startAngle={startAngle}
          endAngle={endAngle}
          fill={fill}
        />
      </g>
    );
  };

  const renderLegend = (props: any) => {
    const { payload } = props;

    // Agrupar por tipo
    const commissions = chartData.filter(d => d.type === 'commission');
    const expenseItems = chartData.filter(d => d.type === 'expense');

    return (
      <div className="mt-6 space-y-4">
        {/* Comisiones */}
        {commissions.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500"></span>
              Comisiones ({fmtMoney(analysis.commissionsBreakdown.total)})
            </p>
            <div className="space-y-1.5">
              {commissions.map((item, index) => (
                <button
                  key={`commission-${index}`}
                  onClick={() => onSegmentClick?.('commission', item.name)}
                  className="w-full flex items-center justify-between text-sm hover:bg-slate-100 dark:bg-white/5 rounded-lg px-2 py-1.5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-white/80 group-hover:text-slate-900 dark:hover:text-white">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 dark:text-white/40 text-xs">{item.percentage.toFixed(1)}%</span>
                    <span className="text-slate-900 dark:text-white font-medium tabular-nums">{fmtMoney(item.value)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Gastos */}
        {expenseItems.length > 0 && (
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-400 dark:text-white/40 mb-2 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-blue-500"></span>
              Gastos ({fmtMoney(expenseItems.reduce((sum, item) => sum + item.value, 0))})
            </p>
            <div className="space-y-1.5">
              {expenseItems.map((item, index) => (
                <button
                  key={`expense-${index}`}
                  onClick={() => onSegmentClick?.('expense', item.name)}
                  className="w-full flex items-center justify-between text-sm hover:bg-slate-100 dark:bg-white/5 rounded-lg px-2 py-1.5 transition-colors group"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="w-3 h-3 rounded-sm group-hover:scale-110 transition-transform"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-600 dark:text-white/80 group-hover:text-slate-900 dark:hover:text-white">{item.name}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 dark:text-white/40 text-xs">{item.percentage.toFixed(1)}%</span>
                    <span className="text-slate-900 dark:text-white font-medium tabular-nums">{fmtMoney(item.value)}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Distribución Financiera
        </h3>
        <p className="text-sm text-slate-300 dark:text-white/50 mb-4">
          Comisiones y gastos desglosados
        </p>
        <div className="flex items-center justify-center h-64 text-slate-300 dark:text-white/40">
          <p>No hay datos de comisiones o gastos en este período</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">
          Distribución Financiera
        </h3>
        <p className="text-sm text-slate-300 dark:text-white/50">
          Comisiones y gastos desglosados • Click para filtrar
        </p>
      </div>

      {/* Total general */}
      <div className="mb-6 text-center">
        <p className="text-sm text-slate-300 dark:text-white/50 mb-1">Total Comisiones + Gastos</p>
        <p className="text-3xl font-bold text-slate-900 dark:text-white">{fmtMoney(totalAmount)}</p>
        <div className="flex items-center justify-center gap-4 mt-2 text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-red-500"></div>
            <span className="text-slate-400 dark:text-white/60">
              {analysis.commissionsBreakdown.total > 0
                ? ((analysis.commissionsBreakdown.total / totalAmount) * 100).toFixed(1)
                : '0'}% Comisiones
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-blue-500"></div>
            <span className="text-slate-400 dark:text-white/60">
              {totalAmount > 0
                ? (((totalAmount - analysis.commissionsBreakdown.total) / totalAmount) * 100).toFixed(1)
                : '0'}% Gastos
            </span>
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <PieChart>
          <Pie
            activeShape={activeIndex !== null ? renderActiveShape : undefined}
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={110}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
            onClick={(data, index) => {
              onSegmentClick?.(data.type, data.name);
            }}
            style={{ cursor: 'pointer' }}
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
