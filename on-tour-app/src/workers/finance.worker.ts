/**
 * Finance Calculations Web Worker
 *
 * Performs heavy financial calculations off the main thread
 * to keep the UI responsive and smooth at 60 FPS.
 *
 * Calculations performed:
 * - Financial snapshots (revenue, expenses, profit)
 * - Period comparisons (YoY, MoM)
 * - Aggregations across multiple shows
 * - Tax calculations (WHT, VAT)
 * - Currency conversions
 */

interface Show {
    id: string;
    date: string;
    fee: number;
    currency?: string;
    whtPct?: number;
    costs?: Array<{ amount: number; currency?: string }>;
    status: string;
}

interface ExchangeRates {
    [currency: string]: number;
}

interface FinanceSnapshot {
    period: string;
    revenue: number;
    expenses: number;
    profit: number;
    margin: number;
    showCount: number;
    avgFee: number;
    taxWithheld: number;
}

interface CalculationRequest {
    type: 'snapshot' | 'comparison' | 'aggregation' | 'tax';
    shows: Show[];
    rates?: ExchangeRates;
    period?: { start: string; end: string };
    baseCurrency?: string;
}

interface CalculationResponse {
    type: string;
    result: any;
    executionTime: number;
}

/**
 * Convert amount to base currency
 */
function convertToBaseCurrency(
    amount: number,
    fromCurrency: string,
    baseCurrency: string,
    rates: ExchangeRates
): number {
    if (fromCurrency === baseCurrency) return amount;

    const rate = rates[fromCurrency];
    if (!rate || rate === 0) return amount; // Fallback if rate not available or zero

    return amount / rate;
}

/**
 * Calculate financial snapshot for a period
 */
function calculateSnapshot(
    shows: Show[],
    rates: ExchangeRates = {},
    baseCurrency: string = 'EUR'
): FinanceSnapshot {
    let revenue = 0;
    let expenses = 0;
    let taxWithheld = 0;
    let showCount = 0;

    for (const show of shows) {
        if (show.status === 'canceled' || show.status === 'archived') continue;

        // Convert fee to base currency
        const fee = convertToBaseCurrency(
            show.fee,
            show.currency || baseCurrency,
            baseCurrency,
            rates
        );

        revenue += fee;
        showCount++;

        // Calculate WHT (Withholding Tax)
        if (show.whtPct) {
            taxWithheld += fee * (show.whtPct / 100);
        }

        // Sum up costs
        if (show.costs && Array.isArray(show.costs)) {
            for (const cost of show.costs) {
                const costAmount = convertToBaseCurrency(
                    cost.amount,
                    cost.currency || baseCurrency,
                    baseCurrency,
                    rates
                );
                expenses += costAmount;
            }
        }
    }

    const profit = revenue - expenses - taxWithheld;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;
    const avgFee = showCount > 0 ? revenue / showCount : 0;

    return {
        period: 'current',
        revenue: Math.round(revenue * 100) / 100,
        expenses: Math.round(expenses * 100) / 100,
        profit: Math.round(profit * 100) / 100,
        margin: Math.round(margin * 10) / 10,
        showCount,
        avgFee: Math.round(avgFee * 100) / 100,
        taxWithheld: Math.round(taxWithheld * 100) / 100
    };
}

/**
 * Compare two periods (e.g., YoY, MoM)
 */
function calculateComparison(
    currentShows: Show[],
    previousShows: Show[],
    rates: ExchangeRates = {},
    baseCurrency: string = 'EUR'
) {
    const current = calculateSnapshot(currentShows, rates, baseCurrency);
    const previous = calculateSnapshot(previousShows, rates, baseCurrency);

    const revenueChange = previous.revenue > 0
        ? ((current.revenue - previous.revenue) / previous.revenue) * 100
        : 0;

    const profitChange = previous.profit > 0
        ? ((current.profit - previous.profit) / previous.profit) * 100
        : 0;

    return {
        current,
        previous,
        changes: {
            revenue: Math.round(revenueChange * 10) / 10,
            profit: Math.round(profitChange * 10) / 10,
            showCount: current.showCount - previous.showCount
        }
    };
}

