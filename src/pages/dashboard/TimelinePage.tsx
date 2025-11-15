import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TimelineService, type TimelineEvent, type TimelineEventType, type TimelineFilters } from '../../services/timelineService';
import { useAuth } from '../../context/AuthContext';
import { getCurrentOrgId } from '../../lib/tenants';
import { t } from '../../lib/i18n';
import { trackPageView } from '../../lib/activityTracker';

const TimelinePage: React.FC = () => {
  const { userId } = useAuth();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterModule, setFilterModule] = useState<'all' | string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    trackPageView('timeline');
  }, []);

  // Subscribe to real-time timeline events
  useEffect(() => {
    const orgId = getCurrentOrgId();
    
    if (!orgId || orgId === '') {
      setLoading(false);
      return;
    }

    const unsubscribe = TimelineService.subscribeToTimeline(
      orgId,
      (newEvents) => {
        setEvents(newEvents);
        setLoading(false);
      },
      {
        module: filterModule === 'all' ? undefined : (filterModule as any),
        searchQuery
      }
    );

    return () => unsubscribe();
  }, [userId, filterModule, searchQuery]);

  const getEventIconSvg = (type: TimelineEventType): React.ReactNode => {
    const iconClass = "w-4 h-4";
    
    // Shows module icons
    if (type.startsWith('show_')) {
      if (type === 'show_added') {
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        );
      }
      if (type === 'show_updated') {
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      }
      if (type === 'show_confirmed' || type === 'show_cancelled') {
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      }
    }
    
    // Finance module icons
    if (type.startsWith('transaction_') || type.startsWith('expense_') || type.startsWith('payment_')) {
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
    }
    
    // Contract icons
    if (type.startsWith('contract_')) {
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    }
    
    // Travel icons
    if (type.startsWith('travel_') || type.startsWith('accommodation_')) {
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
        </svg>
      );
    }
    
    // Collaboration icons
    if (type.startsWith('member_') || type.startsWith('comment_') || type.startsWith('task_')) {
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    }
    
    // Settings/audit icons
    if (type.startsWith('settings_') || type.startsWith('permission_')) {
      return (
        <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
      );
    }
    
    // Default icon
    return (
      <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
    );
  };

  const getUserAvatar = (userName: string | undefined): React.ReactNode => {
    if (!userName) {
      return (
        <div className="w-6 h-6 rounded-full bg-slate-600/30 border border-slate-500/30 flex items-center justify-center">
          <svg className="w-3 h-3 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
      <div className={`w-6 h-6 rounded-full border flex items-center justify-center text-[10px] font-medium ${colorClass}`}>
        {initials}
      </div>
    );
  };

  const getEventColor = (type: TimelineEventType): string => {
    if (type.startsWith('show_')) return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    if (type.startsWith('transaction_') || type.startsWith('expense_') || type.startsWith('payment_')) 
      return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (type.startsWith('contract_')) return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    if (type.startsWith('travel_') || type.startsWith('accommodation_')) 
      return 'bg-sky-500/10 text-sky-400 border-sky-500/20';
    if (type.startsWith('member_') || type.startsWith('comment_') || type.startsWith('task_')) 
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (type.startsWith('settings_') || type.startsWith('permission_')) 
      return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    
    return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
  };

  const getImportanceBadge = (importance?: 'critical' | 'high' | 'medium' | 'low') => {
    if (!importance) return null;

    const colors = {
      critical: 'bg-red-500/20 text-red-300 border-red-500/40',
      high: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
      medium: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
      low: 'bg-green-500/20 text-green-300 border-green-500/40'
    };

    return (
      <span className={`px-2 py-0.5 text-[10px] font-semibold uppercase rounded border ${colors[importance]}`}>
        {importance}
      </span>
    );
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
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

  // Filter events
  const filteredEvents = events.filter(event => {
    const matchesModule = filterModule === 'all' || event.module === filterModule;
    const matchesSearch = searchQuery === '' || 
      event.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      event.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (event.userName && event.userName.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesModule && matchesSearch;
  });

  const modules: ('all' | string)[] = [
    'all',
    'shows',
    'finance',
    'contracts',
    'travel',
    'collaboration',
    'audit'
  ];

  const getModuleLabel = (module: string): string => {
    if (module === 'all') return 'All';
    return module.charAt(0).toUpperCase() + module.slice(1);
  };

  const getModuleIcon = (module: string): React.ReactNode => {
    const iconClass = "w-4 h-4";
    
    switch (module) {
      case 'shows':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'finance':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'contracts':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      case 'travel':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        );
      case 'collaboration':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
        );
      case 'audit':
        return (
          <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-theme-background p-4 sm:p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-theme-primary mb-2">
            {t('timeline.title') || 'Organization Timeline'}
          </h1>
          <p className="text-sm text-slate-400">
            {t('timeline.subtitle') || 'Real-time activity across all modules'}
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-6 space-y-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search timeline events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-3 pl-10 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 text-theme-primary placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent-500/50"
            />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>

          {/* Module Filters */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {modules.map((module) => (
              <button
                key={module}
                onClick={() => setFilterModule(module)}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                  filterModule === module
                    ? 'bg-accent-500 text-white'
                    : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10'
                }`}
              >
                {module !== 'all' && getModuleIcon(module)}
                {getModuleLabel(module)}
              </button>
            ))}
          </div>

          {/* Results Count */}
          <div className="text-sm text-slate-400">
            {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-2">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-4 border-accent-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-slate-400">Loading timeline...</p>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center">
                <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-lg font-medium text-theme-primary mb-1">
                No events found
              </p>
              <p className="text-sm text-slate-400">
                {searchQuery || filterModule !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Events will appear here as your team works'}
              </p>
            </div>
          ) : (
            <AnimatePresence mode="popLayout">
              {filteredEvents.map((event, index) => {
                const isLast = index === filteredEvents.length - 1;

                return (
                  <motion.div
                    key={event.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2, delay: index * 0.02 }}
                  >
                    <div className="relative">
                      {/* Notion-style Timeline connector */}
                      {!isLast && (
                        <div className="absolute left-[18px] top-12 bottom-0 w-px bg-gradient-to-b from-slate-300 dark:from-white/10 to-transparent"></div>
                      )}

                      {/* Event Card */}
                      <div className={`
                        group relative flex gap-3 p-3 rounded-xl border backdrop-blur-sm transition-all
                        ${event.importance === 'critical' 
                          ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                          : 'bg-white dark:bg-white/5 border-slate-200 dark:border-white/10 hover:border-accent-500/30'
                        }
                        hover:shadow-lg cursor-pointer
                      `}>
                        {/* Icon Badge */}
                        <div className={`relative flex-shrink-0 w-9 h-9 rounded-lg border flex items-center justify-center ${getEventColor(event.type)}`}>
                          {getEventIconSvg(event.type)}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="text-sm font-semibold text-theme-primary group-hover:text-accent-500 transition-colors">
                              {event.title}
                            </h3>
                            {getImportanceBadge(event.importance)}
                          </div>

                          <p className="text-xs text-slate-600 dark:text-slate-400 mb-2">
                            {event.description}
                          </p>

                          <div className="flex items-center gap-2 text-xs">
                            {/* User Avatar */}
                            {getUserAvatar(event.userName)}
                            
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {event.userName || 'System'}
                            </span>
                            
                            <span className="text-slate-400">•</span>
                            
                            <time 
                              className="text-slate-500 dark:text-slate-400" 
                              dateTime={event.timestamp.toISOString()} 
                              title={formatFullDate(event.timestamp)}
                            >
                              {formatTimeAgo(event.timestamp)}
                            </time>

                            {event.metadata && Object.keys(event.metadata).length > 0 && (
                              <>
                                <span className="text-slate-400">•</span>
                                <div className="flex gap-1.5">
                                  {Object.entries(event.metadata).slice(0, 2).map(([key, value]) => (
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
        {!loading && filteredEvents.length >= 50 && (
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

export default TimelinePage;
