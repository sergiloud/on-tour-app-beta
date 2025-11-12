import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { useFinance } from '../../context/FinanceContext';
import { useOrg } from '../../context/OrgContext';
import { useShows } from '../../hooks/useShows';
import { useContactsQuery } from '../../hooks/useContactsQuery';
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
  Plane,
  ArrowUpRight,
  Music,
  Building2,
  Globe2,
  Clock,
} from 'lucide-react';

/**
 * Summary Page - Application Overview Dashboard
 * Displays key metrics across all modules: Finance, Shows, Travel, Contacts
 * Synchronized with real profile and organization data
 */

const Summary: React.FC = () => {
  const navigate = useNavigate();
  const { userId } = useAuth();
  const { fmtMoney } = useSettings();
  const { snapshot } = useFinance();
  const { org } = useOrg();
  const { shows } = useShows();
  const { data: contacts = [] } = useContactsQuery();

  React.useEffect(() => {
    trackPageView('summary');
  }, [userId]);

  // Calculate key metrics
  const mtdNet = snapshot?.month.net || 0;
  const ytdNet = snapshot?.year.net || 0;
  const income = snapshot?.month.income || 0;
  const expenses = snapshot?.month.expenses || 0;

  // Calculate show statistics
  const showStats = useMemo(() => {
    const now = new Date();
    const upcoming = shows.filter(s => new Date(s.date) >= now && s.status !== 'canceled');
    const thisMonth = upcoming.filter(s => {
      const showDate = new Date(s.date);
      return showDate.getMonth() === now.getMonth() && showDate.getFullYear() === now.getFullYear();
    });
    const confirmed = upcoming.filter(s => s.status === 'confirmed');

    return {
      total: shows.length,
      upcoming: upcoming.length,
      thisMonth: thisMonth.length,
      confirmed: confirmed.length,
    };
  }, [shows]);

  // Calculate contact statistics
  const contactStats = useMemo(() => {
    const promoters = contacts.filter(c => c.type === 'promoter');
    const venueManagers = contacts.filter(c => c.type === 'venue_manager');
    const countries = new Set(contacts.filter(c => c.country).map(c => c.country));

    return {
      total: contacts.length,
      promoters: promoters.length,
      venues: venueManagers.length,
      countries: countries.size,
    };
  }, [contacts]);

  const getTrendIcon = (isPositive: boolean) => {
    return isPositive ? (
      <TrendingUp className="w-4 h-4 text-emerald-400" />
    ) : (
      <TrendingDown className="w-4 h-4 text-rose-400" />
    );
  };

  return (
    <div className="min-h-screen bg-surface-card">
      <div className="max-w-[1600px] mx-auto px-4 md:px-6 py-6 md:py-8 lg:py-10 space-y-8">
        {/* Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl border border-theme backdrop-blur-sm overflow-hidden hover:border-theme-strong transition-all duration-300"
        >
          <div className="bg-gradient-to-r from-transparent via-interactive to-transparent px-6 py-8 lg:py-10">
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="w-1 h-12 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-theme-heading">
                    {t('summary.title') || 'Dashboard Overview'}
                  </h1>
                  <p className="text-sm lg:text-base text-theme-secondary mt-1">
                    {t('summary.subtitle') || 'Your business at a glance'}
                  </p>
                </div>
              </div>
              {org && (
                <div className="flex items-center gap-2 text-xs text-theme-muted ml-5">
                  <Building2 className="w-3.5 h-3.5" />
                  <span className="px-2.5 py-1 rounded-lg bg-interactive border border-theme">
                    {org.name}
                  </span>
                  <span className="text-theme-muted">•</span>
                  <span className="capitalize">{org.type}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Primary Financial Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ staggerChildren: 0.05 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* This Month Net */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <Card className="glass border border-theme p-6 flex flex-col gap-3 hover:border-accent-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-secondary">
                  This Month
                </span>
                <DollarSign className="w-4 h-4 text-accent-400 opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl lg:text-3xl font-bold tabular-nums text-theme-heading">
                  {fmtMoney(mtdNet)}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {getTrendIcon(mtdNet >= 0)}
                  <span className={mtdNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    Net Profit
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Year to Date */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Card className="glass border border-theme p-6 flex flex-col gap-3 hover:border-emerald-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-secondary">
                  Year to Date
                </span>
                <TrendingUp className="w-4 h-4 text-emerald-400 opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl lg:text-3xl font-bold tabular-nums text-theme-heading">
                  {fmtMoney(ytdNet)}
                </div>
                <div className="flex items-center gap-2 text-xs">
                  {getTrendIcon(ytdNet >= 0)}
                  <span className={ytdNet >= 0 ? 'text-emerald-400' : 'text-rose-400'}>
                    Total Year
                  </span>
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Income */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Card className="glass border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-3 hover:border-blue-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-secondary">
                  Revenue
                </span>
                <BarChart3 className="w-4 h-4 text-blue-400 opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl lg:text-3xl font-bold tabular-nums text-theme-primary">
                  {fmtMoney(income)}
                </div>
                <div className="text-xs text-theme-secondary">
                  This Month
                </div>
              </div>
            </Card>
          </motion.div>

          {/* Expenses */}
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
            <Card className="glass border border-slate-200 dark:border-white/10 p-6 flex flex-col gap-3 hover:border-orange-500/30 transition-all duration-300">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-theme-secondary">
                  Expenses
                </span>
                <TrendingDown className="w-4 h-4 text-orange-400 opacity-60" />
              </div>
              <div className="space-y-2">
                <div className="text-2xl lg:text-3xl font-bold tabular-nums text-theme-primary">
                  {fmtMoney(expenses)}
                </div>
                <div className="text-xs text-theme-secondary">
                  This Month
                </div>
              </div>
            </Card>
          </motion.div>
        </motion.div>

        {/* Activity Metrics */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
        >
          {/* Total Shows */}
          <Card className="glass border border-slate-200 dark:border-white/10 p-5 flex items-center gap-4 hover:border-accent-500/30 transition-all duration-300">
            <div className="p-3 rounded-lg bg-accent-500/10 border border-accent-400/30">
              <Music className="w-5 h-5 text-accent-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold tabular-nums text-theme-primary">
                {showStats.total}
              </div>
              <div className="text-xs text-theme-secondary">Total Shows</div>
            </div>
          </Card>

          {/* Upcoming Shows */}
          <Card className="glass border border-slate-200 dark:border-white/10 p-5 flex items-center gap-4 hover:border-purple-500/30 transition-all duration-300">
            <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-400/30">
              <Calendar className="w-5 h-5 text-purple-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold tabular-nums text-theme-primary">
                {showStats.upcoming}
              </div>
              <div className="text-xs text-theme-secondary">Upcoming</div>
            </div>
          </Card>

          {/* Total Contacts */}
          <Card className="glass border border-slate-200 dark:border-white/10 p-5 flex items-center gap-4 hover:border-cyan-500/30 transition-all duration-300">
            <div className="p-3 rounded-lg bg-cyan-500/10 border border-cyan-400/30">
              <Users className="w-5 h-5 text-cyan-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold tabular-nums text-theme-primary">
                {contactStats.total}
              </div>
              <div className="text-xs text-theme-secondary">Contacts</div>
            </div>
          </Card>

          {/* Countries */}
          <Card className="glass border border-slate-200 dark:border-white/10 p-5 flex items-center gap-4 hover:border-emerald-500/30 transition-all duration-300">
            <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-400/30">
              <Globe2 className="w-5 h-5 text-emerald-400" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-2xl font-bold tabular-nums text-theme-primary">
                {contactStats.countries}
              </div>
              <div className="text-xs text-theme-secondary">Countries</div>
            </div>
          </Card>
        </motion.div>

        {/* Module Navigation Cards */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          {/* Shows Module */}
          <Card
            onClick={() => navigate('/dashboard/shows')}
            className="glass border border-slate-200 dark:border-white/10 p-6 hover:border-accent-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-accent-500/10 border border-accent-400/30 group-hover:bg-accent-500/20 transition-all">
                  <Calendar className="w-5 h-5 text-accent-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-theme-primary">
                    Shows & Events
                  </h3>
                  <p className="text-xs text-theme-secondary">
                    {showStats.upcoming} upcoming • {showStats.thisMonth} this month
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-white/30 group-hover:text-accent-400 transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-theme-primary">{showStats.total}</div>
                <div className="text-[10px] text-theme-muted uppercase tracking-wider">Total</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-accent-400">{showStats.confirmed}</div>
                <div className="text-[10px] text-theme-muted uppercase tracking-wider">Confirmed</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{showStats.thisMonth}</div>
                <div className="text-[10px] text-theme-muted uppercase tracking-wider">This Month</div>
              </div>
            </div>
          </Card>

          {/* Travel Module */}
          <Card
            onClick={() => navigate('/dashboard/travel')}
            className="glass border border-slate-200 dark:border-white/10 p-6 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-purple-500/10 border border-purple-400/30 group-hover:bg-purple-500/20 transition-all">
                  <Plane className="w-5 h-5 text-purple-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-theme-primary">
                    Travel & Logistics
                  </h3>
                  <p className="text-xs text-theme-secondary">
                    Plan flights, hotels & transport
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-white/30 group-hover:text-purple-400 transition-all" />
            </div>
            <p className="text-xs text-slate-500 dark:text-white/70 leading-relaxed">
              Organize all travel arrangements, accommodations, and logistics for your tour schedule
            </p>
          </Card>

          {/* Calendar Module */}
          <Card
            onClick={() => navigate('/dashboard/calendar')}
            className="glass border border-slate-200 dark:border-white/10 p-6 hover:border-cyan-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-cyan-500/10 border border-cyan-400/30 group-hover:bg-cyan-500/20 transition-all">
                  <Clock className="w-5 h-5 text-cyan-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-theme-primary">
                    Calendar View
                  </h3>
                  <p className="text-xs text-theme-secondary">
                    Timeline & schedule overview
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-white/30 group-hover:text-cyan-400 transition-all" />
            </div>
            <p className="text-xs text-slate-500 dark:text-white/70 leading-relaxed">
              View all your events and commitments in a comprehensive calendar interface
            </p>
          </Card>

          {/* Finance Module */}
          <Card
            onClick={() => navigate('/dashboard/finance')}
            className="glass border border-slate-200 dark:border-white/10 p-6 hover:border-emerald-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-400/30 group-hover:bg-emerald-500/20 transition-all">
                  <BarChart3 className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-theme-primary">
                    Finance & Analytics
                  </h3>
                  <p className="text-xs text-theme-secondary">
                    Revenue, expenses & reports
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-white/30 group-hover:text-emerald-400 transition-all" />
            </div>
            <div className="grid grid-cols-2 gap-3 mt-4">
              <div>
                <div className="text-xs text-theme-muted mb-1">Income MTD</div>
                <div className="text-base font-bold text-emerald-400">{fmtMoney(income)}</div>
              </div>
              <div>
                <div className="text-xs text-theme-muted mb-1">Net MTD</div>
                <div className="text-base font-bold text-theme-primary">{fmtMoney(mtdNet)}</div>
              </div>
            </div>
          </Card>

          {/* Contacts Module */}
          <Card
            onClick={() => navigate('/dashboard/contacts')}
            className="glass border border-slate-200 dark:border-white/10 p-6 hover:border-blue-500/50 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-blue-500/10 border border-blue-400/30 group-hover:bg-blue-500/20 transition-all">
                  <Users className="w-5 h-5 text-blue-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-theme-primary">
                    CRM & Contacts
                  </h3>
                  <p className="text-xs text-theme-secondary">
                    {contactStats.total} contacts • {contactStats.countries} countries
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-white/30 group-hover:text-blue-400 transition-all" />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-4">
              <div className="text-center">
                <div className="text-lg font-bold text-blue-400">{contactStats.promoters}</div>
                <div className="text-[10px] text-theme-muted uppercase tracking-wider">Promoters</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-purple-400">{contactStats.venues}</div>
                <div className="text-[10px] text-theme-muted uppercase tracking-wider">Venues</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-cyan-400">{contactStats.countries}</div>
                <div className="text-[10px] text-theme-muted uppercase tracking-wider">Countries</div>
              </div>
            </div>
          </Card>

          {/* Settings Module */}
          <Card
            onClick={() => navigate('/dashboard/org')}
            className="glass border border-slate-200 dark:border-white/10 p-6 hover:border-slate-400 dark:hover:border-white/30 transition-all duration-300 cursor-pointer group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-lg bg-interactive border border-slate-200 dark:border-white/10 group-hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-all">
                  <Building2 className="w-5 h-5 text-theme-secondary" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-theme-primary">
                    Organization Settings
                  </h3>
                  <p className="text-xs text-theme-secondary">
                    Profile, team & preferences
                  </p>
                </div>
              </div>
              <ArrowUpRight className="w-5 h-5 text-slate-300 dark:text-white/30 group-hover:text-theme-secondary transition-all" />
            </div>
            <p className="text-xs text-slate-500 dark:text-white/70 leading-relaxed">
              Configure your workspace, manage team members, and customize your experience
            </p>
          </Card>
        </motion.div>

        {/* Quick Actions Banner */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm p-6 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-lg bg-gradient-to-br from-accent-500/20 to-blue-500/20 border border-accent-400/30">
                <MapPin className="w-5 h-5 text-accent-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-white mb-2">
                  Welcome to OnTour
                </h3>
                <p className="text-sm text-slate-500 dark:text-white/70 leading-relaxed">
                  You have full access to all modules. Start by exploring shows, planning travel, or reviewing your financial performance.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Summary;
export { Summary };
