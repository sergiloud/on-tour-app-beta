/**
 * Enhanced FinanceQuicklook with Worker Integration
 *
 * Integrates useOptimizedFinanceCalculations for async calculations.
 * Shows performance metrics in development mode.
 */

import React, { useEffect, useState } from 'react';
import { Card } from '../../ui/Card';
import { useFinance } from '../../context/FinanceContext';
import { useSettings } from '../../context/SettingsContext';
import { useOptimizedFinanceCalculations } from '../../hooks/useOptimizedFinanceCalculations';
import { monitorFinanceCalc } from '../../lib/performanceBudgets';
import ThisMonth from './ThisMonth';
import StatusBreakdown from './StatusBreakdown';
import NetTimeline from './NetTimeline';
import Pipeline from './Pipeline';
import { Link, prefetchByPath } from '../../routes/routing';
import { t } from '../../lib/i18n';
import { sub } from 'date-fns';

const FinanceQuicklookEnhanced: React.FC = () => {
    const { snapshot, thisMonth, targets, updateTargets } = useFinance();
    const { currency, exchangeRates } = useSettings();
    const { calculateKPIs, calculateRevenue, metrics } = useOptimizedFinanceCalculations(exchangeRates);

    // State for async calculations
    const [kpis, setKpis] = useState<{ profitMargin: number; grossMargin: number } | null>(null);
    const [dso, setDso] = useState<number>(0);
    const [netForecastVsTarget, setNetForecastVsTarget] = useState({ forecast: 0, target: 0, delta: 0 });
    const [marginPrev, setMarginPrev] = useState<number>(0);
    const [isCalculating, setIsCalculating] = useState(false);

    // Prefetch finance route
    useEffect(() => {
        prefetchByPath('/finance');
    }, []);

    // Calculate KPIs using worker
    useEffect(() => {
        if (!snapshot.shows || snapshot.shows.length === 0) {
            setKpis({ profitMargin: 0, grossMargin: 0 });
            return;
        }

        setIsCalculating(true);

        calculateKPIs(snapshot.shows)
            .then(result => {
                setKpis({
                    profitMargin: result.profitMargin,
                    grossMargin: result.profitMargin // Same calculation in this context
                });
                setIsCalculating(false);

                // Monitor performance
                if (metrics?.workerTime) {
                    monitorFinanceCalc(metrics.workerTime);
                }
            })
            .catch(error => {
                console.error('[FinanceQuicklook] KPI calculation failed:', error);
                // Fallback to sync calculation
                const inc = snapshot.year.income || 0;
                const exp = snapshot.year.expenses || 0;
                const margin = inc === 0 ? 0 : ((inc - exp) / inc) * 100;
                setKpis({ profitMargin: margin, grossMargin: margin });
                setIsCalculating(false);
            });
    }, [snapshot.shows, snapshot.year.income, snapshot.year.expenses, calculateKPIs, metrics]);

    // Calculate DSO (sync - simple calculation)
    useEffect(() => {
        const dailyRev = (snapshot.month.income || 0) / 30;
        const calculatedDso = dailyRev === 0 ? 0 : (snapshot.pending || 0) / dailyRev;
        setDso(calculatedDso);
    }, [snapshot.month.income, snapshot.pending]);

    // Calculate Net Forecast vs Target (sync - simple calculation)
    useEffect(() => {
        const daysElapsed = Math.max(1, Math.floor((Date.now() - new Date(snapshot.month.start).getTime()) / (24 * 60 * 60 * 1000)));
        const daysInMonth = 30;
        const monthNet = snapshot.month.net || 0;
        const forecast = (monthNet / daysElapsed) * daysInMonth;
        const target = targets.netMonth || 0;
        const delta = forecast - target;

        setNetForecastVsTarget({ forecast, target, delta });
    }, [snapshot.month.net, snapshot.month.start, targets.netMonth]);

    // Calculate Previous Month Margin (sync - simple calculation)
    useEffect(() => {
        if (!thisMonth?.prev) {
            setMarginPrev(0);
            return;
        }

        const prevInc = thisMonth.prev.income || 0;
        const prevExp = thisMonth.prev.expenses || 0;
        const margin = prevInc === 0 ? 0 : ((prevInc - prevExp) / prevInc) * 100;
        setMarginPrev(margin);
    }, [thisMonth?.prev]);

    // Format number helper
    const fmt = (n: number) => new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency,
        minimumFractionDigits: 0
    }).format(n);

    // Render performance metrics (dev only)
    const showMetrics = import.meta.env.DEV && metrics;

    return (
        <Card className="gap-4">
            {/* Header with KPIs */}
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold">{t('finance.quicklook.title')}</h2>
                <div className="flex items-center gap-3">
                    {/* DSO Badge */}
                    <div className="px-3 py-1.5 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                        <div className="text-[10px] text-blue-400 uppercase">DSO</div>
                        <div className="text-sm font-semibold text-blue-300">
                            {isCalculating ? '...' : Math.round(dso)}d
                        </div>
                    </div>

                    {/* Gross Margin Badge */}
                    <div className="px-3 py-1.5 bg-green-500/10 border border-green-500/20 rounded-lg">
                        <div className="text-[10px] text-green-400 uppercase">GM</div>
                        <div className="text-sm font-semibold text-green-300">
                            {isCalculating ? '...' : kpis ? `${kpis.grossMargin.toFixed(1)}%` : '0%'}
                        </div>
                    </div>

                    {/* Month-to-Date Margin Badge */}
                    <div className="px-3 py-1.5 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                        <div className="text-[10px] text-purple-400 uppercase">MTD</div>
                        <div className="text-sm font-semibold text-purple-300">
                            {isCalculating ? '...' : kpis ? `${kpis.profitMargin.toFixed(1)}%` : '0%'}
                        </div>
                    </div>

                    {/* Forecast vs Target Badge */}
                    <div className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg">
                        <div className="text-[10px] text-amber-400 uppercase">FvT</div>
                        <div className={`text-sm font-semibold ${netForecastVsTarget.delta >= 0 ? 'text-amber-300' : 'text-red-300'}`}>
                            {isCalculating ? '...' : fmt(netForecastVsTarget.delta)}
                        </div>
                    </div>

                    {/* Previous Month Change Badge */}
                    {marginPrev !== 0 && (
                        <div className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg">
                            <div className="text-[10px] text-slate-400 dark:text-white/60 uppercase">Δ Prev</div>
                            <div className={`text-sm font-semibold ${marginPrev > 0 ? 'text-green-300' : 'text-red-300'}`}>
                                {marginPrev > 0 ? '+' : ''}{marginPrev.toFixed(1)}%
                            </div>
                        </div>
                    )}

                    {/* Targets Dropdown (placeholder) */}
                    <button
                        className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm transition-colors"
                        title="Edit Targets"
                    >
                        🎯 Targets
                    </button>

                    {/* Open Full Link */}
                    <Link
                        to="/finance"
                        className="px-3 py-1.5 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 rounded-lg text-sm transition-colors"
                    >
                        Open Full →
                    </Link>
                </div>
            </div>

            {/* Performance Metrics (Dev Only) */}
            {showMetrics && (
                <div className="px-3 py-2 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs">
                    <div className="flex items-center gap-4">
                        <span className="text-blue-400 font-semibold">Performance:</span>
                        <span className="text-slate-600 dark:text-white/80">
                            Method: <span className="font-mono text-blue-300">{metrics.method}</span>
                        </span>
                        {metrics.workerTime !== undefined && (
                            <span className="text-slate-600 dark:text-white/80">
                                Worker: <span className="font-mono text-green-300">{metrics.workerTime.toFixed(2)}ms</span>
                            </span>
                        )}
                        {metrics.syncTime !== undefined && (
                            <span className="text-slate-600 dark:text-white/80">
                                Sync: <span className="font-mono text-yellow-300">{metrics.syncTime.toFixed(2)}ms</span>
                            </span>
                        )}
                        {metrics.speedup !== undefined && (
                            <span className="text-slate-600 dark:text-white/80">
                                Speedup: <span className="font-mono text-green-300">{metrics.speedup.toFixed(1)}x</span>
                            </span>
                        )}
                    </div>
                </div>
            )}

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <ThisMonth />
                <StatusBreakdown />
            </div>

            <NetTimeline />
            <Pipeline />
        </Card>
    );
};

export default React.memo(FinanceQuicklookEnhanced);
