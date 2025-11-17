import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Card } from '../../ui/Card';
import { useFinance } from '../../context/FinanceContext';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import {
  TrendingUp,
  TrendingDown,
  Target,
  Clock,
  DollarSign,
  BarChart3,
  PieChart,
  TrendingUpIcon,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';

/**
 * Summary Component: Finance Overview Dashboard
 * Unified design system with glass morphism, consistent spacing, and accessibility
 * Pattern: Dashboard (header) + Shows (grid layout) + KpiCards (component design)
 */

const Summary: React.FC = () => {
  const { snapshot, targets, compareMonthlySeries } = useFinance();
  const { fmtMoney, comparePrev } = useSettings();
  const [selectedPeriod, setSelectedPeriod] = useState<'month' | 'year'>('month');

  // KPI calculations
  const { forecast, deltaPct, gmPct, dsoDays, mtdNet, ytdNet, mtdDeltaPct, ytdDeltaPct } = useMemo(() => {
    const today = new Date(snapshot.asOf || Date.now());
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    const day = today.getDate();
    const netMonth = snapshot.month.net || snapshot.month.income - snapshot.month.expenses;
    const forecast = day <= 1 ? netMonth : Math.round((netMonth / Math.max(1, day)) * daysInMonth);
    const target = targets.netMonth || 0;
    const deltaPct = target === 0 ? 0 : Math.round(((forecast - target) / Math.max(1, target)) * 100);

    const incY = snapshot.year.income || 0;
    const expY = snapshot.year.expenses || 0;
    const gmPct = incY === 0 ? 0 : Math.round(((incY - expY) / incY) * 100);

    const dailyRev = (snapshot.month.income || 0) / 30;
    const dsoDays = Math.max(0, Math.round((snapshot.pending || 0) / Math.max(1, dailyRev)));

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

    return { forecast, deltaPct, gmPct, dsoDays, mtdNet, ytdNet, mtdDeltaPct, ytdDeltaPct };
  }, [snapshot, targets.netMonth, compareMonthlySeries, comparePrev]);

  // Period selector
  const handlePeriodChange = (period: 'month' | 'year') => {
    setSelectedPeriod(period);
  };

  // Determine tone colors
  const getMetricTone = (value: number) => {
    if (value === 0) return 'neutral';
    return value > 0 ? 'positive' : 'negative';
  };

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? (
      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-rose-400" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
        <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-5 lg:py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            {/* Title */}
            <div className="flex items-center gap-4">
              <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
              <div>
                <h2 className="text-xl lg:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                  {t('finance.summary.title') || 'Financial Summary'}
                </h2>
                <p className="text-xs lg:text-sm text-slate-400 dark:text-white/60 mt-1">
                  {t('finance.summary.subtitle') || 'Overview of key financial metrics'}
                </p>
              </div>
            </div>

            {/* Period Selector */}
            <div className="flex items-center gap-2 bg-slate-100 dark:bg-white/5 rounded-lg p-1 border border-white/10">
              <button
                onClick={() => handlePeriodChange('month')}
                className={`px-4 py-2 text-sm font-medium rounded transition-all duration-300 ${
                  selectedPeriod === 'month'
                    ? 'bg-accent-500/20 text-accent-300 border border-accent-400/30'
                    : 'text-slate-500 dark:text-white/70 hover:text-slate-700 dark:hover:text-white/90'
                }`}
                aria-label={t('common.month') || 'Month'}
                aria-pressed={selectedPeriod === 'month'}
              >
                {t('common.month') || 'Month'}
              </button>
              <button
                onClick={() => handlePeriodChange('year')}
                className={`px-4 py-2 text-sm font-medium rounded transition-all duration-300 ${
                  selectedPeriod === 'year'
                    ? 'bg-accent-500/20 text-accent-300 border border-accent-400/30'
                    : 'text-slate-500 dark:text-white/70 hover:text-slate-700 dark:hover:text-white/90'
                }`}
                aria-label={t('common.year') || 'Year'}
                aria-pressed={selectedPeriod === 'year'}
              >
                {t('common.year') || 'Year'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Grid - Primary Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {/* Net Profit */}
        <Card className="glass border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60">
              {selectedPeriod === 'month' ? (t('finance.kpi.mtdNet') || 'MTD Net') : (t('finance.kpi.ytdNet') || 'YTD Net')}
            </span>
            <DollarSign className="w-4 h-4 text-accent-400 opacity-60" />
          </div>
          <div className="space-y-2">
            <div className="text-2xl lg:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {fmtMoney(selectedPeriod === 'month' ? mtdNet : ytdNet)}
            </div>
            {selectedPeriod === 'month' && mtdDeltaPct !== null ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/70">
                {getTrendIcon(mtdDeltaPct > 0)}
                <span className={mtdDeltaPct > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {mtdDeltaPct > 0 ? '+' : ''}{mtdDeltaPct}% {t('finance.summary.vsLastMonth') || t('common.vsLastMonth') || 'vs last month'}
                </span>
              </div>
            ) : selectedPeriod === 'year' && ytdDeltaPct !== null ? (
              <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-white/70">
                {getTrendIcon(ytdDeltaPct > 0)}
                <span className={ytdDeltaPct > 0 ? 'text-emerald-400' : 'text-rose-400'}>
                  {ytdDeltaPct > 0 ? '+' : ''}{ytdDeltaPct}% {t('finance.summary.vsLastYear') || t('common.vsLastYear') || 'vs last year'}
                </span>
              </div>
            ) : null}
          </div>
        </Card>

        {/* Revenue */}
        <Card className="glass border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60">
              {selectedPeriod === 'month' ? t('finance.kpi.monthlyRevenue') || 'Revenue' : t('finance.kpi.annualRevenue') || 'Annual Revenue'}
            </span>
            <BarChart3 className="w-4 h-4 text-blue-400 opacity-60" />
          </div>
          <div className="space-y-2">
            <div className="text-2xl lg:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {fmtMoney(selectedPeriod === 'month' ? snapshot.month.income : snapshot.year.income)}
            </div>
            <div className="text-xs text-slate-400 dark:text-white/60">
              {t('finance.summary.totalIncome') || 'Total Income'}
            </div>
          </div>
        </Card>

        {/* Expenses */}
        <Card className="glass border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-3 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60">
              {selectedPeriod === 'month' ? t('finance.kpi.monthlyExpenses') || 'Expenses' : t('finance.kpi.annualExpenses') || 'Annual Expenses'}
            </span>
            <PieChart className="w-4 h-4 text-orange-400 opacity-60" />
          </div>
          <div className="space-y-2">
            <div className="text-2xl lg:text-3xl font-bold tabular-nums text-slate-900 dark:text-white">
              {fmtMoney(selectedPeriod === 'month' ? snapshot.month.expenses : snapshot.year.expenses)}
            </div>
            <div className="text-xs text-slate-400 dark:text-white/60">
              {t('finance.summary.totalExpenses') || 'Total Expenses'}
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Secondary Metrics Grid */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
      >
        {/* Forecast */}
        <Card className="glass border border-slate-200 dark:border-white/10 p-4 flex flex-col gap-2 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex items-center gap-2">
            <TrendingUpIcon className="w-3.5 h-3.5 text-accent-400 opacity-60" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60">
              {t('finance.kpi.forecastEom') || 'Forecast EOM'}
            </span>
          </div>
          <div className="text-lg lg:text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {fmtMoney(forecast)}
          </div>
        </Card>

        {/* Delta vs Target */}
        <Card
          className={`glass border p-4 flex flex-col gap-2 hover:border-slate-300 dark:border-white/20 transition-all duration-300 ${
            deltaPct > 0
              ? 'border-emerald-500/30 bg-emerald-500/5'
              : deltaPct < 0
                ? 'border-rose-500/30 bg-rose-500/5'
                : 'border-white/10'
          }`}
        >
          <div className="flex items-center gap-2">
            <Target className="w-3.5 h-3.5 opacity-60" style={{ color: deltaPct > 0 ? '#10b981' : deltaPct < 0 ? '#f43f5e' : '#9ca3af' }} />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60">
              {t('finance.kpi.deltaTarget') || 'Δ vs Target'}
            </span>
          </div>
          <div className={`text-lg lg:text-xl font-bold tabular-nums ${
            deltaPct > 0 ? 'text-emerald-400' : deltaPct < 0 ? 'text-rose-400' : 'text-white'
          }`}>
            {deltaPct > 0 ? '+' : ''}{deltaPct}%
          </div>
        </Card>

        {/* Gross Margin */}
        <Card className="glass border border-slate-200 dark:border-white/10 p-4 flex flex-col gap-2 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex items-center gap-2">
            <PieChart className="w-3.5 h-3.5 text-blue-400 opacity-60" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60">
              {t('finance.kpi.gm') || 'Gross Margin'}
            </span>
          </div>
          <div className="text-lg lg:text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {gmPct}%
          </div>
        </Card>

        {/* DSO */}
        <Card className="glass border border-slate-200 dark:border-white/10 p-4 flex flex-col gap-2 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
          <div className="flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 text-amber-400 opacity-60" />
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-white/60">
              {t('finance.kpi.dso') || 'Days Sales Out'}
            </span>
          </div>
          <div className="text-lg lg:text-xl font-bold tabular-nums text-slate-900 dark:text-white">
            {dsoDays}d
          </div>
        </Card>
      </motion.div>

      {/* Insights Row */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm p-6 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
      >
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-lg bg-accent-500/10 border border-accent-400/30">
            <BarChart3 className="w-5 h-5 text-accent-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">
              {t('finance.summary.keyInsights') || 'Key Insights'}
            </h3>
            <p className="text-sm text-slate-500 dark:text-white/70 leading-relaxed">
              {selectedPeriod === 'month'
                ? `${t('finance.summary.monthInsight') || 'Your MTD net is'} ${fmtMoney(mtdNet)}. ${
                    deltaPct >= 0
                      ? `${t('finance.summary.onTrack') || 'You are on track'} ${deltaPct > 0 ? `+${deltaPct}%` : 'to your target'}`
                      : `${t('finance.summary.belowTarget') || 'You are'} ${Math.abs(deltaPct)}% ${t('finance.summary.belowTarget2') || 'below your target'}}`
                  }.`
                : `${t('finance.summary.yearInsight') || 'Your YTD performance shows'} ${gmPct}% ${t('finance.summary.grossMargin') || 'gross margin'}} with ${t('finance.summary.revenue') || 'total revenue'} ${fmtMoney(snapshot.year.income)}.`}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Summary;
export { Summary };
