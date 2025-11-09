/**
 * Financial Distribution Chart V2.0
 * Componente interactivo con drill-down para análisis financiero profundo
 * Características:
 * - Vista de dona con ingreso bruto en el centro
 * - Drill-down en segmentos (Comisiones, Gastos)
 * - Tooltips avanzados con contexto completo
 * - Leyenda interactiva como filtro
 * - Callback para sincronizar con tabla de transacciones
 */

import React, { useState, useCallback, useMemo } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import type { FinancialDistribution } from '../../types/financeV3';

interface Props {
  distribution: FinancialDistribution;
  grossIncome: number;
  fmtMoney: (amount: number) => string;
  /** Callback para filtrar la tabla de transacciones */
  onFilterChange?: (filter: {
    type?: 'commission' | 'expense' | 'wht' | null;
    category?: string;
    commissionName?: string;
  } | null) => void;
}

// Colores semánticos del sistema de diseño v2.0
const COLORS = {
  commissions: 'rgba(16, 185, 129, 0.8)',        // accent (verde) - Comisiones
  wht: 'rgba(59, 130, 246, 0.7)',                // blue - WHT (retenciones)
  expenses: 'rgba(251, 146, 60, 0.7)',           // amber - Gastos
  netProfit: 'rgba(16, 185, 129, 0.9)',          // accent bright - Beneficio neto
  expenseCategories: {
    'Producción': 'rgba(251, 146, 60, 0.8)',     // amber
    'Transporte': 'rgba(245, 158, 11, 0.8)',     // amber-500
    'Alojamiento': 'rgba(217, 119, 6, 0.8)',     // amber-600
    'Dietas': 'rgba(251, 191, 36, 0.8)',         // amber-400
    'Marketing': 'rgba(139, 92, 246, 0.7)',      // purple-500
    'Técnico': 'rgba(59, 130, 246, 0.7)',        // blue-500
    'Personal': 'rgba(236, 72, 153, 0.7)',       // pink-500
    'Otros': 'rgba(156, 163, 175, 0.6)',         // gray-400
    'Sin categoría': 'rgba(156, 163, 175, 0.5)', // gray-400 dim
  },
  commissionGradient: [
    'rgba(16, 185, 129, 0.85)',   // accent - emerald-500
    'rgba(5, 150, 105, 0.8)',     // emerald-600
    'rgba(4, 120, 87, 0.75)',     // emerald-700
    'rgba(6, 95, 70, 0.7)',       // emerald-800
  ]
};

type DrillLevel = 'overview' | 'commissions' | 'expenses';

interface ChartDataItem {
  id: string;
  name: string;
  value: number;
  percentOfGross: number;
  percentOfCategory: number;
  count: number;
  color: string;
  type: 'category' | 'commission' | 'expense' | 'result';
  drillable: boolean;
  drillTo?: DrillLevel;
  [key: string]: any; // Allow additional properties for Recharts compatibility
}

