import React from 'react';
import { useFinance } from '../../../context/FinanceContext';
import { useSettings } from '../../../context/SettingsContext';
import { loadExpenses } from '../../../lib/expenses';

/**
 * Finance Hero - Simplified Header
 * Only shows period and YTD summary (includes expenses from ExpenseManager)
 */
export const FinanceHero: React.FC = () => {
    const { snapshot } = useFinance();
    const { fmtMoney } = useSettings();

    // Calculate total expenses including those from ExpenseManager
    const expensesFromManager = React.useMemo(() => {
        const expenses = loadExpenses();
        const currentYear = new Date().getFullYear();
        return expenses
            .filter(e => e.date.startsWith(String(currentYear)))
            .reduce((sum, e) => sum + e.amount, 0);
    }, []);

    const yearRevenue = snapshot?.year?.income || 0;
    const yearCostsFromShows = snapshot?.year?.expenses || 0;
    const yearCosts = yearCostsFromShows + expensesFromManager;
    const yearNet = yearRevenue - yearCosts;
    const period = snapshot?.month?.start || 'Current Period';

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Period Header - Dashboard Style */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm px-6 py-4 bg-gradient-to-r from-transparent via-white/5 to-transparent hover:border-slate-300 dark:hover:border-white/20 transition-all duration-300">
                <div className="flex items-center gap-3">
                    <div className="w-1 h-6 rounded-full bg-gradient-to-b from-accent-500 to-blue-500" />
                    <div>
                        <div className="text-xs font-medium text-slate-400 dark:text-white/40 uppercase tracking-wider mb-0.5">
                            Current Period
                        </div>
                        <div className="text-lg font-semibold tracking-tight text-slate-700 dark:text-white/90">
                            {period}
                        </div>
                    </div>
                </div>
            </div>

            {/* Year Summary - Dashboard Style with glassmorphism */}
            <div className="glass rounded-xl border border-slate-200 dark:border-white/10 backdrop-blur-sm shadow-lg overflow-hidden hover:border-slate-300 dark:hover:border-white/20 hover:shadow-xl hover:shadow-accent-500/5 transition-all duration-300">
                <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-200 dark:divide-white/10">
                    {/* Revenue Card */}
                    <div className="group relative p-6 lg:p-8 text-center transition-all duration-300 hover:bg-gradient-to-br hover:from-slate-100 dark:from-white/5 hover:to-transparent cursor-default">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                            <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-medium group-hover:text-slate-400 dark:text-white/60 transition-colors">
                                YTD Revenue
                            </div>
                            <div className="text-2xl lg:text-3xl font-light text-white tabular-nums tracking-tight">
                                {fmtMoney(yearRevenue)}
                            </div>
                        </div>
                    </div>

                    {/* Costs Card */}
                    <div className="group relative p-6 lg:p-8 text-center transition-all duration-300 hover:bg-gradient-to-br hover:from-slate-100 dark:from-white/5 hover:to-transparent cursor-default">
                        <div className="absolute inset-0 bg-gradient-to-br from-orange-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                            <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-medium group-hover:text-slate-400 dark:text-white/60 transition-colors">
                                YTD Costs
                            </div>
                            <div className="text-2xl lg:text-3xl font-light text-white tabular-nums tracking-tight">
                                {fmtMoney(yearCosts)}
                            </div>
                        </div>
                    </div>

                    {/* Net Card */}
                    <div className="group relative p-6 lg:p-8 text-center transition-all duration-300 hover:bg-gradient-to-br hover:from-accent-500/10 hover:to-blue-500/5 cursor-default">
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-500/10 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className="relative">
                            <div className="text-xs text-slate-400 dark:text-white/40 uppercase tracking-wider mb-3 font-medium group-hover:text-accent-300 transition-colors">
                                YTD Net
                            </div>
                            <div className="text-2xl lg:text-3xl font-light text-accent-400 tabular-nums tracking-tight group-hover:text-accent-300 transition-all duration-300 group-hover:scale-105">
                                {fmtMoney(yearNet)}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FinanceHero;
