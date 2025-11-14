import React from 'react';
import { Calendar, Filter, Search, X } from 'lucide-react';
import { useDashboardFilters } from '../../context/DashboardContext';

export const DashboardFilters: React.FC = () => {
    const { filters, setDateRange, setStatus, setSearchQuery, resetFilters } = useDashboardFilters();
    const [searchValue, setSearchValue] = React.useState(filters.searchQuery);

    const hasActiveFilters = filters.dateRange !== '30' || filters.status !== 'all' || filters.searchQuery !== '';

    // Debounce search input
    React.useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchValue);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchValue, setSearchQuery]);

    return (
        <div
            className="mb-5 p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm"
        >
            <div className="flex flex-col md:flex-row gap-3">
                {/* Search Input */}
                <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50 pointer-events-none" />
                    <input
                        type="text"
                        value={searchValue}
                        onChange={(e) => setSearchValue(e.target.value)}
                        placeholder="Search by city, venue, or country..."
                        className="w-full pl-10 pr-10 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/30 text-sm transition-all"
                        aria-label="Search shows"
                    />
                    {searchValue && (
                        <button
                            onClick={() => setSearchValue('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded transition-colors"
                            aria-label="Clear search"
                        >
                            <X className="w-3.5 h-3.5 opacity-70" />
                        </button>
                    )}
                </div>

                {/* Date Range Filter */}
                <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 opacity-50" />
                    <select
                        value={filters.dateRange}
                        onChange={(e) => setDateRange(e.target.value as any)}
                        className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/30 text-sm transition-all cursor-pointer"
                        aria-label="Filter by date range"
                    >
                        <option value="30">Next 30 days</option>
                        <option value="60">Next 60 days</option>
                        <option value="90">Next 90 days</option>
                        <option value="all">All upcoming</option>
                    </select>
                </div>

                {/* Status Filter */}
                <div className="flex items-center gap-2">
                    <Filter className="w-4 h-4 opacity-50" />
                    <select
                        value={filters.status}
                        onChange={(e) => setStatus(e.target.value as any)}
                        className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-accent-500/50 focus:outline-none focus:ring-2 focus:ring-accent-500/30 text-sm transition-all cursor-pointer"
                        aria-label="Filter by status"
                    >
                        <option value="all">All status</option>
                        <option value="confirmed">Confirmed</option>
                        <option value="pending">Pending</option>
                        <option value="offer">Offers</option>
                    </select>
                </div>

                {/* Reset Button */}
                {hasActiveFilters && (
                    <button
                        onClick={resetFilters}
                        className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 text-xs font-medium transition-all flex items-center gap-2"
                        aria-label="Reset filters"
                    >
                        <X className="w-3.5 h-3.5" />
                        Reset
                    </button>
                )}
            </div>

            {/* Active Filters Summary */}
            {hasActiveFilters && (
                <div
                    className="mt-3 flex flex-wrap gap-2 text-xs"
                >
                    <span className="opacity-60">Active filters:</span>
                    {filters.dateRange !== '30' && (
                        <span className="px-2 py-1 rounded bg-accent-500/20 text-accent-300 border border-accent-500/30">
                            {filters.dateRange === 'all' ? 'All upcoming' : `${filters.dateRange} days`}
                        </span>
                    )}
                    {filters.status !== 'all' && (
                        <span className="px-2 py-1 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30 capitalize">
                            {filters.status}
                        </span>
                    )}
                    {filters.searchQuery && (
                        <span className="px-2 py-1 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
                            "{filters.searchQuery}"
                        </span>
                    )}
                </div>
            )}
        </div>
    );
};