/**
 * Calculate aggregations by various dimensions
 */
function calculateAggregations(
    shows: Show[],
    rates: ExchangeRates = {},
    baseCurrency: string = 'EUR'
) {
    // By status
    const byStatus: { [status: string]: FinanceSnapshot } = {};

    // Group shows by status
    const statusGroups: { [status: string]: Show[] } = {};
    for (const show of shows) {
        if (!statusGroups[show.status]) {
            statusGroups[show.status] = [];
        }
        const group = statusGroups[show.status];
        if (group) {
            group.push(show);
        }
    }

    // Calculate snapshot for each status
    for (const [status, statusShows] of Object.entries(statusGroups)) {
        byStatus[status] = calculateSnapshot(statusShows, rates, baseCurrency);
    }

    // By month
    const byMonth: { [month: string]: FinanceSnapshot } = {};
    const monthGroups: { [month: string]: Show[] } = {};

    for (const show of shows) {
        const month = show.date.slice(0, 7); // YYYY-MM
        if (!monthGroups[month]) {
            monthGroups[month] = [];
        }
        monthGroups[month].push(show);
    }

    for (const [month, monthShows] of Object.entries(monthGroups)) {
        byMonth[month] = calculateSnapshot(monthShows, rates, baseCurrency);
    }

    return {
        byStatus,
        byMonth,
        total: calculateSnapshot(shows, rates, baseCurrency)
    };
}

/**
 * Calculate tax breakdown
 */
function calculateTaxBreakdown(
    shows: Show[],
    rates: ExchangeRates = {},
    baseCurrency: string = 'EUR'
) {
    const breakdown: {
        [country: string]: {
            wht: number;
            vat: number;
            total: number;
            showCount: number;
        }
    } = {};

    // This is simplified - in real app would need country info
    for (const show of shows) {
        if (show.status === 'canceled') continue;

        const fee = convertToBaseCurrency(
            show.fee,
            show.currency || baseCurrency,
            baseCurrency,
            rates
        );

        const wht = show.whtPct ? fee * (show.whtPct / 100) : 0;

        // For simplicity, group all together
        // In real app, would group by show.country
        const key = 'all';
        if (!breakdown[key]) {
            breakdown[key] = { wht: 0, vat: 0, total: 0, showCount: 0 };
        }

        breakdown[key].wht += wht;
        breakdown[key].total += wht;
        breakdown[key].showCount++;
    }

    return breakdown;
}

/**
 * Main message handler
 */
self.onmessage = (event: MessageEvent<CalculationRequest>) => {
    const startTime = performance.now();
    const { type, shows, rates, period, baseCurrency } = event.data;

    let result: any;

    try {
        switch (type) {
            case 'snapshot':
                result = calculateSnapshot(shows, rates, baseCurrency);
                break;

            case 'comparison':
                // Split shows into current and previous based on period
                if (period) {
                    const periodDate = new Date(period.start);
                    const current = shows.filter(s => new Date(s.date) >= periodDate);
                    const previous = shows.filter(s => new Date(s.date) < periodDate);
                    result = calculateComparison(current, previous, rates, baseCurrency);
                } else {
                    result = { error: 'Period required for comparison' };
                }
                break;

            case 'aggregation':
                result = calculateAggregations(shows, rates, baseCurrency);
                break;

            case 'tax':
                result = calculateTaxBreakdown(shows, rates, baseCurrency);
                break;

            default:
                result = { error: `Unknown calculation type: ${type}` };
        }

        const executionTime = Math.round((performance.now() - startTime) * 100) / 100;

        const response: CalculationResponse = {
            type,
            result,
            executionTime
        };

        self.postMessage(response);

    } catch (error) {
        self.postMessage({
            type,
            result: { error: error instanceof Error ? error.message : 'Calculation failed' },
            executionTime: Math.round((performance.now() - startTime) * 100) / 100
        });
    }
};

// Export empty object for TypeScript
export { };
