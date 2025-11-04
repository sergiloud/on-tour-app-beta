import { showStore } from '../shared/showStore';
import { offlineManager } from '../lib/offlineManager';
import type { Show } from '../lib/shows';

/**
 * REFINE-003: Simplified Shows Mutations with Offline Support
 *
 * Refactored from 282 lines to 50+ lines by:
 * - Removing React Query mutations (delegated to components/contexts)
 * - Focusing on showStore + offline manager integration
 * - Providing simple convenience methods for CRUD + offline operations
 *
 * Usage:
 * const { add, update, remove, syncQueuedOperations } = useShowsMutations();
 * await add(newShow);
 * await update(id, { status: 'confirmed' });
 * await remove(id);
 */

export interface UseShowsMutationsReturn {
  add: (show: Show) => Promise<Show>;
  update: (id: string, patch: Partial<Show>) => Promise<Show>;
  remove: (id: string) => Promise<void>;
  getQueuedOperations: () => any[];
  getFailedOperations: () => any[];
  retryFailedOperation: (operationId: string) => boolean;
  syncQueuedOperations: () => Promise<void>;
}

/**
 * Hook for shows CRUD operations with offline support
 * Automatically syncs with showStore and queues when offline
 */
export function useShowsMutations(): UseShowsMutationsReturn {
  const isOnline = () => offlineManager.getState().isOnline;

  // Helper: Check if we're online
  /**
   * Add a new show
   * Queues operation if offline, executes immediately if online
   */
  const add = async (show: Show): Promise<Show> => {
    if (!isOnline()) {
      showStore.queueOfflineOperation('create', show.id, show);
      return show; // Optimistic return
    }
    showStore.addShow(show);
    return show;
  };

  /**
   * Update an existing show
   * Queues operation if offline, updates immediately if online
   */
  const update = async (id: string, patch: Partial<Show>): Promise<Show> => {
    if (!isOnline()) {
      showStore.queueOfflineOperation('update', id, patch);
      const current = showStore.getById(id);
      return current ? { ...current, ...patch } : ({} as Show);
    }
    showStore.updateShow(id, patch);
    const updated = showStore.getById(id);
    return updated || ({} as Show);
  };

  /**
   * Remove a show
   * Queues operation if offline, removes immediately if online
   */
  const remove = async (id: string): Promise<void> => {
    if (!isOnline()) {
      showStore.queueOfflineOperation('delete', id);
      return;
    }
    showStore.removeShow(id);
  };

  // Offline operation management
  const getQueuedOperations = () => offlineManager.getQueuedOperations();
  const getFailedOperations = () => offlineManager.getFailedOperations();
  const retryFailedOperation = (operationId: string) =>
    offlineManager.retryFailedOperation(operationId);
  const syncQueuedOperations = () => offlineManager.syncQueuedOperations();

  return {
    add,
    update,
    remove,
    getQueuedOperations,
    getFailedOperations,
    retryFailedOperation,
    syncQueuedOperations
  };
}