export const FinancialDistributionPieChart: React.FC<Props> = ({
  distribution,
  grossIncome,
  fmtMoney,
  onFilterChange
}) => {
  const [drillLevel, setDrillLevel] = useState<DrillLevel>('overview');
  const [activeSegment, setActiveSegment] = useState<string | null>(null);

  // Memoizar beneficio neto
  const netProfit = useMemo(
    () => grossIncome - distribution.totalCommissions - distribution.totalWHT - distribution.totalExpenses,
    [grossIncome, distribution.totalCommissions, distribution.totalWHT, distribution.totalExpenses]
  );

  // Preparar datos según el nivel de drill-down - MOVED BEFORE EARLY RETURN
  const getChartData = useCallback((): ChartDataItem[] => {
    if (drillLevel === 'commissions') {
      return distribution.commissions.map((c, idx) => ({
        id: `commission-${c.name}`,
        name: c.name,
        value: c.amount,
        percentOfGross: c.percentage,
        percentOfCategory: (c.amount / distribution.totalCommissions) * 100,
        count: c.count,
        color: COLORS.commissionGradient[idx % COLORS.commissionGradient.length] || COLORS.commissions,
        type: 'commission' as const,
        drillable: false
      }));
    }

    if (drillLevel === 'expenses') {
      return distribution.expensesByCategory.map((e) => ({
        id: `expense-${e.category}`,
        name: e.category,
        value: e.amount,
        percentOfGross: (e.amount / grossIncome) * 100,
        percentOfCategory: (e.amount / distribution.totalExpenses) * 100,
        count: e.count,
        color: COLORS.expenses,
        type: 'expense' as const,
        drillable: false
      }));
    }

    // Vista general (overview)
    const data: ChartDataItem[] = [
      {
        id: 'commissions',
        name: 'Comisiones',
        value: distribution.totalCommissions,
        percentOfGross: (distribution.totalCommissions / grossIncome) * 100,
        percentOfCategory: 100,
        count: distribution.commissions.length,
        color: COLORS.commissions,
        type: 'category' as const,
        drillable: true,
        drillTo: 'commissions' as DrillLevel
      },
      {
        id: 'wht',
        name: 'WHT',
        value: distribution.totalWHT,
        percentOfGross: (distribution.totalWHT / grossIncome) * 100,
        percentOfCategory: 100,
        count: 0,
        color: COLORS.wht,
        type: 'category' as const,
        drillable: false
      },
      {
        id: 'expenses',
        name: 'Gastos',
        value: distribution.totalExpenses,
        percentOfGross: (distribution.totalExpenses / grossIncome) * 100,
        percentOfCategory: 100,
        count: distribution.expensesByCategory.reduce((sum, cat) => sum + cat.count, 0),
        color: COLORS.expenses,
        type: 'category' as const,
        drillable: true,
        drillTo: 'expenses' as DrillLevel
      },
      {
        id: 'net',
        name: 'Beneficio Neto',
        value: netProfit,
        percentOfGross: (netProfit / grossIncome) * 100,
        percentOfCategory: 100,
        count: 0,
        color: COLORS.netProfit,
        type: 'result' as const,
        drillable: false
      }
    ];

    return data.filter(d => d.value > 0);
  }, [drillLevel, distribution, grossIncome, netProfit]);

  // Manejar click en segmento
  const handleSegmentClick = useCallback((data: ChartDataItem) => {
    if (data.drillable && data.drillTo) {
      setDrillLevel(data.drillTo);
      setActiveSegment(data.id);
    }

    // Notificar al padre para filtrar la tabla
    if (onFilterChange) {
      if (data.type === 'commission') {
        onFilterChange({
          type: 'commission',
          commissionName: data.name
        });
      } else if (data.type === 'expense') {
        onFilterChange({
          type: 'expense',
          category: data.name
        });
      } else if (data.id === 'commissions') {
        onFilterChange({ type: 'commission' });
      } else if (data.id === 'expenses') {
        onFilterChange({ type: 'expense' });
      } else if (data.id === 'wht') {
        onFilterChange({ type: 'wht' });
      }
    }
  }, [onFilterChange]);

  // Volver a la vista overview
  const handleBack = useCallback(() => {
    setDrillLevel('overview');
    setActiveSegment(null);
    if (onFilterChange) {
      onFilterChange(null);
    }
  }, [onFilterChange]);

  // Manejar click en leyenda
  const handleLegendClick = useCallback((item: ChartDataItem) => {
    handleSegmentClick(item);
  }, [handleSegmentClick]);

  // Early return AFTER all hooks
  if (grossIncome === 0) {
    return (
      <div className="glass rounded-xl border border-theme p-6 hover:border-accent-500/30 transition-all">
        <div className="mb-5">
          <div className="flex items-center gap-3 mb-1.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
              <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
              Distribución Financiera
            </h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">
            ¿Dónde va cada euro del ingreso bruto?
          </p>
        </div>
        <div className="flex items-center justify-center h-64 text-slate-300 dark:text-white/40">
          <p>No hay datos en este período</p>
        </div>
      </div>
    );
  }

  const chartData = getChartData();

  // Custom Tooltip Avanzado - v2.0 con jerarquía de opacidades
  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload.length) return null;

    const data: ChartDataItem = payload[0].payload;
    const isExpense = data.type === 'expense';
    const isCommission = data.type === 'commission';

    return (
      <div className="glass rounded-xl border border-slate-300 dark:border-white/20 px-4 py-3 shadow-2xl min-w-[200px] backdrop-blur-md">
        <div className="flex items-center gap-2 mb-2">
          <div
            className="w-3 h-3 rounded-sm shadow-lg"
            style={{ backgroundColor: data.color }}
          />
          <p className="text-sm font-semibold text-theme-primary">{data.name}</p>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-300 dark:text-white/50">Importe:</span>
            <span className="text-base font-bold text-slate-900 dark:text-white tabular-nums">{fmtMoney(data.value)}</span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-xs text-slate-300 dark:text-white/50">% Ingreso bruto:</span>
            <span className="text-sm font-medium text-amber-400 tabular-nums">
              {data.percentOfGross.toFixed(1)}%
            </span>
          </div>

          {drillLevel !== 'overview' && (
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-300 dark:text-white/50">
                % {drillLevel === 'commissions' ? 'Comisiones' : 'Gastos'}:
              </span>
              <span className="text-sm font-medium text-blue-400 tabular-nums">
                {data.percentOfCategory.toFixed(1)}%
              </span>
            </div>
          )}

          {data.count > 0 && (
            <div className="flex justify-between items-center pt-1 border-t border-theme">
              <span className="text-xs text-slate-300 dark:text-white/40">Transacciones:</span>
              <span className="text-xs font-medium text-slate-400 dark:text-white/60">
                {data.count} {isExpense ? 'gasto' : isCommission ? 'comisión' : 'concepto'}
                {data.count !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {data.drillable && (
          <div className="mt-2 pt-2 border-t border-theme flex items-center gap-1 text-xs text-accent-400">
            <ChevronRight className="w-3 h-3" />
            <span>Clic para desglosar</span>
          </div>
        )}
      </div>
    );
  };

  // Custom Label (solo para segmentos grandes)
  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.08) return null; // Solo mostrar si es > 8%

    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill="currentColor"
        className="text-slate-900 dark:text-white drop-shadow-lg"
        textAnchor={x > cx ? 'start' : 'end'}
        dominantBaseline="central"
        fontSize={13}
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  // Título dinámico según el nivel
  const getTitle = () => {
    if (drillLevel === 'commissions') return 'Desglose de Comisiones';
    if (drillLevel === 'expenses') return 'Desglose de Gastos';
    return 'Distribución Financiera';
  };

  const getSubtitle = () => {
    if (drillLevel === 'commissions') return 'Por agencia y comisionista';
    if (drillLevel === 'expenses') return 'Por categoría de gasto';
    return '¿Dónde va cada euro del ingreso bruto?';
  };

  // Agrupar leyenda por secciones en vista overview
  const getLegendGroups = () => {
    if (drillLevel !== 'overview') {
      return [{ title: null, items: chartData }];
    }

    const deductions = chartData.filter(d =>
      d.id === 'commissions' || d.id === 'wht'
    );
    const costs = chartData.filter(d => d.id === 'expenses');
    const result = chartData.filter(d => d.id === 'netProfit');

    const groups: { title: string | null; items: ChartDataItem[] }[] = [];
    if (deductions.length > 0) groups.push({ title: 'Deducciones de Ingreso', items: deductions });
    if (costs.length > 0) groups.push({ title: 'Costes Operativos', items: costs });
    if (result.length > 0) groups.push({ title: 'Resultado', items: result });

    return groups;
  };

  return (
    <div className="glass rounded-xl border border-theme p-6 hover:border-accent-500/30 transition-all">
      {/* Header con navegación - Diseño profesional */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1.5">
            {drillLevel !== 'overview' && (
              <button
                onClick={handleBack}
                className="p-2 hover:bg-accent-500/20 rounded-xl transition-all group border border-theme hover:border-accent-500/30"
                aria-label="Volver"
              >
                <ArrowLeft className="w-4.5 h-4.5 text-slate-400 dark:text-white/60 group-hover:text-accent-400 transition-colors" />
              </button>
            )}
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center shadow-sm border border-white/5">
              <svg className="w-5 h-5 text-accent-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3.055A9.001 9.001 0 1020.945 13H11V3.055z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.488 9H15V3.512A9.025 9.025 0 0120.488 9z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white tracking-tight">
              {getTitle()}
            </h3>
          </div>
          <p className="text-xs text-slate-400 dark:text-white/40 ml-[52px]">
            {getSubtitle()}
          </p>
        </div>

        {/* Ingreso bruto badge - Diseño profesional */}
        <div className="text-right">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 dark:text-white/40 font-medium mb-1.5">Ingreso Bruto</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white tabular-nums">{fmtMoney(grossIncome)}</p>
        </div>
      </div>

      {/* Chart con dona */}
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            innerRadius={drillLevel === 'overview' ? 70 : 60}
            outerRadius={110}
            fill="#8884d8"
            dataKey="value"
            onClick={(data) => handleSegmentClick(data)}
            className="cursor-pointer"
            animationDuration={600}
          >
            {chartData.map((entry, index) => (
              <Cell
                key={`cell-${index}`}
                fill={entry.color}
                className={entry.drillable ? 'hover:opacity-80 transition-opacity' : ''}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />

          {/* Texto en el centro de la dona (solo en overview) */}
          {drillLevel === 'overview' && (
            <text
              x="50%"
              y="50%"
              textAnchor="middle"
              dominantBaseline="middle"
              className="pointer-events-none"
            >
              <tspan
                x="50%"
                dy="-0.5em"
                fontSize="12"
                fill="rgba(255,255,255,0.5)"
              >
                100%
              </tspan>
              <tspan
                x="50%"
                dy="1.2em"
                fontSize="11"
                fill="rgba(255,255,255,0.4)"
              >
                {fmtMoney(grossIncome)}
              </tspan>
            </text>
          )}
        </PieChart>
      </ResponsiveContainer>

      {/* Leyenda interactiva agrupada */}
      <div className="mt-4 space-y-3 max-h-56 overflow-y-auto custom-scrollbar">
        {getLegendGroups().map((group, groupIdx) => (
          <div key={groupIdx}>
            {group.title && (
              <div className="text-[10px] uppercase tracking-wide font-semibold text-slate-400 dark:text-white/40 mb-2 px-2">
                {group.title}
              </div>
            )}
            <div className="space-y-1">
              {group.items.map((item, index) => (
                <button
                  key={`legend-${index}`}
                  onClick={() => handleLegendClick(item)}
                  className={`w-full flex items-center justify-between text-sm py-2 px-3 rounded-lg transition-all border ${
                    item.drillable
                      ? 'hover:bg-slate-200 dark:bg-white/10 hover:border-accent-500/30 cursor-pointer group border-theme'
                      : 'hover:bg-slate-100 dark:hover:bg-white/5 cursor-default border-transparent'
                  } ${activeSegment === item.id ? 'bg-accent-500/10 border-accent-500/30' : ''}`}
                >
                  <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div
                      className="w-3.5 h-3.5 rounded-sm flex-shrink-0 shadow-sm"
                      style={{ backgroundColor: item.color }}
                    />
                    <span className="text-slate-700 dark:text-slate-700 dark:text-white/90 truncate font-medium">{item.name}</span>
                    {item.drillable && (
                      <ChevronRight className="w-3.5 h-3.5 text-slate-300 dark:text-white/30 group-hover:text-accent-400 transition-colors flex-shrink-0" />
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-slate-300 dark:text-white/50 text-xs font-medium tabular-nums">
                      {item.percentOfGross.toFixed(1)}%
                    </span>
                    <span className="text-slate-900 dark:text-white font-semibold min-w-[80px] text-right tabular-nums">
                      {fmtMoney(item.value)}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Summary Stats (solo en overview) - Colores semánticos v2.0 */}
      {drillLevel === 'overview' && (
        <div className="mt-5 pt-5 border-t border-theme grid grid-cols-4 gap-3">
          <div className="text-center p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-theme">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-white/40 mb-1.5">Comisiones</p>
            <p className="text-sm font-bold text-accent-400 tabular-nums">
              {fmtMoney(distribution.totalCommissions)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-theme">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-white/40 mb-1.5">WHT</p>
            <p className="text-sm font-bold text-blue-400 tabular-nums">
              {fmtMoney(distribution.totalWHT)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-theme">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-white/40 mb-1.5">Gastos</p>
            <p className="text-sm font-bold text-amber-400 tabular-nums">
              {fmtMoney(distribution.totalExpenses)}
            </p>
          </div>
          <div className="text-center p-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-theme">
            <p className="text-[10px] uppercase tracking-wide text-slate-400 dark:text-white/40 mb-1.5">Neto</p>
            <p className="text-sm font-bold text-accent-400 tabular-nums">
              {fmtMoney(netProfit)}
            </p>
          </div>
        </div>
      )}

      {/* Breadcrumb de navegación */}
      {drillLevel !== 'overview' && (
        <div className="mt-4 pt-4 border-t border-theme flex items-center gap-2 text-xs">
          <button onClick={handleBack} className="text-slate-300 dark:text-white/50 hover:text-accent-400 transition-colors font-medium">
            Vista General
          </button>
          <ChevronRight className="w-3 h-3 text-slate-200 dark:text-white/30" />
          <span className="text-accent-400 font-medium">
            {drillLevel === 'commissions' ? 'Comisiones' : 'Gastos'}
          </span>
        </div>
      )}
    </div>
  );
};

export default React.memo(FinancialDistributionPieChart);
