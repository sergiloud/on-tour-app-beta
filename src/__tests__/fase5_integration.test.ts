/**
 * FASE 5.4 Integration Tests
 * Tests for showStore + multiTabSync + offlineManager integration
 * and useShowsMutations + offlineManager integration
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { showStore } from '../shared/showStore';
import { multiTabSync } from '../lib/multiTabSync';
import { offlineManager } from '../lib/offlineManager';
import { normalizeShow, Show } from '../lib/shows';

describe('FASE 5.4: Integration Tests', () => {
  beforeEach(() => {
    showStore.setAll([]);
    multiTabSync.clearEventQueue();
    offlineManager.clearQueue();
  });

  afterEach(() => {
    showStore.setAll([]);
  });

  describe('showStore + multiTabSync Integration', () => {
    it('should broadcast shows-updated event when setAll is called', () => {
      const testShow: Show = {
        id: 'test-1',
        city: 'Madrid',
        country: 'ES',
        lat: 40.4168,
        lng: -3.7038,
        date: '2025-12-10',
        fee: 10000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        status: 'confirmed',
        __version: 1,
        __modifiedAt: Date.now(),
        __modifiedBy: 'test-user',
      };

      showStore.setAll([testShow]);

      const eventQueue = multiTabSync.getEventQueue();
      expect(eventQueue.length).toBeGreaterThan(0);
    });

    it('should track version and modification metadata on show update', () => {
      const testShow: Show = {
        id: 'test-1',
        city: 'Madrid',
        country: 'ES',
        lat: 40.4168,
        lng: -3.7038,
        date: '2025-12-10',
        fee: 10000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        status: 'confirmed',
        __version: 1,
        __modifiedAt: Date.now(),
        __modifiedBy: 'test-user',
      };

      showStore.addShow(testShow);
      const v1 = showStore.getById('test-1')?.__version;

      showStore.updateShow('test-1', { fee: 12000 });
      const v2 = showStore.getById('test-1')?.__version;

      expect(v2).toBe((v1 || 0) + 1);
    });

    it('should mark modification timestamp on show updates', () => {
      const testShow: Show = {
        id: 'test-1',
        city: 'Madrid',
        country: 'ES',
        lat: 40.4168,
        lng: -3.7038,
        date: '2025-12-10',
        fee: 10000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        status: 'confirmed',
        __version: 1,
        __modifiedAt: Date.now() - 10000,
        __modifiedBy: 'test-user',
      };

      showStore.addShow(testShow);
      const t1 = showStore.getById('test-1')?.__modifiedAt || 0;

      // Wait a bit
      const before = Date.now();
      showStore.updateShow('test-1', { fee: 12000 });
      const after = Date.now();

      const t2 = showStore.getById('test-1')?.__modifiedAt || 0;
      expect(t2).toBeGreaterThanOrEqual(before);
      expect(t2).toBeLessThanOrEqual(after);
    });
  });

  describe('showStore + offlineManager Integration', () => {
    it('should queue offline operations via showStore', () => {
      const op = showStore.queueOfflineOperation('create', 'test-show-1', {
        city: 'Barcelona',
        country: 'ES',
      });

      expect(op).toBeDefined();
      expect(op?.type).toBe('create');
      expect(op?.resourceType).toBe('show');
      expect(op?.resourceId).toBe('test-show-1');
    });

    it('should get offline status from showStore', () => {
      const status = showStore.getOfflineStatus();
      expect(status).toBeDefined();
      expect(status?.isOnline).toBe(true);
    });

    it('should track queued operations', () => {
      showStore.queueOfflineOperation('create', 'show-1', { city: 'Madrid' });
      showStore.queueOfflineOperation('update', 'show-2', { fee: 15000 });

      const queued = offlineManager.getQueuedOperations();
      expect(queued.length).toBe(2);
    });
  });

  describe('Multi-Tab + Offline Scenarios', () => {
    it('should handle show creation with version tracking', () => {
      const newShow: Show = {
        id: 'multi-tab-1',
        city: 'Barcelona',
        country: 'ES',
        lat: 41.3851,
        lng: 2.1734,
        date: '2025-11-20',
        fee: 8000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        status: 'confirmed',
        __version: 1,
        __modifiedAt: Date.now(),
        __modifiedBy: 'tab-a',
      };

      showStore.addShow(newShow);

      const shows = showStore.getAll();
  expect(shows.length).toBe(1);
  const show = shows[0];
  expect(show).toBeDefined();
  if (!show) throw new Error('Expected show entry');
  expect(show.__version).toBe(1);
  expect(show.__modifiedBy).toBe('tab-a');
    });

    it('should detect conflicts with version mismatch', () => {
      const show1: Show = {
        id: 'conflict-test',
        city: 'Madrid',
        country: 'ES',
        lat: 40.4168,
        lng: -3.7038,
        date: '2025-12-10',
        fee: 10000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        status: 'confirmed',
        __version: 1,
        __modifiedAt: 1000,
        __modifiedBy: 'user-1',
      };

      const show2: Show = {
        ...show1,
        __version: 2,
        __modifiedAt: 2000,
        __modifiedBy: 'user-2',
      };

      const hasConflict = multiTabSync.detectConflict(show1, show2);
      expect(hasConflict).toBe(true);
    });

    it('should resolve conflicts using last-write-wins strategy', () => {
      const local: Show = {
        id: 'merge-test',
        city: 'Madrid',
        country: 'ES',
        lat: 40.4168,
        lng: -3.7038,
        date: '2025-12-10',
        fee: 10000,
        feeCurrency: 'EUR',
        fxRateToBase: 1.0,
        status: 'confirmed',
        __version: 1,
        __modifiedAt: 1000,
        __modifiedBy: 'user-1',
      };

      const remote: Show = {
        ...local,
        fee: 12000,
        __version: 2,
        __modifiedAt: 2000,
        __modifiedBy: 'user-2',
      };

      const resolved = multiTabSync.resolveConflict('merge-test', local, remote, 'remote');
      expect(resolved.fee).toBe(12000);
      expect(resolved.__version).toBe(2);
    });
  });

  describe('Offline Operation Lifecycle', () => {
    it('should queue create operations offline', () => {
      const op = showStore.queueOfflineOperation('create', 'offline-1', {
        city: 'Valencia',
        fee: 5000,
      });

      expect(op?.type).toBe('create');
      expect(offlineManager.getQueuedOperations().length).toBe(1);
    });

    it('should queue update operations offline', () => {
      showStore.queueOfflineOperation('update', 'offline-2', {
        fee: 15000,
      });

      const queued = offlineManager.getQueuedOperations();
      expect(queued.some(op => op.type === 'update')).toBe(true);
    });

    it('should queue delete operations offline', () => {
      showStore.queueOfflineOperation('delete', 'offline-3');

      const queued = offlineManager.getQueuedOperations();
      expect(queued.some(op => op.type === 'delete')).toBe(true);
    });

    it('should track total operations count', () => {
      showStore.queueOfflineOperation('create', 'op-1');
      showStore.queueOfflineOperation('update', 'op-2');
      showStore.queueOfflineOperation('delete', 'op-3');

      const queued = offlineManager.getQueuedOperations();
      expect(queued.length).toBe(3);
    });
  });

  describe('Sync Status Management', () => {
    it('should track sync status', () => {
      const initialStatus = multiTabSync.getStatus();
      expect(initialStatus).toBeDefined();

      multiTabSync.setStatus('syncing');
      const syncingStatus = multiTabSync.getStatus();
      expect(syncingStatus).toBe('syncing');

      multiTabSync.setStatus('synced');
      const syncedStatus = multiTabSync.getStatus();
      expect(syncedStatus).toBe('synced');
    });

    it('should provide sync statistics', () => {
      const stats = multiTabSync.getStats();
      expect(stats).toBeDefined();
      expect(stats.status).toBeDefined();
      expect(stats.queueSize).toBeGreaterThanOrEqual(0);
    });

    it('should track offline statistics', () => {
      const state = offlineManager.getState();
      expect(state).toBeDefined();
      expect(state.isOnline).toBe(true);
      expect(state.queuedOperations).toBeDefined();
      expect(Array.isArray(state.queuedOperations)).toBe(true);
    });
  });

  describe('Cleanup & Resource Management', () => {
    it('should cleanup resources on destroy', () => {
      showStore.setAll([
        {
          id: 'cleanup-test',
          city: 'Madrid',
          country: 'ES',
          lat: 40.4168,
          lng: -3.7038,
          date: '2025-12-10',
          fee: 10000,
          feeCurrency: 'EUR',
          fxRateToBase: 1.0,
          status: 'confirmed',
          __version: 1,
          __modifiedAt: Date.now(),
          __modifiedBy: 'test',
        },
      ]);

      // Calling destroy should cleanup without errors
      expect(() => showStore.destroy()).not.toThrow();
    });
  });
});
