/**
 * Service Worker Registration & Control
 *
 * Maneja el registro, actualización y comunicación con el SW
 */

// ========================================
// Types
// ========================================

interface SWUpdateAvailable {
    isUpdateAvailable: boolean;
    registration?: ServiceWorkerRegistration;
}

interface CacheStats {
    hits: number;
    misses: number;
    hitRate: string;
}

// ========================================
// Service Worker Registration
// ========================================

export class ServiceWorkerManager {
    private registration: ServiceWorkerRegistration | null = null;
    private updateCallbacks: Array<(reg: ServiceWorkerRegistration) => void> = [];

    /**
     * Initialize and register Service Worker
     */
    async register(): Promise<ServiceWorkerRegistration | undefined> {
        // Solo en producción y con soporte
        if (
            process.env.NODE_ENV !== 'production' ||
            !('serviceWorker' in navigator)
        ) {
            // console.log('[SW] Service Worker not supported or not in production');
            return undefined;
        }

        try {
            // Registrar directamente sin Workbox (nuestro SW es manual)
            const reg = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });

            this.registration = reg;

            // Escuchar actualizaciones
            reg.addEventListener('updatefound', () => {
                const newWorker = reg.installing;
                if (newWorker) {
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            // Notificar callbacks de actualización
                            this.updateCallbacks.forEach(cb => cb(reg));
                        }
                    });
                }
            });

            // console.log('[SW] Service Worker registered successfully');
            return reg;
        } catch (error) {
            console.error('[SW] Registration failed:', error);
            return undefined;
        }
    }

    /**
     * Check for updates manually
     */
    async checkForUpdates(): Promise<void> {
        if (this.registration) {
            await this.registration.update();
        }
    }

    /**
     * Skip waiting and activate new SW
     */
    async skipWaiting(): Promise<void> {
        if (this.registration?.waiting) {
            // Enviar mensaje al SW para skip waiting
            this.registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }
    }

    /**
     * Subscribe to update notifications
     */
    onUpdateAvailable(callback: (reg: ServiceWorkerRegistration) => void): () => void {
        this.updateCallbacks.push(callback);

        // Return unsubscribe function
        return () => {
            this.updateCallbacks = this.updateCallbacks.filter(cb => cb !== callback);
        };
    }

    /**
     * Get cache statistics
     */
    async getCacheStats(): Promise<CacheStats | null> {
        if (!this.registration?.active) return null;

        return new Promise((resolve) => {
            const messageChannel = new MessageChannel();

            messageChannel.port1.onmessage = (event) => {
                resolve(event.data);
            };

            this.registration!.active!.postMessage(
                { type: 'GET_CACHE_STATS' },
                [messageChannel.port2]
            );
        });
    }

    /**
     * Clear all caches
     */
    async clearCache(): Promise<void> {
        if (this.registration?.active) {
            this.registration.active.postMessage({ type: 'CLEAR_CACHE' });
        }

        // También limpiar caches manualmente
        const cacheNames = await caches.keys();
        await Promise.all(
            cacheNames.map(cacheName => caches.delete(cacheName))
        );

        // console.log('[SW] All caches cleared');
    }

    /**
     * Unregister Service Worker
     */
    async unregister(): Promise<boolean> {
        if (this.registration) {
            const success = await this.registration.unregister();
            // console.log('[SW] Service Worker unregistered:', success);
            return success;
        }
        return false;
    }
}

// Singleton instance
export const swManager = new ServiceWorkerManager();

// ========================================
// React Hooks
// ========================================

import { useEffect, useState } from 'react';

/**
 * Hook to manage Service Worker updates
 */
export function useServiceWorker() {
    const [isUpdateAvailable, setIsUpdateAvailable] = useState(false);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
    const [cacheStats, setCacheStats] = useState<CacheStats | null>(null);

    useEffect(() => {
        // Register SW
        swManager.register().then((reg) => {
            setRegistration(reg || null);
        });

        // Subscribe to updates
        const unsubscribe = swManager.onUpdateAvailable((reg) => {
            setIsUpdateAvailable(true);
            setRegistration(reg);
        });

        // Check for updates every 5 minutes
        const interval = setInterval(() => {
            swManager.checkForUpdates();
        }, 5 * 60 * 1000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    // Get cache stats
    useEffect(() => {
        const updateStats = async () => {
            const stats = await swManager.getCacheStats();
            if (stats) {
                setCacheStats(stats);
            }
        };

        updateStats();

        // Update every 10 seconds
        const interval = setInterval(updateStats, 10000);

        return () => clearInterval(interval);
    }, []);

    const updateServiceWorker = async () => {
        await swManager.skipWaiting();
        setIsUpdateAvailable(false);
    };

    const clearCache = async () => {
        await swManager.clearCache();
        window.location.reload();
    };

    return {
        isUpdateAvailable,
        registration,
        cacheStats,
        updateServiceWorker,
        clearCache,
        checkForUpdates: () => swManager.checkForUpdates()
    };
}

/**
 * Hook to check online/offline status with SW sync
 */
export function useOnlineStatus() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [hasPendingSync, setHasPendingSync] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);

            // Trigger background sync si hay cambios pendientes
            if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then((registration) => {
                    if ('sync' in registration) {
                        registration.sync.register('offline-mutations').catch((err) => {
                            console.error('[SW] Sync registration failed:', err);
                        });
                    }
                }).catch((err) => {
                    console.error('[SW] Service Worker ready failed:', err);
                });
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            setHasPendingSync(true);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    return {
        isOnline,
        hasPendingSync,
        clearPendingSync: () => setHasPendingSync(false)
    };
}

// ========================================
// Utility Functions
// ========================================

/**
 * Precache specific URLs
 */
export async function precacheUrls(urls: string[]): Promise<void> {
    if (!('caches' in window)) return;

    const cache = await caches.open('manual-precache-v1');
    await cache.addAll(urls);

    // console.log('[SW] Manually precached:', urls);
}

/**
 * Get cached response for URL
 */
export async function getCachedResponse(url: string): Promise<Response | undefined> {
    if (!('caches' in window)) return undefined;

    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const response = await cache.match(url);

        if (response) {
            return response;
        }
    }

    return undefined;
}

/**
 * Check if URL is cached
 */
export async function isCached(url: string): Promise<boolean> {
    const response = await getCachedResponse(url);
    return !!response;
}

/**
 * Get cache size
 */
export async function getCacheSize(): Promise<number> {
    if (!('caches' in window)) return 0;

    let size = 0;
    const cacheNames = await caches.keys();

    for (const cacheName of cacheNames) {
        const cache = await caches.open(cacheName);
        const requests = await cache.keys();

        for (const request of requests) {
            const response = await cache.match(request);
            if (response) {
                const blob = await response.blob();
                size += blob.size;
            }
        }
    }

    return size;
}

/**
 * Format bytes to human readable
 */
export function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
}
