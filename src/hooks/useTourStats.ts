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

    return useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        // Get date range from filters
        const dateRangeDays = filters.dateRange === 'all' ? 365 : parseInt(filters.dateRange);
        const maxDate = now + dateRangeDays * DAY;
        const days21 = now + 21 * DAY;

        let all = shows
            .filter(s => {
                if (s.tenantId !== orgId) return false;
                if (!s.date) return false; // Skip shows without valid date
                const showDate = new Date(s.date).getTime();
                if (isNaN(showDate)) return false; // Skip invalid dates
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

        all = all.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

        // Use all shows for stats (already filtered by date range)
        const next21 = all.filter(s => new Date(s.date).getTime() <= days21);

        // Filter to only count real shows (not Personal, Meeting, etc.) for statistics
        const realShows = all.filter(s => {
            const btnType = s.notes?.match(/__btnType:(\w+)/)?.[1];
            return !btnType || btnType === 'show'; // Include if no btnType or if btnType is 'show'
        });
        const realShowsNext21 = realShows.filter(s => new Date(s.date).getTime() <= days21);

        // Stats (only for real shows)
        const shows30 = realShows.length;
        const revenue30 = realShows.reduce((acc, s) => {
            const prob = STAGE_PROB[s.status] ?? 0;
            return acc + s.fee * prob;
        }, 0);

        const confirmed = realShows.filter(s => s.status === 'confirmed').length;
        const pending = realShows.filter(s => s.status === 'pending').length;
        const offers = realShows.filter(s => s.status === 'offer').length;

        // Next show (only real shows)
        const nextShow = realShows.length > 0 ? realShows[0] : null;
        const nextShowData = nextShow
            ? {
                city: nextShow.city,
                date: nextShow.date,
                venue: nextShow.venue || 'TBA',
                daysUntil: Math.ceil((new Date(nextShow.date).getTime() - now) / (24 * 60 * 60 * 1000)),
                lng: nextShow.lng,
                lat: nextShow.lat
            }
            : null;

        // Agenda agrupado por día (incluye todos los eventos, incluso Personal/Meeting)
        const agenda: AgendaDay[] = [];
        const dayMap = new Map<string, AgendaDay>();

        // Include all events in agenda (next 21 days), not just real shows
        const agendaEvents = all.filter(s => new Date(s.date).getTime() <= days21);

        agendaEvents.forEach(show => {
            if (!show.date) return; // Skip shows without date
            const d = new Date(show.date);
            if (isNaN(d.getTime())) return; // Skip invalid dates
            const dayKey = d.toISOString().split('T')[0]; // YYYY-MM-DD format

            if (dayKey && !dayMap.has(dayKey)) {
                const daysAway = Math.ceil((d.getTime() - now) / (24 * 60 * 60 * 1000));
                let rel = '';
                if (daysAway === 0) rel = 'Today';
                else if (daysAway === 1) rel = 'Tomorrow';
                else if (daysAway <= 7) rel = 'This week';
                else if (daysAway <= 14) rel = 'Next week';
                else rel = 'Later';

                dayMap.set(dayKey, { day: dayKey, rel, shows: [] }); // Use ISO date string
            }

            if (dayKey) {
                // Extract button type and color from notes if available
                let btnType = 'show'; // Default
                let color: string | undefined;

                if (show.notes?.includes('__btnType:')) {
                    const match = show.notes.match(/__btnType:(\w+)/);
                    if (match?.[1]) btnType = match[1];
                }

                // Extract color from notes: __dispColor:green format
                if (show.notes?.includes('__dispColor:')) {
                    const colorMatch = show.notes.match(/__dispColor:(\w+)/);
                    if (colorMatch?.[1]) {
                        const colorStr = colorMatch[1];
                        if (['green', 'blue', 'yellow', 'red', 'purple'].includes(colorStr)) {
                            color = colorStr;
                        }
                    }
                }

                // If no color was extracted and btnType is 'show' (or default), set to green
                if (!color && (!btnType || btnType === 'show')) {
                    color = 'green';
                }

                dayMap.get(dayKey)!.shows.push({
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
                    eventType: 'show',
                    color
                });
            }
        });

        // Add Itinerary events to agenda
        itineraryEvents.forEach((event: Itinerary) => {
            if (!event.date) return; // Skip event without date
            const d = new Date(event.date);
            if (isNaN(d.getTime())) return; // Skip invalid dates

            // Only include if within next 21 days or spans across
            const eventEndDate = event.endDate ? new Date(event.endDate).getTime() : d.getTime();
            const eventStart = d.getTime();
            if (eventStart > days21 && eventEndDate > days21) return; // Completely outside range

            // Map button color to calendar color for Itinerary events
            const buttonColor = event.buttonColor;
            let eventColor = 'blue'; // Default
            if (buttonColor === 'emerald') eventColor = 'green';
            else if (buttonColor === 'sky') eventColor = 'blue';
            else if (buttonColor === 'amber') eventColor = 'yellow';
            else if (buttonColor === 'rose') eventColor = 'red';
            else if (buttonColor === 'purple') eventColor = 'purple';
            else if (buttonColor === 'cyan') eventColor = 'blue';

            // Validate location using helper
            const isValid = isValidLocation(event.location, event.title, event.btnType);
            const validLocation = isValid ? event.location : undefined;

            if (event.location && !isValid) {
              console.log(`[useTourStats] Filtered out invalid location "${event.location}" from event "${event.title}" (btnType="${event.btnType}")`);
            }

            // For travel events (multi-day itineraries), create TWO separate agenda items
            // One for the departure (ida) and one for the return (vuelta)
            const isTravelEvent = event.btnType === 'travel' && event.endDate && event.endDate !== event.date;

            if (isTravelEvent && event.endDate) {
                // DEPARTURE (IDA) - First card on the departure date
                const departureKey = d.toISOString().split('T')[0];

                if (departureKey && !dayMap.has(departureKey)) {
                    const daysAway = Math.ceil((d.getTime() - now) / (24 * 60 * 60 * 1000));
                    let rel = '';
                    if (daysAway === 0) rel = 'Today';
                    else if (daysAway === 1) rel = 'Tomorrow';
                    else if (daysAway <= 7) rel = 'This week';
                    else if (daysAway <= 14) rel = 'Next week';
                    else rel = 'Later';

                    dayMap.set(departureKey, { day: departureKey, rel, shows: [] });
                }

                if (departureKey) {
                    dayMap.get(departureKey)!.shows.push({
                        id: `${event.id}-departure`,
                        name: `${event.departure} → ${event.destination}`, // Departure format
                        city: event.destination || '',
                        venue: '',
                        status: event.status || 'confirmed',
                        fee: 0,
                        date: event.date,
                        endDate: event.endDate,
                        lng: 0,
                        lat: 0,
                        btnType: event.btnType,
                        eventType: 'itinerary',
                        departure: event.departure,
                        destination: event.destination,
                        color: eventColor,
                        description: event.description,
                        location: validLocation
                    });
                }

                // RETURN (VUELTA) - Second card on the return date with inverted title
                const returnDate = new Date(event.endDate);
                if (!isNaN(returnDate.getTime())) {
                    const returnKey = returnDate.toISOString().split('T')[0];
                    const returnTitle = event.destination && event.departure
                        ? `${event.destination} → ${event.departure}`
                        : event.title; // Inverted: destination → departure

                    if (returnKey && !dayMap.has(returnKey)) {
                        const daysAway = Math.ceil((returnDate.getTime() - now) / (24 * 60 * 60 * 1000));
                        let rel = '';
                        if (daysAway === 0) rel = 'Today';
                        else if (daysAway === 1) rel = 'Tomorrow';
                        else if (daysAway <= 7) rel = 'This week';
                        else if (daysAway <= 14) rel = 'Next week';
                        else rel = 'Later';

                        dayMap.set(returnKey, { day: returnKey, rel, shows: [] });
                    }

                    if (returnKey) {
                        dayMap.get(returnKey)!.shows.push({
                            id: `${event.id}-return`,
                            name: returnTitle,
                            city: event.departure || '',
                            venue: '',
                            status: event.status || 'confirmed',
                            fee: 0,
                            date: event.endDate,
                            endDate: undefined, // Return event is single-day
                            lng: 0,
                            lat: 0,
                            btnType: event.btnType,
                            eventType: 'itinerary',
                            departure: event.destination, // Swapped for return
                            destination: event.departure,  // Swapped for return
                            color: eventColor,
                            description: event.description,
                            location: validLocation
                        });
                    }
                }
            } else {
                // Non-travel events or single-day events - show as usual
                const dayKey = d.toISOString().split('T')[0]; // YYYY-MM-DD format

                if (dayKey && !dayMap.has(dayKey)) {
                    const daysAway = Math.ceil((d.getTime() - now) / (24 * 60 * 60 * 1000));
                    let rel = '';
                    if (daysAway === 0) rel = 'Today';
                    else if (daysAway === 1) rel = 'Tomorrow';
                    else if (daysAway <= 7) rel = 'This week';
                    else if (daysAway <= 14) rel = 'Next week';
                    else rel = 'Later';

                    dayMap.set(dayKey, { day: dayKey, rel, shows: [] });
                }

                if (dayKey) {
                    dayMap.get(dayKey)!.shows.push({
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
                        eventType: 'itinerary',
                        departure: event.departure,
                        destination: event.destination,
                        color: eventColor,
                        description: event.description,
                        location: validLocation
                    });
                }
            }
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

        // Gap detection
        let hasGaps = false;
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
    }, [shows, itineraryEvents, orgId, filters.dateRange, filters.status, filters.searchQuery]);
};
