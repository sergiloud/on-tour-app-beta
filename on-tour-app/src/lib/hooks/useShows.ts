/**
 * React Query Hooks for Shows API
 * Integración con React Query para manejo de estado y caché
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { showsService, type Show, type ShowFilters, type ShowStats } from '@/lib/api/services/shows';

// Query keys factory
export const showsQueryKeys = {
  all: ['shows'] as const,
  lists: () => [...showsQueryKeys.all, 'list'] as const,
  list: (filters?: ShowFilters) => [...showsQueryKeys.lists(), { ...filters }] as const,
  details: () => [...showsQueryKeys.all, 'detail'] as const,
  detail: (id: string) => [...showsQueryKeys.details(), id] as const,
  stats: () => [...showsQueryKeys.all, 'stats'] as const,
  stat: (id: string) => [...showsQueryKeys.stats(), id] as const,
  related: (id: string) => [...showsQueryKeys.all, 'related', id] as const,
  search: (query: string, type?: string) => [...showsQueryKeys.all, 'search', { query, type }] as const
};

/**
 * Hook para obtener lista de shows
 */
export function useShows(filters?: ShowFilters) {
  return useQuery({
    queryKey: showsQueryKeys.list(filters),
    queryFn: async () => {
      const response = await showsService.getShows(filters);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to fetch shows');
      }
      return response.data;
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });
}

/**
 * Hook para obtener un show específico
 */
export function useShow(id: string, enabled = true) {
  return useQuery({
    queryKey: showsQueryKeys.detail(id),
    queryFn: async () => {
      const response = await showsService.getShow(id);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to fetch show');
      }
      return response.data;
    },
    enabled: !!id && enabled,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1
  });
}

/**
 * Hook para obtener estadísticas de un show
 */
export function useShowStats(id: string, enabled = true) {
  return useQuery({
    queryKey: showsQueryKeys.stat(id),
    queryFn: async () => {
      const response = await showsService.getShowStats(id);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to fetch show stats');
      }
      return response.data;
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });
}

/**
 * Hook para búsqueda de shows
 */
export function useSearchShows(query: string, type?: string, enabled = true) {
  return useQuery({
    queryKey: showsQueryKeys.search(query, type),
    queryFn: async () => {
      const response = await showsService.searchShows(query, type);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to search shows');
      }
      return response.data;
    },
    enabled: !!query && enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });
}

/**
 * Hook para obtener shows relacionados
 */
export function useRelatedShows(id: string, enabled = true) {
  return useQuery({
    queryKey: showsQueryKeys.related(id),
    queryFn: async () => {
      const response = await showsService.getRelatedShows(id);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to fetch related shows');
      }
      return response.data;
    },
    enabled: !!id && enabled,
    staleTime: 5 * 60 * 1000,
    retry: 1
  });
}

/**
 * Hook para crear un show
 */
export function useCreateShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<Show, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await showsService.createShow(data);
      if (response.statusCode !== 201) {
        throw new Error(response.error || 'Failed to create show');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate shows list to refetch
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.lists() });
    }
  });
}

/**
 * Hook para actualizar un show
 */
export function useUpdateShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Show> }) => {
      const response = await showsService.updateShow(id, data);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to update show');
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data) {
        // Update specific show cache
        queryClient.setQueryData(showsQueryKeys.detail(data.id), data);
      }
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.lists() });
    }
  });
}

/**
 * Hook para eliminar un show
 */
export function useDeleteShow() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await showsService.deleteShow(id);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to delete show');
      }
      return response.data;
    },
    onSuccess: (_, id) => {
      // Remove from cache
      queryClient.removeQueries({ queryKey: showsQueryKeys.detail(id) });
      // Invalidate lists
      queryClient.invalidateQueries({ queryKey: showsQueryKeys.lists() });
    }
  });
}
