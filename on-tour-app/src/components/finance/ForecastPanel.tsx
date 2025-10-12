import React, { useMemo, useState } from 'react';
import { Card } from '../../ui/Card';
import { t } from '../../lib/i18n';
import { useFinance } from '../../context/FinanceContext';
import { useSettings } from '../../context/SettingsContext';
import { trackEvent } from '../../lib/telemetry';

type Pt = { x:number; y:number };

const ForecastPanel: React.FC = () => {
  const { monthlySeries, thisMonth, snapshot } = useFinance();
  const { fmtMoney } = useSettings();

  const [showTable, setShowTable] = useState(false);
  const { pointsActual, pointsP50, bandPoly, alert, table } = useMemo(() => {
    const months = monthlySeries.months;
    const nets = monthlySeries.net;
    if (!months.length || !nets.length) return { pointsActual: [], pointsP50: [], bandPoly: '', alert: null as null | { type:'under'|'above'; pct:number; delta:number }, table: [] as Array<{month:string; net:number; p50:number; p10:number; p90:number}> };

    // Build simple forecast: p50 as rolling mean of last 3 actuals; p10/p90 as ±15%
    const curKey = `${new Date(snapshot.asOf).getFullYear()}-${String(new Date(snapshot.asOf).getMonth() + 1).padStart(2,'0')}`;
    const curIdx = Math.max(0, months.indexOf(curKey));
    const p50: number[] = [];
    const p10: number[] = [];
    const p90: number[] = [];
    for (let i=0;i<months.length;i++){
      if (i <= curIdx && nets[i] != null) {
        // For past/current months, align p50 softly towards actual using short SMA
        const start = Math.max(0, i-2);
        const slice = nets.slice(start, i+1);
        const mean = slice.reduce((a,b)=>a+b,0)/slice.length;
        p50.push(Math.round(mean));
      } else {
        // For future months, reuse last known SMA
        const start = Math.max(0, curIdx-2);
        const slice = nets.slice(start, curIdx+1);
        const mean = slice.length ? slice.reduce((a,b)=>a+b,0)/slice.length : 0;
        p50.push(Math.round(mean));
      }
      p10.push(Math.round(p50[i]! * 0.85));
      p90.push(Math.round(p50[i]! * 1.15));
    }

    // Normalize to chart coords (0..100 by 0..40)
    const vals = [...nets, ...p10, ...p90].filter(Number.isFinite);
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const h = 36; const w = 100;
    const x = (i:number)=> months.length===1 ? 0 : (i/(months.length-1))*w;
    const y = (v:number)=> {
      if (max === min) return h/2; // flat
      const t = (v - min) / (max - min);
      return h - t*h;
    };

  const toPts = (arr:number[]): Pt[] => arr.map((v,i)=>({ x:x(i), y:y(v) }));
    const pointsActual = toPts(nets);
    const pointsP50 = toPts(p50);
    const low = toPts(p10);
    const high = toPts(p90);
    const bandPoly = [...high, ...low.slice().reverse()].map(p=>`${p.x},${p.y}`).join(' ');
  const table = months.map((m, i) => ({ month: m, net: nets[i] ?? 0, p50: p50[i] ?? 0, p10: p10[i] ?? 0, p90: p90[i] ?? 0 }));

    // Alert for current month deviation
    let alert: null | { type:'under'|'above'; pct:number; delta:number } = null;
    const actualNow = thisMonth.net;
    const p50Now = p50[curIdx] ?? thisMonth.net;
    if (p50Now && Number.isFinite(actualNow)){
      const delta = actualNow - p50Now;
      const pct = p50Now === 0 ? (actualNow!==0 ? 100 : 0) : Math.round((delta/p50Now)*100);
      if (pct <= -10) alert = { type:'under', pct: Math.abs(pct), delta: Math.abs(delta) };
      if (pct >= 15) alert = { type:'above', pct, delta };
      if (alert) try { trackEvent('finance.forecast.alert', { type: alert.type, pct: alert.pct }); } catch {}
    }

    return { pointsActual, pointsP50, bandPoly, alert, table };
  }, [monthlySeries, thisMonth, snapshot.asOf]);

  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">{t('finance.forecast')}</h3>
        <div className="flex items-center gap-2 text-[10px] opacity-80">
          <button className="text-[11px] px-2 py-0.5 rounded bg-white/10 hover:bg-white/15" onClick={()=> setShowTable(v=>!v)} aria-pressed={showTable}>
            {showTable ? (t('charts.hideTable') || 'Hide table') : (t('charts.viewTable') || 'View data as table')}
          </button>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-1 rounded bg-accent-400" />{t('finance.forecast.legend.actual')}</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-1 rounded border border-white/50" />{t('finance.forecast.legend.p50')}</span>
          <span className="inline-flex items-center gap-1"><span className="inline-block w-3 h-2 rounded bg-white/10 border border-white/10" />{t('finance.forecast.legend.band')}</span>
        </div>
      </div>
      {showTable ? (
        <div className="mt-2 rounded-md border border-white/10 bg-white/5 overflow-hidden">
          <div className="max-h-48 overflow-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left opacity-70">
                  <th className="px-2 py-1">{t('common.date')||'Date'}</th>
                  <th className="px-2 py-1">{t('finance.forecast.legend.actual')||'Actual net'}</th>
                  <th className="px-2 py-1">{t('finance.forecast.legend.p50')||'Forecast p50'}</th>
                  <th className="px-2 py-1">p10</th>
                  <th className="px-2 py-1">p90</th>
                </tr>
              </thead>
              <tbody>
                {table.map((row)=> (
                  <tr key={row.month} className="border-t border-white/10">
                    <td className="px-2 py-1 whitespace-nowrap">{row.month}</td>
                    <td className="px-2 py-1 tabular-nums">{fmtMoney(row.net)}</td>
                    <td className="px-2 py-1 tabular-nums">{fmtMoney(row.p50)}</td>
                    <td className="px-2 py-1 tabular-nums">{fmtMoney(row.p10)}</td>
                    <td className="px-2 py-1 tabular-nums">{fmtMoney(row.p90)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="mt-2 rounded-md border border-white/10 bg-white/5 overflow-hidden">
          <svg viewBox="0 0 100 36" className="w-full h-28 block">
            {bandPoly && (
              <polygon points={bandPoly} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.1)" strokeWidth={0.4} />
            )}
            {pointsP50.length>1 && (
              <path d={pointsP50.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ')} fill="none" stroke="rgba(255,255,255,0.6)" strokeDasharray="2 2" strokeWidth={0.6} />
            )}
            {pointsActual.length>1 && (
              <path d={pointsActual.map((p,i)=>`${i===0?'M':'L'}${p.x},${p.y}`).join(' ')} fill="none" stroke="var(--accent-400)" strokeWidth={0.9} />
            )}
          </svg>
        </div>
      )}
      {alert && (
        <div className="mt-2 text-[11px]">
          {alert.type==='under' ? (
            <span className="px-2 py-1 rounded bg-rose-500/20 text-rose-300">
              {t('finance.forecast.alert.under')} {alert.pct}%{alert.delta ? ` (${fmtMoney(alert.delta)})` : ''}
            </span>
          ) : (
            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-300">
              {t('finance.forecast.alert.above')} {alert.pct}%{alert.delta ? ` (${fmtMoney(alert.delta)})` : ''}
            </span>
          )}
        </div>
      )}
    </Card>
  );
};

export default ForecastPanel;
