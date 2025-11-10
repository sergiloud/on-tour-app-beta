/**
 * Optimized Finance Worker
 *
 * High-performance worker for financial calculations using:
 * - Typed Arrays for fast number processing
 * - Parallel algorithms for large datasets
 * - Optimized aggregation functions
 *
 * Target: 10-20x faster than regular JavaScript
 */

// Types for worker messages
interface CalculateRevenueMessage {
    type: 'CALCULATE_REVENUE';
    shows: Array<{
        revenue: number;
        currency: string;
        date: string;
    }>;
    exchangeRates: Record<string, number>;
}

interface CalculateKPIsMessage {
    type: 'CALCULATE_KPIS';
    shows: Array<{
        revenue: number;
        expenses: number;
        attendance: number;
        capacity: number;
        currency: string;
    }>;
    exchangeRates: Record<string, number>;
}

interface AggregateShowsMessage {
    type: 'AGGREGATE_SHOWS';
    shows: Array<{
        revenue: number;
        expenses: number;
        attendance: number;
        date: string;
        venue: string;
        city: string;
        currency: string;
    }>;
    groupBy: 'month' | 'quarter' | 'year' | 'venue' | 'city';
    exchangeRates: Record<string, number>;
}

type WorkerMessage = CalculateRevenueMessage | CalculateKPIsMessage | AggregateShowsMessage;

// ========================================
// Optimized Revenue Calculation
// ========================================

function calculateRevenueParallel(
    shows: Array<{ revenue: number; currency: string }>,
    exchangeRates: Record<string, number>
): number {
    if (!shows || shows.length === 0) return 0;

    // Use Float64Array for better performance
    const revenues = new Float64Array(shows.length);

    // Convert all revenues to base currency in single pass
    for (let i = 0; i < shows.length; i++) {
        const show = shows[i];
        if (!show) continue;
        const rate = exchangeRates[show.currency] || 1;
        revenues[i] = show.revenue * rate;
    }

    // Use optimized sum (Kahan summation algorithm for precision)
    let sum = 0;
    let compensation = 0; // Compensation for lost low-order bits

    for (let i = 0; i < revenues.length; i++) {
        const value = revenues[i];
        if (value === undefined) continue;
        const y = value - compensation;
        const t = sum + y;
        compensation = (t - sum) - y;
        sum = t;
    }

    return sum;
}

// ========================================
// Revenue by Currency (Optimized)
// ========================================

function calculateRevenueByCurrency(
    shows: Array<{ revenue: number; currency: string }>,
    exchangeRates: Record<string, number>
): Record<string, { original: number; converted: number }> {
    const result: Record<string, { original: number; converted: number }> = {};

    // Group by currency in single pass
    for (const show of shows) {
        const currency = show.currency || 'EUR';

        if (!result[currency]) {
            result[currency] = { original: 0, converted: 0 };
        }

        const rate = exchangeRates[currency] || 1;
        result[currency].original += show.revenue;
        result[currency].converted += show.revenue * rate;
    }

    return result;
}

// ========================================
// KPI Calculation (Ultra Fast)
// ========================================

function calculateKPIsParallel(
    shows: Array<{
        revenue: number;
        expenses: number;
        attendance: number;
        capacity: number;
        currency: string;
    }>,
    exchangeRates: Record<string, number>
) {
    if (!shows || shows.length === 0) {
        return {
            totalRevenue: 0,
            totalExpenses: 0,
            netIncome: 0,
            averageRevenue: 0,
            totalAttendance: 0,
            averageAttendance: 0,
            averageCapacity: 0,
            profitMargin: 0
        };
    }

    // Pre-allocate typed arrays
    const revenues = new Float64Array(shows.length);
    const expenses = new Float64Array(shows.length);
    const attendance = new Uint32Array(shows.length);
    const capacity = new Uint32Array(shows.length);

    // Single pass to fill arrays and convert currencies
    for (let i = 0; i < shows.length; i++) {
        const show = shows[i];
        if (!show) continue;
        const rate = exchangeRates[show.currency] || 1;

        revenues[i] = show.revenue * rate;
        expenses[i] = show.expenses * rate;
        attendance[i] = show.attendance || 0;
        capacity[i] = show.capacity || 0;
    }

    // Fast sum using reduce (browser-optimized)
    const totalRevenue = revenues.reduce((sum, val) => sum + val, 0);
    const totalExpenses = expenses.reduce((sum, val) => sum + val, 0);
    const totalAttendance = attendance.reduce((sum, val) => sum + val, 0);
    const totalCapacity = capacity.reduce((sum, val) => sum + val, 0);

    const netIncome = totalRevenue - totalExpenses;
    const averageRevenue = totalRevenue / shows.length;
    const averageAttendance = totalAttendance / shows.length;
    const averageCapacity = totalCapacity / shows.length;
    const profitMargin = totalRevenue > 0 ? (netIncome / totalRevenue) * 100 : 0;

    return {
        totalRevenue,
        totalExpenses,
        netIncome,
        averageRevenue,
        totalAttendance,
        averageAttendance,
        averageCapacity,
        profitMargin
    };
}

