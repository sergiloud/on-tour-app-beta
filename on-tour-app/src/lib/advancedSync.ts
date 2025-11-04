/**
 * FASE 2 - Advanced Synchronization & Conflict Resolution
 *
 * Implements enterprise-grade data synchronization with:
 * - Web Worker data cloning (prevents race conditions)
 * - Optimistic updates with error rollback
 * - Conflict resolution (last-write-wins + merge strategies)
 * - Comprehensive audit trail logging
 *
 * Status: PRODUCTION READY ✅
 */

import { queryClient } from './queryClient';

/**
 * Show type (same as in showStore)
 */
export type Show = {
  id: string;
  city: string;
  country: string;
  date: string;
  fee: number;
  feeCurrency: string;
  fxRateToBase: number;
  __version: number;
  __modifiedAt: number;
  __modifiedBy: string;
  [key: string]: any;
};

// ============================================================================
// PHASE 2.3: WEB WORKER DATA CLONING
// ============================================================================

/**
 * Deep clone helper - ensures Web Worker gets independent data copy
 * Prevents race conditions where main thread modifies data while worker calculates
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any;
  }

  if (obj instanceof Array) {
    return obj.map(item => deepClone(item)) as any;
  }

  if (obj instanceof Object) {
    const clonedObj: any = {};
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        clonedObj[key] = deepClone((obj as any)[key]);
      }
    }
    return clonedObj;
  }

  return obj;
}

/**
 * Wrapper for posting messages to Web Worker with data cloning
 * Prevents main thread modifications from affecting worker calculations
 */
export function postWorkerMessage<T = any>(
  worker: Worker,
  type: string,
  payload: T,
  metadata?: { timestamp?: number; version?: number }
): void {
  const message = {
    type,
    payload: deepClone(payload), // ← CRITICAL: Deep clone prevents race conditions
    metadata: {
      timestamp: metadata?.timestamp || Date.now(),
      version: metadata?.version || 1,
    },
  };

  worker.postMessage(message);
}

/**
 * Listen for worker results with timestamp validation
 * Ensures we don't process stale results after new requests
 */
export function listenWorkerResult<T = any>(
  worker: Worker,
  expectedTimestamp: number,
  onResult: (result: T) => void,
  onError?: (error: Error) => void
): () => void {
  const handler = (event: MessageEvent) => {
    const { type, result, metadata, error } = event.data;

    // Validate timestamp - ignore stale results
    if (metadata?.timestamp < expectedTimestamp) {
      console.warn('Ignoring stale worker result', {
        resultTimestamp: metadata?.timestamp,
        expectedTimestamp,
      });
      return;
    }

    if (error) {
      onError?.(new Error(error));
      return;
    }

    onResult(result);
  };

  worker.addEventListener('message', handler);

  // Return unsubscribe function
  return () => worker.removeEventListener('message', handler);
}

// ============================================================================
// PHASE 2.4: OPTIMISTIC UPDATES + ROLLBACK
// ============================================================================

/**
 * Type for optimistic update rollback context
 */
export interface OptimisticUpdateContext<T = any> {
  previousData: T;
  timestamp: number;
  transactionId: string;
}

/**
 * Perform optimistic update with automatic rollback on error
 *
 * Flow:
 * 1. Cancel pending queries to prevent overwrites
 * 2. Save current data for rollback
 * 3. Update cache immediately (optimistic)
 * 4. Return context for error handling
 *
 * Usage:
 * ```typescript
 * const context = optimisticUpdate(queryKey, (old) => ({ ...old, fee: 6000 }));
 * try {
 *   await updateShowOnServer(...);
 * } catch (error) {
 *   rollbackOptimisticUpdate(queryKey, context);
 * }
 * ```
 */
export async function optimisticUpdate<T = any>(
  queryKey: any[],
  updateFn: (old: T) => T,
  onBeforeUpdate?: () => void
): Promise<OptimisticUpdateContext<T>> {
  // Generate transaction ID for tracking
  const transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  // Cancel pending queries to prevent race conditions
  await queryClient.cancelQueries({ queryKey });

  // Get and save previous data for rollback
  const previousData = queryClient.getQueryData<T>(queryKey);

  // Hook for custom pre-update logic
  onBeforeUpdate?.();

  // Optimistic update - immediate UI feedback
  queryClient.setQueryData<T>(queryKey, (old) => {
    if (!old) return old;
    return updateFn(old);
  });

  // Return context for error handling
  return {
    previousData: previousData as T,
    timestamp: Date.now(),
    transactionId,
  };
}

/**
 * Rollback optimistic update on error
 * Restores previous data to cache
 */
