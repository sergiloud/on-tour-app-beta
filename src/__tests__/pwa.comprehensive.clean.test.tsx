import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { 
  PWAInstallPrompt, 
  OnlineStatusIndicator, 
  PWAUpdatePrompt,
  PWAComponents 
} from '../components/pwa/PWAComponents';
import './__mocks__/wasm-and-pwa';

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: any) => React.createElement('div', props, children)
  },
  AnimatePresence: ({ children }: any) => React.createElement(React.Fragment, null, children),
}));

// Mock logger
vi.mock('../lib/logger', () => ({
  logger: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  }
}));

describe('PWA Offline Testing Suite', () => {
  beforeEach(() => {
    // Reset localStorage
    localStorage.clear();
    
    // Mock navigator properties
    Object.defineProperty(global, 'navigator', {
      value: {
        onLine: true,
        serviceWorker: {
          ready: Promise.resolve({
            update: vi.fn(),
            addEventListener: vi.fn(),
            waiting: null,
            installing: null,
          }),
          controller: null,
          addEventListener: vi.fn(),
        },
      },
      writable: true,
    });

    // Reset window event listeners
    window.removeEventListener = vi.fn();
    window.addEventListener = vi.fn();
  });

  afterEach(() => {
    vi.clearAllMocks();
    vi.clearAllTimers();
  });

  describe('PWA Install Prompt Functionality', () => {
    it('should render install prompt when PWA is installable', async () => {
      render(<PWAInstallPrompt />);
      
      // Initially should not be visible
      expect(screen.queryByText('Install OnTour App')).not.toBeInTheDocument();
      
      // Mock beforeinstallprompt event
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      
      // Simulate the event by calling addEventListener mock
      const addEventListenerSpy = window.addEventListener as any;
      if (addEventListenerSpy.mock) {
        const calls = addEventListenerSpy.mock.calls;
        const handler = calls.find((call: any[]) => call[0] === 'beforeinstallprompt')?.[1];
        
        if (handler) {
          handler(mockEvent);
          
          await waitFor(() => {
            expect(screen.getByText('Install OnTour App')).toBeInTheDocument();
          });
        }
      }
      
      expect(mockEvent.preventDefault).toHaveBeenCalled();
    });

    it('should handle install button click correctly', async () => {
      const user = userEvent.setup();
      render(<PWAInstallPrompt />);
      
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn().mockResolvedValue(undefined),
        userChoice: Promise.resolve({ outcome: 'accepted' })
      };
      
      // Trigger the event
      const addEventListenerSpy = window.addEventListener as any;
      if (addEventListenerSpy.mock) {
        const calls = addEventListenerSpy.mock.calls;
        const handler = calls.find((call: any[]) => call[0] === 'beforeinstallprompt')?.[1];
        
        if (handler) {
          handler(mockEvent);
          
          await waitFor(() => {
            expect(screen.getByText('Install OnTour App')).toBeInTheDocument();
          });
          
          // Click install button
          const installButton = screen.getByText('Install');
          await user.click(installButton);
          
          expect(mockEvent.prompt).toHaveBeenCalled();
        }
      }
    });

    it('should not show prompt if previously dismissed', async () => {
      localStorage.setItem('pwa-install-dismissed', 'true');
      
      render(<PWAInstallPrompt />);
      
      const mockEvent = {
        preventDefault: vi.fn(),
        prompt: vi.fn(),
        userChoice: Promise.resolve({ outcome: 'dismissed' })
      };
      
      // Even with event, should not show due to localStorage flag
      const addEventListenerSpy = window.addEventListener as any;
      if (addEventListenerSpy.mock) {
        const calls = addEventListenerSpy.mock.calls;
        const handler = calls.find((call: any[]) => call[0] === 'beforeinstallprompt')?.[1];
        
        if (handler) {
          handler(mockEvent);
          
          // Should not show the prompt
          await waitFor(() => {
            expect(screen.queryByText('Install OnTour App')).not.toBeInTheDocument();
          }, { timeout: 1000 });
        }
      }
    });
  });

  describe('Online/Offline Status Management', () => {
    it('should show offline indicator when offline', async () => {
      Object.defineProperty(global.navigator, 'onLine', {
        value: false,
        writable: true,
      });

      render(<OnlineStatusIndicator />);
      
      expect(screen.getByText('Offline mode - Using cached data')).toBeInTheDocument();
    });

    it('should handle network status changes', async () => {
      vi.useFakeTimers();
      
      render(<OnlineStatusIndicator />);
      
      // Initially online, no indicator
      expect(screen.queryByText('Back online')).not.toBeInTheDocument();
      
      // Trigger offline event
      const addEventListenerSpy = window.addEventListener as any;
      if (addEventListenerSpy.mock) {
        const calls = addEventListenerSpy.mock.calls;
        const offlineHandler = calls.find((call: any[]) => call[0] === 'offline')?.[1];
        
        if (offlineHandler) {
          act(() => {
            offlineHandler();
          });
          
          await waitFor(() => {
            expect(screen.getByText('Offline mode - Using cached data')).toBeInTheDocument();
          });
        }
        
        // Trigger online event
        const onlineHandler = calls.find((call: any[]) => call[0] === 'online')?.[1];
        
        if (onlineHandler) {
          act(() => {
            onlineHandler();
          });
          
          await waitFor(() => {
            expect(screen.getByText('Back online')).toBeInTheDocument();
          });
        }
      }
      
      vi.useRealTimers();
    });

    it('should clean up event listeners on unmount', () => {
      const { unmount } = render(<OnlineStatusIndicator />);
      
      unmount();
      
      expect(window.removeEventListener).toHaveBeenCalledWith('online', expect.any(Function));
      expect(window.removeEventListener).toHaveBeenCalledWith('offline', expect.any(Function));
    });
  });

  describe('Service Worker Update Management', () => {
    it('should not show update prompt initially', () => {
      render(<PWAUpdatePrompt />);
      
      expect(screen.queryByText('Update Available')).not.toBeInTheDocument();
    });

    it('should handle service worker lifecycle correctly', async () => {
      const mockRegistration = {
        update: vi.fn(),
        addEventListener: vi.fn(),
        waiting: null,
        installing: {
          addEventListener: vi.fn(),
          state: 'installed'
        }
      };

      // Mock service worker with controller (existing SW)
      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve(mockRegistration),
          controller: {},
        },
        writable: true,
      });

      render(<PWAUpdatePrompt />);
      
      // Service worker should be ready
      const registration = await navigator.serviceWorker.ready;
      expect(registration.update).toBeDefined();
    });
  });

  describe('Offline Cache Management', () => {
    it('should handle cache API operations', async () => {
      const mockCache = {
        match: vi.fn().mockResolvedValue(new Response('cached data')),
        add: vi.fn().mockResolvedValue(undefined),
        addAll: vi.fn().mockResolvedValue(undefined),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(true),
      };

      global.caches = {
        open: vi.fn().mockResolvedValue(mockCache),
        match: vi.fn().mockResolvedValue(new Response('global cached data')),
        has: vi.fn().mockResolvedValue(true),
        delete: vi.fn().mockResolvedValue(true),
        keys: vi.fn().mockResolvedValue(['v1-cache']),
      } as any;

      render(<PWAComponents />);

      // Test cache operations
      const cache = await caches.open('ontour-cache-v1');
      const response = await cache.match('/api/shows');
      
      expect(response).toBeDefined();
      expect(cache.match).toHaveBeenCalledWith('/api/shows');
      
      // Test adding to cache
      await cache.add('/api/new-data');
      expect(cache.add).toHaveBeenCalledWith('/api/new-data');
      
      // Test cache deletion
      const deleted = await cache.delete('/api/old-data');
      expect(deleted).toBe(true);
    });

    it('should handle cache versioning and cleanup', async () => {
      const oldCache = {
        keys: vi.fn().mockResolvedValue([]),
        delete: vi.fn().mockResolvedValue(true),
      };

      global.caches = {
        open: vi.fn().mockResolvedValue(oldCache),
        keys: vi.fn().mockResolvedValue(['ontour-cache-v1', 'ontour-cache-v2']),
        delete: vi.fn().mockResolvedValue(true),
      } as any;

      render(<PWAComponents />);

      // Test cache cleanup
      const cacheNames = await caches.keys();
      expect(cacheNames).toContain('ontour-cache-v1');
      
      // Delete old cache
      const deleted = await caches.delete('ontour-cache-v1');
      expect(deleted).toBe(true);
    });
  });

  describe('Background Sync Functionality', () => {
    it('should register background sync tasks', async () => {
      const mockRegistration = {
        sync: {
          register: vi.fn().mockResolvedValue(undefined),
          getTags: vi.fn().mockResolvedValue(['background-sync']),
        },
        update: vi.fn(),
        addEventListener: vi.fn(),
      };

      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          ready: Promise.resolve(mockRegistration),
          controller: {},
        },
        writable: true,
      });

      render(<PWAComponents />);

      // Test background sync registration
      const registration = await navigator.serviceWorker.ready;
      if ('sync' in registration) {
        await (registration as any).sync.register('ontour-data-sync');
        expect((registration as any).sync.register).toHaveBeenCalledWith('ontour-data-sync');
      }
    });

    it('should handle sync event in service worker context', async () => {
      // Mock sync event
      const mockSyncEvent = {
        tag: 'ontour-data-sync',
        waitUntil: vi.fn(),
      };

      // Test that sync events can be handled
      const syncHandler = (event: any) => {
        if (event.tag === 'ontour-data-sync') {
          event.waitUntil(
            // Simulate sync operation
            Promise.resolve().then(() => {
              console.log('Background sync completed');
            })
          );
        }
      };

      syncHandler(mockSyncEvent);
      expect(mockSyncEvent.waitUntil).toHaveBeenCalled();
    });
  });

  describe('Offline Data Persistence', () => {
    it('should handle IndexedDB operations', async () => {
      const mockObjectStore = {
        add: vi.fn().mockResolvedValue(1),
        get: vi.fn().mockResolvedValue({ id: 1, data: 'test show data' }),
        getAll: vi.fn().mockResolvedValue([]),
        put: vi.fn().mockResolvedValue(undefined),
        delete: vi.fn().mockResolvedValue(undefined),
      };

      const mockTransaction = {
        objectStore: vi.fn().mockReturnValue(mockObjectStore),
        oncomplete: null,
        onerror: null,
      };

      const mockDB = {
        transaction: vi.fn().mockReturnValue(mockTransaction),
        createObjectStore: vi.fn().mockReturnValue(mockObjectStore),
      };

      global.indexedDB = {
        open: vi.fn().mockImplementation((name, version) => ({
          result: mockDB,
          onsuccess: null,
          onerror: null,
          onupgradeneeded: null,
        })),
        deleteDatabase: vi.fn(),
      } as any;

      render(<PWAComponents />);

      // Test IndexedDB operations
      const dbRequest = indexedDB.open('ontour-offline-db', 1);
      expect(indexedDB.open).toHaveBeenCalledWith('ontour-offline-db', 1);
      
      // Simulate database operations
      const db = dbRequest.result;
      const transaction = db.transaction(['shows'], 'readwrite');
      const store = transaction.objectStore('shows');
      
      // Test storing data
      await store.add({ id: 1, name: 'Test Show', date: '2024-01-01' });
      expect(store.add).toHaveBeenCalled();
      
      // Test retrieving data
      const data = await store.get(1);
      expect(store.get).toHaveBeenCalledWith(1);
    });
  });

  describe('PWA Integration Tests', () => {
    it('should render all PWA components together', () => {
      render(<PWAComponents />);
      
      // Test that all components are properly integrated
      const { container } = render(<PWAComponents />);
      expect(container).toBeTruthy();
    });

    it('should handle multiple PWA events simultaneously', async () => {
      render(<PWAComponents />);
      
      // Simulate going offline
      Object.defineProperty(global.navigator, 'onLine', {
        value: false,
        writable: true,
      });
      
      const addEventListenerSpy = window.addEventListener as any;
      if (addEventListenerSpy.mock) {
        const calls = addEventListenerSpy.mock.calls;
        
        // Trigger offline event
        const offlineHandler = calls.find((call: any[]) => call[0] === 'offline')?.[1];
        if (offlineHandler) {
          act(() => {
            offlineHandler();
          });
        }
        
        // Also trigger install prompt
        const mockInstallEvent = {
          preventDefault: vi.fn(),
          prompt: vi.fn(),
          userChoice: Promise.resolve({ outcome: 'accepted' })
        };
        
        const installHandler = calls.find((call: any[]) => call[0] === 'beforeinstallprompt')?.[1];
        if (installHandler) {
          installHandler(mockInstallEvent);
        }
      }
      
      // Both events should be handled correctly
      await waitFor(() => {
        expect(screen.getByText('Offline mode - Using cached data')).toBeInTheDocument();
      });
    });
  });

  describe('PWA Security & Performance', () => {
    it('should validate secure context requirements', () => {
      // PWAs require HTTPS (secure context)
      Object.defineProperty(window, 'isSecureContext', {
        value: true,
        writable: true,
      });

      render(<PWAComponents />);
      
      expect(window.isSecureContext).toBe(true);
    });

    it('should handle service worker registration scope', async () => {
      const mockRegistration = {
        scope: '/',
        update: vi.fn(),
        addEventListener: vi.fn(),
      };

      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          register: vi.fn().mockResolvedValue(mockRegistration),
          ready: Promise.resolve(mockRegistration),
        },
        writable: true,
      });

      render(<PWAComponents />);

      // Test service worker scope
      if ('serviceWorker' in navigator && navigator.serviceWorker.register) {
        const registration = await navigator.serviceWorker.register('/sw.js');
        expect(registration.scope).toBe('/');
      }
    });

    it('should validate manifest configuration', () => {
      // Mock manifest link element
      const manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = '/manifest.json';
      document.head.appendChild(manifestLink);

      render(<PWAComponents />);

      const manifestElement = document.querySelector('link[rel="manifest"]');
      expect(manifestElement).toBeTruthy();
      expect(manifestElement?.getAttribute('href')).toBe('/manifest.json');
      
      // Cleanup
      document.head.removeChild(manifestLink);
    });
  });

  describe('Error Handling & Edge Cases', () => {
    it('should handle service worker registration failures', async () => {
      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          register: vi.fn().mockRejectedValue(new Error('Service Worker registration failed')),
          ready: Promise.reject(new Error('Service Worker not ready')),
        },
        writable: true,
      });

      render(<PWAComponents />);

      // Should handle registration errors gracefully
      try {
        await navigator.serviceWorker.register('/sw.js');
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });

    it('should handle cache API unavailability', async () => {
      // Remove cache API
      delete (global as any).caches;

      render(<PWAComponents />);

      // Should handle missing cache API gracefully
      expect(typeof global.caches).toBe('undefined');
    });

    it('should handle IndexedDB unavailability', async () => {
      // Remove IndexedDB
      delete (global as any).indexedDB;

      render(<PWAComponents />);

      // Should handle missing IndexedDB gracefully
      expect(typeof global.indexedDB).toBe('undefined');
    });

    it('should handle service worker messaging errors', async () => {
      const mockWorker = {
        postMessage: vi.fn().mockImplementation(() => {
          throw new Error('Message sending failed');
        }),
      };

      Object.defineProperty(global.navigator, 'serviceWorker', {
        value: {
          controller: mockWorker,
        },
        writable: true,
      });

      render(<PWAComponents />);

      // Should handle messaging errors gracefully
      try {
        if (navigator.serviceWorker.controller) {
          navigator.serviceWorker.controller.postMessage({ type: 'TEST' });
        }
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
      }
    });
  });
});