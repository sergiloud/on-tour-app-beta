/**
 * Synchronization Tests
 *
 * Tests for multi-tab sync, versioning, and conflict resolution
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { showStore } from '../shared/showStore';
import { type Show, normalizeShow } from '../lib/shows';

describe('Show Versioning & Synchronization', () => {
  beforeEach(() => {
    // Clear store before each test
    showStore.setAll([]);
  });

  describe('Version Increment', () => {
    it('should initialize show with __version = 0', () => {
      const show = normalizeShow({
        id: 'show1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 5000,
        lat: 40.4,
        lng: -3.7
      });

      expect(show.__version).toBe(0);
    });

    it('should increment version on update', () => {
      const show = normalizeShow({
        id: 'show1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 5000,
        lat: 40.4,
        lng: -3.7
      });

      showStore.setAll([show]);

      // Update the show
      showStore.updateShow('show1', { fee: 6000 });

      const updated = showStore.getById('show1');
      expect(updated?.__version).toBe(1);
    });

    it('should increment version multiple times', () => {
      let show = normalizeShow({
        id: 'show1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 5000,
        lat: 40.4,
        lng: -3.7
      });

      showStore.setAll([show]);

      // Update 3 times
      showStore.updateShow('show1', { fee: 6000 });
      showStore.updateShow('show1', { fee: 7000 });
      showStore.updateShow('show1', { fee: 8000 });

      const final = showStore.getById('show1');
      expect(final?.__version).toBe(3);
    });
  });

  describe('Modified Timestamp', () => {
    it('should set __modifiedAt on first normalization', () => {
      const before = Date.now();
      const show = normalizeShow({
        id: 'show1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 5000,
        lat: 40.4,
        lng: -3.7
      });
      const after = Date.now();

      expect(show.__modifiedAt).toBeGreaterThanOrEqual(before);
      expect(show.__modifiedAt).toBeLessThanOrEqual(after);
    });

    it('should update __modifiedAt on show update', async () => {
      const show = normalizeShow({
        id: 'show1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 5000,
        lat: 40.4,
        lng: -3.7
      });

      const originalTime = show.__modifiedAt;
      showStore.setAll([show]);

      // Wait a bit to ensure timestamp differs
      await new Promise(resolve => setTimeout(resolve, 10));

      showStore.updateShow('show1', { fee: 6000 });

      const updated = showStore.getById('show1');
      expect(updated?.__modifiedAt).toBeGreaterThan(originalTime);
    });
  });

  describe('Modified By', () => {
    it('should track who modified the show', () => {
      const show = normalizeShow({
        id: 'show1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 5000,
        lat: 40.4,
        lng: -3.7
      });

      showStore.setAll([show]);
      showStore.updateShow('show1', { fee: 6000 });

      const updated = showStore.getById('show1');
      expect(updated?.__modifiedBy).toBeTruthy();
      expect(typeof updated?.__modifiedBy).toBe('string');
    });
  });

  describe('Conflict Detection', () => {
    it('should detect conflict when versions differ and timestamps differ', () => {
      const local = {
        id: 'show1',
        __version: 2,
        __modifiedAt: 2000
      };

      const remote = {
        id: 'show1',
        __version: 1,
        __modifiedAt: 1000
      };

      const conflict =
        local.__version !== remote.__version &&
        local.__modifiedAt !== remote.__modifiedAt;

      expect(conflict).toBe(true);
    });

    it('should not detect conflict when versions match', () => {
      const local = {
        id: 'show1',
        __version: 1,
        __modifiedAt: 1000
      };

      const remote = {
        id: 'show1',
        __version: 1,
        __modifiedAt: 1000
      };

      const conflict =
        local.__version !== remote.__version &&
        local.__modifiedAt !== remote.__modifiedAt;

      expect(conflict).toBe(false);
    });
  });

  describe('Multi-Tab Sync (simulated)', () => {
    it('should handle setAll with version normalization', () => {
      const shows = [
        {
          id: 'show1',
          city: 'Madrid',
          country: 'ES',
          date: '2025-12-10',
          fee: 5000,
          lat: 40.4,
          lng: -3.7
        },
        {
          id: 'show2',
          city: 'Paris',
          country: 'FR',
          date: '2025-12-11',
          fee: 6000,
          lat: 48.8,
          lng: 2.3
        }
      ];

      showStore.setAll(shows as any);

      const stored = showStore.getAll();
      expect(stored.length).toBe(2);
      expect(stored[0]?.__version).toBe(0);
      expect(stored[1]?.__version).toBe(0);
      expect(stored[0]?.__modifiedAt).toBeTruthy();
      expect(stored[1]?.__modifiedAt).toBeTruthy();
    });

    it('should persist version across localStorage', () => {
      const show = normalizeShow({
        id: 'show1',
        city: 'Madrid',
        country: 'ES',
        date: '2025-12-10',
        fee: 5000,
        lat: 40.4,
        lng: -3.7
      });

      showStore.setAll([show]);
      showStore.updateShow('show1', { fee: 6000 });

      const updated = showStore.getById('show1');
      expect(updated?.__version).toBe(1);

      // Version should be persisted in localStorage
      const stored = localStorage.getItem('shows-store-v3');
      expect(stored).toBeTruthy();
      const parsed = JSON.parse(stored!);
      expect(parsed[0].__version).toBe(1);
    });
  });

  describe('Conflict Resolution: Last-Write-Wins', () => {
    it('should resolve conflict using most recent timestamp', () => {
      const local = {
        id: 'show1',
        fee: 6000,
        __version: 2,
        __modifiedAt: 2000
      };

      const remote = {
        id: 'show1',
        fee: 5000,
        __version: 1,
        __modifiedAt: 1000
      };

      // Last-write-wins: local is more recent
      const resolved = local.__modifiedAt > remote.__modifiedAt ? local : remote;
      expect(resolved.fee).toBe(6000);
    });

    it('should apply remote if more recent', () => {
      const local = {
        id: 'show1',
        fee: 5000,
        __version: 1,
        __modifiedAt: 1000
      };

      const remote = {
        id: 'show1',
        fee: 6000,
        __version: 2,
        __modifiedAt: 2000
      };

      const resolved = local.__modifiedAt > remote.__modifiedAt ? local : remote;
      expect(resolved.fee).toBe(6000);
    });
  });

  describe('Batch Operations with Versioning', () => {
    it('should maintain versions after batch add', () => {
      showStore.setAll([
        normalizeShow({
          id: 'show1',
          city: 'Madrid',
          country: 'ES',
          date: '2025-12-10',
          fee: 5000,
          lat: 40.4,
          lng: -3.7
        })
      ]);

      showStore.addShow(
        normalizeShow({
          id: 'show2',
          city: 'Paris',
          country: 'FR',
          date: '2025-12-11',
          fee: 6000,
          lat: 48.8,
          lng: 2.3
        })
      );

      const all = showStore.getAll();
      expect(all[0]?.__version).toBe(0);
      expect(all[1]?.__version).toBe(0); // New show starts at 0
    });

    it('should maintain versions after remove', () => {
      const shows = [
        normalizeShow({
          id: 'show1',
          city: 'Madrid',
          country: 'ES',
          date: '2025-12-10',
          fee: 5000,
          lat: 40.4,
          lng: -3.7
        }),
        normalizeShow({
          id: 'show2',
          city: 'Paris',
          country: 'FR',
          date: '2025-12-11',
          fee: 6000,
          lat: 48.8,
          lng: 2.3
        })
      ];

      showStore.setAll(shows);
      showStore.updateShow('show1', { fee: 5500 });

      expect(showStore.getById('show1')?.__version).toBe(1);
      expect(showStore.getById('show2')?.__version).toBe(0);

      showStore.removeShow('show1');

      expect(showStore.getById('show1')).toBeUndefined();
      expect(showStore.getById('show2')?.__version).toBe(0);
    });
  });
});
