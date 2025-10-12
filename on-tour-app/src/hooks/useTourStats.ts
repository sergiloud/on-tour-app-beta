import { useMemo } from 'react';
import { showStore } from '../shared/showStore';
import { getCurrentOrgId } from '../lib/tenants';
import { useDashboardFilters, useFilteredShowsByDashboard } from '../context/DashboardContext';

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
 */
export const useTourStats = (): TourStats => {
    const orgId = getCurrentOrgId();
    const { filters } = useDashboardFilters();

    return useMemo(() => {
        const now = Date.now();
        const DAY = 24 * 60 * 60 * 1000;

        // Get date range from filters
        const dateRangeDays = filters.dateRange === 'all' ? 365 : parseInt(filters.dateRange);
        const maxDate = now + dateRangeDays * DAY;
        const days21 = now + 21 * DAY;

        let all = showStore
            .getAll()
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

        // Stats
        const shows30 = all.length;
        const revenue30 = all.reduce((acc, s) => {
            const prob = STAGE_PROB[s.status] ?? 0;
            return acc + s.fee * prob;
        }, 0);

        const confirmed = all.filter(s => s.status === 'confirmed').length;
        const pending = all.filter(s => s.status === 'pending').length;
        const offers = all.filter(s => s.status === 'offer').length;

        // Next show
        const nextShow = all.length > 0 ? all[0] : null;
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

        // Agenda agrupado por día
        const agenda: AgendaDay[] = [];
        const dayMap = new Map<string, AgendaDay>();

        next21.forEach(show => {
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
                dayMap.get(dayKey)!.shows.push({
                    id: show.id,
                    city: show.city,
                    venue: show.venue || 'TBA',
                    status: show.status,
                    fee: show.fee,
                    date: show.date,
                    lng: show.lng,
                    lat: show.lat
                });
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
    }, [orgId]);
};
