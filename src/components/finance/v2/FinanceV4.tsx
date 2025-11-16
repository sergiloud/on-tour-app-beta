import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { t } from '../../../lib/i18n';
import {
    TrendingUp, DollarSign, Calendar, Receipt, Table,
    Download, Maximize2, Minimize2, X
} from 'lucide-react';
import { regionOfCountry, REGIONS } from '../../../lib/geo';
import PeriodSelector from '../../finance/PeriodSelector';
// Dynamic import for exportFinanceCsv to reduce bundle size
import { useToast } from '../../../ui/Toast';
import { can } from '../../../lib/tenants';
import { announce } from '../../../lib/announcer';
import { trackEvent } from '../../../lib/telemetry';
import { loadExpenses } from '../../../lib/expenses';
import MarginBreakdown from './MarginBreakdown';
import PLPivot from './PLPivot';
import PipelineAR from './PipelineAR';
import TrendsAnalysis from './TrendsAnalysis';
import PLTable from './PLTable';
import ExpenseManager from './ExpenseManager';
import { sumFees, type SupportedCurrency } from '../../../lib/fx';
import { loadSettings } from '../../../lib/persist';

type MinimizedSection = 'performance' | 'pivot' | 'ar' | 'trends' | 'pl' | 'expenses';

/**
 * FinanceV4 - Scroll Dashboard sin desplegables
 * Todo visible por defecto, con opción de minimizar secciones al lateral
 */
