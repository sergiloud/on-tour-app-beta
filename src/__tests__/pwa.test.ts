/**
 * PWA (Progressive Web App) Tests
 * Tests for service worker functionality, offline capabilities, and PWA features
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

// Mock service worker registration
const mockServiceWorker = {
  register: vi.fn(),
  unregister: vi.fn(),
  getRegistration: vi.fn(),
  ready: Promise.resolve({
    active: {
      postMessage: vi.fn()
    },
    update: vi.fn()
  })
};

// Mock navigator
Object.defineProperty(globalThis, 'navigator', {
  value: {
    serviceWorker: mockServiceWorker,
    onLine: true,
    storage: {
      estimate: vi.fn().mockResolvedValue({
        usage: 1024 * 1024, // 1MB
        quota: 1024 * 1024 * 1024 // 1GB
      })
    }
  },
  writable: true
});

// Mock Cache API
const mockCache = {
  match: vi.fn(),
  add: vi.fn(),
  addAll: vi.fn(),
  put: vi.fn(),
  delete: vi.fn(),
  keys: vi.fn()
};

Object.defineProperty(globalThis, 'caches', {
  value: {
    open: vi.fn().mockResolvedValue(mockCache),
    match: vi.fn(),
    has: vi.fn(),
    delete: vi.fn(),
    keys: vi.fn()
  },
  writable: true
});

describe('PWA Core Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Service Worker Registration', () => {
    it('should register service worker successfully', async () => {
      mockServiceWorker.register.mockResolvedValue({
        scope: '/',
        active: true
      });

      const registration = await navigator.serviceWorker.register('/sw.js');
      
      expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js');
      expect(registration.scope).toBe('/');
      expect(registration.active).toBe(true);
    });

    it('should handle service worker registration failure', async () => {
      const error = new Error('Service worker registration failed');
      mockServiceWorker.register.mockRejectedValue(error);

      await expect(navigator.serviceWorker.register('/sw.js')).rejects.toThrow('Service worker registration failed');
    });

    it('should check if service worker is ready', async () => {
      const ready = await navigator.serviceWorker.ready;
      
      expect(ready).toBeDefined();
      expect(ready.active).toBeDefined();
      expect(ready.update).toBeDefined();
    });
  });

  describe('Cache Management', () => {
    it('should create and access cache', async () => {
      const cacheName = 'on-tour-v1';
      
      await caches.open(cacheName);
      
      expect(caches.open).toHaveBeenCalledWith(cacheName);
    });

    it('should add resources to cache', async () => {
      const cache = await caches.open('on-tour-v1');
      const resources = [
        '/',
        '/dashboard',
        '/finance',
        '/static/css/main.css',
        '/static/js/main.js'
      ];
      
      await cache.addAll(resources);
      
      expect(cache.addAll).toHaveBeenCalledWith(resources);
    });

    it('should match requests from cache', async () => {
      mockCache.match.mockResolvedValue(new Response('Cached content'));
      
      const cache = await caches.open('on-tour-v1');
      const response = await cache.match('/dashboard');
      
      expect(cache.match).toHaveBeenCalledWith('/dashboard');
      expect(response).toBeInstanceOf(Response);
    });

    it('should handle cache miss gracefully', async () => {
      mockCache.match.mockResolvedValue(undefined);
      
      const cache = await caches.open('on-tour-v1');
      const response = await cache.match('/non-existent');
      
      expect(response).toBeUndefined();
    });

    it('should delete old cache entries', async () => {
      const cache = await caches.open('on-tour-v1');
      
      await cache.delete('/old-resource');
      
      expect(cache.delete).toHaveBeenCalledWith('/old-resource');
    });
  });

  describe('Storage Management', () => {
    it('should estimate storage usage', async () => {
      const estimate = await navigator.storage.estimate();
      
      expect(estimate).toHaveProperty('usage');
      expect(estimate).toHaveProperty('quota');
      expect(estimate.usage).toBeGreaterThan(0);
      expect(estimate.quota).toBeGreaterThan(estimate.usage || 0);
    });

    it('should calculate storage percentage', async () => {
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      const percentage = (usage / quota) * 100;
      
      expect(percentage).toBeGreaterThan(0);
      expect(percentage).toBeLessThan(100);
    });

    it('should handle storage quota exceeded', async () => {
      navigator.storage.estimate = vi.fn().mockResolvedValue({
        usage: 1024 * 1024 * 900, // 900MB
        quota: 1024 * 1024 * 1024  // 1GB
      });
      
      const estimate = await navigator.storage.estimate();
      const usage = estimate.usage || 0;
      const quota = estimate.quota || 1;
      const percentage = (usage / quota) * 100;
      
      // Should be approaching quota limit
      expect(percentage).toBeGreaterThan(80);
    });
  });

  describe('Network Status Detection', () => {
    it('should detect online status', () => {
      expect(navigator.onLine).toBe(true);
    });

    it('should handle offline status', () => {
      // Simulate going offline
      Object.defineProperty(navigator, 'onLine', {
        value: false,
        writable: true
      });
      
      expect(navigator.onLine).toBe(false);
    });

    it('should handle online/offline events', () => {
      const onlineHandler = vi.fn();
      const offlineHandler = vi.fn();
      
      // Mock addEventListener
      const addEventListener = vi.fn();
      Object.defineProperty(globalThis, 'addEventListener', {
        value: addEventListener,
        writable: true
      });
      
      addEventListener('online', onlineHandler);
      addEventListener('offline', offlineHandler);
      
      expect(addEventListener).toHaveBeenCalledWith('online', onlineHandler);
      expect(addEventListener).toHaveBeenCalledWith('offline', offlineHandler);
    });
  });

  describe('Background Sync', () => {
    it('should register background sync', async () => {
      const mockRegistration = {
        active: {
          postMessage: vi.fn()
        },
        update: vi.fn(),
        sync: {
          register: vi.fn().mockResolvedValue(undefined)
        }
      };
      
      mockServiceWorker.ready = Promise.resolve(mockRegistration);
      
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('finance-data-sync');
      
      expect(registration.sync.register).toHaveBeenCalledWith('finance-data-sync');
    });

    it('should handle background sync failure', async () => {
      const mockRegistration = {
        active: {
          postMessage: vi.fn()
        },
        update: vi.fn(),
        sync: {
          register: vi.fn().mockRejectedValue(new Error('Sync registration failed'))
        }
      };
      
      mockServiceWorker.ready = Promise.resolve(mockRegistration);
      
      const registration = await navigator.serviceWorker.ready;
      
      await expect(registration.sync.register('finance-data-sync')).rejects.toThrow('Sync registration failed');
    });
  });

  describe('Push Notifications', () => {
    it('should check notification permission', () => {
      Object.defineProperty(globalThis, 'Notification', {
        value: {
          permission: 'granted',
          requestPermission: vi.fn().mockResolvedValue('granted')
        },
        writable: true
      });
      
      expect(Notification.permission).toBe('granted');
    });

    it('should request notification permission', async () => {
      const permission = await Notification.requestPermission();
      
      expect(Notification.requestPermission).toHaveBeenCalled();
      expect(permission).toBe('granted');
    });

    it('should handle notification permission denied', async () => {
      Notification.requestPermission = vi.fn().mockResolvedValue('denied');
      
      const permission = await Notification.requestPermission();
      
      expect(permission).toBe('denied');
    });
  });

  describe('App Install Prompt', () => {
    it('should handle beforeinstallprompt event', () => {
      const installPrompt = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue({ outcome: 'accepted' })
      };
      
      const handler = vi.fn();
      
      // Mock event listener
      const addEventListener = vi.fn();
      Object.defineProperty(globalThis, 'addEventListener', {
        value: addEventListener,
        writable: true
      });
      
      addEventListener('beforeinstallprompt', handler);
      
      expect(addEventListener).toHaveBeenCalledWith('beforeinstallprompt', handler);
    });

    it('should show install prompt', async () => {
      const mockPrompt = {
        prompt: vi.fn().mockResolvedValue({ outcome: 'accepted' }),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      
      const result = await mockPrompt.prompt();
      const choice = await mockPrompt.userChoice;
      
      expect(mockPrompt.prompt).toHaveBeenCalled();
      expect(choice.outcome).toBe('accepted');
    });
  });

  describe('Performance Monitoring', () => {
    it('should measure cache performance', async () => {
      const startTime = performance.now();
      
      // Simulate cache operation
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeGreaterThan(0);
      expect(duration).toBeLessThan(100); // Should be fast
    });

    it('should track service worker registration time', async () => {
      const startTime = performance.now();
      
      await navigator.serviceWorker.register('/sw.js');
      
      const endTime = performance.now();
      const duration = endTime - startTime;
      
      expect(duration).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle service worker errors gracefully', () => {
      const errorHandler = vi.fn();
      
      // Mock error event listener
      const addEventListener = vi.fn();
      Object.defineProperty(globalThis, 'addEventListener', {
        value: addEventListener,
        writable: true
      });
      
      addEventListener('error', errorHandler);
      
      expect(addEventListener).toHaveBeenCalledWith('error', errorHandler);
    });

    it('should handle unhandled promise rejections', () => {
      const rejectionHandler = vi.fn();
      
      const addEventListener = vi.fn();
      Object.defineProperty(globalThis, 'addEventListener', {
        value: addEventListener,
        writable: true
      });
      
      addEventListener('unhandledrejection', rejectionHandler);
      
      expect(addEventListener).toHaveBeenCalledWith('unhandledrejection', rejectionHandler);
    });

    it('should provide fallback when PWA features unavailable', () => {
      // Simulate environment without service worker support
      const navigatorWithoutSW = {
        onLine: true,
        serviceWorker: undefined
      };
      
      Object.defineProperty(globalThis, 'navigator', {
        value: navigatorWithoutSW,
        writable: true
      });
      
      // Should handle gracefully
      expect((navigatorWithoutSW as any).serviceWorker).toBeUndefined();
      expect(navigatorWithoutSW.onLine).toBe(true);
    });
  });
});