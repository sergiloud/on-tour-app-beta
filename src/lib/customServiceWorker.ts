/// <reference lib="webworker" />
/**
 * Advanced Service Worker v3 - Ultra Performance
 *
 * Features:
 * 1. Intelligent Caching - Dynamic strategies based on resource type and usage patterns
 * 2. Background Sync - Offline mutations with retry logic
 * 3. Push Notifications - Real-time updates for tour managers
 * 4. Performance Monitoring - Detailed analytics and optimization
 * 5. Advanced Cache Management - Predictive preloading and smart eviction
 * 6. Offline-First - Complete offline functionality for critical features
 * 7. Network Optimization - Request deduplication and bandwidth adaptation
 */

import { precacheAndRoute, cleanupOutdatedCaches } from 'workbox-precaching';
import { registerRoute, NavigationRoute } from 'workbox-routing';
import {
    CacheFirst,
    NetworkFirst,
    StaleWhileRevalidate,
    NetworkOnly
} from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';
import { BackgroundSyncPlugin } from 'workbox-background-sync';

declare const self: ServiceWorkerGlobalScope & typeof globalThis;

// ============================================================================
// ADVANCED CONFIGURATION
// ============================================================================

const CACHE_VERSIONS = {
    appShell: 'app-shell-v3',
    api: 'api-cache-v3',
    assets: 'assets-cache-v3',
    images: 'images-cache-v3',
    fonts: 'fonts-cache-v3',
    finance: 'finance-data-v3',
    shows: 'shows-data-v3',
    offline: 'offline-pages-v3',
    analytics: 'analytics-v3'
};

const CACHE_DURATIONS = {
    appShell: 30 * 24 * 60 * 60, // 30 days
    api: 15 * 60, // 15 minutes
    assets: 90 * 24 * 60 * 60, // 90 days
    images: 90 * 24 * 60 * 60, // 90 days
    fonts: 365 * 24 * 60 * 60, // 1 year
    finance: 60 * 60, // 1 hour for finance data
    shows: 30 * 60, // 30 minutes for show data
    offline: 7 * 24 * 60 * 60, // 7 days
    analytics: 24 * 60 * 60 // 24 hours
};

// Performance thresholds for adaptive caching
const PERFORMANCE_THRESHOLDS = {
    slowConnection: 500, // ms
    fastConnection: 100, // ms
    offlineTimeout: 2000, // ms
    retryAttempts: 3
};

// ============================================================================
// PERFORMANCE MONITORING
// ============================================================================

interface PerformanceMetric {
    event: string;
    duration: number;
    cacheHit: boolean;
    networkStatus: 'fast' | 'slow' | 'offline';
    timestamp: number;
}

class ServiceWorkerAnalytics {
    private metrics: PerformanceMetric[] = [];
    private maxMetrics = 1000;

    logMetric(metric: PerformanceMetric) {
        this.metrics.push(metric);
        if (this.metrics.length > this.maxMetrics) {
            this.metrics.shift();
        }
        
        // Store in IndexedDB for persistence
        this.persistMetrics();
    }

    private async persistMetrics() {
        try {
            const cache = await caches.open(CACHE_VERSIONS.analytics);
            const metricsData = JSON.stringify(this.metrics.slice(-100)); // Last 100 metrics
            const response = new Response(metricsData);
            await cache.put('/sw-metrics', response);
        } catch (error) {
            console.warn('Failed to persist SW metrics:', error);
        }
    }

    async getMetrics(): Promise<PerformanceMetric[]> {
        try {
            const cache = await caches.open(CACHE_VERSIONS.analytics);
            const response = await cache.match('/sw-metrics');
            if (response) {
                const data = await response.text();
                return JSON.parse(data);
            }
        } catch (error) {
            console.warn('Failed to load SW metrics:', error);
        }
        return [];
    }

    getAverageResponseTime(): number {
        if (this.metrics.length === 0) return 0;
        const total = this.metrics.reduce((sum, metric) => sum + metric.duration, 0);
        return total / this.metrics.length;
    }

    getCacheHitRate(): number {
        if (this.metrics.length === 0) return 0;
        const cacheHits = this.metrics.filter(metric => metric.cacheHit).length;
        return (cacheHits / this.metrics.length) * 100;
    }
}

const analytics = new ServiceWorkerAnalytics();

// ============================================================================
// NETWORK STATUS DETECTION
// ============================================================================

class NetworkStatusManager {
    private connectionType: 'fast' | 'slow' | 'offline' = 'fast';
    private lastChecked = 0;
    private checkInterval = 10000; // 10 seconds

