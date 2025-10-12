/**
 * Predictive Prefetch System
 *
 * Intelligent prefetching based on user behavior:
 * - Hover intent detection
 * - Scroll-based prefetching
 * - Navigation history patterns
 * - Time-based predictions
 * - Viewport intersection
 */

import { useEffect, useRef, useCallback } from 'react';

// ========================================
// Types
// ========================================

interface PrefetchOptions {
    delay?: number;
    priority?: 'high' | 'low' | 'auto';
    crossOrigin?: 'anonymous' | 'use-credentials';
}

interface NavigationPattern {
    from: string;
    to: string;
    count: number;
    avgTime: number;
}

// ========================================
// Core Prefetch Functions
// ========================================

/**
 * Prefetch a JavaScript module
 */
export function prefetchModule(modulePath: string, options?: PrefetchOptions) {
    const link = document.createElement('link');
    link.rel = 'modulepreload';
    link.href = modulePath;

    if (options?.crossOrigin) {
        link.crossOrigin = options.crossOrigin;
    }

    document.head.appendChild(link);

    return () => {
        document.head.removeChild(link);
    };
}

/**
 * Prefetch a route/page
 */
export function prefetchRoute(route: string, options?: PrefetchOptions) {
    const delay = options?.delay || 0;

    const timer = setTimeout(() => {
        // Trigger route prefetch via React Router or similar
        if (window.__prefetchRoute) {
            window.__prefetchRoute(route);
        }
    }, delay);

    return () => clearTimeout(timer);
}

/**
 * Prefetch an image
 */
export function prefetchImage(src: string, options?: PrefetchOptions) {
    const link = document.createElement('link');
    link.rel = 'prefetch';
    link.as = 'image';
    link.href = src;

    if (options?.crossOrigin) {
        link.crossOrigin = options.crossOrigin;
    }

    document.head.appendChild(link);

    return () => {
        document.head.removeChild(link);
    };
}

/**
 * Prefetch fetch request data
 */
export async function prefetchData(url: string, options?: RequestInit) {
    try {
        const response = await fetch(url, {
            ...options,
            priority: 'low',
            // @ts-ignore - priority is experimental
            importance: 'low'
        });

        // Cache in memory
        const data = await response.json();

        if (window.__dataCache) {
            window.__dataCache.set(url, data);
        }

        return data;
    } catch (error) {
        console.warn('[Prefetch] Failed to prefetch data:', url, error);
    }
}

// ========================================
// React Hooks
// ========================================

/**
 * Prefetch on hover with debounce
 */
export function usePrefetchOnHover(
    targetRef: string | (() => void),
    options?: PrefetchOptions & { hoverDelay?: number }
) {
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const prefetchedRef = useRef(false);
    const hoverDelay = options?.hoverDelay || 50;

    const handleMouseEnter = useCallback(() => {
        if (prefetchedRef.current) return;

        timerRef.current = setTimeout(() => {
            if (typeof targetRef === 'string') {
                prefetchRoute(targetRef, options);
            } else {
                targetRef();
            }
            prefetchedRef.current = true;
        }, hoverDelay);
    }, [targetRef, options, hoverDelay]);

    const handleMouseLeave = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
    }, []);

    return {
        onMouseEnter: handleMouseEnter,
        onMouseLeave: handleMouseLeave,
        onTouchStart: handleMouseEnter
    };
}

/**
 * Prefetch on viewport intersection
 */
export function usePrefetchOnVisible(
    elementRef: React.RefObject<HTMLElement>,
    callback: () => void,
    options?: IntersectionObserverInit & { once?: boolean }
) {
    const prefetchedRef = useRef(false);
    const once = options?.once !== false;

    useEffect(() => {
        const element = elementRef.current;
        if (!element || (once && prefetchedRef.current)) return;

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !prefetchedRef.current) {
                        callback();
                        if (once) {
                            prefetchedRef.current = true;
                            observer.disconnect();
                        }
                    }
                });
            },
            {
                threshold: options?.threshold || 0.1,
                rootMargin: options?.rootMargin || '50px'
            }
        );

        observer.observe(element);

        return () => observer.disconnect();
    }, [elementRef, callback, once, options?.threshold, options?.rootMargin]);
}

/**
 * Prefetch on idle
 */
export function usePrefetchOnIdle(callback: () => void, delay = 2000) {
    useEffect(() => {
        if (typeof window === 'undefined') return;

        const timer = setTimeout(() => {
            if ('requestIdleCallback' in window) {
                window.requestIdleCallback(callback, { timeout: 5000 });
            } else {
                callback();
            }
        }, delay);

        return () => clearTimeout(timer);
    }, [callback, delay]);
}

// ========================================
// Navigation Pattern Learning
// ========================================

export class NavigationPredictor {
    private static patterns: Map<string, NavigationPattern[]> = new Map();
    private static currentRoute: string = '/';
    private static enterTime: number = Date.now();

    /**
     * Track navigation event
     */
    static trackNavigation(from: string, to: string, duration: number) {
        const patterns = this.patterns.get(from) || [];
        const existing = patterns.find(p => p.to === to);

        if (existing) {
            existing.count++;
            existing.avgTime = (existing.avgTime * (existing.count - 1) + duration) / existing.count;
        } else {
            patterns.push({
                from,
                to,
                count: 1,
                avgTime: duration
            });
        }

        this.patterns.set(from, patterns);

        // Persist to localStorage
        this.persist();
    }

