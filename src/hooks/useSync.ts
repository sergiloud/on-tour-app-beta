/**
 * useSync Hook - FASE 5
 *
 * Provides sync status and offline support to React components
 * - Real-time sync status
 * - Offline queue management
 * - Conflict notifications
 * - Retry controls
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { multiTabSync, SyncStatus } from '../lib/multiTabSync';
import { offlineManager, OfflineState, OfflineOperation } from '../lib/offlineManager';

export type SyncContextState = {
  // Multi-tab sync
  syncStatus: SyncStatus;
  tabId: string;
  isPrimaryTab: boolean;
  lastSyncTime: number;
  timeSinceLastSync: number;

  // Offline support
  isOnline: boolean;
  queuedOperations: OfflineOperation[];
  failedOperations: OfflineOperation[];
  timeOffline: number;

  // Actions
  forceSync: () => void;
  retryFailedOperation: (operationId: string) => void;
  clearOfflineQueue: () => void;
};

/**
 * Hook for accessing sync state
 */
export function useSync(): SyncContextState {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>('idle');
  const [isOnline, setIsOnline] = useState(offlineManager.getState().isOnline);
  const [offlineState, setOfflineState] = useState<OfflineState>(offlineManager.getState());
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());
  const syncIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Subscribe to sync and offline changes
  useEffect(() => {
    // Subscribe to offline changes
    const unsubscribeOffline = offlineManager.subscribe((state) => {
      setOfflineState(state);
      setIsOnline(state.isOnline);
    });

    // Subscribe to sync events
    const unsubscribeSync = multiTabSync.subscribe('sync-complete', () => {
      setSyncStatus('synced');
      setLastSyncTime(Date.now());
    });

    // Setup timer to update "time since last sync"
    syncIntervalRef.current = setInterval(() => {
      // This will cause a re-render to update timeSinceLastSync
      setLastSyncTime(Date.now());
    }, 1000);

    return () => {
      unsubscribeOffline();
      unsubscribeSync();
      if (syncIntervalRef.current) clearInterval(syncIntervalRef.current);
    };
  }, []);

  const forceSync = useCallback(() => {
    setSyncStatus('syncing');
    multiTabSync.forceSync();
  }, []);

  const retryFailedOperation = useCallback((operationId: string) => {
    offlineManager.retryFailedOperation(operationId);
  }, []);

  const clearOfflineQueue = useCallback(() => {
    offlineManager.clearQueue();
  }, []);

  const timeSinceLastSync = Date.now() - lastSyncTime;

  return {
    // Multi-tab sync
    syncStatus,
    tabId: `tab-${Math.random().toString(36).substr(2, 9)}`,
    isPrimaryTab: multiTabSync.isPrimaryTab(),
    lastSyncTime,
    timeSinceLastSync,

    // Offline support
    isOnline,
    queuedOperations: offlineState.queuedOperations,
    failedOperations: offlineState.failedOperations,
    timeOffline: offlineState.lastOfflineTime
      ? Date.now() - offlineState.lastOfflineTime
      : 0,

    // Actions
    forceSync,
    retryFailedOperation,
    clearOfflineQueue,
  };
}

/**
 * Hook for specific multi-tab sync events
 */
export function useSyncEvent(
  eventType: string,
  callback: (data: any) => void
): void {
  useEffect(() => {
    const unsubscribe = multiTabSync.subscribe(eventType, (event) => {
      callback(event.payload);
    });

    return unsubscribe;
  }, [eventType, callback]);
}

/**
 * Hook for offline operation management
 */
export function useOfflineOperation(
  resourceType: 'show' | 'finance' | 'travel'
) {
  const queueOperation = useCallback(
    (
      type: 'create' | 'update' | 'delete',
      resourceId: string,
      data: any
    ) => {
      return offlineManager.queueOperation(type, resourceType, resourceId, data);
    },
    [resourceType]
  );

  const syncOperations = useCallback(async () => {
    await offlineManager.syncQueuedOperations();
  }, []);

  return { queueOperation, syncOperations };
}

export default useSync;
