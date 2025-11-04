/**
 * Test Suite for multiTabSync - FASE 5
 *
 * Tests cover:
 * - Event broadcasting between tabs
 * - Conflict detection and resolution
 * - Event queue management
 * - localStorage persistence
 * - Status tracking
 * - Tab coordination
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { MultiTabSyncManager, SyncEvent } from '../lib/multiTabSync';

describe('MultiTabSyncManager', () => {
  let manager: MultiTabSyncManager;
  let broadcastChannelMock: any;

  beforeEach(() => {
    // Clear localStorage before each test
    localStorage.clear();
    sessionStorage.clear();

    // Mock BroadcastChannel
    broadcastChannelMock = {
      postMessage: vi.fn(),
      onmessage: null,
      onerror: null,
      close: vi.fn(),
    };

    global.BroadcastChannel = vi.fn(() => broadcastChannelMock) as any;

    // Create fresh manager instance
    manager = new MultiTabSyncManager();
  });

  afterEach(() => {
    localStorage.clear();
    sessionStorage.clear();
  });

  describe('Event Broadcasting', () => {
    it('should broadcast event to all tabs', () => {
      const event: Omit<SyncEvent, 'source' | 'timestamp' | 'version'> = {
        type: 'shows-updated',
        payload: { id: '123', name: 'Show 1' },
      };

      manager.broadcast(event);

      expect(broadcastChannelMock.postMessage).toHaveBeenCalled();

      // Verify the call includes correct fields
      const calledWith = broadcastChannelMock.postMessage.mock.calls[0][0];
      expect(calledWith.type).toBe('shows-updated');
      expect(calledWith.payload).toEqual(event.payload);
      expect(calledWith.source).toBeDefined();
      expect(calledWith.timestamp).toBeDefined();
      expect(calledWith.version).toBeDefined();
    });

    it('should broadcast create event', () => {
      const event: Omit<SyncEvent, 'source' | 'timestamp' | 'version'> = {
        type: 'show-created',
        payload: { id: 'new-id', name: 'New Show' },
      };

      manager.broadcast(event);

      expect(broadcastChannelMock.postMessage).toHaveBeenCalled();
      const calledWith = broadcastChannelMock.postMessage.mock.calls[0][0];
      expect(calledWith.type).toBe('show-created');
    });

    it('should broadcast delete event', () => {
      const event: Omit<SyncEvent, 'source' | 'timestamp' | 'version'> = {
        type: 'show-deleted',
        payload: { id: '123' },
      };

      manager.broadcast(event);

      expect(broadcastChannelMock.postMessage).toHaveBeenCalled();
      const calledWith = broadcastChannelMock.postMessage.mock.calls[0][0];
      expect(calledWith.type).toBe('show-deleted');
    });

    it('should broadcast sync events', () => {
      manager.broadcast({
        type: 'sync-start',
        payload: {},
      });

      manager.broadcast({
        type: 'sync-complete',
        payload: { syncedCount: 5 },
      });

      expect(broadcastChannelMock.postMessage).toHaveBeenCalledTimes(2);
    });
  });

  describe('Event Subscription', () => {
    it('should subscribe to event type', () => {
      const callback = vi.fn();
      manager.subscribe('shows-updated', callback);

      const event: SyncEvent = {
        type: 'shows-updated',
        payload: { id: '123' },
        timestamp: Date.now(),
        source: 'other-tab',
        version: 1,
      };

      // Simulate receiving message
      broadcastChannelMock.onmessage?.({ data: event });

      expect(callback).toHaveBeenCalledWith(event);
    });

    it('should return unsubscribe function', () => {
      const callback = vi.fn();
      const unsubscribe = manager.subscribe('shows-updated', callback);

      expect(typeof unsubscribe).toBe('function');

      const event: SyncEvent = {
        type: 'shows-updated',
        payload: { id: '123' },
        timestamp: Date.now(),
        source: 'other-tab',
        version: 1,
      };

      unsubscribe();
      broadcastChannelMock.onmessage?.({ data: event });

      // Should not be called after unsubscribe
      expect(callback).not.toHaveBeenCalled();
    });

    it('should support multiple subscribers', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      manager.subscribe('shows-updated', callback1);
      manager.subscribe('shows-updated', callback2);

      const event: SyncEvent = {
        type: 'shows-updated',
        payload: { id: '123' },
        timestamp: Date.now(),
        source: 'other-tab',
        version: 1,
      };

      broadcastChannelMock.onmessage?.({ data: event });

      expect(callback1).toHaveBeenCalledWith(event);
      expect(callback2).toHaveBeenCalledWith(event);
    });

    it('should not call subscribers for other event types', () => {
      const callback = vi.fn();
      manager.subscribe('shows-updated', callback);

      const event: SyncEvent = {
        type: 'show-created',
        payload: { id: '123' },
        timestamp: Date.now(),
        source: 'other-tab',
        version: 1,
      };

      broadcastChannelMock.onmessage?.({ data: event });

      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Conflict Detection', () => {
    it('should detect no conflict when versions match', () => {
      const local = { __version: 1, __modifiedAt: 100, name: 'Show 1' };
      const remote = { __version: 1, __modifiedAt: 100, name: 'Show 1' };

      const conflict = manager.detectConflict(local, remote);

      expect(conflict).toBe(false);
    });

    it('should detect conflict when both version and timestamp differ', () => {
      const local = { __version: 1, __modifiedAt: 100, name: 'Show 1' };
      const remote = { __version: 2, __modifiedAt: 200, name: 'Show 1' };

      const conflict = manager.detectConflict(local, remote);

      expect(conflict).toBe(true);
    });

    it('should not detect conflict when only version differs but timestamp matches', () => {
      const local = { __version: 1, __modifiedAt: 100, name: 'Show 1' };
      const remote = { __version: 2, __modifiedAt: 100, name: 'Show 1' };

      const conflict = manager.detectConflict(local, remote);

      expect(conflict).toBe(false);
    });

    it('should not detect conflict when only timestamp differs but version matches', () => {
      const local = { __version: 1, __modifiedAt: 100, name: 'Show 1' };
      const remote = { __version: 1, __modifiedAt: 200, name: 'Show 1' };

      const conflict = manager.detectConflict(local, remote);

      expect(conflict).toBe(false);
    });

    it('should detect no conflict when fields differ but metadata matches', () => {
      const local = { __version: 1, __modifiedAt: 100, name: 'Show 1' };
      const remote = { __version: 1, __modifiedAt: 100, name: 'Show 2' };

      const conflict = manager.detectConflict(local, remote);

      expect(conflict).toBe(false);
    });
  });

  describe('Conflict Resolution', () => {
    it('should resolve conflict with "local" strategy', () => {
      const local = { __version: 1, __modifiedAt: 100, name: 'Show 1' };
      const remote = { __version: 2, __modifiedAt: 200, name: 'Show 2' };

      const resolved = manager.resolveConflict(
        'show-123',
        local,
        remote,
        'local'
      );

      expect(resolved).toEqual(local);
    });

    it('should resolve conflict with "remote" strategy', () => {
      const local = { __version: 1, __modifiedAt: 100, name: 'Show 1' };
      const remote = { __version: 2, __modifiedAt: 200, name: 'Show 2' };

      const resolved = manager.resolveConflict(
        'show-123',
        local,
        remote,
        'remote'
      );

      expect(resolved).toEqual(remote);
    });

    it('should resolve conflict with "merge" strategy', () => {
      const local = {
        __version: 1,
        __modifiedAt: 100,
        name: 'Show 1',
        budget: 1000,
      };
      const remote = {
        __version: 2,
        __modifiedAt: 200,
        name: 'Show 2',
        budget: 500,
      };

      const resolved = manager.resolveConflict(
        'show-123',
        local,
        remote,
        'merge'
      );

      // Merge strategy: field-by-field comparison
      // - Metadata (__*): use remote (more recent with __modifiedAt: 200 > 100)
      // - Numeric fields: use max (budget: 1000 > 500)
      // - String/Other fields: keeps local (name stays 'Show 1')
      expect(resolved).toHaveProperty('name', 'Show 1'); // Kept from local
      expect(resolved).toHaveProperty('budget', 1000); // Max of numbers
      // Metadata should be from remote (more recent)
      expect(resolved.__modifiedAt).toBe(200);
      expect(resolved.__version).toBe(2);
    });

    it('should log conflict resolution', () => {
      const local = { __version: 1, __modifiedAt: 100, name: 'Show 1' };
      const remote = { __version: 2, __modifiedAt: 200, name: 'Show 2' };

      manager.resolveConflict('show-123', local, remote, 'local');

      const stats = manager.getStats();
      expect(stats.conflictCount).toBeGreaterThan(0);
    });
  });

  describe('Event Queue (Offline Support)', () => {
    it('should maintain queue', () => {
      // Broadcast adds to queue automatically
      manager.broadcast({
        type: 'shows-updated',
        payload: { id: '123' },
      });

      const queue = manager.getEventQueue();
      expect(queue.length).toBeGreaterThan(0);
    });

    it('should maintain queue size limit', () => {
      // Add events up to limit
      for (let i = 0; i < 1200; i++) {
        manager.broadcast({
          type: 'shows-updated',
          payload: { id: `show-${i}` },
        });
      }

      const queue = manager.getEventQueue();
      expect(queue.length).toBeLessThanOrEqual(1000);
    });

    it('should clear queue', () => {
      manager.broadcast({
        type: 'shows-updated',
        payload: { id: '123' },
      });

      expect(manager.getEventQueue().length).toBeGreaterThan(0);

      manager.clearEventQueue();

      expect(manager.getEventQueue().length).toBe(0);
    });
  });

  describe('localStorage Persistence', () => {
    it('should persist queue to localStorage', () => {
      manager.broadcast({
        type: 'shows-updated',
        payload: { id: '123' },
      });

      const stored = localStorage.getItem('__SYNC_QUEUE__');
      expect(stored).toBeDefined();

      const parsed = JSON.parse(stored!);
      expect(Array.isArray(parsed)).toBe(true);
      expect(parsed.length).toBeGreaterThan(0);
    });

    it('should restore queue from localStorage', () => {
      const event: SyncEvent = {
        type: 'shows-updated',
        payload: { id: '123' },
        timestamp: Date.now(),
        source: 'tab-123',
        version: 1,
      };

      localStorage.setItem('__SYNC_QUEUE__', JSON.stringify([event]));

      const restoredQueue = manager.restoreQueueFromStorage();

      expect(restoredQueue.length).toBeGreaterThan(0);
      if (restoredQueue[0]) {
        expect(restoredQueue[0].type).toBe('shows-updated');
      }
    });
  });

  describe('Status Tracking', () => {
    it('should initialize with idle status', () => {
      expect(manager.getStatus()).toBe('idle');
    });

    it('should set status', () => {
      manager.setStatus('syncing');
      expect(manager.getStatus()).toBe('syncing');

      manager.setStatus('synced');
      expect(manager.getStatus()).toBe('synced');

      manager.setStatus('conflict');
      expect(manager.getStatus()).toBe('conflict');

      manager.setStatus('offline');
      expect(manager.getStatus()).toBe('offline');

      manager.setStatus('error');
      expect(manager.getStatus()).toBe('error');
    });

    it('should track time since last sync', () => {
      manager.setStatus('synced');
      const stats = manager.getStats();

      expect(stats.timeSinceLastSync).toBeDefined();
      expect(stats.timeSinceLastSync).toBeGreaterThanOrEqual(0);
    });
  });

  describe('Force Sync', () => {
    it('should trigger sync', () => {
      const callback = vi.fn();
      manager.subscribe('sync-start', callback);

      manager.forceSync();

      // Should broadcast sync-start event
      expect(broadcastChannelMock.postMessage).toHaveBeenCalled();

      // Verify sync was triggered
      const calledWith = broadcastChannelMock.postMessage.mock.calls[0][0];
      expect(calledWith.type).toBe('sync-start');
    });
  });

  describe('Statistics', () => {
    it('should provide statistics', () => {
      const stats = manager.getStats();

      expect(stats).toHaveProperty('status');
      expect(stats).toHaveProperty('queueSize');
      expect(stats).toHaveProperty('conflictCount');
      expect(stats).toHaveProperty('timeSinceLastSync');
      expect(stats).toHaveProperty('logCount');
    });

    it('should update queue size on broadcast', () => {
      const statsBefore = manager.getStats();

      manager.broadcast({
        type: 'shows-updated',
        payload: { id: '123' },
      });

      const statsAfter = manager.getStats();

      expect(statsAfter.queueSize).toBeGreaterThanOrEqual(
        statsBefore.queueSize
      );
    });
  });
});
