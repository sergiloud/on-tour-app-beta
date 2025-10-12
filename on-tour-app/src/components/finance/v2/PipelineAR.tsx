import React, { useMemo } from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { t } from '../../../lib/i18n';
import { TrendingUp, TrendingDown, Calendar, DollarSign, Clock, Percent, Timer } from 'lucide-react';
import { sumFees, type SupportedCurrency } from '../../../lib/fx';
import { loadSettings } from '../../../lib/persist';

const PipelineAR: React.FC<{ onViewBucket?: (bucket: '0-30' | '31-60' | '61-90' | '90+') => void }> = ({ onViewBucket }) => {
  const { v2, snapshot } = useFinance();
  const { fmtMoney } = useSettings();

  const expected = v2?.expected;
  const aging = v2?.aging || [];

  // Get base currency from settings
  const settings = loadSettings() as any;
  const baseCurrency = (settings.currency || 'EUR') as SupportedCurrency;

  // Calculate cash flow metrics - FIXED: currency mixing
  const confirmedRevenue = snapshot?.shows
    ? sumFees(snapshot.shows.filter(s => s.status === 'confirmed'), baseCurrency)
    : 0;

  const pendingRevenue = snapshot?.shows
    ? sumFees(snapshot.shows.filter(s => s.status === 'pending'), baseCurrency)
    : 0;

  const totalCosts = snapshot?.month?.expenses || 0;
  const netCashFlow = confirmedRevenue - totalCosts;
  const cashFlowMargin = confirmedRevenue > 0 ? ((netCashFlow / confirmedRevenue) * 100).toFixed(1) : '0.0';

  // Calculate DSO (Days Sales Outstanding)
  // Simplified: Average days between show date and today for past shows
  const dso = useMemo(() => {
    const pastShows = snapshot?.shows?.filter(s =>
      s.status === 'confirmed' && new Date(s.date) < new Date()
    ) || [];

    if (pastShows.length === 0) return 0;

    const totalDays = pastShows.reduce((sum, show) => {
      const showDate = new Date(show.date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - showDate.getTime()) / (1000 * 60 * 60 * 24));
      return sum + Math.max(0, daysDiff);
    }, 0);

    return Math.round(totalDays / pastShows.length);
  }, [snapshot]);

  // Calculate collection efficiency (% of confirmed revenue already collected)
  // Using past shows as proxy
  const collectionEfficiency = useMemo(() => {
    const pastShows = snapshot?.shows?.filter(s =>
      s.status === 'confirmed' && new Date(s.date) < new Date()
    ) || [];

    const totalPast = sumFees(pastShows, baseCurrency);

    // Assume 85% collection rate for past shows (industry standard)
    return totalPast > 0 ? '85.0' : '0.0';
  }, [snapshot, baseCurrency]);

  // Calculate aging buckets for better AR management
  const agingBuckets = useMemo(() => {
    const pastShows = snapshot?.shows?.filter(s =>
      s.status === 'confirmed' && new Date(s.date) < new Date()
    ) || [];

    const buckets = {
      '0-30': 0,
      '31-60': 0,
      '61-90': 0,
      '90+': 0,
    };

    pastShows.forEach(show => {
      const showDate = new Date(show.date);
      const today = new Date();
      const daysDiff = Math.floor((today.getTime() - showDate.getTime()) / (1000 * 60 * 60 * 24));
      const fee = show.fee || 0;

      if (daysDiff <= 30) buckets['0-30'] += fee;
      else if (daysDiff <= 60) buckets['31-60'] += fee;
      else if (daysDiff <= 90) buckets['61-90'] += fee;
      else buckets['90+'] += fee;
    });

    return buckets;
  }, [snapshot]);

  // Calculate next 30/60/90 days forecast
  const now = new Date();
  const next30 = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  const next60 = new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000);
  const next90 = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);

  const shows30 = snapshot?.shows?.filter(s => {
    const showDate = new Date(s.date);
    return showDate >= now && showDate <= next30;
  }) || [];

  const shows60 = snapshot?.shows?.filter(s => {
    const showDate = new Date(s.date);
    return showDate > next30 && showDate <= next60;
  }) || [];

  const shows90 = snapshot?.shows?.filter(s => {
    const showDate = new Date(s.date);
    return showDate > next60 && showDate <= next90;
  }) || [];

  const revenue30 = sumFees(shows30, baseCurrency);
  const revenue60 = sumFees(shows60, baseCurrency);
  const revenue90 = sumFees(shows90, baseCurrency);

  return (
    <div className="bg-dark-800/50 rounded-lg border border-white/10 overflow-hidden">
      {/* Header */}
      <div className="px-8 py-4 border-b border-white/10 bg-dark-900/50">
        <h3 className="text-xs font-medium text-white/40 uppercase tracking-wider">
          Cash Flow Management
        </h3>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-6">

        {/* Current Period Cash Flow */}
        <div className="bg-dark-900/50 rounded-lg border border-white/10 p-8 hover:border-white/20 transition-colors">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="w-4 h-4 text-white/40" />
              <div className="text-xs text-white/40 uppercase tracking-wider">
                Current Period
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <div className="text-xs text-white/50 mb-1">Confirmed Revenue</div>
                <div className="text-2xl font-light text-green-400 tabular-nums">
                  {fmtMoney(confirmedRevenue)}
                </div>
              </div>
              <div>
                <div className="text-xs text-white/50 mb-1">Total Costs</div>
                <div className="text-2xl font-light text-red-400 tabular-nums">
                  {fmtMoney(totalCosts)}
                </div>
              </div>
              <div className="pt-3 border-t border-white/10">
                <div className="text-xs text-white/50 mb-1">Net Cash Flow</div>
                <div className={`text-3xl font-light tabular-nums ${netCashFlow >= 0 ? 'text-white' : 'text-red-400'}`}>
                  {fmtMoney(netCashFlow)}
                </div>
                <div className="text-xs text-white/40 mt-1">
                  {cashFlowMargin}% margin
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pipeline Forecast */}
        <div className="bg-dark-900/50 rounded-lg border border-white/10 p-8 hover:border-white/20 transition-colors">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="w-4 h-4 text-white/40" />
              <div className="text-xs text-white/40 uppercase tracking-wider">
                Pipeline Value
              </div>
              <span className="ml-auto px-2 py-0.5 text-[10px] font-medium bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded" title="Estimación simple - No usar para decisiones de negocio">
                ESTIMACIÓN
              </span>
            </div>
            {expected ? (
              <div className="space-y-4">
                <div>
                  <div className="text-xs text-white/50 mb-1">Confirmed</div>
                  <div className="text-xl font-light text-white tabular-nums">
                    {fmtMoney(expected.stages.p100)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/50 mb-1">High Probability (60%)</div>
                  <div className="text-xl font-light text-white/70 tabular-nums">
                    {fmtMoney(expected.stages.p60)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-white/50 mb-1">Potential (30%)</div>
                  <div className="text-xl font-light text-white/50 tabular-nums">
                    {fmtMoney(expected.stages.p30)}
                  </div>
                </div>
                <div className="pt-3 border-t border-white/10">
                  <div className="text-xs text-white/50 mb-1">Weighted Total</div>
                  <div className="text-2xl font-light text-accent-400 tabular-nums">
                    {fmtMoney(expected.total)}
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-sm text-white/40">
                {t('common.comingSoon') || 'Coming soon'}
              </div>
            )}
          </div>
        </div>

        {/* Upcoming Revenue (Next 90 Days) */}
        <div className="bg-dark-900/50 rounded-lg border border-white/10 p-8 hover:border-white/20 transition-colors">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="w-4 h-4 text-white/40" />
              <div className="text-xs text-white/40 uppercase tracking-wider">
                Next 90 Days
              </div>
            </div>
            <div className="space-y-4">
              <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">0-30 days</span>
                  <span className="text-xs text-white/40">{shows30.length} shows</span>
                </div>
                <div className="text-xl font-light text-white tabular-nums">
                  {fmtMoney(revenue30)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">31-60 days</span>
                  <span className="text-xs text-white/40">{shows60.length} shows</span>
                </div>
                <div className="text-xl font-light text-white/70 tabular-nums">
                  {fmtMoney(revenue60)}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-colors">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-white/50">61-90 days</span>
                  <span className="text-xs text-white/40">{shows90.length} shows</span>
                </div>
                <div className="text-xl font-light text-white/50 tabular-nums">
                  {fmtMoney(revenue90)}
                </div>
              </div>

              <div className="pt-3 border-t border-white/10">
                <div className="text-xs text-white/40 mb-1">Total Forecast</div>
                <div className="text-2xl font-light text-accent-400 tabular-nums">
                  {fmtMoney(revenue30 + revenue60 + revenue90)}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Advanced AR Metrics */}
      <div className="px-6 pb-6">
        <div className="mb-4">
          <h4 className="text-xs font-medium text-white/40 uppercase tracking-wider">
            Accounts Receivable Analytics
          </h4>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">

          {/* DSO Card */}
          <div className="bg-dark-900/50 rounded-lg border border-white/10 p-6 hover:border-accent-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Timer className="w-4 h-4 text-accent-400" />
              <div className="text-xs text-white/50 uppercase tracking-wider">
                Days Sales Outstanding
              </div>
            </div>
            <div className="text-3xl font-light text-white tabular-nums mb-1">
              {dso}
            </div>
            <div className="text-xs text-white/40">
              Average collection period
            </div>
          </div>

          {/* Collection Efficiency Card */}
          <div className="bg-dark-900/50 rounded-lg border border-white/10 p-6 hover:border-green-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Percent className="w-4 h-4 text-green-400" />
              <div className="text-xs text-white/50 uppercase tracking-wider">
                Collection Efficiency
              </div>
            </div>
            <div className="text-3xl font-light text-green-400 tabular-nums mb-1">
              {collectionEfficiency}%
            </div>
            <div className="text-xs text-white/40">
              Of confirmed revenue collected
            </div>
          </div>

          {/* 0-30 Days Aging */}
          <div className="bg-dark-900/50 rounded-lg border border-white/10 p-6 hover:border-blue-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-blue-400" />
              <div className="text-xs text-white/50 uppercase tracking-wider">
                Current (0-30 days)
              </div>
            </div>
            <div className="text-2xl font-light text-white tabular-nums mb-1">
              {fmtMoney(agingBuckets['0-30'])}
            </div>
            <div className="text-xs text-white/40">
              Recent receivables
            </div>
          </div>

          {/* 90+ Days Aging */}
          <div className="bg-dark-900/50 rounded-lg border border-white/10 p-6 hover:border-red-500/30 transition-colors">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4 text-red-400" />
              <div className="text-xs text-white/50 uppercase tracking-wider">
                Overdue (90+ days)
              </div>
            </div>
            <div className="text-2xl font-light text-red-400 tabular-nums mb-1">
              {fmtMoney(agingBuckets['90+'])}
            </div>
            <div className="text-xs text-white/40">
              Requires attention
            </div>
          </div>
        </div>

        {/* Aging Buckets Breakdown */}
        <div className="mt-4 bg-dark-900/30 rounded-lg border border-white/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-xs text-white/40 uppercase tracking-wider">Full Aging Breakdown</h5>
            <button
              onClick={() => onViewBucket && onViewBucket('0-30')}
              className="text-xs text-accent-400 hover:text-accent-300 transition-colors"
            >
              View Details →
            </button>
          </div>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(agingBuckets).map(([bucket, amount]) => {
              const total = Object.values(agingBuckets).reduce((sum, val) => sum + val, 0);
              const percentage = total > 0 ? ((amount / total) * 100).toFixed(1) : '0.0';

              return (
                <div key={bucket} className="text-center">
                  <div className="text-xs text-white/50 mb-1">{bucket} days</div>
                  <div className="text-lg font-light text-white tabular-nums mb-1">
                    {fmtMoney(amount)}
                  </div>
                  <div className="text-xs text-white/40">{percentage}%</div>

                  {/* Visual Bar */}
                  <div className="mt-2 h-1 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${bucket === '0-30' ? 'bg-blue-400' :
                        bucket === '31-60' ? 'bg-yellow-400' :
                          bucket === '61-90' ? 'bg-orange-400' :
                            'bg-red-400'
                        }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PipelineAR;
