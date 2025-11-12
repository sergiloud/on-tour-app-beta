/**
 * useOfflineMutation Hook
 * Dedicated offline mutation management for Show operations
 *
 * REFINE-003: Extract offline-specific logic from useShowsMutations
 * Purpose: Single responsibility - handle offline queuing + sync
 *
 * Extracted from useShowsMutations.ts to reduce complexity
 * Eliminates: -80 lines of duplicate offline handling logic
 */

import { useCallback } from 'react';
import { offlineManager } from '../lib/offlineManager';

/**
 * useOfflineMutation Hook
 * Manages offline operations for show mutations
 *
 * Usage:
 * ```tsx
 * const { isOnline, syncOperations, getStatus } = useOfflineMutation();
 *
 * // Check status
 * const status = getStatus();
 *
 * // Sync when online
 * if (isOnline()) await syncOperations();
 * ```
 */
export const useOfflineMutation = () => {
  /**
   * Check if online
   */
  const isOnline = useCallback(() => {
    return offlineManager.getState().isOnline;
  }, []);

  /**
   * Get all queued operations
   */
  const getQueuedOperations = useCallback(() => {
    return offlineManager.getQueuedOperations();
  }, []);

  /**
   * Get failed operations
   */
  const getFailedOperations = useCallback(() => {
    return offlineManager.getFailedOperations();
  }, []);

  /**
   * Retry a specific failed operation
   */
  const retryOperation = useCallback((operationId: string) => {
    return offlineManager.retryFailedOperation(operationId);
  }, []);

  /**
   * Sync all queued operations (call when coming back online)
   */
  const syncOperations = useCallback(async () => {
    if (!isOnline()) {
      console.warn('Cannot sync: device is offline');
      return false;
    }

    try {
      await offlineManager.syncQueuedOperations();
      return true;
    } catch (error) {
      console.error('Sync failed:', error);
      return false;
    }
  }, [isOnline]);

  /**
   * Get offline status
   */
  const getStatus = useCallback(() => {
    return {
      isOnline: isOnline(),
      queuedCount: getQueuedOperations().length,
      failedCount: getFailedOperations().length,
    };
  }, [isOnline, getQueuedOperations, getFailedOperations]);

  return {
    getQueuedOperations,
    getFailedOperations,
    retryOperation,
    syncOperations,
    getStatus,
    isOnline,
  };
};

/**
 * useOfflineStatus Hook
 * Simpler hook for just checking offline status
 *
 * Usage:
 * ```tsx
 * const { isOnline, queuedCount } = useOfflineStatus();
 *
 * if (!isOnline) {
 *   return <OfflineBanner queuedCount={queuedCount} />;
 * }
 * ```
 */
export const useOfflineStatus = () => {
  const { getStatus } = useOfflineMutation();
  const { isOnline, queuedCount, failedCount } = getStatus();

  return {
    isOnline,
    queuedCount,
    failedCount,
  };
};
