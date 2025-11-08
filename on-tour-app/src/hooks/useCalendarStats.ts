import { useMemo } from 'react';
import { useShows } from './useShows';
import { getCurrentOrgId } from '../lib/tenants';
import { useDashboardFilters } from '../context/DashboardContext';
import { fetchItinerariesGentle, Itinerary, onItinerariesUpdated } from '../services/travelApi';
import { useEffect, useState, useRef } from 'react';

interface AgendaDay {
    day: string;
    rel: string;
    shows: Array<{
        id: string;
        city: string;
        venue: string;
        status: string;
        fee: number;
        date: string;
        lng: number;
        lat: number;
        kind?: 'show' | 'travel';
        btnType?: string; // Button type for distinguishing event categories
        // Travel-specific fields
        departure?: string;
        destination?: string;
        startTime?: string;
        endDate?: string; // End date for multi-day events
    }>;
}

interface CalendarStats {
    shows30: number;
    revenue30: number;
    confirmed: number;
    pending: number;
    offers: number;
    nextShow: {
        city: string;
        date: string;
        venue: string;
        daysUntil: number;
        lng: number;
        lat: number;
    } | null;
    agenda: AgendaDay[];
    hasGaps: boolean;
}

const STAGE_PROB: Record<string, number> = {
    confirmed: 1.0,
    pending: 0.6,
    offer: 0.3,
    canceled: 0,
    archived: 0
};

/**
 * Hook que lee directamente del calendario como fuente de verdad
 * Usa useShows (mismo que Calendar.tsx) para sincronización en tiempo real
 */
