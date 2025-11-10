/**
 * React Hook for Optimized Finance Calculations
 *
 * Uses Worker Pool for parallel calculations with automatic fallback
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { getFinanceWorkerPool } from '../lib/financeWorkerPool';

interface Show {
    revenue: number;
    expenses: number;
    attendance: number;
    capacity: number;
    currency: string;
    date: string;
    venue?: string;
    city?: string;
}

interface RevenueResult {
    totalRevenue: number;
    byCurrency: Record<string, { original: number; converted: number }>;
}

interface KPIResult {
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    averageRevenue: number;
    totalAttendance: number;
    averageAttendance: number;
    averageCapacity: number;
    profitMargin: number;
}

interface AggregatedResult {
    key: string;
    totalRevenue: number;
    totalExpenses: number;
    netIncome: number;
    totalAttendance: number;
    showCount: number;
    averageRevenue: number;
    averageAttendance: number;
}

interface PerformanceMetrics {
    workerTime?: number;
    syncTime?: number;
    speedup?: number;
    method: 'worker' | 'sync' | 'cache';
}

export function useOptimizedFinanceCalculations(exchangeRates: Record<string, number> = { EUR: 1 }) {
    const [isReady, setIsReady] = useState(true);
    const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
    const workerPool = useRef(getFinanceWorkerPool());
    const resultCache = useRef(new Map<string, { result: any; timestamp: number }>());

    const CACHE_TTL = 5000; // 5 seconds

    useEffect(() => {
        return () => {
            resultCache.current.clear();
        };
    }, []);

    const getCacheKey = useCallback((type: string, data: any): string => {
        return `${type}-${JSON.stringify(data)}`;
    }, []);

    const checkCache = useCallback((key: string): any | null => {
        const cached = resultCache.current.get(key);
        if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
            return cached.result;
        }
        return null;
    }, []);

    const setCache = useCallback((key: string, result: any) => {
        resultCache.current.set(key, { result, timestamp: Date.now() });

        if (resultCache.current.size > 100) {
            const now = Date.now();
            for (const [k, v] of resultCache.current.entries()) {
                if (now - v.timestamp > CACHE_TTL) {
                    resultCache.current.delete(k);
                }
            }
        }
    }, []);

    const calculateRevenue = useCallback(async (shows: Show[]): Promise<RevenueResult> => {
        const cacheKey = getCacheKey('revenue', { shows: shows.length, rates: exchangeRates });

        const cached = checkCache(cacheKey);
        if (cached) {
            setMetrics({ method: 'cache', workerTime: 0 });
            return cached;
        }

        try {
            const result = await workerPool.current.execute({
                type: 'CALCULATE_REVENUE',
                shows: shows.map(s => ({ revenue: s.revenue, currency: s.currency })),
                exchangeRates
            });

            setMetrics({ method: 'worker', workerTime: result.duration });
            setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('[useOptimizedFinance] Worker failed, using sync:', error);

            const startTime = performance.now();
            const result = calculateRevenueSync(shows, exchangeRates);
            const syncTime = performance.now() - startTime;

            setMetrics({ method: 'sync', syncTime });
            setCache(cacheKey, result);
            return result;
        }
    }, [exchangeRates, getCacheKey, checkCache, setCache]);

    const calculateKPIs = useCallback(async (shows: Show[]): Promise<KPIResult> => {
        const cacheKey = getCacheKey('kpis', { shows: shows.length, rates: exchangeRates });

        const cached = checkCache(cacheKey);
        if (cached) {
            setMetrics({ method: 'cache', workerTime: 0 });
            return cached;
        }

        try {
            const result = await workerPool.current.execute({
                type: 'CALCULATE_KPIS',
                shows,
                exchangeRates
            });

            setMetrics({ method: 'worker', workerTime: result.duration });
            setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('[useOptimizedFinance] Worker failed, using sync:', error);

            const startTime = performance.now();
            const result = calculateKPIsSync(shows, exchangeRates);
            const syncTime = performance.now() - startTime;

            setMetrics({ method: 'sync', syncTime });
            setCache(cacheKey, result);
            return result;
        }
    }, [exchangeRates, getCacheKey, checkCache, setCache]);

    const aggregateShows = useCallback(async (
        shows: Show[],
        groupBy: 'month' | 'quarter' | 'year' | 'venue' | 'city'
    ): Promise<AggregatedResult[]> => {
        const cacheKey = getCacheKey('aggregate', { shows: shows.length, groupBy, rates: exchangeRates });

        const cached = checkCache(cacheKey);
        if (cached) {
            setMetrics({ method: 'cache', workerTime: 0 });
            return cached;
        }

        try {
            const result = await workerPool.current.execute({
                type: 'AGGREGATE_SHOWS',
                shows,
                groupBy,
                exchangeRates
            });

            setMetrics({ method: 'worker', workerTime: result.duration });
            setCache(cacheKey, result);
            return result;
        } catch (error) {
            console.error('[useOptimizedFinance] Worker failed, using sync:', error);

            const startTime = performance.now();
            const result = aggregateShowsSync(shows, groupBy, exchangeRates);
            const syncTime = performance.now() - startTime;

            setMetrics({ method: 'sync', syncTime });
            setCache(cacheKey, result);
            return result;
        }
    }, [exchangeRates, getCacheKey, checkCache, setCache]);

    const getStats = useCallback(() => {
        return workerPool.current.getStats();
    }, []);

    return {
        calculateRevenue,
        calculateKPIs,
        aggregateShows,
        getStats,
        isReady,
        metrics
    };
}

// Sync Fallbacks
function calculateRevenueSync(shows: Show[], exchangeRates: Record<string, number>): RevenueResult {
    let totalRevenue = 0;
    const byCurrency: Record<string, { original: number; converted: number }> = {};

    for (const show of shows) {
        const rate = exchangeRates[show.currency] || 1;
        const converted = show.revenue * rate;

        totalRevenue += converted;

        if (!byCurrency[show.currency]) {
            byCurrency[show.currency] = { original: 0, converted: 0 };
        }
        const currencyData = byCurrency[show.currency]!;
        currencyData.original += show.revenue;
        currencyData.converted += converted;
    }

    return { totalRevenue, byCurrency };
}

function calculateKPIsSync(shows: Show[], exchangeRates: Record<string, number>): KPIResult {
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalAttendance = 0;
    let totalCapacity = 0;

    for (const show of shows) {
        const rate = exchangeRates[show.currency] || 1;
        totalRevenue += show.revenue * rate;
        totalExpenses += show.expenses * rate;
        totalAttendance += show.attendance || 0;
        totalCapacity += show.capacity || 0;
    }

    const netIncome = totalRevenue - totalExpenses;
    const count = shows.length || 1;

    return {
        totalRevenue,
        totalExpenses,
        netIncome,
        averageRevenue: totalRevenue / count,
        totalAttendance,
        averageAttendance: totalAttendance / count,
        averageCapacity: totalCapacity / count,
        profitMargin: totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0
    };
}

function aggregateShowsSync(
    shows: Show[],
    groupBy: 'month' | 'quarter' | 'year' | 'venue' | 'city',
    exchangeRates: Record<string, number>
): AggregatedResult[] {
    const groups = new Map<string, { revenue: number; expenses: number; attendance: number; count: number }>();

    const getGroupKey = (show: Show): string => {
        switch (groupBy) {
            case 'month': {
                const date = new Date(show.date);
                return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            }
            case 'quarter': {
                const date = new Date(show.date);
                const quarter = Math.floor(date.getMonth() / 3) + 1;
                return `${date.getFullYear()}-Q${quarter}`;
            }
            case 'year':
                return String(new Date(show.date).getFullYear());
            case 'venue':
                return show.venue || 'Unknown';
            case 'city':
                return show.city || 'Unknown';
        }
    };

    for (const show of shows) {
        const key = getGroupKey(show);
        const rate = exchangeRates[show.currency] || 1;

        if (!groups.has(key)) {
            groups.set(key, { revenue: 0, expenses: 0, attendance: 0, count: 0 });
        }

        const group = groups.get(key)!;
        group.revenue += show.revenue * rate;
        group.expenses += show.expenses * rate;
        group.attendance += show.attendance || 0;
        group.count += 1;
    }

    return Array.from(groups.entries()).map(([key, data]) => ({
        key,
        totalRevenue: data.revenue,
        totalExpenses: data.expenses,
        netIncome: data.revenue - data.expenses,
        totalAttendance: data.attendance,
        showCount: data.count,
        averageRevenue: data.revenue / data.count,
        averageAttendance: data.attendance / data.count
    })).sort((a, b) => a.key.localeCompare(b.key));
}