export function rollbackOptimisticUpdate<T = any>(
  queryKey: any[],
  context: OptimisticUpdateContext<T>
): void {
  console.warn('Rolling back optimistic update', {
    transactionId: context.transactionId,
    timestamp: context.timestamp,
  });

  queryClient.setQueryData(queryKey, context.previousData);
}

/**
 * React Query mutation configuration with optimistic updates + rollback
 *
 * Example:
 * ```typescript
 * const { mutate } = useMutation({
 *   ...createOptimisticMutation(
 *     ['shows'],
 *     async (newData) => {
 *       return await updateShowOnServer(newData);
 *     },
 *     (old, newData) => ({ ...old, ...newData })
 *   )
 * });
 * ```
 */
export function createOptimisticMutation<TData = any, TError = any, TVariables = any>(
  queryKey: any[],
  mutationFn: (variables: TVariables) => Promise<TData>,
  updateFn: (old: TData | undefined, variables: TVariables) => TData
) {
  return {
    mutationFn,
    onMutate: async (variables: TVariables) => {
      return await optimisticUpdate(
        queryKey,
        (old) => updateFn(old, variables)
      );
    },
    onError: (error: TError, variables: TVariables, context?: OptimisticUpdateContext) => {
      if (context) {
        rollbackOptimisticUpdate(queryKey, context);
      }

      console.error('Mutation error - rolled back optimistic update', {
        error,
        variables,
        transactionId: context?.transactionId,
      });
    },
    onSuccess: (data: TData, variables: TVariables, context?: OptimisticUpdateContext) => {
      // Server data is source of truth - update cache with server response
      queryClient.setQueryData(queryKey, data);

      console.log('Mutation successful', {
        transactionId: context?.transactionId,
      });
    },
  };
}

// ============================================================================
// PHASE 2.5: CONFLICT RESOLUTION STRATEGY
// ============================================================================

/**
 * Conflict detection result
 */
export interface SyncConflict<T = any> {
  id: string;
  local: T;
  remote: T;
  conflictType: 'version-mismatch' | 'timestamp-mismatch' | 'data-divergence';
  localTimestamp: number;
  remoteTimestamp: number;
  resolution?: 'local' | 'remote' | 'merge';
}

/**
 * Detect conflicts between local and remote data
 * Uses __version and __modifiedAt fields (added in FASE 1)
 */
export function detectConflict<T extends { __version?: number; __modifiedAt?: number }>(
  local: T,
  remote: T
): SyncConflict<T> | null {
  // Check version mismatch
  if (local.__version !== remote.__version) {
    return {
      id: (local as any).id || 'unknown',
      local,
      remote,
      conflictType: 'version-mismatch',
      localTimestamp: local.__modifiedAt || 0,
      remoteTimestamp: remote.__modifiedAt || 0,
    };
  }

  // Check timestamp mismatch
  if (local.__modifiedAt !== remote.__modifiedAt) {
    return {
      id: (local as any).id || 'unknown',
      local,
      remote,
      conflictType: 'timestamp-mismatch',
      localTimestamp: local.__modifiedAt || 0,
      remoteTimestamp: remote.__modifiedAt || 0,
    };
  }

  // No conflict detected
  return null;
}

/**
 * Resolution strategy: LAST-WRITE-WINS (LWW)
 * More recent modification takes precedence
 */
export function resolveConflictLWW<T extends { __modifiedAt?: number }>(
  conflict: SyncConflict<T>
): T {
  const localTime = conflict.localTimestamp;
  const remoteTime = conflict.remoteTimestamp;

  if (localTime > remoteTime) {
    console.log('Conflict resolved: Using LOCAL (more recent)', {
      conflictId: conflict.id,
      localTime,
      remoteTime,
    });
    return conflict.local;
  } else if (remoteTime > localTime) {
    console.log('Conflict resolved: Using REMOTE (more recent)', {
      conflictId: conflict.id,
      localTime,
      remoteTime,
    });
    return conflict.remote;
  } else {
    // Same timestamp - prefer remote as tiebreaker (server is authoritative)
    console.log('Conflict resolved: Using REMOTE (tiebreaker)', {
      conflictId: conflict.id,
    });
    return conflict.remote;
  }
}

/**
 * Resolution strategy: FIELD-LEVEL MERGE
 * Merge specific fields using custom logic
 *
 * Example:
 * ```typescript
 * const merged = resolveConflictMerge(conflict, {
 *   fee: (local, remote) => Math.max(local, remote), // Take higher fee
 *   status: (local, remote) => 'resolved', // Custom logic
 * });
 * ```
 */
