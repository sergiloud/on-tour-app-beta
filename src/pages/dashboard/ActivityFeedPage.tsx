import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FirestoreActivityService, type Activity, type ActivityType } from '../../services/firestoreActivityService';
import { useAuth } from '../../context/AuthContext';
import { getCurrentOrgId } from '../../lib/tenants';
import { t } from '../../lib/i18n';
import { trackPageView } from '../../lib/activityTracker';

const ActivityFeedPage: React.FC = () => {
  const { userId } = useAuth();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterType, setFilterType] = useState<ActivityType | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    trackPageView('activity-feed');
  }, []);

  // Subscribe to real-time activity feed
  useEffect(() => {
    const orgId = getCurrentOrgId();
    if (!orgId) {
      setLoading(false);
      return;
    }

    const unsubscribe = FirestoreActivityService.subscribeToActivities(
      orgId,
      (newActivities) => {
        setActivities(newActivities);
        setLoading(false);
      },
      {
        maxItems: 200 // Load more activities for full feed
      }
    );

    return () => unsubscribe();
  }, []);

  const getActivityIcon = (type: ActivityType): string => {
    const icons: Record<ActivityType, string> = {
      show_added: '🎭',
      show_updated: '✏️',
      show_deleted: '🗑️',
      finance_updated: '💰',
      contract_signed: '📝',
      travel_booked: '✈️',
      contact_added: '👤',
      mission_completed: '✅',
      alert_triggered: '🚨',
      member_invited: '👋',
      settings_changed: '⚙️'
    };
    return icons[type] || '📋';
  };

  const getActivityColor = (type: ActivityType): string => {
    const colors: Record<ActivityType, string> = {
      show_added: 'from-blue-500/20 to-blue-600/20',
      show_updated: 'from-amber-500/20 to-amber-600/20',
      show_deleted: 'from-red-500/20 to-red-600/20',
      finance_updated: 'from-green-500/20 to-green-600/20',
      contract_signed: 'from-purple-500/20 to-purple-600/20',
      travel_booked: 'from-sky-500/20 to-sky-600/20',
      contact_added: 'from-teal-500/20 to-teal-600/20',
      mission_completed: 'from-emerald-500/20 to-emerald-600/20',
      alert_triggered: 'from-red-600/20 to-red-700/20',
      member_invited: 'from-indigo-500/20 to-indigo-600/20',
      settings_changed: 'from-slate-500/20 to-slate-600/20'
    };
    return colors[type] || 'from-slate-500/20 to-slate-600/20';
  };

  const getPriorityBadge = (priority?: 'high' | 'medium' | 'low') => {
    if (!priority) return null;

    const colors = {
      high: 'bg-red-500/20 text-red-300 border-red-500/40',
      medium: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      low: 'bg-green-500/20 text-green-300 border-green-500/40'
    };

    return (
      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded border ${colors[priority]}`}>
        {priority}
      </span>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return t('activity.justNow') || 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    if (diffInMinutes < 10080) return `${Math.floor(diffInMinutes / 1440)}d ago`;
    return `${Math.floor(diffInMinutes / 10080)}w ago`;
  };

  const formatFullDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Filter activities
  const filteredActivities = activities.filter(activity => {
    const matchesType = filterType === 'all' || activity.type === filterType;
    const matchesSearch = searchQuery === '' || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.userName.toLowerCase().includes(searchQuery.toLowerCase());
    
    return matchesType && matchesSearch;
  });

  const activityTypes: (ActivityType | 'all')[] = [
    'all',
    'show_added',
    'show_updated',
    'finance_updated',
    'contract_signed',
    'travel_booked',
    'contact_added',
    'member_invited'
  ];

  const getTypeLabel = (type: ActivityType | 'all'): string => {
    if (type === 'all') return 'All';
    return type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
  };

  return (
    <div className="min-h-screen bg-theme-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
              <span className="text-2xl">📋</span>
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary">
                {t('activity.feed.title') || 'Activity Feed'}
              </h1>
              <p className="text-sm text-slate-400">
                {t('activity.feed.subtitle') || 'Team activity and updates'}
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder={t('activity.feed.search') || 'Search activities...'}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-theme-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
            />
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {activityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === type
                    ? 'bg-accent-500 text-white'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {type !== 'all' && <span className="mr-1.5">{getActivityIcon(type as ActivityType)}</span>}
                {getTypeLabel(type)}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-sm text-slate-400">
            {filteredActivities.length} {filteredActivities.length === 1 ? 'activity' : 'activities'}
          </div>
        </div>

        {/* Activity Timeline */}
        <div className="space-y-3">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-400">{t('common.loading') || 'Loading...'}</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <span className="text-4xl">📭</span>
              </div>
              <p className="text-lg font-medium text-theme-primary mb-1">
                {t('activity.feed.empty') || 'No activities found'}
              </p>
              <p className="text-sm text-slate-400">
                {searchQuery || filterType !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Activity will appear here as your team works'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredActivities.map((activity, index) => {
                const activityClassName = `
                  group relative flex gap-4 p-4 rounded-xl border backdrop-blur-sm transition-all
                  ${activity.priority === 'high' 
                    ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                    : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-accent-500/40'
                  }
                  hover:shadow-lg cursor-pointer
                `;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <div className={activityClassName}>
                  {/* Icon */}
                  <div className={`flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br ${getActivityColor(activity.type)} flex items-center justify-center text-xl`}>
                    {getActivityIcon(activity.type)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h3 className="text-base font-semibold text-theme-primary group-hover:text-accent-500 transition-colors">
                        {activity.title}
                      </h3>
                      {getPriorityBadge(activity.priority)}
                    </div>

                    <p className="text-sm text-slate-600 dark:text-slate-300 mb-2">
                      {activity.description}
                    </p>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <div className="flex items-center gap-3">
                        <span className="font-medium">{activity.userName}</span>
                        <span>•</span>
                        <time dateTime={activity.timestamp.toISOString()} title={formatFullDate(activity.timestamp)}>
                          {formatTimeAgo(activity.timestamp)}
                        </time>
                      </div>

                      {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                        <div className="flex gap-2">
                          {Object.entries(activity.metadata).slice(0, 2).map(([key, value]) => (
                            <span
                              key={key}
                              className="px-2 py-0.5 text-[10px] bg-slate-100 dark:bg-white/10 rounded text-slate-500 dark:text-slate-400"
                            >
                              {key}: {String(value)}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          )}
        </div>

        {/* Load More - Future Enhancement */}
        {!loading && filteredActivities.length >= 50 && (
          <div className="mt-6 text-center">
            <button className="px-6 py-3 rounded-xl bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-theme-primary font-medium transition-colors">
              {t('common.loadMore') || 'Load More'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityFeedPage;