const FinanceV4: React.FC = () => {
    const { snapshot } = useFinance();
    const { currency, fmtMoney } = useSettings();
    const toast = useToast();

    const [minimizedSections, setMinimizedSections] = React.useState<Set<MinimizedSection>>(new Set());
    const [plFilter, setPlFilter] = React.useState<{ kind: 'Region' | 'Agency' | 'Country' | 'Promoter' | 'Route' | 'Aging'; value: string } | null>(null);
    const [showMiniSidebar, setShowMiniSidebar] = React.useState(false);

    // Cálculos principales
    const stats = React.useMemo(() => {
        const shows = snapshot?.shows || [];
        const confirmedShows = shows.filter(s => s.status === 'confirmed');

        const settings = loadSettings() as any;
        const baseCurrency = (settings.currency || 'EUR') as SupportedCurrency;

        const totalRevenue = sumFees(confirmedShows, baseCurrency);
        const totalCosts = confirmedShows.reduce((sum, s) => sum + (s.cost || 0), 0);

        // Incluir expenses
        const expenses = loadExpenses();
        const currentYear = new Date().getFullYear();
        const expensesFromManager = expenses
            .filter(e => e.date.startsWith(String(currentYear)))
            .reduce((sum, e) => sum + e.amount, 0);

        const totalCostsWithExpenses = totalCosts + expensesFromManager;
        const totalNet = totalRevenue - totalCostsWithExpenses;
        const margin = totalRevenue > 0 ? (totalNet / totalRevenue) * 100 : 0;

        // Por región
        const byRegion = REGIONS.map(region => {
            const regionShows = confirmedShows.filter(s => regionOfCountry(s.country) === region);
            const revenue = sumFees(regionShows, baseCurrency);
            const costs = regionShows.reduce((sum, s) => sum + (s.cost || 0), 0);
            const net = revenue - costs;

            return {
                region,
                shows: regionShows.length,
                revenue,
                costs,
                net,
                margin: revenue > 0 ? (net / revenue) * 100 : 0
            };
        }).filter(r => r.shows > 0).sort((a, b) => b.revenue - a.revenue);

        // Upcoming
        const today = new Date();
        const next30 = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);
        const upcoming = confirmedShows.filter(s => {
            const showDate = new Date(s.date);
            return showDate >= today && showDate <= next30;
        });
        const upcomingRevenue = sumFees(upcoming, baseCurrency);

        return {
            totalRevenue,
            totalCosts: totalCostsWithExpenses,
            totalNet,
            margin,
            showCount: confirmedShows.length,
            byRegion,
            upcoming: upcoming.length,
            upcomingRevenue,
            expensesFromManager
        };
    }, [snapshot]);

    const handleExportCSV = async () => {
        try { trackEvent('finance.export.start', { type: 'csv' }); } catch { }
        const { exportFinanceCsv } = await import('../../../lib/finance/export');
        exportFinanceCsv(snapshot.shows as any, {
            masked: false,
            columns: ['date', 'city', 'country', 'venue', 'promoter', 'fee', 'status', 'route', 'net']
        });
        try { toast.success('Exported ✓'); announce('Exported ✓'); } catch { }
    };

    const handleExportXLSX = async () => {
        try { trackEvent('finance.export.start', { type: 'xlsx' }); } catch { }
        const ExcelJS = await import('exceljs');
        const rows = (snapshot.shows as any[]).map((s: any) => {
            const cost = typeof s.cost === 'number' ? s.cost : 0;
            const net = Math.round((s.fee || 0) - cost);
            return {
                Date: s.date,
                City: s.city,
                Country: s.country,
                Venue: s.venue || '',
                Promoter: s.promoter || '',
                Fee: s.fee || 0,
                Cost: cost,
                Net: net,
                Status: s.status,
                Route: s.route || '',
            };
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Finance');

        worksheet.columns = Object.keys(rows[0] || {}).map(key => ({
            header: key,
            key: key,
            width: key === 'Venue' ? 25 : 15
        }));

        worksheet.getRow(1).font = { bold: true };
        worksheet.getRow(1).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE5E7EB' }
        };

        rows.forEach(row => worksheet.addRow(row));

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-${new Date().toISOString().slice(0, 10)}.xlsx`;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);

        try { trackEvent('finance.export.complete', { type: 'xlsx', count: rows.length }); } catch { }
        try { toast.success('Exported ✓'); announce('Exported ✓'); } catch { }
    };

    const toggleMinimize = (section: MinimizedSection) => {
        setMinimizedSections(prev => {
            const next = new Set(prev);
            if (next.has(section)) {
                next.delete(section);
            } else {
                next.add(section);
            }
            return next;
        });
    };

    const restoreSection = (section: MinimizedSection) => {
        setMinimizedSections(prev => {
            const next = new Set(prev);
            next.delete(section);
            return next;
        });
        // Scroll to section
        setTimeout(() => {
            document.getElementById(`section-${section}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 100);
    };

    const sectionTitles: Record<MinimizedSection, string> = {
        performance: 'Performance',
        pivot: 'Pivot',
        ar: 'Cash Flow',
        trends: 'Trends',
        pl: 'P&L Table',
        expenses: 'Expenses'
    };

    return (
        <div className="relative">

            {/* Fixed Mini Sidebar (secciones minimizadas) */}
            {minimizedSections.size > 0 && (
                <div className="fixed right-4 top-24 z-40 space-y-2">
                    {Array.from(minimizedSections).map(section => (
                        <button
                            key={section}
                            onClick={() => restoreSection(section)}
                            className="group flex items-center gap-2 px-3 py-2 rounded-lg glass border border-slate-300 dark:border-white/20 hover:border-accent-500/50 transition-all hover:scale-105 backdrop-blur-xl shadow-xl"
                            title={`Restore ${sectionTitles[section]}`}
                        >
                            <Maximize2 className="w-4 h-4 text-slate-400 dark:text-white/60 group-hover:text-accent-400 transition-colors" />
                            <span className="text-xs font-medium text-slate-600 dark:text-white/80 group-hover:text-white transition-colors">
                                {sectionTitles[section]}
                            </span>
                        </button>
                    ))}
                </div>
            )}

            <div className="space-y-6 lg:space-y-8">

                {/* Top Controls Bar */}
                <div className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                    <div className="bg-gradient-to-r from-transparent via-white/5 to-transparent px-6 py-4">
                        <div className="flex items-center justify-between flex-wrap gap-4">
                            {/* Period Selector */}
                            <div className="flex items-center gap-4">
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4 text-slate-300 dark:text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    <span className="text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider">Period</span>
                                </div>
                                <PeriodSelector />
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-3">
                                <span className="text-xs text-slate-400 dark:text-white/40 font-medium uppercase tracking-wider">Export:</span>
                                <button
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium glass border border-slate-200 dark:border-white/10 hover:border-accent-500/30 hover:bg-gradient-to-br hover:from-accent-500/10 hover:to-transparent transition-all disabled:opacity-40"
                                    disabled={!can('finance:export')}
                                    onClick={handleExportCSV}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Download className="w-3.5 h-3.5" />
                                        CSV
                                    </span>
                                </button>
                                <button
                                    className="px-3 py-1.5 rounded-lg text-xs font-medium glass border border-slate-200 dark:border-white/10 hover:border-accent-500/30 hover:bg-gradient-to-br hover:from-accent-500/10 hover:to-transparent transition-all disabled:opacity-40"
                                    disabled={!can('finance:export')}
                                    onClick={handleExportXLSX}
                                >
                                    <span className="flex items-center gap-1.5">
                                        <Download className="w-3.5 h-3.5" />
                                        XLSX
                                    </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Hero Summary - Siempre Visible */}
                <div className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm shadow-lg overflow-hidden hover:border-slate-300 dark:hover:border-white/20 hover:shadow-xl hover:shadow-accent-500/5 transition-all duration-300">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200 dark:divide-white/10">

                        {/* Revenue */}
                        <div className="group relative p-6 lg:p-8 text-center transition-all duration-300 hover:bg-gradient-to-br hover:from-slate-100 dark:from-white/5 hover:to-transparent cursor-default">
                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-medium group-hover:text-slate-400 dark:text-white/60 transition-colors">
                                    Total Revenue
                                </div>
                                <div className="text-2xl lg:text-3xl font-light text-white tabular-nums tracking-tight">
                                    {fmtMoney(stats.totalRevenue)}
                                </div>
                                <div className="text-xs text-slate-400 dark:text-white/40 mt-2">{stats.showCount} shows</div>
                            </div>
                        </div>

                        {/* Costs */}
                        <div className="group relative p-6 lg:p-8 text-center transition-all duration-300 hover:bg-gradient-to-br hover:from-slate-100 dark:from-white/5 hover:to-transparent cursor-default">
                            <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-medium group-hover:text-slate-400 dark:text-white/60 transition-colors">
                                    Total Costs
                                </div>
                                <div className="text-2xl lg:text-3xl font-light text-white tabular-nums tracking-tight">
                                    {fmtMoney(stats.totalCosts)}
                                </div>
                                {stats.expensesFromManager > 0 && (
                                    <div className="text-xs text-orange-400 mt-2">
                                        +{fmtMoney(stats.expensesFromManager)} expenses
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Net */}
                        <div className="group relative p-6 lg:p-8 text-center transition-all duration-300 hover:bg-gradient-to-br hover:from-accent-500/10 hover:to-blue-500/5 cursor-default">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-medium group-hover:text-accent-300 transition-colors">
                                    Net Profit
                                </div>
                                <div className="text-2xl lg:text-3xl font-light text-accent-400 tabular-nums tracking-tight group-hover:text-accent-300 transition-all duration-300">
                                    {fmtMoney(stats.totalNet)}
                                </div>
                                <div className={`text-xs mt-2 font-semibold ${stats.margin > 70 ? 'text-emerald-400' :
                                    stats.margin > 50 ? 'text-accent-400' :
                                        'text-orange-400'
                                    }`}>
                                    {stats.margin.toFixed(1)}% margin
                                </div>
                            </div>
                        </div>

                        {/* Upcoming */}
                        <div className="group relative p-6 lg:p-8 text-center transition-all duration-300 hover:bg-gradient-to-br hover:from-slate-100 dark:from-white/5 hover:to-transparent cursor-default">
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                            <div className="relative">
                                <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-medium group-hover:text-slate-400 dark:text-white/60 transition-colors">
                                    Next 30 Days
                                </div>
                                <div className="text-2xl lg:text-3xl font-light text-white tabular-nums tracking-tight">
                                    {fmtMoney(stats.upcomingRevenue)}
                                </div>
                                <div className="text-xs text-blue-400 mt-2">{stats.upcoming} upcoming shows</div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Regional Quick View */}
                {stats.byRegion.length > 0 && (
                    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                            <h3 className="text-sm font-medium text-slate-400 dark:text-white/60 uppercase tracking-wider">Regional Overview</h3>
                        </div>
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
                                {stats.byRegion.map(region => (
                                    <div
                                        key={region.region}
                                        className="glass rounded-lg p-4 border border-slate-200 dark:border-white/10 hover:border-accent-500/30 transition-all group cursor-pointer"
                                    >
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{region.region}</span>
                                            <div className={`w-2 h-2 rounded-full ${region.margin > 70 ? 'bg-emerald-400' :
                                                region.margin > 50 ? 'bg-accent-400' :
                                                    'bg-orange-400'
                                                }`} />
                                        </div>
                                        <div className="text-xl font-bold text-white tabular-nums mb-1">
                                            {fmtMoney(region.revenue)}
                                        </div>
                                        <div className="flex items-center justify-between text-xs text-slate-300 dark:text-white/50">
                                            <span>{region.shows} shows</span>
                                            <span className={`font-semibold ${region.margin > 70 ? 'text-emerald-400' :
                                                region.margin > 50 ? 'text-accent-400' :
                                                    'text-orange-400'
                                                }`}>
                                                {region.margin.toFixed(0)}%
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {/* Performance Analysis */}
                {!minimizedSections.has('performance') && (
                    <div id="section-performance" className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400 dark:text-white/60 uppercase tracking-wider">Performance Analysis</h3>
                            <button
                                onClick={() => toggleMinimize('performance')}
                                className="p-1.5 rounded hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-colors"
                                title="Minimize section"
                            >
                                <Minimize2 className="w-4 h-4 text-slate-400 dark:text-white/40 hover:text-slate-400 dark:text-white/60" />
                            </button>
                        </div>
                        <div className="p-6">
                            <MarginBreakdown onSelect={(kind, value) => {
                                setPlFilter({ kind, value });
                                setTimeout(() => {
                                    document.getElementById('section-pl')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                            }} />
                        </div>
                    </div>
                )}

                {/* Pivot Analysis */}
                {!minimizedSections.has('pivot') && (
                    <div id="section-pivot" className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400 dark:text-white/60 uppercase tracking-wider">Pivot Analysis</h3>
                            <button
                                onClick={() => toggleMinimize('pivot')}
                                className="p-1.5 rounded hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-colors"
                                title="Minimize section"
                            >
                                <Minimize2 className="w-4 h-4 text-slate-400 dark:text-white/40 hover:text-slate-400 dark:text-white/60" />
                            </button>
                        </div>
                        <div className="p-6">
                            <PLPivot onViewInPL={(kind, value) => {
                                setPlFilter({ kind, value });
                                setTimeout(() => {
                                    document.getElementById('section-pl')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                            }} />
                        </div>
                    </div>
                )}

                {/* Cash Flow & AR */}
                {!minimizedSections.has('ar') && (
                    <div id="section-ar" className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400 dark:text-white/60 uppercase tracking-wider">Cash Flow & AR Management</h3>
                            <button
                                onClick={() => toggleMinimize('ar')}
                                className="p-1.5 rounded hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-colors"
                                title="Minimize section"
                            >
                                <Minimize2 className="w-4 h-4 text-slate-400 dark:text-white/40 hover:text-slate-400 dark:text-white/60" />
                            </button>
                        </div>
                        <div className="p-6">
                            <PipelineAR onViewBucket={(bucket) => {
                                setPlFilter({ kind: 'Aging', value: bucket });
                                setTimeout(() => {
                                    document.getElementById('section-pl')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                                }, 100);
                            }} />
                        </div>
                    </div>
                )}

                {/* Trends */}
                {!minimizedSections.has('trends') && (
                    <div id="section-trends" className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400 dark:text-white/60 uppercase tracking-wider">Trends & Growth</h3>
                            <button
                                onClick={() => toggleMinimize('trends')}
                                className="p-1.5 rounded hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-colors"
                                title="Minimize section"
                            >
                                <Minimize2 className="w-4 h-4 text-slate-400 dark:text-white/40 hover:text-slate-400 dark:text-white/60" />
                            </button>
                        </div>
                        <div className="p-6">
                            <TrendsAnalysis />
                        </div>
                    </div>
                )}

                {/* P&L Table */}
                {!minimizedSections.has('pl') && (
                    <div id="section-pl" className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300 scroll-mt-20">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <h3 className="text-sm font-medium text-slate-400 dark:text-white/60 uppercase tracking-wider">Profit & Loss Detail</h3>
                                {plFilter && (
                                    <span className="px-2 py-1 rounded text-xs font-medium bg-accent-500/20 text-accent-300 border border-accent-500/30">
                                        {plFilter.kind} = {plFilter.value}
                                    </span>
                                )}
                            </div>
                            <button
                                onClick={() => toggleMinimize('pl')}
                                className="p-1.5 rounded hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-colors"
                                title="Minimize section"
                            >
                                <Minimize2 className="w-4 h-4 text-slate-400 dark:text-white/40 hover:text-slate-400 dark:text-white/60" />
                            </button>
                        </div>
                        <div className="p-6">
                            <PLTable filter={plFilter} onClearFilter={() => setPlFilter(null)} />
                        </div>
                    </div>
                )}

                {/* Expenses */}
                {!minimizedSections.has('expenses') && (
                    <div id="section-expenses" className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                        <div className="px-6 py-4 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent flex items-center justify-between">
                            <h3 className="text-sm font-medium text-slate-400 dark:text-white/60 uppercase tracking-wider">Expense Management</h3>
                            <button
                                onClick={() => toggleMinimize('expenses')}
                                className="p-1.5 rounded hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-colors"
                                title="Minimize section"
                            >
                                <Minimize2 className="w-4 h-4 text-slate-400 dark:text-white/40 hover:text-slate-400 dark:text-white/60" />
                            </button>
                        </div>
                        <div className="p-6">
                            <ExpenseManager />
                        </div>
                    </div>
                )}

                {/* Spacer */}
                <div className="h-20" />
            </div>
        </div>
    );
};

export default FinanceV4;
