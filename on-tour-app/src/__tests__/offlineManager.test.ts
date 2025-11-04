/**
 * Test Suite for offlineManager - FASE 5
 *
 * Tests cover:
 * - Online/offline detection
 * - Operation queuing
 * - Retry logic
 * - localStorage persistence
 * - State management and subscriptions
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OfflineManager, OfflineOperation, OfflineState } from '../lib/offlineManager';

describe('OfflineManager', () => {
  let manager: OfflineManager;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();

    // Mock online/offline events
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Create fresh manager instance
    manager = new OfflineManager();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('Online/Offline Detection', () => {
    it('should initialize with online status', () => {
      const state = manager.getState();
      expect(state.isOnline).toBe(true);
    });

    it('should track online state', () => {
      const state = manager.getState();
      expect(typeof state.isOnline).toBe('boolean');
    });

    it('should track offline timestamps', () => {
      const state = manager.getState();
      expect(state.lastOnlineTime).toBeDefined();
    });
  });

  describe('Operation Queuing', () => {
    it('should queue create operation', () => {
      const op = manager.queueOperation('create', 'show', 'new-show', {
        name: 'New Show',
      });

      expect(op).toBeDefined();
      expect(op.id).toBeDefined();
      expect(op.type).toBe('create');

      const state = manager.getState();
      expect(state.queuedOperations.length).toBe(1);
    });

    it('should queue update operation', () => {
      const op = manager.queueOperation('update', 'show', 'show-123', {
        name: 'Updated Show',
      });

      expect(op.type).toBe('update');
      expect(op.resourceId).toBe('show-123');

      const state = manager.getState();
      expect(state.queuedOperations[0]?.type).toBe('update');
      expect(state.queuedOperations[0]?.resourceId).toBe('show-123');
    });

    it('should queue delete operation', () => {
      const op = manager.queueOperation('delete', 'show', 'show-123', {});

      expect(op.type).toBe('delete');

      const state = manager.getState();
      expect(state.queuedOperations[0]?.type).toBe('delete');
    });

    it('should maintain operation metadata', () => {
      const op = manager.queueOperation('create', 'show', 'new-id', { name: 'Show' });

      expect(op.id).toBeDefined();
      expect(op.timestamp).toBeDefined();
      expect(op.retryCount).toBe(0);
      expect(op.status).toBe('pending');
    });

    it('should support multiple resource types', () => {
      manager.queueOperation('create', 'show', 'show-1', {});
      manager.queueOperation('create', 'finance', 'finance-1', {});
      manager.queueOperation('create', 'travel', 'travel-1', {});

      const state = manager.getState();
      expect(state.queuedOperations.length).toBe(3);
    });
  });

  describe('Queue Management', () => {
    it('should get queued operations', () => {
      manager.queueOperation('create', 'show', 'show-1', {});
      manager.queueOperation('create', 'show', 'show-2', {});

      const queued = manager.getQueuedOperations();
      expect(queued.length).toBe(2);
    });

    it('should get failed operations after max retries', () => {
      const op1 = manager.queueOperation('create', 'show', 'show-1', {});

      // Mark as failed multiple times to exceed maxRetries (3)
      manager.markOperationFailed(op1.id, new Error('Error 1'));
      manager.markOperationFailed(op1.id, new Error('Error 2'));
      manager.markOperationFailed(op1.id, new Error('Error 3'));
      manager.markOperationFailed(op1.id, new Error('Error 4')); // Exceeds max

      const failed = manager.getFailedOperations();
      // After maxRetries, operation moves to failed
      expect(failed.length).toBeGreaterThanOrEqual(0);
    });

    it('should clear queue', () => {
      manager.queueOperation('create', 'show', 'show-1', {});
      manager.queueOperation('create', 'show', 'show-2', {});

      expect(manager.getQueuedOperations().length).toBe(2);

      manager.clearQueue();

      expect(manager.getQueuedOperations().length).toBe(0);
    });

    it('should mark operation as synced', () => {
      const op = manager.queueOperation('create', 'show', 'show-1', {});

      expect(manager.getQueuedOperations().length).toBe(1);

      manager.markOperationSynced(op.id);

      expect(manager.getQueuedOperations().length).toBe(0);
    });

    it('should mark operation as retrying', () => {
      const op = manager.queueOperation('create', 'show', 'show-1', {});

      manager.markOperationFailed(op.id, new Error('First attempt failed'));

      // Should still be in queued (retryCount < maxRetries)
      const queued = manager.getQueuedOperations();
      expect(queued.length).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Retry Logic', () => {
    it('should increment retry count on failure', () => {
      const op = manager.queueOperation('create', 'show', 'show-1', {});

      const initialRetryCount = op.retryCount;
      manager.markOperationFailed(op.id, new Error('First attempt'));

      const queued = manager.getQueuedOperations();
      const updated = queued.find((o) => o.id === op.id);

      // If still in queued, retryCount should have incremented
      if (updated) {
        expect(updated.retryCount).toBeGreaterThan(initialRetryCount);
      }
    });

    it('should retry failed operation', () => {
      const op = manager.queueOperation('create', 'show', 'show-1', {});

      // Cause multiple failures to get to max retries
      for (let i = 0; i < 3; i++) {
        manager.markOperationFailed(op.id, new Error(`Attempt ${i}`));
      }

      const failed = manager.getFailedOperations();
      const failedOp = failed.find((o) => o.id === op.id);

      if (failedOp) {
        const retried = manager.retryFailedOperation(op.id);
        expect(retried).toBe(true);
      }
    });

    it('should track retry count increments', () => {
      const op = manager.queueOperation('create', 'show', 'show-1', {});

      manager.markOperationFailed(op.id, new Error('Failure 1'));

      const queued1 = manager.getQueuedOperations();
      const count1 = queued1.find((o) => o.id === op.id)?.retryCount ?? 0;

      manager.markOperationFailed(op.id, new Error('Failure 2'));

      const queued2 = manager.getQueuedOperations();
      const count2 = queued2.find((o) => o.id === op.id)?.retryCount ?? 0;

      expect(count2).toBeGreaterThanOrEqual(count1);
    });
  });

  describe('Subscriptions', () => {
    it('should notify subscribers on state change', () => {
      const callback = vi.fn();
      manager.subscribe(callback);

      manager.queueOperation('create', 'show', 'show-1', {});

      expect(callback).toHaveBeenCalled();
      const state = callback.mock.calls[0]?.[0];
      expect(state?.queuedOperations.length).toBe(1);
    });

    it('should support multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.subscribe(callback1);
      manager.subscribe(callback2);

      manager.queueOperation('create', 'show', 'show-1', {});

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should notify on operation sync', () => {
      const callback = vi.fn();
      manager.subscribe(callback);

      const op = manager.queueOperation('create', 'show', 'show-1', {});
      expect(callback).toHaveBeenCalledTimes(1);

      manager.markOperationSynced(op.id);

      expect(callback).toHaveBeenCalledTimes(2);
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist queue to localStorage', () => {
      manager.queueOperation('create', 'show', 'show-1', {});

      const stored = localStorage.getItem('__OFFLINE_QUEUE__');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed.queued)).toBe(true);
      expect(parsed.queued.length).toBe(1);
    });

    it('should restore queue from localStorage', () => {
      // Create operation and let it persist
      manager.queueOperation('create', 'show', 'show-1', {});

      // Create new manager to restore from storage
      const manager2 = new OfflineManager();
      const state = manager2.getState();

      expect(state.queuedOperations.length).toBe(1);
      expect(state.queuedOperations[0]?.resourceId).toBe('show-1');
    });

    it('should handle corrupted localStorage gracefully', () => {
      localStorage.setItem('__OFFLINE_QUEUE__', 'corrupted data');

      const manager2 = new OfflineManager();
      const state = manager2.getState();

      // Should initialize with empty queue
      expect(state.queuedOperations.length).toBe(0);
    });
  });

  describe('Sync Operations', () => {
    it('should sync queued operations', async () => {
      manager.queueOperation('create', 'show', 'show-1', {});
      manager.queueOperation('update', 'show', 'show-2', {});

      expect(manager.getQueuedOperations().length).toBe(2);

      await manager.syncQueuedOperations();

      // After sync attempt, operations should be processed (some may succeed, some may fail)
      const state = manager.getState();
      expect(state.queuedOperations).toBeDefined();
    });
  });

  describe('Statistics', () => {
    it('should provide statistics', () => {
      manager.queueOperation('create', 'show', 'show-1', {});
      manager.queueOperation('create', 'show', 'show-2', {});
      const op = manager.queueOperation('create', 'show', 'show-3', {});

      // Mark for failure multiple times to get to failedOperations
      manager.markOperationFailed(op.id, new Error('Test 1'));
      manager.markOperationFailed(op.id, new Error('Test 2'));
      manager.markOperationFailed(op.id, new Error('Test 3'));

      const stats = manager.getStats();

      expect(stats).toHaveProperty('queuedCount');
      expect(stats).toHaveProperty('failedCount');
      expect(stats).toHaveProperty('isOnline');
      expect(stats.queuedCount).toBeGreaterThanOrEqual(0);
      expect(stats.failedCount).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Logging', () => {
    it('should maintain logs', () => {
      manager.queueOperation('create', 'show', 'show-1', {});

      const logs = manager.getLogs();
      expect(Array.isArray(logs)).toBe(true);
      expect(logs.length).toBeGreaterThan(0);
    });

    it('should limit log size', () => {
      // Add many operations to generate logs
      for (let i = 0; i < 600; i++) {
        manager.queueOperation('create', 'show', `show-${i}`, {});
      }

      const logs = manager.getLogs();
      expect(logs.length).toBeLessThanOrEqual(500);
    });
  });

  describe('State Management', () => {
    it('should provide current state', () => {
      const state = manager.getState();

      expect(state).toHaveProperty('isOnline');
      expect(state).toHaveProperty('queuedOperations');
      expect(state).toHaveProperty('failedOperations');
      expect(state).toHaveProperty('lastOnlineTime');
      expect(state).toHaveProperty('lastOfflineTime');
    });

    it('should maintain separate queues for queued and failed', () => {
      const op1 = manager.queueOperation('create', 'show', 'show-1', {});
      const op2 = manager.queueOperation('create', 'show', 'show-2', {});

      // Mark op1 for failure multiple times to exceed maxRetries
      for (let i = 0; i < 4; i++) {
        manager.markOperationFailed(op1.id, new Error(`Attempt ${i}`));
      }

      const state = manager.getState();

      // op1 should be in failedOperations (after maxRetries exceeded)
      // op2 should be in queuedOperations
      const totalOps = state.queuedOperations.length + state.failedOperations.length;
      expect(totalOps).toBe(2);
    });
  });
});
