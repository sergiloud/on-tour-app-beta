/**
 * Centralized Show Selectors
 *
 * Single source of truth for show filtering, sorting, and selection logic
 * Reduces code duplication across dashboard components
 *
 * Usage:
 * ```tsx
 * // Basic usage
 * const shows = useFilteredShows();
 *
 * // With custom options
 * const futureShows = useFilteredShows({
 *   dateRange: 'days30',
 *   status: 'confirmed'
 * });
 *
 * // Specific helpers
 * const nextShow = useNextShow();
 * const confirmedShows = useConfirmedShows();
 * const shows30Days = useShows30Days();
 * ```
 */

import { useMemo } from 'react';
import { showStore } from '../../shared/showStore';
import { useDashboardFilters } from '../../context/DashboardContext';
import { getCurrentOrgId } from '../tenants';

export interface FilteredShowsOptions {
  /**
   * Date range filter
   * @default 'all'
   */
  dateRange?: 'days30' | 'days90' | 'all';

  /**
   * Status filter
   * @default 'all'
   */
  status?: 'all' | 'confirmed' | 'pending' | 'offer' | 'archived';

  /**
   * Search query (matches city, venue, country)
   * @default ''
   */
  searchQuery?: string;

  /**
   * Limit number of results
   */
  maxResults?: number;

  /**
   * Include archived shows
   * @default false
   */
  includeArchived?: boolean;

  /**
   * Sort direction
   * @default 'asc'
   */
  sortDirection?: 'asc' | 'desc';
}

const DAY = 24 * 60 * 60 * 1000;

/**
 * Calculate date range based on filter
 */
function getDateRange(dateRange: 'days30' | 'days90' | 'all'): [number, number] {
  const now = Date.now();
  let maxDate: number;

  switch (dateRange) {
    case 'days30':
      maxDate = now + 30 * DAY;
      break;
    case 'days90':
      maxDate = now + 90 * DAY;
      break;
    case 'all':
      maxDate = now + 365 * DAY;
      break;
  }

  return [now, maxDate];
}

/**
 * Centralized selector for filtered shows
 * Single source of truth for filtering logic
 *
 * Handles:
 * - Organization filtering
 * - Date range filtering
 * - Status filtering
 * - Search filtering
 * - Sorting
 * - Result limiting
 */
export function useFilteredShows(options: FilteredShowsOptions = {}) {
  const orgId = getCurrentOrgId();
  const { filters: contextFilters } = useDashboardFilters();

  // Merge provided options with context filters
  const mergedFilters = {
    dateRange: (options.dateRange || contextFilters.dateRange || 'all') as 'days30' | 'days90' | 'all',
    status: (options.status || contextFilters.status || 'all') as string,
    searchQuery: options.searchQuery || contextFilters.searchQuery || '',
    includeArchived: options.includeArchived ?? false,
    maxResults: options.maxResults,
    sortDirection: options.sortDirection ?? 'asc' as const,
  };

  return useMemo(() => {
    const [now, maxDate] = getDateRange(mergedFilters.dateRange);

    let shows: any[] = showStore
      .getAll()
      .filter((s: any) => {
        // Organization filter
        if (s.tenantId !== orgId) return false;

        // Archive filter
        if (s.status === 'archived' && !mergedFilters.includeArchived) {
          return false;
        }

        // Date validation
        if (!s.date) return false;
        const showDate = new Date(s.date).getTime();
        if (isNaN(showDate)) return false;

        // Date range
        return showDate >= now && showDate <= maxDate;
      });

    // Status filter
    if (mergedFilters.status !== 'all') {
      shows = shows.filter((s: any) => s.status === mergedFilters.status);
    }

    // Search filter (case-insensitive, matches city/venue/country)
    if (mergedFilters.searchQuery?.trim()) {
      const query = mergedFilters.searchQuery.toLowerCase();
      shows = shows.filter((s: any) =>
        s.city?.toLowerCase().includes(query) ||
        s.venue?.toLowerCase().includes(query) ||
        s.country?.toLowerCase().includes(query)
      );
    }

    // Sort by date
    shows = shows.sort((a: any, b: any) => {
      const aTime = new Date(a.date || '').getTime();
      const bTime = new Date(b.date || '').getTime();
      return mergedFilters.sortDirection === 'asc'
        ? aTime - bTime
        : bTime - aTime;
    });

    // Apply max results
    if (mergedFilters.maxResults) {
      shows = shows.slice(0, mergedFilters.maxResults);
    }

    return shows;
  }, [
    orgId,
    mergedFilters.dateRange,
    mergedFilters.status,
    mergedFilters.searchQuery,
    mergedFilters.includeArchived,
    mergedFilters.maxResults,
    mergedFilters.sortDirection,
  ]);
}

/**
 * Get all shows within 30 days
 */
