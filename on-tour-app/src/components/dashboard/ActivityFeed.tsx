import React from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';

interface Activity {
  id: string;
  type: 'show_added' | 'finance_updated' | 'mission_completed' | 'travel_booked' | 'alert_triggered';
  title: string;
  description: string;
  timestamp: Date;
  priority?: 'high' | 'medium' | 'low';
  metadata?: Record<string, any>;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({
  activities,
  maxItems = 10
}) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'show_added': return '🎭';
      case 'finance_updated': return '💰';
      case 'mission_completed': return '✅';
      case 'travel_booked': return '✈️';
      case 'alert_triggered': return '🚨';
      default: return '📝';
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'show_added': return 'text-blue-400';
      case 'finance_updated': return 'text-green-400';
      case 'mission_completed': return 'text-emerald-400';
      case 'travel_booked': return 'text-purple-400';
      case 'alert_triggered': return 'text-red-400';
      default: return 'text-slate-400';
    }
  };

  const getPriorityBadge = (priority?: Activity['priority']) => {
    if (!priority) return null;

    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/30',
      medium: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
      low: 'bg-green-500/20 text-green-300 border-green-500/30'
    };

    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full border ${colors[priority]}`}>
        {priority.toUpperCase()}
      </span>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('activity.justNow') || 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  const recentActivities = activities
    .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
    .slice(0, maxItems);

  return (
    <div className="p-6 rounded-xl border border-slate-300 dark:border-white/20 bg-interactive backdrop-blur-sm">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
            <span className="text-lg">📋</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-theme-primary">
              {t('activity.feed.title') || 'Activity Feed'}
            </h3>
            <p className="text-sm text-slate-400">
              {t('activity.feed.subtitle') || 'Recent updates and events'}
            </p>
          </div>
        </div>
        <div className="text-sm text-slate-400">
          {recentActivities.length} {t('activity.feed.items') || 'items'}
        </div>
      </div>

      <div className="space-y-4">
        {recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-interactive flex items-center justify-center">
              <span className="text-2xl">📭</span>
            </div>
            <p className="text-slate-400">
              {t('activity.feed.empty') || 'No recent activity'}
            </p>
          </div>
        ) : (
          recentActivities.map((activity) => (
            <div
              key={activity.id}
              className={`
                group flex items-start gap-4 p-4 rounded-lg
                ${activity.priority === 'high' ? 'bg-red-500/10' : 'bg-interactive'}
                hover:bg-slate-200 dark:bg-white/10 transition-colors-fast cursor-pointer
              `}
            >
              <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                {getActivityIcon(activity.type)}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h4 className="text-sm font-medium text-slate-900 dark:text-white group-hover:text-blue-300 transition-colors-fast">
                    {activity.title}
                  </h4>
                  {getPriorityBadge(activity.priority)}
                </div>

                <p className="text-sm text-slate-400 mb-2">
                  {activity.description}
                </p>

                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {formatTimeAgo(activity.timestamp)}
                  </span>

                  {activity.metadata && (
                    <div className="flex gap-2">
                      {Object.entries(activity.metadata).map(([key, value]) => (
                        <span
                          key={key}
                          className="px-2 py-1 text-xs bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-full text-slate-300"
                        >
                          {key}: {String(value)}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {recentActivities.length > 0 && (
        <div className="mt-6 text-center">
          <button className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 rounded-full transition-colors-fast">
            {t('activity.feed.viewAll') || 'View All Activity'}
          </button>
        </div>
      )}
    </div>
  );
};

export default React.memo(ActivityFeed);
