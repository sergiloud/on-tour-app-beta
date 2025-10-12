/**
 * Selective Hydration Utilities
 *
 * Optimizes React 18 hydration for better performance.
 * Prioritizes critical interactive elements and defers below-fold content.
 */

import { useEffect, RefObject } from 'react';

/**
 * Priority levels for hydration
 */
export enum HydrationPriority {
    CRITICAL = 'critical',     // Navigation, buttons, forms (hydrate immediately)
    HIGH = 'high',            // Above-fold interactive content
    MEDIUM = 'medium',        // Below-fold interactive content
    LOW = 'low',             // Non-critical content (lazy hydrate)
    IDLE = 'idle'            // Background content (hydrate when browser idle)
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element: HTMLElement): boolean {
    const rect = element.getBoundingClientRect();
    return (
        rect.top >= 0 &&
        rect.left >= 0 &&
        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
        rect.right <= (window.innerWidth || document.documentElement.clientWidth)
    );
}

/**
 * Lazy hydrate component when it enters viewport
 */
export function observeForHydration(
    element: HTMLElement,
    callback: () => void,
    options: IntersectionObserverInit = {}
): () => void {
    // Check if IntersectionObserver is supported
    if (!('IntersectionObserver' in window)) {
        // Fallback: hydrate immediately
        callback();
        return () => { };
    }

    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    callback();
                    observer.disconnect();
                }
            });
        },
        {
            rootMargin: '50px', // Start hydrating 50px before element enters viewport
            threshold: 0.01,
            ...options,
        }
    );

    observer.observe(element);

    // Return cleanup function
    return () => observer.disconnect();
}

/**
 * Hydrate when user interacts with element
 */
export function observeForInteraction(
    element: HTMLElement,
    callback: () => void,
    events: string[] = ['mouseenter', 'touchstart', 'focus']
): () => void {
    let triggered = false;

    const handler = () => {
        if (!triggered) {
            triggered = true;
            callback();
            cleanup();
        }
    };

    const cleanup = () => {
        events.forEach(event => {
            element.removeEventListener(event, handler);
        });
    };

    events.forEach(event => {
        element.addEventListener(event, handler, { once: true, passive: true });
    });

    return cleanup;
}

/**
 * Hydrate when browser is idle
 */
export function hydrateWhenIdle(
    callback: () => void,
    timeout: number = 5000
): () => void {
    // Check if requestIdleCallback is supported
    if ('requestIdleCallback' in window) {
        const idleCallbackId = requestIdleCallback(callback, { timeout });
        return () => cancelIdleCallback(idleCallbackId);
    } else {
        // Fallback: use setTimeout
        const timeoutId = setTimeout(callback, timeout);
        return () => clearTimeout(timeoutId);
    }
}

/**
 * Hydration scheduler
 * Manages priority-based hydration queue
 */
export class HydrationScheduler {
    private queue: Map<HydrationPriority, Array<() => void>> = new Map([
        [HydrationPriority.CRITICAL, []],
        [HydrationPriority.HIGH, []],
        [HydrationPriority.MEDIUM, []],
        [HydrationPriority.LOW, []],
        [HydrationPriority.IDLE, []],
    ]);

    private processing = false;

    /**
     * Add component to hydration queue
     */
    schedule(priority: HydrationPriority, callback: () => void): void {
        const priorityQueue = this.queue.get(priority);
        if (priorityQueue) {
            priorityQueue.push(callback);
        }

        // Start processing if not already running
        if (!this.processing) {
            this.process();
        }
    }

    /**
     * Process hydration queue
     */
    private async process(): Promise<void> {
        this.processing = true;

        // Process in priority order
        for (const [priority, queue] of this.queue) {
            while (queue.length > 0) {
                const callback = queue.shift();
                if (callback) {
                    try {
                        // For CRITICAL and HIGH priority, execute immediately
                        if (priority === HydrationPriority.CRITICAL || priority === HydrationPriority.HIGH) {
                            callback();
                        }
                        // For MEDIUM and LOW, yield to browser between tasks
                        else if (priority === HydrationPriority.MEDIUM || priority === HydrationPriority.LOW) {
                            await new Promise(resolve => setTimeout(resolve, 0));
                            callback();
                        }
                        // For IDLE, use requestIdleCallback
                        else if (priority === HydrationPriority.IDLE) {
                            await new Promise(resolve => {
                                if ('requestIdleCallback' in window) {
                                    requestIdleCallback(() => {
                                        callback();
                                        resolve(undefined);
                                    });
                                } else {
                                    setTimeout(() => {
                                        callback();
                                        resolve(undefined);
                                    }, 100);
                                }
                            });
                        }
                    } catch (error) {
                        console.error(`[Hydration Error] Priority ${priority}:`, error);
                    }
                }
            }
        }

        this.processing = false;
    }

    /**
     * Clear all pending hydrations
     */
    clear(): void {
        this.queue.forEach(queue => queue.length = 0);
        this.processing = false;
    }
}

// Global hydration scheduler instance
export const hydrationScheduler = new HydrationScheduler();

/**
 * React Hook: Lazy hydrate component based on visibility
 */
export function useLazyHydration(
    ref: RefObject<HTMLElement>,
    callback: () => void,
    enabled: boolean = true
): void {
    useEffect(() => {
        if (!enabled || !ref.current) return;

        const cleanup = observeForHydration(ref.current, callback);
        return cleanup;
    }, [ref, callback, enabled]);
}

/**
 * React Hook: Hydrate on interaction
 */
export function useInteractionHydration(
    ref: RefObject<HTMLElement>,
    callback: () => void,
    events?: string[]
): void {
    useEffect(() => {
        if (!ref.current) return;

        const cleanup = observeForInteraction(ref.current, callback, events);
        return cleanup;
    }, [ref, callback, events]);
}

/**
 * React Hook: Hydrate when idle
 */
export function useIdleHydration(
    callback: () => void,
    timeout?: number
): void {
    useEffect(() => {
        const cleanup = hydrateWhenIdle(callback, timeout);
        return cleanup;
    }, [callback, timeout]);
}

/**
 * Performance monitoring for hydration
 */
export class HydrationMonitor {
    private startTime = 0;
    private hydrations: Array<{
        component: string;
        priority: HydrationPriority;
        duration: number;
        timestamp: number;
    }> = [];

    start(): void {
        this.startTime = performance.now();
    }

    recordHydration(
        component: string,
        priority: HydrationPriority,
        startTime: number
    ): void {
        const duration = performance.now() - startTime;
        this.hydrations.push({
            component,
            priority,
            duration,
            timestamp: Date.now(),
        });
    }

    getStats(): {
        totalHydrations: number;
        averageDuration: number;
        byPriority: Record<string, number>;
        slowest: Array<{ component: string; duration: number }>;
    } {
        const totalHydrations = this.hydrations.length;
        const averageDuration = totalHydrations > 0
            ? this.hydrations.reduce((sum, h) => sum + h.duration, 0) / totalHydrations
            : 0;

        const byPriority: Record<string, number> = {};
        this.hydrations.forEach(h => {
            byPriority[h.priority] = (byPriority[h.priority] || 0) + 1;
        });

        const slowest = [...this.hydrations]
            .sort((a, b) => b.duration - a.duration)
            .slice(0, 10)
            .map(h => ({ component: h.component, duration: h.duration }));

        return {
            totalHydrations,
            averageDuration,
            byPriority,
            slowest,
        };
    }

    clear(): void {
        this.hydrations = [];
        this.startTime = 0;
    }
}

// Global hydration monitor instance
export const hydrationMonitor = new HydrationMonitor();
