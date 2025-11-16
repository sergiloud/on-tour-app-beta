/**
 * useShowsQuery - Professional React Query Integration
 * 
 * Enhanced shows query hook with performance monitoring and optimistic updates.
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { Show } from '../lib/shows';
import { showStore } from '../shared/showStore';
import { performanceTracker, backgroundSyncQueue } from '../lib/react-query-advanced';
import { logger } from '../lib/logger';
import { toast } from 'sonner';

// ============================================================================
// QUERY KEYS
// ============================================================================

export const showsQueryKeys = {
  all: ['shows'] as const,
  lists: () => [...showsQueryKeys.all, 'list'] as const,
  list: (filters: string) => [...showsQueryKeys.lists(), { filters }] as const,
  details: () => [...showsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...showsQueryKeys.details(), id] as const,
};

// ============================================================================
// QUERY FUNCTIONS
// ============================================================================

/**
 * Fetch all shows with performance tracking
 */
async function fetchAllShows(): Promise<Show[]> {
  const startTime = performance.now();
  try {
    const shows = showStore.getAll();
    const duration = performance.now() - startTime;
    performanceTracker.track(showsQueryKeys.lists(), duration);
    logger.debug(`Fetched ${shows.length} shows in ${duration}ms`);
    return shows;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceTracker.track(showsQueryKeys.lists(), duration);
    logger.error('Failed to fetch shows', error as Error);
    throw error;
  }
}

/**
 * Fetch single show by ID with performance tracking
 */
async function fetchShowById(id: string): Promise<Show | undefined> {
  const startTime = performance.now();
  try {
    const show = showStore.getById(id);
    const duration = performance.now() - startTime;
    performanceTracker.track(showsQueryKeys.detail(id), duration);
    logger.debug(`Fetched show ${id} in ${duration}ms`);
    return show;
  } catch (error) {
    const duration = performance.now() - startTime;
    performanceTracker.track(showsQueryKeys.detail(id), duration);
    logger.error(`Failed to fetch show ${id}`, error as Error);
    throw error;
  }
}

// ============================================================================
// QUERY HOOKS
// ============================================================================

/**
 * Professional useShowsQuery with advanced React Query optimizations
 */
export function useShowsQuery() {
  return useQuery({
    queryKey: showsQueryKeys.lists(),
    queryFn: fetchAllShows,
    staleTime: 5 * 60 * 1000, // 5 minutes - shows don't change frequently
    gcTime: 30 * 60 * 1000, // 30 minutes in cache
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: (failureCount, error) => {
      // Don't retry validation errors
      if (error instanceof Error && error.message.includes('validation')) {
        return false;
      }
      return failureCount < 2;
    },
    meta: {
      errorMessage: 'Failed to load shows'
    }
  });
}

/**
 * useShowQuery - Fetch a single show by ID
 * Replaces showStore.getById(id)
 */
export function useShowQuery(id: string | undefined) {
  return useQuery({
    queryKey: id ? showsQueryKeys.detail(id) : showsQueryKeys.all,
    queryFn: () => (id ? fetchShowById(id) : Promise.resolve(undefined)),
    staleTime: 10 * 60 * 1000, // 10 minutes - increased from 5
    gcTime: 30 * 60 * 1000, // 30 minutes - increased from 10
    enabled: !!id,
  });
}

// ============================================================================
// MUTATION HOOKS
// ============================================================================

/**
 * Professional add show mutation with optimistic updates
 */
