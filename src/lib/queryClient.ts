import { QueryClient, QueryCache, MutationCache } from '@tanstack/react-query';
import { toast } from 'sonner';
import { logger } from './logger';

/**
 * Enhanced React Query Configuration
 *
 * Advanced QueryClient setup with intelligent caching strategies,
 * background synchronization, error handling, and performance optimizations.
 */

// Global query cache for cross-component cache monitoring
const queryCache = new QueryCache({
  onError: (error, query) => {
    // Log query errors for debugging
    logger.error('Query error occurred', error);
    
    // Don't show toast for auth/permission errors
    if (error instanceof Error && 'status' in error) {
      const status = (error as any).status;
      if (status === 401 || status === 403) return;
    }
    
    // Show user-friendly error for other failures
    toast.error('Failed to load data. Please try again.');
  },
  onSuccess: (data, query) => {
    // Track successful cache updates for analytics
    logger.debug('Query cache updated');
  },
});

// Global mutation cache for optimistic updates monitoring
const mutationCache = new MutationCache({
  onError: (error, variables, context, mutation) => {
    logger.error('Mutation error occurred', error);
    
    // Show user-friendly error for failed mutations
    toast.error('Operation failed. Changes have been reverted.');
  },
  onSuccess: (data, variables, context, mutation) => {
    logger.debug('Mutation successful');
  },
});

export const queryClient = new QueryClient({
  queryCache,
  mutationCache,
  defaultOptions: {
    queries: {
      // Intelligent stale time based on data type
      staleTime: 5 * 60 * 1000, // 5 minutes default
      
      // Extended garbage collection for better cache persistence
      gcTime: 30 * 60 * 1000, // 30 minutes (increased from 10)
      
      // Smart retry strategy with exponential backoff
      retry: (failureCount, error) => {
        // Don't retry on 4xx client errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        // Retry up to 3 times for other errors
        return failureCount < 3;
      },
      
      // Retry delay with exponential backoff
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      
      // Background refetching optimizations
      refetchOnWindowFocus: 'always',
      refetchOnReconnect: 'always', 
      refetchOnMount: true,
      
      // Network mode for better offline handling
      networkMode: 'online',
      
      // Meta data for query tracking
      meta: {
        persistOffline: true,
      },
    },
    mutations: {
      // Enhanced retry strategy for mutations
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error instanceof Error && 'status' in error) {
          const status = (error as any).status;
          if (status >= 400 && status < 500) return false;
        }
        // Retry network/server errors once
        return failureCount < 1;
      },
      
      // Network mode for mutations
      networkMode: 'online',
      
      // Meta for mutation tracking
      meta: {
        trackAnalytics: true,
      },
    },
  },
});

/**
 * Enhanced Query Key Factories
 * 
 * Centralized query key management with hierarchical structure
 * for better cache invalidation and debugging.
 */

export const showsQueryKeys = {
  all: ['shows'] as const,
  lists: () => [...showsQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) =>
    [...showsQueryKeys.lists(), { filters }] as const,
  details: () => [...showsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...showsQueryKeys.details(), id] as const,
  byStatus: (status: string) => [...showsQueryKeys.all, 'status', status] as const,
  byVenue: (venueId: string) => [...showsQueryKeys.all, 'venue', venueId] as const,
  byDateRange: (from: string, to: string) => [...showsQueryKeys.all, 'dateRange', from, to] as const,
  stats: () => [...showsQueryKeys.all, 'stats'] as const,
} as const;

export const financeQueryKeys = {
  all: ['finance'] as const,
  snapshots: () => [...financeQueryKeys.all, 'snapshot'] as const,
  snapshot: (filters?: Record<string, any>) =>
    [...financeQueryKeys.snapshots(), { filters }] as const,
  kpis: () => [...financeQueryKeys.all, 'kpis'] as const,
  kpi: (metric: string) => [...financeQueryKeys.kpis(), metric] as const,
  targets: () => [...financeQueryKeys.all, 'targets'] as const,
  breakdown: (type: string) => [...financeQueryKeys.all, 'breakdown', type] as const,
  trends: () => [...financeQueryKeys.all, 'trends'] as const,
  yearly: (year: number) => [...financeQueryKeys.all, 'year', year] as const,
  monthly: (year: number, month: number) => [...financeQueryKeys.yearly(year), 'month', month] as const,
} as const;

