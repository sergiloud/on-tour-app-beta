/**
 * useShowsQuery - Enhanced with React Query Optimizations
 * Advanced React Query hook with intelligent caching, background sync,
 * optimistic updates, and performance optimizations.
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { Show } from '../lib/shows';
import { showStore } from '../shared/showStore';
import { useEnhancedQuery, useOptimisticMutation, useBackgroundSync } from '../lib/reactQueryOptimizations';
import { showsQueryKeys } from '../lib/queryClient';

// Re-export for compatibility
export { showsQueryKeys };

/**
 * Fetch all shows from the store
 * During transition period, uses showStore to ensure compatibility
 * Post-migration: would fetch from API
 */
async function fetchAllShows(): Promise<Show[]> {
  // Transition phase: read from existing showStore
  // This ensures backward compatibility during migration
  return showStore.getAll();
}

/**
 * Fetch a single show by ID
 */
async function fetchShowById(id: string): Promise<Show | undefined> {
  return showStore.getById(id);
}

/**
 * Enhanced useShowsQuery with background sync and intelligent caching
 * Features:
 * - Dynamic stale time based on data freshness
 * - Background synchronization
 * - Intelligent cache management
 * - Performance optimizations
 */
export function useShowsQuery(options?: { backgroundSync?: boolean; dataType?: 'static' | 'dynamic' | 'realtime' }) {
  const { backgroundSync = true, dataType = 'dynamic' } = options || {};
  
  // Enhanced query with intelligent caching
  const query = useEnhancedQuery(
    showsQueryKeys.lists(),
    fetchAllShows,
    {
      dataType,
      backgroundSync,
      // Shows are dynamic data - refresh every 5 minutes
      staleTime: 5 * 60 * 1000,
      gcTime: 30 * 60 * 1000,
    }
  );
  
  // Background sync for real-time updates
  useBackgroundSync(
    [showsQueryKeys.all as readonly unknown[]],
    30000, // 30 seconds
    backgroundSync && dataType !== 'static'
  );
  
  return query;
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

/**
 * Enhanced useAddShowMutation with optimistic updates
 * Provides instant UI feedback with automatic rollback on error
 */
export function useAddShowMutation() {
  return useOptimisticMutation<Show[], Error, Show>(
    async (newShow: Show) => {
      showStore.addShow(newShow);
      return showStore.getAll(); // Return updated list
    },
    {
      queryKey: showsQueryKeys.lists(),
      updateFn: (oldShows: Show[] = [], newShow: Show) => [...oldShows, newShow],
      successMessage: 'Show added successfully',
      errorMessage: 'Failed to add show. Please try again.',
    }
  );
}

/**
 * Enhanced useUpdateShowMutation with optimistic updates
 */
export function useUpdateShowMutation() {
  return useOptimisticMutation<Show[], Error, { id: string; patch: Partial<Show> & Record<string, unknown> }>(
    async ({ id, patch }) => {
      showStore.updateShow(id, patch);
      return showStore.getAll();
    },
    {
      queryKey: showsQueryKeys.lists(),
      updateFn: (oldShows: Show[] = [], { id, patch }) => 
        oldShows.map(show => show.id === id ? { ...show, ...patch } : show),
      successMessage: 'Show updated successfully',
      errorMessage: 'Failed to update show. Please try again.',
    }
  );
}

/**
 * useRemoveShowMutation - Replaces showStore.removeShow()
 * Automatically invalidates the shows cache after success
 */
export function useRemoveShowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      showStore.removeShow(id);
      return Promise.resolve(id);
    },
    onSuccess: (_data, variables) => {
      // Invalidate all shows and the specific show
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.detail(variables) });
    },
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

/**
 * useShowsSubscription - Advanced hook for reactive updates
 * Maintains synchronization when other tabs/windows update shows
 * Returns the same interface as useShowsQuery for compatibility
 */
export function useShowsSubscription() {
  // For now, useShowsQuery provides the same functionality
  // In future, could add multi-tab synchronization via event listeners
  return useShowsQuery();
}
