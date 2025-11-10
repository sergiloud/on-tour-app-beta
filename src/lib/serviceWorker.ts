/**
 * Service Worker Registration Helper
 *
 * Integrates with existing Vite PWA plugin and adds:
 * - Network resilience features
 * - Background sync support
 * - Custom update handling
 */

/**
 * Register service worker with enhanced features
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    if (!('serviceWorker' in navigator)) {
        console.warn('[SW] Service Workers not supported');
        return null;
    }

    try {
        // Register the service worker (Vite PWA generates this)
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });

        // console.log('[SW] Service worker registered successfully');

        // Listen for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (!newWorker) return;

            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // New version available
                    // console.log('[SW] New version available');

                    // Notify user (you can show a toast here)
                    if (window.confirm('Nueva versión disponible. ¿Recargar?')) {
                        newWorker.postMessage({ type: 'SKIP_WAITING' });
                        window.location.reload();
                    }
                }
            });
        });

        // Listen for controller change (new SW activated)
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            // console.log('[SW] Controller changed, reloading page');
            window.location.reload();
        });

        // Request background sync permission if available
        if ('sync' in registration) {
            try {
                await (registration as any).sync.register('sync-requests');
                // console.log('[SW] Background sync registered');
            } catch (error) {
                // console.log('[SW] Background sync not available');
            }
        }

        return registration;
    } catch (error) {
        console.error('[SW] Registration failed:', error);
        return null;
    }
}

/**
 * Unregister all service workers
 * Useful for debugging or cleanup
 */
export async function unregisterServiceWorker(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        await Promise.all(registrations.map(reg => reg.unregister()));
        // console.log('[SW] All service workers unregistered');
    } catch (error) {
        console.error('[SW] Unregistration failed:', error);
    }
}

/**
 * Clear all caches
 * Useful for debugging or forcing fresh data
 */
export async function clearAllCaches(): Promise<void> {
    if (!('caches' in window)) return;

    try {
        const cacheNames = await caches.keys();
        await Promise.all(cacheNames.map(name => caches.delete(name)));
        // console.log('[SW] All caches cleared');
    } catch (error) {
        console.error('[SW] Cache clearing failed:', error);
    }
}

/**
 * Check if service worker is active
 */
export function isServiceWorkerActive(): boolean {
    return !!(navigator.serviceWorker && navigator.serviceWorker.controller);
}

/**
 * Send message to service worker
 */
export function sendMessageToSW(message: any): void {
    if (!navigator.serviceWorker.controller) {
        console.warn('[SW] No active service worker');
        return;
    }

    navigator.serviceWorker.controller.postMessage(message);
}

/**
 * Listen to messages from service worker
 */
export function onMessageFromSW(callback: (event: MessageEvent) => void): () => void {
    navigator.serviceWorker.addEventListener('message', callback);

    // Return cleanup function
    return () => {
        navigator.serviceWorker.removeEventListener('message', callback);
    };
}
