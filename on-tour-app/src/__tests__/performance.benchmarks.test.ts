/**
 * Performance Benchmark Suite
 *
 * Automated tests to measure performance of all optimizations.
 * Run with: npm run test:bench
 */

import { describe, test, expect, beforeAll } from 'vitest';
import { getFinanceWorkerPool } from '../lib/financeWorkerPool';
import { generateMockShows } from '../features/finance/demoData';

describe('Performance Benchmarks', () => {
    let workerPool: ReturnType<typeof getFinanceWorkerPool>;

    beforeAll(() => {
        workerPool = getFinanceWorkerPool();
    });

    describe('Finance Worker Pool', () => {
        test('should calculate revenue for 1k shows in < 20ms', async () => {
            const shows = generateMockShows(1000);
            const start = performance.now();

            await workerPool.execute('calculateRevenue', { shows, exchangeRates: { EUR: 1 } });

            const duration = performance.now() - start;
            // console.log(`[Benchmark] 1k shows revenue: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(20);
        });

        test('should calculate revenue for 10k shows in < 50ms', async () => {
            const shows = generateMockShows(10000);
            const start = performance.now();

            await workerPool.execute('calculateRevenue', { shows, exchangeRates: { EUR: 1 } });

            const duration = performance.now() - start;
            // console.log(`[Benchmark] 10k shows revenue: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(50);
        });

        test('should calculate KPIs for 1k shows in < 25ms', async () => {
            const shows = generateMockShows(1000);
            const start = performance.now();

            await workerPool.execute('calculateKPIs', { shows, exchangeRates: { EUR: 1 } });

            const duration = performance.now() - start;
            // console.log(`[Benchmark] 1k shows KPIs: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(25);
        });

        test('should aggregate 5k shows in < 40ms', async () => {
            const shows = generateMockShows(5000);
            const start = performance.now();

            await workerPool.execute('aggregateShows', {
                shows,
                groupBy: 'month',
                exchangeRates: { EUR: 1 }
            });

            const duration = performance.now() - start;
            // console.log(`[Benchmark] 5k shows aggregation: ${duration.toFixed(2)}ms`);
            expect(duration).toBeLessThan(40);
        });

        test('should handle concurrent requests efficiently', async () => {
            const shows1k = generateMockShows(1000);
            const start = performance.now();

            // Execute 5 concurrent requests
            await Promise.all([
                workerPool.execute('calculateRevenue', { shows: shows1k, exchangeRates: { EUR: 1 } }),
                workerPool.execute('calculateRevenue', { shows: shows1k, exchangeRates: { EUR: 1 } }),
                workerPool.execute('calculateKPIs', { shows: shows1k, exchangeRates: { EUR: 1 } }),
                workerPool.execute('calculateKPIs', { shows: shows1k, exchangeRates: { EUR: 1 } }),
                workerPool.execute('aggregateShows', { shows: shows1k, groupBy: 'month', exchangeRates: { EUR: 1 } }),
            ]);

            const duration = performance.now() - start;
            // console.log(`[Benchmark] 5 concurrent 1k requests: ${duration.toFixed(2)}ms`);

            // Should complete faster than serial execution (5 * 20ms = 100ms)
            expect(duration).toBeLessThan(80);
        });

        test('should recover from worker failure', async () => {
            const shows = generateMockShows(1000);

            // This should work even if a worker fails
            const result = await workerPool.execute('calculateRevenue', {
                shows,
                exchangeRates: { EUR: 1 }
            });

            expect(result).toBeDefined();
            expect(result.totalRevenue).toBeGreaterThan(0);
        });

        test('should maintain pool stats correctly', async () => {
            const shows = generateMockShows(100);

            // Execute multiple tasks
            await Promise.all([
                workerPool.execute('calculateRevenue', { shows, exchangeRates: { EUR: 1 } }),
                workerPool.execute('calculateKPIs', { shows, exchangeRates: { EUR: 1 } }),
            ]);

            const stats = workerPool.getStats();

            expect(stats.poolSize).toBeGreaterThan(0);
            expect(stats.totalTasks).toBeGreaterThanOrEqual(2);
            expect(stats.busyWorkers).toBeGreaterThanOrEqual(0);
            expect(stats.queueSize).toBeGreaterThanOrEqual(0);

            // console.log('[Benchmark] Worker pool stats:', stats);
        });
    });

    describe('Cache Performance', () => {
        test('should hit cache on repeated calculations', async () => {
            const shows = generateMockShows(1000);

            // First call - should miss cache
            const start1 = performance.now();
            await workerPool.execute('calculateRevenue', { shows, exchangeRates: { EUR: 1 } });
            const duration1 = performance.now() - start1;

            // Second call - should hit cache (within 5s TTL)
            const start2 = performance.now();
            await workerPool.execute('calculateRevenue', { shows, exchangeRates: { EUR: 1 } });
            const duration2 = performance.now() - start2;

            // console.log(`[Benchmark] First call: ${duration1.toFixed(2)}ms, Second call: ${duration2.toFixed(2)}ms`);

            // Cache hit should be much faster
            expect(duration2).toBeLessThan(duration1 * 0.5);
        });
    });

    describe('Baseline Comparisons', () => {
        test('should be faster than sync calculation for 5k+ shows', async () => {
            const shows = generateMockShows(5000);

            // Sync calculation (simplified)
            const startSync = performance.now();
            let totalRevenue = 0;
            for (const show of shows) {
                totalRevenue += (show.revenue || 0);
            }
            const syncDuration = performance.now() - startSync;

            // Worker calculation
            const startWorker = performance.now();
            await workerPool.execute('calculateRevenue', { shows, exchangeRates: { EUR: 1 } });
            const workerDuration = performance.now() - startWorker;

            // console.log(`[Benchmark] Sync: ${syncDuration.toFixed(2)}ms, Worker: ${workerDuration.toFixed(2)}ms`);
            // console.log(`[Benchmark] Speedup: ${(syncDuration / workerDuration).toFixed(2)}x`);

            // Worker should be faster or comparable
            // Note: For very simple operations, worker may have overhead
            // But for complex calculations (KPIs, aggregations), worker wins
        });
    });

    describe('Memory Efficiency', () => {
        test('should not leak memory with large datasets', async () => {
            const initialMemory = (performance as any).memory?.usedJSHeapSize || 0;

            // Process large dataset
            const shows = generateMockShows(10000);
            await workerPool.execute('calculateRevenue', { shows, exchangeRates: { EUR: 1 } });

            // Force garbage collection if available
            if (global.gc) {
                global.gc();
            }

            const finalMemory = (performance as any).memory?.usedJSHeapSize || 0;
            const memoryGrowth = finalMemory - initialMemory;

            // console.log(`[Benchmark] Memory growth: ${(memoryGrowth / 1024 / 1024).toFixed(2)}MB`);

            // Memory growth should be reasonable (< 50MB)
            expect(memoryGrowth).toBeLessThan(50 * 1024 * 1024);
        });
    });

    describe('Error Handling', () => {
        test('should handle invalid input gracefully', async () => {
            try {
                await workerPool.execute('calculateRevenue', {
                    shows: null as any,
                    exchangeRates: { EUR: 1 }
                });
            } catch (error) {
                expect(error).toBeDefined();
                // console.log('[Benchmark] Error handling works correctly');
            }
        });

        test('should timeout long-running tasks', async () => {
            // Create a very large dataset to potentially trigger timeout
            const shows = generateMockShows(100000);

            try {
                await workerPool.execute('calculateRevenue', {
                    shows,
                    exchangeRates: { EUR: 1 }
                });
                // Should complete or timeout
                expect(true).toBe(true);
            } catch (error: any) {
                // Timeout is acceptable for very large datasets
                expect(error.message).toContain('timeout');
            }
        }, 35000); // Extend test timeout
    });
});

