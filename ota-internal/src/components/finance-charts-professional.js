// Professional Recharts Integration for Finance Dashboard
import React, { useEffect, useState, useMemo, useContext, createContext } from 'react';
// Prefer static ESM import so bundler doesn't drop finance-core; keep fallback snapshot for safety
import { useFinanceCore } from '../features/finance/core/finance-core';
import { buildSnapshot as buildFinanceSnapshot } from '../features/finance/core/snapshot-builder';

// Build a fallback snapshot once (demo data) so charts never appear completely empty
const __fallbackSnapshot = (() => {
  try {
    return buildFinanceSnapshot();
  } catch (e) {
    console.warn('[finance-charts] Failed to build fallback snapshot', e);
    return null;
  }
})();

function getCoreSnapshot() {
  try {
    if (useFinanceCore) {
      const core = useFinanceCore();
      if (core?.snapshot) return core.snapshot;
    }
  } catch (err) {
    // Swallow but log once
    if (!window.__FINANCE_CORE_ERROR_LOGGED) {
      console.warn('[finance-charts] useFinanceCore error, using fallback', err);
      window.__FINANCE_CORE_ERROR_LOGGED = true;
    }
  }
  return __fallbackSnapshot;
}
import { currencyService } from '../shared/lib/currency-service';
import * as Finance from '../features/finance/services/finance-integrations';
import {
  ComposedChart,
  BarChart,
  PieChart,
  LineChart,
  Area,
  AreaChart,
  Bar,
  Line,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// ---- Debug version marker (increment when style/logic changes) ----
const FINANCE_CHARTS_VERSION = 'v0.9.4-fallback-snapshot';
if (typeof window !== 'undefined') {
  window.__FINANCE_CHARTS_VERSION = FINANCE_CHARTS_VERSION;
  // Only log once per session
  if(!window.__FINANCE_CHARTS_LOGGED){
    console.log('[finance-charts] Loaded version', FINANCE_CHARTS_VERSION);
    window.__FINANCE_CHARTS_LOGGED = true;
  }
}

// Shared gradient defs (injected once) to unify look across charts
let __financeGradientsInjected = false;
function FinanceChartDefs(){
  useEffect(()=>{ __financeGradientsInjected = true; },[]);
  return (
    <defs>
      <linearGradient id="finIncomeGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.9} />
        <stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.15} />
      </linearGradient>
      <linearGradient id="finExpenseGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-danger)" stopOpacity={0.9} />
        <stop offset="100%" stopColor="var(--color-danger)" stopOpacity={0.12} />
      </linearGradient>
      <linearGradient id="finNetGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.9} />
        <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.15} />
      </linearGradient>
      <linearGradient id="finForecastGrad" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.9} />
        <stop offset="100%" stopColor="var(--color-info)" stopOpacity={0.10} />
      </linearGradient>
      <filter id="finLineGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
        <feMerge>
          <feMergeNode in="blur" />
          <feMergeNode in="SourceGraphic" />
        </feMerge>
      </filter>
    </defs>
  );
}

