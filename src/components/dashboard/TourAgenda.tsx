import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  MapPin,
  Clock,
  DollarSign,
  Zap,
  TrendingUp,
  MapIcon,
  AlertCircle,
  RefreshCw,
  Plane,
  Users,
  Music,
  Tag
} from 'lucide-react';
import { useSettings } from '../../context/SettingsContext';
import { Link } from 'react-router-dom';
import { useMissionControl } from '../../context/MissionControlContext';
import { useDashboardFilters } from '../../context/DashboardContext';
import { prefetchByPath } from '../../routes/prefetch';
import { useTourStats } from '../../hooks/useTourStats';
import { useShows } from '../../hooks/useShows';
import { useCalendarData } from '../../hooks/useCalendarData';
import { isValidLocation, Itinerary } from '../../services/travelApi';
import { logger } from '../../lib/logger';
import { sanitizeName } from '../../lib/sanitize';
import { Show } from '../../lib/shows';
import { usePerfMonitor } from '../../lib/perfMonitor';
import { t } from '../../lib/i18n';
import EventDetailDrawer from './EventDetailDrawer';

// Tipo unificado para eventos en la agenda
type AgendaEvent = {
  id: string;
  type: 'show' | 'travel' | 'meeting' | 'rehearsal' | 'break' | 'other';
  date: string;
  endDate?: string;
  title: string;
  city?: string;
  venue?: string;
  status?: string;
  fee?: number;
  lng?: number;
  lat?: number;
  color?: string;
  location?: string;
  description?: string;
  origin?: string;
  destination?: string;
  time?: string;
  timeEnd?: string;
  btnType?: string;
  rawData?: Show | Itinerary | any; // Datos originales para los modales
};

