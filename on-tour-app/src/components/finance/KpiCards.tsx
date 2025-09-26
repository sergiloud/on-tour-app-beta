import React, { useMemo } from 'react';
import { Card } from '../../ui/Card';
import { useFinance } from '../../context/FinanceContext';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';

const KpiItem: React.FC<{ label: string; value: string; aria?: string; tone?: 'pos'|'neg'|'neutral'; title?: string }>=({ label, value, aria, tone='neutral', title })=> (
  <Card className={`p-3 border border-white/10 glass ${tone==='pos'?'outline outline-1 outline-emerald-500/30':''} ${tone==='neg'?'outline outline-1 outline-rose-500/30':''}`} aria-label={aria || `${label}: ${value}`} title={title}>
    <div className="text-[11px] opacity-70">{label}</div>
    <div className="text-lg font-semibold tabular-nums">{value}</div>
  </Card>
);

export const KpiCards: React.FC = () => {
  const { snapshot, targets, compareMonthlySeries } = useFinance();
  const { fmtMoney, comparePrev } = useSettings();

  const { forecast, deltaPct, gmPct, dsoDays } = useMemo(() => {
    // Forecast EOM: extrapolate current month net by days passed
    const today = new Date(snapshot.asOf || Date.now());
    const daysInMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
    const day = today.getDate();
    const netMonth = snapshot.month.net || (snapshot.month.income - snapshot.month.expenses);
    const forecast = day<=1 ? netMonth : Math.round((netMonth / Math.max(1, day)) * daysInMonth);
    const target = targets.netMonth || 0;
    const deltaPct = target===0 ? 0 : Math.round(((forecast - target)/Math.max(1,target))*100);
    const incY = snapshot.year.income || 0; const expY = snapshot.year.expenses || 0;
    const gmPct = incY===0?0: Math.round(((incY-expY)/incY)*100);
    const dailyRev = (snapshot.month.income||0) / 30;
    const dsoDays = Math.max(0, Math.round((snapshot.pending||0) / Math.max(1, dailyRev)));
    return { forecast, deltaPct, gmPct, dsoDays };
  }, [snapshot, targets.netMonth]);

  const mtdNet = snapshot.month.net;
  const ytdNet = snapshot.year.net;
  const prevMonthNet = (()=>{
    if (!comparePrev || !compareMonthlySeries) return null;
    // Find matching month key vs current snapshot.asOf
    const curKey = `${new Date(snapshot.asOf).getFullYear()}-${String(new Date(snapshot.asOf).getMonth() + 1).padStart(2,'0')}`;
    const idx = compareMonthlySeries.months.indexOf(curKey);
    const safeIdx = idx === -1 ? compareMonthlySeries.net.length - 1 : idx;
    return compareMonthlySeries.net[safeIdx] ?? null;
  })();
  const prevYearNet = (()=>{
    if (!comparePrev || !compareMonthlySeries) return null;
    // Rough proxy: sum compare series as YTD of previous period window length
    return compareMonthlySeries.net.reduce((a,b)=> a + (b||0), 0);
  })();
  const mtdDeltaPct = prevMonthNet==null || prevMonthNet===0 ? null : Math.round(((mtdNet - prevMonthNet)/Math.abs(prevMonthNet))*100);
  const ytdDeltaPct = prevYearNet==null || prevYearNet===0 ? null : Math.round(((ytdNet - prevYearNet)/Math.abs(prevYearNet))*100);

  const deltaTone: 'pos'|'neg'|'neutral' = deltaPct===0? 'neutral' : (deltaPct>0? 'pos':'neg');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      <KpiItem
        label={t('finance.kpi.mtdNet') || 'MTD Net'}
        value={`${fmtMoney(mtdNet)}${comparePrev && mtdDeltaPct!=null?` (${mtdDeltaPct>0?'+':''}${mtdDeltaPct}%)`:''}`}
        aria={`${t('finance.kpi.mtdNet')}: ${fmtMoney(mtdNet)}${comparePrev && mtdDeltaPct!=null?` (${mtdDeltaPct>0?'+':''}${mtdDeltaPct}%)`:''}`}
        title={comparePrev && prevMonthNet!=null ? `${t('common.current')||'Current'}: ${fmtMoney(mtdNet)} • ${(t('common.compare')||'Compare')}: ${fmtMoney(prevMonthNet)}` : undefined}
        tone="neutral"
      />
      <KpiItem
        label={t('finance.kpi.ytdNet') || 'YTD Net'}
        value={`${fmtMoney(ytdNet)}${comparePrev && ytdDeltaPct!=null?` (${ytdDeltaPct>0?'+':''}${ytdDeltaPct}%)`:''}`}
        aria={`${t('finance.kpi.ytdNet')}: ${fmtMoney(ytdNet)}${comparePrev && ytdDeltaPct!=null?` (${ytdDeltaPct>0?'+':''}${ytdDeltaPct}%)`:''}`}
        title={comparePrev && prevYearNet!=null ? `${t('common.current')||'Current'}: ${fmtMoney(ytdNet)} • ${(t('common.compare')||'Compare')}: ${fmtMoney(prevYearNet)}` : undefined}
      />
      <KpiItem label={t('finance.kpi.forecastEom') || 'Forecast EOM'} value={fmtMoney(forecast)} aria={`${t('finance.kpi.forecastEom')}: ${fmtMoney(forecast)}`} />
      <KpiItem label={t('finance.kpi.deltaTarget') || 'Δ vs Target'} value={`${deltaPct>0?'+':''}${deltaPct}%`} aria={`${t('finance.kpi.deltaTarget')}: ${deltaPct}%`} title={`Forecast ${fmtMoney(forecast)} • Target ${targets.netMonth? fmtMoney(targets.netMonth): fmtMoney(0)}`} tone={deltaTone} />
      <KpiItem label={t('finance.kpi.gm') || 'GM%'} value={`${gmPct}%`} aria={`${t('finance.kpi.gm')}: ${gmPct}%`} />
      <KpiItem label={t('finance.kpi.dso') || 'DSO'} value={`${dsoDays}d`} aria={`${t('finance.kpi.dso')}: ${dsoDays} days`} />
    </div>
  );
};

export default KpiCards;
