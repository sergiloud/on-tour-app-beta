/**
 * Optimistic UI Utilities for TanStack Query
 *
 * Provides helpers for implementing optimistic updates:
 * - Instant UI feedback
 * - Automatic rollback on error
 * - Revalidation after success
 * - Conflict resolution
 */

import { type QueryClient } from '@tanstack/react-query';

/**
 * Optimistic update configuration
 */
interface OptimisticConfig<TData, TVariables> {
    queryKey: any[];
    mutationFn: (variables: TVariables) => Promise<TData>;
    updateFn: (oldData: TData | undefined, variables: TVariables) => TData;
    onError?: (error: any, variables: TVariables, context: any) => void;
    onSuccess?: (data: TData, variables: TVariables, context: any) => void;
}

/**
 * Create optimistic mutation options
 * Automatically handles rollback on error
 */
export function createOptimisticMutation<TData = any, TVariables = any>(
    queryClient: QueryClient,
    config: OptimisticConfig<TData, TVariables>
) {
    return {
        mutationFn: config.mutationFn,

        // Before mutation starts
        onMutate: async (variables: TVariables) => {
            // Cancel any outgoing refetches
            await queryClient.cancelQueries({ queryKey: config.queryKey });

            // Snapshot the previous value
            const previousData = queryClient.getQueryData<TData>(config.queryKey);

            // Optimistically update to the new value
            queryClient.setQueryData<TData>(
                config.queryKey,
                (old) => config.updateFn(old, variables)
            );

            // Return context with snapshot
            return { previousData };
        },

        // On error, rollback
        onError: (error: any, variables: TVariables, context: any) => {
            if (context?.previousData) {
                queryClient.setQueryData(config.queryKey, context.previousData);
            }

            config.onError?.(error, variables, context);
        },

        // On success or error, refetch
        onSettled: (data: TData | undefined, error: any, variables: TVariables, context: any) => {
            queryClient.invalidateQueries({ queryKey: config.queryKey });

            if (!error && data) {
                config.onSuccess?.(data, variables, context);
            }
        }
    };
}

/**
 * Optimistic list update helpers
 */
export const optimisticList = {
    /**
     * Add item to list optimistically
     */
    add<T>(list: T[] | undefined, item: T): T[] {
        return [...(list || []), item];
    },

    /**
     * Remove item from list optimistically
     */
    remove<T>(list: T[] | undefined, predicate: (item: T) => boolean): T[] {
        return (list || []).filter(item => !predicate(item));
    },

    /**
     * Update item in list optimistically
     */
    update<T>(list: T[] | undefined, predicate: (item: T) => boolean, updater: (item: T) => T): T[] {
        return (list || []).map(item =>
            predicate(item) ? updater(item) : item
        );
    },

    /**
     * Replace entire list
     */
    replace<T>(list: T[] | undefined, newList: T[]): T[] {
        return newList;
    }
};

/**
 * Optimistic object update helpers
 */
export const optimisticObject = {
    /**
     * Update object fields optimistically
     */
    update<T extends object>(obj: T | undefined, updates: Partial<T>): T {
        return { ...(obj || {} as T), ...updates };
    },

    /**
     * Toggle boolean field
     */
    toggle<T extends object>(obj: T | undefined, field: keyof T): T {
        if (!obj) return {} as T;
        return { ...obj, [field]: !obj[field] };
    },

    /**
     * Increment numeric field
     */
    increment<T extends object>(obj: T | undefined, field: keyof T, amount: number = 1): T {
        if (!obj) return {} as T;
        const currentValue = obj[field];
        if (typeof currentValue === 'number') {
            return { ...obj, [field]: currentValue + amount };
        }
        return obj;
    }
};

/**
 * Example: Optimistic show update
 */