export function resolveConflictMerge<T extends Record<string, any>>(
  conflict: SyncConflict<T>,
  mergeRules: Partial<Record<keyof T, (local: any, remote: any) => any>>
): T {
  const merged = { ...conflict.remote };

  for (const [field, rule] of Object.entries(mergeRules)) {
    if (rule) {
      const localValue = (conflict.local as any)[field];
      const remoteValue = (conflict.remote as any)[field];
      merged[field as keyof T] = rule(localValue, remoteValue);
    }
  }

  console.log('Conflict resolved: Using MERGE strategy', {
    conflictId: conflict.id,
    mergedFields: Object.keys(mergeRules),
  });

  return merged;
}

// ============================================================================
// PHASE 2.6: AUDIT TRAIL SYSTEM
// ============================================================================

/**
 * Audit log entry for comprehensive change tracking
 */
export interface AuditLogEntry {
  id: string;
  timestamp: number;
  action: 'create' | 'update' | 'delete' | 'sync' | 'conflict-resolved';
  entityId: string;
  entityType: 'show' | 'finance' | 'sync';
  source: 'ui' | 'worker' | 'backend' | 'offline' | 'broadcast';
  changes: {
    before?: Record<string, any>;
    after?: Record<string, any>;
    fields?: string[];
  };
  metadata?: {
    userId?: string;
    sessionId?: string;
    transactionId?: string;
    conflictResolution?: 'lww' | 'merge' | 'manual';
  };
  status: 'success' | 'error' | 'rollback';
  error?: string;
}

/**
 * Audit trail storage - stores in localStorage with size management
 */
class AuditTrail {
  private readonly STORAGE_KEY = 'on-tour:audit-log';
  private readonly MAX_ENTRIES = 1000;
  private entries: AuditLogEntry[] = [];

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Log a change
   */
  log(entry: Omit<AuditLogEntry, 'id' | 'timestamp'>): void {
    const auditEntry: AuditLogEntry = {
      ...entry,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    };

    this.entries.push(auditEntry);

    // Enforce max size - remove oldest entries
    if (this.entries.length > this.MAX_ENTRIES) {
      this.entries = this.entries.slice(-this.MAX_ENTRIES);
    }

    // Persist to localStorage
    this.saveToStorage();

    // Log to console in development
    if (import.meta.env.DEV) {
      console.log('[AUDIT]', auditEntry.action, {
        entityId: auditEntry.entityId,
        source: auditEntry.source,
        status: auditEntry.status,
      });
    }
  }

  /**
   * Query audit log
   */
  query(filters?: {
    entityId?: string;
    action?: AuditLogEntry['action'];
    source?: AuditLogEntry['source'];
    after?: number;
    before?: number;
  }): AuditLogEntry[] {
    return this.entries.filter(entry => {
      if (filters?.entityId && entry.entityId !== filters.entityId) return false;
      if (filters?.action && entry.action !== filters.action) return false;
      if (filters?.source && entry.source !== filters.source) return false;
      if (filters?.after && entry.timestamp < filters.after) return false;
      if (filters?.before && entry.timestamp > filters.before) return false;
      return true;
    });
  }

  /**
   * Export audit log (for compliance, debugging)
   */
  export(format: 'json' | 'csv' = 'json'): string {
    if (format === 'json') {
      return JSON.stringify(this.entries, null, 2);
    }

    // CSV format
    const headers = ['ID', 'Timestamp', 'Action', 'Entity ID', 'Entity Type', 'Source', 'Status'];
    const rows = this.entries.map(entry => [
      entry.id,
      new Date(entry.timestamp).toISOString(),
      entry.action,
      entry.entityId,
      entry.entityType,
      entry.source,
      entry.status,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csvContent;
  }

  /**
   * Clear audit log
   */
  clear(): void {
    this.entries = [];
    this.saveToStorage();
  }

  private saveToStorage(): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.entries));
    } catch (error) {
      console.error('Failed to save audit log to localStorage', error);
    }
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        this.entries = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load audit log from localStorage', error);
    }
  }
}

/**
 * Global audit trail instance
 */
export const auditTrail = new AuditTrail();

/**
 * Convenience function to log show changes
 */
export function logShowChange(
  action: AuditLogEntry['action'],
  showId: string,
  source: AuditLogEntry['source'],
  before?: Show,
  after?: Show,
  metadata?: AuditLogEntry['metadata']
): void {
  auditTrail.log({
    action,
    entityId: showId,
    entityType: 'show',
    source,
    changes: {
      before,
      after,
      fields: after && before
        ? Object.keys(after).filter(key => (after as any)[key] !== (before as any)[key])
        : undefined,
    },
    metadata,
    status: 'success',
  });
}

// ============================================================================
// EXPORTS
// ============================================================================

// Already exported at definition sites:
// - auditTrail (line 524)
// - logShowChange (line 529)
