import React from 'react';
import { useFilteredTimelineItems } from '../hooks/useTimelineData';
import { useTimelineStore } from '../../../shared/timelineStore';
import { t } from '../../../lib/i18n';
import { TIMELINE_COLORS, TIMELINE_ICONS, TimelineItem } from '../types';
import { Calendar, Clock, MapPin, DollarSign, User, AlertCircle } from 'lucide-react';

/**
 * Master Timeline View - Main Gantt-style timeline component
 * This is a simplified version - in production would use a proper Gantt library
 */
export default function MasterTimelineView() {
  const { filteredItems, groupedItems } = useFilteredTimelineItems();
  const viewSettings = useTimelineStore((state) => state.viewSettings);

  if (filteredItems.length === 0) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-center">
          <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            {t('timelineMaestro.empty.title')}
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            {t('timelineMaestro.empty.message')}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto">
      <div className="p-4">
        {/* Timeline Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              {t('timelineMaestro.view.title')}
            </h2>
            <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
              <span>{filteredItems.length} {t('timelineMaestro.view.items')}</span>
              <span>{viewSettings.zoom} {t('timelineMaestro.view.zoom')}</span>
            </div>
          </div>
        </div>

        {/* Timeline Content */}
        {viewSettings.groupBy === 'none' ? (
          <TimelineGrid items={filteredItems} />
        ) : (
          <div className="space-y-6">
            {Object.entries(groupedItems).map(([groupKey, items]) => (
              <div key={groupKey} className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                  {t(`timeline.groups.${groupKey}`) || groupKey}
                </h3>
                <TimelineGrid items={items} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Timeline Grid Component - Shows items in a table format
 * In production, this would be replaced with a proper Gantt chart library
 */
function TimelineGrid({ items }: { items: TimelineItem[] }) {
  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        {t('timelineMaestro.grid.empty')}
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('timelineMaestro.grid.item')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('timelineMaestro.grid.dates')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('timelineMaestro.grid.status')}
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {t('timelineMaestro.grid.details')}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {items.map((item) => (
              <TimelineRow key={item.id} item={item} />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/**
 * Timeline Row Component - Individual item row
 */
function TimelineRow({ item }: { item: TimelineItem }) {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'scheduled':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const renderDetails = () => {
    switch (item.type) {
      case 'show':
        return (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <MapPin className="w-3 h-3 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">{item.location}</span>
            </div>
            {item.budget && (
              <div className="flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">${item.budget.toLocaleString()}</span>
              </div>
            )}
          </div>
        );

      case 'travel':
        return (
          <div className="flex items-center gap-4 text-sm">
            <span className="text-gray-600 dark:text-gray-400">
              {item.origin} → {item.destination}
            </span>
            <span className="px-2 py-1 bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300 text-xs rounded">
              {item.transportType}
            </span>
          </div>
        );

      case 'finance':
        return (
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <DollarSign className="w-3 h-3 text-gray-400" />
              <span className={item.category === 'income' ? 'text-green-600' : 'text-red-600'}>
                ${Math.abs(item.amount).toLocaleString()}
              </span>
            </div>
            <span className="text-gray-600 dark:text-gray-400">
              {item.subcategory}
            </span>
          </div>
        );

      case 'task':
        return (
          <div className="flex items-center gap-4 text-sm">
            <span className={`px-2 py-1 text-xs rounded ${
              item.priority === 'critical' ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300' :
              item.priority === 'high' ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300' :
              item.priority === 'medium' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900 dark:text-yellow-300' :
              'bg-gray-100 text-gray-700 dark:bg-gray-900 dark:text-gray-300'
            }`}>
              {t(`timeline.priority.${item.priority}`)}
            </span>
            {item.assignedTo && (
              <div className="flex items-center gap-1">
                <User className="w-3 h-3 text-gray-400" />
                <span className="text-gray-600 dark:text-gray-400">{item.assignedTo}</span>
              </div>
            )}
          </div>
        );

      case 'release':
        return (
          <div className="flex items-center gap-4 text-sm">
            <span className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 text-xs rounded">
              {item.releaseType}
            </span>
            <span className="text-gray-600 dark:text-gray-400">
              {item.platforms.slice(0, 2).join(', ')}
              {item.platforms.length > 2 && ` +${item.platforms.length - 2}`}
            </span>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <tr className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
      {/* Item Info */}
      <td className="px-4 py-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-medium"
            style={{ backgroundColor: TIMELINE_COLORS[item.type] }}
          >
            {TIMELINE_ICONS[item.type]}
          </div>
          <div>
            <div className="font-medium text-gray-900 dark:text-white">
              {item.title}
            </div>
            {item.description && (
              <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">
                {item.description}
              </div>
            )}
          </div>
        </div>
      </td>

      {/* Dates */}
      <td className="px-4 py-4">
        <div className="text-sm">
          <div className="flex items-center gap-1 text-gray-900 dark:text-white">
            <Clock className="w-3 h-3 text-gray-400" />
            {formatDate(item.startDate)}
          </div>
          {item.endDate && (
            <div className="text-gray-500 dark:text-gray-400 text-xs mt-1">
              → {formatDate(item.endDate)}
            </div>
          )}
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-4">
        <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(item.status)}`}>
          {t(`timeline.status.${item.status}`)}
        </span>
      </td>

      {/* Details */}
      <td className="px-4 py-4">
        {renderDetails()}
      </td>
    </tr>
  );
}