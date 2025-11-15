import { useMemo } from 'react';
import { useShows } from './useShows';
import { getCurrentOrgId } from '../lib/tenants';
import { useDashboardFilters, useFilteredShowsByDashboard } from '../context/DashboardContext';
import { fetchItinerariesGentle, onItinerariesUpdated, Itinerary, isValidLocation } from '../services/travelApi';
import { useEffect, useState, useRef } from 'react';

interface AgendaDay {
    day: string;
    rel: string;
    shows: Array<{
        id: string;
        name?: string; // Show display name
        city: string;
        venue: string;
        status: string;
        fee: number;
        date: string;
        endDate?: string;
        lng: number;
        lat: number;
        btnType?: string; // Button type for distinguishing event categories
        eventType?: 'show' | 'itinerary'; // Distinguish between Show and Itinerary events
        departure?: string; // For travel events
        destination?: string; // For travel events
        color?: string; // Color from calendar (green, blue, yellow, red, purple)
        description?: string; // Event description
        location?: string; // Event location/venue
    }>;
}

interface TourStats {
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
 * Hook que calcula estadísticas del tour respetando filtros del Dashboard
 * Incluye: revenue proyectado, shows confirmados/pending/offers, agenda agrupada
 *
 * Ahora sincronizado con useShows para que los eventos del calendario
 * se reflejen inmediatamente en el dashboard
 */
export const useTourStats = (): TourStats => {
    const { shows } = useShows();
    const orgId = getCurrentOrgId();
    const { filters } = useDashboardFilters();
    const [itineraryEvents, setItineraryEvents] = useState<Itinerary[]>([]);
    const unsub_ref = useRef<(() => void) | null>(null);

    // Fetch itinerary events (travel, personal, meeting, etc.) when component mounts or org changes
    useEffect(() => {
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
                setItineraryEvents(data);
            })
            .catch((error) => {
                console.error('Error loading itinerary events for useTourStats:', error);
                setItineraryEvents([]);
            });

        // Subscribe to itinerary events updates
        const unsub = onItinerariesUpdated((e) => {
            setItineraryEvents(e?.data || e || []);
        });

        unsub_ref.current = unsub;
        return () => {
            if (unsub) unsub();
            unsub_ref.current = null;
        };
    }, [orgId]);

    // Step 1: Filter shows by date range and filters
    const filteredShows = useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        const dateRangeDays = filters.dateRange === 'all' ? 365 : parseInt(filters.dateRange);
        const maxDate = now + dateRangeDays * DAY;

        let all = shows.filter(s => {
            if (!s.date) return false;
            const showDate = new Date(s.date).getTime();
            if (isNaN(showDate)) return false;
            return showDate >= now && showDate <= maxDate;
        });

        // Apply status filter
        if (filters.status !== 'all') {
            all = all.filter(s => s.status === filters.status);
        }

        // Apply search filter
        if (filters.searchQuery.trim()) {
            const query = filters.searchQuery.toLowerCase();
            all = all.filter(s =>
                s.city?.toLowerCase().includes(query) ||
                s.venue?.toLowerCase().includes(query) ||
                s.country?.toLowerCase().includes(query)
            );
        }

        return all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    }, [shows, filters.dateRange, filters.status, filters.searchQuery]);

    // Step 2: Filter real shows (excluding Personal, Meeting, etc.)
    const realShows = useMemo(() => {
        return filteredShows.filter(s => {
            const btnType = s.notes?.match(/__btnType:(\w+)/)?.[1];
            return !btnType || btnType === 'show';
        });
    }, [filteredShows]);

    // Step 3: Calculate show statistics
    const showStatistics = useMemo(() => {
        const shows30 = realShows.length;
        const revenue30 = realShows.reduce((acc, s) => {
            const prob = STAGE_PROB[s.status] ?? 0;
            return acc + s.fee * prob;
        }, 0);

        const confirmed = realShows.filter(s => s.status === 'confirmed').length;
        const pending = realShows.filter(s => s.status === 'pending').length;
        const offers = realShows.filter(s => s.status === 'offer').length;

        return { shows30, revenue30, confirmed, pending, offers };
    }, [realShows]);

    // Step 4: Compute next show data
    const nextShowData = useMemo(() => {
        const now = Date.now();
        const nextShow = realShows.length > 0 ? realShows[0] : null;
        return nextShow
            ? {
                city: nextShow.city,
                date: nextShow.date,
                venue: nextShow.venue || 'TBA',
                daysUntil: Math.ceil((new Date(nextShow.date).getTime() - now) / (24 * 60 * 60 * 1000)),
                lng: nextShow.lng,
                lat: nextShow.lat
            }
            : null;
    }, [realShows]);

    // Step 5: Build agenda from shows (respects date range filter)
    const showAgendaItems = useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        // Use 21 days for non-'all' filters, otherwise use the full filter range
        const agendaDays = filters.dateRange === 'all' ? 365 : 21;
        const maxAgendaDate = now + agendaDays * DAY;
        
        const result = filteredShows
            .filter(s => new Date(s.date).getTime() <= maxAgendaDate)
            .map(show => {
                const d = new Date(show.date);
                const dayKey = d.toISOString().split('T')[0];

                // Extract button type and color from notes
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
                    dayKey,
                    item: {
                        id: show.id,
                        name: (show as any).name,
                        city: show.city,
                        venue: show.venue || 'TBA',
                        status: show.status,
                        fee: show.fee,
                        date: show.date,
                        endDate: (show as any).endDate,
                        lng: show.lng,
                        lat: show.lat,
                        btnType,
                        eventType: 'show' as const,
                        color
                    }
                };
            })
            .filter(({ dayKey }) => dayKey);
        
        return result;
    }, [filteredShows, filters.dateRange]);

    // Step 6: Build agenda from itinerary events (respects date range filter)
    const itineraryAgendaItems = useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        // Use 21 days for non-'all' filters, otherwise use the full filter range
        const agendaDays = filters.dateRange === 'all' ? 365 : 21;
        const maxAgendaDate = now + agendaDays * DAY;
        
        const items: Array<{ dayKey: string; item: any }> = [];

        itineraryEvents.forEach((event: Itinerary) => {
            if (!event.date) return;
            const d = new Date(event.date);
            if (isNaN(d.getTime())) return;

            const eventEndDate = event.endDate ? new Date(event.endDate).getTime() : d.getTime();
            const eventStart = d.getTime();
            if (eventStart > maxAgendaDate && eventEndDate > maxAgendaDate) return;

            // Map button color to calendar color
            const buttonColor = event.buttonColor;
            let eventColor = 'blue';
            if (buttonColor === 'emerald') eventColor = 'green';
            else if (buttonColor === 'sky') eventColor = 'blue';
            else if (buttonColor === 'amber') eventColor = 'yellow';
            else if (buttonColor === 'rose') eventColor = 'red';
            else if (buttonColor === 'purple') eventColor = 'purple';
            else if (buttonColor === 'cyan') eventColor = 'blue';

            const isValid = isValidLocation(event.location, event.title, event.btnType);
            const validLocation = isValid ? event.location : undefined;

            if (event.location && !isValid) {
              console.log(`[useTourStats] Filtered out invalid location "${event.location}" from event "${event.title}" (btnType="${event.btnType}")`);
            }

            const isTravelEvent = event.btnType === 'travel' && event.endDate && event.endDate !== event.date;

            if (isTravelEvent && event.endDate) {
                // DEPARTURE
                const departureKey = d.toISOString().split('T')[0];
                if (departureKey) {
                    items.push({
                        dayKey: departureKey,
                        item: {
                            id: `${event.id}-departure`,
                            name: `${event.departure} → ${event.destination}`,
                            city: event.destination || '',
                            venue: '',
                            status: event.status || 'confirmed',
                            fee: 0,
                            date: event.date,
                            endDate: event.endDate,
                            lng: 0,
                            lat: 0,
                            btnType: event.btnType,
                            eventType: 'itinerary' as const,
                            departure: event.departure,
                            destination: event.destination,
                            color: eventColor,
                            description: event.description,
                            location: validLocation
                        }
                    });
                }

                // RETURN
                const returnDate = new Date(event.endDate);
                if (!isNaN(returnDate.getTime())) {
                    const returnKey = returnDate.toISOString().split('T')[0];
                    const returnTitle = event.destination && event.departure
                        ? `${event.destination} → ${event.departure}`
                        : event.title;

                    if (returnKey) {
                        items.push({
                            dayKey: returnKey,
                            item: {
                                id: `${event.id}-return`,
                                name: returnTitle,
                                city: event.departure || '',
                                venue: '',
                                status: event.status || 'confirmed',
                                fee: 0,
                                date: event.endDate,
                                endDate: undefined,
                                lng: 0,
                                lat: 0,
                                btnType: event.btnType,
                                eventType: 'itinerary' as const,
                                departure: event.destination,
                                destination: event.departure,
                                color: eventColor,
                                description: event.description,
                                location: validLocation
                            }
                        });
                    }
                }
            } else {
                // Non-travel or single-day events
                const dayKey = d.toISOString().split('T')[0];
                if (dayKey) {
                    items.push({
                        dayKey,
                        item: {
                            id: event.id,
                            name: event.title,
                            city: event.city || event.destination || '',
                            venue: '',
                            status: event.status || 'confirmed',
                            fee: 0,
                            date: event.date,
                            endDate: event.endDate,
                            lng: 0,
                            lat: 0,
                            btnType: event.btnType,
                            eventType: 'itinerary' as const,
                            departure: event.departure,
                            destination: event.destination,
                            color: eventColor,
                            description: event.description,
                            location: validLocation
                        }
                    });
                }
            }
        });

        return items;
    }, [itineraryEvents, filters.dateRange]);

    // Step 7: Merge and group agenda items by day
    const agenda = useMemo(() => {
        const now = Date.now();
        const dayMap = new Map<string, AgendaDay>();

        // Helper to ensure day exists in map
        const ensureDay = (dayKey: string, dateMs: number) => {
            if (!dayMap.has(dayKey)) {
                const daysAway = Math.ceil((dateMs - now) / (24 * 60 * 60 * 1000));
                let rel = '';
                if (daysAway === 0) rel = 'Today';
                else if (daysAway === 1) rel = 'Tomorrow';
                else if (daysAway <= 7) rel = 'This week';
                else if (daysAway <= 14) rel = 'Next week';
                else rel = 'Later';

                dayMap.set(dayKey, { day: dayKey, rel, shows: [] });
            }
        };

        // Add show agenda items
        showAgendaItems.forEach(({ dayKey, item }) => {
            if (!dayKey) return;
            ensureDay(dayKey, new Date(item.date).getTime());
            dayMap.get(dayKey)!.shows.push(item);
        });

        // Add itinerary agenda items
        itineraryAgendaItems.forEach(({ dayKey, item }) => {
            if (!dayKey) return;
            ensureDay(dayKey, new Date(item.date).getTime());
            dayMap.get(dayKey)!.shows.push(item);
        });

        const agendaArray = Array.from(dayMap.values());
        agendaArray.sort((a, b) => {
            const firstA = a.shows[0];
            const firstB = b.shows[0];
            if (!firstA || !firstB) return 0;
            const aDate = new Date(firstA.date).getTime();
            const bDate = new Date(firstB.date).getTime();
            return aDate - bDate;
        });

        return agendaArray;
    }, [showAgendaItems, itineraryAgendaItems]);

    // Step 8: Detect gaps in confirmed shows
    const hasGaps = useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;
        const days21 = now + 21 * DAY;

        const next21 = filteredShows.filter(s => new Date(s.date).getTime() <= days21);
        const confirmedSorted = next21
            .filter(s => s.status === 'confirmed')
            .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        for (let i = 0; i < confirmedSorted.length - 1; i++) {
            const current = confirmedSorted[i];
            const next = confirmedSorted[i + 1];
            if (current && next) {
                const gap = Math.ceil(
                    (new Date(next.date).getTime() - new Date(current.date).getTime()) /
                    (24 * 60 * 60 * 1000)
                );
                if (gap > 7) {
                    return true;
                }
            }
        }
        return false;
    }, [filteredShows]);

    return useMemo(() => {
        return {
            ...showStatistics,
            nextShow: nextShowData,
            agenda,
            hasGaps
        };
    }, [showStatistics, nextShowData, agenda, hasGaps]);
};
