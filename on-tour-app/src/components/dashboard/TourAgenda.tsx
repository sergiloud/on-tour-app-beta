import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Clock, DollarSign, Zap, TrendingUp, MapIcon, AlertCircle, RefreshCw } from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Link } from 'react-router-dom';
import { useMissionControl } from '../../context/MissionControlContext';
import { prefetchByPath } from '../../routes/prefetch';
import { useTourStats } from '../../hooks/useTourStats';
import { sanitizeName } from '../../lib/sanitize';

const TourAgendaComponent: React.FC = () => {
    const { fmtMoney } = useSettings();
    const { setFocus } = useMissionControl();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Use custom hook for tour stats
    const data = useTourStats();

    // Memoize retry handler
    const handleRetry = React.useCallback(() => {
        setIsLoading(true);
        setError(null);
        // Force re-computation
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    // Memoize click handler for shows
    const handleShowClick = React.useCallback((show: any) => {
        setFocus({ id: show.id, lng: show.lng, lat: show.lat });
    }, [setFocus]);

    // Memoize center map handler
    const handleCenterMap = React.useCallback(() => {
        if (!data.nextShow) return;
        setFocus({ lng: data.nextShow.lng, lat: data.nextShow.lat });
    }, [data.nextShow, setFocus]);

    // Loading State
    if (isLoading) {
        return (
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
                <div className="p-5 space-y-4">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-accent-500/50 to-blue-500/50 rounded-full animate-pulse" />
                            <div>
                                <div className="h-5 w-32 bg-white/10 rounded animate-pulse" />
                                <div className="h-3 w-40 bg-white/5 rounded mt-1 animate-pulse" />
                            </div>
                        </div>
                        <div className="h-7 w-20 bg-white/10 rounded animate-pulse" />
                    </div>

                    {/* Stats skeleton */}
                    <div className="p-4 border border-white/10 rounded-xl bg-white/5">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="space-y-2">
                                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                                    <div className="h-7 w-16 bg-white/10 rounded animate-pulse" />
                                </div>
                                <div className="h-10 w-px bg-white/10" />
                                <div className="space-y-2">
                                    <div className="h-3 w-24 bg-white/10 rounded animate-pulse" />
                                    <div className="h-5 w-20 bg-white/10 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-7 w-24 bg-white/10 rounded animate-pulse" />
                                <div className="h-7 w-20 bg-white/10 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="flex gap-2">
                        <div className="flex-1 h-9 bg-white/10 rounded-lg animate-pulse" />
                        <div className="flex-1 h-9 bg-white/10 rounded-lg animate-pulse" />
                    </div>

                    {/* Agenda items skeleton */}
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border border-white/10 rounded-lg overflow-hidden">
                                <div className="px-4 py-2.5 bg-white/5 flex items-center justify-between">
                                    <div className="h-4 w-32 bg-white/10 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-white/10 rounded animate-pulse" />
                                </div>
                                <div className="p-3 space-y-2">
                                    <div className="h-4 w-full bg-white/10 rounded animate-pulse" />
                                    <div className="h-3 w-3/4 bg-white/5 rounded animate-pulse" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
                <div className="p-8 text-center">
                    <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
                    <h3 className="text-lg font-semibold mb-2">Failed to Load Tour Data</h3>
                    <p className="text-sm opacity-70 mb-6">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium transition-all duration-300 inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    // Empty State (no upcoming shows)
    if (data.shows30 === 0) {
        return (
            <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-500/20 to-blue-500/20 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-accent-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">No Upcoming Shows</h3>
                    <p className="text-sm opacity-70 mb-6">You don't have any shows scheduled in the next 30 days</p>
                    <Link
                        to="/dashboard/shows"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium transition-all duration-300"
                        onMouseEnter={() => prefetchByPath('/dashboard/shows')}
                    >
                        <Calendar className="w-4 h-4" />
                        Add Your First Show
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:shadow-lg hover:shadow-accent-500/5">
            {/* Live region for screen readers */}
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                Tour Agenda: {data.shows30} shows in next 30 days, {data.confirmed} confirmed, {data.pending} pending, {data.offers} offers
            </div>

            {/* Gradiente decorativo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 flex flex-col gap-4">
                {/* Header elegante */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">Tour Agenda</h2>
                            <p className="text-xs opacity-60 mt-0.5">Next 30 days overview</p>
                        </div>
                    </div>
                    <Link
                        to="/dashboard/shows"
                        className="text-xs px-3 py-1.5 rounded-lg bg-white/10 hover:bg-accent-500/20 border border-white/10 hover:border-accent-500/30 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                        onMouseEnter={() => prefetchByPath('/dashboard/shows')}
                        aria-label="View all shows"
                    >
                        View all →
                    </Link>
                </div>

                {/* Summary Stats - Compact row elegante */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group flex items-center justify-between p-4 border border-white/10 rounded-xl bg-gradient-to-r from-white/5 to-white/10 hover:border-accent-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-accent-500/10"
                >
                    <div className="flex items-center gap-6">
                        <div className="transition-transform duration-300 group-hover:scale-105">
                            <div className="text-xs opacity-60 mb-1 font-medium">Next 30 days</div>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-bold bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent">{data.shows30}</span>
                                <span className="text-xs opacity-60">shows</span>
                            </div>
                        </div>
                        <div className="h-10 w-px bg-gradient-to-b from-transparent via-white/20 to-transparent" />
                        <div className="transition-transform duration-300 group-hover:scale-105">
                            <div className="text-xs opacity-60 mb-1 font-medium">Projected</div>
                            <div className="text-lg font-bold bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent">{fmtMoney(data.revenue30)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                        <span className="px-3 py-1.5 rounded-lg bg-green-500/20 text-green-300 border border-green-500/30 font-semibold hover:bg-green-500/30 transition-all duration-300 cursor-default">{data.confirmed} confirmed</span>
                        {data.pending > 0 && <span className="px-3 py-1.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold hover:bg-amber-500/30 transition-all duration-300 cursor-default">{data.pending} pending</span>}
                        {data.offers > 0 && <span className="px-3 py-1.5 rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold hover:bg-amber-500/30 transition-all duration-300 cursor-default">{data.offers} offers</span>}
                    </div>
                </motion.div>

                {/* Quick actions - Touch-friendly (min 44px) */}
                <div className="flex gap-2">
                    <button
                        className="flex-1 px-3 py-3 md:py-2 min-h-[44px] md:min-h-0 rounded-lg bg-gradient-to-r from-accent-500/20 to-blue-500/20 hover:from-accent-500/30 hover:to-blue-500/30 border border-accent-500/30 hover:border-accent-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-2 font-medium text-xs hover:shadow-lg hover:shadow-accent-500/20 active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                        disabled={!data.nextShow}
                        onClick={handleCenterMap}
                        aria-label={data.nextShow ? `Center map on ${data.nextShow.city}` : 'No upcoming shows'}
                    >
                        <MapIcon className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        <span>Center Map</span>
                    </button>
                    <Link
                        to="/dashboard/shows"
                        className="flex-1 px-3 py-3 md:py-2 min-h-[44px] md:min-h-0 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 transition-all duration-300 flex items-center justify-center gap-2 font-medium text-xs hover:shadow-lg active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                        onMouseEnter={() => prefetchByPath('/dashboard/shows')}
                        aria-label="View all shows in calendar"
                    >
                        <Calendar className="w-4 h-4 md:w-3.5 md:h-3.5" />
                        <span>All Shows</span>
                    </Link>
                </div>

                {/* Upcoming agenda - Next 21 days */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {data.agenda.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-white/5 flex items-center justify-center">
                                <Clock className="w-7 h-7 opacity-50" />
                            </div>
                            <div className="text-sm font-medium mb-1">All Clear!</div>
                            <div className="text-xs opacity-60">No shows scheduled in the next 21 days</div>
                        </div>
                    ) : (
                        data.agenda.map((day, dayIndex) => (
                            <motion.div
                                key={day.day}
                                className="group border border-white/10 rounded-lg overflow-hidden hover:border-white/20 transition-colors"
                                initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: dayIndex * 0.05, duration: 0.3 }}
                            >
                                <div className="px-4 py-2.5 bg-gradient-to-r from-white/5 to-transparent flex items-center justify-between">
                                    <span className="font-semibold text-sm">
                                        {(() => {
                                            const date = new Date(day.day + 'T00:00:00');
                                            return isNaN(date.getTime())
                                                ? day.day
                                                : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                        })()}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-md bg-white/10 font-medium">{day.rel}</span>
                                </div>
                                <ul className="divide-y divide-white/5">
                                    {day.shows.map((show) => (
                                        <li
                                            key={show.id}
                                            className="p-3 hover:bg-white/5 transition-colors cursor-pointer focus-within:bg-white/5 focus-within:ring-2 focus-within:ring-inset focus-within:ring-accent-500/30"
                                            onClick={() => handleShowClick(show)}
                                            role="button"
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleShowClick(show); } }}
                                            aria-label={`Show in ${show.city} on ${new Date(show.date).toLocaleDateString()}, ${show.status}, ${fmtMoney(show.fee)}`}
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
                                                        <span className="font-semibold text-sm truncate">{sanitizeName(show.city)}</span>
                                                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${show.status === 'confirmed' ? 'bg-green-500/20 text-green-300' :
                                                            show.status === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                                                                'bg-blue-500/20 text-blue-300'
                                                            }`}>
                                                            {show.status}
                                                        </span>
                                                    </div>
                                                    {show.venue && show.venue !== 'TBA' && (
                                                        <div className="text-xs opacity-70 truncate">{sanitizeName(show.venue)}</div>
                                                    )}
                                                </div>
                                                <div className="text-right flex-shrink-0">
                                                    <div className="font-bold text-sm">{fmtMoney(show.fee)}</div>
                                                </div>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

// Memoized export para evitar re-renders innecesarios
export const TourAgenda = React.memo(TourAgendaComponent);

export default TourAgenda;