// Enhanced Waterfall Chart Component
export function WaterfallChart({ data, live = false, currency = 'EUR', height = 300, highlightAnomalies = true }) {
  // Always attempt to get snapshot (falls back to demo)
  const snapshot = getCoreSnapshot();
  // Fallback: if no external data passed, attempt to build from snapshot
  const sourceData = useMemo(() => {
    if (data?.length) return data;
    if (!snapshot?.expenses || !snapshot.expenses.length) {
      // Provide minimal demo waterfall so the user sees something
      return [
        { label: 'Start', value: 12000, type: 'start' },
        { label: 'Venue', value: -2500, type: 'delta' },
        { label: 'Travel', value: -1800, type: 'delta' },
        { label: 'Equipment', value: -1200, type: 'delta' },
        { label: 'Marketing', value: -800, type: 'delta' },
        { label: 'End', value: 5700, type: 'end' }
      ];
    }
    // Derive simple waterfall: start -> expenses aggregated by category -> end
    const totalIncome = snapshot.expenses.filter(e => e.type === 'income').reduce((a,b)=>a + (b.amount||0),0);
    const expenseGroups = Object.entries(snapshot.expenses.filter(e=> e.type !== 'income').reduce((acc,e)=>{ acc[e.category||'Other'] = (acc[e.category||'Other']||0) + (e.amount||0); return acc; }, {}))
      .map(([label, value]) => ({ label, value: -Math.abs(value), type:'delta' }));
    const endValue = totalIncome + expenseGroups.reduce((a,b)=> a + b.value, 0);
    return [
      { label: 'Start', value: totalIncome, type: 'start' },
      ...expenseGroups,
      { label: 'End', value: endValue, type: 'end' }
    ];
  }, [data, snapshot]);
  // Transform data for waterfall visualization
  const processWaterfallData = (rawData) => {
    let runningTotal = 0;
    return rawData.map((item, index) => {
      const start = runningTotal;
      if (item.type === 'start') {
        runningTotal = item.value;
        return { ...item, start: 0, end: item.value, cumulative: item.value };
      } else if (item.type === 'end') {
        return { ...item, start: 0, end: runningTotal, cumulative: runningTotal };
      } else {
        const end = runningTotal + item.value;
        const result = { 
          ...item, 
          start: runningTotal, 
          end: end, 
          cumulative: end,
          isPositive: item.value > 0
        };
        runningTotal = end;
        return result;
      }
    });
  };

  const processedData = processWaterfallData(sourceData);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip panel-glass" role="dialog" aria-label={`Detalle ${label}`}>
          <div className="chart-tooltip-title">{label} {anomaliesMap[label] && <span className={`severity-badge severity-${anomaliesMap[label].level}`}>{anomaliesMap[label].level}</span>}</div>
          <div className="chart-tooltip-value">{formatCurrency(data.value, currency)}</div>
          <div className="chart-tooltip-meta">Total acumulado: {formatCurrency(data.cumulative, currency)}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={processedData} margin={{ top: 10, right: 20, left: 10, bottom: 10 }} className="fin-chart fin-waterfall">
        {!__financeGradientsInjected && <FinanceChartDefs />}
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis 
          dataKey="label" 
          tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
          tickFormatter={(value) => formatCurrency(value, currency, true)}
        />
        <Tooltip content={<CustomTooltip />} />
        
        {/* Invisible base bars for positioning */}
        <Bar 
          dataKey="start" 
          stackId="waterfall" 
          fill="transparent" 
        />
        
        {/* Actual waterfall bars */}
        <Bar 
          dataKey="value" 
          stackId="waterfall"
          radius={[4, 4, 0, 0]}
          fill={(entry) => {
            if (entry.type === 'start' || entry.type === 'end') return 'url(#finNetGrad)';
            if (highlightAnomalies && anomaliesMap[entry.label]) return 'var(--color-warning)';
            return entry.value > 0 ? 'url(#finIncomeGrad)' : 'url(#finExpenseGrad)';
          }}
          className="fin-bar"
        />
        
        {/* Cumulative line */}
        <Line 
          type="monotone" 
          dataKey="cumulative" 
          stroke="var(--color-info)" 
          strokeWidth={2}
          dot={{ fill: 'var(--color-info)', strokeWidth: 2, r: 4 }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}

// Enhanced Profitability Heatmap
export function ProfitabilityHeatmap({ data, live = false, currency = 'EUR', height = 300 }) {
  const { snapshot } = useFinanceData({ live });
  const sourceData = useMemo(()=> data?.length ? data : (snapshot?.shows || []).map(s => ({
    tour: s.tour || s.name || 'Tour',
    country: s.country || s.region || 'Unknown',
    profit: s.net || s.profit || 0,
    margin: s.marginPct || (s.gross ? Math.round(((s.net||0)/(s.gross||1))*100) : 0)
  })), [data, snapshot]);
  // Create grid data for heatmap
  const createHeatmapData = (rawData) => {
    const tours = [...new Set(rawData.map(d => d.tour))];
    const countries = [...new Set(rawData.map(d => d.country))];
    
    const gridData = [];
    tours.forEach((tour, tourIndex) => {
      countries.forEach((country, countryIndex) => {
        const dataPoint = rawData.find(d => d.tour === tour && d.country === country);
        if (dataPoint) {
          gridData.push({
            x: countryIndex,
            y: tourIndex,
            value: dataPoint.profit,
            margin: dataPoint.margin,
            tour,
            country,
            intensity: Math.min(Math.max(dataPoint.margin / 50, 0), 1)
          });
        }
      });
    });
    
    return { gridData, tours, countries };
  };

  const { gridData, tours, countries } = createHeatmapData(sourceData);

  const getHeatmapColor = (intensity) => {
    if (intensity > 0.7) return '#10B981'; // Green
    if (intensity > 0.4) return '#F59E0B'; // Yellow
    if (intensity > 0.2) return '#F97316'; // Orange
    return '#EF4444'; // Red
  };

  const CustomHeatmapTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="chart-tooltip">
          <div className="chart-tooltip-title">{data.tour}</div>
          <div className="chart-tooltip-value">{data.country}</div>
          <div className="chart-tooltip-meta">
            Profit: {formatCurrency(data.value, currency)}
            <br />
            Margin: {data.margin}%
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={gridData}>
        <XAxis hide />
        <YAxis hide />
        <Tooltip content={<CustomHeatmapTooltip />} />
        {gridData.map((cell, index) => (
          <Area
            key={index}
            type="monotone"
            dataKey="value"
            fill={getHeatmapColor(cell.intensity)}
            fillOpacity={0.8}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}

// Enhanced Category Donut Chart
export function CategoryDonutChart({ data, live = false, currency = 'EUR', height = 200 }) {
  const snapshot = getCoreSnapshot();
  const sourceData = useMemo(()=> {
    if (data?.length) return data;
    if (!snapshot?.expenses || !snapshot.expenses.length) {
      return [
        { name: 'Venue', amount: 2500, percentage: 25 },
        { name: 'Travel', amount: 1800, percentage: 18 },
        { name: 'Equipment', amount: 1200, percentage: 12 },
        { name: 'Marketing', amount: 800, percentage: 8 },
        { name: 'Other', amount: 3700, percentage: 37 }
      ];
    }
    const totals = snapshot.expenses.reduce((acc,e)=>{ if(e.type !== 'income'){ acc[e.category||'Other'] = (acc[e.category||'Other']||0) + (e.amount||0); } return acc; }, {});
    const grand = Object.values(totals).reduce((a,b)=>a+b,0) || 1;
    return Object.entries(totals).map(([category, amount])=> ({ name: category, amount: Math.abs(amount), percentage: Math.round((amount/grand)*100) }));
  }, [data, snapshot]);
  const COLORS = [
    'var(--color-accent)',
    'var(--color-success)', 
    'var(--color-warning)',
    'var(--color-danger)',
    'var(--color-info)',
    '#8B5CF6',
    '#06B6D4',
    '#84CC16',
    '#F97316',
    '#EC4899'
  ];

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      return (
        <div className="chart-tooltip panel-glass" aria-label={`Categoría ${data.name}`}>
          <div className="chart-tooltip-title">{data.name}</div>
          <div className="chart-tooltip-value">{formatCurrency(data.value, currency)}</div>
          <div className="chart-tooltip-meta">{data.payload.percentage}% del total</div>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.05) return null; // Don't show labels for slices < 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={10}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart className="fin-chart fin-donut">
        {!__financeGradientsInjected && <FinanceChartDefs />}
        <Pie
          data={sourceData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={<CustomLabel />}
          outerRadius={60}
          innerRadius={25}
          fill="#8884d8"
          dataKey="amount"
          animationDuration={800}
        >
          {sourceData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]}
              stroke="var(--color-surface)"
              strokeWidth={2}
            />
          ))}
        </Pie>
  <Tooltip content={<CustomPieTooltip />} />
      </PieChart>
    </ResponsiveContainer>
  );
}

