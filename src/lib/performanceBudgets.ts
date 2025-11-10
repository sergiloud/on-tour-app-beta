/**
 * Performance Budget System
 *
 * Monitors performance metrics and alerts when budgets are exceeded.
 * Integrates with toast notifications for developer feedback.
 */

import { toast } from 'sonner';

export interface PerformanceBudget {
    metric: string;
    budget: number;
    current?: number;
    unit: string;
    severity: 'warning' | 'error';
}

export const PERFORMANCE_BUDGETS: PerformanceBudget[] = [
    // Web Vitals
    { metric: 'LCP', budget: 2500, unit: 'ms', severity: 'error' },
    { metric: 'FCP', budget: 1800, unit: 'ms', severity: 'warning' },
    { metric: 'CLS', budget: 0.1, unit: '', severity: 'error' },
    { metric: 'INP', budget: 200, unit: 'ms', severity: 'error' },
    { metric: 'TTFB', budget: 800, unit: 'ms', severity: 'warning' },

    // Custom Metrics
    { metric: 'Finance Calc Time', budget: 100, unit: 'ms', severity: 'warning' },
    { metric: 'Cache Hit Rate', budget: 70, unit: '%', severity: 'warning' },
    { metric: 'Worker Queue Size', budget: 50, unit: 'tasks', severity: 'error' },
    { metric: 'FPS', budget: 50, unit: 'fps', severity: 'warning' },
    { metric: 'Bundle Size', budget: 500, unit: 'KB', severity: 'error' },
];

interface AlertState {
    [metric: string]: {
        lastAlert: number;
        alertCount: number;
    };
}

class PerformanceBudgetMonitor {
    private alertState: AlertState = {};
    private readonly ALERT_COOLDOWN = 30000; // 30 seconds between same alerts
    private readonly MAX_ALERTS_PER_METRIC = 3; // Max 3 alerts per session per metric
    private enabled = import.meta.env.DEV; // Only in development

    /**
     * Check if a metric exceeds its budget
     */
    check(metric: string, value: number): boolean {
        if (!this.enabled) return false;

        const budget = PERFORMANCE_BUDGETS.find(b => b.metric === metric);
        if (!budget) return false;

        // Special handling for inverse metrics (higher is better)
        const isInverse = metric === 'Cache Hit Rate' || metric === 'FPS';
        const exceeds = isInverse ? value < budget.budget : value > budget.budget;

        if (exceeds) {
            this.alert(metric, value, budget.budget, budget.unit, budget.severity);
            return true;
        }

        return false;
    }

    /**
     * Send an alert (with cooldown and rate limiting)
     */
    private alert(
        metric: string,
        current: number,
        budget: number,
        unit: string,
        severity: 'warning' | 'error'
    ) {
        const now = Date.now();
        const state = this.alertState[metric] || { lastAlert: 0, alertCount: 0 };

        // Check cooldown
        if (now - state.lastAlert < this.ALERT_COOLDOWN) {
            return;
        }

        // Check rate limit
        if (state.alertCount >= this.MAX_ALERTS_PER_METRIC) {
            return;
        }

        // Update state
        this.alertState[metric] = {
            lastAlert: now,
            alertCount: state.alertCount + 1
        };

        // Send alert
        const message = `${metric}: ${current}${unit} exceeds budget of ${budget}${unit}`;

        if (severity === 'error') {
            toast.error(`⚠️ Performance Budget Exceeded`, {
                description: message,
                duration: 5000,
            });
        } else {
            toast.warning(`📊 Performance Warning`, {
                description: message,
                duration: 4000,
            });
        }

        // Console log for debugging
        console.warn(`[Performance Budget] ${severity.toUpperCase()}: ${message}`);
    }

    /**
     * Reset alert state (useful for testing)
     */
    reset() {
        this.alertState = {};
    }

    /**
     * Enable/disable monitoring
     */
    setEnabled(enabled: boolean) {
        this.enabled = enabled;
    }

    /**
     * Get current alert state
     */
    getAlertState(): AlertState {
        return { ...this.alertState };
    }
}

// Singleton instance
const monitor = new PerformanceBudgetMonitor();

export { monitor as performanceBudgetMonitor };

/**
 * React Hook for monitoring performance budgets
 */
export function usePerformanceBudget() {
    const check = (metric: string, value: number) => {
        return monitor.check(metric, value);
    };

    const reset = () => {
        monitor.reset();
    };

    const setEnabled = (enabled: boolean) => {
        monitor.setEnabled(enabled);
    };

    return { check, reset, setEnabled };
}

/**
 * Automatic monitoring helpers
 */

// Monitor Web Vitals
export function monitorWebVitals() {
    if (typeof window === 'undefined') return;

    // Load from localStorage
    const vitalsStr = localStorage.getItem('web-vitals-latest');
    if (!vitalsStr) return;

    try {
        const vitals = JSON.parse(vitalsStr);

        if (vitals.lcp) monitor.check('LCP', vitals.lcp);
        if (vitals.fcp) monitor.check('FCP', vitals.fcp);
        if (vitals.cls) monitor.check('CLS', vitals.cls);
        if (vitals.inp) monitor.check('INP', vitals.inp);
        if (vitals.ttfb) monitor.check('TTFB', vitals.ttfb);
    } catch (error) {
        console.error('[Performance Budget] Failed to parse web vitals:', error);
    }
}

// Monitor Cache Hit Rate
export function monitorCacheHitRate(hitRate: string) {
    const rate = parseFloat(hitRate);
    if (!isNaN(rate)) {
        monitor.check('Cache Hit Rate', rate);
    }
}

// Monitor Finance Calculations
export function monitorFinanceCalc(timeMs: number) {
    monitor.check('Finance Calc Time', timeMs);
}

// Monitor Worker Queue
export function monitorWorkerQueue(queueSize: number) {
    monitor.check('Worker Queue Size', queueSize);
}

// Monitor FPS
export function monitorFPS(fps: number) {
    monitor.check('FPS', fps);
}

/**
 * Generate performance report
 */
export function generatePerformanceReport(): string {
    const report = PERFORMANCE_BUDGETS.map(budget => {
        const status = budget.current
            ? budget.current > budget.budget
                ? '❌ EXCEEDED'
                : '✅ OK'
            : '⏳ N/A';

        const currentStr = budget.current ? `${budget.current}${budget.unit}` : 'N/A';

        return `${budget.metric}: ${currentStr} / ${budget.budget}${budget.unit} ${status}`;
    }).join('\n');

    return `Performance Budget Report:\n${report}`;
}

/**
 * Check all budgets at once
 */
export function checkAllBudgets(metrics: { [key: string]: number }) {
    let exceeded = 0;

    Object.entries(metrics).forEach(([metric, value]) => {
        if (monitor.check(metric, value)) {
            exceeded++;
        }
    });

    return exceeded;
}