export const contactsQueryKeys = {
  all: ['contacts'] as const,
  lists: () => [...contactsQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) =>
    [...contactsQueryKeys.lists(), { filters }] as const,
  details: () => [...contactsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contactsQueryKeys.details(), id] as const,
  byType: (type: string) => [...contactsQueryKeys.all, 'type', type] as const,
  stats: () => [...contactsQueryKeys.all, 'stats'] as const,
  interactions: (contactId: string) => [...contactsQueryKeys.detail(contactId), 'interactions'] as const,
} as const;

export const venuesQueryKeys = {
  all: ['venues'] as const,
  lists: () => [...venuesQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) =>
    [...venuesQueryKeys.lists(), { filters }] as const,
  details: () => [...venuesQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...venuesQueryKeys.details(), id] as const,
  byCity: (city: string) => [...venuesQueryKeys.all, 'city', city] as const,
  byCountry: (country: string) => [...venuesQueryKeys.all, 'country', country] as const,
  stats: () => [...venuesQueryKeys.all, 'stats'] as const,
} as const;

export const contractsQueryKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractsQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, any>) =>
    [...contractsQueryKeys.lists(), { filters }] as const,
  details: () => [...contractsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractsQueryKeys.details(), id] as const,
  byShow: (showId: string) => [...contractsQueryKeys.all, 'show', showId] as const,
  stats: () => [...contractsQueryKeys.all, 'stats'] as const,
} as const;

export const calendarQueryKeys = {
  all: ['calendar'] as const,
  events: () => [...calendarQueryKeys.all, 'events'] as const,
  event: (id: string) => [...calendarQueryKeys.events(), id] as const,
  byDateRange: (from: string, to: string) => [...calendarQueryKeys.events(), 'range', from, to] as const,
  byType: (type: string) => [...calendarQueryKeys.events(), 'type', type] as const,
  agenda: (userId: string) => [...calendarQueryKeys.all, 'agenda', userId] as const,
} as const;

export const travelQueryKeys = {
  all: ['travel'] as const,
  trips: () => [...travelQueryKeys.all, 'trips'] as const,
  trip: (id: string) => [...travelQueryKeys.trips(), id] as const,
  routes: () => [...travelQueryKeys.all, 'routes'] as const,
  route: (id: string) => [...travelQueryKeys.routes(), id] as const,
  logistics: (showId: string) => [...travelQueryKeys.all, 'logistics', showId] as const,
  expenses: () => [...travelQueryKeys.all, 'expenses'] as const,
} as const;

/**
 * Advanced Query Client Utilities
 */

// Query client helper methods
export const queryHelpers = {
  // Invalidate all queries for a specific domain
  invalidateAll: (domain: string) => {
    return queryClient.invalidateQueries({ queryKey: [domain] });
  },
  
  // Remove all cached data for a domain
  removeAll: (domain: string) => {
    return queryClient.removeQueries({ queryKey: [domain] });
  },
  
  // Prefetch query with error handling
  prefetchSafe: async (queryKey: any[], queryFn: () => Promise<any>) => {
    try {
      await queryClient.prefetchQuery({ queryKey, queryFn });
    } catch (error) {
      logger.warn('Prefetch failed');
    }
  },
  
  // Set query data with optimistic update tracking
  setOptimistic: (queryKey: any[], data: any, updater?: (old: any) => any) => {
    const previous = queryClient.getQueryData(queryKey);
    const newData = updater ? updater(previous) : data;
    queryClient.setQueryData(queryKey, newData);
    return previous;
  },
  
  // Get cached data with fallback
  getCached: <T>(queryKey: any[], fallback?: T): T | undefined => {
    return queryClient.getQueryData(queryKey) ?? fallback;
  },
} as const;
