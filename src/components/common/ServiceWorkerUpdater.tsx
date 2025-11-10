/**
 * Service Worker Update Notification Component
 *
 * Muestra notificaciones cuando hay una nueva versión disponible
 */

import { useEffect } from 'react';
import { useServiceWorker, useOnlineStatus } from '../../lib/serviceWorkerManager';
import { toast } from 'sonner';

export function ServiceWorkerUpdater() {
    const {
        isUpdateAvailable,
        updateServiceWorker,
        cacheStats
    } = useServiceWorker();

    const { isOnline, hasPendingSync } = useOnlineStatus();

    // Notificar cuando hay update disponible
    useEffect(() => {
        if (isUpdateAvailable) {
            toast.info('Nueva versión disponible! 🎉', {
                description: 'Haz clic para actualizar y obtener las últimas mejoras',
                duration: Infinity, // No auto-close
                action: {
                    label: 'Actualizar ahora',
                    onClick: () => {
                        updateServiceWorker();
                    }
                },
                cancel: {
                    label: 'Después',
                    onClick: () => {
                        // console.log('[SW] User postponed update');
                    }
                }
            });
        }
    }, [isUpdateAvailable, updateServiceWorker]);

    // Notificar cuando volvemos online y hay cambios pendientes
    useEffect(() => {
        if (isOnline && hasPendingSync) {
            toast.success('Conexión restaurada', {
                description: 'Sincronizando cambios pendientes...',
                duration: 3000
            });
        }
    }, [isOnline, hasPendingSync]);

    // Notificar cuando pasamos a offline
    useEffect(() => {
        if (!isOnline) {
            toast.warning('Modo sin conexión', {
                description: 'Los cambios se guardarán cuando vuelvas a estar online',
                duration: 5000
            });
        }
    }, [isOnline]);

    // Mostrar stats de cache en desarrollo
    useEffect(() => {
        if (
            process.env.NODE_ENV === 'development' &&
            cacheStats &&
            (cacheStats.hits + cacheStats.misses) > 0
        ) {
            // console.log('[SW] Cache Stats:', cacheStats);
        }
    }, [cacheStats]);

    // Este componente no renderiza nada visible
    return null;
}

// ========================================
// Performance Badge (opcional)
// ========================================

interface PerformanceBadgeProps {
    show?: boolean;
    position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

export function PerformanceBadge({
    show = false,
    position = 'bottom-right'
}: PerformanceBadgeProps) {
    const { cacheStats } = useServiceWorker();
    const { isOnline } = useOnlineStatus();

    if (!show || !cacheStats) return null;

    const positionClasses = {
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4'
    };

    return (
        <div
            className={`fixed ${positionClasses[position]} z-50 bg-black/80 text-white text-xs px-3 py-2 rounded-lg font-mono`}
            title="Service Worker Cache Statistics"
        >
            <div className="flex items-center gap-2">
                <div
                    className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
                />
                <div>
                    Cache: {cacheStats.hitRate}
                </div>
            </div>
            <div className="text-[10px] opacity-70 mt-1">
                {cacheStats.hits} hits / {cacheStats.misses} misses
            </div>
        </div>
    );
}

// ========================================
// Cache Control Panel (para desarrollo)
// ========================================

interface CacheControlPanelProps {
    show?: boolean;
}

export function CacheControlPanel({ show = false }: CacheControlPanelProps) {
    const { cacheStats, clearCache, checkForUpdates } = useServiceWorker();
    const { isOnline } = useOnlineStatus();

    if (!show) return null;

    return (
        <div className="fixed bottom-4 left-4 z-50 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-sm">
            <h3 className="font-semibold mb-3 text-sm">Service Worker Control</h3>

            {/* Status */}
            <div className="mb-3 text-xs">
                <div className="flex items-center gap-2 mb-1">
                    <div
                        className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'}`}
                    />
                    <span>{isOnline ? 'Online' : 'Offline'}</span>
                </div>

                {cacheStats && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <div>Cache Hit Rate: {cacheStats.hitRate}</div>
                        <div className="text-[10px] opacity-70 mt-1">
                            {cacheStats.hits} hits / {cacheStats.misses} misses
                        </div>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => checkForUpdates()}
                    className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                >
                    Check Updates
                </button>

                <button
                    onClick={() => {
                        if (confirm('¿Limpiar toda la caché? La página se recargará.')) {
                            clearCache();
                        }
                    }}
                    className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                >
                    Clear Cache
                </button>
            </div>
        </div>
    );
}
