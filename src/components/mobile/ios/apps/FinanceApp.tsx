import React, { useState, useRef, useMemo, useCallback } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { TrendingUp, DollarSign, Calendar, AlertCircle, CheckCircle2, Clock, RefreshCw } from 'lucide-react';
import { useFinance } from '../../../../context/FinanceContext';
import { useSettings } from '../../../../context/SettingsContext';
import { SkeletonScreen } from '../SkeletonScreen';

export const FinanceApp: React.FC = () => {
  const { snapshot, kpis } = useFinance();
  const { fmtMoney } = useSettings();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Pull to refresh
  const scrollRef = useRef<HTMLDivElement>(null);
  const pullY = useMotionValue(0);
  const pullProgress = useTransform(pullY, [0, 80], [0, 1]);
  const pullRotate = useTransform(pullY, [0, 80], [0, 360]);

  // KPI Cards Data - memoize to prevent recreation
  const kpiCards = useMemo(() => [
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
  ], [kpis.yearNet, kpis.pending, snapshot.month.net, snapshot.shows.length, fmtMoney]);

  // Status breakdown - memoize calculations
  const statusBreakdown = useMemo(() => {
    const confirmedShows = snapshot.shows.filter(s => s.status === 'confirmed').length;
    const pendingShows = snapshot.shows.filter(s => s.status === 'pending').length;
    const offerShows = snapshot.shows.filter(s => s.status === 'offer').length;

    return [
      { label: 'Confirmed', count: confirmedShows, icon: CheckCircle2, color: 'text-emerald-400' },
      { label: 'Pending', count: pendingShows, icon: Clock, color: 'text-amber-400' },
      { label: 'Offers', count: offerShows, icon: AlertCircle, color: 'text-blue-400' },
    ];
  }, [snapshot.shows]);

  // Recent shows (last 5) - already memoized, keep it
  const recentShows = useMemo(() => {
    return [...snapshot.shows]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 5);
  }, [snapshot.shows]);

  // Mark as loaded after data is available
  React.useEffect(() => {
    if (snapshot.shows.length >= 0) {
      setIsLoading(false);
    }
  }, [snapshot.shows.length]);

  // Handle refresh - memoize callback
  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true);
    
    if (navigator.vibrate) {
      navigator.vibrate(10);
    }
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Finance data is already reactive from context
    setIsRefreshing(false);
    pullY.set(0);
  }, [pullY]);

  // Pull to refresh handlers - memoize
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    const scrollTop = scrollRef.current?.scrollTop || 0;
    if (scrollTop === 0 && !isRefreshing) {
      const touch = e.touches[0];
      if (!touch) return;

      const startY = touch.clientY;

      const handleTouchMove = (e: TouchEvent) => {
        const touch = e.touches[0];
        if (!touch) return;

        const deltaY = Math.max(0, touch.clientY - startY);
        pullY.set(Math.min(deltaY, 100));
      };

      const handleTouchEnd = () => {
        if (pullY.get() > 80 && !isRefreshing) {
          handleRefresh();
        } else {
          pullY.set(0);
        }
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };

      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
    }
  }, [isRefreshing, handleRefresh, pullY]);

  return (
    <div className="h-full flex flex-col bg-gradient-to-b from-gray-900 via-gray-900 to-black overflow-y-auto relative">
      {/* Pull to Refresh Indicator */}
      <motion.div
        className="absolute top-0 left-1/2 -translate-x-1/2 z-20 flex items-center justify-center"
        style={{ y: pullY }}
      >
        <motion.div
          className="w-10 h-10 rounded-full bg-accent-500/20 backdrop-blur-md flex items-center justify-center"
          style={{ 
            opacity: pullProgress,
            scale: pullProgress
          }}
        >
          <motion.div style={{ rotate: pullRotate }}>
            <RefreshCw 
              className={`w-5 h-5 ${isRefreshing ? 'text-accent-500 animate-spin' : 'text-accent-500'}`}
              strokeWidth={2.5}
            />
          </motion.div>
        </motion.div>
      </motion.div>

      {/* Header - Desktop Style */}
      <div className="sticky top-0 z-10 bg-gray-900/60 backdrop-blur-xl border-b border-white/10 px-5 pt-5 pb-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-sf-display text-ios-title1 font-bold text-white">Finance</h1>
            <p className="font-sf-text text-ios-caption1 text-white/50 mt-0.5">Your financial overview</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-2.5 py-1 bg-emerald-500/10 rounded-md">
              <span className="font-sf-text text-ios-caption1 font-semibold text-emerald-400">{snapshot.shows.length} shows</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div 
        ref={scrollRef}
        className="flex-1 px-5 py-5 space-y-3"
        onTouchStart={handleTouchStart}
      >
        {isLoading ? (
          <>
            <SkeletonScreen variant="grid" count={4} />
            <SkeletonScreen variant="list" count={3} />
          </>
        ) : (
          <>
            {/* KPI Cards Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              {kpiCards.map((kpi, index) => (
            <motion.div
              key={kpi.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: index * 0.03,
                duration: 0.2,
                ease: [0.4, 0, 0.2, 1],
              }}
              className={`px-3.5 py-3 rounded-lg border border-white/10 ${kpi.bgColor}`}
            >
              <div className="flex items-center justify-between mb-2">
                <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
              </div>
              <div className="space-y-1">
                <div className={`text-sm font-bold ${kpi.color}`}>
                  {kpi.value}
                </div>
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium">
                  {kpi.label}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Status Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.12, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3"
        >
          <h2 className="text-sm font-semibold text-white mb-3">Show Status</h2>
          <div className="space-y-2.5">
            {statusBreakdown.map(({ label, count, icon: Icon, color }) => (
              <div key={label} className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-md bg-black/20`}>
                    <Icon className={`w-3 h-3 ${color}`} />
                  </div>
                  <span className="text-xs text-white font-medium">{label}</span>
                </div>
                <span className={`text-sm font-bold ${color}`}>{count}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Month Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18, duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-3"
        >
          <h2 className="text-sm font-semibold text-white mb-3">This Month</h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Income</span>
              <span className="text-emerald-400 font-bold text-sm">
                {fmtMoney(snapshot.month.income)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/50">Expenses</span>
              <span className="text-red-400 font-bold text-sm">
                {fmtMoney(snapshot.month.expenses)}
              </span>
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-medium">Net</span>
              <span className={`text-base font-bold ${snapshot.month.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmtMoney(snapshot.month.net)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* Recent Shows */}
        {recentShows.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.18, duration: 0.18, ease: 'easeOut' }}
            className="bg-white/5 border border-white/10 rounded-lg px-4 py-3 widget-container"
          >
            <h2 className="text-sm font-semibold text-white mb-3">Recent Shows</h2>
            <div className="space-y-2.5">
              {recentShows.map((show, index) => (
                <div
                  key={show.id || index}
                  className="flex items-center justify-between py-2 card-list-item"
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs text-white font-medium truncate">
                      {show.name || 'Unnamed Show'}
                    </div>
                    <div className="text-[10px] text-white/50 mt-0.5">
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
                    <div className="text-emerald-400 font-bold text-xs">
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
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.22, duration: 0.18, ease: 'easeOut' }}
          className="bg-blue-500/10 border border-blue-500/30 rounded-lg px-4 py-3 widget-container"
        >
          <h2 className="text-sm font-semibold text-white mb-3">Year Summary</h2>
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Total Income</span>
              <span className="text-emerald-400 font-bold text-sm">
                {fmtMoney(snapshot.year.income)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/70">Total Expenses</span>
              <span className="text-red-400 font-bold text-sm">
                {fmtMoney(snapshot.year.expenses)}
              </span>
            </div>
            <div className="h-px bg-white/20" />
            <div className="flex items-center justify-between">
              <span className="text-xs text-white font-semibold">Year Net</span>
              <span className={`text-lg font-bold ${snapshot.year.net >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                {fmtMoney(snapshot.year.net)}
              </span>
            </div>
          </div>
        </motion.div>
          </>
        )}
      </div>
    </div>
  );
};
