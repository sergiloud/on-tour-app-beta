// Revenue Heatmap Layer Control Component

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    calculateRevenueByLocation,
    calculateRevenueStats,
    getTierColor,
    getTierLabel,
    type RegionRevenue
} from '../../features/map/revenueHeatmap';
import { Show } from '../../lib/shows';
import { trackEvent } from '../../lib/telemetry';

type HeatmapControlProps = {
    shows: Show[];
    costs?: Record<string, any[]>;
    isActive: boolean;
    onToggle: (active: boolean) => void;
    onDataChange?: (regions: RegionRevenue[]) => void;
};

export const HeatmapControl: React.FC<HeatmapControlProps> = ({
    shows,
    costs = {},
    isActive,
    onToggle,
    onDataChange,
}) => {
    const [showStats, setShowStats] = useState(false);
    const [regions, setRegions] = useState<RegionRevenue[]>([]);

    // Calculate revenue data whenever shows change
    useEffect(() => {
        const calculatedRegions = calculateRevenueByLocation(shows, costs);
        setRegions(calculatedRegions);
        if (onDataChange) {
            onDataChange(calculatedRegions);
        }
    }, [shows, costs]); // ✅ Removed onDataChange from deps to prevent infinite loop

    const stats = calculateRevenueStats(regions);

    const handleToggle = () => {
        const newState = !isActive;
        onToggle(newState);
        trackEvent('map.heatmap.toggle', { enabled: newState });
    };

    return (
        <div className="absolute top-4 right-4 z-10">
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden">
                {/* Toggle Button - Fixed: No nested buttons */}
                <div
                    className={`w-full px-4 py-3 flex items-center gap-3 transition-all ${isActive
                        ? 'bg-accent-500/20'
                        : ''
                        }`}
                >
                    <button
                        onClick={handleToggle}
                        className="flex items-center gap-3 flex-1 hover:opacity-80 transition-opacity"
                        title="Toggle revenue heatmap"
                    >
                        <div className="relative w-5 h-5 flex-shrink-0">
                            {isActive ? (
                                <svg className="w-5 h-5 text-accent-400" fill="currentColor" viewBox="0 0 24 24">
                                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                                </svg>
                            ) : (
                                <svg className="w-5 h-5 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                            )}
                        </div>
                        <div className="flex-1 text-left">
                            <div className="text-sm font-semibold text-slate-900 dark:text-white">
                                Revenue Heatmap
                            </div>
                            <div className="text-[10px] text-slate-300 dark:text-white/50">
                                {isActive ? 'Showing' : 'Hidden'} • {regions.length} locations
                            </div>
                        </div>
                    </button>
                    <button
                        onClick={() => setShowStats(!showStats)}
                        className="p-1 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded transition-colors flex-shrink-0"
                        title="Show statistics"
                    >
                        <svg className="w-4 h-4 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </button>
                </div>

                {/* Statistics Panel */}
                <AnimatePresence>
                    {showStats && isActive && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="border-t border-slate-200 dark:border-white/10 overflow-hidden"
                        >
                            <div className="px-4 py-3 space-y-3">
                                {/* Total Revenue */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 dark:text-white/60">Total Revenue</span>
                                    <span className="text-sm font-bold text-accent-400 tabular-nums">
                                        ${(stats.totalRevenue / 1000).toFixed(1)}K
                                    </span>
                                </div>

                                {/* Total Shows */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 dark:text-white/60">Shows</span>
                                    <span className="text-sm font-semibold text-white tabular-nums">
                                        {stats.totalShows}
                                    </span>
                                </div>

                                {/* Avg per Show */}
                                <div className="flex items-center justify-between">
                                    <span className="text-xs text-slate-400 dark:text-white/60">Avg per Show</span>
                                    <span className="text-sm font-semibold text-white tabular-nums">
                                        ${(stats.avgPerShow / 1000).toFixed(1)}K
                                    </span>
                                </div>

                                {/* Top City */}
                                {stats.topCity && (
                                    <div className="pt-2 border-t border-white/10">
                                        <div className="text-[10px] text-slate-300 dark:text-white/50 mb-1">Top City</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-900 dark:text-white">
                                                {stats.topCity.city}, {stats.topCity.country}
                                            </span>
                                            <span className="text-xs font-bold text-green-400 tabular-nums">
                                                ${(stats.topCity.totalNet / 1000).toFixed(1)}K
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-300 dark:text-white/50 mt-0.5">
                                            {stats.topCity.showCount} show{stats.topCity.showCount !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                )}

                                {/* Top Country */}
                                {stats.topCountry && (
                                    <div className="pt-2 border-t border-white/10">
                                        <div className="text-[10px] text-slate-300 dark:text-white/50 mb-1">Top Country</div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs font-medium text-slate-900 dark:text-white">
                                                {stats.topCountry.country}
                                            </span>
                                            <span className="text-xs font-bold text-green-400 tabular-nums">
                                                ${(stats.topCountry.totalNet / 1000).toFixed(1)}K
                                            </span>
                                        </div>
                                        <div className="text-[10px] text-slate-300 dark:text-white/50 mt-0.5">
                                            {stats.topCountry.showCount} show{stats.topCountry.showCount !== 1 ? 's' : ''}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Legend */}
                            <div className="px-4 py-2 bg-slate-100 dark:bg-white/5 border-t border-white/10">
                                <div className="text-[10px] text-slate-300 dark:text-white/50 mb-2">Revenue Tiers</div>
                                <div className="flex items-center gap-3">
                                    {['high', 'medium', 'low'].map(tier => (
                                        <div key={tier} className="flex items-center gap-1.5">
                                            <div
                                                className="w-2 h-2 rounded-full"
                                                style={{ backgroundColor: getTierColor(tier as any) }}
                                            />
                                            <span className="text-[10px] text-slate-500 dark:text-white/70 capitalize">
                                                {tier}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};
