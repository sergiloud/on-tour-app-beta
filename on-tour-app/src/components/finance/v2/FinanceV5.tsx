import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { t } from '../../../lib/i18n';
import {
    TrendingUp, BarChart3, Clock, Receipt, Table, Download,
    ChevronRight, PieChart, Activity, ArrowRight, Sparkles, Zap
} from 'lucide-react';
import { regionOfCountry, REGIONS } from '../../../lib/geo';
import PeriodSelector from '../../finance/PeriodSelector';
import { exportFinanceCsv } from '../../../lib/finance/export';
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

type Section = 'overview' | 'performance' | 'pivot' | 'ar' | 'trends' | 'pl' | 'expenses';

/**
 * FinanceV5 - Professional Dashboard with Refined Design
 * Typography, spacing, and visual hierarchy optimized for professional presentation
 */
const FinanceV5: React.FC = () => {
    const { snapshot } = useFinance();
    const { currency, fmtMoney } = useSettings();
    const toast = useToast();

    const [activeSection, setActiveSection] = React.useState<Section>('overview');
    const [plFilter, setPlFilter] = React.useState<{ kind: 'Region' | 'Agency' | 'Country' | 'Promoter' | 'Route' | 'Aging'; value: string } | null>(null);
    const contentRef = React.useRef<HTMLDivElement>(null);

    // Format large numbers professionally
    const fmtCompact = (value: number) => {
        if (value >= 1000000) {
            return `${(value / 1000000).toFixed(1)}M`;
        } else if (value >= 1000) {
            return `${(value / 1000).toFixed(0)}K`;
        }
        return value.toFixed(0);
    };

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

    const handleExportCSV = () => {
        try { trackEvent('finance.export.start', { type: 'csv' }); } catch { }
        exportFinanceCsv(snapshot.shows as any, {
            masked: false,
            columns: ['date', 'city', 'country', 'venue', 'promoter', 'fee', 'status', 'route', 'net']
        });
        try { toast.success('Exported ✓'); announce('Exported ✓'); } catch { }
    };

    const handleExportXLSX = async () => {
        // Show DRAFT warning dialog
        const confirmed = window.confirm(
            '⚠️ DRAFT EXPORT WARNING\n\n' +
            'This export has limitations:\n' +
            '• Currencies NOT harmonized (mixed EUR/USD/GBP/AUD)\n' +
            '• WHT (Withholding Tax) NOT calculated\n' +
            '• For visualization only - NOT for accounting/legal use\n\n' +
            'Continue export?'
        );
        if (!confirmed) return;

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

        // Add DRAFT warning banner
        worksheet.addRow({});
        const warningRow = worksheet.addRow(['⚠️ DRAFT EXPORT - Currencies not harmonized, WHT not calculated']);
        const colCount = Object.keys(rows[0] || {}).length;
        warningRow.font = { bold: true, color: { argb: 'FFD97706' } };
        warningRow.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFEF3C7' }
        };
        worksheet.mergeCells(2, 1, 2, colCount);
        worksheet.addRow({});

        worksheet.columns = Object.keys(rows[0] || {}).map(key => ({
            header: key,
            key: key,
            width: key === 'Venue' ? 25 : 15
        }));

        const headerRow = worksheet.getRow(4);
        headerRow.font = { bold: true };
        headerRow.fill = {
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

    const sections = React.useMemo(() => [
        {
            id: 'overview' as Section,
            label: 'Overview',
            icon: Activity,
            description: 'Executive Summary',
            color: 'from-accent-500/20 to-blue-500/20',
            accentColor: 'accent-500',
            metric: `${stats.showCount} events`,
            highlight: fmtCompact(stats.totalRevenue)
        },
        {
            id: 'performance' as Section,
            label: 'Performance',
            icon: BarChart3,
            description: 'Profitability Metrics',
            color: 'from-emerald-500/20 to-green-500/20',
            accentColor: 'emerald-500',
            metric: `${stats.margin.toFixed(1)}% margin`,
            highlight: null
        },
        {
            id: 'pivot' as Section,
            label: 'Pivot Analysis',
            icon: PieChart,
            description: 'Multi-Dimensional View',
            color: 'from-purple-500/20 to-pink-500/20',
            accentColor: 'purple-500',
            metric: `${stats.byRegion.length} regions`,
            highlight: null
        },
        {
            id: 'ar' as Section,
            label: 'Receivables',
            icon: Clock,
            description: 'Collections & Aging',
            color: 'from-orange-500/20 to-amber-500/20',
            accentColor: 'orange-500',
            metric: `${stats.upcoming} upcoming`,
            highlight: null
        },
        {
            id: 'trends' as Section,
            label: 'Trends',
            icon: TrendingUp,
            description: 'Historical Analysis',
            color: 'from-cyan-500/20 to-teal-500/20',
            accentColor: 'cyan-500',
            metric: 'Year-over-Year',
            highlight: null
        },
        {
            id: 'pl' as Section,
            label: 'Statement',
            icon: Table,
            description: 'Profit & Loss Detail',
            color: 'from-blue-500/20 to-indigo-500/20',
            accentColor: 'blue-500',
            metric: `${stats.showCount} records`,
            highlight: null
        },
        {
            id: 'expenses' as Section,
            label: 'Expenses',
            icon: Receipt,
            description: 'Operating Costs',
            color: 'from-red-500/20 to-rose-500/20',
            accentColor: 'red-500',
            metric: stats.expensesFromManager > 0 ? fmtCompact(stats.expensesFromManager) : 'None',
            highlight: null
        }
    ], [stats, fmtMoney, fmtCompact]);

    const handleSectionChange = (section: Section) => {
        setActiveSection(section);
        if (section !== 'pl') {
            setPlFilter(null);
        }
        // Smooth scroll to top
        if (contentRef.current) {
            contentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    // Keyboard navigation
    React.useEffect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.ctrlKey || e.metaKey) {
                const keyMap: Record<string, Section> = {
                    '1': 'overview',
                    '2': 'performance',
                    '3': 'pivot',
                    '4': 'ar',
                    '5': 'trends',
                    '6': 'pl',
                    '7': 'expenses'
                };

                const section = keyMap[e.key];
                if (section) {
                    e.preventDefault();
                    handleSectionChange(section);
                }
            }
        };

        window.addEventListener('keydown', handleKeyPress);
        return () => window.removeEventListener('keydown', handleKeyPress);
    }, []);

    const currentSection = sections.find(s => s.id === activeSection);

    const navigateToPL = (filter: { kind: 'Region' | 'Agency' | 'Country' | 'Promoter' | 'Route' | 'Aging'; value: string }) => {
        setPlFilter(filter);
        setActiveSection('pl');
    };

    return (
        <div className="flex gap-8 min-h-screen">

            {/* Professional Side Navigation */}
            <div className="w-[320px] flex-shrink-0">
                <div className="sticky top-20 space-y-5">

                    {/* Header - Más limpio y profesional */}
                    <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md overflow-hidden shadow-xl">
                        <div className="relative">
                            {/* Gradient accent bar */}
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-accent-500 via-blue-500 to-purple-500" />

                            <div className="p-8 pb-6">
                                <h2 className="text-xl font-semibold text-white mb-2 tracking-tight">Financial Analytics</h2>
                                <p className="text-xs text-slate-300 dark:text-white/50 font-medium tracking-wide uppercase">
                                    Executive Dashboard
                                </p>
                            </div>

                            {currentSection && (
                                <div className="px-8 pb-6 border-t border-white/5">
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider font-medium">Active View</span>
                                        <div className="flex items-center gap-2">
                                            <div className={`p-1.5 rounded-lg bg-gradient-to-br ${currentSection.color} shadow-lg`}>
                                                <currentSection.icon className="w-3.5 h-3.5 text-slate-900 dark:text-white" />
                                            </div>
                                            <span className="text-sm font-semibold text-slate-900 dark:text-white">{currentSection.label}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Professional Navigation Menu */}
                    <div className="space-y-2">
                        {sections.map((section, index) => {
                            const Icon = section.icon;
                            const isActive = activeSection === section.id;

                            return (
                                <button
                                    key={section.id}
                                    onClick={() => handleSectionChange(section.id)}
                                    className={`w-full group relative overflow-hidden rounded-xl border transition-all duration-300 ${isActive
                                        ? 'border-accent-400/60 bg-gradient-to-br from-accent-500/20 to-blue-500/10 shadow-xl shadow-accent-500/20'
                                        : 'border-slate-200 dark:border-white/10 glass hover:border-slate-300 dark:hover:border-white/20 hover:bg-slate-100 dark:hover:bg-white/5 hover:shadow-lg'
                                        }`}
                                >
                                    {/* Active indicator bar */}
                                    {isActive && (
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-accent-400 to-blue-500" />
                                    )}

                                    <div className="relative p-4">
                                        <div className="flex items-center gap-4 mb-3">
                                            {/* Icon with number badge */}
                                            <div className="relative">
                                                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${section.color} transition-all duration-300 shadow-lg ${isActive ? 'opacity-100 scale-105' : 'opacity-70 group-hover:opacity-90 group-hover:scale-100'
                                                    }`}>
                                                    <Icon className={`w-5 h-5 transition-colors ${isActive ? 'text-white' : 'text-slate-500 dark:text-white/70 group-hover:text-white'
                                                        }`} />
                                                </div>
                                                {/* Section number badge */}
                                                <div className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${isActive
                                                    ? 'bg-accent-500 text-white shadow-lg shadow-accent-500/50'
                                                    : 'bg-slate-200 dark:bg-white/10 text-slate-400 dark:text-white/40 group-hover:bg-white/20'
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                            </div>

                                            {/* Labels */}
                                            <div className="flex-1 min-w-0">
                                                <div className={`text-sm font-semibold tracking-tight transition-colors mb-0.5 ${isActive ? 'text-white' : 'text-slate-600 dark:text-white/80 group-hover:text-white'
                                                    }`}>
                                                    {section.label}
                                                </div>
                                                <div className={`text-[11px] transition-colors truncate ${isActive ? 'text-white/60' : 'text-slate-400 dark:text-white/40 group-hover:text-white/50'
                                                    }`}>
                                                    {section.description}
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <ChevronRight className={`w-4 h-4 transition-all duration-300 flex-shrink-0 ${isActive
                                                ? 'text-accent-400 translate-x-1 opacity-100'
                                                : 'text-white/20 group-hover:text-slate-400 dark:text-white/40 group-hover:translate-x-0.5 opacity-60'
                                                }`} />
                                        </div>

                                        {/* Professional metric display */}
                                        {section.metric && (
                                            <div className={`flex items-center justify-between text-xs font-medium pt-3 border-t transition-all ${isActive
                                                ? 'border-accent-500/20'
                                                : 'border-white/5'
                                                }`}>
                                                <span className={`uppercase tracking-wider ${isActive ? 'text-white/50' : 'text-white/30'
                                                    }`}>
                                                    {section.highlight ? 'Revenue' : 'Metric'}
                                                </span>
                                                <span className={`font-bold tabular-nums ${isActive ? 'text-accent-300' : 'text-white/60'
                                                    }`}>
                                                    {section.highlight || section.metric}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </button>
                            );
                        })}
                    </div>

                    {/* Professional Tools Panel */}
                    <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-accent-500/20 to-blue-500/20">
                                    <Zap className="w-3.5 h-3.5 text-accent-400" />
                                </div>
                                <div className="text-xs text-slate-300 dark:text-white/50 uppercase tracking-wider font-semibold">
                                    Export Tools
                                </div>
                            </div>
                        </div>
                        <div className="p-4 space-y-2">
                            <button
                                className="w-full px-4 py-3 rounded-xl text-xs font-semibold glass border border-slate-200 dark:border-white/10 hover:border-emerald-500/40 hover:bg-gradient-to-br hover:from-emerald-500/10 hover:to-transparent transition-all disabled:opacity-40 text-left group shadow-sm hover:shadow-lg"
                                disabled={!can('finance:export')}
                                onClick={handleExportCSV}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-emerald-500/20 to-green-500/20 group-hover:scale-110 transition-transform">
                                        <Download className="w-3.5 h-3.5 text-emerald-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-slate-900 dark:text-white group-hover:text-white transition-colors">Export CSV</div>
                                        <div className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wider">Comma-separated</div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                            <button
                                className="w-full px-4 py-3 rounded-xl text-xs font-semibold glass border border-slate-200 dark:border-white/10 hover:border-blue-500/40 hover:bg-gradient-to-br hover:from-blue-500/10 hover:to-transparent transition-all disabled:opacity-40 text-left group shadow-sm hover:shadow-lg"
                                disabled={!can('finance:export')}
                                onClick={handleExportXLSX}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-indigo-500/20 group-hover:scale-110 transition-transform">
                                        <Download className="w-3.5 h-3.5 text-blue-400" />
                                    </div>
                                    <div className="flex-1">
                                        <div className="text-slate-900 dark:text-white group-hover:text-white transition-colors">Export Excel</div>
                                        <div className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wider">Spreadsheet format</div>
                                    </div>
                                    <ArrowRight className="w-3.5 h-3.5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Period Selector - Professional */}
                    <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md overflow-hidden shadow-xl">
                        <div className="px-6 py-4 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                            <div className="flex items-center gap-2.5">
                                <div className="p-1.5 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20">
                                    <svg className="w-3.5 h-3.5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                                <div className="text-xs text-slate-300 dark:text-white/50 uppercase tracking-wider font-semibold">
                                    Reporting Period
                                </div>
                            </div>
                        </div>
                        <div className="p-5">
                            <PeriodSelector />
                        </div>
                    </div>

                    {/* Keyboard Shortcuts Hint */}
                    <div className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm p-4">
                        <div className="text-[10px] text-slate-300 dark:text-white/30 uppercase tracking-wider mb-2 font-semibold">
                            Keyboard Shortcuts
                        </div>
                        <div className="text-xs text-slate-300 dark:text-white/50 space-y-1">
                            <div className="flex items-center gap-2">
                                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-[10px] font-mono text-slate-400 dark:text-white/60">⌘</kbd>
                                <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 text-[10px] font-mono text-slate-400 dark:text-white/60">1-7</kbd>
                                <span className="text-[11px]">Navigate sections</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content Area - Professional Layout */}
            <div ref={contentRef} className="flex-1 min-w-0 overflow-y-auto">
                <div className="space-y-10 pb-24">

                    {/* Professional Breadcrumb */}
                    <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md shadow-xl overflow-hidden">
                        <div className="px-8 py-5 flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="p-2 rounded-xl bg-gradient-to-br from-accent-500/20 to-blue-500/20 shadow-lg">
                                    {currentSection && <currentSection.icon className="w-5 h-5 text-accent-400" />}
                                </div>
                                <div className="flex items-center gap-3 text-sm">
                                    <span className="text-slate-400 dark:text-white/40 font-medium">Financial Analytics</span>
                                    <ChevronRight className="w-4 h-4 text-slate-200 dark:text-white/20" />
                                    <span className="text-slate-900 dark:text-white font-semibold tracking-tight">{currentSection?.label}</span>
                                    {currentSection?.description && (
                                        <>
                                            <span className="text-slate-200 dark:text-white/20">·</span>
                                            <span className="text-slate-400 dark:text-white/40 text-xs">{currentSection.description}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                            {plFilter && (
                                <div className="flex items-center gap-2">
                                    <span className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider font-medium">Filter:</span>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gradient-to-br from-accent-500/20 to-blue-500/10 text-accent-300 border border-accent-500/30 shadow-lg">
                                        {plFilter.kind}: {plFilter.value}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Overview Section - Executive Summary */}
                    {activeSection === 'overview' && (
                        <div className="space-y-8 animate-in fade-in duration-700 slide-in-from-bottom-4">

                            {/* Compact Executive Summary - Different from other sections */}
                            <div className="glass rounded-3xl border border-slate-200 dark:border-white/10 backdrop-blur-md overflow-hidden shadow-2xl">
                                <div className="px-10 py-8 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-accent-500/10 via-blue-500/5 to-purple-500/10">
                                    <h3 className="text-2xl font-semibold text-slate-900 dark:text-white mb-2 tracking-tight">Executive Summary</h3>
                                    <p className="text-sm text-slate-300 dark:text-white/50">High-level financial overview at a glance</p>
                                </div>

                                {/* Compact 4-column metrics */}
                                <div className="grid grid-cols-4 divide-x divide-slate-200 dark:divide-white/5">
                                    <div className="p-8 text-center hover:bg-slate-100 dark:bg-white/5 transition-colors">
                                        <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-semibold">Revenue</div>
                                        <div className="text-3xl font-bold text-emerald-400 tabular-nums mb-2">{fmtCompact(stats.totalRevenue)}</div>
                                        <div className="text-xs text-slate-300 dark:text-white/50">{stats.showCount} events</div>
                                    </div>
                                    <div className="p-8 text-center hover:bg-slate-100 dark:bg-white/5 transition-colors">
                                        <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-semibold">Costs</div>
                                        <div className="text-3xl font-bold text-orange-400 tabular-nums mb-2">{fmtCompact(stats.totalCosts)}</div>
                                        <div className="text-xs text-slate-300 dark:text-white/50">{((stats.totalCosts / stats.totalRevenue) * 100).toFixed(0)}% ratio</div>
                                    </div>
                                    <div className="p-8 text-center hover:bg-slate-100 dark:bg-white/5 transition-colors">
                                        <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-semibold">Net Profit</div>
                                        <div className="text-3xl font-bold text-accent-400 tabular-nums mb-2">{fmtCompact(stats.totalNet)}</div>
                                        <div className={`text-xs font-bold ${stats.margin > 70 ? 'text-emerald-400' : stats.margin > 50 ? 'text-accent-300' : 'text-orange-400'}`}>
                                            {stats.margin.toFixed(1)}% margin
                                        </div>
                                    </div>
                                    <div className="p-8 text-center hover:bg-slate-100 dark:bg-white/5 transition-colors">
                                        <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-semibold">Pipeline</div>
                                        <div className="text-3xl font-bold text-blue-400 tabular-nums mb-2">{fmtCompact(stats.upcomingRevenue)}</div>
                                        <div className="text-xs text-slate-300 dark:text-white/50">{stats.upcoming} upcoming</div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Regional Snapshot - Horizontal Cards */}
                            {stats.byRegion.length > 0 && (
                                <div className="glass rounded-3xl border border-slate-200 dark:border-white/10 backdrop-blur-md overflow-hidden shadow-xl">
                                    <div className="px-10 py-6 border-b border-slate-100 dark:border-white/5 bg-gradient-to-r from-transparent via-white/5 to-transparent">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">Regional Snapshot</h3>
                                                <p className="text-xs text-slate-300 dark:text-white/40">Top performing regions</p>
                                            </div>
                                            <div className="text-xs text-slate-300 dark:text-white/30 uppercase tracking-wider font-semibold">
                                                {stats.byRegion.length} Active Regions
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-8">
                                        <div className="space-y-3">
                                            {stats.byRegion.map((region, index) => (
                                                <div
                                                    key={region.region}
                                                    className="flex items-center gap-6 p-5 rounded-xl glass border border-slate-100 dark:border-white/5 hover:border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:bg-white/5 transition-all group"
                                                >
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="text-2xl font-bold text-slate-300 dark:text-white/30 tabular-nums w-8">
                                                            #{index + 1}
                                                        </div>
                                                        <div className="flex-1">
                                                            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">{region.region}</div>
                                                            <div className="text-xs text-slate-300 dark:text-white/40">{region.shows} events</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xl font-bold text-white tabular-nums mb-1">
                                                            {fmtCompact(region.revenue)}
                                                        </div>
                                                        <div className={`text-xs font-bold ${region.margin > 70 ? 'text-emerald-400' :
                                                            region.margin > 50 ? 'text-accent-400' :
                                                                'text-orange-400'
                                                            }`}>
                                                            {region.margin.toFixed(1)}% margin
                                                        </div>
                                                    </div>
                                                    <div className={`w-2 h-2 rounded-full ${region.margin > 70 ? 'bg-emerald-400 shadow-lg shadow-emerald-400/50' :
                                                        region.margin > 50 ? 'bg-accent-400 shadow-lg shadow-accent-400/50' :
                                                            'bg-orange-400 shadow-lg shadow-orange-400/50'
                                                        }`} />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Quick Navigation Cards */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                                {/* Navigate to Performance */}
                                <button
                                    onClick={() => handleSectionChange('performance')}
                                    className="group glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md p-8 hover:border-emerald-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-emerald-500/20 text-left"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-emerald-500/20 to-green-500/20 group-hover:scale-110 transition-transform">
                                            <BarChart3 className="w-6 h-6 text-emerald-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Performance Analysis</div>
                                            <div className="text-xs text-slate-300 dark:text-white/40">Margin breakdown</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-emerald-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>

                                {/* Navigate to Trends */}
                                <button
                                    onClick={() => handleSectionChange('trends')}
                                    className="group glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md p-8 hover:border-cyan-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 text-left"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-cyan-500/20 to-teal-500/20 group-hover:scale-110 transition-transform">
                                            <TrendingUp className="w-6 h-6 text-cyan-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">Trends & Growth</div>
                                            <div className="text-xs text-slate-300 dark:text-white/40">Year-over-year</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-cyan-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>

                                {/* Navigate to Statement */}
                                <button
                                    onClick={() => handleSectionChange('pl')}
                                    className="group glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-md p-8 hover:border-blue-500/40 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/20 text-left"
                                >
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="p-4 rounded-xl bg-gradient-to-br from-blue-500/20 to-indigo-500/20 group-hover:scale-110 transition-transform">
                                            <Table className="w-6 h-6 text-blue-400" />
                                        </div>
                                        <div className="flex-1">
                                            <div className="text-sm font-semibold text-slate-900 dark:text-white mb-1">P&L Statement</div>
                                            <div className="text-xs text-slate-300 dark:text-white/40">Detailed records</div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-white/20 group-hover:text-blue-400 group-hover:translate-x-1 transition-all" />
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Performance Section */}
                    {activeSection === 'performance' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-500">
                            <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-emerald-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10">
                                <div className="px-10 py-8 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-emerald-500/5 to-transparent">
                                    <div className="flex items-center gap-3 mb-2">
                                        <BarChart3 className="w-5 h-5 text-emerald-400" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Performance Analysis</h3>
                                    </div>
                                    <p className="text-xs text-slate-300 dark:text-white/50">Margin breakdown and profitability metrics</p>
                                </div>
                                <div className="p-10">
                                    <MarginBreakdown onSelect={(kind, value) => navigateToPL({ kind, value })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Pivot Section */}
                    {activeSection === 'pivot' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-500">
                            <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-purple-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-purple-500/10">
                                <div className="px-10 py-8 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent">
                                    <div className="flex items-center gap-3 mb-2">
                                        <PieChart className="w-5 h-5 text-purple-400" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Pivot Analysis</h3>
                                    </div>
                                    <p className="text-xs text-slate-300 dark:text-white/50">Multi-dimensional data breakdown</p>
                                </div>
                                <div className="p-10">
                                    <PLPivot onViewInPL={(kind, value) => navigateToPL({ kind, value })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* AR Section */}
                    {activeSection === 'ar' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-500">
                            <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-orange-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-orange-500/10">
                                <div className="px-10 py-8 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-orange-500/5 to-transparent">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Clock className="w-5 h-5 text-orange-400" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Cash Flow & AR Management</h3>
                                    </div>
                                    <p className="text-xs text-slate-300 dark:text-white/50">Accounts receivable and aging analysis</p>
                                </div>
                                <div className="p-10">
                                    <PipelineAR onViewBucket={(bucket) => navigateToPL({ kind: 'Aging', value: bucket })} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Trends Section */}
                    {activeSection === 'trends' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-500">
                            <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-cyan-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10">
                                <div className="px-10 py-8 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-cyan-500/5 to-transparent">
                                    <div className="flex items-center gap-3 mb-2">
                                        <TrendingUp className="w-5 h-5 text-cyan-400" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Trends & Growth</h3>
                                    </div>
                                    <p className="text-xs text-slate-300 dark:text-white/50">Year-over-year analysis and forecasting</p>
                                </div>
                                <div className="p-10">
                                    <TrendsAnalysis />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* P&L Section */}
                    {activeSection === 'pl' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-500">
                            <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-blue-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/10">
                                <div className="px-10 py-8 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-blue-500/5 to-transparent">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <Table className="w-5 h-5 text-blue-400" />
                                                <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Profit & Loss Detail</h3>
                                            </div>
                                            <p className="text-xs text-slate-300 dark:text-white/50">Complete financial records</p>
                                        </div>
                                        {plFilter && (
                                            <span className="px-3 py-2 rounded-lg text-xs font-medium bg-accent-500/20 text-accent-300 border border-accent-500/30 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-accent-400 animate-pulse" />
                                                {plFilter.kind}: {plFilter.value}
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="p-10">
                                    <PLTable filter={plFilter} onClearFilter={() => setPlFilter(null)} />
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Expenses Section */}
                    {activeSection === 'expenses' && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-6 duration-500">
                            <div className="glass rounded-2xl border border-slate-200 dark:border-white/10 backdrop-blur-sm overflow-hidden hover:border-red-500/20 transition-all duration-500 hover:shadow-2xl hover:shadow-red-500/10">
                                <div className="px-10 py-8 border-b border-slate-200 dark:border-white/10 bg-gradient-to-r from-transparent via-red-500/5 to-transparent">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Receipt className="w-5 h-5 text-red-400" />
                                        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">Expense Management</h3>
                                    </div>
                                    <p className="text-xs text-slate-300 dark:text-white/50">Track and categorize operational costs</p>
                                </div>
                                <div className="p-10">
                                    <ExpenseManager />
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default FinanceV5;

