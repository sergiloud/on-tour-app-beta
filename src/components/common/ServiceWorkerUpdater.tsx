/**
 * Advanced Service Worker Update Notification Component
 *
 * Provides notifications for updates, offline sync, and performance monitoring
 */

import { useEffect, useState } from 'react';
import { useServiceWorker, type ServiceWorkerMetrics } from '../../lib/serviceWorkerManager';
import { toast } from 'sonner';

export function ServiceWorkerUpdater() {
    const {
        isOnline,
        swStatus,
        metrics,
        updateAvailable,
        refreshMetrics,
        updateApp,
        clearCache,
        checkForUpdates
    } = useServiceWorker();

    const [showMetrics, setShowMetrics] = useState(false);
    const [lastOnlineState, setLastOnlineState] = useState(isOnline);

    // Notificar cuando hay update disponible
    useEffect(() => {
        if (updateAvailable) {
            toast.info('Nueva versión disponible! 🚀', {
                description: 'Haz clic para actualizar y obtener las últimas mejoras',
                duration: Infinity, // No auto-close
                action: {
                    label: 'Actualizar ahora',
                    onClick: () => {
                        updateApp();
                    }
                },
                cancel: {
                    label: 'Después',
                    onClick: () => {
                        // Do nothing
                    }
                }
            });
        }
    }, [updateAvailable, updateApp]);

    // Notificar cambios de conectividad
    useEffect(() => {
        if (lastOnlineState !== isOnline) {
            setLastOnlineState(isOnline);
            
            if (isOnline && !lastOnlineState) {
                toast.success('Conexión restaurada 🌐', {
                    description: 'Sincronizando cambios pendientes...',
                    duration: 3000
                });
            } else if (!isOnline) {
                toast.warning('Sin conexión 📱', {
                    description: 'Trabajando en modo offline. Los cambios se sincronizarán automáticamente.',
                    duration: 4000
                });
            }
        }
    }, [isOnline, lastOnlineState]);

    // Actualizar métricas periódicamente
    useEffect(() => {
        if (swStatus?.active) {
            refreshMetrics();
            
            const interval = setInterval(() => {
                refreshMetrics();
            }, 30000); // Cada 30 segundos

            return () => clearInterval(interval);
        }
    }, [swStatus?.active, refreshMetrics]);

    // Notificar problemas de rendimiento
    useEffect(() => {
        if (metrics && metrics.cacheHitRate < 60) {
            toast.warning('Rendimiento bajo detectado', {
                description: `Cache hit rate: ${metrics.cacheHitRate.toFixed(1)}%. Considera limpiar el cache.`,
                action: {
                    label: 'Limpiar cache',
                    onClick: () => {
                        clearCache();
                    }
                }
            });
        }
    }, [metrics, clearCache]);

    // Notificar cuando pasamos a offline
    useEffect(() => {
        if (!isOnline) {
            toast.warning('Modo sin conexión', {
                description: 'Los cambios se guardarán cuando vuelvas a estar online',
                duration: 5000
            });
        }
    }, [isOnline]);

    // Display development info
    useEffect(() => {
        if (process.env.NODE_ENV === 'development' && swStatus?.active) {
            console.log('🔧 Service Worker Status:', swStatus);
            if (metrics) {
                console.log('📊 SW Metrics:', {
                    cacheHitRate: `${metrics.cacheHitRate.toFixed(1)}%`,
                    avgResponseTime: `${metrics.avgResponseTime}ms`,
                    totalMetrics: metrics.metrics.length,
                    syncPending: metrics.syncStatus.pending,
                    syncFailed: metrics.syncStatus.failed
                });
            }
        }
    }, [swStatus, metrics]);

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
    const { isOnline, metrics } = useServiceWorker();

    if (!show || !metrics) return null;

    const positionClasses = {
        'top-left': 'top-4 left-4',
        'top-right': 'top-4 right-4',
        'bottom-left': 'bottom-4 left-4',
        'bottom-right': 'bottom-4 right-4'
    };

    return (
        <div
            className={`fixed ${positionClasses[position]} z-50 bg-black/80 text-white text-xs px-3 py-2 rounded-lg font-mono`}
            title="Service Worker Performance Statistics"
        >
            <div className="flex items-center gap-2">
                <div
                    className={`w-2 h-2 rounded-full ${isOnline ? 'bg-green-500' : 'bg-red-500'} animate-pulse`}
                />
                <div>
                    Cache: {metrics.cacheHitRate.toFixed(1)}%
                </div>
            </div>
            <div className="text-[10px] opacity-70 mt-1">
                Avg: {metrics.avgResponseTime}ms | Sync: {metrics.syncStatus.pending}
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
    const { 
        metrics, 
        clearCache, 
        checkForUpdates, 
        isOnline, 
        swStatus, 
        refreshMetrics 
    } = useServiceWorker();

    if (!show) return null;

    const handleClearCache = async () => {
        try {
            await clearCache();
            toast.success('Cache cleared successfully');
        } catch (error) {
            toast.error('Failed to clear cache');
        }
    };

    const handleCheckUpdates = async () => {
        try {
            const hasUpdate = await checkForUpdates();
            if (hasUpdate) {
                toast.info('Update available!');
            } else {
                toast.success('No updates available');
            }
        } catch (error) {
            toast.error('Failed to check for updates');
        }
    };

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

                {metrics && (
                    <div className="mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded">
                        <div>Cache Hit Rate: {metrics.cacheHitRate.toFixed(1)}%</div>
                        <div className="text-[10px] opacity-70 mt-1">
                            Avg Response: {metrics.avgResponseTime}ms
                        </div>
                        <div className="text-[10px] opacity-70">
                            Sync Pending: {metrics.syncStatus.pending}
                        </div>
                    </div>
                )}
                
                {swStatus && (
                    <div className="text-[10px] opacity-70 mt-1">
                        SW: {swStatus.active ? 'Active' : 'Inactive'} | 
                        {swStatus.waiting ? ' Update pending' : ' Up to date'}
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={handleCheckUpdates}
                    className="flex-1 px-3 py-1.5 bg-blue-500 text-white rounded text-xs hover:bg-blue-600 transition"
                    disabled={!swStatus?.active}
                >
                    Check Updates
                </button>

                <button
                    onClick={() => refreshMetrics()}
                    className="flex-1 px-3 py-1.5 bg-green-500 text-white rounded text-xs hover:bg-green-600 transition"
                >
                    Refresh
                </button>

                <button
                    onClick={handleClearCache}
                    className="flex-1 px-3 py-1.5 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                >
                    Clear Cache
                </button>
            </div>
        </div>
    );
}
