/**
 * Advanced Synchronization Tests
 * Tests for FASE 2.3-2.6:
 * - Web Worker data cloning
 * - Optimistic updates + rollback
 * - Conflict resolution
 * - Audit trail logging
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  deepClone,
  postWorkerMessage,
  listenWorkerResult,
  optimisticUpdate,
  rollbackOptimisticUpdate,
  createOptimisticMutation,
  detectConflict,
  resolveConflictLWW,
  resolveConflictMerge,
  auditTrail,
  logShowChange,
  type Show,
  type SyncConflict,
  type OptimisticUpdateContext,
  type AuditLogEntry,
} from '../lib/advancedSync';
import { queryClient } from '../lib/queryClient';

// ============================================================================
// PHASE 2.3: Web Worker Data Cloning Tests
// ============================================================================

describe('Phase 2.3: Web Worker Data Cloning', () => {
  describe('deepClone', () => {
    it('should deep clone primitive values', () => {
      expect(deepClone(42)).toBe(42);
      expect(deepClone('hello')).toBe('hello');
      expect(deepClone(true)).toBe(true);
      expect(deepClone(null)).toBe(null);
      expect(deepClone(undefined)).toBe(undefined);
    });

    it('should deep clone arrays', () => {
      const original = [1, 2, { nested: 3 }];
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original); // Different reference
      expect(cloned[2]).not.toBe(original[2]); // Nested objects also cloned
    });

    it('should deep clone objects', () => {
      const original = { a: 1, b: { c: 2 } };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.b).not.toBe(original.b);
    });

    it('should deep clone dates', () => {
      const original = new Date('2025-12-10');
      const cloned = deepClone(original);

      expect(cloned.getTime()).toBe(original.getTime());
      expect(cloned).not.toBe(original);
    });

    it('should prevent race condition with modifications', () => {
      const original = { shows: [{ id: '1', fee: 5000 }] };
      const cloned = deepClone(original);

      // Modify original
      original.shows[0]!.fee = 6000;

      // Cloned should be unchanged
      expect(cloned.shows[0]!.fee).toBe(5000);
    });

    it('should handle complex nested structures', () => {
      const original = {
        shows: [
          { id: '1', date: new Date('2025-12-10'), costs: [100, 200] },
          { id: '2', metadata: { city: 'Madrid', venue: { name: 'Theater' } } },
        ],
      };
      const cloned = deepClone(original);

      expect(cloned).toEqual(original);
      expect(cloned).not.toBe(original);
      expect(cloned.shows[0]!.costs).not.toBe(original.shows[0]!.costs);
      expect((cloned.shows[1]!.metadata as any).venue).not.toBe((original.shows[1]!.metadata as any).venue);
    });
  });

  describe('postWorkerMessage', () => {
    it('should post message with deep cloned payload', () => {
      const mockWorker = { postMessage: vi.fn() } as any;
      const payload = { shows: [{ id: '1', fee: 5000 }] };

      postWorkerMessage(mockWorker, 'compute', payload);

      expect(mockWorker.postMessage).toHaveBeenCalled();
      const sentMessage = mockWorker.postMessage.mock.calls[0][0];

      // Verify structure
      expect(sentMessage.type).toBe('compute');
      expect(sentMessage.payload).toEqual(payload);
      expect(sentMessage.payload).not.toBe(payload); // Different reference
      expect(sentMessage.metadata.timestamp).toBeDefined();
      expect(sentMessage.metadata.version).toBe(1);
    });
  });
});

// ============================================================================
// PHASE 2.4: Optimistic Updates + Rollback Tests
// ============================================================================

describe('Phase 2.4: Optimistic Updates + Rollback', () => {
  beforeEach(() => {
    queryClient.clear();
  });

  describe('optimisticUpdate', () => {
    it('should update cache optimistically', async () => {
      const queryKey = ['shows', '1'];
      const initialData = { id: '1', fee: 5000, city: 'Madrid' };

      // Set initial data
      queryClient.setQueryData(queryKey, initialData);

      // Perform optimistic update
      const context = await optimisticUpdate(queryKey, (old) => ({
        ...old,
        fee: 6000,
      }));

      // Cache should be immediately updated
      const updated = queryClient.getQueryData(queryKey);
      expect((updated as any).fee).toBe(6000);

      // Context should have rollback info
      expect(context.previousData).toEqual(initialData);
      expect(context.transactionId).toBeDefined();
      expect(context.timestamp).toBeDefined();
    });
  });

  describe('rollbackOptimisticUpdate', () => {
    it('should rollback to previous data on error', async () => {
      const queryKey = ['shows', '1'];
      const initialData = { id: '1', fee: 5000 };

      queryClient.setQueryData(queryKey, initialData);

      // Optimistic update
      const context = await optimisticUpdate(queryKey, (old) => ({
        ...old,
        fee: 6000,
      }));

      expect((queryClient.getQueryData(queryKey) as any).fee).toBe(6000);

      // Rollback
      rollbackOptimisticUpdate(queryKey, context);

      // Should be back to original
      expect((queryClient.getQueryData(queryKey) as any).fee).toBe(5000);
    });
  });

  describe('createOptimisticMutation', () => {
    it('should create mutation config with optimistic updates', () => {
      const queryKey = ['shows', '1'];
      const initialData = { id: '1', fee: 5000 };

      queryClient.setQueryData(queryKey, initialData);

      const mutationConfig = createOptimisticMutation(
        queryKey,
        async (variables) => ({ ...initialData, ...variables }),
        (old, variables) => ({ ...old, ...variables })
      );

      // Verify config structure
      expect(mutationConfig.mutationFn).toBeDefined();
      expect(mutationConfig.onMutate).toBeDefined();
      expect(mutationConfig.onError).toBeDefined();
      expect(mutationConfig.onSuccess).toBeDefined();
    });
  });
});

// ============================================================================
// PHASE 2.5: Conflict Resolution Tests
// ============================================================================

describe('Phase 2.5: Conflict Resolution', () => {
  describe('detectConflict', () => {
    it('should detect version mismatch conflicts', () => {
      const local: Show = {
        id: '1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 6000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        __version: 2,
        __modifiedAt: Date.now(),
        __modifiedBy: 'local',
      };

      const remote: Show = {
        ...local,
        __version: 1,
      };

      const conflict = detectConflict(local, remote);

      expect(conflict).toBeDefined();
      expect(conflict?.conflictType).toBe('version-mismatch');
      expect(conflict?.local.__version).toBe(2);
      expect(conflict?.remote.__version).toBe(1);
    });

    it('should detect timestamp mismatch conflicts', () => {
      const time1 = 1000;
      const time2 = 2000;

      const local: Show = {
        id: '1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 6000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        __version: 1,
        __modifiedAt: time2,
        __modifiedBy: 'local',
      };

      const remote: Show = {
        ...local,
        __modifiedAt: time1,
      };

      const conflict = detectConflict(local, remote);

      expect(conflict).toBeDefined();
      expect(conflict?.conflictType).toBe('timestamp-mismatch');
    });

    it('should not detect conflicts for identical data', () => {
      const local: Show = {
        id: '1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 6000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        __version: 1,
        __modifiedAt: 1000,
        __modifiedBy: 'user1',
      };

      const remote: Show = { ...local };

      const conflict = detectConflict(local, remote);

      expect(conflict).toBeNull();
    });
  });

  describe('resolveConflictLWW (Last-Write-Wins)', () => {
    it('should use local when more recent', () => {
      const conflict: SyncConflict<Show> = {
        id: '1',
        conflictType: 'timestamp-mismatch',
        localTimestamp: 2000,
        remoteTimestamp: 1000,
        local: {
          id: '1',
          city: 'Madrid',
          country: 'ES',
          date: '2025-12-10',
          fee: 6000,
          feeCurrency: 'EUR',
          fxRateToBase: 1.0,
          __version: 2,
          __modifiedAt: 2000,
          __modifiedBy: 'local',
        },
        remote: {
          id: '1',
          city: 'Barcelona',
          country: 'ES',
          date: '2025-12-10',
          fee: 5000,
          feeCurrency: 'EUR',
          fxRateToBase: 1.0,
          __version: 1,
          __modifiedAt: 1000,
          __modifiedBy: 'remote',
        },
      };

      const resolved = resolveConflictLWW(conflict);

      expect(resolved.city).toBe('Madrid');
      expect(resolved.fee).toBe(6000);
    });

    it('should use remote when more recent', () => {
      const conflict: SyncConflict<Show> = {
        id: '1',
        conflictType: 'timestamp-mismatch',
        localTimestamp: 1000,
        remoteTimestamp: 2000,
        local: {
          id: '1',
          city: 'Madrid',
          country: 'ES',
          date: '2025-12-10',
          fee: 6000,
          feeCurrency: 'EUR',
          fxRateToBase: 1.0,
          __version: 1,
          __modifiedAt: 1000,
          __modifiedBy: 'local',
        },
        remote: {
          id: '1',
          city: 'Barcelona',
          country: 'ES',
          date: '2025-12-10',
          fee: 5000,
          feeCurrency: 'EUR',
          fxRateToBase: 1.0,
          __version: 2,
          __modifiedAt: 2000,
          __modifiedBy: 'remote',
        },
      };

      const resolved = resolveConflictLWW(conflict);

      expect(resolved.city).toBe('Barcelona');
      expect(resolved.fee).toBe(5000);
    });
  });

  describe('resolveConflictMerge', () => {
    it('should merge using custom rules', () => {
      const conflict: SyncConflict<Show> = {
        id: '1',
        conflictType: 'timestamp-mismatch',
        localTimestamp: 2000,
        remoteTimestamp: 1500,
        local: {
          id: '1',
          city: 'Madrid',
          country: 'ES',
          date: '2025-12-10',
          fee: 6000,
          feeCurrency: 'EUR',
          fxRateToBase: 1.0,
          __version: 2,
          __modifiedAt: 2000,
          __modifiedBy: 'local',
        },
        remote: {
          id: '1',
          city: 'Barcelona',
          country: 'ES',
          date: '2025-12-11',
          fee: 5500,
          feeCurrency: 'EUR',
          fxRateToBase: 1.0,
          __version: 1,
          __modifiedAt: 1500,
          __modifiedBy: 'remote',
        },
      };

      const resolved = resolveConflictMerge(conflict, {
        fee: (local, remote) => Math.max(local, remote), // Take higher fee
        city: (local, remote) => local, // Keep local city
      });

      expect(resolved.fee).toBe(6000); // Max of 6000 and 5500
      expect(resolved.city).toBe('Madrid'); // Local preference
      expect(resolved.date).toBe('2025-12-11'); // Remote default (not in merge rules)
    });
  });
});

// ============================================================================
// PHASE 2.6: Audit Trail Tests
// ============================================================================

describe('Phase 2.6: Audit Trail', () => {
  beforeEach(() => {
    auditTrail.clear();
  });

  describe('auditTrail.log', () => {
    it('should log changes', () => {
      auditTrail.log({
        action: 'update',
        entityId: 'show-1',
        entityType: 'show',
        source: 'ui',
        changes: {
          before: { fee: 5000 },
          after: { fee: 6000 },
        },
        status: 'success',
      });

      const entries = auditTrail.query({ entityId: 'show-1' });

      expect(entries).toHaveLength(1);
      expect(entries?.[0]?.action).toBe('update');
      expect(entries?.[0]?.entityId).toBe('show-1');
      expect(entries?.[0]?.status).toBe('success');
    });
  });

  describe('auditTrail.query', () => {
    beforeEach(() => {
      auditTrail.clear();

      // Add test entries
      auditTrail.log({
        action: 'create',
        entityId: 'show-1',
        entityType: 'show',
        source: 'ui',
        changes: { after: { id: 'show-1' } },
        status: 'success',
      });

      auditTrail.log({
        action: 'update',
        entityId: 'show-1',
        entityType: 'show',
        source: 'backend',
        changes: { before: { fee: 5000 }, after: { fee: 6000 } },
        status: 'success',
      });

      auditTrail.log({
        action: 'update',
        entityId: 'show-2',
        entityType: 'show',
        source: 'ui',
        changes: { before: { fee: 7000 }, after: { fee: 8000 } },
        status: 'success',
      });
    });

    it('should filter by entityId', () => {
      const entries = auditTrail.query({ entityId: 'show-1' });
      expect(entries).toHaveLength(2);
      expect(entries.every(e => e.entityId === 'show-1')).toBe(true);
    });

    it('should filter by action', () => {
      const entries = auditTrail.query({ action: 'create' });
      expect(entries).toHaveLength(1);
      expect(entries?.[0]?.action).toBe('create');
    });

    it('should filter by source', () => {
      const entries = auditTrail.query({ source: 'backend' });
      expect(entries).toHaveLength(1);
      expect(entries?.[0]?.source).toBe('backend');
    });

    it('should combine multiple filters', () => {
      const entries = auditTrail.query({
        entityId: 'show-1',
        action: 'update',
        source: 'backend',
      });

      expect(entries).toHaveLength(1);
      expect(entries[0].entityId).toBe('show-1');
      expect(entries[0].action).toBe('update');
      expect(entries[0].source).toBe('backend');
    });
  });

  describe('auditTrail.export', () => {
    it('should export as JSON', () => {
      auditTrail.log({
        action: 'update',
        entityId: 'show-1',
        entityType: 'show',
        source: 'ui',
        changes: { before: { fee: 5000 }, after: { fee: 6000 } },
        status: 'success',
      });

      const json = auditTrail.export('json');
      const parsed = JSON.parse(json);

      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed[0].action).toBe('update');
    });

    it('should export as CSV', () => {
      auditTrail.log({
        action: 'update',
        entityId: 'show-1',
        entityType: 'show',
        source: 'ui',
        changes: { before: { fee: 5000 }, after: { fee: 6000 } },
        status: 'success',
      });

      const csv = auditTrail.export('csv');

      expect(csv).toContain('ID,Timestamp,Action,Entity ID');
      expect(csv).toContain('update');
      expect(csv).toContain('show-1');
    });
  });

  describe('logShowChange', () => {
    it('should log show changes with convenience function', () => {
      const showBefore: Show = {
        id: '1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 5000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        __version: 1,
        __modifiedAt: 1000,
        __modifiedBy: 'user1',
      };

      const showAfter: Show = {
        ...showBefore,
        fee: 6000,
        __version: 2,
        __modifiedAt: 2000,
      };

      logShowChange('update', 'show-1', 'ui', showBefore, showAfter);

      const entries = auditTrail.query({ entityId: 'show-1' });

      expect(entries).toHaveLength(1);
      expect(entries[0].action).toBe('update');
      expect(entries[0].source).toBe('ui');
      expect(entries[0].changes.before).toEqual(showBefore);
      expect(entries[0].changes.after).toEqual(showAfter);
    });
  });
});