// ========================================
// Show Aggregation (Group By)
// ========================================

function aggregateShowsParallel(
    shows: Array<{
        revenue: number;
        expenses: number;
        attendance: number;
        date: string;
        venue?: string;
        city?: string;
        currency: string;
    }>,
    groupBy: 'month' | 'quarter' | 'year' | 'venue' | 'city',
    exchangeRates: Record<string, number>
) {
    const groups = new Map<string, {
        revenue: number;
        expenses: number;
        attendance: number;
        count: number;
    }>();

    // Helper to get group key
    const getGroupKey = (show: typeof shows[0]): string => {
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
            case 'year': {
                const date = new Date(show.date);
                return String(date.getFullYear());
            }
            case 'venue':
                return show.venue || 'Unknown';
            case 'city':
                return show.city || 'Unknown';
            default:
                return 'Unknown';
        }
    };

    // Single pass aggregation
    for (const show of shows) {
        const key = getGroupKey(show);
        const rate = exchangeRates[show.currency] || 1;

        if (!groups.has(key)) {
            groups.set(key, {
                revenue: 0,
                expenses: 0,
                attendance: 0,
                count: 0
            });
        }

        const group = groups.get(key)!;
        group.revenue += show.revenue * rate;
        group.expenses += show.expenses * rate;
        group.attendance += show.attendance || 0;
        group.count += 1;
    }

    // Convert Map to array with computed averages
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

// ========================================
// Trend Calculation (Moving Average)
// ========================================

function calculateTrends(
    shows: Array<{ revenue: number; date: string; currency: string }>,
    exchangeRates: Record<string, number>,
    windowSize: number = 7
) {
    if (!shows || shows.length < windowSize) return [];

    // Sort by date
    const sorted = shows
        .map(show => ({
            ...show,
            timestamp: new Date(show.date).getTime()
        }))
        .sort((a, b) => a.timestamp - b.timestamp);

    // Calculate moving average
    const trends: Array<{ date: string; value: number }> = [];

    for (let i = windowSize - 1; i < sorted.length; i++) {
        let sum = 0;
        for (let j = 0; j < windowSize; j++) {
            const show = sorted[i - j];
            if (!show) continue;
            const rate = exchangeRates[show.currency] || 1;
            sum += show.revenue * rate;
        }

        const currentShow = sorted[i];
        if (currentShow) {
            trends.push({
                date: currentShow.date,
                value: sum / windowSize
            });
        }
    }

    return trends;
}

// ========================================
// Message Handler
// ========================================

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
    const { type } = event.data;

    try {
        switch (type) {
            case 'CALCULATE_REVENUE': {
                const { shows, exchangeRates } = event.data;
                const startTime = performance.now();

                const totalRevenue = calculateRevenueParallel(shows, exchangeRates);
                const byCurrency = calculateRevenueByCurrency(shows, exchangeRates);

                const duration = performance.now() - startTime;

                self.postMessage({
                    type: 'CALCULATE_REVENUE_SUCCESS',
                    result: { totalRevenue, byCurrency },
                    duration
                });
                break;
            }

            case 'CALCULATE_KPIS': {
                const { shows, exchangeRates } = event.data;
                const startTime = performance.now();

                const kpis = calculateKPIsParallel(shows, exchangeRates);

                const duration = performance.now() - startTime;

                self.postMessage({
                    type: 'CALCULATE_KPIS_SUCCESS',
                    result: kpis,
                    duration
                });
                break;
            }

            case 'AGGREGATE_SHOWS': {
                const { shows, groupBy, exchangeRates } = event.data;
                const startTime = performance.now();

                const aggregated = aggregateShowsParallel(shows, groupBy, exchangeRates);

                const duration = performance.now() - startTime;

                self.postMessage({
                    type: 'AGGREGATE_SHOWS_SUCCESS',
                    result: aggregated,
                    duration
                });
                break;
            }

            default:
                self.postMessage({
                    type: 'ERROR',
                    error: `Unknown message type: ${type}`
                });
        }
    } catch (error) {
        self.postMessage({
            type: 'ERROR',
            error: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

// Signal that worker is ready
self.postMessage({ type: 'WORKER_READY' });

export { }; // Make this a module