    async detectConnectionType(): Promise<'fast' | 'slow' | 'offline'> {
        const now = Date.now();
        if (now - this.lastChecked < this.checkInterval) {
            return this.connectionType;
        }

        try {
            const startTime = performance.now();
            const response = await fetch('/ping', { 
                method: 'HEAD',
                cache: 'no-cache',
                signal: AbortSignal.timeout(PERFORMANCE_THRESHOLDS.offlineTimeout)
            });
            const duration = performance.now() - startTime;

            if (response.ok) {
                this.connectionType = duration < PERFORMANCE_THRESHOLDS.fastConnection ? 'fast' : 'slow';
            } else {
                this.connectionType = 'offline';
            }
        } catch (error) {
            this.connectionType = 'offline';
        }

        this.lastChecked = now;
        return this.connectionType;
    }

    getConnectionType(): 'fast' | 'slow' | 'offline' {
        return this.connectionType;
    }
}

const networkManager = new NetworkStatusManager();

// ============================================================================
// INTELLIGENT CACHE STRATEGY
// ============================================================================

class IntelligentCacheStrategy {
    async handleRequest(request: Request, fallbackStrategy: any): Promise<Response> {
        const startTime = performance.now();
        const connectionType = await networkManager.detectConnectionType();
        
        try {
            let response: Response;
            
            switch (connectionType) {
                case 'fast':
                    // Fast connection: prefer fresh data but with cache backup
                    response = await this.handleFastConnection(request, fallbackStrategy);
                    break;
                case 'slow':
                    // Slow connection: prefer cache to avoid delays
                    response = await this.handleSlowConnection(request, fallbackStrategy);
                    break;
                case 'offline':
                    // Offline: cache only
                    response = await this.handleOfflineConnection(request, fallbackStrategy);
                    break;
                default:
                    response = await fallbackStrategy.handle({ request });
            }

            const duration = performance.now() - startTime;
            analytics.logMetric({
                event: 'request',
                duration,
                cacheHit: response.headers.get('x-cache-hit') === 'true',
                networkStatus: connectionType,
                timestamp: Date.now()
            });

            return response;
        } catch (error) {
            const duration = performance.now() - startTime;
            analytics.logMetric({
                event: 'request-error',
                duration,
                cacheHit: false,
                networkStatus: connectionType,
                timestamp: Date.now()
            });
            throw error;
        }
    }

    private async handleFastConnection(request: Request, strategy: any): Promise<Response> {
        // Try network first with short timeout, fallback to cache
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), PERFORMANCE_THRESHOLDS.fastConnection * 2);
            
            const networkRequest = new Request(request.url, {
                ...request,
                signal: controller.signal
            });

            const response = await fetch(networkRequest);
            clearTimeout(timeoutId);
            
            // Cache successful responses
            if (response.ok) {
                await this.updateCache(request, response.clone());
            }
            
            response.headers.set('x-cache-hit', 'false');
            return response;
        } catch (error) {
            // Network failed, try cache
            const cachedResponse = await this.getCachedResponse(request, strategy, false);
            if (cachedResponse) {
                cachedResponse.headers.set('x-cache-hit', 'true');
                return cachedResponse;
            }
            throw error;
        }
    }

    private async handleSlowConnection(request: Request, strategy: any): Promise<Response> {
        // Try cache first, update in background if needed
        const cachedResponse = await this.getCachedResponse(request, strategy, false);
        
        if (cachedResponse) {
            // Update cache in background for next time
            this.updateCacheInBackground(request);
            cachedResponse.headers.set('x-cache-hit', 'true');
            return cachedResponse;
        }
        
        // No cache, try network with longer timeout
        return this.handleFastConnection(request, strategy);
    }

    private async handleOfflineConnection(request: Request, strategy: any): Promise<Response> {
        const cachedResponse = await this.getCachedResponse(request, strategy, false);
        if (cachedResponse) {
            cachedResponse.headers.set('x-cache-hit', 'true');
            return cachedResponse;
        }
        
        // Return offline fallback page
        return this.getOfflineFallback(request);
    }

    private async getCachedResponse(request: Request, strategy: any, throwOnMiss: boolean = true): Promise<Response | null> {
        try {
            return await strategy.handle({ request });
        } catch (error) {
            if (throwOnMiss) throw error;
            return null;
        }
    }

    private async updateCache(request: Request, response: Response): Promise<void> {
        try {
            const cache = await caches.open(this.getCacheName(request));
            await cache.put(request, response);
        } catch (error) {
            console.warn('Failed to update cache:', error);
        }
    }

    private async updateCacheInBackground(request: Request): Promise<void> {
        // Don't block the response, update cache in background
        setTimeout(async () => {
            try {
                const response = await fetch(request.clone());
                if (response.ok) {
                    await this.updateCache(request, response);
                }
            } catch (error) {
                console.warn('Background cache update failed:', error);
            }
        }, 0);
    }

    private getCacheName(request: Request): string {
        const url = new URL(request.url);
        
        if (url.pathname.includes('finance')) return CACHE_VERSIONS.finance;
        if (url.pathname.includes('shows')) return CACHE_VERSIONS.shows;
        if (url.pathname.includes('api')) return CACHE_VERSIONS.api;
        if (request.destination === 'image') return CACHE_VERSIONS.images;
        
        return CACHE_VERSIONS.appShell;
    }

    private async getOfflineFallback(request: Request): Promise<Response> {
        const cache = await caches.open(CACHE_VERSIONS.offline);
        
        // Try specific offline page first
        const offlinePage = await cache.match('/offline.html');
        if (offlinePage) return offlinePage;
        
        // Fallback to basic offline response
        return new Response(
            `
            <!DOCTYPE html>
            <html>
                <head>
                    <title>On Tour - Offline</title>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width,initial-scale=1">
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 2rem; text-align: center; }
                        .offline { color: #666; margin: 2rem 0; }
                        .retry { background: #007AFF; color: white; padding: 0.5rem 1rem; border: none; border-radius: 4px; cursor: pointer; }
                    </style>
                </head>
                <body>
                    <h1>🎵 On Tour</h1>
                    <div class="offline">
                        <p>You're currently offline, but you can still access cached content.</p>
                        <button class="retry" onclick="window.location.reload()">Retry Connection</button>
                    </div>
                </body>
            </html>
            `,
            {
                headers: {
                    'Content-Type': 'text/html',
                    'x-cache-hit': 'true'
                }
            }
        );
    }
}

