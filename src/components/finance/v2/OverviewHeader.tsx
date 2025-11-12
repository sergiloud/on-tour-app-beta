import React, { useMemo } from 'react';
import { t } from '../../../lib/i18n';
import { useFinanceSnapshot } from '../../../hooks/useFinanceSnapshot';
import { useFinancePeriod } from '../../../context/FinancePeriodContext';
import { agenciesForShow, computeCommission } from '../../../lib/agencies';
import { TrendingUp, TrendingDown, Users } from 'lucide-react';

const OverviewHeader: React.FC = () => {
  const { allShows, snapshot, fmtMoney, comparePrev, bookingAgencies, managementAgencies } = useFinanceSnapshot();
  const { isInPeriod } = useFinancePeriod();

  // Calculate agency commissions for current period
  const agencyData = useMemo(() => {
    const shows = (allShows as any[]) || [];
    
    // Filter shows by period and status
    const periodShows = shows.filter(s => {
      if (s.status === 'offer') return false;
      if (!s.date) return false;
      return isInPeriod(s.date);
    });
    
    let totalCommissions = 0;

    periodShows.forEach(show => {
      // Only calculate commissions for shows with selected agencies
      const selectedAgencies = [];
      if (show.mgmtAgency) {
        const mgmt = managementAgencies.find(a => a.name === show.mgmtAgency);
        if (mgmt) selectedAgencies.push(mgmt);
      }
      if (show.bookingAgency) {
        const booking = bookingAgencies.find(a => a.name === show.bookingAgency);
        if (booking) selectedAgencies.push(booking);
      }
      if (selectedAgencies.length > 0) {
        totalCommissions += computeCommission(show, selectedAgencies);
      }
    });

    return { totalCommissions };
  }, [allShows, bookingAgencies, managementAgencies, isInPeriod]);

  // Calculate previous period commissions if comparison is enabled
  const prevAgencyCommissions = useMemo(() => {
    // Simplified: for now we don't calculate comparison period commissions
    // This would require access to comparison period's shows data
    return null;
  }, []);

  const commissionDelta = prevAgencyCommissions !== null
    ? agencyData.totalCommissions - prevAgencyCommissions
    : null;
  const commissionDeltaPct = prevAgencyCommissions && prevAgencyCommissions > 0
    ? ((commissionDelta! / prevAgencyCommissions) * 100).toFixed(1)
    : null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="text-sm opacity-80">{t('finance.overview') || 'Finance overview'}</div>
      </div>

      {/* Agency Commissions Summary Card */}
      {agencyData.totalCommissions > 0 && (
        <div className="bg-gradient-to-r from-purple-900/20 to-indigo-900/20 rounded-lg border border-purple-500/30 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-purple-500/20">
                <Users className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <div className="text-xs text-slate-300 dark:text-white/50 mb-1">Agency Commissions YTD</div>
                <div className="text-2xl font-light text-slate-900 dark:text-white tabular-nums">
                  {fmtMoney(agencyData.totalCommissions)}
                </div>
              </div>
            </div>

            {/* Comparison with previous period */}
            {commissionDeltaPct && (
              <div className="text-right">
                <div className="text-xs text-slate-400 dark:text-white/40 mb-1">vs prev period</div>
                <div className="flex items-center justify-end gap-2">
                  {parseFloat(commissionDeltaPct) >= 0 ? (
                    <>
                      <TrendingUp className="w-4 h-4 text-orange-400" />
                      <span className="text-sm text-orange-400 font-medium">
                        +{commissionDeltaPct}%
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingDown className="w-4 h-4 text-green-400" />
                      <span className="text-sm text-green-400 font-medium">
                        {commissionDeltaPct}%
                      </span>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Percentage of total revenue */}
          {snapshot && snapshot.year.income > 0 && (
            <div className="mt-3 pt-3 border-t border-purple-500/20">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-300/70">
                  {((agencyData.totalCommissions / snapshot.year.income) * 100).toFixed(1)}% of total revenue
                </span>
                <span className="text-purple-300/50">
                  {bookingAgencies.length + managementAgencies.length} active {bookingAgencies.length + managementAgencies.length === 1 ? 'agency' : 'agencies'}
                </span>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OverviewHeader;
