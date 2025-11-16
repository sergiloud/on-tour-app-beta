/**
 * Advanced Service Worker Manager
 * 
 * Client-side interface for interacting with the advanced service worker.
 * Provides methods for background sync, cache management, and performance monitoring.
 */

import { useState, useEffect, useCallback } from 'react';

// ============================================================================
// TYPES
// ============================================================================

export interface SyncRequest {
  url: string;
  method?: string;
  headers?: Record<string, string>;
  body?: any;
}

export interface ServiceWorkerMetrics {
  metrics: Array<{
    event: string;
    duration: number;
    cacheHit: boolean;
    networkStatus: 'fast' | 'slow' | 'offline';
    timestamp: number;
  }>;
  avgResponseTime: number;
  cacheHitRate: number;
  syncStatus: {
    pending: number;
    failed: number;
  };
}

export interface CacheInfo {
  name: string;
  size: number;
  entries: number;
  lastUpdated: number;
}

// ============================================================================
// SERVICE WORKER MANAGER CLASS
// ============================================================================

class AdvancedServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported: boolean = 'serviceWorker' in navigator;

  constructor() {
    if (this.isSupported) {
      this.initialize();
    }
  }

  private async initialize(): Promise<void> {
    // Skip service worker registration in development mode to avoid MIME type issues
    if (import.meta.env.DEV) {
      console.log('🔧 Development mode: Service Worker registration skipped');
      // Set isSupported to false in development to avoid errors
      this.isSupported = false;
      return;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none'
      });

      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration?.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              this.notifyUpdate();
            }
          });
        }
      });

      navigator.serviceWorker.addEventListener('message', this.handleServiceWorkerMessage.bind(this));
      console.log('✅ Advanced Service Worker Manager initialized');
    } catch (error) {
      console.error('❌ Service Worker registration failed:', error);
      // Graceful degradation - app continues to work without SW
    }
  }

  private handleServiceWorkerMessage(event: MessageEvent): void {
    const { type, data } = event.data;
    switch (type) {
      case 'sync-success':
        this.dispatchCustomEvent('sw-sync-success', data);
        break;
      case 'sync-failed':
        this.dispatchCustomEvent('sw-sync-failed', data);
        break;
      case 'cache-updated':
        this.dispatchCustomEvent('sw-cache-updated', data);
        break;
    }
  }

  private dispatchCustomEvent(eventName: string, detail: any): void {
    const event = new CustomEvent(eventName, { detail });
    window.dispatchEvent(event);
  }

  private notifyUpdate(): void {
    const event = new CustomEvent('sw-update-available');
    window.dispatchEvent(event);
  }

  async queueForSync(request: SyncRequest): Promise<string> {
    if (!this.isSupported || !this.registration?.active) {
      throw new Error('Service Worker not available for background sync');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve(event.data.syncId);
        } else {
          reject(new Error(event.data.error || 'Sync queue failed'));
        }
      };

      this.registration!.active!.postMessage(
        {
          type: 'SYNC_REQUEST',
          data: request
        },
        [messageChannel.port2]
      );
    });
  }

  async syncFinanceData(data: any): Promise<string> {
    return this.queueForSync({
      url: '/api/finance/sync',
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: data
    });
  }

  async syncShowUpdate(showId: string, updates: any): Promise<string> {
    return this.queueForSync({
      url: `/api/shows/${showId}`,
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: updates
    });
  }

  async clearCache(): Promise<void> {
    if (!this.isSupported || !this.registration?.active) {
      throw new Error('Service Worker not available for cache management');
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        if (event.data.success) {
          resolve();
        } else {
          reject(new Error(event.data.error || 'Cache clear failed'));
        }
      };

      this.registration!.active!.postMessage(
        { type: 'CLEAR_CACHE' },
        [messageChannel.port2]
      );
    });
  }

  async getPerformanceMetrics(): Promise<ServiceWorkerMetrics> {
    if (!this.isSupported || !this.registration?.active) {
      return {
        metrics: [],
        avgResponseTime: 0,
        cacheHitRate: 0,
        syncStatus: { pending: 0, failed: 0 }
      };
    }

    return new Promise((resolve, reject) => {
      const messageChannel = new MessageChannel();
      
      messageChannel.port1.onmessage = (event) => {
        resolve(event.data);
      };

      setTimeout(() => {
        reject(new Error('Metrics request timeout'));
      }, 5000);

      this.registration!.active!.postMessage(
        { type: 'GET_METRICS' },
        [messageChannel.port2]
      );
    });
  }

  isOnline(): boolean {
    return navigator.onLine;
  }

  onConnectionChange(callback: (online: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  async checkForUpdates(): Promise<boolean> {
    if (!this.registration) return false;
    await this.registration.update();
    return !!this.registration.waiting;
  }

  async applyUpdate(): Promise<void> {
    if (!this.registration?.waiting) return;
    
    this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    
    return new Promise((resolve) => {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        window.location.reload();
        resolve();
      });
    });
  }

  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  isServiceWorkerSupported(): boolean {
    return this.isSupported;
  }

  async getServiceWorkerStatus() {
    return {
      supported: this.isSupported || false,
      registered: !!this.registration,
      active: !!this.registration?.active,
      installing: !!this.registration?.installing,
      waiting: !!this.registration?.waiting
    };
  }
}

