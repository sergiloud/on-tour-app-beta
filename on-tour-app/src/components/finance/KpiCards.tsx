import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useFinance } from '../../context/FinanceContext';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { Card } from '../../ui/Card';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

/**
 * KpiCards: Finance KPIs displayed as cards
 * Uses unified Card component with glass styling for consistency across app
 * Enhanced with Framer Motion animations and professional scaling
 */
const KpiItem: React.FC<{
  label: string;
  value: string;
  aria?: string;
  tone?: 'pos' | 'neg' | 'neutral';
  title?: string;
  icon?: React.ReactNode;
  delta?: { value: number; isPositive: boolean };
  delay?: number;
}> = ({ label, value, aria, tone = 'neutral', title, icon, delta, delay = 0 }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    whileHover={{ scale: 1.01 }}
  >
    <Card
      className={`p-5 border border-white/10 rounded-lg bg-gradient-to-br from-slate-900/40 to-slate-800/20 backdrop-blur-sm hover:border-white/20 hover:shadow-md transition-all duration-300 flex flex-col gap-2 ${
        tone === 'pos' ? 'border-emerald-500/30 outline outline-1 outline-emerald-500/20' : ''
      } ${tone === 'neg' ? 'border-rose-500/30 outline outline-1 outline-rose-500/20' : ''}`}
      aria-label={aria || `${label}: ${value}`}
      title={title}
    >
      <div className="flex items-center gap-1.5 pb-1 border-b border-white/10">
        {icon && <span className="opacity-60 flex-shrink-0">{icon}</span>}
        <div className="text-[11px] font-medium uppercase tracking-wider opacity-70 truncate">
          {label}
        </div>
      </div>
      <div className="text-xl font-bold tabular-nums text-white">{value}</div>
      {delta && (
        <motion.div
          className={`flex items-center gap-1 text-xs font-medium ${
            delta.isPositive ? 'text-emerald-400' : 'text-rose-400'
          }`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: delay + 0.2 }}
        >
          {delta.isPositive ? (
            <TrendingUp className="w-3 h-3 flex-shrink-0" />
          ) : (
            <TrendingDown className="w-3 h-3 flex-shrink-0" />
          )}
          <span className="tabular-nums">
            {delta.isPositive ? '+' : ''}
            {delta.value}%
          </span>
        </motion.div>
      )}
    </Card>
  </motion.div>
);

