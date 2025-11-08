import React from 'react';
import { motion } from 'framer-motion';
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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="min-h-screen bg-gradient-to-br from-ink-900 via-ink-900 to-ink-950"
    >
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 lg:py-10 space-y-8">
        {/* Page Header - Enhanced Glassmorphism */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="glass rounded-xl border border-white/10 backdrop-blur-md mb-6 lg:mb-8 overflow-hidden hover:border-white/20 hover:shadow-lg hover:shadow-accent-500/10 transition-all duration-300"
        >
          <motion.div
            className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-6 md:py-7"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <div className="flex items-center justify-between flex-wrap gap-4 md:gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-4"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 5 }}
                  className="w-1.5 h-12 rounded-full bg-gradient-to-b from-accent-500 via-blue-500 to-purple-500 shadow-lg shadow-accent-500/30"
                />
                <div>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mb-1">
                    {t('finance.overview') || 'Finance'}
                  </h1>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="text-sm text-white/50"
                  >
                    Comprehensive financial dashboard & analytics
                  </motion.p>
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.15 }}
                className="flex items-center gap-2 md:gap-3 flex-wrap justify-end"
              >
                {!can('finance:export') && (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.25 }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold backdrop-blur-md"
                  >
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    {t('access.readOnly') || 'Read-only'}
                  </motion.span>
                )}

                {/* Live indicator */}
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-white/60 font-medium"
                >
                  <span className="relative flex h-2 w-2">
                    <span className="animate-pulse absolute inline-flex h-full w-full rounded-full bg-accent-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent-500"></span>
                  </span>
                  Real-time data
                </motion.div>

                {/* Period status badge */}
                <motion.span
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.25 }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 backdrop-blur-md border ${closed
                    ? 'bg-gradient-to-br from-emerald-500/20 to-emerald-500/10 text-emerald-200 border-emerald-500/30 shadow-lg shadow-emerald-500/10'
                    : 'bg-gradient-to-br from-amber-500/20 to-amber-500/10 text-amber-200 border-amber-500/30 shadow-lg shadow-amber-500/10'
                    }`}
                >
                  {closed ? t('finance.period.closed') || 'Closed' : t('finance.period.open') || 'Open'}
                </motion.span>

                {/* Toggle button */}
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 rounded-lg text-xs font-semibold glass border border-white/10 hover:border-accent-500/30 hover:bg-white/10 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10 backdrop-blur-md text-white"
                  onClick={toggleClose}
                >
                  {closed ? (t('finance.reopenMonth') || 'Reopen') : (t('finance.closeMonth') || 'Close')}
                </motion.button>
              </motion.div>
            </div>
          </motion.div>
        </motion.div>

        {/* Content Container with Animations */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: 'easeOut' }}
        >
          <FinanceV2 />
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Finance;
