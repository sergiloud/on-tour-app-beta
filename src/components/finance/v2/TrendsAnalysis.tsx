import React, { useMemo } from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { TrendingUp, TrendingDown, Calendar, DollarSign, BarChart2 } from 'lucide-react';

interface MonthlyData {
    month: string;
    monthLabel: string;
    revenue: number;
    expenses: number;
    net: number;
    margin: number;
    shows: number;
}

const TrendsAnalysis: React.FC = () => {
    const { snapshot } = useFinance();
    const { fmtMoney } = useSettings();

    // Calculate monthly breakdown from snapshot
    const monthlyData = useMemo<MonthlyData[]>(() => {
        if (!snapshot) return [];

        const monthsMap = new Map<string, MonthlyData>();
        const now = new Date();
        const currentYear = now.getFullYear();

        // Initialize last 12 months
        for (let i = 11; i >= 0; i--) {
            const d = new Date(currentYear, now.getMonth() - i, 1);
            const monthKey = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
            const monthLabel = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });

            monthsMap.set(monthKey, {
                month: monthKey,
                monthLabel,
                revenue: 0,
                expenses: 0,
                net: 0,
                margin: 0,
                shows: 0,
            });
        }

        // Aggregate shows by month
        snapshot.shows.forEach(show => {
            if (show.status === 'offer') return;

            const showDate = new Date(show.date);
            const monthKey = `${showDate.getFullYear()}-${String(showDate.getMonth() + 1).padStart(2, '0')}`;

            if (monthsMap.has(monthKey)) {
                const monthData = monthsMap.get(monthKey)!;
                const fee = show.fee || 0;
                const cost = typeof (show as any).cost === 'number' ? (show as any).cost : 0;

                monthData.revenue += fee;
                monthData.expenses += cost;
                monthData.net += (fee - cost);
                monthData.shows += 1;
            }
        });

        // Calculate margins
        monthsMap.forEach(month => {
            month.margin = month.revenue > 0 ? (month.net / month.revenue) * 100 : 0;
        });

        return Array.from(monthsMap.values());
    }, [snapshot]);

    // Calculate YoY growth
    const yoyMetrics = useMemo(() => {
        if (monthlyData.length < 2) return null;

        const lastMonth = monthlyData[monthlyData.length - 1];
        const sameMonthLastYear = monthlyData[monthlyData.length - 13] || monthlyData[0];

        if (!lastMonth || !sameMonthLastYear) return null;

        const revenueGrowth = sameMonthLastYear.revenue > 0
            ? ((lastMonth.revenue - sameMonthLastYear.revenue) / sameMonthLastYear.revenue) * 100
            : 0;

        const expenseGrowth = sameMonthLastYear.expenses > 0
            ? ((lastMonth.expenses - sameMonthLastYear.expenses) / sameMonthLastYear.expenses) * 100
            : 0;

        const netGrowth = sameMonthLastYear.net > 0
            ? ((lastMonth.net - sameMonthLastYear.net) / sameMonthLastYear.net) * 100
            : 0;

        return {
            revenueGrowth: revenueGrowth.toFixed(1),
            expenseGrowth: expenseGrowth.toFixed(1),
            netGrowth: netGrowth.toFixed(1),
        };
    }, [monthlyData]);

    // Calculate moving averages (3-month)
    const movingAverage = useMemo(() => {
        if (monthlyData.length < 3) return [];

        return monthlyData.slice(2).map((_, idx) => {
            const slice = monthlyData.slice(idx, idx + 3);
            const avgRevenue = slice.reduce((sum, m) => sum + m.revenue, 0) / 3;
            const avgNet = slice.reduce((sum, m) => sum + m.net, 0) / 3;
            const monthData = monthlyData[idx + 2];

            return {
                month: monthData?.monthLabel || '',
                avgRevenue,
                avgNet,
            };
        });
    }, [monthlyData]);

    // Find peak and trough
    const peakTrough = useMemo(() => {
        if (monthlyData.length === 0) return null;

        const sortedByRevenue = [...monthlyData].sort((a, b) => b.revenue - a.revenue);
        const peak = sortedByRevenue[0];
        const trough = sortedByRevenue[sortedByRevenue.length - 1];

        return { peak, trough };
    }, [monthlyData]);

    // Calculate max values for chart scaling
    const maxValues = useMemo(() => {
        const maxRevenue = Math.max(...monthlyData.map(m => m.revenue), 1);
        const maxExpenses = Math.max(...monthlyData.map(m => m.expenses), 1);
        const maxNet = Math.max(...monthlyData.map(m => m.net), 1);

        return { maxRevenue, maxExpenses, maxNet };
    }, [monthlyData]);

    return (
        <div className="space-y-6">
            {/* YoY Growth Cards */}
            {yoyMetrics && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wide">Revenue Growth YoY</div>
                            {parseFloat(yoyMetrics.revenueGrowth) >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                        </div>
                        <div className={`text-3xl font-light tabular-nums ${parseFloat(yoyMetrics.revenueGrowth) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {parseFloat(yoyMetrics.revenueGrowth) >= 0 ? '+' : ''}{yoyMetrics.revenueGrowth}%
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wide">Expense Growth YoY</div>
                            {parseFloat(yoyMetrics.expenseGrowth) <= 0 ? (
                                <TrendingDown className="w-4 h-4 text-green-400" />
                            ) : (
                                <TrendingUp className="w-4 h-4 text-orange-400" />
                            )}
                        </div>
                        <div className={`text-3xl font-light tabular-nums ${parseFloat(yoyMetrics.expenseGrowth) <= 0 ? 'text-green-400' : 'text-orange-400'
                            }`}>
                            {parseFloat(yoyMetrics.expenseGrowth) >= 0 ? '+' : ''}{yoyMetrics.expenseGrowth}%
                        </div>
                    </div>

                    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wide">Net Profit Growth YoY</div>
                            {parseFloat(yoyMetrics.netGrowth) >= 0 ? (
                                <TrendingUp className="w-4 h-4 text-green-400" />
                            ) : (
                                <TrendingDown className="w-4 h-4 text-red-400" />
                            )}
                        </div>
                        <div className={`text-3xl font-light tabular-nums ${parseFloat(yoyMetrics.netGrowth) >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                            {parseFloat(yoyMetrics.netGrowth) >= 0 ? '+' : ''}{yoyMetrics.netGrowth}%
                        </div>
                    </div>
                </div>
            )}

            {/* Peak & Trough */}
            {peakTrough && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="glass rounded-xl border border-emerald-500/30 p-5 bg-gradient-to-br from-emerald-900/10 to-transparent">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                            <div className="text-sm font-medium text-emerald-300">Peak Month</div>
                        </div>
                        {peakTrough?.peak ? (
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-xs text-slate-400 dark:text-white/40 mb-1">{peakTrough.peak.monthLabel}</div>
                                    <div className="text-2xl font-light text-slate-900 dark:text-white tabular-nums">
                                        {fmtMoney(peakTrough.peak.revenue)}
                                    </div>
                                    <div className="text-xs text-emerald-400 mt-1">
                                        {peakTrough.peak.shows} shows • {peakTrough.peak.margin.toFixed(1)}% margin
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-300 dark:text-white/40">No data available</div>
                        )}
                    </div>

                    <div className="glass rounded-xl border border-orange-500/30 p-5 bg-gradient-to-br from-orange-900/10 to-transparent">
                        <div className="flex items-center gap-2 mb-3">
                            <TrendingDown className="w-5 h-5 text-orange-400" />
                            <div className="text-sm font-medium text-orange-300">Lowest Month</div>
                        </div>
                        {peakTrough?.trough ? (
                            <div className="flex items-end justify-between">
                                <div>
                                    <div className="text-xs text-slate-400 dark:text-white/40 mb-1">{peakTrough.trough.monthLabel}</div>
                                    <div className="text-2xl font-light text-slate-900 dark:text-white tabular-nums">
                                        {fmtMoney(peakTrough.trough.revenue)}
                                    </div>
                                    <div className="text-xs text-orange-400 mt-1">
                                        {peakTrough.trough.shows} shows • {peakTrough.trough.margin.toFixed(1)}% margin
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="text-sm text-slate-300 dark:text-white/40">No data available</div>
                        )}
                    </div>
                </div>
            )}

            {/* Monthly Trend Chart */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-dark-900/50">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-1">12-Month Performance Trend</h3>
                            <p className="text-xs text-slate-300 dark:text-white/50">Revenue, expenses, and net profit over time</p>
                        </div>
                        <BarChart2 className="w-5 h-5 text-slate-200 dark:text-white/30" />
                    </div>
                </div>

                <div className="p-6">
                    <div className="space-y-3">
                        {monthlyData.slice(-12).map((month, idx) => {
                            const revenueWidth = (month.revenue / maxValues.maxRevenue) * 100;
                            const expensesWidth = (month.expenses / maxValues.maxExpenses) * 100;
                            const netWidth = Math.abs(month.net) / maxValues.maxNet * 100;
                            const isNegative = month.net < 0;

                            return (
                                <div key={month.month} className="space-y-2">
                                    <div className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400 dark:text-white/60 font-medium w-16">{month.monthLabel}</span>
                                        <div className="flex items-center gap-4 text-[10px]">
                                            <span className="text-blue-400">{fmtMoney(month.revenue)}</span>
                                            <span className="text-orange-400">{fmtMoney(month.expenses)}</span>
                                            <span className={isNegative ? 'text-red-400' : 'text-green-400'}>
                                                {fmtMoney(month.net)}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        {/* Revenue bar */}
                                        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-blue-500 to-blue-400 rounded-full transition-all duration-500"
                                                style={{ width: `${revenueWidth}%` }}
                                            />
                                        </div>
                                        {/* Net bar */}
                                        <div className="h-2 bg-dark-800 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${isNegative
                                                        ? 'bg-gradient-to-r from-red-500 to-red-400'
                                                        : 'bg-gradient-to-r from-green-500 to-green-400'
                                                    }`}
                                                style={{ width: `${netWidth}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Legend */}
                    <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-blue-400" />
                            <span className="text-xs text-slate-300 dark:text-white/50">Revenue</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-green-500 to-green-400" />
                            <span className="text-xs text-slate-300 dark:text-white/50">Net Profit</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full bg-gradient-to-r from-orange-500 to-orange-400" />
                            <span className="text-xs text-slate-300 dark:text-white/50">Expenses</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Moving Average Card */}
            {movingAverage.length > 0 && (
                <div className="glass rounded-xl border border-slate-200 dark:border-white/10 p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Calendar className="w-4 h-4 text-slate-300 dark:text-white/40" />
                        <h3 className="text-sm font-semibold text-slate-900 dark:text-white">3-Month Moving Average</h3>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {movingAverage.slice(-4).map(ma => (
                            <div key={ma.month} className="bg-slate-100 dark:bg-white/5 rounded-lg px-3 py-2.5 border border-white/10">
                                <div className="text-[10px] text-slate-400 dark:text-white/40 mb-1 uppercase tracking-wide">{ma.month}</div>
                                <div className="text-sm font-light text-white tabular-nums">{fmtMoney(ma.avgRevenue)}</div>
                                <div className="text-[10px] text-green-400 mt-0.5">Net: {fmtMoney(ma.avgNet)}</div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrendsAnalysis;
