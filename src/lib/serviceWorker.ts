/**
 * Service Worker Registration Helper
 *
 * DEPRECATED: Use serviceWorkerManager.ts instead
 * This file is kept for backwards compatibility but does nothing
 */

/**
 * Register service worker - now handled by serviceWorkerManager
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
    console.warn('[SW] serviceWorker.ts is deprecated, use serviceWorkerManager.ts');
    return null;
}

/**
 * Check if service worker is supported
 */
export function isServiceWorkerSupported(): boolean {
    return 'serviceWorker' in navigator;
}

/**
 * Unregister all service workers
 */
export async function unregisterServiceWorkers(): Promise<void> {
    if (!('serviceWorker' in navigator)) return;

    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(registrations.map(reg => reg.unregister()));
}
