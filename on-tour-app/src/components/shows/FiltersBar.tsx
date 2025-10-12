import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Show } from './SmartShowRow';

interface FiltersBarProps {
  shows: Show[];
  onFilterChange: (filteredShows: Show[]) => void;
  onSearchChange: (searchTerm: string) => void;
  onSortChange: (sortBy: string) => void;
}

interface FilterState {
  status: Show['status'][];
  priority: Show['priority'][];
  dateRange: {
    start: string;
    end: string;
  };
  ticketSalesRange: {
    min: number;
    max: number;
  };
  marginRange: {
    min: number;
    max: number;
  };
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  shows,
  onFilterChange,
  onSearchChange,
  onSortChange
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    dateRange: { start: '', end: '' },
    ticketSalesRange: { min: 0, max: 100 },
    marginRange: { min: -50, max: 50 }
  });

  const filteredShows = useMemo(() => {
    let filtered = shows.filter(show => {
      // Search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        const matchesSearch =
          show.name.toLowerCase().includes(searchLower) ||
          show.city.toLowerCase().includes(searchLower) ||
          show.venue.toLowerCase().includes(searchLower) ||
          show.country.toLowerCase().includes(searchLower);
        if (!matchesSearch) return false;
      }

      // Status filter
      if (filters.status.length > 0 && !filters.status.includes(show.status)) {
        return false;
      }

      // Priority filter
      if (filters.priority.length > 0 && !filters.priority.includes(show.priority)) {
        return false;
      }

      // Date range filter
      if (filters.dateRange.start || filters.dateRange.end) {
        const showDate = new Date(show.date);
        if (filters.dateRange.start && showDate < new Date(filters.dateRange.start)) {
          return false;
        }
        if (filters.dateRange.end && showDate > new Date(filters.dateRange.end)) {
          return false;
        }
      }

      // Ticket sales range filter
      if (show.ticketSalesPercentage < filters.ticketSalesRange.min ||
          show.ticketSalesPercentage > filters.ticketSalesRange.max) {
        return false;
      }

      // Margin range filter
      if (show.projectedMargin < filters.marginRange.min ||
          show.projectedMargin > filters.marginRange.max) {
        return false;
      }

      return true;
    });

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return new Date(a.date).getTime() - new Date(b.date).getTime();
        case 'name':
          return a.name.localeCompare(b.name);
        case 'city':
          return a.city.localeCompare(b.city);
        case 'ticketSales':
          return b.ticketSalesPercentage - a.ticketSalesPercentage;
        case 'margin':
          return b.projectedMargin - a.projectedMargin;
        case 'priority':
          const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
          return priorityOrder[b.priority] - priorityOrder[a.priority];
        default:
          return 0;
      }
    });

    return filtered;
  }, [shows, searchTerm, filters, sortBy]);

  React.useEffect(() => {
    onFilterChange(filteredShows);
  }, [filteredShows, onFilterChange]);

  React.useEffect(() => {
    onSearchChange(searchTerm);
  }, [searchTerm, onSearchChange]);

  React.useEffect(() => {
    onSortChange(sortBy);
  }, [sortBy, onSortChange]);

  const handleFilterChange = (filterType: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [filterType]: value }));
  };

  const toggleStatusFilter = (status: Show['status']) => {
    setFilters(prev => ({
      ...prev,
      status: prev.status.includes(status)
        ? prev.status.filter(s => s !== status)
        : [...prev.status, status]
    }));
  };

  const togglePriorityFilter = (priority: Show['priority']) => {
    setFilters(prev => ({
      ...prev,
      priority: prev.priority.includes(priority)
        ? prev.priority.filter(p => p !== priority)
        : [...prev.priority, priority]
    }));
  };

  const clearAllFilters = () => {
    setSearchTerm('');
    setFilters({
      status: [],
      priority: [],
      dateRange: { start: '', end: '' },
      ticketSalesRange: { min: 0, max: 100 },
      marginRange: { min: -50, max: 50 }
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (searchTerm) count++;
    if (filters.status.length > 0) count++;
    if (filters.priority.length > 0) count++;
    if (filters.dateRange.start || filters.dateRange.end) count++;
    if (filters.ticketSalesRange.min > 0 || filters.ticketSalesRange.max < 100) count++;
    if (filters.marginRange.min > -50 || filters.marginRange.max < 50) count++;
    return count;
  }, [searchTerm, filters]);

  return (
    <motion.div
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4 mb-6"
    >
      {/* Main Filter Bar */}
      <div className="flex items-center gap-4 flex-wrap">
        {/* Search */}
        <div className="flex-1 min-w-[200px]">
          <div className="relative">
            <input
              type="text"
              placeholder="Search shows, cities, venues..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 pl-10 bg-white/5 border border-white/10 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400">
              🔍
            </div>
          </div>
        </div>

        {/* Sort */}
        <div className="min-w-[150px]">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          >
            <option value="date">Sort by Date</option>
            <option value="name">Sort by Name</option>
            <option value="city">Sort by City</option>
            <option value="ticketSales">Sort by Tickets</option>
            <option value="margin">Sort by Margin</option>
            <option value="priority">Sort by Priority</option>
          </select>
        </div>

        {/* Active Filters Count */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              activeFiltersCount > 0
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-white/5 text-slate-400 border border-white/10'
            }`}
          >
            <span>Filters</span>
            {activeFiltersCount > 0 && (
              <span className="px-2 py-0.5 bg-blue-500 text-white text-xs rounded-full">
                {activeFiltersCount}
              </span>
            )}
            <span className={`transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}>
              ▼
            </span>
          </button>

          {activeFiltersCount > 0 && (
            <button
              onClick={clearAllFilters}
              className="px-3 py-2 text-slate-400 hover:text-white transition-colors"
            >
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Expanded Filters */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/10 mt-4 pt-4 space-y-6">
              {/* Status Filters */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Status</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'planned', label: 'Planned', color: 'bg-slate-500' },
                    { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-500' },
                    { value: 'on_sale', label: 'On Sale', color: 'bg-green-500' },
                    { value: 'upcoming', label: 'Upcoming', color: 'bg-amber-500' },
                    { value: 'completed', label: 'Completed', color: 'bg-emerald-500' },
                    { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500' }
                  ].map((status) => (
                    <button
                      key={status.value}
                      onClick={() => toggleStatusFilter(status.value as Show['status'])}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                        filters.status.includes(status.value as Show['status'])
                          ? `${status.color} text-white`
                          : 'bg-white/10 text-slate-400 hover:bg-white/20'
                      }`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Priority Filters */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Priority</h4>
                <div className="flex flex-wrap gap-2">
                  {[
                    { value: 'low', label: 'Low', color: 'text-slate-400' },
                    { value: 'medium', label: 'Medium', color: 'text-blue-400' },
                    { value: 'high', label: 'High', color: 'text-amber-400' },
                    { value: 'critical', label: 'Critical', color: 'text-red-400' }
                  ].map((priority) => (
                    <button
                      key={priority.value}
                      onClick={() => togglePriorityFilter(priority.value as Show['priority'])}
                      className={`px-3 py-1 rounded-full text-xs font-medium transition-colors border ${
                        filters.priority.includes(priority.value as Show['priority'])
                          ? 'border-white/50 bg-white/10 text-white'
                          : 'border-white/10 bg-white/5 text-slate-400 hover:bg-white/10'
                      }`}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Date Range */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">Date Range</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">From</label>
                    <input
                      type="date"
                      value={filters.dateRange.start}
                      onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, start: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1">To</label>
                    <input
                      type="date"
                      value={filters.dateRange.end}
                      onChange={(e) => handleFilterChange('dateRange', { ...filters.dateRange, end: e.target.value })}
                      className="w-full px-3 py-2 bg-white/5 border border-white/10 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                  </div>
                </div>
              </div>

              {/* Ticket Sales Range */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">
                  Ticket Sales: {filters.ticketSalesRange.min}% - {filters.ticketSalesRange.max}%
                </h4>
                <div className="px-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.ticketSalesRange.min}
                    onChange={(e) => handleFilterChange('ticketSalesRange', {
                      ...filters.ticketSalesRange,
                      min: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={filters.ticketSalesRange.max}
                    onChange={(e) => handleFilterChange('ticketSalesRange', {
                      ...filters.ticketSalesRange,
                      max: parseInt(e.target.value)
                    })}
                    className="w-full mt-2"
                  />
                </div>
              </div>

              {/* Margin Range */}
              <div>
                <h4 className="text-sm font-medium text-slate-300 mb-3">
                  Margin: {filters.marginRange.min}% - {filters.marginRange.max}%
                </h4>
                <div className="px-2">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={filters.marginRange.min}
                    onChange={(e) => handleFilterChange('marginRange', {
                      ...filters.marginRange,
                      min: parseInt(e.target.value)
                    })}
                    className="w-full"
                  />
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={filters.marginRange.max}
                    onChange={(e) => handleFilterChange('marginRange', {
                      ...filters.marginRange,
                      max: parseInt(e.target.value)
                    })}
                    className="w-full mt-2"
                  />
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};