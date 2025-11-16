/**
 * Universal Timeline v4.0 - Professional Event Timeline
 * 
 * Notion-style modular timeline showing all application events:
 * - Shows (concerts, performances)
 * - Travel (flights, transport)
 * - Contracts (signings, deadlines)  
 * - Finance (payments, invoices)
 * - Tasks (todos, reminders)
 * 
 * Following the app's design system - no emojis, professional styling
 */

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  MapPin, 
  FileText, 
  DollarSign, 
  CheckSquare, 
  Filter, 
  Search,
  ArrowRight,
  Clock,
  Star
} from 'lucide-react';
import { t } from '../../../lib/i18n';
import { useShows } from '../../../hooks/useShows';
import { useContractsQuery } from '../../../hooks/useContractsQuery';
import useUniversalTimelineData from '../hooks/useUniversalTimelineData';

// Types for unified timeline events
export interface UniversalTimelineEvent {
  id: string;
  type: 'show' | 'travel' | 'contract' | 'finance' | 'task';
  title: string;
  subtitle?: string;
  date: Date;
  endDate?: Date;
  status: 'planned' | 'confirmed' | 'in-progress' | 'completed' | 'cancelled' | 'overdue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  location?: string;
  amount?: number;
  currency?: string;
  metadata?: Record<string, any>;
  actions?: Array<{
    id: string;
    label: string;
    onClick: () => void;
    variant?: 'primary' | 'secondary' | 'danger';
  }>;
}

// Timeline filters
interface TimelineFilters {
  types: Set<UniversalTimelineEvent['type']>;
  statuses: Set<UniversalTimelineEvent['status']>;
  dateRange: {
    start: Date | null;
    end: Date | null;
  };
  searchQuery: string;
}

// Event type configurations
const EVENT_TYPE_CONFIG = {
  show: {
    icon: Calendar,
    color: 'accent',
    label: 'Shows'
  },
  travel: {
    icon: MapPin,
    color: 'blue', 
    label: 'Travel'
  },
  contract: {
    icon: FileText,
    color: 'purple',
    label: 'Contracts'
  },
  finance: {
    icon: DollarSign,
    color: 'amber',
    label: 'Finance'
  },
  task: {
    icon: CheckSquare,
    color: 'blue',
    label: 'Tasks'
  }
};

// Status configurations
const STATUS_CONFIG = {
  planned: { color: 'white/40', label: 'Planned' },
  confirmed: { color: 'accent-400', label: 'Confirmed' },
  'in-progress': { color: 'blue-400', label: 'In Progress' },
  completed: { color: 'accent-500', label: 'Completed' },
  cancelled: { color: 'red-400', label: 'Cancelled' },
  overdue: { color: 'red-500', label: 'Overdue' }
};

/**
 * Event Icon Component - Professional styling
 */
const EventIcon: React.FC<{ 
  type: UniversalTimelineEvent['type']; 
  status: UniversalTimelineEvent['status'];
}> = ({ type, status }) => {
  const config = EVENT_TYPE_CONFIG[type];
  const IconComponent = config.icon;
  
  return (
    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center border border-white/10 group-hover:border-accent-500/30 transition-colors">
      <IconComponent className={`w-5 h-5 text-${config.color}-400`} />
    </div>
  );
};

/**
 * Event Card Component - Following design system
 */
