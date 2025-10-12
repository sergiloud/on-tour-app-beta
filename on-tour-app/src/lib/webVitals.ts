/**
 * Web Vitals Monitoring
 *
 * Tracks Core Web Vitals and custom performance metrics:
 * - LCP (Largest Contentful Paint) - Loading performance
 * - FID (First Input Delay) - Interactivity
 * - CLS (Cumulative Layout Shift) - Visual stability
 * - FCP (First Contentful Paint)
 * - TTFB (Time to First Byte)
 * - INP (Interaction to Next Paint) - New responsiveness metric
 */

import { onCLS, onFCP, onLCP, onTTFB, onINP, type Metric } from 'web-vitals';

interface WebVitalsReport {
    name: string;
    value: number;
    rating: 'good' | 'needs-improvement' | 'poor';
    delta: number;
    id: string;
    navigationType: string;
}

/**
 * Rating thresholds based on Google's recommendations
 */
const THRESHOLDS = {
    LCP: { good: 2500, poor: 4000 },      // Largest Contentful Paint
    CLS: { good: 0.1, poor: 0.25 },       // Cumulative Layout Shift
    FCP: { good: 1800, poor: 3000 },      // First Contentful Paint
    TTFB: { good: 800, poor: 1800 },      // Time to First Byte
    INP: { good: 200, poor: 500 }         // Interaction to Next Paint
};

/**
 * Calculate rating based on thresholds
 */
function getRating(name: string, value: number): 'good' | 'needs-improvement' | 'poor' {
    const threshold = THRESHOLDS[name as keyof typeof THRESHOLDS];
    if (!threshold) return 'good';

    if (value <= threshold.good) return 'good';
    if (value <= threshold.poor) return 'needs-improvement';
    return 'poor';
}

/**
 * Send metrics to analytics (implement your analytics service)
 */
function sendToAnalytics(metric: WebVitalsReport) {
    // Log to console in development
    if (import.meta.env.DEV) {
        const emoji = metric.rating === 'good' ? '✅' : metric.rating === 'needs-improvement' ? '⚠️' : '❌';
        // console.log(
        //     `${emoji} [Web Vitals] ${metric.name}:`,
        //     `${metric.value.toFixed(0)}ms`,
        //     `(${metric.rating})`
        // );
    }

    // Send to analytics service in production
    if (import.meta.env.PROD) {
        // Example: Google Analytics 4
        if (typeof (window as any).gtag !== 'undefined') {
            (window as any).gtag('event', metric.name, {
                value: Math.round(metric.value),
                metric_rating: metric.rating,
                metric_delta: Math.round(metric.delta),
                metric_id: metric.id
            });
        }

        // Example: Custom analytics endpoint
        if (navigator.sendBeacon) {
            const body = JSON.stringify({
                name: metric.name,
                value: metric.value,
                rating: metric.rating,
                url: window.location.href,
                userAgent: navigator.userAgent,
                timestamp: Date.now()
            });

            navigator.sendBeacon('/api/analytics/web-vitals', body);
        }
    }
}

/**
 * Process and report metric
 */
function reportMetric(metric: Metric) {
    const report: WebVitalsReport = {
        name: metric.name,
        value: metric.value,
        rating: getRating(metric.name, metric.value),
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType
    };

    sendToAnalytics(report);
}

/**
 * Initialize Web Vitals monitoring
 * Call this once in your app entry point
 */
export function initWebVitals() {
    // Core Web Vitals
    onLCP(reportMetric);  // Largest Contentful Paint
    onCLS(reportMetric);  // Cumulative Layout Shift
    onINP(reportMetric);  // Interaction to Next Paint (replaces FID)

    // Additional metrics
    onFCP(reportMetric);  // First Contentful Paint
    onTTFB(reportMetric); // Time to First Byte
}

/**
 * Custom performance marks and measures
 */
