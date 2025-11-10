import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
    Calendar, TrendingUp, DollarSign, Clock, Target,
    Zap, ArrowUpRight, ArrowDownRight, AlertTriangle, MapPin
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { showStore } from '../../shared/showStore';
import { useSettings } from '../../context/SettingsContext';
import { getCurrentOrgId } from '../../lib/tenants';
import { Link } from 'react-router-dom';
import { sanitizeName } from '../../lib/sanitize';

interface TimelineEvent {
    date: string;
    type: 'show' | 'gap';
    city?: string;
    venue?: string;
    status?: string;
    fee?: number;
    daysFromNow: number;
}

const STAGE_PROB: Record<string, number> = {
    confirmed: 1.0,
    pending: 0.6,
    offer: 0.3,
    canceled: 0,
    archived: 0
};

export const TourOverviewPro: React.FC = () => {
    const { fmtMoney } = useSettings();
    const orgId = getCurrentOrgId();

    const data = useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        const allShows = showStore.getAll().filter((s: any) => !s.tenantId || s.tenantId === orgId);

        // Time windows
        const upcoming = allShows
            .filter((s: any) => new Date(s.date).getTime() >= now)
            .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const upcoming30 = upcoming.filter((s: any) => new Date(s.date).getTime() <= now + 30 * DAY);
        const upcoming90 = upcoming.filter((s: any) => new Date(s.date).getTime() <= now + 90 * DAY);

        const past30 = allShows.filter((s: any) => {
            const t = new Date(s.date).getTime();
            return t >= now - 30 * DAY && t < now;
        });

        // Revenue calculations
        const revenue30 = upcoming30.reduce((sum: number, s: any) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);
        const revenue90 = upcoming90.reduce((sum: number, s: any) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);
        const confirmedRevenue30 = upcoming30.filter((s: any) => s.status === 'confirmed').reduce((sum: number, s: any) => sum + s.fee, 0);
        const pastRevenue30 = past30.filter((s: any) => s.status === 'confirmed').reduce((sum: number, s: any) => sum + s.fee, 0);

        const avgShowValue = upcoming30.length > 0 ? revenue30 / upcoming30.length : 0;
        const growth = pastRevenue30 > 0 ? ((revenue30 - pastRevenue30) / pastRevenue30) * 100 : 0;

        // Timeline - next 21 days with gaps
        const timeline: TimelineEvent[] = [];
        const next21 = upcoming.filter((s: any) => new Date(s.date).getTime() <= now + 21 * DAY);

        next21.forEach((show: any, i: number) => {
            const daysFromNow = Math.ceil((new Date(show.date).getTime() - now) / DAY);
            timeline.push({
                date: show.date,
                type: 'show',
                city: show.city,
                venue: show.venue,
                status: show.status,
                fee: show.fee,
                daysFromNow
            });

            // Check for gaps > 4 days
            if (i < next21.length - 1) {
                const nextShow = next21[i + 1];
                if (nextShow) {
                    const gap = (new Date(nextShow.date).getTime() - new Date(show.date).getTime()) / DAY;
                    if (gap > 4) {
                        timeline.push({
                            date: show.date,
                            type: 'gap',
                            daysFromNow: daysFromNow + Math.floor(gap / 2)
                        });
                    }
                }
            }
        });

        // Status breakdown
        const confirmed = upcoming30.filter((s: any) => s.status === 'confirmed').length;
        const pending = upcoming30.filter((s: any) => s.status === 'pending').length;
        const offers = upcoming30.filter((s: any) => s.status === 'offer').length;

        // Conversion metrics
        const velocity = past30.length > 0 ? (upcoming30.length / past30.length - 1) * 100 : 0;
        const conversionRate = (confirmed + pending + offers) > 0 ? (confirmed / (confirmed + pending + offers)) * 100 : 0;

        return {
            revenue30,
            revenue90,
            confirmedRevenue30,
            avgValue: avgShowValue,
            growth,
            velocity,
            conversionRate,
            shows30: upcoming30.length,
            shows90: upcoming90.length,
            confirmed,
            pending,
            offers,
            timeline,
            nextShow: upcoming[0] || null
        };
    }, [orgId, fmtMoney]);

    return (
        <div className="relative overflow-hidden rounded-xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:hover:border-white/20 hover:shadow-lg hover:shadow-accent-500/5">
            {/* Gradiente decorativo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 flex flex-col gap-4">
                {/* Header elegante */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Tour Overview</h2>
                            <p className="text-xs opacity-60 mt-0.5">Next 30 days performance</p>
                        </div>
                    </div>
                    <Link
                        to="/dashboard/shows"
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-accent-500/20 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 transition-all duration-300 font-medium"
                    >
                        View all →
                    </Link>
                </div>

                {/* Summary Stats - Compact row elegante */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex items-center justify-between p-4 border border-slate-200 dark:border-white/10 rounded-xl bg-gradient-to-r from-slate-100 dark:from-white/5 to-white/10 hover:border-accent-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10"
                >
                    <div className="flex items-center gap-6">
                        <div className="transition-transform duration-300 group-hover:scale-105">
                            <div className="text-xs opacity-60 mb-1 font-medium">Next 30 days</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent">{data.shows30}</span>
                                <span className="text-xs opacity-60">shows</span>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-white/20 to-transparent" />
                        <div className="transition-transform duration-300 group-hover:scale-105">
                            <div className="text-xs opacity-60 mb-1 font-medium">Projected</div>
                            <div className="text-lg font-bold bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent">{fmtMoney(data.revenue30)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 font-semibold hover:bg-green-500/30 transition-all duration-300 cursor-default">{data.confirmed} confirmed</span>
                        <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold hover:bg-amber-500/30 transition-all duration-300 cursor-default">{data.pending} pending</span>
                        {data.offers > 0 && <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold hover:bg-blue-500/30 transition-all duration-300 cursor-default">{data.offers} offers</span>}
                    </div>
                </motion.div>

                {/* Next Show Highlight elegante */}
                {data.nextShow && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="group relative overflow-hidden border border-accent-500/30 rounded-xl p-4 bg-gradient-to-br from-accent-500/10 to-blue-500/5 hover:border-accent-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/20 cursor-pointer"
                    >
                        {/* Gradiente decorativo */}
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-500/10 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                        <div className="relative flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-2">
                                    <Clock className="w-4 h-4 text-accent-400 group-hover:scale-110 transition-transform" />
                                    <span className="text-xs font-semibold text-accent-400 uppercase tracking-wider">Next Show</span>
                                </div>
                                <div className="font-bold text-lg truncate group-hover:text-accent-300 transition-colors">{sanitizeName(data.nextShow.city)}</div>
                                <div className="text-xs opacity-70 mt-1 flex items-center gap-2">
                                    <MapPin className="w-3 h-3" />
                                    <span>{sanitizeName(data.nextShow.venue)}</span>
                                    <span className="opacity-50">·</span>
                                    <span>{new Date(data.nextShow.date).toLocaleDateString('en-US', {
                                        weekday: 'short', month: 'short', day: 'numeric'
                                    })}</span>
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-bold bg-gradient-to-br from-accent-400 to-blue-400 bg-clip-text text-transparent group-hover:scale-105 transition-transform">{fmtMoney(data.nextShow.fee)}</div>
                                <span className={`inline-block mt-1 text-[10px] px-2.5 py-1 rounded-lg font-semibold border ${data.nextShow.status === 'confirmed' ? 'bg-green-500/20 text-green-300 border-green-500/30' :
                                    data.nextShow.status === 'pending' ? 'bg-amber-500/20 text-amber-300 border-amber-500/30' :
                                        'bg-blue-500/20 text-blue-300 border-blue-500/30'
                                    }`}>
                                    {data.nextShow.status}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Timeline - Next 21 days */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <div className="text-sm font-medium flex items-center gap-2">
                            <Calendar className="w-3.5 h-3.5 opacity-70" />
                            Next 21 Days
                        </div>
                        <div className="flex items-center gap-3 text-xs opacity-70">
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-green-500" />
                                <span>Confirmed</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-amber-500" />
                                <span>Pending</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <div className="w-2 h-2 rounded-full bg-blue-500" />
                                <span>Offer</span>
                            </div>
                        </div>
                    </div>

                    <div className="border border-slate-200 dark:border-white/10 rounded-lg overflow-hidden">
                        {data.timeline.length === 0 ? (
                            <div className="p-6 text-center text-sm opacity-60">
                                No shows scheduled in next 21 days
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-200 dark:divide-white/5">
                                {data.timeline.slice(0, 8).map((event, i) => (
                                    <motion.div
                                        key={`${event.type}-${i}-${event.date}`}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: 0.25 + i * 0.03 }}
                                        className={`p-3 ${event.type === 'gap'
                                            ? 'bg-amber-500/5'
                                            : 'hover:bg-slate-100 dark:hover:bg-white/5 transition-colors'
                                            }`}
                                    >
                                        {event.type === 'show' ? (
                                            <div className="flex items-center gap-3">
                                                {/* Status dot */}
                                                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${event.status === 'confirmed' ? 'bg-green-500' :
                                                    event.status === 'pending' ? 'bg-amber-500' :
                                                        'bg-blue-500'
                                                    }`} />

                                                {/* Date */}
                                                <div className="w-14 flex-shrink-0 text-xs opacity-70">
                                                    {event.daysFromNow === 0 ? 'Today' :
                                                        event.daysFromNow === 1 ? 'Tomorrow' :
                                                            `${event.daysFromNow}d`}
                                                </div>

                                                {/* City & Venue */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="font-medium text-sm truncate">{sanitizeName(event.city || '')}</div>
                                                    {event.venue && (
                                                        <div className="text-xs opacity-60 truncate">{sanitizeName(event.venue)}</div>
                                                    )}
                                                </div>

                                                {/* Fee */}
                                                <div className="text-sm font-bold tabular-nums">
                                                    {event.fee ? fmtMoney(event.fee) : '—'}
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2 text-xs">
                                                <AlertTriangle className="w-3 h-3 text-amber-400" />
                                                <span className="text-amber-400">Schedule gap detected</span>
                                            </div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}

                        {data.timeline.length > 8 && (
                            <Link
                                to="/dashboard/shows"
                                className="block p-2 text-center text-xs text-accent-400 hover:bg-slate-100 dark:bg-white/5 transition-colors border-t border-white/5"
                            >
                                + {data.timeline.length - 8} more shows
                            </Link>
                        )}
                    </div>
                </div>

                {/* Pipeline View elegante */}
                <div className="group border border-cyan-500/30 rounded-xl p-4 bg-gradient-to-br from-cyan-500/10 to-blue-500/5 hover:border-cyan-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/20 cursor-pointer">
                    <div className="flex items-center gap-2.5 mb-3">
                        <Zap className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold text-cyan-400">90-Day Pipeline</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold bg-gradient-to-br from-cyan-400 to-blue-400 bg-clip-text text-transparent">{data.shows90}</span>
                        <span className="text-xs opacity-60 font-medium">shows</span>
                        <span className="text-xs opacity-30 mx-2">·</span>
                        <span className="text-lg font-bold text-cyan-300">{fmtMoney(data.revenue90)}</span>
                        <span className="text-xs opacity-60 font-medium">projected</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TourOverviewPro;
