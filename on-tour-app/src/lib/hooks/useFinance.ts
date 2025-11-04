/**
 * React Query Hooks for Finance API
 * Integración con React Query para manejo de financias
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { financeService, type FinanceRecord, type FinanceReport } from '@/lib/api/services/finance';

// Query keys factory
export const financeQueryKeys = {
  all: ['finance'] as const,
  records: () => [...financeQueryKeys.all, 'records'] as const,
  record: (showId: string, filters?: any) => [...financeQueryKeys.records(), { showId, ...filters }] as const,
  reports: () => [...financeQueryKeys.all, 'reports'] as const,
  report: (showId: string) => [...financeQueryKeys.reports(), showId] as const,
  settlements: () => [...financeQueryKeys.all, 'settlements'] as const
};

/**
 * Hook para obtener registros financieros
 */
export function useFinanceRecords(showId: string, filters?: any) {
  return useQuery({
    queryKey: financeQueryKeys.record(showId, filters),
    queryFn: async () => {
      const response = await financeService.getRecords(showId, filters);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to fetch finance records');
      }
      return response.data || [];
    },
    enabled: !!showId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    retry: 1
  });
}

/**
 * Hook para obtener reporte financiero
 */
export function useFinanceReport(showId: string) {
  return useQuery({
    queryKey: financeQueryKeys.report(showId),
    queryFn: async () => {
      const response = await financeService.getReport(showId);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to fetch finance report');
      }
      return response.data;
    },
    enabled: !!showId,
    staleTime: 10 * 60 * 1000, // 10 minutos
    retry: 1
  });
}

/**
 * Hook para crear registro financiero
 */
export function useCreateFinanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: Omit<FinanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
      const response = await financeService.createRecord(data);
      if (response.statusCode !== 201) {
        throw new Error(response.error || 'Failed to create finance record');
      }
      return response.data;
    },
    onSuccess: (data) => {
      if (data?.showId) {
        // Invalidate records for this show
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.records()
        });
        // Invalidate report for this show
        queryClient.invalidateQueries({
          queryKey: financeQueryKeys.report(data.showId)
        });
      }
    }
  });
}

/**
 * Hook para aprobar registro financiero
 */
export function useApproveFinanceRecord() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (recordId: string) => {
      const response = await financeService.approveRecord(recordId);
      if (response.statusCode !== 200) {
        throw new Error(response.error || 'Failed to approve finance record');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all finance queries
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all });
    }
  });
}

/**
 * Hook para crear settlement
 */
export function useCreateSettlement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: any) => {
      const response = await financeService.createSettlement(data);
      if (response.statusCode !== 201) {
        throw new Error(response.error || 'Failed to create settlement');
      }
      return response.data;
    },
    onSuccess: () => {
      // Invalidate all finance queries
      queryClient.invalidateQueries({ queryKey: financeQueryKeys.all });
    }
  });
}