export function createOptimisticShowUpdate(queryClient: QueryClient) {
    return createOptimisticMutation(queryClient, {
        queryKey: ['shows'],
        mutationFn: async (variables: { id: string; updates: any }) => {
            const response = await fetch(`/api/shows/${variables.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variables.updates)
            });
            return response.json();
        },
        updateFn: (oldShows: any[] = [], variables) => {
            return optimisticList.update(
                oldShows,
                (show: any) => show.id === variables.id,
                (show: any) => optimisticObject.update(show, variables.updates)
            );
        }
    });
}

/**
 * Example: Optimistic show creation
 */
export function createOptimisticShowCreate(queryClient: QueryClient) {
    return createOptimisticMutation(queryClient, {
        queryKey: ['shows'],
        mutationFn: async (variables: { show: any }) => {
            const response = await fetch('/api/shows', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(variables.show)
            });
            return response.json();
        },
        updateFn: (oldShows: any[] = [], variables) => {
            // Add temporary ID for optimistic update
            const optimisticShow = {
                ...variables.show,
                id: `temp-${Date.now()}`,
                _optimistic: true
            };
            return optimisticList.add(oldShows, optimisticShow);
        },
        onSuccess: (data, variables, context) => {
            // Replace temporary show with real one
            queryClient.setQueryData<any[]>(['shows'], (shows = []) => {
                return shows.map(show =>
                    show._optimistic ? data : show
                );
            });
        }
    });
}

/**
 * Example: Optimistic show deletion
 */
export function createOptimisticShowDelete(queryClient: QueryClient) {
    return createOptimisticMutation(queryClient, {
        queryKey: ['shows'],
        mutationFn: async (variables: { id: string }) => {
            const response = await fetch(`/api/shows/${variables.id}`, {
                method: 'DELETE'
            });
            return response.json();
        },
        updateFn: (oldShows: any[] = [], variables) => {
            return optimisticList.remove(
                oldShows,
                (show: any) => show.id === variables.id
            );
        }
    });
}

/**
 * Batch optimistic updates
 * Useful for bulk operations
 */
export async function batchOptimisticUpdates<T>(
    queryClient: QueryClient,
    queryKey: any[],
    updates: Array<{ updateFn: (data: T | undefined) => T }>
) {
    // Cancel outgoing queries
    await queryClient.cancelQueries({ queryKey });

    // Snapshot
    const previousData = queryClient.getQueryData<T>(queryKey);

    try {
        // Apply all updates
        for (const update of updates) {
            queryClient.setQueryData<T>(queryKey, update.updateFn);
        }

        return { previousData };
    } catch (error) {
        // Rollback on error
        if (previousData) {
            queryClient.setQueryData(queryKey, previousData);
        }
        throw error;
    }
}

/**
 * Optimistic update with retry
 * Automatically retries failed mutations
 */
export function createOptimisticMutationWithRetry<TData = any, TVariables = any>(
    queryClient: QueryClient,
    config: OptimisticConfig<TData, TVariables> & { retries?: number }
) {
    const baseConfig = createOptimisticMutation(queryClient, config);

    return {
        ...baseConfig,
        retry: config.retries || 3,
        retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000)
    };
}

/**
 * Optimistic update status indicator
 * Track pending optimistic updates
 */
export class OptimisticUpdateTracker {
    private pending = new Set<string>();
    private callbacks: Array<(count: number) => void> = [];

    add(id: string) {
        this.pending.add(id);
        this.notify();
    }

    remove(id: string) {
        this.pending.delete(id);
        this.notify();
    }

    has(id: string): boolean {
        return this.pending.has(id);
    }

    get count(): number {
        return this.pending.size;
    }

    get hasPending(): boolean {
        return this.pending.size > 0;
    }

    subscribe(callback: (count: number) => void) {
        this.callbacks.push(callback);
        return () => {
            this.callbacks = this.callbacks.filter(cb => cb !== callback);
        };
    }

    private notify() {
        this.callbacks.forEach(cb => cb(this.pending.size));
    }

    clear() {
        this.pending.clear();
        this.notify();
    }
}

// Singleton tracker
export const optimisticTracker = new OptimisticUpdateTracker();
