import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, DollarSign, Calendar, MapPin, Award } from 'lucide-react';
import { useShowsQuery } from '../../hooks/useShowsQuery';
import { useSettings } from '../../context/SettingsContext';
import { getCurrentOrgId } from '../../lib/tenants';
import { sanitizeName } from '../../lib/sanitize';

const STAGE_PROB: Record<string, number> = {
    confirmed: 1.0,
    pending: 0.6,
    offer: 0.3,
    canceled: 0,
    archived: 0
};

/**
 * Panel de Analytics/Insights básico para el Dashboard
 * Muestra trends de revenue, conversion rates, y top venues
 */
const AnalyticsPanel: React.FC = () => {
    const { data: allShowsData = [] } = useShowsQuery();
    const { fmtMoney } = useSettings();
    const orgId = getCurrentOrgId();

    const insights = useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        const allShows = (allShowsData as any[]).filter((s: any) => s.tenantId === orgId);
        const upcoming = allShows.filter((s: any) => new Date(s.date).getTime() >= now);

        // Revenue trends (30/60/90 days)
        const days30 = now + 30 * DAY;
        const days60 = now + 60 * DAY;
        const days90 = now + 90 * DAY;

        const revenue30 = upcoming
            .filter((s: any) => new Date(s.date).getTime() <= days30)
            .reduce((sum: number, s: any) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);

        const revenue60 = upcoming
            .filter((s: any) => new Date(s.date).getTime() <= days60)
            .reduce((sum: number, s: any) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);

        const revenue90 = upcoming
            .filter((s: any) => new Date(s.date).getTime() <= days90)
            .reduce((sum: number, s: any) => sum + s.fee * (STAGE_PROB[s.status] || 0), 0);

        // Conversion rate (offer → confirmed)
        const totalOffers = allShows.filter((s: any) => s.status === 'offer').length;
        const totalConfirmed = allShows.filter((s: any) => s.status === 'confirmed').length;
        const conversionRate = totalOffers > 0 ? (totalConfirmed / (totalConfirmed + totalOffers)) * 100 : 0;

        // Top venues (by total revenue)
        const venueRevenue = new Map<string, number>();
        allShows
            .filter((s: any) => s.status === 'confirmed')
            .forEach((s: any) => {
                const venue = s.venue || s.city;
                venueRevenue.set(venue, (venueRevenue.get(venue) || 0) + s.fee);
            });

        const topVenues = Array.from(venueRevenue.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([venue, revenue]) => ({ venue, revenue }));

        // Top countries (by show count)
        const countryCount = new Map<string, number>();
        upcoming.forEach((s: any) => {
            countryCount.set(s.country, (countryCount.get(s.country) || 0) + 1);
        });

        const topCountries = Array.from(countryCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 3)
            .map(([country, count]) => ({ country, count }));

        // Trend direction
        const trend30to60 = revenue60 - revenue30;
        const trendDirection = trend30to60 >= 0 ? 'up' : 'down';
        const trendPercentage = revenue30 > 0 ? Math.abs((trend30to60 / revenue30) * 100) : 0;

        return {
            revenue30,
            revenue60,
            revenue90,
            conversionRate,
            topVenues,
            topCountries,
            trendDirection,
            trendPercentage
        };
    }, [allShowsData, orgId]);

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 space-y-5">
                {/* Header */}
                <div>
                    <h2 className="text-base md:text-lg font-semibold tracking-tight">Revenue Insights</h2>
                    <p className="text-xs opacity-60 mt-1">Projected revenue & performance trends</p>
                </div>

                {/* Revenue Trend */}
                <div className="grid grid-cols-3 gap-3">
                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0 }}
                        className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-medium opacity-70">30 Days</span>
                        </div>
                        <div className="text-lg font-bold">{fmtMoney(insights.revenue30)}</div>
                    </motion.div>

                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                        className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-medium opacity-70">60 Days</span>
                        </div>
                        <div className="text-lg font-bold">{fmtMoney(insights.revenue60)}</div>
                    </motion.div>

                    <motion.div
                        initial={prefersReducedMotion ? false : { opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="p-4 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 transition-colors"
                    >
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            <span className="text-xs font-medium opacity-70">90 Days</span>
                        </div>
                        <div className="text-lg font-bold">{fmtMoney(insights.revenue90)}</div>
                    </motion.div>
                </div>

                {/* Trend & Conversion */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="p-4 rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                        <div className="flex items-center gap-2 mb-2">
                            {insights.trendDirection === 'up' ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                            <span className="text-xs font-medium opacity-70">Trend</span>
                        </div>
                        <div className={`text-xl font-bold ${insights.trendDirection === 'up' ? 'text-green-400' : 'text-red-400'}`}>
                            {insights.trendDirection === 'up' ? '+' : '-'}{insights.trendPercentage.toFixed(1)}%
                        </div>
                        <div className="text-[10px] opacity-50 mt-1">30d → 60d growth</div>
                    </div>

                    <div className="p-4 rounded-lg border border-white/10 bg-gradient-to-br from-white/5 to-transparent">
                        <div className="flex items-center gap-2 mb-2">
                            <Award className="w-4 h-4 text-amber-400" />
                            <span className="text-xs font-medium opacity-70">Win Rate</span>
                        </div>
                        <div className="text-xl font-bold text-amber-400">
                            {insights.conversionRate.toFixed(0)}%
                        </div>
                        <div className="text-[10px] opacity-50 mt-1">Offer → Confirmed</div>
                    </div>
                </div>

                {/* Top Venues */}
                {insights.topVenues.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold mb-3 opacity-80">Top Venues by Revenue</h3>
                        <div className="space-y-2">
                            {insights.topVenues.map((item, index) => (
                                <motion.div
                                    key={item.venue}
                                    initial={prefersReducedMotion ? false : { opacity: 0, x: -10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15 + index * 0.05 }}
                                    className="flex items-center justify-between p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <div className="w-6 h-6 rounded-full bg-accent-500/20 flex items-center justify-center text-xs font-bold text-accent-400">
                                            {index + 1}
                                        </div>
                                        <span className="text-sm font-medium truncate max-w-[150px]">{sanitizeName(item.venue)}</span>
                                    </div>
                                    <span className="text-sm font-bold text-accent-400">{fmtMoney(item.revenue)}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Top Countries */}
                {insights.topCountries.length > 0 && (
                    <div>
                        <h3 className="text-sm font-semibold mb-3 opacity-80">Top Markets</h3>
                        <div className="flex flex-wrap gap-2">
                            {insights.topCountries.map((item, index) => (
                                <motion.div
                                    key={item.country}
                                    initial={prefersReducedMotion ? false : { opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.25 + index * 0.05 }}
                                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 hover:from-blue-500/20 hover:to-purple-500/20 transition-all"
                                >
                                    <MapPin className="w-3.5 h-3.5 text-blue-400" />
                                    <span className="text-xs font-medium">{item.country}</span>
                                    <span className="text-xs font-bold text-blue-400">×{item.count}</span>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AnalyticsPanel;
