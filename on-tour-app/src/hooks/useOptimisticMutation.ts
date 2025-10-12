/**
 * useOptimisticMutation Hook
 *
 * React hook for mutations with optimistic updates
 * Provides instant UI feedback with automatic rollback on error
 */

import { useMutation, useQueryClient, type UseMutationOptions } from '@tanstack/react-query';
import { createOptimisticMutation, optimisticTracker } from '../lib/optimisticUpdates';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';

interface OptimisticMutationConfig<TData, TVariables> {
    queryKey: any[];
    mutationFn: (variables: TVariables) => Promise<TData>;
    updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
    successMessage?: string | ((data: TData) => string);
    errorMessage?: string | ((error: any) => string);
    trackOptimistic?: boolean;
    showToast?: boolean;
}

/**
 * Hook for optimistic mutations with automatic UI feedback
 */
export function useOptimisticMutation<TData = any, TVariables = any>(
    config: OptimisticMutationConfig<TData, TVariables>
) {
    const queryClient = useQueryClient();
    const [optimisticId] = useState(() => `optimistic-${Date.now()}-${Math.random()}`);

    const mutation = useMutation({
        ...createOptimisticMutation(queryClient, {
            queryKey: config.queryKey,
            mutationFn: config.mutationFn,
            updateFn: config.updateFn,
            onSuccess: (data, variables, context) => {
                // Remove from tracker
                if (config.trackOptimistic) {
                    optimisticTracker.remove(optimisticId);
                }

                // Show success toast
                if (config.showToast !== false) {
                    const message = typeof config.successMessage === 'function'
                        ? config.successMessage(data)
                        : config.successMessage || 'Updated successfully';
                    toast.success(message);
                }
            },
            onError: (error, variables, context) => {
                // Remove from tracker
                if (config.trackOptimistic) {
                    optimisticTracker.remove(optimisticId);
                }

                // Show error toast
                if (config.showToast !== false) {
                    const message = typeof config.errorMessage === 'function'
                        ? config.errorMessage(error)
                        : config.errorMessage || 'Update failed';
                    toast.error(message);
                }
            }
        })
    });

    // Wrap mutate to add to tracker
    const mutate = useCallback((variables: TVariables, options?: any) => {
        if (config.trackOptimistic) {
            optimisticTracker.add(optimisticId);
        }
        mutation.mutate(variables, options);
    }, [mutation, optimisticId, config.trackOptimistic]);

    const mutateAsync = useCallback(async (variables: TVariables, options?: any) => {
        if (config.trackOptimistic) {
            optimisticTracker.add(optimisticId);
        }
        return mutation.mutateAsync(variables, options);
    }, [mutation, optimisticId, config.trackOptimistic]);

    return {
        ...mutation,
        mutate,
        mutateAsync
    };
}

/**
 * Hook to show optimistic update indicator
 */
export function useOptimisticIndicator() {
    const [pendingCount, setPendingCount] = useState(optimisticTracker.count);

    useEffect(() => {
        return optimisticTracker.subscribe(setPendingCount);
    }, []);

    return {
        hasPending: pendingCount > 0,
        pendingCount
    };
}

/**
 * Pre-configured hooks for common operations
 */

// Shows
export function useOptimisticShowUpdate() {
    return useOptimisticMutation({
        queryKey: ['shows'],
        mutationFn: async (variables: { id: string; updates: any }) => {
            const response = await fetch(`/api/shows/${variables.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variables.updates)
            });
            if (!response.ok) throw new Error('Failed to update show');
            return response.json();
        },
        updateFn: (shows: any[] = [], variables) => {
            return shows.map(show =>
                show.id === variables.id ? { ...show, ...variables.updates } : show
            );
        },
        successMessage: 'Show updated',
        errorMessage: 'Failed to update show',
        trackOptimistic: true
    });
}

export function useOptimisticShowCreate() {
    return useOptimisticMutation({
        queryKey: ['shows'],
        mutationFn: async (variables: { show: any }) => {
            const response = await fetch('/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variables.show)
            });
            if (!response.ok) throw new Error('Failed to create show');
            return response.json();
        },
        updateFn: (shows: any[] = [], variables) => {
            const optimisticShow = {
                ...variables.show,
                id: `temp-${Date.now()}`,
                _optimistic: true
            };
            return [...shows, optimisticShow];
        },
        successMessage: 'Show created',
        errorMessage: 'Failed to create show',
        trackOptimistic: true
    });
}

export function useOptimisticShowDelete() {
    return useOptimisticMutation({
        queryKey: ['shows'],
        mutationFn: async (variables: { id: string }) => {
            const response = await fetch(`/api/shows/${variables.id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete show');
            return response.json();
        },
        updateFn: (shows: any[] = [], variables) => {
            return shows.filter(show => show.id !== variables.id);
        },
        successMessage: 'Show deleted',
        errorMessage: 'Failed to delete show',
        trackOptimistic: true
    });
}

// Finance
export function useOptimisticFinanceUpdate() {
    return useOptimisticMutation({
        queryKey: ['finance'],
        mutationFn: async (variables: { id: string; updates: any }) => {
            const response = await fetch(`/api/finance/${variables.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variables.updates)
            });
            if (!response.ok) throw new Error('Failed to update finance data');
            return response.json();
        },
        updateFn: (data: any, variables) => {
            return { ...data, ...variables.updates };
        },
        successMessage: 'Finance data updated',
        errorMessage: 'Failed to update finance data',
        trackOptimistic: true
    });
}

// Travel
export function useOptimisticTravelUpdate() {
    return useOptimisticMutation({
        queryKey: ['travel'],
        mutationFn: async (variables: { id: string; updates: any }) => {
            const response = await fetch(`/api/travel/${variables.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variables.updates)
            });
            if (!response.ok) throw new Error('Failed to update travel data');
            return response.json();
        },
        updateFn: (data: any, variables) => {
            return { ...data, ...variables.updates };
        },
        successMessage: 'Travel data updated',
        errorMessage: 'Failed to update travel data',
        trackOptimistic: true
    });
}