export const KpiCards: React.FC = React.memo(() => {
  const { snapshot, targets, compareMonthlySeries } = useFinance();
  const { fmtMoney, comparePrev } = useSettings();

  const { forecast, deltaPct, gmPct, dsoDays } = useMemo(() => {
    // Forecast EOM: extrapolate current month net by days passed
    const today = new Date(snapshot.asOf || Date.now());
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const day = today.getDate();
    const netMonth = snapshot.month.net || (snapshot.month.income - snapshot.month.expenses);
    const forecast = day <= 1 ? netMonth : Math.round((netMonth / Math.max(1, day)) * daysInMonth);
    const target = targets.netMonth || 0;
    const deltaPct = target === 0 ? 0 : Math.round(((forecast - target) / Math.max(1, target)) * 100);
    const incY = snapshot.year.income || 0; const expY = snapshot.year.expenses || 0;
    const gmPct = incY === 0 ? 0 : Math.round(((incY - expY) / incY) * 100);
    const dailyRev = (snapshot.month.income || 0) / 30;
    const dsoDays = Math.max(0, Math.round((snapshot.pending || 0) / Math.max(1, dailyRev)));
    return { forecast, deltaPct, gmPct, dsoDays };
  }, [snapshot, targets.netMonth]);

  const mtdNet = snapshot.month.net;
  const ytdNet = snapshot.year.net;
  const prevMonthNet = (() => {
    if (!comparePrev || !compareMonthlySeries) return null;
    const curKey = `${new Date(snapshot.asOf).getFullYear()}-${String(new Date(snapshot.asOf).getMonth() + 1).padStart(2, '0')}`;
    const idx = compareMonthlySeries.months.indexOf(curKey);
    const safeIdx = idx === -1 ? compareMonthlySeries.net.length - 1 : idx;
    return compareMonthlySeries.net[safeIdx] ?? null;
  })();
  const prevYearNet = (() => {
    if (!comparePrev || !compareMonthlySeries) return null;
    return compareMonthlySeries.net.reduce((a, b) => a + (b || 0), 0);
  })();
  const mtdDeltaPct = prevMonthNet == null || prevMonthNet === 0 ? null : Math.round(((mtdNet - prevMonthNet) / Math.abs(prevMonthNet)) * 100);
  const ytdDeltaPct = prevYearNet == null || prevYearNet === 0 ? null : Math.round(((ytdNet - prevYearNet) / Math.abs(prevYearNet)) * 100);

  const deltaTone: 'pos' | 'neg' | 'neutral' = deltaPct === 0 ? 'neutral' : (deltaPct > 0 ? 'pos' : 'neg');

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-5">
      <KpiItem
        label={t('finance.kpi.mtdNet') || 'MTD Net'}
        value={`${fmtMoney(mtdNet)}${comparePrev && mtdDeltaPct != null ? ` (${mtdDeltaPct > 0 ? '+' : ''}${mtdDeltaPct}%)` : ''}`}
        aria={`${t('finance.kpi.mtdNet')}: ${fmtMoney(mtdNet)}${comparePrev && mtdDeltaPct != null ? ` (${mtdDeltaPct > 0 ? '+' : ''}${mtdDeltaPct}%)` : ''}`}
        title={comparePrev && prevMonthNet != null ? `${t('common.current') || 'Current'}: ${fmtMoney(mtdNet)} • ${t('common.compare') || 'Compare'}: ${fmtMoney(prevMonthNet)}` : undefined}
        tone="neutral"
        delay={0}
      />
      <KpiItem
        label={t('finance.kpi.ytdNet') || 'YTD Net'}
        value={`${fmtMoney(ytdNet)}${comparePrev && ytdDeltaPct != null ? ` (${ytdDeltaPct > 0 ? '+' : ''}${ytdDeltaPct}%)` : ''}`}
        aria={`${t('finance.kpi.ytdNet')}: ${fmtMoney(ytdNet)}${comparePrev && ytdDeltaPct != null ? ` (${ytdDeltaPct > 0 ? '+' : ''}${ytdDeltaPct}%)` : ''}`}
        title={comparePrev && prevYearNet != null ? `${t('common.current') || 'Current'}: ${fmtMoney(ytdNet)} • ${t('common.compare') || 'Compare'}: ${fmtMoney(prevYearNet)}` : undefined}
        delay={0.05}
      />
      <KpiItem
        label={t('finance.kpi.forecastEom') || 'Forecast EOM'}
        value={fmtMoney(forecast)}
        aria={`${t('finance.kpi.forecastEom')}: ${fmtMoney(forecast)}`}
        delay={0.1}
      />
      <KpiItem
        label={t('finance.kpi.deltaTarget') || 'Δ vs Target'}
        value={`${deltaPct > 0 ? '+' : ''}${deltaPct}%`}
        aria={`${t('finance.kpi.deltaTarget')}: ${deltaPct}%`}
        title={`Forecast ${fmtMoney(forecast)} • Target ${targets.netMonth ? fmtMoney(targets.netMonth) : fmtMoney(0)}`}
        tone={deltaTone}
        delay={0.15}
      />
      <KpiItem
        label={t('finance.kpi.gm') || 'GM%'}
        value={`${gmPct}%`}
        aria={`${t('finance.kpi.gm')}: ${gmPct}%`}
        delay={0.2}
      />
      <KpiItem
        label={t('finance.kpi.dso') || 'DSO'}
        value={`${dsoDays}d`}
        aria={`${t('finance.kpi.dso')}: ${dsoDays} days`}
        delay={0.25}
      />
    </div>
  );
});

KpiCards.displayName = 'KpiCards';

export default KpiCards;