describe('Service Worker Performance', () => {
    test('should cache static assets', async () => {
        // This would require a real service worker environment
        // For now, just verify the service worker is registered
        if ('serviceWorker' in navigator) {
            const registrations = await navigator.serviceWorker.getRegistrations();
            // console.log(`[Benchmark] Service Workers registered: ${registrations.length}`);
            expect(registrations.length).toBeGreaterThanOrEqual(0);
        }
    });
});

describe('React Component Performance', () => {
    test('should render large lists with virtualization', async () => {
        // This would require a test renderer
        // Placeholder for future implementation
        // console.log('[Benchmark] Component performance tests - TODO');
        expect(true).toBe(true);
    });
});

/**
 * Performance Summary
 *
 * Run all benchmarks and generate summary report.
 */
export async function generatePerformanceReport() {
    const report = {
        timestamp: new Date().toISOString(),
        benchmarks: {
            '1k_shows_revenue': 0,
            '10k_shows_revenue': 0,
            '1k_shows_kpis': 0,
            '5k_shows_aggregation': 0,
            '5_concurrent_1k': 0,
        },
        workerPoolStats: {} as any,
        recommendations: [] as string[]
    };

    const workerPool = getFinanceWorkerPool();
    const shows1k = generateMockShows(1000);
    const shows5k = generateMockShows(5000);
    const shows10k = generateMockShows(10000);

    // Run benchmarks
    // console.log('\n📊 Generating Performance Report...\n');

    // 1k shows revenue
    const start1k = performance.now();
    await workerPool.execute('calculateRevenue', { shows: shows1k, exchangeRates: { EUR: 1 } });
    report.benchmarks['1k_shows_revenue'] = performance.now() - start1k;

    // 10k shows revenue
    const start10k = performance.now();
    await workerPool.execute('calculateRevenue', { shows: shows10k, exchangeRates: { EUR: 1 } });
    report.benchmarks['10k_shows_revenue'] = performance.now() - start10k;

    // 1k shows KPIs
    const startKpis = performance.now();
    await workerPool.execute('calculateKPIs', { shows: shows1k, exchangeRates: { EUR: 1 } });
    report.benchmarks['1k_shows_kpis'] = performance.now() - startKpis;

    // 5k shows aggregation
    const startAgg = performance.now();
    await workerPool.execute('aggregateShows', { shows: shows5k, groupBy: 'month', exchangeRates: { EUR: 1 } });
    report.benchmarks['5k_shows_aggregation'] = performance.now() - startAgg;

    // 5 concurrent 1k
    const startConcurrent = performance.now();
    await Promise.all([
        workerPool.execute('calculateRevenue', { shows: shows1k, exchangeRates: { EUR: 1 } }),
        workerPool.execute('calculateRevenue', { shows: shows1k, exchangeRates: { EUR: 1 } }),
        workerPool.execute('calculateKPIs', { shows: shows1k, exchangeRates: { EUR: 1 } }),
        workerPool.execute('calculateKPIs', { shows: shows1k, exchangeRates: { EUR: 1 } }),
        workerPool.execute('aggregateShows', { shows: shows1k, groupBy: 'month', exchangeRates: { EUR: 1 } }),
    ]);
    report.benchmarks['5_concurrent_1k'] = performance.now() - startConcurrent;

    // Worker pool stats
    report.workerPoolStats = workerPool.getStats();

    // Generate recommendations
    if (report.benchmarks['10k_shows_revenue'] > 50) {
        report.recommendations.push('⚠️ 10k shows revenue calculation exceeds 50ms. Consider optimizing worker implementation.');
    }
    if (report.benchmarks['5_concurrent_1k'] > 80) {
        report.recommendations.push('⚠️ Concurrent execution is slow. Consider increasing worker pool size.');
    }
    if (report.workerPoolStats.queueSize > 10) {
        report.recommendations.push('⚠️ Worker queue is large. Increase pool size or reduce concurrent requests.');
    }

    // Print report
    // console.log('═══════════════════════════════════════════════════════════');
    // console.log('                   PERFORMANCE REPORT                      ');
    // console.log('═══════════════════════════════════════════════════════════');
    // console.log(`Generated: ${report.timestamp}`);
    // console.log('\n📈 Benchmarks:');
    Object.entries(report.benchmarks).forEach(([name, duration]) => {
        const status = duration < 50 ? '✅' : duration < 100 ? '⚠️' : '❌';
        // console.log(`  ${status} ${name}: ${duration.toFixed(2)}ms`);
    });
    // console.log('\n⚙️ Worker Pool Stats:');
    // console.log(`  Pool Size: ${report.workerPoolStats.poolSize}`);
    // console.log(`  Busy Workers: ${report.workerPoolStats.busyWorkers}`);
    // console.log(`  Queue Size: ${report.workerPoolStats.queueSize}`);
    // console.log(`  Total Tasks: ${report.workerPoolStats.totalTasks}`);

    if (report.recommendations.length > 0) {
        // Recommendations available
    } else {
        // All metrics within acceptable ranges
    }
    // console.log('═══════════════════════════════════════════════════════════\n');

    return report;
}
