/// <reference lib="webworker" />
/**
 * Advanced Service Worker with Workbox
 *
 * Estrategias implementadas:
 * 1. CacheFirst - App Shell (HTML, JS, CSS)
 * 2. NetworkFirst - API calls con fallback a cache
 * 3. StaleWhileRevalidate - Assets (imágenes, fonts)
 * 4. Background Sync - Offline mutations
 * 5. Precaching - Assets críticos
 *
 * Performance target: Repeat visits 1.8s → 0.3s
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

// ========================================
// Configuración
// ========================================

const CACHE_VERSIONS = {
    appShell: 'app-shell-v2', // Incrementado para force update
    api: 'api-cache-v2',
    assets: 'assets-cache-v2',
    images: 'images-cache-v2',
    fonts: 'fonts-cache-v2'
};

const CACHE_DURATIONS = {
    appShell: 30 * 24 * 60 * 60, // 30 días (increased from 7)
    api: 10 * 60, // 10 minutos (increased from 5)
    assets: 60 * 24 * 60 * 60, // 60 días (increased from 30)
    images: 60 * 24 * 60 * 60, // 60 días (increased from 30)
    fonts: 365 * 24 * 60 * 60 // 1 año
};

// ========================================
// Precaching - Assets críticos
// ========================================

// Workbox precache manifest será inyectado por el build
// @ts-ignore
precacheAndRoute(self.__WB_MANIFEST || []);

// Limpiar caches antiguos
cleanupOutdatedCaches();

// ========================================
// Strategy 1: App Shell - CacheFirst
// ========================================

// HTML, JS, CSS - Servir desde cache primero
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
    new CacheFirst({
        cacheName: CACHE_VERSIONS.appShell,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 100,
                maxAgeSeconds: CACHE_DURATIONS.appShell,
                purgeOnQuotaError: true
            })
        ]
    })
);

// ========================================
// Strategy 2: API - NetworkFirst
// ========================================

// API calls - Network primero, fallback a cache
registerRoute(
    ({ url }) => {
        return (
            url.pathname.startsWith('/api/') ||
            url.pathname.includes('/graphql') ||
            url.hostname.includes('api.')
        );
    },
    new NetworkFirst({
        cacheName: CACHE_VERSIONS.api,
        networkTimeoutSeconds: 3, // 3s timeout (reduced from 5s)
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 300, // Increased from 200
                maxAgeSeconds: CACHE_DURATIONS.api,
                purgeOnQuotaError: true
            })
        ]
    })
);

// ========================================
// Strategy 3: Assets - StaleWhileRevalidate
// ========================================

// Imágenes - Cache pero actualizar en background
registerRoute(
    ({ request }) => request.destination === 'image',
    new StaleWhileRevalidate({
        cacheName: CACHE_VERSIONS.images,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 500, // Increased from 300
                maxAgeSeconds: CACHE_DURATIONS.images,
                purgeOnQuotaError: true
            })
        ]
    })
);

// Fonts - Cache agresivo
registerRoute(
    ({ request, url }) => {
        return (
            request.destination === 'font' ||
            url.pathname.includes('/fonts/') ||
            url.hostname.includes('fonts.googleapis.com') ||
            url.hostname.includes('fonts.gstatic.com')
        );
    },
    new CacheFirst({
        cacheName: CACHE_VERSIONS.fonts,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 50,
                maxAgeSeconds: CACHE_DURATIONS.fonts,
                purgeOnQuotaError: true
            })
        ]
    })
);

// Assets generales (CSS, JS, JSON)
registerRoute(
    ({ request }) => {
        return (
            request.destination === 'style' ||
            request.destination === 'script' ||
            request.destination === 'manifest'
        );
    },
    new StaleWhileRevalidate({
        cacheName: CACHE_VERSIONS.assets,
        plugins: [
            new CacheableResponsePlugin({
                statuses: [0, 200]
            }),
            new ExpirationPlugin({
                maxEntries: 150,
                maxAgeSeconds: CACHE_DURATIONS.assets,
                purgeOnQuotaError: true
            })
        ]
    })
);

// ========================================
// Strategy 4: Background Sync
// ========================================

// Background sync para mutations offline
const bgSyncPlugin = new BackgroundSyncPlugin('offline-mutations', {
    maxRetentionTime: 24 * 60, // 24 horas
    onSync: async ({ queue }) => {
        let entry;
        while ((entry = await queue.shiftRequest())) {
            try {
                await fetch(entry.request);
                // console.log('[SW] Synced offline mutation:', entry.request.url);
            } catch (error) {
                console.error('[SW] Failed to sync:', error);
                await queue.unshiftRequest(entry);
                throw error;
            }
        }
    }
});

// POST/PUT/DELETE requests con background sync
registerRoute(
    ({ url, request }) => {
        return (
            url.pathname.startsWith('/api/') &&
            ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)
        );
    },
    new NetworkOnly({
        plugins: [bgSyncPlugin]
    }),
    'POST'
);

// ========================================
// Navigation Fallback - Offline Page
// ========================================

// Crear NetworkFirst strategy para navegación
const navigationHandler = new NetworkFirst({
    cacheName: CACHE_VERSIONS.appShell,
    plugins: [
        new CacheableResponsePlugin({
            statuses: [0, 200]
        })
    ]
});

// Usar NavigationRoute con el handler
const navigationRoute = new NavigationRoute(navigationHandler, {
    denylist: [/^\/api\//] // No cachear rutas API
});

registerRoute(navigationRoute);

// ========================================
// Cache Management
// ========================================

// Limpiar caches viejos al activar
self.addEventListener('activate', (event: ExtendableEvent) => {
    const currentCaches = Object.values(CACHE_VERSIONS);

    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (!currentCaches.includes(cacheName)) {
                        // console.log('[SW] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    }
                    return Promise.resolve();
                })
            );
        })
    );
});

// ========================================
// Performance Monitoring
// ========================================

// Track cache hits/misses
let cacheHits = 0;
let cacheMisses = 0;

self.addEventListener('fetch', (event: FetchEvent) => {
    const url = new URL(event.request.url);

    // Solo trackear nuestro dominio
    if (url.origin === location.origin) {
        event.respondWith(
            (async () => {
                const cache = await caches.open(CACHE_VERSIONS.appShell);
                const cachedResponse = await cache.match(event.request);

                if (cachedResponse) {
                    cacheHits++;
                    // if (cacheHits % 100 === 0) {
                    //     console.log('[SW] Cache stats:', {
                    //         hits: cacheHits,
                    //         misses: cacheMisses,
                    //         hitRate: (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(1) + '%'
                    //     });
                    // }
                } else {
                    cacheMisses++;
                }

                return cachedResponse || fetch(event.request);
            })()
        );
    }
});

// ========================================
// Message Handler
// ========================================

// Comunicación con el cliente
self.addEventListener('message', (event: ExtendableMessageEvent) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }

    if (event.data && event.data.type === 'GET_CACHE_STATS' && event.ports[0]) {
        event.ports[0].postMessage({
            hits: cacheHits,
            misses: cacheMisses,
            hitRate: (cacheHits / (cacheHits + cacheMisses) * 100).toFixed(1) + '%'
        });
    }

    if (event.data && event.data.type === 'CLEAR_CACHE') {
        event.waitUntil(
            caches.keys().then((cacheNames) => {
                return Promise.all(
                    cacheNames.map((cacheName) => caches.delete(cacheName))
                );
            })
        );
    }
});

// ========================================
// Install Handler
// ========================================

self.addEventListener('install', (event: ExtendableEvent) => {
    // console.log('[SW] Service Worker installing...');

    // Precache assets críticos
    event.waitUntil(
        caches.open(CACHE_VERSIONS.appShell).then((cache) => {
            return cache.addAll([
                '/',
                '/index.html',
                '/offline.html',
                '/manifest.json'
            ]);
        })
    );

    // Activar inmediatamente
    self.skipWaiting();
});

// ========================================
// Sync Event - Retry failed requests
// ========================================

interface SyncEvent extends ExtendableEvent {
    tag: string;
}

self.addEventListener('sync', (event: SyncEvent) => {
    if (event.tag === 'offline-mutations') {
        // console.log('[SW] Background sync triggered');
    }
});

// ========================================
// Push Notifications (futuro)
// ========================================

self.addEventListener('push', (event: PushEvent) => {
    if (event.data) {
        const data = event.data.json();

        event.waitUntil(
            self.registration.showNotification(data.title, {
                body: data.body,
                icon: '/icon-192.png',
                badge: '/badge-72.png',
                data: data.url
            })
        );
    }
});

self.addEventListener('notificationclick', (event: NotificationEvent) => {
    event.notification.close();

    event.waitUntil(
        self.clients.openWindow(event.notification.data)
    );
});

// console.log('[SW] Advanced Service Worker loaded! 🚀');
