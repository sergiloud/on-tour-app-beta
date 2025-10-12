/**
 * Network Status Manager
 *
 * Monitors online/offline status and provides:
 * - Real-time connectivity detection
 * - Visual notifications
 * - Auto-retry on reconnection
 * - Pending request queue
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import { toast } from 'sonner';

type NetworkStatus = 'online' | 'offline' | 'slow';

interface NetworkInfo {
    status: NetworkStatus;
    effectiveType?: string; // '4g', '3g', '2g', 'slow-2g'
    downlink?: number; // Mbps
    rtt?: number; // Round trip time in ms
    saveData?: boolean;
}

/**
 * Get current network information
 */
const getNetworkInfo = (): NetworkInfo => {
    const isOnline = navigator.onLine;

    // Use Network Information API if available
    const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

    if (!isOnline) {
        return { status: 'offline' };
    }

    if (!connection) {
        return { status: 'online' };
    }

    const { effectiveType, downlink, rtt, saveData } = connection;

    // Determine if connection is slow
    const isSlow = effectiveType === 'slow-2g' ||
        effectiveType === '2g' ||
        (rtt && rtt > 500) ||
        (downlink && downlink < 0.5);

    return {
        status: isSlow ? 'slow' : 'online',
        effectiveType,
        downlink,
        rtt,
        saveData
    };
};

/**
 * Network Status Hook
 *
 * @example
 * const { isOnline, isSlow, networkInfo } = useNetworkStatus();
 *
 * if (!isOnline) {
 *   return <OfflineBanner />;
 * }
 */
export function useNetworkStatus() {
    const [networkInfo, setNetworkInfo] = useState<NetworkInfo>(getNetworkInfo);
    const previousStatus = useRef<NetworkStatus>(networkInfo.status);
    const toastId = useRef<string | number | undefined>(undefined);

    const updateNetworkInfo = useCallback(() => {
        const info = getNetworkInfo();
        setNetworkInfo(info);

        // Show toast on status change
        if (info.status !== previousStatus.current) {
            // Dismiss previous toast
            if (toastId.current) {
                toast.dismiss(toastId.current);
            }

            if (info.status === 'offline') {
                toastId.current = toast.error('Sin conexión', {
                    description: 'Por favor, verifica tu conexión a internet',
                    duration: Infinity, // Don't auto-dismiss
                    action: {
                        label: 'Reintentar',
                        onClick: () => {
                            updateNetworkInfo();
                        }
                    }
                });
            } else if (info.status === 'slow') {
                toastId.current = toast.warning('Conexión lenta', {
                    description: 'La carga puede ser más lenta de lo normal',
                    duration: 5000
                });
            } else if (previousStatus.current === 'offline') {
                // Coming back online
                toastId.current = toast.success('Conectado', {
                    description: 'Tu conexión se ha restablecido',
                    duration: 3000
                });

                // Trigger pending requests retry
                window.dispatchEvent(new Event('online-restored'));
            }

            previousStatus.current = info.status;
        }
    }, []);

    useEffect(() => {
        // Listen to online/offline events
        window.addEventListener('online', updateNetworkInfo);
        window.addEventListener('offline', updateNetworkInfo);

        // Listen to connection changes (if available)
        const connection = (navigator as any).connection ||
            (navigator as any).mozConnection ||
            (navigator as any).webkitConnection;

        if (connection) {
            connection.addEventListener('change', updateNetworkInfo);
        }

        return () => {
            window.removeEventListener('online', updateNetworkInfo);
            window.removeEventListener('offline', updateNetworkInfo);

            if (connection) {
                connection.removeEventListener('change', updateNetworkInfo);
            }

            // Clean up toast on unmount
            if (toastId.current) {
                toast.dismiss(toastId.current);
            }
        };
    }, [updateNetworkInfo]);

    return {
        isOnline: networkInfo.status !== 'offline',
        isOffline: networkInfo.status === 'offline',
        isSlow: networkInfo.status === 'slow',
        networkInfo,
        refresh: updateNetworkInfo
    };
}

/**
 * Pending Request Queue
 * Stores failed requests to retry when connection is restored
 */
class PendingRequestQueue {
    private queue: Array<{
        url: string;
        options?: RequestInit;
        resolve: (value: Response) => void;
        reject: (reason: any) => void;
        timestamp: number;
    }> = [];

    private maxAge = 5 * 60 * 1000; // 5 minutes
    private processing = false;

    add(
        url: string,
        options?: RequestInit
    ): Promise<Response> {
        return new Promise((resolve, reject) => {
            this.queue.push({
                url,
                options,
                resolve,
                reject,
                timestamp: Date.now()
            });
        });
    }

    async processQueue(): Promise<void> {
        if (this.processing || this.queue.length === 0) return;

        this.processing = true;
        const now = Date.now();

        // Process queue in order
        while (this.queue.length > 0) {
            const request = this.queue.shift();
            if (!request) break;

            // Skip expired requests
            if (now - request.timestamp > this.maxAge) {
                request.reject(new Error('Request expired'));
                continue;
            }

            try {
                const response = await fetch(request.url, request.options);
                request.resolve(response);
            } catch (error) {
                request.reject(error);
            }
        }

        this.processing = false;
    }

    clear(): void {
        this.queue = [];
    }

    get length(): number {
        return this.queue.length;
    }
}

// Singleton instance
export const pendingRequestQueue = new PendingRequestQueue();

// Auto-process queue when connection is restored
if (typeof window !== 'undefined') {
    window.addEventListener('online-restored', () => {
        pendingRequestQueue.processQueue();
    });
}

/**
 * Check if current connection is metered (e.g., mobile data)
 * Useful for deciding whether to preload resources
 */
export function isMeteredConnection(): boolean {
    const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

    return connection?.saveData || connection?.type === 'cellular';
}

/**
 * Estimate connection speed
 */
export function getConnectionSpeed(): 'fast' | 'medium' | 'slow' {
    const connection = (navigator as any).connection ||
        (navigator as any).mozConnection ||
        (navigator as any).webkitConnection;

    if (!connection) return 'medium';

    const { effectiveType, downlink } = connection;

    if (effectiveType === '4g' || (downlink && downlink > 5)) {
        return 'fast';
    } else if (effectiveType === '3g' || (downlink && downlink > 1)) {
        return 'medium';
    } else {
        return 'slow';
    }
}