export function useAddShowMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newShow: Omit<Show, 'id'>): Promise<Show> => {
      // Queue for background sync if offline
      if (!navigator.onLine) {
        const syncId = backgroundSyncQueue.enqueue({
          url: '/api/shows',
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: newShow
        });
        logger.info(`Queued show creation for background sync: ${syncId}`);
      }
      
      const showWithId: Show = {
        ...newShow,
        id: `show_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      showStore.addShow(showWithId);
      return showWithId;
    },
    onMutate: async (newShow) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: showsQueryKeys.lists() });
      
      // Snapshot previous value
      const previousShows = queryClient.getQueryData(showsQueryKeys.lists());
      
      // Optimistically update
      const optimisticShow: Show = {
        ...newShow,
        id: `temp_${Date.now()}`,
      };
      
      queryClient.setQueryData(showsQueryKeys.lists(), (old: Show[] = []) => [
        ...old,
        optimisticShow
      ]);
      
      return { previousShows, optimisticShow };
    },
    onError: (error, newShow, context) => {
      // Rollback on error
      if (context?.previousShows) {
        queryClient.setQueryData(showsQueryKeys.lists(), context.previousShows);
      }
      logger.error('Add show mutation failed', error as Error);
      toast.error('Failed to add show');
    },
    onSuccess: (addedShow, newShow, context) => {
      // Replace optimistic update with real data
      queryClient.setQueryData(showsQueryKeys.lists(), (old: Show[] = []) =>
        old.map(show => 
          show.id === context?.optimisticShow.id ? addedShow : show
        )
      );
      toast.success('Show added successfully');
      logger.info(`Show added: ${addedShow.id}`);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.all });
    }
  });
}

/**
 * Professional update show mutation with optimistic updates
 */
export function useUpdateShowMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      id, 
      updates 
    }: { 
      id: string; 
      updates: Partial<Show>; 
    }): Promise<Show> => {
      // Queue for background sync if offline
      if (!navigator.onLine) {
        const syncId = backgroundSyncQueue.enqueue({
          url: `/api/shows/${id}`,
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: updates
        });
        logger.info(`Queued show update for background sync: ${syncId}`);
      }
      
      showStore.updateShow(id, updates);
      const updatedShow = showStore.getById(id);
      if (!updatedShow) throw new Error(`Show ${id} not found after update`);
      return updatedShow;
    },
    onMutate: async ({ id, updates }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: showsQueryKeys.lists() });
      await queryClient.cancelQueries({ queryKey: showsQueryKeys.detail(id) });
      
      // Snapshot previous values
      const previousShows = queryClient.getQueryData(showsQueryKeys.lists());
      const previousShow = queryClient.getQueryData(showsQueryKeys.detail(id));
      
      // Optimistically update list
      queryClient.setQueryData(showsQueryKeys.lists(), (old: Show[] = []) =>
        old.map(show => 
          show.id === id ? { ...show, ...updates } : show
        )
      );
      
      // Optimistically update individual show
      if (previousShow) {
        queryClient.setQueryData(showsQueryKeys.detail(id), (old: Show) => ({
          ...old,
          ...updates
        }));
      }
      
      return { previousShows, previousShow, id };
    },
    onError: (error, { id }, context) => {
      // Rollback on error
      if (context?.previousShows) {
        queryClient.setQueryData(showsQueryKeys.lists(), context.previousShows);
      }
      if (context?.previousShow) {
        queryClient.setQueryData(showsQueryKeys.detail(id), context.previousShow);
      }
      logger.error(`Update show mutation failed: ${id}`, error as Error);
      toast.error('Failed to update show');
    },
    onSuccess: (updatedShow, { id }) => {
      // Update with real data
      queryClient.setQueryData(showsQueryKeys.lists(), (old: Show[] = []) =>
        old.map(show => show.id === id ? updatedShow : show)
      );
      queryClient.setQueryData(showsQueryKeys.detail(id), updatedShow);
      toast.success('Show updated successfully');
      logger.info(`Show updated: ${id}`);
    },
    onSettled: (data, error, { id }) => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.detail(id) });
    }
  });
}

/**
 * Professional remove show mutation with optimistic updates
 */
export function useRemoveShowMutation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string): Promise<void> => {
      // Queue for background sync if offline
      if (!navigator.onLine) {
        const syncId = backgroundSyncQueue.enqueue({
          url: `/api/shows/${id}`,
          method: 'DELETE'
        });
        logger.info(`Queued show deletion for background sync: ${syncId}`);
        return;
      }
      
      await showStore.removeShow(id);
    },
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: showsQueryKeys.lists() });
      
      // Snapshot previous value
      const previousShows = queryClient.getQueryData(showsQueryKeys.lists());
      
      // Optimistically remove
      queryClient.setQueryData(showsQueryKeys.lists(), (old: Show[] = []) =>
        old.filter(show => show.id !== id)
      );
      
      return { previousShows, removedId: id };
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousShows) {
        queryClient.setQueryData(showsQueryKeys.lists(), context.previousShows);
      }
      logger.error(`Remove show mutation failed: ${id}`, error as Error);
      toast.error('Failed to remove show');
    },
    onSuccess: (data, id) => {
      toast.success('Show removed successfully');
      logger.info(`Show removed: ${id}`);
    },
    onSettled: () => {
      // Refetch to ensure consistency
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.all });
    }
  });
}

/**
 * useSetAllShowsMutation - Replaces showStore.setAll()
 * Replaces entire shows array (useful for bulk operations)
 */
export function useSetAllShowsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (shows: Show[]) => {
      showStore.setAll(shows);
      return Promise.resolve(shows);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.all });
    },
  });
}

// ============================================================================
// EXPORTS AND UTILITIES
// ============================================================================

/**
 * Export query functions for direct use
 */
export {
  fetchAllShows,
  fetchShowById,
};

/**
 * Prefetch shows for performance optimization
 */
export function prefetchShows(client: ReturnType<typeof useQueryClient>) {
  return client.prefetchQuery({
    queryKey: showsQueryKeys.lists(),
    queryFn: fetchAllShows,
    staleTime: 5 * 60 * 1000,
  });
}

/**
 * Invalidate all show queries (useful for manual refresh)
 */
export function invalidateShowsQueries(client: ReturnType<typeof useQueryClient>) {
  return client.invalidateQueries({ queryKey: showsQueryKeys.all });
}
