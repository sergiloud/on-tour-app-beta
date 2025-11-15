import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useVirtualizer } from '@tanstack/react-virtual';
import { 
  Calendar, 
  DollarSign, 
  FileText, 
  Plane, 
  Users, 
  Settings, 
  Filter,
  Search,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Info
} from 'lucide-react';
import { TimelineService, type TimelineEvent, type TimelineModule, type TimelineImportance, type TimelineFilters } from '../../services/timelineService';
import { useAuth } from '../../context/AuthContext';
import { useFilteredShows } from '../../features/shows/selectors';
import { getCurrentOrgId } from '../../lib/tenants';
import { t } from '../../lib/i18n';
import { trackPageView } from '../../lib/activityTracker';
import { Card } from '../../ui/Card';
import { fadeIn, listItem } from '../../lib/animations';

// Module configuration
const MODULE_CONFIG = {
  shows: { icon: Calendar, label: 'Shows', color: 'text-emerald-400' },
  finance: { icon: DollarSign, label: 'Finance', color: 'text-green-400' },
  contracts: { icon: FileText, label: 'Contracts', color: 'text-blue-400' },
  travel: { icon: Plane, label: 'Travel', color: 'text-purple-400' },
  collaboration: { icon: Users, label: 'Collaboration', color: 'text-amber-400' },
  audit: { icon: Settings, label: 'Audit', color: 'text-gray-400' }
};

// Importance configuration
const IMPORTANCE_CONFIG = {
  critical: { icon: AlertCircle, label: 'Critical', color: 'text-red-400' },
  high: { icon: TrendingUp, label: 'High', color: 'text-amber-400' },
  medium: { icon: Info, label: 'Medium', color: 'text-blue-400' },
  low: { icon: CheckCircle2, label: 'Low', color: 'text-green-400' }
};

const TimelinePage: React.FC = () => {
  const { userId } = useAuth();
  const { shows } = useFilteredShows();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [filters, setFilters] = useState<TimelineFilters>({
    module: 'all',
    importance: 'all',
    dateRange: '30',
    searchQuery: ''
  });

  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    trackPageView('timeline');
  }, []);

  // Subscribe to real-time timeline events
  useEffect(() => {
    const orgId = getCurrentOrgId();
    if (!orgId) {
      setLoading(false);
      return;
    }

    // In development mode without Firebase, use demo data
    if (import.meta.env.DEV) {
      const demoEvents = TimelineService.generateDemoEvents(orgId, userId || 'demo', shows);
      setEvents(demoEvents);
      setLoading(false);
      return () => {};
    }

    const unsubscribe = TimelineService.subscribeToTimeline(
      orgId,
      (newEvents) => {
        setEvents(newEvents);
        setLoading(false);
      },
      filters
    );

    return () => unsubscribe();
  }, [userId, shows, filters.module, filters.importance, filters.userId, filters.showId, filters.dateRange]);

  // Apply client-side search filter
  const filteredEvents = useMemo(() => {
    if (!filters.searchQuery) return events;
    
    const query = filters.searchQuery.toLowerCase();
    return events.filter(event => 
      event.title.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query) ||
      event.userName.toLowerCase().includes(query)
    );
  }, [events, filters.searchQuery]);

  // Virtualization setup
  const rowVirtualizer = useVirtualizer({
    count: filteredEvents.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120, // Estimated row height
    overscan: 5
  });

  // Format timestamp
  const formatTimestamp = (date: Date): string => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (seconds < 60) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days === 1) return 'Yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get event icon
  const getEventIcon = (event: TimelineEvent): React.ReactNode => {
    const moduleConfig = MODULE_CONFIG[event.module];
    const Icon = moduleConfig.icon;
    return <Icon className="w-5 h-5" />;
  };

  // Get importance badge
  const getImportanceBadge = (importance: TimelineEvent['importance']): React.ReactNode => {
    const config = IMPORTANCE_CONFIG[importance];
    return (
      <span className={`text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Handle filter change
  const handleFilterChange = useCallback((key: keyof TimelineFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="mt-4 text-sm text-gray-400">{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 py-6 max-w-7xl">
      {/* Header */}
      <div className="mb-6">
        <motion.div
          variants={fadeIn}
          initial="initial"
          animate="animate"
        >
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('timeline.title')}
          </h1>
          <p className="text-gray-400">
            {t('timeline.description')}
          </p>
        </motion.div>
      </div>

      {/* Filters */}
      <Card className="mb-6 p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Module filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Filter className="inline w-4 h-4 mr-1" />
              {t('timeline.filters.module')}
            </label>
            <select
              value={filters.module}
              onChange={(e) => handleFilterChange('module', e.target.value as TimelineModule)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t('timeline.filters.allModules')}</option>
              {Object.entries(MODULE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Importance filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <AlertCircle className="inline w-4 h-4 mr-1" />
              {t('timeline.filters.importance')}
            </label>
            <select
              value={filters.importance}
              onChange={(e) => handleFilterChange('importance', e.target.value as TimelineImportance)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">{t('timeline.filters.allImportance')}</option>
              {Object.entries(IMPORTANCE_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>
          </div>

          {/* Date range filter */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Clock className="inline w-4 h-4 mr-1" />
              {t('timeline.filters.dateRange')}
            </label>
            <select
              value={filters.dateRange}
              onChange={(e) => handleFilterChange('dateRange', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="7">{t('timeline.filters.last7Days')}</option>
              <option value="30">{t('timeline.filters.last30Days')}</option>
              <option value="90">{t('timeline.filters.last90Days')}</option>
              <option value="all">{t('timeline.filters.allTime')}</option>
            </select>
          </div>

          {/* Search */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Search className="inline w-4 h-4 mr-1" />
              {t('timeline.filters.search')}
            </label>
            <input
              type="text"
              placeholder={t('timeline.filters.searchPlaceholder')}
              value={filters.searchQuery}
              onChange={(e) => handleFilterChange('searchQuery', e.target.value)}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>
      </Card>

      {/* Timeline events - virtualized */}
      <Card className="p-6">
        {filteredEvents.length === 0 ? (
          <div className="text-center py-12">
            <Info className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">{t('timeline.empty')}</p>
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-[600px] overflow-auto"
            style={{ contain: 'strict' }}
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                width: '100%',
                position: 'relative'
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const event = filteredEvents[virtualRow.index];
                if (!event) return null;
                
                const moduleConfig = MODULE_CONFIG[event.module];
                const Icon = moduleConfig.icon;

                return (
                  <motion.div
                    key={virtualRow.key}
                    variants={listItem}
                    initial="initial"
                    animate="animate"
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`
                    }}
                  >
                    <div className="flex items-start gap-4 p-4 border-b border-gray-800 hover:bg-gray-800/50 transition-colors">
                      {/* Event icon */}
                      <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center ${moduleConfig.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>

                      {/* Event details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2 mb-1">
                          <h3 className="text-white font-medium">
                            {event.title}
                            {event.isGrouped && (
                              <span className="ml-2 text-xs text-gray-500">
                                ({event.groupCount} {t('timeline.items')})
                              </span>
                            )}
                          </h3>
                          {getImportanceBadge(event.importance)}
                        </div>
                        
                        <p className="text-sm text-gray-400 mb-2">
                          {event.description}
                        </p>

                        <div className="flex items-center gap-4 text-xs text-gray-500">
                          <span>{event.userName}</span>
                          <span>•</span>
                          <span>{formatTimestamp(event.timestamp)}</span>
                          <span>•</span>
                          <span className={moduleConfig.color}>{moduleConfig.label}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default TimelinePage;
