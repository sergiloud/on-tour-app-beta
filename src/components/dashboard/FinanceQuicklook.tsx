import React from 'react';
import { Card } from '../../ui/Card';
import { t } from '../../lib/i18n';
import { ThisMonth } from '../finance/ThisMonth';
import { StatusBreakdown } from '../finance/StatusBreakdown';
import { NetTimeline } from '../finance/NetTimeline';
import Pipeline from '../finance/Pipeline';
import { useSettings } from '../../context/SettingsContext';
import { useFinance } from '../../context/FinanceContext';
import { Link } from 'react-router-dom';
import { prefetchByPath } from '../../routes/prefetch';

export const FinanceQuicklook: React.FC = () => {
  const { } = useSettings();
  const { targets, updateTargets, snapshot, thisMonth } = useFinance();
  // Simple KPIs: DSO (heuristic) and gross margin
  const dso = React.useMemo(() => {
    // Approximate: pending / (monthly revenue / 30)
    const monthlyIncome = snapshot.month.income || 1;
    const dailyRev = monthlyIncome / 30;
    return Math.max(0, Math.round((snapshot.pending || 0) / (dailyRev || 1)));
  }, [snapshot.month.income, snapshot.pending]);
  const grossMargin = React.useMemo(() => {
    const inc = snapshot.year.income || 0;
    const exp = snapshot.year.expenses || 0;
    const gm = inc === 0 ? 0 : ((inc - exp) / inc) * 100;
    return Math.round(gm);
  }, [snapshot.year.income, snapshot.year.expenses]);
  // Margin % MTD using month snapshot
  const marginMtd = React.useMemo(()=>{
    const inc = snapshot.month.income || 0; const exp = snapshot.month.expenses || 0; return inc===0?0: Math.round(((inc-exp)/inc)*100);
  }, [snapshot.month.income, snapshot.month.expenses]);
  // Net forecast vs target (simple projection: month net extrapolated by days passed)
  const netForecastVsTarget = React.useMemo(()=>{
    const netMonth = snapshot.month.net || 0;
    const today = new Date();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
    const day = today.getDate();
    const forecast = day===0? netMonth : Math.round((netMonth / day) * daysInMonth);
    const target = targets.netMonth || 0;
    const delta = target===0? 0 : Math.round(((forecast - target)/Math.max(1,target))*100);
    return { forecast, target, delta };
  }, [snapshot.month.net, targets.netMonth]);
  // Variation vs previous month gross margin
  const marginPrev = React.useMemo(()=> {
    if (!thisMonth?.prev) return 0;
    const inc = thisMonth.prev.income || 0; const exp = thisMonth.prev.expenses || 0; return inc===0?0: ((inc-exp)/inc)*100;
  }, [thisMonth?.prev]);
  const marginDelta = Math.round(marginMtd - marginPrev);
  const arrow = (v:number)=> v>0?'▲': v<0?'▼':'—';
  // Helper for target field color classes
  const targetClass = (val:number, kind:'net'|'income'|'expenses'|'costs'|'pending') => {
    if (kind==='expenses' || kind==='costs') return val>0? 'outline outline-1 outline-amber-500/40' : '';
    if (kind==='net' || kind==='income') return val<0? 'outline outline-1 outline-rose-500/50' : '';
    if (kind==='pending') return val> (targets.pending||0) ? 'outline outline-1 outline-amber-500/40' : '';
    return '';
  };
  return (
    <Card className="p-4 flex flex-col gap-4 overflow-hidden" aria-label={t('finance.quicklook')}>
      <header className="flex items-center justify-between gap-3">
  <h3 className="widget-title flex-1">{t('finance.quicklook')}</h3>
        <div className="hidden md:flex items-center gap-2 text-[10px] opacity-80 flex-wrap max-w-[60%]">
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5" title="Days Sales Outstanding">DSO {dso}d</span>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5" title="Gross Margin">GM {grossMargin}%</span>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5" title="Margin % MTD">MTD {marginMtd}%</span>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5" title="Forecast vs Target">FvT {netForecastVsTarget.delta}%</span>
          <span className="px-2 py-1 rounded bg-slate-100 dark:bg-white/5" title="Margin Δ vs prev">Δ {arrow(marginDelta)} {Math.abs(marginDelta)}%</span>
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <details className="relative">
            <summary className="cursor-pointer select-none text-[11px] px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-200 dark:bg-white/20">{t('finance.targets')}</summary>
            <div className="absolute right-0 mt-1 z-20 p-3 rounded-md bg-ink-900/95 border border-slate-200 dark:border-white/10 shadow-lg min-w-[300px] grid grid-cols-2 gap-2">
              <label className="text-[10px] opacity-80 col-span-2">{t('finance.targets.month')}</label>
              <label className="text-[10px] opacity-70">{t('finance.income')}</label>
              <input aria-label="incomeMonth" className={`bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-[11px] ${targetClass(targets.incomeMonth,'income')}`} type="number" inputMode="numeric" value={targets.incomeMonth} onChange={(e)=>updateTargets({ incomeMonth: Number(e.target.value||0) })} />
              <label className="text-[10px] opacity-70">{t('finance.expenses')}</label>
              <input aria-label="expensesMonth" className={`bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-[11px] ${targetClass(targets.expensesMonth,'expenses')}`} type="number" inputMode="numeric" value={targets.expensesMonth} onChange={(e)=>updateTargets({ expensesMonth: Number(e.target.value||0) })} />
              <label className="text-[10px] opacity-70">{t('finance.net')}</label>
              <input aria-label="netMonth" className={`bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-[11px] ${targetClass(targets.netMonth,'net')}`} type="number" inputMode="numeric" value={targets.netMonth} onChange={(e)=>updateTargets({ netMonth: Number(e.target.value||0) })} />
              <label className="text-[10px] opacity-80 col-span-2 mt-1">{t('finance.targets.year')}</label>
              <label className="text-[10px] opacity-70">{t('finance.net')}</label>
              <input aria-label="yearNet" className="bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-[11px]" type="number" inputMode="numeric" value={targets.yearNet} onChange={(e)=>updateTargets({ yearNet: Number(e.target.value||0) })} />
              <label className="text-[10px] opacity-70">{t('finance.pending')}</label>
              <input aria-label="pending" className={`bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-[11px] ${targetClass(targets.pending,'pending')}`} type="number" inputMode="numeric" value={targets.pending} onChange={(e)=>updateTargets({ pending: Number(e.target.value||0) })} />
              <label className="text-[10px] opacity-70">{t('finance.costs')}</label>
              <input aria-label="costsMonth" className={`bg-slate-200 dark:bg-white/10 rounded px-2 py-1 text-[11px] ${targetClass(targets.costsMonth,'costs')}`} type="number" inputMode="numeric" value={targets.costsMonth} onChange={(e)=>updateTargets({ costsMonth: Number(e.target.value||0) })} />
              <div className="col-span-2 mt-1 text-[10px] opacity-70 flex flex-wrap gap-2">
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5">Fcast: {netForecastVsTarget.forecast}</span>
                <span className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-white/5">Δ% {netForecastVsTarget.delta}</span>
              </div>
            </div>
          </details>
          <Link to="/dashboard/finance" onMouseEnter={()=>prefetchByPath('/dashboard/finance')} aria-label={t('finance.openFull') || (t('common.open') + ' ' + t('nav.finance'))} className="text-[11px] px-2 py-1 rounded-md bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-200 dark:bg-white/20">{t('finance.openFull') || t('common.open')}</Link>
        </div>
      </header>
      <div className="space-y-3">
  <ThisMonth />
  <StatusBreakdown />
  <NetTimeline />
  <Pipeline />
      </div>
    </Card>
  );
};

export default FinanceQuicklook;
