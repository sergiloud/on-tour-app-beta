/**
 * React Query Performance Optimizations v2.2.1
 * Enhanced caching, deduplication, and background sync optimizations
 */

import { QueryClient, MutationCache, QueryCache, Query } from '@tanstack/react-query';
import { trackEvent } from '../lib/telemetry';

// Enhanced query client configuration
export function createOptimizedQueryClient(): QueryClient {
  return new QueryClient({
    queryCache: new QueryCache({
      onError: (error, query) => {
        // Enhanced error tracking
        trackEvent('query_error', {
          queryKey: query.queryKey,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      },
      onSuccess: (data, query) => {
        // Track successful queries for analytics
        if (query.meta?.trackSuccess) {
          trackEvent('query_success', {
            queryKey: query.queryKey,
            cacheTime: query.state.dataUpdatedAt
          });
        }
      }
    }),
    mutationCache: new MutationCache({
      onError: (error, variables, context, mutation) => {
        trackEvent('mutation_error', {
          mutationKey: mutation.options.mutationKey,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }),
    defaultOptions: {
      queries: {
        // Enhanced stale time based on query type
        staleTime: (query) => {
          const key = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          
          // Configure stale times by data type
          switch (key) {
            case 'shows':
              return 5 * 60 * 1000; // 5 minutes - shows change frequently
            case 'finance':
              return 10 * 60 * 1000; // 10 minutes - finance data is more static
            case 'contacts':
              return 15 * 60 * 1000; // 15 minutes - contacts rarely change
            case 'organization':
              return 30 * 60 * 1000; // 30 minutes - org settings very static
            case 'user-settings':
              return 60 * 60 * 1000; // 1 hour - user settings change rarely
            default:
              return 5 * 60 * 1000; // 5 minutes default
          }
        },
        
        // Enhanced cache time
        gcTime: 30 * 60 * 1000, // 30 minutes (was cacheTime)
        
        // Network mode optimization
        networkMode: 'online',
        
        // Retry configuration
        retry: (failureCount, error: any) => {
          // Don't retry on 4xx errors (client errors)
          if (error?.status >= 400 && error?.status < 500) {
            return false;
          }
          // Retry up to 3 times for network/server errors
          return failureCount < 3;
        },
        
        // Enhanced refetch configuration
        refetchOnWindowFocus: (query) => {
          // Only refetch critical data on window focus
          const key = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
          return ['shows', 'finance'].includes(key as string);
        },
        
        refetchOnReconnect: true,
        refetchOnMount: (query) => {
          // Smart refetch based on data age
          const dataAge = Date.now() - (query.state.dataUpdatedAt || 0);
          const fiveMinutes = 5 * 60 * 1000;
          return dataAge > fiveMinutes;
        }
      },
      mutations: {
        // Enhanced mutation options
        networkMode: 'online',
        retry: 1,
        
        // Global mutation error handling
        onError: (error, variables, context) => {
          console.error('Mutation failed:', { error, variables, context });
        }
      }
    }
  });
}

// Simple localStorage persistence (without external dependencies)
export function setupQueryPersistence(queryClient: QueryClient) {
  if (typeof window === 'undefined') return;

  const STORAGE_KEY = 'on-tour-query-cache-v2.2.1';
  
  // Load persisted data on initialization
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (cached) {
      const data = JSON.parse(cached);
      // Simple restoration of critical queries
      Object.entries(data).forEach(([key, value]) => {
        if (key.includes('shows') || key.includes('finance')) {
          queryClient.setQueryData(JSON.parse(key), value);
        }
      });
    }
  } catch (error) {
    console.warn('Failed to restore query cache:', error);
  }
  
  // Persist critical queries periodically
  const persistTimer = setInterval(() => {
    try {
      const cache: Record<string, any> = {};
      queryClient.getQueryCache().findAll().forEach(query => {
        const key = Array.isArray(query.queryKey) ? query.queryKey[0] : query.queryKey;
        if (['shows', 'finance'].includes(key as string) && query.state.data) {
          cache[JSON.stringify(query.queryKey)] = query.state.data;
        }
      });
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
    } catch (error) {
      console.warn('Failed to persist query cache:', error);
    }
  }, 30000); // Persist every 30 seconds
  
  return () => clearInterval(persistTimer);
}

// Query key factories for consistent keys and better deduplication
export const queryKeys = {
  all: ['app'] as const,
  
  shows: () => [...queryKeys.all, 'shows'] as const,
  showsById: (id: string) => [...queryKeys.shows(), id] as const,
  showsFiltered: (filters: Record<string, any>) => [...queryKeys.shows(), 'filtered', filters] as const,
  
  finance: () => [...queryKeys.all, 'finance'] as const,
  financeSnapshot: () => [...queryKeys.finance(), 'snapshot'] as const,
  financeKpis: () => [...queryKeys.finance(), 'kpis'] as const,
  
  contacts: () => [...queryKeys.all, 'contacts'] as const,
  contactsById: (id: string) => [...queryKeys.contacts(), id] as const,
  contactsFiltered: (filters: Record<string, any>) => [...queryKeys.contacts(), 'filtered', filters] as const,
  
  organization: () => [...queryKeys.all, 'organization'] as const,
  orgMembers: () => [...queryKeys.organization(), 'members'] as const,
  orgSettings: () => [...queryKeys.organization(), 'settings'] as const,
  
  user: () => [...queryKeys.all, 'user'] as const,
  userSettings: () => [...queryKeys.user(), 'settings'] as const,
  userProfile: () => [...queryKeys.user(), 'profile'] as const,
  
  calendar: () => [...queryKeys.all, 'calendar'] as const,
  calendarEvents: (month: string) => [...queryKeys.calendar(), 'events', month] as const,
  
  contracts: () => [...queryKeys.all, 'contracts'] as const,
  contractsByShow: (showId: string) => [...queryKeys.contracts(), 'show', showId] as const
};

// Enhanced prefetching utilities
export const prefetchStrategies = {
  // Prefetch related shows when viewing show details
  showDetails: (queryClient: QueryClient, showId: string) => {
    // Prefetch contracts for this show
    queryClient.prefetchQuery({
      queryKey: queryKeys.contractsByShow(showId),
      staleTime: 10 * 60 * 1000 // 10 minutes
    });
    
    // Prefetch calendar events for the same month
    const showDate = new Date(); // Ideally get from show data
    const monthKey = `${showDate.getFullYear()}-${String(showDate.getMonth() + 1).padStart(2, '0')}`;
    queryClient.prefetchQuery({
      queryKey: queryKeys.calendarEvents(monthKey),
      staleTime: 5 * 60 * 1000
    });
  },
  
  // Prefetch finance data when viewing finance overview
  financeOverview: (queryClient: QueryClient) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.financeKpis(),
      staleTime: 10 * 60 * 1000
    });
  },
  
  // Prefetch user-related data on login
  userLogin: (queryClient: QueryClient) => {
    queryClient.prefetchQuery({
      queryKey: queryKeys.userSettings(),
      staleTime: 30 * 60 * 1000
    });
    
    queryClient.prefetchQuery({
      queryKey: queryKeys.orgSettings(),
      staleTime: 30 * 60 * 1000
    });
  }
};

// Background sync optimization
export function setupBackgroundSync(queryClient: QueryClient) {
  // Refetch critical data when coming back online
  window.addEventListener('online', () => {
    queryClient.refetchQueries({
      queryKey: queryKeys.shows(),
      type: 'active'
    });
    
    queryClient.refetchQueries({
      queryKey: queryKeys.finance(),
      type: 'active'
    });
  });
  
  // Intelligent background refetching based on user activity
  let lastActivity = Date.now();
  let backgroundRefetchTimer: NodeJS.Timeout;
  
  const resetActivityTimer = () => {
    lastActivity = Date.now();
    clearTimeout(backgroundRefetchTimer);
    
    // Refetch stale data after 10 minutes of inactivity
    backgroundRefetchTimer = setTimeout(() => {
      queryClient.refetchQueries({
        stale: true,
        type: 'active'
      });
    }, 10 * 60 * 1000);
  };
  
  // Track user activity
  ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
    document.addEventListener(event, resetActivityTimer, { passive: true });
  });
  
  // Initial timer
  resetActivityTimer();
  
  return () => {
    clearTimeout(backgroundRefetchTimer);
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
      document.removeEventListener(event, resetActivityTimer);
    });
  };
}

// Memory optimization utilities
export function optimizeQueryClientMemory(queryClient: QueryClient) {
  // Aggressive garbage collection for unused queries
  const intervalId = setInterval(() => {
    queryClient.getQueryCache().findAll().forEach(query => {
      const timeSinceLastAccess = Date.now() - (query.state.dataUpdatedAt || 0);
      const isStale = timeSinceLastAccess > (query.options.gcTime || 30 * 60 * 1000);
      const hasNoObservers = query.getObserversCount() === 0;
      
      if (isStale && hasNoObservers) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
  }, 5 * 60 * 1000); // Run every 5 minutes
  
  return () => clearInterval(intervalId);
}

console.log('🚀 React Query optimizations loaded');