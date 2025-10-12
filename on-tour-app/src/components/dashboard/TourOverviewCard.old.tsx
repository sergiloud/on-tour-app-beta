import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, TrendingUp, MapPin, Clock, DollarSign, Users } from 'lucide-react';
import { Card } from '../../ui/Card';
import { showStore } from '../../shared/showStore';
import { useSettings } from '../../context/SettingsContext';
import { getCurrentOrgId } from '../../lib/tenants';
import { Link } from 'react-router-dom';

const STAGE_PROB: Record<'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived', number> = {
  confirmed: 1,
  pending: 0.6,
  offer: 0.3,
  canceled: 0,
  archived: 0
};

const probOf = (status: string): number => (STAGE_PROB as any)[status] ?? 0;

const STATUS_COLORS = {
  confirmed: 'bg-green-500/20 border-green-500/40 text-green-200',
  pending: 'bg-amber-500/20 border-amber-500/40 text-amber-200',
  offer: 'bg-blue-500/20 border-blue-500/40 text-blue-200',
  canceled: 'bg-red-500/20 border-red-500/40 text-red-200',
  archived: 'bg-gray-500/20 border-gray-500/40 text-gray-200'
};

export const TourOverviewCard: React.FC = () => {
  const { fmtMoney } = useSettings();
  const [orgId, setOrgId] = useState<string>(() => { try { return getCurrentOrgId(); } catch { return ''; } });

  useEffect(() => {
    const onTenant = (e: Event) => {
      try { const id = (e as CustomEvent).detail?.id as string | undefined; setOrgId(id || getCurrentOrgId()); } catch { setOrgId(getCurrentOrgId()); }
    };
    window.addEventListener('tenant:changed' as any, onTenant);
    return () => window.removeEventListener('tenant:changed' as any, onTenant);
  }, []);

  const data = useMemo(() => {
    const now = Date.now();
    const in30 = now + 30 * 24 * 60 * 60 * 1000;
    const in90 = now + 90 * 24 * 60 * 60 * 1000;
    const shows = showStore.getAll().filter((s: any) => !s.tenantId || s.tenantId === orgId);

    // Upcoming shows (next 30 days)
    const upcoming = shows.filter(s => {
      const t = new Date(s.date).getTime();
      return t >= now && t <= in30;
    }).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    // All future shows (for total count)
    const allFuture = shows.filter(s => new Date(s.date).getTime() >= now);

    // Next 90 days for extended view
    const next90 = shows.filter(s => {
      const t = new Date(s.date).getTime();
      return t >= now && t <= in90;
    });

    const confirmed = upcoming.filter(s => s.status === 'confirmed').length;
    const pending = upcoming.filter(s => s.status === 'pending').length;
    const offer = upcoming.filter(s => s.status === 'offer').length;

    const expected = Math.round(upcoming.reduce((acc, s) => acc + s.fee * probOf(s.status as any), 0));
    const confirmedRevenue = Math.round(upcoming.filter(s => s.status === 'confirmed').reduce((acc, s) => acc + s.fee, 0));
    const avgShowValue = upcoming.length > 0 ? Math.round(expected / upcoming.length) : 0;

    // Next show
    const nextShow = upcoming[0] || null;
    const timeToNext = nextShow ? new Date(nextShow.date).getTime() - now : 0;
    const daysToNext = Math.ceil(timeToNext / (24 * 60 * 60 * 1000));

    // Weekly breakdown (next 4 weeks)
    const weeks = Array.from({ length: 4 }).map((_, i) => {
      const start = now + i * 7 * 24 * 60 * 60 * 1000;
      const end = start + 7 * 24 * 60 * 60 * 1000;
      const weekShows = upcoming.filter(s => { const t = new Date(s.date).getTime(); return t >= start && t < end; });
      const sum = Math.round(weekShows.reduce((a, s) => a + s.fee * probOf(s.status as any), 0));
      return { count: weekShows.length, revenue: sum };
    });
    const maxWeekRevenue = Math.max(1, ...weeks.map(w => w.revenue));

    // Top 3 upcoming shows by value
    const topShows = [...upcoming]
      .sort((a, b) => (b.fee * probOf(b.status as any)) - (a.fee * probOf(a.status as any)))
      .slice(0, 3);

    return {
      upcomingCount: upcoming.length,
      totalFuture: allFuture.length,
      confirmed,
      pending,
      offer,
      expected,
      confirmedRevenue,
      avgShowValue,
      nextShow,
      daysToNext,
      weeks,
      maxWeekRevenue,
      topShows,
      next90Count: next90.length
    };
  }, [orgId]);

  return (
    <Card className="p-0 flex flex-col overflow-hidden" aria-label="Tour overview">
      {/* Header with gradient */}
      <header className="px-4 pt-4 pb-3 bg-gradient-to-r from-slate-900/50 to-slate-800/30 border-b border-white/5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-base md:text-lg font-semibold tracking-tight flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Tour Overview
          </h3>
          <Link
            to="/dashboard/shows"
            className="text-xs px-2.5 py-1 rounded-lg glass hover:bg-white/15 transition-all"
          >
            View all
          </Link>
        </div>
        <div className="text-xs opacity-70">Next 30 days • {data.totalFuture} total shows booked</div>
      </header>

      <div className="p-4 space-y-4">
        {/* Next Show Highlight */}
        {data.nextShow && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-lg p-3 border border-accent-500/30"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-3.5 h-3.5 text-accent-500" />
                  <span className="text-xs font-medium text-accent-400">Next Show</span>
                </div>
                <div className="font-semibold truncate">{data.nextShow.city}</div>
                <div className="text-xs opacity-70 mt-0.5">
                  {new Date(data.nextShow.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {' • '}
                  {data.daysToNext === 0 ? 'Today' : data.daysToNext === 1 ? 'Tomorrow' : `in ${data.daysToNext} days`}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-accent-400">{fmtMoney(data.nextShow.fee)}</div>
                <span className={`text-xs px-2 py-0.5 rounded-md border ${STATUS_COLORS[data.nextShow.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending}`}>
                  {data.nextShow.status}
                </span>
              </div>
            </div>
          </motion.div>
        )}

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-2 gap-2">
          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
              <MapPin className="w-3 h-3" />
              Shows
            </div>
            <div className="text-xl font-bold">{data.upcomingCount}</div>
            <div className="text-xs opacity-60 mt-0.5">
              {data.confirmed} confirmed • {data.pending} pending
            </div>
          </div>

          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
              <DollarSign className="w-3 h-3" />
              Expected
            </div>
            <div className="text-xl font-bold text-accent-400">{fmtMoney(data.expected)}</div>
            <div className="text-xs opacity-60 mt-0.5">
              {fmtMoney(data.confirmedRevenue)} locked
            </div>
          </div>

          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
              <TrendingUp className="w-3 h-3" />
              Avg/Show
            </div>
            <div className="text-lg font-bold">{fmtMoney(data.avgShowValue)}</div>
          </div>

          <div className="glass rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1 text-xs opacity-70">
              <Users className="w-3 h-3" />
              Pipeline
            </div>
            <div className="text-lg font-bold text-blue-400">{data.offer}</div>
            <div className="text-xs opacity-60 mt-0.5">offers pending</div>
          </div>
        </div>

        {/* Weekly Revenue Chart */}
        <div className="glass rounded-lg p-3">
          <div className="text-xs font-medium mb-2 opacity-80">Next 4 Weeks Revenue</div>
          <div className="flex items-end gap-2 h-20">
            {data.weeks.map((week, i) => {
              const height = (week.revenue / data.maxWeekRevenue) * 100;
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${height}%` }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                    className="w-full bg-gradient-to-t from-accent-500/30 to-accent-500/80 rounded-t-sm min-h-[4px]"
                    title={`Week ${i + 1}: ${fmtMoney(week.revenue)}`}
                  />
                  <div className="text-[10px] opacity-60">W{i + 1}</div>
                  <div className="text-[10px] font-medium">{week.count}</div>
                </div>
              );
            })}
          </div>
          <div className="text-[10px] opacity-50 mt-2 text-center">Shows per week</div>
        </div>

        {/* Top Shows */}
        {data.topShows.length > 0 && (
          <div>
            <div className="text-xs font-medium mb-2 opacity-80">Top Shows (by value)</div>
            <div className="space-y-2">
              {data.topShows.map((show, i) => (
                <div key={show.id} className="glass rounded-lg p-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <span className="text-xs font-bold opacity-50">#{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{show.city}</div>
                      <div className="text-[10px] opacity-60">
                        {new Date(show.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-bold">{fmtMoney(show.fee)}</div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded border ${STATUS_COLORS[show.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.pending}`}>
                      {show.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export default TourOverviewCard;