// Enhanced Cash Flow Trend Chart
export function CashFlowTrendChart({ 
  data, 
  live = false, 
  currency = 'EUR', 
  height = 300, 
  showForecast = true, 
  density = 'normal', 
  showRolling = true,
  rollingWindow = 3,
  showCumulative = true,
  showGrowth = true,
  enableExport = true,
  mode = 'stacked' /* 'stacked' | 'net' | 'income-expenses' */
}) {
  const snapshot = getCoreSnapshot();
  const scenario = null; // Simplified - no forecasts for now
  const [activeX, setActiveX] = useState(null);
  const [exporting, setExporting] = useState(false);
  const baseTrend = useMemo(()=> {
    if (data?.length) return data;
    if (!snapshot?.expenses || !snapshot.expenses.length) {
      // Demo synthetic 6 month series
      const now = new Date();
      const arr = [];
      for (let i=5;i>=0;i--) {
        const d = new Date(now); d.setMonth(d.getMonth()-i);
        const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        const income = 10000 + Math.round(3000*Math.sin(i/2));
        const expenses = Math.round(income * (0.45 + 0.1*Math.cos(i)));
        arr.push({ month:key, income, expenses, net: income - expenses });
      }
      return arr;
    }
    // Aggregate monthly income/expense
    const byMonth = new Map();
    snapshot.expenses.forEach(e => {
      const dt = new Date(e.date || e.ts || Date.now());
      const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}`;
      if(!byMonth.has(key)) byMonth.set(key, { month: key, income:0, expenses:0 });
      if(e.type === 'income') byMonth.get(key).income += e.amount||0; else byMonth.get(key).expenses += Math.abs(e.amount||0);
    });
    return Array.from(byMonth.values()).map(r => ({ ...r, net: r.income - r.expenses }));
  }, [data, snapshot]);
  const forecastLine = useMemo(()=> {
    if(!showForecast || !forecasts?.length) return [];
    const primary = forecasts[0]?.series || [];
    // simple confidence band approximation (±12%)
    return primary.map(pt => ({ 
      month: pt.label || pt.month, 
      forecast: pt.value, 
      forecastLow: pt.value * 0.88, 
      forecastHigh: pt.value * 1.12
    }));
  }, [forecasts, showForecast]);

  // Merge + derived metrics
  const merged = useMemo(()=> mergeSeries(baseTrend, forecastLine), [baseTrend, forecastLine]);

  // Rolling average on net
  const withRolling = useMemo(()=> {
    if(!showRolling) return merged;
    return merged.map((row, idx, arr) => {
      const slice = arr.slice(Math.max(0, idx-rollingWindow+1), idx+1);
      const avg = slice.reduce((a,b)=> a + (b.net||0),0) / slice.length || 0;
      return { ...row, netRolling: avg };
    });
  }, [merged, showRolling, rollingWindow]);

  // Cumulative net
  const withCumulative = useMemo(()=> {
    if(!showCumulative) return withRolling;
    let run = 0;
    return withRolling.map(r => { run += (r.net||0); return { ...r, netCumulative: run }; });
  }, [withRolling, showCumulative]);

  // Growth % vs previous month (net)
  const finalData = useMemo(()=> {
    if(!showGrowth) return withCumulative;
    return withCumulative.map((r,i,arr)=> {
      const prev = arr[i-1];
      const growth = prev && prev.net ? ((r.net - prev.net)/Math.abs(prev.net))*100 : 0;
      return { ...r, netGrowthPct: growth };
    });
  }, [withCumulative, showGrowth]);

  // Export CSV (simple)
  function exportCSV(){
    if(!enableExport) return;
    try {
      setExporting(true);
      const headers = ['month','income','expenses','net','netRolling','netCumulative','netGrowthPct','forecast','forecastLow','forecastHigh'];
      const rows = finalData.map(r => headers.map(h => r[h] ?? '').join(','));
      const csv = [headers.join(','), ...rows].join('\n');
      const blob = new Blob([csv], { type:'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'cashflow.csv'; a.click();
      setTimeout(()=> URL.revokeObjectURL(url), 1000);
    } finally { setExporting(false); }
  }
  const CustomTrendTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip panel-glass" aria-label={`Mes ${label}`}>
          <div className="chart-tooltip-title">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="chart-tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, currency)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
  <AreaChart syncId="finance-sync" onMouseMove={(st)=> setActiveX(st?.activeLabel||null)} onMouseLeave={()=> setActiveX(null)} data={finalData} margin={{ top: density==='compact'?4:10, right: density==='compact'?4:10, left: 0, bottom: 0 }} className={`fin-chart fin-cashflow ${density} mode-${mode}`}>
        {!__financeGradientsInjected && <FinanceChartDefs />}
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis 
          dataKey="month" 
          tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
          tickFormatter={(value) => formatCurrency(value, currency, true)}
        />
        <Tooltip content={<CustomTrendTooltip />} />
        <Legend />
        
  {mode !== 'net' && (
    <Area
          type="monotone"
          dataKey="income"
          stackId="1"
          stroke="var(--color-success)"
          fill="url(#finIncomeGrad)"
          fillOpacity={1}
          name="Income"
        />)}
        {mode !== 'net' && (
        <Area
          type="monotone"
          dataKey="expenses"
          stackId="2"
          stroke="var(--color-danger)"
          fill="url(#finExpenseGrad)"
          fillOpacity={1}
          name="Expenses"
        />)}
        <Line
          type="monotone"
          dataKey="net"
          stroke="var(--color-accent)"
          strokeWidth={3}
          dot={{ fill: 'var(--color-accent)', strokeWidth: 2, r: 4 }}
          filter="url(#finLineGlow)"
          name="Net Profit"
        />
        {showRolling && (
          <Line
            type="monotone"
            dataKey="netRolling"
            stroke="var(--color-info)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="3 3"
            name={`Net ${rollingWindow}m Avg`}
          />
        )}
        {showCumulative && (
          <Line
            type="monotone"
            dataKey="netCumulative"
            stroke="var(--color-warning)"
            strokeWidth={2}
            dot={false}
            strokeDasharray="6 4"
            name="Net Cumulative"
          />
        )}
        {showGrowth && (
          <Line
            type="monotone"
            yAxisId="growth"
            dataKey="netGrowthPct"
            stroke="var(--color-danger)"
            strokeWidth={1.5}
            dot={false}
            strokeDasharray="2 2"
            name="Net % MoM"
          />
        )}
    {showForecast && (
          <Line
            type="monotone"
            dataKey="forecast"
      stroke={ scenario?.id === 'baseline' ? 'var(--color-info)' : 'var(--color-warning)' }
            strokeDasharray="4 4"
            strokeWidth={2}
            dot={false}
            filter="url(#finLineGlow)"
            name="Forecast"
          />
        )}
        {showForecast && (
          <Area
            type="monotone"
            dataKey="forecastHigh"
            stroke="transparent"
            fill="var(--color-info)"
            fillOpacity={0.08}
            name="Forecast High"
          />
        )}
        {showForecast && (
          <Area
            type="monotone"
            dataKey="forecastLow"
            stroke="transparent"
            fill="var(--color-info)"
            fillOpacity={0.08}
            name="Forecast Low"
          />
        )}
        {activeX && <ReferenceLine x={activeX} stroke="var(--color-text-secondary)" strokeDasharray="2 2" />}
        <ReferenceLine y={0} stroke="var(--color-border)" strokeDasharray="5 5" />
      </AreaChart>
      {enableExport && (
        <div className="fin-chart-actions" style={{position:'absolute', top:6, right:6, display:'flex', gap:6}}>
          <button className="tiny ghost" disabled={exporting} onClick={exportCSV}>{exporting? '...':'CSV'}</button>
        </div>
      )}
    </ResponsiveContainer>
  );
}

// Professional Revenue Breakdown Chart
export function RevenueBreakdownChart({ data, live = false, currency = 'EUR', height = 250, density='normal' }) {
  const snapshot = getCoreSnapshot();
  const sourceData = useMemo(()=> {
    if (data?.length) return data;
    if (!snapshot?.expenses || !snapshot.expenses.length) {
      return [
        { category: 'Ticketing', gross: 8000, net: 6400 },
        { category: 'Merch', gross: 3200, net: 2620 },
        { category: 'Sponsorship', gross: 5000, net: 4100 }
      ];
    }
    const groups = snapshot.expenses.filter(e=> e.type === 'income').reduce((acc,e)=>{ acc[e.category||'Revenue']=(acc[e.category||'Revenue']||0)+(e.amount||0); return acc; }, {});
    return Object.entries(groups).map(([category, gross])=> ({ category, gross, net: gross * 0.82 }));
  }, [data, snapshot]);
  const CustomBarTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="chart-tooltip">
          <div className="chart-tooltip-title">{label}</div>
          {payload.map((entry, index) => (
            <div key={index} className="chart-tooltip-value" style={{ color: entry.color }}>
              {entry.name}: {formatCurrency(entry.value, currency)}
            </div>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
  <BarChart syncId="finance-sync" onMouseLeave={()=> setActiveX && setActiveX(null)} onMouseMove={(st)=> setActiveX && setActiveX(st?.activeLabel||null)} data={sourceData} margin={{ top: density==='compact'?4:10, right: density==='compact'?4:10, left: 0, bottom: 0 }} className={`fin-chart fin-revenue ${density}`}>
        {!__financeGradientsInjected && <FinanceChartDefs />}
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis 
          dataKey="category" 
          tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
          angle={-45}
          textAnchor="end"
          height={60}
        />
        <YAxis 
          tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }}
          tickFormatter={(value) => formatCurrency(value, currency, true)}
        />
        <Tooltip content={<CustomBarTooltip />} />
        <Legend />
        
        <Bar 
          dataKey="gross" 
          fill="url(#finIncomeGrad)" 
          name="Gross Revenue"
          radius={[4, 4, 0, 0]}
          className="fin-bar"
        />
  <Bar 
          dataKey="net" 
          fill="url(#finNetGrad)" 
          name="Net Revenue"
          radius={[4, 4, 0, 0]}
          className="fin-bar"
        />
  {typeof activeX !== 'undefined' && activeX && <ReferenceLine x={activeX} stroke="var(--color-text-secondary)" strokeDasharray="2 2" />}
      </BarChart>
    </ResponsiveContainer>
  );
}

// Utility function for currency formatting
function formatCurrency(amount, currency = 'EUR', abbreviated = false) {
  if (abbreviated && Math.abs(amount) >= 1000) {
    if (Math.abs(amount) >= 1000000) return `${currency === 'EUR' ? '€' : '$'}${(amount / 1000000).toFixed(1)}M`;
    return `${currency === 'EUR' ? '€' : '$'}${(amount / 1000).toFixed(1)}K`;
  }
  try {
    return currencyService.formatMoney({ amount, currency, baseCurrencyAmount: amount }, { precision: 0 });
  } catch {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount);
  }
}

// Chart theme configuration
export const chartTheme = {
  colors: {
    primary: 'var(--color-accent)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-danger)',
    info: 'var(--color-info)',
    text: 'var(--color-text)',
    textSecondary: 'var(--color-text-secondary)',
    border: 'var(--color-border)',
    surface: 'var(--color-surface)'
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    fontSize: {
      small: 10,
      normal: 11,
      large: 12
    }
  },
  animation: {
    duration: 800,
    easing: 'ease-in-out'
  }
};

// ---------- Integration Hooks & Helpers ----------

// Context to share orchestrator snapshot/forecasts/anomalies
const FinanceDataContext = createContext(null);

export function FinanceDataProvider({ children, autoRefresh = true, refreshIntervalMs = 120000 }) {
  let core = null; if (useFinanceCore) { try { core = useFinanceCore(); } catch {} }
  const [snapshot, setSnapshot] = useState(core?.snapshot || null);
  const [forecasts, setForecasts] = useState(core?.snapshot?.forecasts || null);
  const [anomalies, setAnomalies] = useState(null);

  useEffect(() => {
    let mounted = true;
    if (core) {
      setSnapshot(core.snapshot);
      setForecasts(core.snapshot?.forecasts || null);
      return () => { mounted = false; };
    }
    (async () => {
      await Finance.initFinancePlatform();
      const snap = await Finance.loadLiveFinanceSnapshot();
      if(mounted) setSnapshot(snap);
      const f = await Finance.getForecastScenarios();
      if(mounted) setForecasts(f);
      if(snap.expenses?.length){
        const a = await Finance.detectAnomalies(snap.expenses);
        if(mounted) {
          setAnomalies(a);
          try {
            const map = {};
            a.forEach(an => {
              if(!an || typeof an.score !== 'number') return;
              const exp = snap.expenses.find(e => e.id === an.id);
              if(!exp) return;
              const key = exp.category || exp.description || 'Unknown';
              const current = map[key];
              if(!current || an.score > current.score){
                map[key] = { score: an.score, level: classifySeverity(an.score) };
              }
            });
            Object.assign(anomaliesMap, map);
          } catch(err){ console.warn('[FinanceDataProvider] anomalies map failed', err); }
        }
      }
    })();
    let timer;
    if(autoRefresh){
      timer = setInterval(async () => {
        const snap = await Finance.loadLiveFinanceSnapshot();
        setSnapshot(snap);
      }, refreshIntervalMs);
    }
    return () => { mounted = false; if(timer) clearInterval(timer); };
  }, [autoRefresh, refreshIntervalMs, core]);

  // Listen for emitted updates (optional real-time reaction)
  useEffect(()=>{
    const offSnap = Finance.on('snapshot', s => setSnapshot(s));
    const offForecast = Finance.on('forecast', f => setForecasts(f));
    const offAnom = Finance.on('anomalies', a => setAnomalies(a));
    return () => { offSnap(); offForecast(); offAnom(); };
  }, []);

  const value = useMemo(()=> ({ snapshot, forecasts, anomalies }), [snapshot, forecasts, anomalies]);
  return <FinanceDataContext.Provider value={value}>{children}</FinanceDataContext.Provider>;
}

export function useFinanceData({ live = false } = {}) {
  const ctx = useContext(FinanceDataContext) || {};
  if (live && useFinanceCore){
    try { const c = useFinanceCore(); if (c?.snapshot) return { snapshot: c.snapshot, forecasts: c.snapshot.forecasts, anomalies: ctx.anomalies }; } catch {}
  }
  return live ? ctx : { snapshot: null, forecasts: null, anomalies: null };
}

// Merge forecast line onto base series by month key
function mergeSeries(base = [], forecast = []) {
  if(!forecast.length) return base;
  const map = new Map(base.map(r => [r.month, { ...r }]));
  forecast.forEach(f => {
    const row = map.get(f.month) || { month: f.month };
    row.forecast = f.forecast ?? f.value ?? f.net;
    map.set(f.month, row);
  });
  return Array.from(map.values()).sort((a,b)=> a.month.localeCompare(b.month));
}

// Build anomalies map keyed by label/category for quick highlight
const anomaliesMap = {};
// NOTE: This simplistic approach is updated inside provider effect; could be improved.

function classifySeverity(score){
  if(score >= 0.85) return 'critical';
  if(score >= 0.65) return 'high';
  if(score >= 0.4) return 'medium';
  return 'low';
}