// ============================================================================
// SINGLETON INSTANCE AND EXPORTS
// ============================================================================

export const serviceWorkerManager = new AdvancedServiceWorkerManager();

// Export bound methods to preserve 'this' context
export const queueForSync = serviceWorkerManager.queueForSync.bind(serviceWorkerManager);
export const syncFinanceData = serviceWorkerManager.syncFinanceData.bind(serviceWorkerManager);
export const syncShowUpdate = serviceWorkerManager.syncShowUpdate.bind(serviceWorkerManager);
export const clearCache = serviceWorkerManager.clearCache.bind(serviceWorkerManager);
export const getPerformanceMetrics = serviceWorkerManager.getPerformanceMetrics.bind(serviceWorkerManager);
export const isOnline = serviceWorkerManager.isOnline.bind(serviceWorkerManager);
export const onConnectionChange = serviceWorkerManager.onConnectionChange.bind(serviceWorkerManager);
export const checkForUpdates = serviceWorkerManager.checkForUpdates.bind(serviceWorkerManager);
export const applyUpdate = serviceWorkerManager.applyUpdate.bind(serviceWorkerManager);
export const getRegistration = serviceWorkerManager.getRegistration.bind(serviceWorkerManager);
export const isServiceWorkerSupported = serviceWorkerManager.isServiceWorkerSupported.bind(serviceWorkerManager);
export const getServiceWorkerStatus = serviceWorkerManager.getServiceWorkerStatus.bind(serviceWorkerManager);

export function useServiceWorker() {
  const [isOnlineState, setIsOnline] = useState(navigator.onLine);
  const [swStatus, setSWStatus] = useState<any>(null);
  const [metrics, setMetrics] = useState<ServiceWorkerMetrics | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    const unsubscribe = onConnectionChange(setIsOnline);
    
    const updateStatus = async () => {
      const status = await getServiceWorkerStatus();
      setSWStatus(status);
    };
    updateStatus();

    const handleUpdateAvailable = () => setUpdateAvailable(true);
    window.addEventListener('sw-update-available', handleUpdateAvailable);

    return () => {
      unsubscribe();
      window.removeEventListener('sw-update-available', handleUpdateAvailable);
    };
  }, []);

  const refreshMetrics = useCallback(async () => {
    try {
      const newMetrics = await getPerformanceMetrics();
      setMetrics(newMetrics);
    } catch (error) {
      console.warn('Failed to get SW metrics:', error);
    }
  }, []);

  const syncData = useCallback(async (request: SyncRequest) => {
    try {
      const syncId = await queueForSync(request);
      return syncId;
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }, []);

  const updateApp = useCallback(async () => {
    try {
      await applyUpdate();
    } catch (error) {
      console.error('Update failed:', error);
      throw error;
    }
  }, []);

  return {
    isOnline: isOnlineState,
    swStatus,
    metrics,
    updateAvailable,
    refreshMetrics,
    syncData,
    updateApp,
    clearCache,
    checkForUpdates
  };
}

console.log('📡 Advanced Service Worker Manager loaded');
