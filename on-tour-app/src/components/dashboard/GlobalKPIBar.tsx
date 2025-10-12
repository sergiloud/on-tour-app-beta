import React from 'react';
import { useKpi } from '../../context/KPIDataContext';
import { useFinance } from '../../context/FinanceContext';
import { ProgressBar } from '../../ui/ProgressBar';
import { Card } from '../../ui/Card';
import { useSettings } from '../../context/SettingsContext';
import MiniChart from '../../ui/MiniChart';
import { useKpiSparklines } from '../../hooks/useKpiSparklines';
import { t } from '../../lib/i18n';

const pctDelta = (current:number, prev:number) => prev === 0 ? (current === 0 ? 0 : 100) : ((current - prev) / prev) * 100;
// Masking removed: use real values directly

export const GlobalKPIBar: React.FC = () => {
  const { raw, display, targets } = useKpi();
  const { loading, thisMonth } = useFinance();
  const { setKpiTickerHidden } = useSettings();
  const ratio = (a:number, b:number) => b === 0 ? 0 : (a / b);

  // Build 7-point tails via centralized hook
  const { incomeSeries, costsSeries, netSeries, prevMonth } = useKpiSparklines();

  return (
    <div className="sticky top-0 z-30 backdrop-blur-xl bg-ink-900/55 border-b border-white/5">
      <Card className="!bg-transparent !shadow-none !border-0">
        <div className="flex items-center justify-between px-3 py-1.5">
          <div className="flex flex-nowrap items-center gap-3 overflow-x-auto text-[11px] font-medium pr-2" aria-label="Business vitals">
            {loading ? (
              <>
                <SkeletonKPI label="Year Net" />
                <SkeletonKPI label="Pending" />
                <SkeletonKPI label="Income (Month)" />
                <SkeletonKPI label="Costs (Month)" />
                <SkeletonKPI label="Net (Month)" />
              </>
            ) : (
              <>
                <KPI label="Year Net" value={display.yearNet} progress={ratio(raw.yearNet, targets.yearNet)} />
                <KPI label="Pending" value={display.pending} progress={ratio(raw.pending, targets.pending)} tone="amber" />
                <KPI
                  label="Income (Month)"
                  value={display.incomeMonth}
                  progress={ratio(raw.incomeMonth, targets.incomeMonth)}
                  tone="emerald"
                  sparkline={incomeSeries}
                  deltaPct={pctDelta(thisMonth.income, prevMonth.income)}
                />
                <KPI
                  label="Costs (Month)"
                  value={display.costsMonth}
                  progress={ratio(raw.costsMonth, targets.costsMonth)}
                  tone="rose"
                  sparkline={costsSeries}
                  deltaPct={pctDelta(thisMonth.expenses, prevMonth.costs)}
                />
                <KPI
                  label="Net (Month)"
                  value={display.netMonth}
                  progress={ratio(raw.netMonth, targets.netMonth)}
                  tone="emerald"
                  sparkline={netSeries}
                  deltaPct={pctDelta(thisMonth.net, prevMonth.net)}
                />
              </>
            )}
          </div>
          {/* Hide ticker toggle with persistence */}
          <button
            type="button"
            className="ml-2 text-[10px] opacity-70 hover:opacity-100 underline"
            aria-label={`${t('common.hide')} ticker`}
            onClick={()=> setKpiTickerHidden(true)}
          >{t('common.hide') || 'Hide'}</button>
        </div>
      </Card>
    </div>
  );
};

type KPIProps = { label: string; value: string; progress: number; tone?: 'amber'|'rose'|'emerald'; sparkline?: number[]; mask?: boolean; deltaPct?: number };

