/**
 * useContractsQuery - React Query hooks para gestión de contratos
 * Usa HybridContractService para sincronización con Firestore
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { Contract } from '../types/contract';
import { contractStore } from '../shared/contractStore';
import { HybridContractService } from '../services/hybridContractService';

// Query keys
export const contractKeys = {
  all: ['contracts'] as const,
  lists: () => [...contractKeys.all, 'list'] as const,
  details: () => [...contractKeys.all, 'detail'] as const,
  detail: (id: string) => [...contractKeys.details(), id] as const,
  byShow: (showId: string) => [...contractKeys.all, 'byShow', showId] as const,
  stats: () => [...contractKeys.all, 'stats'] as const,
};

/**
 * Hook principal para obtener todos los contratos
 */
export const useContractsQuery = () => {
  return useQuery({
    queryKey: contractKeys.lists(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return contractStore.getAll();
    },
    staleTime: 30 * 60 * 1000, // 30 minutos
    gcTime: 60 * 60 * 1000, // 60 minutos en cache
    refetchOnWindowFocus: false,
  });
};

/**
 * Hook para obtener un contrato específico
 */
export const useContractQuery = (id: string) => {
  return useQuery({
    queryKey: contractKeys.detail(id),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return contractStore.getById(id);
    },
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener contratos por show
 */
export const useContractsByShowQuery = (showId: string) => {
  return useQuery({
    queryKey: contractKeys.byShow(showId),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return contractStore.getByShowId(showId);
    },
    enabled: !!showId,
    staleTime: 5 * 60 * 1000,
  });
};

/**
 * Hook para obtener estadísticas de contratos
 */
export const useContractStatsQuery = () => {
  return useQuery({
    queryKey: contractKeys.stats(),
    queryFn: async () => {
      await new Promise(resolve => setTimeout(resolve, 50));
      return contractStore.getStats();
    },
    staleTime: 1 * 60 * 1000,
  });
};

/**
 * Mutation para crear contrato
 */
export const useCreateContractMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (contract: Contract) => {
      // Save to both localStorage and Firestore
      await HybridContractService.saveContract(contract);
      contractStore.add(contract);
      return contract;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractKeys.stats() });
    },
  });
};

/**
 * Mutation para actualizar contrato
 */
export const useUpdateContractMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<Contract> }) => {
      contractStore.update(id, updates);
      const updated = contractStore.getById(id);
      if (updated) {
        await HybridContractService.saveContract(updated);
      }
      return updated;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: contractKeys.stats() });
    },
  });
};

/**
 * Mutation para eliminar contrato
 */
export const useDeleteContractMutation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      await HybridContractService.deleteContract(id);
      contractStore.delete(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: contractKeys.lists() });
      queryClient.invalidateQueries({ queryKey: contractKeys.stats() });
    },
  });
};

/**
 * Helper para subir archivo PDF
 */
export const uploadContractPDF = async (file: File): Promise<{ fileUrl: string; fileName: string; fileSize: number }> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const result = e.target?.result;
      if (typeof result === 'string') {
        resolve({
          fileUrl: result, // Data URL (base64)
          fileName: file.name,
          fileSize: file.size,
        });
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
};
