import { QueryClient } from '@tanstack/react-query';

/**
 * React Query Configuration
 *
 * Central QueryClient setup for caching, background refetching,
 * and cache management across the application.
 */

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Data is fresh for 5 minutes
      staleTime: 5 * 60 * 1000,

      // Keep data in cache for 10 minutes before garbage collection
      gcTime: 10 * 60 * 1000,

      // Retry failed queries once
      retry: 1,

      // Refetch when window regains focus
      refetchOnWindowFocus: true,

      // Refetch on reconnection (when network restored)
      refetchOnReconnect: true,

      // Refetch when component mounts (if data is stale)
      refetchOnMount: true,
    },
    mutations: {
      // Retry failed mutations once
      retry: 1,
    },
  },
});

/**
 * Query key factory - ensures consistent query keys across the app
 */
export const showsQueryKeys = {
  all: ['shows'] as const,
  lists: () => [...showsQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) =>
    [...showsQueryKeys.lists(), { filters }] as const,
  details: () => [...showsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...showsQueryKeys.details(), id] as const,
} as const;

export const financeQueryKeys = {
  all: ['finance'] as const,
  snapshots: () => [...financeQueryKeys.all, 'snapshot'] as const,
  snapshot: (filters?: Record<string, any>) =>
    [...financeQueryKeys.snapshots(), { filters }] as const,
  kpis: () => [...financeQueryKeys.all, 'kpis'] as const,
  kpi: (metric: string) => [...financeQueryKeys.kpis(), metric] as const,
} as const;