const TourAgendaComponent: React.FC = () => {
    // Performance monitoring
    usePerfMonitor('TourAgenda:render');
    
    const { fmtMoney, lang } = useSettings();
    const { setFocus } = useMissionControl();
    const { filters, setDateRange } = useDashboardFilters();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedEvent, setSelectedEvent] = useState<AgendaEvent | null>(null);
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);

    // Derive showAll from dashboard filters
    const showAll = filters.dateRange === 'all';

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Use custom hook for tour stats
    const data = useTourStats();
    const { shows: allShows } = useShows();
    
    // Get calendar data (includes travel and calendar events)
    const {
        travel,
        travelOperations,
    } = useCalendarData({
        debouncedCursor: new Date().toISOString().slice(0, 7), // Current month
        filters: { 
            kinds: { shows: true, travel: true }, 
            status: { confirmed: true, pending: true, offer: true } 
        },
        lang,
        tz: 'UTC',
        toDateOnlyTz: (iso: string, _tz: string) => iso.slice(0, 10),
    });

    // Build full agenda when showAll is true
    // Step 1: Filter and sort future shows
    const futureShows = React.useMemo(() => {
        if (!showAll) return [];
        const now = Date.now();
        return allShows
            .filter(s => {
                if (!s.date) return false;
                const showDate = new Date(s.date).getTime();
                return !isNaN(showDate) && showDate >= now;
            })
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [showAll, allShows]);

    // Step 2: Enrich shows with metadata (btnType, color)
    const enrichedShows = React.useMemo(() => {
        return futureShows.map(show => {
            // Extract metadata from notes
            let btnType = 'show';
            let color: string | undefined;

            if (show.notes?.includes('__btnType:')) {
                const match = show.notes.match(/__btnType:(\w+)/);
                if (match?.[1]) btnType = match[1];
            }

            if (show.notes?.includes('__dispColor:')) {
                const colorMatch = show.notes.match(/__dispColor:(\w+)/);
                if (colorMatch?.[1] && ['green', 'blue', 'yellow', 'red', 'purple'].includes(colorMatch[1])) {
                    color = colorMatch[1];
                }
            }

            if (!color && (!btnType || btnType === 'show')) {
                color = 'green';
            }

            return {
                id: show.id,
                name: (show as any).name,
                city: show.city,
                venue: show.venue || t('tourAgenda.tba'),
                status: show.status,
                fee: show.fee,
                date: show.date,
                endDate: (show as any).endDate,
                lng: show.lng,
                lat: show.lat,
                btnType,
                color
            };
        });
    }, [futureShows]);

    // Step 2.5: Convert to unified AgendaEvent format and merge with travel
    const allUnifiedEvents = React.useMemo((): AgendaEvent[] => {
        if (!showAll) return [];
        
        const now = Date.now();
        const events: AgendaEvent[] = [];

        // Add enriched shows
        enrichedShows.forEach(show => {
            events.push({
                id: `show:${show.id}`,
                type: 'show',
                date: show.date,
                endDate: show.endDate,
                title: show.name || show.city,
                city: show.city,
                venue: show.venue,
                status: show.status,
                fee: show.fee,
                lng: show.lng,
                lat: show.lat,
                color: show.color,
                btnType: show.btnType,
                rawData: allShows.find(s => s.id === show.id),
            });
        });

        // Add travel events
        travel.forEach(item => {
            const itemDate = new Date(item.date).getTime();
            if (!isNaN(itemDate) && itemDate >= now) {
                // Determine event type from btnType
                const btnType = (item as any).btnType || 'travel';
                let eventType: AgendaEvent['type'] = 'travel';
                
                if (['meeting', 'rehearsal', 'break', 'other'].includes(btnType)) {
                    eventType = btnType as AgendaEvent['type'];
                }

                events.push({
                    id: `${eventType}:${item.id}`,
                    type: eventType,
                    date: item.date,
                    endDate: (item as any).endDate,
                    title: item.title || `${(item as any).departure || ''} → ${item.city || item.destination || ''}`.trim(),
                    city: item.city || item.destination,
                    location: (item as any).location,
                    description: (item as any).description,
                    origin: (item as any).departure,
                    destination: item.city || item.destination,
                    time: (item as any).startTime,
                    color: (item as any).buttonColor || ((item as any).btnType === 'travel' ? 'blue' : 'purple'),
                    btnType,
                    rawData: item,
                });
            }
        });

        // Sort all events by date
        return events.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [showAll, enrichedShows, travel, allShows]);

    // Step 3: Group events by day with relative labels
    const fullAgenda = React.useMemo(() => {
        if (!showAll) return data.agenda;
        
        const now = Date.now();
        const dayMap = new Map<string, any>();

        allUnifiedEvents.forEach(event => {
            const d = new Date(event.date);
            const dayKey = d.toISOString().split('T')[0];
            
            if (!dayKey) return; // Skip if date formatting fails

            if (!dayMap.has(dayKey)) {
                const daysAway = Math.ceil((d.getTime() - now) / (24 * 60 * 60 * 1000));
                let rel = '';
                if (daysAway === 0) rel = t('tourAgenda.today');
                else if (daysAway === 1) rel = t('tourAgenda.tomorrow');
                else if (daysAway <= 7) rel = t('tourAgenda.thisWeek');
                else if (daysAway <= 14) rel = t('tourAgenda.nextWeek');
                else if (daysAway <= 30) rel = t('tourAgenda.thisMonth');
                else if (daysAway <= 60) rel = t('tourAgenda.nextMonth');
                else rel = t('tourAgenda.later');

                dayMap.set(dayKey, { day: dayKey, rel, shows: [] });
            }

            dayMap.get(dayKey)!.shows.push(event);
        });

        return Array.from(dayMap.values()).sort((a, b) => a.day.localeCompare(b.day));
    }, [showAll, data.agenda, allUnifiedEvents]);

    // Memoize retry handler
    const handleRetry = React.useCallback(() => {
        setIsLoading(true);
        setError(null);
        // Force re-computation
        setTimeout(() => setIsLoading(false), 500);
    }, []);

    // Memoize unified event click handler - Open drawer
    const handleEventClick = React.useCallback((event: AgendaEvent) => {
        logger.info('[TourAgenda] Event clicked, opening drawer', { eventId: event.id, type: event.type, city: event.city });
        setSelectedEvent(event);
        setIsDrawerOpen(true);
    }, []);

    // Memoize center map handler
    const handleCenterMap = React.useCallback(() => {
        if (!data.nextShow) return;
        setFocus({ lng: data.nextShow.lng, lat: data.nextShow.lat });
    }, [data.nextShow, setFocus]);

    // Toggle show all handler
    const handleToggleShowAll = React.useCallback(() => {
        setDateRange(showAll ? '30' : 'all');
    }, [showAll, setDateRange]);

    // Loading State
    if (isLoading) {
        return (
            <div className="relative overflow-hidden rounded-xl border border-theme bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
                <div className="p-5 space-y-4">
                    {/* Header skeleton */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-1 h-6 bg-gradient-to-b from-accent-500/50 to-blue-500/50 rounded-full animate-pulse" />
                            <div>
                                <div className="h-5 w-32 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                <div className="h-3 w-40 bg-interactive rounded mt-1 animate-pulse" />
                            </div>
                        </div>
                        <div className="h-7 w-20 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                    </div>

                    {/* Stats skeleton */}
                    <div className="p-4 border border-theme rounded-xl bg-interactive">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-6">
                                <div className="space-y-2">
                                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                    <div className="h-7 w-16 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                </div>
                                <div className="h-10 w-px bg-slate-200 dark:bg-white/10" />
                                <div className="space-y-2">
                                    <div className="h-3 w-24 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                    <div className="h-5 w-20 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <div className="h-7 w-24 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                <div className="h-7 w-20 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                            </div>
                        </div>
                    </div>

                    {/* Action buttons skeleton */}
                    <div className="flex gap-2">
                        <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                        <div className="flex-1 h-9 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-lg animate-pulse" />
                    </div>

                    {/* Agenda items skeleton */}
                    <div className="space-y-3">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border border-theme rounded-lg overflow-hidden">
                                <div className="px-4 py-2.5 bg-interactive flex items-center justify-between">
                                    <div className="h-4 w-32 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                    <div className="h-4 w-16 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                </div>
                                <div className="p-3 space-y-2">
                                    <div className="h-4 w-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                                    <div className="h-3 w-3/4 bg-interactive rounded animate-pulse" />
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
                    <h3 className="text-lg font-semibold mb-2">{t('tourAgenda.error.loadFailed')}</h3>
                    <p className="text-sm opacity-70 mb-6">{error}</p>
                    <button
                        onClick={handleRetry}
                        className="px-4 py-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium transition-all duration-300 inline-flex items-center gap-2"
                    >
                        <RefreshCw className="w-4 h-4" />
                        {t('tourAgenda.retry')}
                    </button>
                </div>
            </div>
        );
    }

    // Empty State (no upcoming shows)
    if (data.shows30 === 0) {
        return (
            <div className="relative overflow-hidden rounded-xl border border-theme bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
                <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-transparent pointer-events-none" />
                <div className="relative p-8 text-center">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent-500/20 to-blue-500/20 flex items-center justify-center">
                        <Calendar className="w-8 h-8 text-accent-400" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{t('tourAgenda.empty.title')}</h3>
                    <p className="text-sm opacity-70 mb-6">{t('tourAgenda.empty.subtitle')}</p>
                    <Link
                        to="/dashboard/shows"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium transition-all duration-300"
                        onMouseEnter={() => prefetchByPath('/dashboard/shows')}
                    >
                        <Calendar className="w-4 h-4" />
                        {t('tourAgenda.empty.cta')}
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="relative overflow-hidden rounded-xl border border-theme bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:border-slate-300 dark:border-white/20 hover:shadow-lg hover:shadow-accent-500/5">
            {/* Live region for screen readers */}
            <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {t('tourAgenda.screenReader.summary', { shows30: data.shows30, confirmed: data.confirmed, pending: data.pending, offers: data.offers }).replace('{shows30}', String(data.shows30)).replace('{confirmed}', String(data.confirmed)).replace('{pending}', String(data.pending)).replace('{offers}', String(data.offers))}
            </div>

            {/* Gradiente decorativo sutil */}
            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/5 via-transparent to-transparent pointer-events-none" />

            <div className="relative p-5 flex flex-col gap-4">
                {/* Header elegante */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                        <div>
                            <h2 className="text-lg font-semibold tracking-tight">{t('tourAgenda.title')}</h2>
                            <p className="text-xs opacity-60 mt-0.5">{showAll ? t('tourAgenda.allUpcoming') : t('tourAgenda.next21')}</p>
                        </div>
                    </div>
                    <button
                        onClick={handleToggleShowAll}
                        className="text-xs px-3 py-1.5 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-accent-500/20 border border-theme hover:border-accent-500/30 transition-all duration-300 font-medium focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                        aria-label={showAll ? t('tourAgenda.showNext21') : t('tourAgenda.viewAll')}
                    >
                        {showAll ? t('tourAgenda.button.next21Days') : t('tourAgenda.button.allShows')} {showAll ? '←' : '→'}
                    </button>
                </div>

                {/* Summary Stats - Ultra compact */}
                <div className="group flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 border border-theme rounded-lg bg-gradient-to-r from-slate-100 dark:from-white/5 to-white/10 hover:border-accent-500/30 transition-fast">
                    <div className="flex items-center gap-4">
                        <div className="transition-transform-fast group-hover:scale-105">
                            <div className="text-[10px] opacity-60 mb-0.5 font-medium uppercase tracking-wide">{t('tourAgenda.next30Days')}</div>
                            <div className="flex items-baseline gap-1.5">
                                <span className="text-xl font-bold bg-gradient-to-br from-white to-white/80 bg-clip-text text-transparent">{data.shows30}</span>
                                <span className="text-[10px] opacity-60">{t('tourAgenda.shows')}</span>
                            </div>
                        </div>
                        <div className="h-8 w-px bg-gradient-to-b from-transparent via-slate-300 dark:via-white/20 to-transparent" />
                        <div className="transition-transform-fast group-hover:scale-105">
                            <div className="text-[10px] opacity-60 mb-0.5 font-medium uppercase tracking-wide">{t('tourAgenda.projected')}</div>
                            <div className="text-base font-bold bg-gradient-to-br from-green-400 to-emerald-500 bg-clip-text text-transparent">{fmtMoney(data.revenue30)}</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] flex-wrap">
                        <span className="px-2 py-1 rounded bg-green-500/20 text-green-300 border border-green-500/30 font-semibold">{data.confirmed} {t('tourAgenda.confirmed')}</span>
                        {data.pending > 0 && <span className="px-2 py-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 font-semibold">{data.pending} {t('tourAgenda.pending')}</span>}
                        {data.offers > 0 && <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 font-semibold">{data.offers} {t('tourAgenda.offers')}</span>}
                    </div>
                </div>

                {/* Quick actions - Compact */}
                <div className="flex gap-2">
                    <button
                        className="flex-1 px-2.5 py-2 rounded-lg bg-gradient-to-r from-accent-500/20 to-blue-500/20 hover:from-accent-500/30 hover:to-blue-500/30 border border-accent-500/30 hover:border-accent-500/50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-1.5 font-medium text-[11px] active:scale-95 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
                        disabled={!data.nextShow}
                        onClick={handleCenterMap}
                        aria-label={data.nextShow ? `${t('tourAgenda.centerMapOn')} ${data.nextShow.city}` : t('tourAgenda.noUpcomingShows')}
                    >
                        <MapIcon className="w-3.5 h-3.5" />
                        <span>{t('tourAgenda.centerMap')}</span>
                    </button>
                    <button
                        onClick={handleToggleShowAll}
                        className="flex-1 px-2.5 py-2 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 border border-theme hover:border-slate-300 dark:border-white/20 transition-all duration-200 flex items-center justify-center gap-1.5 font-medium text-[11px] active:scale-95 focus:outline-none focus:ring-2 focus:ring-white/50"
                        aria-label={showAll ? t('tourAgenda.showNext21') : t('tourAgenda.viewAll')}
                    >
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{showAll ? t('tourAgenda.button.next21Days') : t('tourAgenda.button.allShows')}</span>
                    </button>
                </div>

                {/* Upcoming agenda */}
                <div className="space-y-3 max-h-96 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
                    {fullAgenda.length === 0 ? (
                        <div className="text-center py-12 px-4">
                            <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-interactive flex items-center justify-center">
                                <Clock className="w-7 h-7 opacity-50" />
                            </div>
                            <div className="text-sm font-medium mb-1">{t('tourAgenda.allClear')}</div>
                            <div className="text-xs opacity-60">{t('tourAgenda.noShowsScheduled')}{showAll ? '' : ` ${t('tourAgenda.inNext21Days')}`}</div>
                        </div>
                    ) : (
                        fullAgenda.map((day, dayIndex) => (
                            <div
                                key={day.day}
                                className="group border border-theme rounded-lg overflow-hidden hover:border-slate-300 dark:border-white/20 transition-colors-fast"
                            >
                                <div className="px-3 py-2 bg-gradient-to-r from-slate-100 dark:from-white/5 to-transparent flex items-center justify-between">
                                    <span className="font-semibold text-xs">
                                        {(() => {
                                            const date = new Date(day.day + 'T00:00:00');
                                            return isNaN(date.getTime())
                                                ? day.day
                                                : date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
                                        })()}
                                    </span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 font-medium">{day.rel}</span>
                                </div>
                                <ul className="divide-y divide-slate-200 dark:divide-white/5">
                                    {day.shows
                                        .filter((event: AgendaEvent) => {
                                            const isMultiDay = event.endDate && event.endDate !== event.date;
                                            if (isMultiDay) {
                                                const eventStartDate = event.date;
                                                return eventStartDate.split('T')[0] === day.day;
                                            }
                                            return true;
                                        })
                                        .map((event: AgendaEvent) => {
                                            // Determine icon for event type
                                            const EventIcon = 
                                                event.type === 'show' ? Music :
                                                event.type === 'travel' ? Plane :
                                                event.type === 'meeting' ? Users :
                                                event.type === 'rehearsal' ? Music :
                                                event.type === 'break' ? Clock :
                                                Tag;

                                            return (
                                                <li
                                                    key={event.id}
                                                    className={`p-2 hover:bg-white/8 transition-all duration-200 cursor-pointer group/item border-l-2 ${
                                                        event.color === 'green'
                                                            ? 'border-l-green-500/40 hover:bg-green-500/5'
                                                            : event.color === 'blue'
                                                            ? 'border-l-blue-500/40 hover:bg-blue-500/5'
                                                            : event.color === 'yellow'
                                                            ? 'border-l-yellow-500/40 hover:bg-yellow-500/5'
                                                            : event.color === 'red'
                                                            ? 'border-l-red-500/40 hover:bg-red-500/5'
                                                            : event.color === 'purple'
                                                            ? 'border-l-purple-500/40 hover:bg-purple-500/5'
                                                            : 'border-l-accent-500/40 hover:bg-accent-500/5'
                                                    }`}
                                                    onClick={() => handleEventClick(event)}
                                                    role="button"
                                                    tabIndex={0}
                                                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleEventClick(event); } }}
                                                    aria-label={`${event.type} in ${event.city} on ${new Date(event.date).toLocaleDateString()}`}
                                                >
                                                    <div className="flex items-center justify-between gap-2">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-1.5 mb-0.5">
                                                                <EventIcon className="w-3 h-3 flex-shrink-0 opacity-70" />
                                                                <span className={`font-semibold truncate ${
                                                                    event.type === 'show'
                                                                        ? 'text-sm'
                                                                        : 'text-xs'
                                                                }`}>
                                                                    {event.type === 'show'
                                                                        ? sanitizeName(event.title)
                                                                        : sanitizeName(event.title || (event.type ? event.type.charAt(0).toUpperCase() + event.type.slice(1) : 'Event'))
                                                                    }
                                                                </span>
                                                                {event.type === 'show' && event.status && (
                                                                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0 uppercase tracking-wide ${
                                                                        event.status === 'confirmed'
                                                                            ? 'bg-green-500/25 text-green-300'
                                                                            : event.status === 'pending'
                                                                            ? 'bg-amber-500/25 text-amber-300'
                                                                            : 'bg-blue-500/25 text-blue-300'
                                                                    }`}>
                                                                        {event.status}
                                                                    </span>
                                                                )}
                                                            </div>

                                                            <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-white/60">
                                                                {event.city && event.city.trim() && (
                                                                    <div className="flex items-center gap-1 truncate">
                                                                        <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                                                                        <span className="truncate">{sanitizeName(event.city)}</span>
                                                                    </div>
                                                                )}
                                                                {event.type === 'show' && event.venue && event.venue !== t('tourAgenda.tba') && (
                                                                    <>
                                                                        <span className="text-slate-300 dark:text-white/30">•</span>
                                                                        <span className="truncate">{sanitizeName(event.venue)}</span>
                                                                    </>
                                                                )}
                                                                {event.type === 'travel' && event.origin && event.destination && (
                                                                    <span className="truncate text-[10px]">{sanitizeName(event.origin)} → {sanitizeName(event.destination)}</span>
                                                                )}
                                                                {['meeting', 'rehearsal', 'break', 'other'].includes(event.type) && event.location && (
                                                                    <>
                                                                        <span className="text-slate-300 dark:text-white/30">•</span>
                                                                        <span className="truncate">{sanitizeName(event.location)}</span>
                                                                    </>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {event.type === 'show' && event.fee && event.fee > 0 && (
                                                            <div className="text-[11px] font-semibold text-green-400 flex-shrink-0">
                                                                {fmtMoney(event.fee)}
                                                            </div>
                                                        )}
                                                    </div>
                                                </li>
                                            );
                                        })}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Event Detail Drawer */}
            <EventDetailDrawer
                isOpen={isDrawerOpen}
                onClose={() => {
                    setIsDrawerOpen(false);
                    setSelectedEvent(null);
                }}
                event={selectedEvent ? {
                    id: selectedEvent.id,
                    type: selectedEvent.type,
                    title: selectedEvent.title,
                    date: selectedEvent.date,
                    endDate: selectedEvent.endDate,
                    city: selectedEvent.city,
                    venue: selectedEvent.venue,
                    status: selectedEvent.status as 'confirmed' | 'pending' | 'offer' | undefined,
                    fee: selectedEvent.fee,
                    origin: selectedEvent.origin,
                    destination: selectedEvent.destination,
                    time: selectedEvent.time,
                    location: selectedEvent.location,
                    description: selectedEvent.description,
                    color: selectedEvent.color,
                } : null}
            />
        </div>
    );
};

// Memoized export para evitar re-renders innecesarios
export const TourAgenda = React.memo(TourAgendaComponent);

export default TourAgenda;