const KPI: React.FC<KPIProps> = React.memo(({ label, value, progress, tone, sparkline, mask, deltaPct })=>{
  const toneMap: Record<string,'accent'|'amber'|'rose'|'emerald'> = {
    amber:'amber',
    rose:'rose',
    emerald:'emerald'
  };
  const resolvedTone = tone ? toneMap[tone] : 'accent';
  const over = progress > 1;
  const deltaTone = typeof deltaPct === 'number' ? (deltaPct > 0 ? 'emerald' : deltaPct < 0 ? 'rose' : 'amber') : null;
  return (
    <div
      className="group kpi-item relative flex flex-col gap-1 min-w-[88px] text-left rounded-md"
      aria-label={label + ' ' + value + (over? ` over target ${Math.round((progress-1)*100)}%` : '')}
      title={`${label}: ${value}${over? ` • ${Math.round((progress-1)*100)}% over target` : ''}`}
    >
      <span className="text-[10px] opacity-80 group-hover:opacity-100 transition" style={{color:'var(--text-secondary)'}}>{label}</span>
      <div className="flex items-end justify-between gap-3">
        <span className="kpi-value text-[16px] md:text-[18px] leading-none tabular-nums" style={{color:'var(--text-primary)'}}>{value}</span>
        {/* Per-KPI live region for screen readers to announce value changes */}
        <span className="sr-only" aria-live="polite">{label} {value}</span>
        {sparkline && sparkline.length > 0 && (
          <div className="opacity-80 hidden sm:block">
            <MiniChart values={sparkline} tone={resolvedTone==='emerald'?'emerald': resolvedTone==='rose'?'rose':'accent'} width={54} height={16} ariaLabel={`${label} sparkline`} mask={!!mask} />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2 mt-0.5">
        <ProgressBar value={progress} tone={over ? 'emerald' : resolvedTone} height="xs" aria-label={label + ' progress'} />
        {over && (
          <span className="px-1 py-0.5 rounded bg-emerald-400/80 text-black text-[9px]" title={`${Math.round((progress-1)*100)}% over target`}>+{Math.round((progress-1)*100)}%</span>
        )}
        {typeof deltaPct === 'number' && (
          <span
            className={`px-1 py-0.5 rounded text-[9px] ${deltaTone==='emerald' ? 'bg-emerald-400/80 text-black' : deltaTone==='rose' ? 'bg-rose-400/80 text-black' : 'bg-amber-400/80 text-black'}`}
            title={`${deltaPct>0?'+':''}${deltaPct.toFixed(1)}% vs previous month`}
          >{deltaPct>0?'+':''}{deltaPct.toFixed(1)}% vs previous month</span>
        )}
        {/* Live delta announcement per KPI to keep SR updates concise */}
        {typeof deltaPct === 'number' && (
          <span className="sr-only" aria-live="polite">{`${label} ${deltaPct>0?'up':deltaPct<0?'down':'flat'} ${Math.abs(deltaPct).toFixed(1)}% vs previous month`}</span>
        )}
      </div>
    </div>
  );
}, (prev, next) => {
  // Custom compare to avoid re-renders when values don't change
  if (prev.label !== next.label) return false;
  if (prev.value !== next.value) return false;
  if (prev.progress !== next.progress) return false;
  if (prev.tone !== next.tone) return false;
  if (prev.deltaPct !== next.deltaPct) return false;
  const a = prev.sparkline || [];
  const b = next.sparkline || [];
  if (a.length !== b.length) return false;
  for (let i=0;i<a.length;i++){ if (a[i] !== b[i]) return false; }
  return true;
});

export default GlobalKPIBar;

const SkeletonKPI: React.FC<{ label: string }> = ({ label }) => (
  <div className="kpi-item min-w-[88px]">
    {/* Expose label text for accessibility while keeping visual skeleton */}
    <span className="sr-only">{label}</span>
    <div className="h-1.5 w-14 rounded bg-white/10 mb-1" aria-hidden />
    <div className="h-3.5 w-16 rounded bg-white/15 mb-1 animate-pulse" aria-label={`${label} loading`} />
    <div className="h-1.5 w-24 rounded-full bg-white/10 overflow-hidden">
      <div className="h-full w-1/3 bg-gradient-to-r from-white/25 to-white/10 animate-[pulse_1.2s_ease-in-out_infinite]" />
    </div>
  </div>
);