export function useShows30Days() {
  return useFilteredShows({ dateRange: 'days30' });
}

/**
 * Get all shows within 90 days
 */
export function useShows90Days() {
  return useFilteredShows({ dateRange: 'days90' });
}

/**
 * Get all shows (all time)
 */
export function useAllShows() {
  return useFilteredShows({ dateRange: 'all' });
}

/**
 * Get next N shows (default 30)
 */
export function useNextNShows(n: number = 30) {
  return useFilteredShows({ maxResults: n });
}

/**
 * Get confirmed shows
 */
export function useConfirmedShows() {
  return useFilteredShows({ status: 'confirmed' });
}

/**
 * Get pending shows
 */
export function usePendingShows() {
  return useFilteredShows({ status: 'pending' });
}

/**
 * Get offers
 */
export function useOfferShows() {
  return useFilteredShows({ status: 'offer' });
}

/**
 * Get next show (upcoming)
 */
export function useNextShow() {
  const shows = useFilteredShows({ maxResults: 1 });
  return shows.length > 0 ? shows[0] : null;
}

/**
 * Get confirmed shows within 21 days (for agenda/gap detection)
 */
export function useConfirmedNext21Days() {
  const orgId = getCurrentOrgId();
  const now = Date.now();
  const maxDate = now + 21 * DAY;

  return useMemo(() => {
    return showStore
      .getAll()
      .filter(s => {
        if (s.tenantId !== orgId) return false;
        if (s.status !== 'confirmed') return false;
        if (!s.date) return false;
        const showDate = new Date(s.date).getTime();
        if (isNaN(showDate)) return false;
        return showDate >= now && showDate <= maxDate;
      })
      .sort((a, b) =>
        new Date(a.date || '').getTime() - new Date(b.date || '').getTime()
      );
  }, [orgId]);
}

/**
 * Get shows grouped by day for agenda
 */
export function useShowsByDay(maxDays: number = 21) {
  const orgId = getCurrentOrgId();

  return useMemo(() => {
    const now = Date.now();
    const maxDate = now + maxDays * DAY;
    const dayMap = new Map<string, any[]>();

    showStore
      .getAll()
      .filter((s: any) => {
        if (s.tenantId !== orgId) return false;
        if (!s.date) return false;
        const showDate = new Date(s.date).getTime();
        if (isNaN(showDate)) return false;
        return showDate >= now && showDate <= maxDate;
      })
      .forEach((show: any) => {
        const date = new Date(show.date || '');
        const dayKey = date.toISOString().split('T')[0]; // YYYY-MM-DD
        if (dayKey && !dayMap.has(dayKey)) {
          dayMap.set(dayKey, []);
        }
        if (dayKey) {
          dayMap.get(dayKey)!.push(show);
        }
      });

    // Sort days
    const days = Array.from(dayMap.entries())
      .sort(([dayA], [dayB]) => dayA.localeCompare(dayB));

    return days.map(([day, shows]) => ({
      day,
      daysAway: Math.ceil((new Date(day).getTime() - now) / DAY),
      count: shows.length,
      shows: shows.sort((a: any, b: any) =>
        (a.city || '').localeCompare(b.city || '')
      ),
    }));
  }, [orgId, maxDays]);
}

/**
 * Get revenue projection for filtered shows
 */
export function useRevenueProjection(options?: FilteredShowsOptions) {
  const shows = useFilteredShows(options);

  return useMemo(() => {
    const STAGE_PROB: Record<string, number> = {
      confirmed: 1.0,
      pending: 0.6,
      offer: 0.3,
      canceled: 0,
      archived: 0,
    };

    return shows.reduce((total: number, show: any) => {
      const probability = STAGE_PROB[show.status] ?? 0;
      return total + (show.fee || 0) * probability;
    }, 0);
  }, [shows]);
}

/**
 * Get statistics for filtered shows
 */
export function useShowsStatistics(options?: FilteredShowsOptions) {
  const shows = useFilteredShows(options);

  return useMemo(() => {
    const confirmed = shows.filter((s: any) => s.status === 'confirmed').length;
    const pending = shows.filter((s: any) => s.status === 'pending').length;
    const offers = shows.filter((s: any) => s.status === 'offer').length;
    const total = shows.length;

    const STAGE_PROB: Record<string, number> = {
      confirmed: 1.0,
      pending: 0.6,
      offer: 0.3,
      canceled: 0,
      archived: 0,
    };

    const revenue = shows.reduce((total: number, show: any) => {
      const probability = STAGE_PROB[show.status] ?? 0;
      return total + (show.fee || 0) * probability;
    }, 0);

    return {
      total,
      confirmed,
      pending,
      offers,
      revenue,
      averageFee: total > 0 ? revenue / total : 0,
    };
  }, [shows]);
}
