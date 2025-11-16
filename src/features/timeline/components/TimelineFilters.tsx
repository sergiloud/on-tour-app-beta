import React from 'react';
import { useTimelineFilters, useTimelineMetrics } from '../hooks/useTimelineData';
import { t } from '../../../lib/i18n';
import { TIMELINE_COLORS, TIMELINE_ICONS } from '../types';
import { Calendar, Users, DollarSign, CheckSquare, Music } from 'lucide-react';

/**
 * Timeline Filters - Sidebar component for filtering timeline data
 */
export default function TimelineFilters() {
  const {
    filters,
    viewSettings,
    toggleType,
    toggleStatus,
    setDateRange,
    setSearchQuery,
    resetFilters,
  } = useTimelineFilters();

  const metrics = useTimelineMetrics();

  return (
    <div className="space-y-6">
      {/* Search */}
      <div>
        <label htmlFor="timeline-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {t('timelineMaestro.filters.search')}
        </label>
        <input
          id="timeline-search"
          type="text"
          value={filters.searchQuery || ''}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t('timelineMaestro.filters.searchPlaceholder')}
          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-accent-500"
        />
      </div>

      {/* Entity Types */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('timelineMaestro.filters.types')}
        </h3>
        <div className="space-y-2">
          {(['show', 'travel', 'finance', 'task', 'release'] as const).map((type) => (
            <label key={type} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.types.has(type)}
                onChange={() => toggleType(type)}
                className="w-4 h-4 text-accent-500 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500"
              />
              <div className="flex items-center gap-2 flex-1">
                <span className="text-lg">{TIMELINE_ICONS[type]}</span>
                <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white">
                  {t(`timeline.types.${type}`)}
                </span>
                <span 
                  className="w-3 h-3 rounded-full ml-auto"
                  style={{ backgroundColor: TIMELINE_COLORS[type] }}
                />
              </div>
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-auto">
                {metrics.byType[type] || 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Status Filters */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('timelineMaestro.filters.status')}
        </h3>
        <div className="space-y-2">
          {(['draft', 'scheduled', 'active', 'completed', 'cancelled'] as const).map((status) => (
            <label key={status} className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                checked={filters.statuses.has(status)}
                onChange={() => toggleStatus(status)}
                className="w-4 h-4 text-accent-500 border-gray-300 dark:border-gray-600 rounded focus:ring-accent-500"
              />
              <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white flex-1">
                {t(`timeline.status.${status}`)}
              </span>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {metrics.byStatus[status] || 0}
              </span>
            </label>
          ))}
        </div>
      </div>

      {/* Date Range */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('timelineMaestro.filters.dateRange')}
        </h3>
        <div className="space-y-3">
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              {t('timelineMaestro.filters.startDate')}
            </label>
            <input
              type="date"
              value={filters.dateRange?.start.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                if (e.target.value && filters.dateRange) {
                  setDateRange(new Date(e.target.value), filters.dateRange.end);
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
          <div>
            <label className="block text-xs text-gray-600 dark:text-gray-400 mb-1">
              {t('timelineMaestro.filters.endDate')}
            </label>
            <input
              type="date"
              value={filters.dateRange?.end.toISOString().split('T')[0] || ''}
              onChange={(e) => {
                if (e.target.value && filters.dateRange) {
                  setDateRange(filters.dateRange.start, new Date(e.target.value));
                }
              }}
              className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-accent-500"
            />
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
          {t('timelineMaestro.filters.quickStats')}
        </h3>
        <div className="space-y-2 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {t('timelineMaestro.stats.total')}
            </span>
            <span className="font-medium text-gray-900 dark:text-white">
              {metrics.totalItems}
            </span>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-gray-600 dark:text-gray-400">
              {t('timelineMaestro.stats.upcoming')}
            </span>
            <span className="font-medium text-blue-600 dark:text-blue-400">
              {metrics.upcoming}
            </span>
          </div>
          
          {metrics.overdueTasks > 0 && (
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t('timelineMaestro.stats.overdue')}
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                {metrics.overdueTasks}
              </span>
            </div>
          )}
          
          <div className="pt-2 border-t border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t('timelineMaestro.stats.revenue')}
              </span>
              <span className="font-medium text-green-600 dark:text-green-400">
                ${metrics.finances.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600 dark:text-gray-400">
                {t('timelineMaestro.stats.expenses')}
              </span>
              <span className="font-medium text-red-600 dark:text-red-400">
                ${metrics.finances.totalExpenses.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Reset Button */}
      <button
        onClick={resetFilters}
        className="w-full px-4 py-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white border border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500 rounded-lg transition-colors"
      >
        {t('timelineMaestro.filters.reset')}
      </button>
    </div>
  );
}