/**
 * Advanced React Query Optimizations
 * 
 * Enhanced hooks and utilities for better data fetching performance,
 * background synchronization, and intelligent caching strategies.
 */

import { useQuery, useQueryClient, useMutation, type UseQueryOptions, type UseMutationOptions } from '@tanstack/react-query';
import { useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { logger } from './logger';

/**
 * Enhanced useQuery hook with intelligent stale time based on data type
 */
export function useEnhancedQuery<TData = unknown, TError = Error>(
  queryKey: readonly unknown[],
  queryFn: () => Promise<TData>,
  options?: Omit<UseQueryOptions<TData, TError>, 'queryKey' | 'queryFn'> & {
    dataType?: 'static' | 'dynamic' | 'realtime';
    backgroundSync?: boolean;
    optimistic?: boolean;
  }
) {
  const { dataType = 'dynamic', backgroundSync = true, optimistic = false, ...queryOptions } = options || {};
  
  // Intelligent stale time based on data type
  const staleTime = dataType === 'static' 
    ? 60 * 60 * 1000    // 1 hour for static data (venues, users)
    : dataType === 'realtime' 
    ? 30 * 1000         // 30 seconds for realtime data (finance)
    : 5 * 60 * 1000;    // 5 minutes for dynamic data (shows, contacts)
  
  return useQuery({
    queryKey,
    queryFn,
    staleTime,
    refetchInterval: backgroundSync && dataType === 'realtime' ? 30000 : undefined,
    ...queryOptions,
  });
}

/**
 * Advanced optimistic mutation hook with rollback and sync
 */
export function useOptimisticMutation<TData = unknown, TError = Error, TVariables = void>(
  mutationFn: (variables: TVariables) => Promise<TData>,
  options: {
    queryKey: readonly unknown[];
    updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
    successMessage?: string;
    errorMessage?: string;
    onSuccess?: (data: TData, variables: TVariables) => void;
    onError?: (error: TError, variables: TVariables) => void;
  }
) {
  const queryClient = useQueryClient();
  const { queryKey, updateFn, successMessage, errorMessage, onSuccess, onError } = options;

  return useMutation({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey });
      
      // Snapshot the previous value
      const previousData = queryClient.getQueryData(queryKey);
      
      // Optimistically update the cache
      const optimisticData = updateFn(previousData as TData | undefined, variables);
      queryClient.setQueryData(queryKey, optimisticData);
      
      return { previousData };
    },
    onError: (error, variables, context) => {
      // Rollback to previous data on error
      if (context?.previousData !== undefined) {
        queryClient.setQueryData(queryKey, context.previousData);
      }
      
      // Show error message
      if (errorMessage) {
        toast.error(errorMessage);
      }
      
      // Call custom error handler
      onError?.(error as TError, variables);
      
      logger.error('Optimistic mutation failed');
    },
    onSuccess: (data, variables) => {
      // Show success message
      if (successMessage) {
        toast.success(successMessage);
      }
      
      // Call custom success handler
      onSuccess?.(data, variables);
    },
    onSettled: () => {
      // Refetch to ensure data consistency
      queryClient.invalidateQueries({ queryKey });
    },
  });
}

/**
 * Background sync hook for real-time data updates
 */
export function useBackgroundSync(
  queryKeys: (readonly unknown[])[],
  interval = 30000,
  enabled = true
) {
  const queryClient = useQueryClient();
  const intervalRef = useRef<NodeJS.Timeout | undefined>(undefined);

  const sync = useCallback(async () => {
    if (!enabled) return;
    
    try {
      await Promise.all(
        queryKeys.map(queryKey => 
          queryClient.invalidateQueries({ queryKey, refetchType: 'active' })
        )
      );
      logger.debug('Background sync completed');
    } catch (error) {
      logger.warn('Background sync failed');
    }
  }, [queryClient, queryKeys, enabled]);

  useEffect(() => {
    if (!enabled) return;

    // Initial sync
    sync();
    
    // Set up interval
    intervalRef.current = setInterval(sync, interval);
    
    // Sync on visibility change
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        sync();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [sync, interval, enabled]);

  return { sync };
}

/**
 * Query prefetch hook for performance optimization
 */
export function useQueryPrefetch() {
  const queryClient = useQueryClient();

  const prefetch = useCallback(async (
    queryKey: readonly unknown[],
    queryFn: () => Promise<unknown>,
    options?: { staleTime?: number }
  ) => {
    try {
      await queryClient.prefetchQuery({
        queryKey,
        queryFn,
        staleTime: options?.staleTime ?? 5 * 60 * 1000,
      });
    } catch (error) {
      logger.debug('Prefetch failed');
    }
  }, [queryClient]);

  const prefetchOnHover = useCallback((
    queryKey: readonly unknown[],
    queryFn: () => Promise<unknown>
  ) => {
    return {
      onMouseEnter: () => prefetch(queryKey, queryFn),
      onFocus: () => prefetch(queryKey, queryFn),
    };
  }, [prefetch]);

  return { prefetch, prefetchOnHover };
}

/**
 * Smart cache management hook
 */
export function useCacheManager() {
  const queryClient = useQueryClient();

  const cleanupStaleQueries = useCallback((maxAge = 30 * 60 * 1000) => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    queries.forEach(query => {
      if (query.state.dataUpdatedAt < Date.now() - maxAge) {
        queryClient.removeQueries({ queryKey: query.queryKey });
      }
    });
    
    logger.debug('Cache cleanup completed');
  }, [queryClient]);

  const getCacheStats = useCallback(() => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    return {
      totalQueries: queries.length,
      staleQueries: queries.filter(q => q.isStale()).length,
      errorQueries: queries.filter(q => q.state.status === 'error').length,
      loadingQueries: queries.filter(q => q.state.status === 'pending').length,
      cacheSize: JSON.stringify(queries.map(q => q.state.data)).length,
    };
  }, [queryClient]);

  const invalidateExpiredQueries = useCallback((maxStaleTime = 10 * 60 * 1000) => {
    const queryCache = queryClient.getQueryCache();
    const queries = queryCache.getAll();
    
    queries.forEach(query => {
      if (query.isStale() && query.state.dataUpdatedAt < Date.now() - maxStaleTime) {
        queryClient.invalidateQueries({ queryKey: query.queryKey });
      }
    });
  }, [queryClient]);

  return {
    cleanupStaleQueries,
    getCacheStats,
    invalidateExpiredQueries,
  };
}

/**
 * Query deduplication hook
 */
export function useQueryDeduplication() {
  const pendingQueries = useRef(new Map<string, Promise<any>>());

  const deduplicate = useCallback(async <T>(
    queryKey: readonly unknown[],
    queryFn: () => Promise<T>
  ): Promise<T> => {
    const key = JSON.stringify(queryKey);
    
    // Return existing promise if query is already pending
    if (pendingQueries.current.has(key)) {
      return pendingQueries.current.get(key)!;
    }

    // Create new promise and store it
    const promise = queryFn();
    pendingQueries.current.set(key, promise);

    try {
      const result = await promise;
      pendingQueries.current.delete(key);
      return result;
    } catch (error) {
      pendingQueries.current.delete(key);
      throw error;
    }
  }, []);

  return { deduplicate };
}