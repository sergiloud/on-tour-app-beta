import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, AlertCircle, CheckCircle2, Clock } from 'lucide-react';
import { useFinance } from '../../../../context/FinanceContext';
import { useSettings } from '../../../../context/SettingsContext';

export const FinanceApp: React.FC = () => {
  const { snapshot, kpis } = useFinance();
  const { fmtMoney } = useSettings();

  // KPI Cards Data
  const kpiCards = [
    {
      id: 'total-net',
      label: 'Total Net',
      value: fmtMoney(kpis.yearNet),
      icon: DollarSign,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      id: 'pending',
      label: 'Pending',
      value: fmtMoney(kpis.pending),
      icon: Clock,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      id: 'this-month',
      label: 'This Month',
      value: fmtMoney(snapshot.month.net),
      icon: Calendar,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10',
    },
    {
      id: 'avg-show',
      label: 'Avg per Show',
      value: snapshot.shows.length > 0 ? fmtMoney(kpis.yearNet / snapshot.shows.length) : fmtMoney(0),
      icon: TrendingUp,
      color: 'text-purple-400',
      bgColor: 'bg-purple-500/10',
    },
  ];

  // Status breakdown
  const confirmedShows = snapshot.shows.filter(s => s.status === 'confirmed').length;
  const pendingShows = snapshot.shows.filter(s => s.status === 'pending').length;
  const offerShows = snapshot.shows.filter(s => s.status === 'offer').length;

  const statusBreakdown = [
    { label: 'Confirmed', count: confirmedShows, icon: CheckCircle2, color: 'text-emerald-400' },
    { label: 'Pending', count: pendingShows, icon: Clock, color: 'text-amber-400' },
    { label: 'Offers', count: offerShows, icon: AlertCircle, color: 'text-blue-400' },
  ];

  // Recent shows (last 5)
  const recentShows = React.useMemo(() => {
    return [...snapshot.shows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [snapshot.shows]);

  return (
    <div className="h-full flex flex-col bg-dark-900 overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-dark-900/95 backdrop-blur-xl border-b border-white/10 px-4 pt-4 pb-3">
        <h1 className="text-2xl font-bold text-white">Finance</h1>
        <p className="text-sm text-slate-400 mt-1">Your financial overview</p>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 py-6 space-y-6">
        {/* KPI Cards Grid */}
        <div className="grid grid-cols-2 gap-3">
          {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.05,
                type: 'spring',
                stiffness: 350,
                damping: 30,
              }}
              className={`p-4 rounded-xl border border-white/10 ${kpi.bgColor}`}
            >
              <div className="flex items-center justify-between mb-3">
                <kpi.icon className={`w-5 h-5 ${kpi.color}`} />
              </div>
              <div className="space-y-1">
                <div className={`text-2xl font-bold ${kpi.color}`}>
                  {kpi.value}
                </div>
                <div className="text-xs text-slate-400">
                  {kpi.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Show Status</h2>
          <div className="space-y-3">
            {statusBreakdown.map(({ label, count, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg bg-black/20`}>
                    <Icon className={`w-4 h-4 ${color}`} />
                  </div>
                  <span className="text-white font-medium">{label}</span>
                </div>
                <span className={`text-lg font-bold ${color}`}>{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Month Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-white mb-4">This Month</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Income</span>
              <span className="text-emerald-400 font-bold">
                {fmtMoney(snapshot.month.income)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Expenses</span>
              <span className="text-red-400 font-bold">
                {fmtMoney(snapshot.month.expenses)}
              </span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-white font-medium">Net</span>
              <span className={`text-lg font-bold ${snapshot.month.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmtMoney(snapshot.month.net)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Shows */}
        {recentShows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white/5 border border-white/10 rounded-xl p-4"
          >
            <h2 className="text-lg font-semibold text-white mb-4">Recent Shows</h2>
            <div className="space-y-3">
              {recentShows.map((show, index) => (
                <div
                  key={show.id || index}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-white font-medium truncate">
                      {show.name || 'Unnamed Show'}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      {new Date(show.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                      {' • '}
                      {show.city || '—'}
                    </div>
                  </div>
                  <div className="text-right ml-3">
                    <div className="text-emerald-400 font-bold">
                      {fmtMoney(show.fee || 0)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Year Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-br from-accent-500/20 to-accent-600/10 border border-accent-500/30 rounded-xl p-4"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Year Summary</h2>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Income</span>
              <span className="text-emerald-400 font-bold text-lg">
                {fmtMoney(snapshot.year.income)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-300">Total Expenses</span>
              <span className="text-red-400 font-bold text-lg">
                {fmtMoney(snapshot.year.expenses)}
              </span>
            </div>
            <div className="h-px bg-white/20" />
            <div className="flex items-center justify-between">
              <span className="text-white font-semibold">Year Net</span>
              <span className={`text-2xl font-bold ${snapshot.year.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmtMoney(snapshot.year.net)}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
