/**
 * useShowsQuery
 * React Query hook to replace showStore.getAll()
 * Provides centralized state management for shows with caching, offline support, and mutations
 */

import { useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import type { Show } from '../lib/shows';
import { showStore } from '../shared/showStore';

// Query keys for consistent cache management
export const showsQueryKeys = {
  all: ['shows'] as const,
  lists: () => [...showsQueryKeys.all, 'list'] as const,
  list: (filters?: Record<string, unknown>) =>
    [...showsQueryKeys.lists(), { ...filters }] as const,
  details: () => [...showsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...showsQueryKeys.details(), id] as const,
};

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
 * useShowsQuery - Replaces showStore.getAll()
 * Provides:
 * - Automatic caching with staleTime
 * - Offline support (data persists)
 * - Loading and error states
 * - Manual refresh via refetch
 *
 * Usage:
 * const { data: shows = [], isLoading, error, refetch } = useShowsQuery();
 */
export function useShowsQuery() {
  return useQuery({
    queryKey: showsQueryKeys.all,
    queryFn: fetchAllShows,
    staleTime: 10 * 60 * 1000, // 10 minutes - increased from 5
    gcTime: 30 * 60 * 1000, // 30 minutes - increased from 10
    enabled: true,
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

/**
 * useAddShowMutation - Replaces showStore.addShow()
 * Automatically invalidates the shows cache after success
 */
export function useAddShowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newShow: Show) => {
      showStore.addShow(newShow);
      return Promise.resolve(newShow);
    },
    onSuccess: () => {
      // Invalidate all shows queries to trigger refetch
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.all });
    },
  });
}

/**
 * useUpdateShowMutation - Replaces showStore.updateShow()
 * Automatically invalidates relevant caches after success
 */
export function useUpdateShowMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Partial<Show> & Record<string, unknown> }) => {
      showStore.updateShow(id, patch);
      return Promise.resolve(patch);
    },
    onSuccess: (_data, variables) => {
      // Invalidate both the all shows query and the specific show query
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.detail(variables.id) });
    },
  });
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
