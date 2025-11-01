/**
 * useSettingsSync
 * Multi-tab synchronized settings persistence with versioning
 * 
 * Features:
 * - Write-through to localStorage (encrypted via secureStorage)
 * - Multi-tab sync via storage events + CustomEvent
 * - Debounced writes (300ms by default)
 * - Version tracking for safe future migrations
 * - Backward compatibility with legacy settings
 * 
 * @module useSettingsSync
 * @version 1.0.0
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { secureStorage } from '../lib/secureStorage';

/** Current version of the settings schema */
const SETTINGS_VERSION = 1 as const;

/** Storage keys */
export const SETTINGS_KEYS = {
  data: 'ota.settings.data',
  version: 'ota.settings.version',
  timestamp: 'ota.settings.timestamp',
  userId: 'ota.settings.userId',
} as const;

/** Debounce interval for writes (ms) */
const WRITE_DEBOUNCE_MS = 300;

/** Custom event names */
const EVENTS = {
  syncRequest: 'ota:settings:sync-request',
  syncComplete: 'ota:settings:sync-complete',
} as const;

export interface UseSettingsSyncOptions {
  debounceMs?: number;
  userId?: string;
  onError?: (error: Error) => void;
  onSync?: (data: Record<string, any>) => void;
}

export interface UseSettingsSyncResult<T extends Record<string, any>> {
  data: T;
  isDirty: boolean;
  isSyncing: boolean;
  save: (partialData: Partial<T>) => Promise<void>;
  clear: () => Promise<void>;
  reload: () => Promise<void>;
}

/**
 * Hook for synchronized settings persistence
 * 
 * Usage:
 * ```tsx
 * const { data, save, isDirty } = useSettingsSync<MySettings>({
 *   debounceMs: 300,
 *   userId: 'user123'
 * });
 * 
 * // Update a setting (debounced write)
 * await save({ theme: 'dark' });
 * ```
 */
export function useSettingsSync<T extends Record<string, any>>(
  initialData: T,
  options: UseSettingsSyncOptions = {}
): UseSettingsSyncResult<T> {
  const { debounceMs = WRITE_DEBOUNCE_MS, userId, onError, onSync } = options;

  // State
  const [data, setData] = useState<T>(() => loadFromStorage(initialData, userId));
  const [isDirty, setIsDirty] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  // Refs for debouncing and cleanup
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  /**
   * Load settings from localStorage (with fallback to initialData)
   */
  function loadFromStorage(fallback: T, uid?: string): T {
    try {
      const stored = secureStorage.getItem<Record<string, any>>(SETTINGS_KEYS.data);
      if (!stored) return fallback;

      // If userId is specified, filter to just that user's data
      if (uid && stored._userId && stored._userId !== uid) {
        return fallback;
      }

      // Merge with fallback to ensure all keys exist
      return { ...fallback, ...stored } as T;
    } catch (err) {
      console.error('[useSettingsSync] Failed to load from storage:', err);
      return fallback;
    }
  }

  /**
   * Write settings to localStorage (synchronous for immediate feedback)
   */
  function writeToStorage(newData: T, uid?: string) {
    try {
      const versionData = {
        ...newData,
        __version: SETTINGS_VERSION,
        __timestamp: Date.now(),
        ...(uid ? { _userId: uid } : {}),
      };

      secureStorage.setItem(SETTINGS_KEYS.data, versionData);
      secureStorage.setItem(SETTINGS_KEYS.version, SETTINGS_VERSION);
      secureStorage.setItem(SETTINGS_KEYS.timestamp, Date.now().toString());
      if (uid) secureStorage.setItem(SETTINGS_KEYS.userId, uid);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[useSettingsSync] Failed to write to storage:', error);
      onError?.(error);
    }
  }

  /**
   * Broadcast sync to other tabs
   */
  function broadcastSync(newData: T) {
    try {
      window.dispatchEvent(
        new CustomEvent(EVENTS.syncComplete, {
          detail: { data: newData, timestamp: Date.now(), userId },
        })
      );
    } catch (err) {
      console.warn('[useSettingsSync] Failed to broadcast sync:', err);
    }
  }

  /**
   * Save settings (with debounce)
   */
  const save = useCallback(
    async (partialData: Partial<T>): Promise<void> => {
      if (!isMountedRef.current) return;

      const newData = { ...data, ...partialData } as T;
      setData(newData);
      setIsDirty(true);

      // Clear existing debounce timer
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);

      // Debounce the actual write
      debounceTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return;

        setIsSyncing(true);
        try {
          writeToStorage(newData, userId);
          broadcastSync(newData);
          setIsDirty(false);
          onSync?.(newData);
        } finally {
          setIsSyncing(false);
        }
      }, debounceMs);
    },
    [data, userId, debounceMs, onSync, onError]
  );

  /**
   * Clear all settings and reset to initial
   */
  const clear = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    try {
      secureStorage.removeItem(SETTINGS_KEYS.data);
      secureStorage.removeItem(SETTINGS_KEYS.version);
      secureStorage.removeItem(SETTINGS_KEYS.timestamp);
      secureStorage.removeItem(SETTINGS_KEYS.userId);

      setData(initialData);
      setIsDirty(false);
      broadcastSync(initialData);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      console.error('[useSettingsSync] Failed to clear:', error);
      onError?.(error);
    }
  }, [initialData, onError]);

  /**
   * Reload settings from storage
   */
  const reload = useCallback(async (): Promise<void> => {
    if (!isMountedRef.current) return;

    const loaded = loadFromStorage(initialData, userId);
    setData(loaded);
    setIsDirty(false);
  }, [initialData, userId]);

  /**
   * Listen for storage changes from other tabs
   */
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key !== SETTINGS_KEYS.data || !isMountedRef.current) return;

      try {
        if (event.newValue) {
          const newData = JSON.parse(event.newValue) as T;
          setData(newData);
          setIsDirty(false);
        } else {
          setData(initialData);
          setIsDirty(false);
        }
      } catch (err) {
        console.error('[useSettingsSync] Failed to parse storage event:', err);
      }
    };

    const handleCustomSync = (event: Event) => {
      if (!(event instanceof CustomEvent) || !isMountedRef.current) return;

      const { data: syncedData } = event.detail;
      if (syncedData && typeof syncedData === 'object') {
        setData(syncedData);
        setIsDirty(false);
      }
    };

    // Listen for native storage events (other tabs)
    window.addEventListener('storage', handleStorageChange);

    // Listen for custom sync events (same tab or broadcast from other tabs)
    window.addEventListener(EVENTS.syncComplete, handleCustomSync);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(EVENTS.syncComplete, handleCustomSync);
    };
  }, [initialData]);

  /**
   * Cleanup debounce timer on unmount
   */
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, []);

  return {
    data,
    isDirty,
    isSyncing,
    save,
    clear,
    reload,
  };
}

/**
 * Utility: get current settings version from storage
 */
export function getSettingsVersion(): number {
  try {
    return secureStorage.getItem<number>(SETTINGS_KEYS.version) ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Utility: get last sync timestamp
 */
export function getSettingsLastSync(): number {
  try {
    const ts = secureStorage.getItem<string>(SETTINGS_KEYS.timestamp);
    return ts ? parseInt(ts, 10) : 0;
  } catch {
    return 0;
  }
}
