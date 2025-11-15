/**
 * useVenuesQuery - React Query hooks para gestión de venues
 * Patrón similar a useContactsQuery
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Venue } from '../types/venue';
import { venueStore } from '../shared/venueStore';

// Query keys
export const venueKeys = {
  all: ['venues'] as const,
  lists: () => [...venueKeys.all, 'list'] as const,
  details: () => [...venueKeys.all, 'detail'] as const,
  detail: (id: string) => [...venueKeys.details(), id] as const,
};

/**
 * Hook principal para obtener todos los venues
 */
export const useVenuesQuery = () => {
  return useQuery({
    queryKey: venueKeys.lists(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return venueStore.getAll();
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 60 minutos en cache
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener un venue específico
 */
export const useVenueQuery = (id: string) => {
  return useQuery({
    queryKey: venueKeys.detail(id),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return venueStore.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Mutation para crear venue
 */
export const useCreateVenueMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (venue: Venue) => {
      venueStore.add(venue);
      return venue;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};

/**
 * Mutation para actualizar venue
 */
export const useUpdateVenueMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Venue> }) => {
      venueStore.update(id, updates);
      return venueStore.getById(id);
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
      queryClient.invalidateQueries({ queryKey: venueKeys.detail(variables.id) });
    },
  });
};

/**
 * Mutation para eliminar venue
 */
export const useDeleteVenueMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      venueStore.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: venueKeys.lists() });
    },
  });
};
