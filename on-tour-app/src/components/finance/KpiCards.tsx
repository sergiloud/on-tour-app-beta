import React, { useMemo } from 'react';
import { useFinance } from '../../context/FinanceContext';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { TrendingUp, TrendingDown, Target, Clock } from 'lucide-react';

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

  return (
    <div className="bg-dark-800/50 rounded border border-white/5 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 border-b border-white/5 bg-dark-900/50">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Key Performance Indicators
        </h3>
      </div>

      {/* KPI Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-px bg-white/5">

        {/* MTD Net */}
        <div className="bg-dark-800 p-6">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
            MTD Net
          </div>
          <div className="text-xl font-light text-white tabular-nums mb-2">
            {fmtMoney(mtdNet)}
          </div>
          {comparePrev && mtdDeltaPct != null && (
            <div className={`flex items-center gap-1 text-xs ${mtdDeltaPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {mtdDeltaPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="tabular-nums">{mtdDeltaPct > 0 ? '+' : ''}{mtdDeltaPct}%</span>
            </div>
          )}
        </div>

        {/* YTD Net */}
        <div className="bg-dark-800 p-6">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
            YTD Net
          </div>
          <div className="text-xl font-light text-white tabular-nums mb-2">
            {fmtMoney(ytdNet)}
          </div>
          {comparePrev && ytdDeltaPct != null && (
            <div className={`flex items-center gap-1 text-xs ${ytdDeltaPct >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {ytdDeltaPct >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
              <span className="tabular-nums">{ytdDeltaPct > 0 ? '+' : ''}{ytdDeltaPct}%</span>
            </div>
          )}
        </div>

        {/* Forecast EOM */}
        <div className="bg-dark-800 p-6">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
            Forecast EOM
          </div>
          <div className="text-xl font-light text-white tabular-nums">
            {fmtMoney(forecast)}
          </div>
        </div>

        {/* Delta vs Target */}
        <div className={`bg-dark-800 p-6 ${deltaPct !== 0 ? 'border-l-2' : ''} ${deltaPct > 0 ? 'border-green-500/50' : deltaPct < 0 ? 'border-red-500/50' : ''}`}>
          <div className="flex items-center gap-2 mb-3">
            <Target className="w-3 h-3 text-white/40" />
            <div className="text-xs text-white/40 uppercase tracking-wider">
              vs Target
            </div>
          </div>
          <div className={`text-xl font-light tabular-nums ${deltaPct > 0 ? 'text-green-400' : deltaPct < 0 ? 'text-red-400' : 'text-white'}`}>
            {deltaPct > 0 ? '+' : ''}{deltaPct}%
          </div>
        </div>

        {/* Gross Margin */}
        <div className="bg-dark-800 p-6">
          <div className="text-xs text-white/40 uppercase tracking-wider mb-3">
            Margin
          </div>
          <div className={`text-xl font-light tabular-nums ${gmPct >= 50 ? 'text-green-400' : gmPct >= 30 ? 'text-white' : 'text-red-400'}`}>
            {gmPct}%
          </div>
        </div>

        {/* DSO */}
        <div className="bg-dark-800 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-3 h-3 text-white/40" />
            <div className="text-xs text-white/40 uppercase tracking-wider">
              DSO
            </div>
          </div>
          <div className={`text-xl font-light tabular-nums ${dsoDays <= 30 ? 'text-green-400' : dsoDays <= 60 ? 'text-white' : 'text-amber-400'}`}>
            {dsoDays}d
          </div>
        </div>
      </div>
    </div>
  );
});

KpiCards.displayName = 'KpiCards';

export default KpiCards;