    /**
     * Get likely next routes
     */
    static predictNext(currentRoute: string, topN = 3): string[] {
        const patterns = this.patterns.get(currentRoute) || [];

        return patterns
            .sort((a, b) => b.count - a.count)
            .slice(0, topN)
            .map(p => p.to);
    }

    /**
     * Auto-prefetch based on current route
     */
    static autoPrefetch(currentRoute: string) {
        const predictions = this.predictNext(currentRoute, 2);

        predictions.forEach((route, index) => {
            // Prefetch with increasing delay
            setTimeout(() => {
                prefetchRoute(route, { priority: index === 0 ? 'high' : 'low' });
            }, index * 500);
        });
    }

    /**
     * Initialize route tracking
     */
    static init(currentRoute: string) {
        this.currentRoute = currentRoute;
        this.enterTime = Date.now();
        this.load();
    }

    /**
     * Update on route change
     */
    static updateRoute(newRoute: string) {
        const duration = Date.now() - this.enterTime;
        this.trackNavigation(this.currentRoute, newRoute, duration);
        this.currentRoute = newRoute;
        this.enterTime = Date.now();

        // Auto-prefetch likely next routes
        this.autoPrefetch(newRoute);
    }

    /**
     * Persist patterns to localStorage
     */
    private static persist() {
        try {
            const data = Array.from(this.patterns.entries());
            localStorage.setItem('nav-patterns', JSON.stringify(data));
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    /**
     * Load patterns from localStorage
     */
    private static load() {
        try {
            const data = localStorage.getItem('nav-patterns');
            if (data) {
                const parsed = JSON.parse(data);
                this.patterns = new Map(parsed);
            }
        } catch (e) {
            // Ignore localStorage errors
        }
    }

    /**
     * Get statistics
     */
    static getStats() {
        const allPatterns = Array.from(this.patterns.values()).flat();
        const totalNavigations = allPatterns.reduce((sum, p) => sum + p.count, 0);
        const uniqueRoutes = new Set(allPatterns.map(p => p.to)).size;

        return {
            totalNavigations,
            uniqueRoutes,
            patterns: allPatterns.sort((a, b) => b.count - a.count).slice(0, 10)
        };
    }
}

// ========================================
// React Hook for Navigation Prediction
// ========================================

export function useNavigationPredictor(currentRoute: string) {
    useEffect(() => {
        NavigationPredictor.init(currentRoute);
    }, []);

    useEffect(() => {
        NavigationPredictor.updateRoute(currentRoute);
    }, [currentRoute]);

    const predictNext = useCallback(() => {
        return NavigationPredictor.predictNext(currentRoute);
    }, [currentRoute]);

    return { predictNext };
}

// ========================================
// Scroll-Based Prefetching
// ========================================

export class ScrollPrefetcher {
    private static scrollPosition = 0;
    private static scrollVelocity = 0;
    private static lastScrollTime = Date.now();
    private static sections: Map<string, { offset: number; prefetched: boolean }> = new Map();

    /**
     * Register a section for prefetching
     */
    static registerSection(id: string, offset: number) {
        this.sections.set(id, { offset, prefetched: false });
    }

    /**
     * Handle scroll event
     */
    static handleScroll() {
        const now = Date.now();
        const currentScroll = window.scrollY;
        const deltaTime = now - this.lastScrollTime;
        const deltaScroll = currentScroll - this.scrollPosition;

        // Calculate velocity (pixels per millisecond)
        this.scrollVelocity = deltaTime > 0 ? deltaScroll / deltaTime : 0;

        this.scrollPosition = currentScroll;
        this.lastScrollTime = now;

        // Check sections
        this.checkSections();
    }

    /**
     * Check which sections to prefetch
     */
    private static checkSections() {
        const viewportHeight = window.innerHeight;
        const predictedScroll = this.scrollPosition + (this.scrollVelocity * 1000); // 1s prediction

        this.sections.forEach((section, id) => {
            if (!section.prefetched && predictedScroll + viewportHeight >= section.offset) {
                // Prefetch this section
                if (window.__prefetchSection) {
                    window.__prefetchSection(id);
                }
                section.prefetched = true;
            }
        });
    }

    /**
     * Initialize scroll tracking
     */
    static init() {
        let ticking = false;

        const onScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        };

        window.addEventListener('scroll', onScroll, { passive: true });

        return () => {
            window.removeEventListener('scroll', onScroll);
        };
    }
}

// ========================================
// React Hook for Scroll Prefetching
// ========================================

export function useScrollPrefetch() {
    useEffect(() => {
        return ScrollPrefetcher.init();
    }, []);

    const registerSection = useCallback((id: string, offset: number) => {
        ScrollPrefetcher.registerSection(id, offset);
    }, []);

    return { registerSection };
}

// ========================================
// TypeScript Global Augmentation
// ========================================

declare global {
    interface Window {
        __prefetchRoute?: (route: string) => void;
        __prefetchSection?: (id: string) => void;
        __dataCache?: Map<string, any>;
    }
}

// Initialize data cache
if (typeof window !== 'undefined') {
    window.__dataCache = new Map();
}
