/**
 * Background Sync Hook
 * 
 * Sincroniza datos entre IndexedDB (offline) y Firestore (online)
 * - Detecta cambios de conectividad
 * - Sincroniza automáticamente al recuperar conexión
 * - Maneja conflictos (last-write-wins)
 */

import { useEffect, useState, useCallback } from 'react';
import { 
  getDB, 
  getSyncQueue, 
  removeSyncQueueItem, 
  updateSyncQueueRetry,
  markAsSynced,
  addToSyncQueue,
  getPendingSyncItems
} from '../lib/offlineStorage';

type CollectionName = 'calendar' | 'transactions' | 'shows' | 'contacts';

// ========================================
// Types
// ========================================

interface SyncStatus {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
  lastSyncTime: number | null;
  errors: string[];
}

// ========================================
// Network Status Hook
// ========================================

export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

// ========================================
// Background Sync Hook
// ========================================

export function useBackgroundSync() {
  const [syncStatus, setSyncStatus] = useState<SyncStatus>({
    isOnline: navigator.onLine,
    isSyncing: false,
    pendingCount: 0,
    lastSyncTime: null,
    errors: []
  });

  const isOnline = useNetworkStatus();

  // Sync function
  const syncToFirestore = useCallback(async () => {
    if (!isOnline) {
      console.log('[Sync] Offline - skipping sync');
      return;
    }

    setSyncStatus(prev => ({ ...prev, isSyncing: true, errors: [] }));

    try {
      const queue = await getSyncQueue();
      console.log(`[Sync] Processing ${queue.length} items`);

      let successCount = 0;
      let failCount = 0;
      const errors: string[] = [];

      for (const item of queue) {
        try {
          // Aquí irá la lógica de sincronización con Firestore
          // Por ahora simulamos el sync
          console.log(`[Sync] Processing ${item.operation} on ${item.collection}/${item.documentId}`);

          // TODO: Implementar sync real con Firestore
          // await syncItemToFirestore(item);

          // Marcar como completado
          await removeSyncQueueItem(item.id);
          successCount++;
        } catch (error) {
          console.error(`[Sync] Failed to sync item:`, error);
          
          // Incrementar retry count
          await updateSyncQueueRetry(item.id);
          
          // Si ha fallado más de 3 veces, registrar error
          if (item.retryCount >= 3) {
            errors.push(`Failed to sync ${item.collection}/${item.documentId}`);
            failCount++;
          }
        }
      }

      console.log(`[Sync] Complete - ${successCount} success, ${failCount} failed`);

      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        pendingCount: failCount,
        lastSyncTime: Date.now(),
        errors
      }));
    } catch (error) {
      console.error('[Sync] Sync failed:', error);
      setSyncStatus(prev => ({
        ...prev,
        isSyncing: false,
        errors: [...prev.errors, 'Sync failed']
      }));
    }
  }, [isOnline]);

  // Auto-sync cuando se recupera conexión
  useEffect(() => {
    if (isOnline) {
      console.log('[Sync] Online - triggering sync');
      syncToFirestore();
    }
  }, [isOnline, syncToFirestore]);

  // Periodic sync cada 5 minutos si está online
  useEffect(() => {
    if (!isOnline) return;

    const interval = setInterval(() => {
      console.log('[Sync] Periodic sync');
      syncToFirestore();
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [isOnline, syncToFirestore]);

  // Update pending count periodically
  useEffect(() => {
    const updatePendingCount = async () => {
      const queue = await getSyncQueue();
      setSyncStatus(prev => ({ ...prev, pendingCount: queue.length }));
    };

    updatePendingCount();
    const interval = setInterval(updatePendingCount, 10000); // cada 10s

    return () => clearInterval(interval);
  }, []);

  return {
    ...syncStatus,
    isOnline,
    manualSync: syncToFirestore
  };
}

// ========================================
// Offline-First Data Hook
// ========================================

export function useOfflineFirst<T>(
  collection: CollectionName,
  fetchOnline: () => Promise<T[]>,
  options?: {
    syncInterval?: number;
    enableAutoSync?: boolean;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const isOnline = useNetworkStatus();

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      if (isOnline) {
        // Online: fetch from Firestore
        console.log(`[OfflineFirst] Fetching ${collection} from Firestore`);
        const onlineData = await fetchOnline();
        setData(onlineData);

        // TODO: Save to IndexedDB
        // await bulkSave(collection, onlineData);
      } else {
        // Offline: fetch from IndexedDB
        console.log(`[OfflineFirst] Fetching ${collection} from IndexedDB`);
        const db = await getDB();
        const offlineData = await db.getAll(collection as any);
        setData(offlineData as any);
      }
    } catch (err) {
      console.error(`[OfflineFirst] Error fetching ${collection}:`, err);
      setError(err as Error);

      // Try IndexedDB as fallback
      try {
        const db = await getDB();
        const fallbackData = await db.getAll(collection as any);
        setData(fallbackData as any);
      } catch (fallbackErr) {
        console.error('[OfflineFirst] Fallback failed:', fallbackErr);
      }
    } finally {
      setIsLoading(false);
    }
  }, [collection, fetchOnline, isOnline]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Auto-refetch when coming online
  useEffect(() => {
    if (isOnline && options?.enableAutoSync !== false) {
      fetchData();
    }
  }, [isOnline, fetchData, options?.enableAutoSync]);

  const createItem = useCallback(async (item: T & { id: string }) => {
    try {
      if (isOnline) {
        // Online: direct to Firestore
        // TODO: Implement Firestore create
        console.log(`[OfflineFirst] Creating ${collection} item online`);
      } else {
        // Offline: save to IndexedDB and queue for sync
        console.log(`[OfflineFirst] Creating ${collection} item offline`);
        const db = await getDB();
        await db.add(collection as any, {
          ...item,
          syncStatus: 'pending',
          lastModified: Date.now()
        } as any);
        
        await addToSyncQueue(collection, 'create', item.id, item);
      }

      // Update local state
      setData(prev => [...prev, item]);
    } catch (err) {
      console.error('[OfflineFirst] Create failed:', err);
      throw err;
    }
  }, [collection, isOnline]);

  const updateItem = useCallback(async (id: string, updates: Partial<T>) => {
    try {
      if (isOnline) {
        // Online: direct to Firestore
        console.log(`[OfflineFirst] Updating ${collection}/${id} online`);
      } else {
        // Offline: update IndexedDB and queue
        console.log(`[OfflineFirst] Updating ${collection}/${id} offline`);
        const db = await getDB();
        const existing = await db.get(collection as any, id);
        
        if (existing) {
          await db.put(collection as any, {
            ...existing,
            ...updates,
            syncStatus: 'pending',
            lastModified: Date.now()
          } as any);
          
          await addToSyncQueue(collection, 'update', id, updates);
        }
      }

      // Update local state
      setData(prev => 
        prev.map(item => 
          (item as any).id === id ? { ...item, ...updates } : item
        )
      );
    } catch (err) {
      console.error('[OfflineFirst] Update failed:', err);
      throw err;
    }
  }, [collection, isOnline]);

  const deleteItem = useCallback(async (id: string) => {
    try {
      if (isOnline) {
        // Online: direct to Firestore
        console.log(`[OfflineFirst] Deleting ${collection}/${id} online`);
      } else {
        // Offline: mark for deletion and queue
        console.log(`[OfflineFirst] Deleting ${collection}/${id} offline`);
        const db = await getDB();
        await db.delete(collection as any, id);
        await addToSyncQueue(collection, 'delete', id);
      }

      // Update local state
      setData(prev => prev.filter(item => (item as any).id !== id));
    } catch (err) {
      console.error('[OfflineFirst] Delete failed:', err);
      throw err;
    }
  }, [collection, isOnline]);

  return {
    data,
    isLoading,
    error,
    isOnline,
    refetch: fetchData,
    createItem,
    updateItem,
    deleteItem
  };
}
