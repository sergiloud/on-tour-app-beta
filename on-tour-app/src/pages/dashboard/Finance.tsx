import React from 'react';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { trackEvent } from '../../lib/telemetry';
import { isMonthClosed, monthKeyFromDate, setMonthClosed } from '../../features/finance/period';
import FinanceV2 from '../../components/finance/v2/FinanceV5';
import { can } from '../../lib/tenants';
import { useAuth } from '../../context/AuthContext';
import { trackPageView } from '../../lib/activityTracker';

const Finance: React.FC = () => {
  const { dateRange } = useSettings();
  const { userId } = useAuth();
  const monthKey = React.useMemo(() => monthKeyFromDate(new Date(dateRange.to)), [dateRange.to]);
  const [closed, setClosed] = React.useState<boolean>(() => isMonthClosed(monthKey));
  React.useEffect(() => setClosed(isMonthClosed(monthKey)), [monthKey]);
  const toggleClose = () => {
    const next = !closed;
    setClosed(next);
    setMonthClosed(monthKey, next);
    try { trackEvent('finance.closeMonth', { month: monthKey, closed: next }); } catch { }
  };

  // activity tracking
  React.useEffect(() => {
    trackPageView('finance');
  }, [userId]);

  return (
    <div className="min-h-screen bg-ink-900">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 lg:py-10">
        {/* Page Header - Dashboard Style */}
        <div className="glass rounded-xl border border-white/10 backdrop-blur-sm mb-6 lg:mb-8 overflow-hidden hover:border-white/20 transition-all duration-300">
          <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-5">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-1 h-10 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                <div>
                  <h1 className="text-xl lg:text-2xl font-semibold tracking-tight text-white mb-1">
                    {t('finance.overview') || 'Finance'}
                  </h1>
                  {!can('finance:export') && (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-lg bg-amber-500/20 text-amber-300 border border-amber-400/30 font-medium">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      {t('access.readOnly') || 'Read-only'}
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                {/* Live indicator */}
                <div className="hidden sm:flex items-center gap-2 text-xs text-white/60">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                  </span>
                  Live
                </div>

                {/* Period status badge */}
                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${closed
                  ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-emerald-200 border border-emerald-500/30 shadow-sm shadow-emerald-500/10'
                  : 'bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-200 border border-amber-500/30 shadow-sm shadow-amber-500/10'
                  }`}>
                  {closed ? t('finance.period.closed') || 'Closed' : t('finance.period.open') || 'Open'}
                </span>

                {/* Toggle button */}
                <button
                  className="px-4 py-1.5 rounded-lg text-xs font-medium glass border border-white/10 hover:border-white/20 hover:bg-white/10 transition-all duration-300 hover:shadow-lg"
                  onClick={toggleClose}
                >
                  {closed ? (t('finance.reopenMonth') || 'Reopen') : (t('finance.closeMonth') || 'Close')}
                </button>
              </div>
            </div>
          </div>
        </div>

        <FinanceV2 />
      </div>
    </div>
  );
};

export default Finance;
