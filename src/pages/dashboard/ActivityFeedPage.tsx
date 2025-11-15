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

  const getActivityIconSvg = (type: ActivityType): React.ReactNode => {
    const iconClass = "w-5 h-5";
    switch (type) {
      case 'show_added':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      case 'show_updated':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'show_deleted':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        );
      case 'finance_updated':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'contract_signed':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'travel_booked':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      case 'contact_added':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'member_invited':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
          </svg>
        );
      case 'alert_triggered':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        );
      case 'settings_changed':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };

  const getUserAvatar = (userName: string | undefined): React.ReactNode => {
    if (!userName) {
      return (
        <div className="w-8 h-8 rounded-full bg-slate-600/30 border border-slate-500/30 flex items-center justify-center">
          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
      );
    }

    const initials = userName
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);

    // Generate consistent color from name
    const hash = userName.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    const colors = [
      'bg-blue-500/20 text-blue-300 border-blue-500/30',
      'bg-purple-500/20 text-purple-300 border-purple-500/30',
      'bg-green-500/20 text-green-300 border-green-500/30',
      'bg-amber-500/20 text-amber-300 border-amber-500/30',
      'bg-pink-500/20 text-pink-300 border-pink-500/30',
      'bg-teal-500/20 text-teal-300 border-teal-500/30',
    ];
    const colorClass = colors[hash % colors.length];

    return (
      <div className={`w-8 h-8 rounded-full border flex items-center justify-center text-xs font-medium ${colorClass}`}>
        {initials}
      </div>
    );
  };

  const getActivityColor = (type: ActivityType): string => {
    const colors: Record<ActivityType, string> = {
      show_added: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      show_updated: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      show_deleted: 'bg-red-500/10 text-red-400 border-red-500/20',
      finance_updated: 'bg-green-500/10 text-green-400 border-green-500/20',
      contract_signed: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      travel_booked: 'bg-sky-500/10 text-sky-400 border-sky-500/20',
      contact_added: 'bg-teal-500/10 text-teal-400 border-teal-500/20',
      mission_completed: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      alert_triggered: 'bg-red-600/10 text-red-500 border-red-600/20',
      member_invited: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
      settings_changed: 'bg-slate-500/10 text-slate-400 border-slate-500/20'
    };
    return colors[type] || 'bg-slate-500/10 text-slate-400 border-slate-500/20';
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
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Type Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {activityTypes.map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filterType === type
                    ? 'bg-accent-500 text-white'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {type !== 'all' && <span className="w-4 h-4">{getActivityIconSvg(type as ActivityType)}</span>}
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
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-400">{t('common.loading') || 'Loading...'}</p>
            </div>
          ) : filteredActivities.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                </svg>
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
                const isLast = index === filteredActivities.length - 1;

                return (
                  <motion.div
                    key={activity.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <div className="relative">
                      {/* Timeline connector */}
                      {!isLast && (
                        <div className="absolute left-4 top-12 bottom-0 w-px bg-gradient-to-b from-slate-300 dark:from-white/10 to-transparent"></div>
                      )}

                    {/* Activity Card */}
                    <div className={`
                      group relative flex gap-3 p-3 rounded-xl border backdrop-blur-sm transition-all
                      ${activity.priority === 'high' 
                        ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                        : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-accent-500/30'
                      }
                      hover:shadow-lg cursor-pointer
                    `}>
                      {/* Icon Badge */}
                      <div className={`relative flex-shrink-0 w-8 h-8 rounded-lg border flex items-center justify-center ${getActivityColor(activity.type)}`}>
                        {getActivityIconSvg(activity.type)}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-sm font-semibold text-theme-primary group-hover:text-accent-500 transition-colors">
                            {activity.title}
                          </h3>
                          {getPriorityBadge(activity.priority)}
                        </div>

                        <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                          {activity.description}
                        </p>

                        <div className="flex items-center gap-2 text-xs">
                          {/* User Avatar */}
                          {getUserAvatar(activity.userName)}
                          
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {activity.userName || 'Unknown'}
                          </span>
                          
                          <span className="text-slate-400">•</span>
                          
                          <time 
                            className="text-slate-500 dark:text-slate-400" 
                            dateTime={activity.timestamp.toISOString()} 
                            title={formatFullDate(activity.timestamp)}
                          >
                            {formatTimeAgo(activity.timestamp)}
                          </time>

                          {activity.metadata && Object.keys(activity.metadata).length > 0 && (
                            <>
                              <span className="text-slate-400">•</span>
                              <div className="flex gap-1.5">
                                {Object.entries(activity.metadata).slice(0, 2).map(([key, value]) => (
                                  <span
                                    key={key}
                                    className="px-1.5 py-0.5 text-[10px] font-medium bg-slate-100 dark:bg-white/10 rounded text-slate-600 dark:text-slate-400"
                                  >
                                    {key}: {String(value).slice(0, 20)}
                                  </span>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
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
