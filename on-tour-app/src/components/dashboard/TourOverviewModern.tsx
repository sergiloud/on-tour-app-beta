import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Calendar, MapPin, TrendingUp, DollarSign, Clock, Users,
    ChevronLeft, ChevronRight, Sparkles, Zap, Target, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import { Card } from '../../ui/Card';
import { showStore } from '../../shared/showStore';
import { useSettings } from '../../context/SettingsContext';
import { getCurrentOrgId } from '../../lib/tenants';
import { Link } from 'react-router-dom';

interface TimelineEvent {
    date: string;
    type: 'show' | 'milestone' | 'gap';
    city?: string;
    status?: string;
    fee?: number;
    daysFromNow: number;
}

interface MetricCard {
    id: string;
    icon: any;
    label: string;
    value: string;
    subValue?: string;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    color: string;
    gradient: string;
}

const STAGE_PROB: Record<string, number> = {
    confirmed: 1.0,
    pending: 0.6,
    offer: 0.3,
    canceled: 0,
    archived: 0
};

const TourOverviewModern: React.FC = () => {
    const { fmtMoney } = useSettings();
    const [currentCardIndex, setCurrentCardIndex] = useState(0);
    const orgId = getCurrentOrgId();

    const data = useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        const allShows = showStore.getAll().filter((s: any) => !s.tenantId || s.tenantId === orgId);

        // Time windows
        const upcoming = allShows
            .filter(s => new Date(s.date).getTime() >= now)
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        const upcoming7 = upcoming.filter(s => new Date(s.date).getTime() <= now + 7 * DAY);
        const upcoming30 = upcoming.filter(s => new Date(s.date).getTime() <= now + 30 * DAY);
        const upcoming90 = upcoming.filter(s => new Date(s.date).getTime() <= now + 90 * DAY);

        const past30 = allShows.filter(s => {
            const t = new Date(s.date).getTime();
            return t >= now - 30 * DAY && t < now;
        });

        // Revenue calculations
        const revenue7 = upcoming7.reduce((sum, s) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);
        const revenue30 = upcoming30.reduce((sum, s) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);
        const revenue90 = upcoming90.reduce((sum, s) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);
        const confirmedRevenue30 = upcoming30.filter(s => s.status === 'confirmed').reduce((sum, s) => sum + s.fee, 0);
        const pastRevenue30 = past30.filter(s => s.status === 'confirmed').reduce((sum, s) => sum + s.fee, 0);

        const avgShowValue = upcoming30.length > 0 ? revenue30 / upcoming30.length : 0;
        const growth = pastRevenue30 > 0 ? ((revenue30 - pastRevenue30) / pastRevenue30) * 100 : 0;

        // Timeline - next 14 days with gaps
        const timeline: TimelineEvent[] = [];
        const next14 = upcoming.filter(s => new Date(s.date).getTime() <= now + 14 * DAY);

        next14.forEach((show, i) => {
            const daysFromNow = Math.ceil((new Date(show.date).getTime() - now) / DAY);
            timeline.push({
                date: show.date,
                type: 'show',
                city: show.city,
                status: show.status,
                fee: show.fee,
                daysFromNow
            });

            // Check for gaps > 3 days
            if (i < next14.length - 1) {
                const nextShow = next14[i + 1];
                if (nextShow) {
                    const gap = (new Date(nextShow.date).getTime() - new Date(show.date).getTime()) / DAY;
                    if (gap > 3) {
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
        const confirmed = upcoming30.filter(s => s.status === 'confirmed').length;
        const pending = upcoming30.filter(s => s.status === 'pending').length;
        const offers = upcoming30.filter(s => s.status === 'offer').length;

        // Hot metrics for cards
        const velocity = past30.length > 0 ? (upcoming30.length / past30.length - 1) * 100 : 0;
        const conversionRate = (confirmed + pending + offers) > 0 ? (confirmed / (confirmed + pending + offers)) * 100 : 0;

        return {
            next7: { shows: upcoming7.length, revenue: revenue7 },
            next30: { shows: upcoming30.length, revenue: revenue30, confirmed: confirmedRevenue30 },
            next90: { shows: upcoming90.length, revenue: revenue90 },
            avgValue: avgShowValue,
            growth,
            velocity,
            conversionRate,
            confirmed,
            pending,
            offers,
            timeline,
            nextShow: upcoming[0] || null
        };
    }, [orgId, fmtMoney]);

    // Metric cards carousel
    const metricCards: MetricCard[] = useMemo(() => [
        {
            id: 'revenue',
            icon: DollarSign,
            label: 'Next 30 Days',
            value: fmtMoney(data.next30.revenue),
            subValue: `${fmtMoney(data.next30.confirmed)} confirmed`,
            trend: data.growth >= 0 ? 'up' : 'down',
            trendValue: `${data.growth >= 0 ? '+' : ''}${data.growth.toFixed(0)}%`,
            color: 'text-green-400',
            gradient: 'from-green-500/20 to-emerald-600/10'
        },
        {
            id: 'shows',
            icon: Calendar,
            label: 'Upcoming Shows',
            value: `${data.next30.shows}`,
            subValue: `${data.confirmed} confirmed, ${data.pending} pending`,
            trend: data.velocity >= 0 ? 'up' : 'down',
            trendValue: `${data.velocity >= 0 ? '+' : ''}${data.velocity.toFixed(0)}%`,
            color: 'text-blue-400',
            gradient: 'from-blue-500/20 to-blue-600/10'
        },
        {
            id: 'avg',
            icon: TrendingUp,
            label: 'Avg Show Value',
            value: fmtMoney(data.avgValue),
            subValue: `across ${data.next30.shows} shows`,
            trend: 'neutral',
            color: 'text-purple-400',
            gradient: 'from-purple-500/20 to-purple-600/10'
        },
        {
            id: 'conversion',
            icon: Target,
            label: 'Booking Rate',
            value: `${data.conversionRate.toFixed(0)}%`,
            subValue: `${data.confirmed} of ${data.confirmed + data.pending + data.offers} locked`,
            trend: data.conversionRate >= 70 ? 'up' : data.conversionRate >= 50 ? 'neutral' : 'down',
            color: 'text-amber-400',
            gradient: 'from-amber-500/20 to-amber-600/10'
        },
        {
            id: 'pipeline',
            icon: Zap,
            label: 'Pipeline',
            value: `${data.next90.shows}`,
            subValue: `shows in next 90 days`,
            trend: 'neutral',
            color: 'text-cyan-400',
            gradient: 'from-cyan-500/20 to-cyan-600/10'
        }
    ], [data, fmtMoney]);

    const nextCard = useCallback(() => {
        setCurrentCardIndex((prev) => (prev + 1) % metricCards.length);
    }, [metricCards.length]);

    const prevCard = useCallback(() => {
        setCurrentCardIndex((prev) => (prev - 1 + metricCards.length) % metricCards.length);
    }, [metricCards.length]);

    const currentCard = metricCards[currentCardIndex];
    if (!currentCard) return null;
    const Icon = currentCard.icon;

    return (
        <Card className="p-0 overflow-hidden">
            {/* Header */}
            <header className="px-4 pt-4 pb-3 bg-gradient-to-r from-slate-900/50 to-slate-800/30 border-b border-white/5">
                <div className="flex items-center justify-between">
                    <div>
                        <h3 className="text-base font-semibold tracking-tight flex items-center gap-2">
                            <Sparkles className="w-4 h-4 text-accent-500" />
                            Tour Overview
                        </h3>
                        <p className="text-xs opacity-60 mt-0.5">Real-time tour metrics & timeline</p>
                    </div>
                    <Link
                        to="/dashboard/shows"
                        className="text-xs px-2.5 py-1 rounded-lg glass hover:bg-slate-300 dark:bg-white/15 transition-all"
                    >
                        View all
                    </Link>
                </div>
            </header>

            <div className="p-4 space-y-4">
                {/* Metric Card Carousel */}
                <div className="relative">
                    {/* Navigation buttons */}
                    <div className="absolute -left-2 top-1/2 -translate-y-1/2 z-10">
                        <button
                            onClick={prevCard}
                            className="w-8 h-8 rounded-full glass hover:bg-white/20 flex items-center justify-center transition-all"
                            aria-label="Previous metric"
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                        <button
                            onClick={nextCard}
                            className="w-8 h-8 rounded-full glass hover:bg-white/20 flex items-center justify-center transition-all"
                            aria-label="Next metric"
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Card display */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentCard.id}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            transition={{ duration: 0.3 }}
                            className={`glass rounded-xl p-6 border bg-gradient-to-br ${currentCard.gradient} border-slate-200 dark:border-white/10 relative overflow-hidden`}
                        >
                            {/* Decorative glow */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-slate-100 dark:from-white/5 to-transparent rounded-full blur-3xl" />

                            <div className="relative z-10">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-12 h-12 rounded-xl glass flex items-center justify-center ${currentCard.color}`}>
                                            <Icon className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <div className="text-xs opacity-70 mb-1">{currentCard.label}</div>
                                            <div className="text-3xl font-black">{currentCard.value}</div>
                                        </div>
                                    </div>
                                    {currentCard.trend && currentCard.trendValue && (
                                        <div className={`flex items-center gap-1 px-2 py-1 rounded-lg glass ${currentCard.trend === 'up' ? 'text-green-400' :
                                            currentCard.trend === 'down' ? 'text-red-400' :
                                                'text-gray-400'
                                            }`}>
                                            {currentCard.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> :
                                                currentCard.trend === 'down' ? <ArrowDownRight className="w-3 h-3" /> : null}
                                            <span className="text-xs font-bold">{currentCard.trendValue}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-xs opacity-60">{currentCard.subValue}</div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Carousel dots */}
                    <div className="flex justify-center gap-1.5 mt-3">
                        {metricCards.map((card, index) => (
                            <button
                                key={card.id}
                                onClick={() => setCurrentCardIndex(index)}
                                className={`h-1.5 rounded-full transition-all ${index === currentCardIndex
                                    ? 'w-6 bg-accent-500'
                                    : 'w-1.5 bg-white/20 hover:bg-white/30'
                                    }`}
                                aria-label={`Go to ${card.label}`}
                            />
                        ))}
                    </div>
                </div>

                {/* Next Show Highlight */}
                {data.nextShow && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass rounded-lg p-3 border border-accent-500/20 bg-accent-500/5"
                    >
                        <div className="flex items-center justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <Clock className="w-3 h-3 text-accent-500" />
                                    <span className="text-xs font-medium text-accent-400">Next Show</span>
                                </div>
                                <div className="font-semibold truncate">{data.nextShow.city}</div>
                                <div className="text-xs opacity-70">
                                    {new Date(data.nextShow.date).toLocaleDateString('en-US', {
                                        weekday: 'short', month: 'short', day: 'numeric'
                                    })}
                                </div>
                            </div>
                            <div className="text-right">
                                <div className="text-lg font-bold text-accent-400">{fmtMoney(data.nextShow.fee)}</div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-md ${data.nextShow.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                                    data.nextShow.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                                        'bg-blue-500/20 text-blue-300'
                                    }`}>
                                    {data.nextShow.status}
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Timeline - Next 14 days */}
                <div>
                    <div className="text-xs font-medium mb-2 opacity-70 flex items-center gap-2">
                        <Calendar className="w-3 h-3" />
                        Next 14 Days Timeline
                    </div>
                    <div className="space-y-2">
                        {data.timeline.length === 0 ? (
                            <div className="glass rounded-lg p-4 text-center text-xs opacity-60">
                                No shows scheduled in next 14 days
                            </div>
                        ) : (
                            data.timeline.slice(0, 5).map((event, i) => (
                                <motion.div
                                    key={`${event.type}-${i}`}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: i * 0.05 }}
                                    className={`glass rounded-lg p-2.5 ${event.type === 'gap'
                                        ? 'border border-amber-500/20 bg-amber-500/5'
                                        : 'border border-white/5'
                                        }`}
                                >
                                    {event.type === 'show' ? (
                                        <div className="flex items-center justify-between gap-2">
                                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${event.status === 'confirmed' ? 'bg-green-500' :
                                                    event.status === 'pending' ? 'bg-amber-500' :
                                                        'bg-blue-500'
                                                    }`} />
                                                <div className="flex-1 min-w-0">
                                                    <div className="text-sm font-medium truncate">{event.city}</div>
                                                    <div className="text-[10px] opacity-60">
                                                        {event.daysFromNow === 0 ? 'Today' :
                                                            event.daysFromNow === 1 ? 'Tomorrow' :
                                                                `in ${event.daysFromNow} days`}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-xs font-bold whitespace-nowrap">
                                                {event.fee ? fmtMoney(event.fee) : '—'}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-2 text-xs text-amber-400">
                                            <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                                            <span className="opacity-70">Schedule gap</span>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                        {data.timeline.length > 5 && (
                            <Link
                                to="/dashboard/shows"
                                className="block text-center text-xs text-accent-400 hover:text-accent-300 transition-colors py-2"
                            >
                                + {data.timeline.length - 5} more shows
                            </Link>
                        )}
                    </div>
                </div>

                {/* Quick Stats Row */}
                <div className="grid grid-cols-3 gap-2">
                    <div className="glass rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-green-400">{data.next7.shows}</div>
                        <div className="text-[10px] opacity-60">Next 7 Days</div>
                    </div>
                    <div className="glass rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-blue-400">{data.pending}</div>
                        <div className="text-[10px] opacity-60">Pending</div>
                    </div>
                    <div className="glass rounded-lg p-2 text-center">
                        <div className="text-lg font-bold text-purple-400">{data.offers}</div>
                        <div className="text-[10px] opacity-60">Offers</div>
                    </div>
                </div>
            </div>
        </Card>
    );
};

export default React.memo(TourOverviewModern);