export const performanceMonitor = {
    /**
     * Mark a performance timestamp
     */
    mark(name: string) {
        if (typeof performance !== 'undefined' && performance.mark) {
            performance.mark(name);
        }
    },

    /**
     * Measure duration between two marks
     */
    measure(name: string, startMark: string, endMark?: string) {
        if (typeof performance !== 'undefined' && performance.measure) {
            try {
                const measure = performance.measure(name, startMark, endMark);

                if (import.meta.env.DEV) {
                    // console.log(`⏱️ [Performance] ${name}: ${measure.duration.toFixed(2)}ms`);
                }

                return measure.duration;
            } catch (error) {
                console.warn('Failed to measure performance:', error);
                return 0;
            }
        }
        return 0;
    },

    /**
     * Get all performance entries of a type
     */
    getEntries(type: string): PerformanceEntry[] {
        if (typeof performance !== 'undefined' && performance.getEntriesByType) {
            return performance.getEntriesByType(type);
        }
        return [];
    },

    /**
     * Clear performance marks and measures
     */
    clear() {
        if (typeof performance !== 'undefined') {
            performance.clearMarks();
            performance.clearMeasures();
        }
    }
};

/**
 * Track custom timing for specific operations
 *
 * @example
 * const timer = trackTiming('data-fetch');
 * await fetchData();
 * timer.end(); // Logs duration
 */
export function trackTiming(name: string) {
    const startMark = `${name}-start`;
    const endMark = `${name}-end`;

    performanceMonitor.mark(startMark);

    return {
        end() {
            performanceMonitor.mark(endMark);
            return performanceMonitor.measure(name, startMark, endMark);
        }
    };
}

/**
 * Track bundle size and load time
 */
export function trackResourceTiming() {
    if (typeof performance === 'undefined') return;

    const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
            if (entry.entryType === 'resource') {
                const resource = entry as PerformanceResourceTiming;

                // Only log large resources in dev
                if (import.meta.env.DEV && resource.transferSize > 100000) {
                    console.log(`📦 [Resource] ${resource.name.split('/').pop()}: ${(resource.transferSize / 1024).toFixed(0)}KB (${resource.duration.toFixed(0)}ms)`);
                }

                // Track JS bundles
                if (resource.name.includes('.js') && resource.transferSize > 0) {
                    sendToAnalytics({
                        name: 'bundle-load',
                        value: resource.duration,
                        rating: resource.duration < 1000 ? 'good' : resource.duration < 3000 ? 'needs-improvement' : 'poor',
                        delta: 0,
                        id: resource.name,
                        navigationType: 'navigate'
                    });
                }
            }
        }
    });

    observer.observe({ entryTypes: ['resource'] });
}

/**
 * Track long tasks (>50ms on main thread)
 */
export function trackLongTasks() {
    if (typeof PerformanceObserver === 'undefined') return;

    try {
        const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
                const longTask = entry as any;

                // Only warn about truly problematic tasks (>100ms)
                if (import.meta.env.DEV && longTask.duration > 100) {
                    console.warn(
                        `⚠️ [Long Task] ${longTask.duration.toFixed(0)}ms`,
                        longTask.attribution?.[0]?.name || 'unknown'
                    );
                }

                // Track in production
                if (import.meta.env.PROD && longTask.duration > 100) {
                    sendToAnalytics({
                        name: 'long-task',
                        value: longTask.duration,
                        rating: 'poor',
                        delta: 0,
                        id: longTask.attribution?.[0]?.name || 'unknown',
                        navigationType: 'navigate'
                    });
                }
            }
        });

        observer.observe({ entryTypes: ['longtask'] });
    } catch (error) {
        // longtask not supported in all browsers
        // console.log('Long task monitoring not supported');
    }
}

/**
 * Get current performance summary
 */
export function getPerformanceSummary() {
    if (typeof performance === 'undefined') return null;

    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;

    return {
        dns: navigation?.domainLookupEnd - navigation?.domainLookupStart,
        tcp: navigation?.connectEnd - navigation?.connectStart,
        ttfb: navigation?.responseStart - navigation?.requestStart,
        download: navigation?.responseEnd - navigation?.responseStart,
        domInteractive: navigation?.domInteractive,
        domComplete: navigation?.domComplete,
        loadComplete: navigation?.loadEventEnd - navigation?.loadEventStart
    };
}
