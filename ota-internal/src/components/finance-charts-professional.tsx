// Migrated JSX implementation from .js for proper TSX parsing.
// (Original file now re-exports from this one.)
// --- begin original content ---
import React, { useEffect, useState, useMemo, useContext, createContext } from 'react';
import { useFinanceCore } from '../features/finance/core/finance-core';
import { buildSnapshot as buildFinanceSnapshot } from '../features/finance/core/snapshot-builder';

const __fallbackSnapshot = (() => { try { return buildFinanceSnapshot(); } catch (e) { console.warn('[finance-charts] Failed to build fallback snapshot', e); return null; } })();
function getCoreSnapshot(){ try { if (useFinanceCore){ const core = useFinanceCore(); if(core?.snapshot) return core.snapshot; } } catch(err){ if(!(window as any).__FINANCE_CORE_ERROR_LOGGED){ console.warn('[finance-charts] useFinanceCore error, using fallback', err); (window as any).__FINANCE_CORE_ERROR_LOGGED = true; } } return __fallbackSnapshot; }
import { currencyService } from '../shared/lib/currency-service';
import { ComposedChart, BarChart, PieChart, LineChart, Area, AreaChart, Bar, Line, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

const FINANCE_CHARTS_VERSION = 'v0.9.4-fallback-snapshot';
if (typeof window !== 'undefined'){ (window as any).__FINANCE_CHARTS_VERSION = FINANCE_CHARTS_VERSION; if(!(window as any).__FINANCE_CHARTS_LOGGED){ console.log('[finance-charts] Loaded version', FINANCE_CHARTS_VERSION); (window as any).__FINANCE_CHARTS_LOGGED = true; } }

let __financeGradientsInjected = false;
function FinanceChartDefs(){ useEffect(()=>{ __financeGradientsInjected = true; },[]); return (<defs>
  <linearGradient id="finIncomeGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-success)" stopOpacity={0.9} /><stop offset="100%" stopColor="var(--color-success)" stopOpacity={0.15} /></linearGradient>
  <linearGradient id="finExpenseGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-danger)" stopOpacity={0.9} /><stop offset="100%" stopColor="var(--color-danger)" stopOpacity={0.12} /></linearGradient>
  <linearGradient id="finNetGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.9} /><stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.15} /></linearGradient>
  <linearGradient id="finForecastGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--color-info)" stopOpacity={0.9} /><stop offset="100%" stopColor="var(--color-info)" stopOpacity={0.10} /></linearGradient>
  <filter id="finLineGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" /><feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge></filter>
</defs>); }

export function WaterfallChart({ data, currency='EUR', height=300, highlightAnomalies=true }:{data?:any[];currency?:string;height?:number;highlightAnomalies?:boolean;}){ const snapshot:any = getCoreSnapshot(); const sourceData = useMemo(()=>{ if(data?.length) return data; if(!snapshot?.expenses?.length){ return [ {label:'Start', value:12000, type:'start'}, {label:'Venue', value:-2500, type:'delta'}, {label:'Travel', value:-1800, type:'delta'}, {label:'Equipment', value:-1200, type:'delta'}, {label:'Marketing', value:-800, type:'delta'}, {label:'End', value:5700, type:'end'} ]; } const totalIncome = snapshot.expenses.filter((e:any)=> e.type==='income').reduce((a:number,b:any)=> a + (b.amount||0),0); const expenseGroups = Object.entries(snapshot.expenses.filter((e:any)=> e.type!=='income').reduce((acc:any,e:any)=>{ acc[e.category||'Other']=(acc[e.category||'Other']||0)+(e.amount||0); return acc; },{})).map(([label,value]:any)=> ({label, value:-Math.abs(value as number), type:'delta'})); const endValue = totalIncome + expenseGroups.reduce((a:number,b:any)=> a + b.value, 0); return [{label:'Start', value:totalIncome, type:'start'}, ...expenseGroups, {label:'End', value:endValue, type:'end'}]; },[data,snapshot]); function processWaterfallData(raw:any[]){ let running=0; return raw.map(item=>{ if(item.type==='start'){ running=item.value; return {...item,start:0,end:item.value,cumulative:item.value}; } if(item.type==='end'){ return {...item,start:0,end:running,cumulative:running}; } const end=running+item.value; const res={...item,start:running,end,cumulative:end,isPositive:item.value>0}; running=end; return res; }); } const processed = processWaterfallData(sourceData); const CustomTooltip = ({active,payload,label}:any)=> active&&payload?.length ? (<div className="chart-tooltip panel-glass" role="dialog" aria-label={`Detalle ${label}`}><div className="chart-tooltip-title">{label} {anomaliesMap[label] && <span className={`severity-badge severity-${anomaliesMap[label].level}`}>{anomaliesMap[label].level}</span>}</div><div className="chart-tooltip-value">{formatCurrency(payload[0].payload.value,currency)}</div><div className="chart-tooltip-meta">Total acumulado: {formatCurrency(payload[0].payload.cumulative,currency)}</div></div>) : null; return (<ResponsiveContainer width="100%" height={height}><ComposedChart data={processed} margin={{top:10,right:20,left:10,bottom:10}} className="fin-chart fin-waterfall">{!__financeGradientsInjected && <FinanceChartDefs />}<CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)"/><XAxis dataKey="label" tick={{fontSize:11,fill:'var(--color-text-secondary)'}} angle={-45} textAnchor="end" height={60}/><YAxis tick={{fontSize:11,fill:'var(--color-text-secondary)'}} tickFormatter={(v:number)=> formatCurrency(v,currency,true) }/><Tooltip content={<CustomTooltip />}/><Bar dataKey="start" stackId="waterfall" fill="transparent"/><Bar dataKey="value" stackId="waterfall" radius={[4,4,0,0]} className="fin-bar">{processed.map((entry:any,i:number)=>{ let fill='url(#finExpenseGrad)'; if(entry.type==='start'||entry.type==='end') fill='url(#finNetGrad)'; else if(entry.value>0) fill='url(#finIncomeGrad)'; if(highlightAnomalies && anomaliesMap[entry.label]) fill='var(--color-warning)'; return <Cell key={i} fill={fill} />; })}</Bar><Line type="monotone" dataKey="cumulative" stroke="var(--color-info)" strokeWidth={2} dot={{fill:'var(--color-info)',strokeWidth:2,r:4}}/></ComposedChart></ResponsiveContainer>); }

export function CategoryDonutChart({ data, currency='EUR', height=200 }:{data?:any[];currency?:string;height?:number;}){
  const snapshot:any = getCoreSnapshot();
  const sourceData:any[] = useMemo(()=>{
    if(data?.length) return data as any[];
    if(!snapshot?.expenses?.length){
      return [
        {name:'Venue', amount:2500, percentage:25},
        {name:'Travel',amount:1800,percentage:18},
        {name:'Equipment',amount:1200,percentage:12},
        {name:'Marketing',amount:800,percentage:8},
        {name:'Other',amount:3700,percentage:37}
      ];
    }
    const totals = snapshot.expenses.reduce((acc:any,e:any)=>{
      if(e.type!=='income'){
        acc[e.category||'Other']=(acc[e.category||'Other']||0)+(e.amount||0);
      }
      return acc;
    },{} as Record<string,number>);
    const grand = (Object.values(totals) as number[]).reduce((a:number,b:number)=> a + b, 0) || 1;
    return Object.entries(totals).map(([category,amount]:any)=> ({
      name:category,
      amount:Math.abs(amount as number),
      percentage:Math.round(((amount as number) / grand)*100)
    }));
  },[data,snapshot]);
  const COLORS=['var(--color-accent)','var(--color-success)','var(--color-warning)','var(--color-danger)','var(--color-info)','#8B5CF6','#06B6D4','#84CC16','#F97316','#EC4899'];
  const CustomPieTooltip = ({active,payload}:any)=> active&&payload?.length ? (
    <div className="chart-tooltip panel-glass">
      <div className="chart-tooltip-title">{payload[0].name}</div>
      <div className="chart-tooltip-value">{formatCurrency(Number(payload[0].value),currency)}</div>
      <div className="chart-tooltip-meta">{Number(payload[0].payload.percentage)}% del total</div>
    </div>
  ) : null;
  const CustomLabel = ({cx,cy,midAngle,innerRadius,outerRadius,percent}:any)=>{
    const pct = Number(percent);
    if(!pct || pct<0.05) return null;
    const RAD=Math.PI/180;
    const r=(innerRadius as number)+((outerRadius as number)-(innerRadius as number))*0.5;
    const x=(cx as number)+r*Math.cos(-(midAngle as number)*RAD);
    const y=(cy as number)+r*Math.sin(-(midAngle as number)*RAD);
    const displayPercent = Math.round(pct * 100);
    return (<text x={x} y={y} fill="white" textAnchor={x>(cx as number)? 'start':'end'} dominantBaseline="central" fontSize={10} fontWeight={600}>{`${displayPercent}%`}</text>);
  };
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart className="fin-chart fin-donut">
        {!__financeGradientsInjected && <FinanceChartDefs />}
        <Pie data={sourceData} cx="50%" cy="50%" labelLine={false} label={<CustomLabel />} outerRadius={60} innerRadius={25} fill="#8884d8" dataKey="amount" animationDuration={800}>
          {sourceData.map((entry:any,i:number)=>(<Cell key={i} fill={COLORS[i % COLORS.length]} stroke="var(--color-surface)" strokeWidth={2}/>))}
        </Pie>
        <Tooltip content={<CustomPieTooltip />}/>
      </PieChart>
    </ResponsiveContainer>
  );
}

// ---------------- Advanced Cash Flow Trend Chart ----------------
// Provides: monthly income/expense/net areas, rolling 3m average net line,
// cumulative net line, forecast overlay (active scenario) and anomaly markers.

interface CashFlowTrendChartProps { height?: number; currency?: string; live?: boolean; monthsBack?: number; }

export const CashFlowTrendChart: React.FC<CashFlowTrendChartProps> = ({ height=260, currency='EUR', monthsBack=11 }) => {
  const snapshot: any = getCoreSnapshot();
  // Build base month series either from finance core or fallback generator
  const monthSeries = useMemo(()=> {
    if(snapshot?.period){
      try {
        // Use finance core API if present (getMonthSeries) for consistent historical series
        if(typeof (window as any).financeCoreGetMonthSeries === 'function'){
          return (window as any).financeCoreGetMonthSeries(monthsBack);
        }
      } catch {}
    }
    // Fallback: synthesize monthsBack+1 series with sine pattern
    const now = new Date();
    const res: any[] = [];
    for(let i=monthsBack; i>=0; i--){
      const d = new Date(now); d.setMonth(d.getMonth()-i);
      const income = 18000 + 4000 * Math.sin((i/2));
      const expenses = 9000 + 2500 * Math.cos((i/1.8));
      const net = income - expenses;
      res.push({ month: `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`, income: Math.round(income), expenses: Math.round(expenses), net: Math.round(net) });
    }
    return res;
  }, [snapshot, monthsBack]);

  // Rolling average (3 months) and cumulative net
  const enriched = useMemo(()=> {
    let cumulative = 0;
    return monthSeries.map((pt: any, idx: number) => {
      cumulative += pt.net;
      const windowSlice: any[] = monthSeries.slice(Math.max(0, idx-2), idx+1);
      const rollingNet = Math.round(windowSlice.reduce((a: any,b: any)=> a + b.net,0)/windowSlice.length);
      return { ...pt, cumulative, rollingNet };
    });
  }, [monthSeries]);

  // Forecast overlay (active scenario in snapshot)
  const activeScenario = useMemo(()=> snapshot?.forecasts?.find((f:any)=> f.id === (snapshot.selectedScenarioId || snapshot.selectedScenarioId)) || snapshot?.forecasts?.[0], [snapshot]);
  const forecastSeries = useMemo(()=> {
    if(!activeScenario) return [];
    // Only future months relative to last point of enriched series
    const lastMonth = enriched[enriched.length-1]?.month;
    const lastDate = lastMonth ? new Date(lastMonth+'-01T00:00:00Z') : null;
    return activeScenario.series.filter((p:any)=> {
      if(!lastDate) return true;
      const [y,m] = p.month.split('-').map(Number);
      const d = new Date(y, m-1, 1);
      return d > lastDate;
    });
  }, [activeScenario, enriched]);

  // Anomalies mapping by month (expense spike -> highlight net dip)
  const anomalyMonths = useMemo(()=> {
    const map: Record<string, any[]> = {};
    (snapshot?.anomalies || []).forEach((a:any)=> {
      const d = new Date(a.date); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      map[key] = map[key] || []; map[key].push(a);
    });
    return map;
  }, [snapshot]);

  const CustomTooltip = ({active, payload, label}: any) => {
    if(!active || !payload?.length) return null;
    const row = payload[0]?.payload || {};
    const anomaliesForMonth = anomalyMonths[label];
    return (
      <div className="chart-tooltip panel-glass" role="dialog" aria-label={`Detalle ${label}`}>
        <div className="chart-tooltip-title">{label} {anomaliesForMonth && <span className="severity-badge severity-warning">{anomaliesForMonth.length} anom.</span>}</div>
        <div className="chart-tooltip-value">Ingreso: {formatCurrency(row.income,currency)}</div>
        <div className="chart-tooltip-value">Gasto: {formatCurrency(row.expenses,currency)}</div>
        <div className="chart-tooltip-meta">Net: {formatCurrency(row.net,currency)} | Acum: {formatCurrency(row.cumulative,currency)}</div>
        <div className="chart-tooltip-meta">Rolling(3): {formatCurrency(row.rollingNet,currency)}</div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={enriched} margin={{ top: 10, right: 25, left: 0, bottom: 10 }} className="fin-chart fin-cashflow">
        {!__financeGradientsInjected && <FinanceChartDefs />}
        <CartesianGrid strokeDasharray="4 3" stroke="var(--color-border)" />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} tickFormatter={(v:number)=> formatCurrency(v,currency,true)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Area type="monotone" dataKey="income" fill="url(#finIncomeGrad)" stroke="var(--color-success)" strokeWidth={2} name="Ingreso" />
        <Area type="monotone" dataKey="expenses" fill="url(#finExpenseGrad)" stroke="var(--color-danger)" strokeWidth={2} name="Gasto" />
        <Line type="monotone" dataKey="net" stroke="var(--color-accent)" strokeWidth={2} dot={{ r: 3 }} name="Net" />
        <Line type="monotone" dataKey="rollingNet" stroke="var(--color-info)" strokeDasharray="4 4" strokeWidth={2} dot={false} name="Net (Rolling 3)" />
        <Line type="monotone" dataKey="cumulative" stroke="var(--color-warning)" strokeWidth={2} dot={false} name="Acumulado" />
        {forecastSeries.length > 0 && (
          <LineChart data={forecastSeries} syncId="cashflowForecast">
            <Line type="monotone" dataKey="value" stroke="var(--color-info)" strokeWidth={2} strokeDasharray="2 6" name="Forecast" />
          </LineChart>
        )}
  {enriched.map((pt: any) => anomalyMonths[pt.month] && (
          <ReferenceLine key={pt.month} x={pt.month} stroke="var(--color-warning)" strokeDasharray="2 4" />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

// ---------------- Revenue Breakdown Chart ----------------
// Stacks income components and compares net margin; fallback synthetic if none.
interface RevenueBreakdownChartProps { height?: number; currency?: string; live?: boolean }

export const RevenueBreakdownChart: React.FC<RevenueBreakdownChartProps> = ({ height=240, currency='EUR' }) => {
  const snapshot: any = getCoreSnapshot();
  const data = useMemo(()=> {
    if(snapshot?.shows?.length){
      return snapshot.shows.slice(-8).map((s:any)=> ({
        show: s.city || s.venue || s.id,
        income: s.income,
        expenses: s.expenses,
        net: s.net,
        marginPct: s.income ? Math.round((s.net / s.income) * 100) : 0
      }));
    }
    // Fallback synthetic shows
    return Array.from({length:6}).map((_,i)=> ({ show: 'Show '+(i+1), income: 15000 + i*1200, expenses: 9000 + i*700, net: 6000 + i*500, marginPct: Math.round(((6000 + i*500)/(15000 + i*1200))*100) }));
  }, [snapshot]);

  const CustomTooltip = ({active, payload, label}: any) => {
    if(!active || !payload?.length) return null;
    const row = payload[0].payload;
    return (
      <div className="chart-tooltip panel-glass" role="dialog" aria-label={`Detalle ${label}`}>
        <div className="chart-tooltip-title">{label}</div>
        <div className="chart-tooltip-value">Ingreso: {formatCurrency(row.income,currency)}</div>
        <div className="chart-tooltip-value">Gasto: {formatCurrency(row.expenses,currency)}</div>
        <div className="chart-tooltip-meta">Net: {formatCurrency(row.net,currency)} | Margen {row.marginPct}%</div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={height}>
      <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 10 }} className="fin-chart fin-revenue-breakdown">
        {!__financeGradientsInjected && <FinanceChartDefs />}
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
        <XAxis dataKey="show" tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} angle={-35} textAnchor="end" interval={0} height={60} />
        <YAxis tick={{ fontSize: 11, fill: 'var(--color-text-secondary)' }} tickFormatter={(v:number)=> formatCurrency(v,currency,true)} />
        <Tooltip content={<CustomTooltip />} />
        <Legend />
        <Bar dataKey="income" fill="url(#finIncomeGrad)" stackId="rev" name="Ingreso" />
        <Bar dataKey="expenses" fill="url(#finExpenseGrad)" stackId="rev" name="Gasto" />
        <Line type="monotone" dataKey="net" stroke="var(--color-accent)" strokeWidth={2} dot={{ r:3 }} name="Net" />
  {data.map((d: any) => (
          <ReferenceLine key={d.show+':margin'} y={d.net} stroke="var(--color-accent)" strokeOpacity={0.15} />
        ))}
      </ComposedChart>
    </ResponsiveContainer>
  );
};

export const chartTheme = { colors:{ primary:'var(--color-accent)' } };

const FinanceDataContext = createContext<any>(null);
export function useFinanceData(){ return useContext(FinanceDataContext) || {}; }
// anomaliesMap is used by Waterfall; derive from snapshot if available for dynamic severity labeling
const anomaliesMap: any = (()=> {
  const snap: any = (typeof window !== 'undefined') ? getCoreSnapshot() : null;
  const map: Record<string, { level: string; amount: number } > = {};
  if(snap?.anomalies){
    snap.anomalies.forEach((a:any)=> { map[a.category || a.id] = { level: 'warning', amount: a.amount }; });
  }
  return map;
})();
function formatCurrency(amount:number,currency:string='EUR',abbr=false){ try { return currencyService.formatMoney({amount,currency:currency as 'EUR'|'USD'|'GBP',baseCurrencyAmount:amount},{precision:0}); } catch { return new Intl.NumberFormat('en-US',{style:'currency',currency,maximumFractionDigits:0,minimumFractionDigits:0}).format(amount); } }

// --- end simplified content ---
