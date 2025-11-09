import React, { useState, useMemo } from 'react';
import { BarChart3, PieChart, Clock, TrendingUp, Filter, Download } from 'lucide-react';
import MarginBreakdown from './MarginBreakdown';
import PLPivot from './PLPivot';
import PipelineAR from './PipelineAR';
import TrendsAnalysis from './TrendsAnalysis';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { announce } from '../../../lib/announcer';

type AnalysisSubTab = 'performance' | 'pivot' | 'aging' | 'trends';

interface AnalysisFilter {
    region?: string;
    agency?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
}

interface AnalysisHubProps {
    onDrillThrough?: (kind: 'Region' | 'Agency' | 'Country' | 'Promoter' | 'Route' | 'Aging', value: string) => void;
}

const AnalysisHub: React.FC<AnalysisHubProps> = ({ onDrillThrough }) => {
    const [activeSubTab, setActiveSubTab] = useState<AnalysisSubTab>('performance');
    const [filters, setFilters] = useState<AnalysisFilter>({});
    const [showFilters, setShowFilters] = useState(false);
    const { snapshot } = useFinance();
    const { fmtMoney } = useSettings();

    const subTabs = [
        { id: 'performance' as AnalysisSubTab, label: 'Performance', icon: BarChart3, description: 'Margin breakdown by region, country, and more' },
        { id: 'pivot' as AnalysisSubTab, label: 'Pivot Table', icon: PieChart, description: 'Multidimensional P&L analysis' },
        { id: 'aging' as AnalysisSubTab, label: 'AR Aging', icon: Clock, description: 'Accounts receivable aging analysis' },
        { id: 'trends' as AnalysisSubTab, label: 'Trends', icon: TrendingUp, description: 'Time-series performance trends' },
    ];

    // Calculate summary stats for header
    const summaryStats = useMemo(() => {
        if (!snapshot) return null;

        const totalIncome = snapshot.year.income || 0;
        const totalExpenses = snapshot.year.expenses || 0;
        const totalNet = snapshot.year.net || 0;
        const margin = totalIncome > 0 ? (totalNet / totalIncome) * 100 : 0;

        return {
            income: totalIncome,
            expenses: totalExpenses,
            net: totalNet,
            margin: margin.toFixed(1),
        };
    }, [snapshot]);

    const handleExport = (format: 'csv' | 'xlsx') => {
        announce(`Exporting ${activeSubTab} data as ${format.toUpperCase()}`);
        // TODO: Implement export logic per sub-tab
        // console.log(`Exporting ${activeSubTab} as ${format}`);
    };

    return (
        <div className="space-y-6">
            {/* Header with Summary Stats */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden backdrop-blur-sm">
                <div className="bg-gradient-to-r from-accent-500/10 via-blue-500/5 to-transparent px-6 py-5">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Financial Analysis</h2>
                            <p className="text-sm text-slate-300 dark:text-white/50">Deep dive into performance metrics and trends</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setShowFilters(!showFilters)}
                                className={`px-4 py-2 rounded-lg text-xs font-medium flex items-center gap-2 transition-all ${showFilters
                                    ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30'
                                    : 'bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/70 border border-slate-200 dark:border-white/10 hover:bg-white/15'
                                    }`}
                            >
                                <Filter className="w-3.5 h-3.5" />
                                Filters
                            </button>
                            <button
                                onClick={() => handleExport('csv')}
                                className="px-4 py-2 rounded-lg text-xs font-medium bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/70 border border-slate-200 dark:border-white/10 hover:bg-slate-300 dark:bg-white/15 transition-all flex items-center gap-2"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Export
                            </button>
                        </div>
                    </div>

                    {/* Summary Stats */}
                    {summaryStats && (
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-slate-100 dark:bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                                <div className="text-xs text-slate-400 dark:text-white/40 mb-1 uppercase tracking-wide">Revenue</div>
                                <div className="text-xl font-light text-white tabular-nums">{fmtMoney(summaryStats.income)}</div>
                            </div>
                            <div className="bg-slate-100 dark:bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                                <div className="text-xs text-slate-400 dark:text-white/40 mb-1 uppercase tracking-wide">Expenses</div>
                                <div className="text-xl font-light text-white tabular-nums">{fmtMoney(summaryStats.expenses)}</div>
                            </div>
                            <div className="bg-slate-100 dark:bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                                <div className="text-xs text-slate-400 dark:text-white/40 mb-1 uppercase tracking-wide">Net Profit</div>
                                <div className="text-xl font-light text-white tabular-nums">{fmtMoney(summaryStats.net)}</div>
                            </div>
                            <div className="bg-slate-100 dark:bg-white/5 rounded-lg px-4 py-3 border border-white/10">
                                <div className="text-xs text-slate-400 dark:text-white/40 mb-1 uppercase tracking-wide">Margin</div>
                                <div className={`text-xl font-light tabular-nums ${parseFloat(summaryStats.margin) >= 50 ? 'text-green-400' :
                                    parseFloat(summaryStats.margin) >= 30 ? 'text-white' : 'text-orange-400'
                                    }`}>
                                    {summaryStats.margin}%
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filters Panel (collapsible) */}
                {showFilters && (
                    <div className="border-t border-slate-200 dark:border-white/10 px-6 py-4 bg-dark-900/50 animate-in slide-in-from-top duration-200">
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                            <div>
                                <label className="block text-xs text-slate-300 dark:text-white/50 mb-1.5 font-medium">Region</label>
                                <select
                                    value={filters.region || ''}
                                    onChange={(e) => setFilters({ ...filters, region: e.target.value || undefined })}
                                    className="w-full px-3 py-1.5 bg-dark-800 border border-slate-200 dark:border-white/10 rounded text-sm text-white focus:outline-none focus:border-accent-500"
                                >
                                    <option value="">All Regions</option>
                                    <option value="Americas">Americas</option>
                                    <option value="Europa">Europa</option>
                                    <option value="Asia">Asia</option>
                                    <option value="Oceania">Oceania</option>
                                    <option value="Africa">Africa</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-300 dark:text-white/50 mb-1.5 font-medium">Agency</label>
                                <select
                                    value={filters.agency || ''}
                                    onChange={(e) => setFilters({ ...filters, agency: e.target.value || undefined })}
                                    className="w-full px-3 py-1.5 bg-dark-800 border border-slate-200 dark:border-white/10 rounded text-sm text-white focus:outline-none focus:border-accent-500"
                                >
                                    <option value="">All Agencies</option>
                                    <option value="UTA">UTA</option>
                                    <option value="Shushi 3000">Shushi 3000</option>
                                    <option value="Creative Primates">Creative Primates</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-300 dark:text-white/50 mb-1.5 font-medium">Status</label>
                                <select
                                    value={filters.status || ''}
                                    onChange={(e) => setFilters({ ...filters, status: e.target.value || undefined })}
                                    className="w-full px-3 py-1.5 bg-dark-800 border border-slate-200 dark:border-white/10 rounded text-sm text-white focus:outline-none focus:border-accent-500"
                                >
                                    <option value="">All Status</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="pending">Pending</option>
                                    <option value="offer">Offer</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs text-slate-300 dark:text-white/50 mb-1.5 font-medium">Date From</label>
                                <input
                                    type="date"
                                    value={filters.dateFrom || ''}
                                    onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value || undefined })}
                                    className="w-full px-3 py-1.5 bg-dark-800 border border-slate-200 dark:border-white/10 rounded text-sm text-white focus:outline-none focus:border-accent-500"
                                />
                            </div>
                            <div>
                                <label className="block text-xs text-slate-300 dark:text-white/50 mb-1.5 font-medium">Date To</label>
                                <input
                                    type="date"
                                    value={filters.dateTo || ''}
                                    onChange={(e) => setFilters({ ...filters, dateTo: e.target.value || undefined })}
                                    className="w-full px-3 py-1.5 bg-dark-800 border border-slate-200 dark:border-white/10 rounded text-sm text-white focus:outline-none focus:border-accent-500"
                                />
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-2 mt-3">
                            <button
                                onClick={() => setFilters({})}
                                className="px-3 py-1.5 rounded text-xs font-medium text-slate-400 dark:text-white/60 hover:text-white transition-colors"
                            >
                                Clear All
                            </button>
                            <button
                                onClick={() => announce('Filters applied')}
                                className="px-4 py-1.5 rounded-lg text-xs font-medium bg-accent-500 text-black hover:bg-accent-600 transition-colors"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                {/* Sub-Tabs Navigation */}
                <div className="border-t border-slate-200 dark:border-white/10 flex items-center bg-dark-900/30">
                    {subTabs.map(tab => {
                        const Icon = tab.icon;
                        const isActive = activeSubTab === tab.id;
                        return (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveSubTab(tab.id);
                                    announce(`Switched to ${tab.label} analysis`);
                                }}
                                className={`group relative flex-1 px-4 py-3 flex flex-col items-center gap-1.5 transition-all duration-200 ${isActive
                                    ? 'text-white'
                                    : 'text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/70 hover:bg-white/5'
                                    }`}
                                title={tab.description}
                            >
                                {isActive && (
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-gradient-to-r from-accent-500 to-blue-500" />
                                )}
                                <Icon className={`w-4 h-4 transition-colors ${isActive ? 'text-accent-400' : ''}`} />
                                <span className={`text-xs font-medium ${isActive ? 'font-semibold' : ''}`}>
                                    {tab.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Sub-Tab Content */}
            <div className="animate-in fade-in duration-200">
                {activeSubTab === 'performance' && (
                    <MarginBreakdown
                        onSelect={(kind, value) => {
                            onDrillThrough?.(kind, value);
                            announce(`Drilling through to ${kind}: ${value}`);
                        }}
                    />
                )}

                {activeSubTab === 'pivot' && (
                    <PLPivot
                        onViewInPL={(kind, value) => {
                            onDrillThrough?.(kind, value);
                            announce(`Viewing in P&L: ${kind} - ${value}`);
                        }}
                    />
                )}

                {activeSubTab === 'aging' && (
                    <PipelineAR
                        onViewBucket={(bucket) => {
                            onDrillThrough?.('Aging', bucket);
                            announce(`Viewing aging bucket: ${bucket}`);
                        }}
                    />
                )}

                {activeSubTab === 'trends' && (
                    <TrendsAnalysis />
                )}
            </div>
        </div>
    );
};

export default AnalysisHub;
