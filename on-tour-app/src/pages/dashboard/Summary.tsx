import React from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useFinance } from '../../context/FinanceContext';
import { useOrg } from '../../context/OrgContext';
import { t } from '../../lib/i18n';
import { trackPageView } from '../../lib/activityTracker';
import { Card } from '../../ui/Card';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  BarChart3,
  Calendar,
  Users,
  MapPin,
  Zap,
  ArrowUpRight,
  ArrowDownRight,
  Target,
} from 'lucide-react';

/**
 * Summary Page - Application Overview Dashboard
 * Displays key metrics across all modules: Finance, Shows, Travel, Calendar
 * Following unified design system: Dashboard header + Shows grid + KPI styling
 */

const Summary: React.FC = () => {
  const { userId } = useAuth();
  const { fmtMoney } = useSettings();
  const { snapshot } = useFinance();
  const { org } = useOrg();

  React.useEffect(() => {
    trackPageView('summary');
  }, [userId]);

  // Calculate key metrics
  const mtdNet = snapshot?.month.net || 0;
  const ytdNet = snapshot?.year.net || 0;
  const income = snapshot?.month.income || 0;
  const expenses = snapshot?.month.expenses || 0;

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? (
      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
    ) : (
      <ArrowDownRight className="w-4 h-4 text-rose-400" />
    );
  };

  return (
    <div className="min-h-screen bg-ink-900">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 lg:py-10 space-y-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-white/10 backdrop-blur-sm overflow-hidden hover:border-white/20 transition-all duration-300"
        >
          <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-8 lg:py-10">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-1 h-12 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
                    {t('summary.title') || 'Dashboard Summary'}
                  </h1>
                  <p className="text-sm lg:text-base text-white/60 mt-1">
                    {t('summary.subtitle') || 'Your business at a glance'}
                  </p>
                </div>
              </div>
              {org && (
                <div className="flex items-center gap-2 text-xs text-white/50 ml-5">
                  <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10">
                    {org.name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Primary Metrics Grid */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* This Month Net */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass border border-white/10 p-6 flex flex-col gap-3 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t('summary.thisMonth') || 'This Month'}
                </span>
                <DollarSign className="w-4 h-4 text-accent-400 opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl lg:text-3xl font-bold tabular-nums text-white">
                  {fmtMoney(mtdNet)}
                </div>
                <div className="text-xs text-white/60">
                  {t('summary.netProfit') || 'Net Profit'}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Year to Date */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="glass border border-white/10 p-6 flex flex-col gap-3 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t('summary.yearToDate') || 'Year to Date'}
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-400 opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl lg:text-3xl font-bold tabular-nums text-white">
                  {fmtMoney(ytdNet)}
                </div>
                <div className="text-xs text-white/60">
                  {t('summary.totalYear') || 'Total Year'}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Income */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass border border-white/10 p-6 flex flex-col gap-3 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t('summary.revenue') || 'Revenue'}
                </span>
                <BarChart3 className="w-4 h-4 text-blue-400 opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl lg:text-3xl font-bold tabular-nums text-white">
                  {fmtMoney(income)}
                </div>
                <div className="text-xs text-white/60">
                  {t('summary.thisMonth') || 'This Month'}
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Expenses */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass border border-white/10 p-6 flex flex-col gap-3 hover:border-white/20 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-white/60">
                  {t('summary.expenses') || 'Expenses'}
                </span>
                <Zap className="w-4 h-4 text-orange-400 opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl lg:text-3xl font-bold tabular-nums text-white">
                  {fmtMoney(expenses)}
                </div>
                <div className="text-xs text-white/60">
                  {t('summary.thisMonth') || 'This Month'}
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Section Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Shows Overview Card */}
          <Card className="glass border border-white/10 p-6 hover:border-white/20 transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-accent-500/10 border border-accent-400/30 group-hover:bg-accent-500/20 transition-all">
                  <Calendar className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('nav.shows') || 'Shows'}
                  </h3>
                  <p className="text-xs text-white/60">
                    {t('summary.upcoming') || 'Upcoming events'}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-accent-400 transition-all" />
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {t('summary.showsDesc') || 'Manage tour dates, venues, and event details'}
            </p>
          </Card>

          {/* Travel Overview Card */}
          <Card className="glass border border-white/10 p-6 hover:border-white/20 transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-400/30 group-hover:bg-purple-500/20 transition-all">
                  <MapPin className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('nav.travel') || 'Travel'}
                  </h3>
                  <p className="text-xs text-white/60">
                    {t('summary.itineraries') || 'Trip planning'}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-purple-400 transition-all" />
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {t('summary.travelDesc') || 'Plan accommodations, flights, and logistics'}
            </p>
          </Card>

          {/* Calendar Overview Card */}
          <Card className="glass border border-white/10 p-6 hover:border-white/20 transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-400/30 group-hover:bg-cyan-500/20 transition-all">
                  <Calendar className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('nav.calendar') || 'Calendar'}
                  </h3>
                  <p className="text-xs text-white/60">
                    {t('summary.schedule') || 'Event schedule'}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-cyan-400 transition-all" />
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {t('summary.calendarDesc') || 'View and manage all events in one place'}
            </p>
          </Card>

          {/* Finance Overview Card */}
          <Card className="glass border border-white/10 p-6 hover:border-white/20 transition-all duration-300 cursor-pointer group">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-400/30 group-hover:bg-emerald-500/20 transition-all">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">
                    {t('nav.finance') || 'Finance'}
                  </h3>
                  <p className="text-xs text-white/60">
                    {t('summary.analytics') || 'Financial insights'}
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-white/30 group-hover:text-emerald-400 transition-all" />
            </div>
            <p className="text-xs text-white/70 leading-relaxed">
              {t('summary.financeDesc') || 'Track revenue, expenses, and profitability'}
            </p>
          </Card>
        </motion.div>

        {/* Quick Stats Row */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass rounded-xl border border-white/10 backdrop-blur-sm p-6 hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-lg bg-accent-500/10 border border-accent-400/30">
              <Zap className="w-5 h-5 text-accent-400" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-white mb-2">
                {t('summary.quickStats') || 'Quick Stats'}
              </h3>
              <p className="text-sm text-white/70 leading-relaxed">
                {t('summary.statsDesc') || 'You have full access to all modules. Start by exploring shows, planning travel, or reviewing your financial performance.'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Summary;
export { Summary };
