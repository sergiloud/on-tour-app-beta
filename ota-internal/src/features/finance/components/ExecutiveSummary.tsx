import React, { useMemo } from 'react';
import { useFinanceCore } from '../core/finance-core';
import { selectMonthlySeries } from '../core/finance-selectors';

function Sparkline({ values, width=120, height=32, color='var(--finance-positive)' }: { values:number[]; width?:number;height?:number;color?:string }){
  if(!values.length) return null;
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;
  const pts = values.map((v,i)=>{
    const x = (i/(values.length-1))*width;
    const y = height - ((v - min)/range)*height;
    return `${x},${y}`;
  }).join(' ');
  return (
    <svg width={width} height={height} style={{overflow:'visible'}}>
      <polyline fill="none" stroke={color} strokeWidth={2} points={pts} />
    </svg>
  );
}

export const ExecutiveSummary: React.FC = () => {
  const { snapshot } = useFinanceCore();
  const series = snapshot ? selectMonthlySeries(snapshot) : [];
  const incomeTrend = series.map(s => s.revenue);
  const net = snapshot?.kpis.net ?? 0;
  const margin = snapshot?.kpis.marginPct ?? 0;
  const prev = snapshot?.kpis.previousNet ?? 0;
  const delta = prev ? ((net - prev)/Math.abs(prev))*100 : 0;
  const status: 'good'|'warn'|'bad' = margin > 25 ? 'good' : margin > 10 ? 'warn' : 'bad';
  const statusColor = status==='good' ? 'var(--finance-positive)' : status==='warn' ? 'var(--finance-accent)' : 'var(--finance-negative)';
  const deltaLabel = `${delta>0?'+':''}${delta.toFixed(1)}% vs prev`;

  return (
    <div style={{display:'flex',gap:24,flexWrap:'wrap'}}>
      <div style={{flex:'1 1 260px',background:'var(--color-surface)',padding:16,borderRadius:12,position:'relative'}}>
        <div style={{fontSize:12,opacity:0.7,marginBottom:4}}>Net</div>
        <div style={{fontSize:32,fontWeight:600,lineHeight:1}}>{net.toLocaleString()}</div>
        <div style={{fontSize:12,marginTop:4,color:statusColor}}>{deltaLabel}</div>
        <div style={{position:'absolute',top:8,right:8}}><Sparkline values={incomeTrend.slice(-8)} /></div>
        <div style={{marginTop:8,fontSize:12}}>Margin: <strong style={{color:statusColor}}>{margin}%</strong></div>
      </div>
      <div style={{flex:'1 1 160px',background:'var(--color-surface)',padding:16,borderRadius:12}}>
        <div style={{fontSize:12,opacity:0.7,marginBottom:4}}>Income</div>
        <div style={{fontSize:24,fontWeight:600}}>{snapshot?.kpis.income.toLocaleString()}</div>
        <div style={{marginTop:12}}><Sparkline values={incomeTrend.slice(-8)} color='var(--finance-accent)' /></div>
      </div>
      <div style={{flex:'1 1 160px',background:'var(--color-surface)',padding:16,borderRadius:12}}>
        <div style={{fontSize:12,opacity:0.7,marginBottom:4}}>Expenses</div>
        <div style={{fontSize:24,fontWeight:600}}>{snapshot?.kpis.expenses.toLocaleString()}</div>
        <div style={{marginTop:12}}><Sparkline values={series.map(s=>s.expenses).slice(-8)} color='var(--finance-negative)' /></div>
      </div>
    </div>
  );
};

export default ExecutiveSummary;