export const useCalendarStats = (): CalendarStats => {
    const { shows } = useShows();
    const orgId = getCurrentOrgId();
    const { filters } = useDashboardFilters();
    const [travel, setTravel] = useState<Itinerary[]>([]);
    const unsub_ref = useRef<() => void>(null as any);

    // Fetch travel data and subscribe to updates (only once, truly)
    useEffect(() => {
        // Skip if already subscribed
        if (unsub_ref.current !== null && typeof unsub_ref.current === 'function') {
            return;
        }

        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        const from = new Date(now).toISOString().slice(0, 10);
        const to = new Date(now + 365 * DAY).toISOString().slice(0, 10);

        fetchItinerariesGentle({ from, to })
            .then(res => {
                const data = res?.data || res || [];
                setTravel(data);
            })
            .catch((err) => {
                // Handle fetch error silently
            });

        // Subscribe to itinerary updates so we re-render when travel events change
        const unsub = onItinerariesUpdated((e) => {
            // Filter by date range - include events that START within range or that span across range
            const filtered = (e.data || []).filter(it => {
                if (!it.date) return false;
                const itDate = new Date(it.date).getTime();
                const itEndDate = it.endDate ? new Date(it.endDate).getTime() : itDate;
                // Include if: start is within range OR end is within range OR it spans across range
                const rangeStart = now;
                const rangeEnd = now + 365 * DAY;
                return (itDate >= rangeStart && itDate <= rangeEnd) ||
                       (itEndDate >= rangeStart && itEndDate <= rangeEnd) ||
                       (itDate <= rangeStart && itEndDate >= rangeEnd);
            });
            setTravel(filtered);
        });

        unsub_ref.current = unsub;

        return () => {
            if (unsub_ref.current) {
                unsub_ref.current();
                unsub_ref.current = null as any;
            }
        };
    }, []);    return useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        // Get date range from filters
        const dateRangeDays = filters.dateRange === 'all' ? 365 : parseInt(filters.dateRange);
        const maxDate = now + dateRangeDays * DAY;
        const days21 = now + 21 * DAY;

        // Collect all events (shows + travel)
        const allEvents: Array<{
            id: string;
            date: string;
            kind: 'show' | 'travel';
            btnType?: string; // Button type for distinguishing event categories
            city: string;
            venue: string;
            status: string;
            fee: number;
            lng: number;
            lat: number;
            departure?: string;
            destination?: string;
            startTime?: string;
            endDate?: string;
        }> = [];

        // Add shows
        shows
            .filter(s => {
                if (s.tenantId !== orgId) return false;
                if (!s.date) return false;
                const showDate = new Date(s.date).getTime();
                if (isNaN(showDate)) return false;
                return showDate >= now && showDate <= maxDate;
            })
            .forEach(s => {
                // Extract button type from notes to determine if this is a "real show" or other event type
                let btnType = 'show'; // Default for backward compat
                if (s.notes?.includes('__btnType:')) {
                    const match = s.notes.match(/__btnType:(\w+)/);
                    if (match?.[1]) btnType = match[1];
                }

                allEvents.push({
                    id: s.id,
                    date: s.date,
                    kind: 'show',
                    btnType, // Store the button type for filtering
                    city: s.city || '',
                    venue: s.venue || 'TBA',
                    status: s.status || 'pending',
                    fee: s.fee || 0,
                    lng: s.lng || 0,
                    lat: s.lat || 0,
                    endDate: s.endDate
                });
            });

        // Add travel events
        travel
            .filter(t => {
                if (!t.date) return false;
                const travelDate = new Date(t.date).getTime();
                if (isNaN(travelDate)) return false;
                return travelDate >= now && travelDate <= maxDate;
            })
            .forEach(t => {
                allEvents.push({
                    id: t.id,
                    date: t.date,
                    kind: 'travel',
                    city: t.city || t.title || 'Travel',
                    venue: t.title || 'TBA',
                    status: t.status || 'pending',
                    fee: 0, // Travel events don't have fees
                    lng: 0,
                    lat: 0,
                    departure: t.departure,
                    destination: t.destination,
                    startTime: t.startTime,
                    endDate: t.endDate
                });
            });

        // Apply status filter
        let filtered = allEvents;
        if (filters.status !== 'all') {
            filtered = filtered.filter(e => e.status === filters.status);
        }

        // Apply search filter
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            filtered = filtered.filter(e =>
                e.city?.toLowerCase().includes(query) ||
                e.venue?.toLowerCase().includes(query)
            );
        }

        filtered.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Use all events for stats (already filtered by date range)
        const next21 = filtered.filter(e => new Date(e.date).getTime() <= days21);

        // Stats (only for REAL shows - where btnType is 'show' or undefined for backward compat)
        const showsOnly = filtered.filter(e => e.kind === 'show' && (!e.btnType || e.btnType === 'show'));

        // Count ALL events for the shows30 field (used by TourAgenda to know if there are events)
        const shows30 = showsOnly.length;
        const revenue30 = showsOnly.reduce((acc, s) => {
            const prob = STAGE_PROB[s.status] ?? 0;
            return acc + s.fee * prob;
        }, 0);

        const confirmed = showsOnly.filter(s => s.status === 'confirmed').length;
        const pending = showsOnly.filter(s => s.status === 'pending').length;
        const offers = showsOnly.filter(s => s.status === 'offer').length;

        // Next show (only shows, not travel)
        const nextShow = showsOnly.length > 0 ? showsOnly[0] : null;
        const nextShowData = nextShow
            ? {
                city: nextShow.city,
                date: nextShow.date,
                venue: nextShow.venue,
                daysUntil: Math.ceil((new Date(nextShow.date).getTime() - now) / (24 * 60 * 60 * 1000)),
                lng: nextShow.lng,
                lat: nextShow.lat
            }
            : null;

        // Agenda agrupado por día (shows y travel)
        const agenda: AgendaDay[] = [];
        const dayMap = new Map<string, AgendaDay>();

        next21.forEach(event => {
            if (!event.date) return;
            const d = new Date(event.date);
            if (isNaN(d.getTime())) return;

            // Collect all days this event spans (for multi-day events)
            const dayKeys: string[] = [];
            const startDate = new Date(event.date);
            const endDate = event.endDate ? new Date(event.endDate) : startDate;

            // Distribute event across all days it spans, but only up to 21 days
            let current = new Date(startDate);
            while (current <= endDate && current.getTime() <= days21) {
                const dayStr = current.toISOString().split('T')[0];
                if (dayStr) dayKeys.push(dayStr);
                current.setDate(current.getDate() + 1);
            }

            dayKeys.forEach(dayKey => {
                if (!dayMap.has(dayKey)) {
                    const d = new Date(dayKey);
                    const daysAway = Math.ceil((d.getTime() - now) / (24 * 60 * 60 * 1000));
                    let rel = '';
                    if (daysAway === 0) rel = 'Today';
                    else if (daysAway === 1) rel = 'Tomorrow';
                    else if (daysAway <= 7) rel = 'This week';
                    else if (daysAway <= 14) rel = 'Next week';
                    else rel = 'Later';

                    dayMap.set(dayKey, { day: dayKey, rel, shows: [] });
                }

                dayMap.get(dayKey)!.shows.push({
                    id: event.id,
                    city: event.city,
                    venue: event.venue,
                    status: event.status,
                    fee: event.fee,
                    date: event.date,
                    lng: event.lng,
                    lat: event.lat,
                    kind: event.kind,
                    btnType: event.btnType,
                    departure: event.departure,
                    destination: event.destination,
                    startTime: event.startTime,
                    endDate: event.endDate
                });
            });
        });

        dayMap.forEach(d => agenda.push(d));
        agenda.sort((a, b) => {
            const firstA = a.shows[0];
            const firstB = b.shows[0];
            if (!firstA || !firstB) return 0;
            const aDate = new Date(firstA.date).getTime();
            const bDate = new Date(firstB.date).getTime();
            return aDate - bDate;
        });

        // Gap detection (only confirmed shows)
        let hasGaps = false;
        const confirmedShows = next21
            .filter(e => e.kind === 'show' && e.status === 'confirmed')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (let i = 0; i < confirmedShows.length - 1; i++) {
            const current = confirmedShows[i];
            const next = confirmedShows[i + 1];
            if (current && next) {
                const gap = Math.ceil(
                    (new Date(next.date).getTime() - new Date(current.date).getTime()) /
                    (24 * 60 * 60 * 1000)
                );
                if (gap > 7) {
                    hasGaps = true;
                    break;
                }
            }
        }

        return {
            shows30,
            revenue30,
            confirmed,
            pending,
            offers,
            nextShow: nextShowData,
            agenda,
            hasGaps
        };
    }, [shows, travel, orgId, filters.dateRange, filters.status, filters.searchQuery]);
};