const TimelineEventCard: React.FC<{ 
  event: UniversalTimelineEvent; 
  isCompact?: boolean;
}> = ({ event, isCompact = false }) => {
  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const formatAmount = (amount: number, currency: string = 'EUR') => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency
    }).format(amount);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01, y: -1 }}
      className="glass rounded-xl border border-white/10 hover:border-accent-500/30 transition-all group"
    >
      <div className={`p-${isCompact ? '4' : '6'}`}>
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-start gap-3 flex-1">
            <EventIcon type={event.type} status={event.status} />
            
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h3 className="text-base font-medium text-white truncate">
                  {event.title}
                </h3>
                <div className={`px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-medium text-${STATUS_CONFIG[event.status].color} bg-${STATUS_CONFIG[event.status].color}/10 border border-${STATUS_CONFIG[event.status].color}/20`}>
                  {STATUS_CONFIG[event.status].label}
                </div>
              </div>
              
              {event.subtitle && (
                <p className="text-sm text-white/70 mb-2 truncate">
                  {event.subtitle}
                </p>
              )}
              
              <div className="flex items-center gap-4 text-xs text-white/50">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {formatDate(event.date)}
                </div>
                
                {event.location && (
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {event.location}
                  </div>
                )}
                
                {event.amount && (
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-3 h-3" />
                    {formatAmount(event.amount, event.currency)}
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {event.priority === 'critical' && (
            <Star className="w-4 h-4 text-amber-400 flex-shrink-0" />
          )}
        </div>

        {/* Actions */}
        {event.actions && event.actions.length > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t border-white/10">
            {event.actions.map((action) => (
              <button
                key={action.id}
                onClick={action.onClick}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  action.variant === 'primary' 
                    ? 'bg-accent-500 hover:bg-accent-600 text-white'
                    : action.variant === 'danger'
                    ? 'bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30'
                    : 'glass border border-white/10 hover:border-accent-500/30 text-white/70 hover:text-white'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
};

/**
 * Filter Bar Component
 */
const TimelineFilterBar: React.FC<{
  filters: TimelineFilters;
  onFiltersChange: (filters: TimelineFilters) => void;
  totalEvents: number;
  filteredEvents: number;
}> = ({ filters, onFiltersChange, totalEvents, filteredEvents }) => {
  return (
    <div className="glass rounded-xl border border-white/10 p-4 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-white/60" />
          <span className="text-sm font-medium text-white/90">Filters</span>
          <span className="text-xs text-white/50">
            {filteredEvents} of {totalEvents} events
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
          <input
            type="text"
            placeholder="Search events..."
            value={filters.searchQuery}
            onChange={(e) => onFiltersChange({
              ...filters,
              searchQuery: e.target.value
            })}
            className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-sm text-white placeholder-white/40 focus:border-accent-500/50 focus:outline-none transition-colors"
          />
        </div>
        
        {/* Type Filter */}
        <div>
          <label className="block text-[10px] uppercase tracking-wider text-white/40 font-medium mb-2">
            Event Types
          </label>
          <div className="flex flex-wrap gap-1">
            {(Object.keys(EVENT_TYPE_CONFIG) as UniversalTimelineEvent['type'][]).map((type) => (
              <button
                key={type}
                onClick={() => {
                  const newTypes = new Set(filters.types);
                  if (newTypes.has(type)) {
                    newTypes.delete(type);
                  } else {
                    newTypes.add(type);
                  }
                  onFiltersChange({ ...filters, types: newTypes });
                }}
                className={`px-2 py-1 rounded text-xs transition-colors ${
                  filters.types.has(type)
                    ? `bg-${EVENT_TYPE_CONFIG[type].color}-500/20 text-${EVENT_TYPE_CONFIG[type].color}-400 border border-${EVENT_TYPE_CONFIG[type].color}-500/30`
                    : 'bg-white/5 text-white/50 border border-white/10 hover:border-white/20'
                }`}
              >
                {EVENT_TYPE_CONFIG[type].label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Main Universal Timeline Component
 */
const UniversalTimeline: React.FC = () => {
  const { events, loading, error } = useUniversalTimelineData();
  
  // Filter state
  const [filters, setFilters] = useState<TimelineFilters>({
    types: new Set(['show', 'travel', 'contract', 'finance', 'task']),
    statuses: new Set(['planned', 'confirmed', 'in-progress', 'completed']),
    dateRange: { start: null, end: null },
    searchQuery: ''
  });

  // Apply filters
  const filteredEvents = useMemo(() => {
    return events.filter((event: UniversalTimelineEvent) => {
      // Type filter
      if (!filters.types.has(event.type)) return false;
      
      // Status filter  
      if (!filters.statuses.has(event.status)) return false;
      
      // Search filter
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        if (!event.title.toLowerCase().includes(query) && 
            !event.subtitle?.toLowerCase().includes(query) &&
            !event.location?.toLowerCase().includes(query)) {
          return false;
        }
      }
      
      // Date range filter
      if (filters.dateRange.start && event.date < filters.dateRange.start) return false;
      if (filters.dateRange.end && event.date > filters.dateRange.end) return false;
      
      return true;
    });
  }, [events, filters]);

  // Group events by date
  const groupedEvents = useMemo(() => {
    const groups: { [key: string]: UniversalTimelineEvent[] } = {};
    
    filteredEvents.forEach((event: UniversalTimelineEvent) => {
      const dateKey = event.date.toDateString();
      if (!groups[dateKey]) {
        groups[dateKey] = [];
      }
      groups[dateKey].push(event);
    });
    
    return Object.entries(groups).sort(([a], [b]) => 
      new Date(a).getTime() - new Date(b).getTime()
    );
  }, [filteredEvents]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-accent-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white/60">Loading timeline events...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-xl border border-red-500/30 p-6">
        <div className="text-center">
          <div className="w-12 h-12 bg-red-500/20 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-red-400" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">Error Loading Timeline</h3>
          <p className="text-red-400 text-sm mb-4">
            {error instanceof Error ? error.message : 'Failed to load timeline events'}
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <TimelineFilterBar
        filters={filters}
        onFiltersChange={setFilters}
        totalEvents={events.length}
        filteredEvents={filteredEvents.length}
      />
      
      {groupedEvents.length === 0 ? (
        <div className="glass rounded-xl border border-white/10 p-12 text-center">
          <Calendar className="w-12 h-12 text-white/30 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No Events Found</h3>
          <p className="text-white/60">
            {filters.searchQuery || filters.types.size < 5 
              ? 'Try adjusting your filters to see more events.'
              : 'No timeline events available. Events will appear here as you add shows, contracts, and other activities.'
            }
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groupedEvents.map(([dateKey, dayEvents]) => (
            <motion.div
              key={dateKey}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative"
            >
              {/* Date Header */}
              <div className="sticky top-0 z-10 mb-4">
                <div className="glass rounded-xl border border-white/10 p-3 inline-block">
                  <h2 className="text-sm font-medium text-white">
                    {new Intl.DateTimeFormat('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }).format(new Date(dateKey))}
                  </h2>
                  <div className="text-xs text-white/50 mt-1">
                    {dayEvents.length} event{dayEvents.length !== 1 ? 's' : ''}
                  </div>
                </div>
              </div>
              
              {/* Events for this date */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <AnimatePresence mode="popLayout">
                  {dayEvents.map((event) => (
                    <TimelineEventCard
                      key={event.id}
                      event={event}
                    />
                  ))}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export { UniversalTimeline };
export default UniversalTimeline;