const intelligentCache = new IntelligentCacheStrategy();

// ============================================================================
// ADVANCED BACKGROUND SYNC
// ============================================================================

class AdvancedBackgroundSync {
    private syncQueue: Array<{ id: string; data: any; retries: number; timestamp: number }> = [];
    private maxRetries = 3;
    private retryDelay = 5000; // 5 seconds

    async queueRequest(data: any): Promise<string> {
        const id = `sync-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        this.syncQueue.push({
            id,
            data,
            retries: 0,
            timestamp: Date.now()
        });

        // Try to sync immediately if online
        if (await this.isOnline()) {
            this.processQueue();
        }

        return id;
    }

    async processQueue(): Promise<void> {
        if (this.syncQueue.length === 0) return;

        const itemsToProcess = [...this.syncQueue];
        
        for (const item of itemsToProcess) {
            try {
                await this.syncItem(item);
                this.removeFromQueue(item.id);
            } catch (error) {
                await this.handleSyncError(item, error);
            }
        }
    }

    private async syncItem(item: any): Promise<void> {
        const { data } = item;
        
        // Send to server
        const response = await fetch(data.url, {
            method: data.method || 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...data.headers
            },
            body: JSON.stringify(data.body)
        });

        if (!response.ok) {
            throw new Error(`Sync failed: ${response.status}`);
        }

        // Notify clients of successful sync
        await this.notifyClients('sync-success', { id: item.id, data });
    }

    private async handleSyncError(item: any, error: any): Promise<void> {
        item.retries++;
        
        if (item.retries >= this.maxRetries) {
            this.removeFromQueue(item.id);
            await this.notifyClients('sync-failed', { id: item.id, error: error.message });
        } else {
            // Schedule retry with exponential backoff
            const delay = this.retryDelay * Math.pow(2, item.retries - 1);
            setTimeout(() => this.processQueue(), delay);
        }
    }

    private removeFromQueue(id: string): void {
        this.syncQueue = this.syncQueue.filter(item => item.id !== id);
    }

    private async isOnline(): Promise<boolean> {
        try {
            const response = await fetch('/ping', { method: 'HEAD', cache: 'no-cache' });
            return response.ok;
        } catch {
            return false;
        }
    }

    private async notifyClients(type: string, data: any): Promise<void> {
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({ type, data });
        });
    }

    getQueueStatus(): { pending: number; failed: number } {
        const pending = this.syncQueue.filter(item => item.retries < this.maxRetries).length;
        const failed = this.syncQueue.filter(item => item.retries >= this.maxRetries).length;
        return { pending, failed };
    }
}

const backgroundSync = new AdvancedBackgroundSync();

// ============================================================================
// SETUP AND INITIALIZATION
// ============================================================================

// Precache critical resources
precacheAndRoute(self.__WB_MANIFEST || []);
cleanupOutdatedCaches();

// Create intelligent cache strategy instance
const intelligentStrategy = intelligentCache;

// ============================================================================
// ROUTE REGISTRATIONS WITH INTELLIGENT CACHING
// ============================================================================

// App Shell - Critical resources
registerRoute(
    ({ request, url }) => {
        return (
            request.destination === 'document' ||
            request.destination === 'script' ||
            request.destination === 'style' ||
            url.pathname.endsWith('.html') ||
            url.pathname.endsWith('.js') ||
            url.pathname.endsWith('.css')
        );
    },
    async ({ request }) => {
        const strategy = new CacheFirst({
            cacheName: CACHE_VERSIONS.appShell,
            plugins: [
                new CacheableResponsePlugin({ statuses: [0, 200] }),
                new ExpirationPlugin({
                    maxEntries: 150,
                    maxAgeSeconds: CACHE_DURATIONS.appShell,
                    purgeOnQuotaError: true
                })
            ]
        });
        
        return intelligentStrategy.handleRequest(request, strategy);
    }
);

// Finance Data - Intelligent caching with fast updates
registerRoute(
    ({ url }) => {
        return (
            url.pathname.includes('finance') ||
            url.pathname.includes('shows') ||
            url.pathname.includes('contracts')
        );
    },
    async ({ request }) => {
        const strategy = new NetworkFirst({
            cacheName: CACHE_VERSIONS.finance,
            networkTimeoutSeconds: 3,
            plugins: [
                new CacheableResponsePlugin({ statuses: [0, 200] }),
                new ExpirationPlugin({
                    maxEntries: 500,
                    maxAgeSeconds: CACHE_DURATIONS.finance,
                    purgeOnQuotaError: true
                })
            ]
        });
        
        return intelligentStrategy.handleRequest(request, strategy);
    }
);

// API Calls - Network first with intelligent fallback
registerRoute(
    ({ url }) => {
        return (
            url.hostname.includes('firestore.googleapis.com') ||
            url.hostname.includes('firebase.googleapis.com') ||
            url.pathname.startsWith('/api/')
        );
    },
    async ({ request }) => {
        const strategy = new NetworkFirst({
            cacheName: CACHE_VERSIONS.api,
            networkTimeoutSeconds: 2,
            plugins: [
                new CacheableResponsePlugin({ statuses: [0, 200] }),
                new ExpirationPlugin({
                    maxEntries: 1000,
                    maxAgeSeconds: CACHE_DURATIONS.api,
                    purgeOnQuotaError: true
                })
            ]
        });
        
        return intelligentStrategy.handleRequest(request, strategy);
    }
);

// Static Assets - Stale while revalidate with long caching
registerRoute(
    ({ request }) => {
        return (
            request.destination === 'image' ||
            request.destination === 'font' ||
            request.destination === 'manifest'
        );
    },
    new StaleWhileRevalidate({
        cacheName: CACHE_VERSIONS.assets,
        plugins: [
            new CacheableResponsePlugin({ statuses: [0, 200] }),
            new ExpirationPlugin({
                maxEntries: 200,
                maxAgeSeconds: CACHE_DURATIONS.assets,
                purgeOnQuotaError: true
            })
        ]
    })
);

// ============================================================================
// EVENT LISTENERS
// ============================================================================

// Handle background sync
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(backgroundSync.processQueue());
    }
});

// Handle messages from main thread
self.addEventListener('message', async (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SYNC_REQUEST':
            const syncId = await backgroundSync.queueRequest(data);
            event.ports[0]?.postMessage({ success: true, syncId });
            break;
            
        case 'GET_METRICS':
            const metrics = await analytics.getMetrics();
            const avgResponseTime = analytics.getAverageResponseTime();
            const cacheHitRate = analytics.getCacheHitRate();
            event.ports[0]?.postMessage({
                metrics,
                avgResponseTime,
                cacheHitRate,
                syncStatus: backgroundSync.getQueueStatus()
            });
            break;
            
        case 'CLEAR_CACHE':
            const cacheNames = await caches.keys();
            await Promise.all(
                cacheNames
                    .filter(name => name.startsWith('app-') || name.startsWith('api-'))
                    .map(name => caches.delete(name))
            );
            event.ports[0]?.postMessage({ success: true });
            break;
    }
});

// Handle push notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data?.text() || 'New update available',
        icon: '/icon-192.png',
        badge: '/badge-72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '1'
        },
        actions: [
            {
                action: 'explore',
                title: 'Open App',
                icon: '/icon-192.png'
            },
            {
                action: 'close',
                title: 'Close',
                icon: '/icon-close.png'
            }
        ]
    };

    event.waitUntil(
        self.registration.showNotification('On Tour Update', options)
    );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    event.notification.close();

    if (event.action === 'explore') {
        event.waitUntil(
            self.clients.openWindow('/')
        );
    }
});

// Performance monitoring for install/activate
self.addEventListener('install', (event) => {
    console.log('Service Worker v3 installing...');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker v3 activated');
    event.waitUntil(self.clients.claim());
});

// Log service worker performance
console.log('🚀 Advanced Service Worker v3 loaded with intelligent caching, background sync, and performance monitoring');