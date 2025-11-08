import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X, Filter, ChevronDown } from 'lucide-react';
import { CalendarFilter } from './AdvancedCalendarTypes';

interface AdvancedCalendarSearchProps {
  filters: CalendarFilter;
  onFiltersChange: (filters: CalendarFilter) => void;
  onClear: () => void;
}

/**
 * Advanced search and filtering component for calendar events
 * Features: text search, type filters, status filters, date range, pinned events
 */
export const AdvancedCalendarSearch: React.FC<AdvancedCalendarSearchProps> = ({
  filters,
  onFiltersChange,
  onClear,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [search, setSearch] = useState(filters.search || '');

  const handleSearchChange = (value: string) => {
    setSearch(value);
    onFiltersChange({ ...filters, search: value });
  };

  const toggleKind = (kind: 'show' | 'travel') => {
    const kinds = filters.kinds || [];
    const updated = kinds.includes(kind)
      ? kinds.filter((k) => k !== kind)
      : [...kinds, kind];
    onFiltersChange({ ...filters, kinds: updated });
  };

  const toggleStatus = (status: string) => {
    const statuses = filters.status || [];
    const updated = statuses.includes(status)
      ? statuses.filter((s) => s !== status)
      : [...statuses, status];
    onFiltersChange({ ...filters, status: updated });
  };

  const hasActiveFilters =
    search ||
    (filters.kinds?.length || 0) > 0 ||
    (filters.status?.length || 0) > 0 ||
    filters.pinned;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3"
    >
      {/* Search Bar */}
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-white/50">
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search events, cities, notes..."
          value={search}
          onChange={(e) => handleSearchChange(e.target.value)}
          className="w-full pl-10 pr-10 py-2.5 rounded-lg bg-slate-900/40 border border-white/10
            hover:border-white/20 text-white placeholder:text-white/40
            focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/20 transition"
        />
        {search && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSearchChange('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/50 hover:text-white transition"
          >
            <X size={18} />
          </motion.button>
        )}
      </div>

      {/* Filter Toggle */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpanded(!expanded)}
        className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg
          border transition ${
            expanded
              ? 'bg-accent-500/10 border-accent-500/30'
              : 'bg-white/5 border-white/10 hover:border-white/20'
          }`}
      >
        <div className="flex items-center gap-2 text-white/80">
          <Filter size={18} />
          <span className="text-sm font-medium">Filters</span>
          {hasActiveFilters && (
            <span className="ml-2 px-2 py-0.5 rounded-full bg-accent-500/20 text-accent-300 text-xs font-semibold">
              Active
            </span>
          )}
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <ChevronDown size={18} className="text-white/50" />
        </motion.div>
      </motion.button>

      {/* Expanded Filters */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="space-y-4 p-4 rounded-lg bg-slate-900/30 border border-white/10"
          >
            {/* Event Type Filter */}
            <div>
              <label className="text-xs font-semibold text-white/70 uppercase mb-2 block">
                Event Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { key: 'show', label: '🎤 Shows' },
                  { key: 'travel', label: '✈️ Travel' },
                ].map((option) => (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleKind(option.key as 'show' | 'travel')}
                    className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                      filters.kinds?.includes(option.key as any)
                        ? 'bg-accent-500/20 border border-accent-500/40 text-accent-300'
                        : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <label className="text-xs font-semibold text-white/70 uppercase mb-2 block">
                Status
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { key: 'pending', label: '⏳ Pending', color: 'yellow' },
                  { key: 'confirmed', label: '✓ Confirmed', color: 'green' },
                  { key: 'cancelled', label: '✗ Cancelled', color: 'red' },
                ].map((option) => (
                  <motion.button
                    key={option.key}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => toggleStatus(option.key)}
                    className={`px-2 py-2 rounded-lg text-xs font-medium transition ${
                      filters.status?.includes(option.key)
                        ? `bg-${option.color}-500/20 border border-${option.color}-500/40 text-${option.color}-300`
                        : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/20'
                    }`}
                  >
                    {option.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Pinned Filter */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => onFiltersChange({ ...filters, pinned: !filters.pinned })}
              className={`w-full px-3 py-2 rounded-lg text-sm font-medium transition ${
                filters.pinned
                  ? 'bg-purple-500/20 border border-purple-500/40 text-purple-300'
                  : 'bg-white/5 border border-white/10 text-white/70 hover:border-white/20'
              }`}
            >
              📌 Pinned Events Only
            </motion.button>

            {/* Clear Button */}
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onClear}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10
                  hover:border-red-500/30 text-white/70 hover:text-red-400 text-sm font-medium transition"
              >
                Clear All Filters
              </motion.button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Filters Display */}
      {hasActiveFilters && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-wrap gap-2"
        >
          {search && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full
                bg-accent-500/10 border border-accent-500/30 text-accent-300 text-xs"
            >
              <span>🔍 {search}</span>
              <button
                onClick={() => handleSearchChange('')}
                className="hover:text-accent-400 transition"
              >
                ×
              </button>
            </motion.div>
          )}

          {filters.kinds?.map((kind) => (
            <motion.div
              key={kind}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full
                bg-blue-500/10 border border-blue-500/30 text-blue-300 text-xs"
            >
              <span>{kind === 'show' ? '🎤 Show' : '✈️ Travel'}</span>
              <button
                onClick={() => toggleKind(kind)}
                className="hover:text-blue-400 transition"
              >
                ×
              </button>
            </motion.div>
          ))}

          {filters.status?.map((status) => (
            <motion.div
              key={status}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full
                bg-green-500/10 border border-green-500/30 text-green-300 text-xs"
            >
              <span>✓ {status}</span>
              <button
                onClick={() => toggleStatus(status)}
                className="hover:text-green-400 transition"
              >
                ×
              </button>
            </motion.div>
          ))}

          {filters.pinned && (
            <motion.div
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full
                bg-purple-500/10 border border-purple-500/30 text-purple-300 text-xs"
            >
              <span>📌 Pinned</span>
              <button
                onClick={() => onFiltersChange({ ...filters, pinned: false })}
                className="hover:text-purple-400 transition"
              >
                ×
              </button>
            </motion.div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
};
