import React, { useMemo, useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  AlertTriangle,
  Clock,
  TrendingUp,
  MapPin,
  DollarSign,
  Filter,
  CheckCircle,
  RefreshCw,
  Check,
  X
} from 'lucide-react';
import { useMissionControl } from '../../context/MissionControlContext';
import { useSettings } from '../../context/SettingsContext';
import { useSmartActions, type SmartAction } from '../../hooks/useSmartActions';

type ActionCategory = 'urgent' | 'financial' | 'logistics' | 'opportunity';

const PRIORITY_COLORS = {
  critical: { dot: 'bg-red-500', text: 'text-red-400', bg: 'bg-red-500/5' },
  high: { dot: 'bg-amber-500', text: 'text-amber-400', bg: 'bg-amber-500/5' },
  medium: { dot: 'bg-blue-500', text: 'text-blue-400', bg: 'bg-blue-500/5' },
  low: { dot: 'bg-green-500', text: 'text-green-400', bg: 'bg-green-500/5' }
};

const CATEGORY_ICONS = {
  urgent: Clock,
  financial: DollarSign,
  logistics: MapPin,
  opportunity: TrendingUp
};

type SortOption = 'priority' | 'date' | 'category' | 'amount';

const ActionHubProComponent: React.FC = () => {
  const { setFocus } = useMissionControl();
  const { fmtMoney } = useSettings();
  const { actions, markCompleted, unmarkCompleted, completedCount } = useSmartActions();
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory | 'all'>('all');
  const [showCompleted, setShowCompleted] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>('priority');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredAndSortedActions = useMemo(() => {
    let filtered = [...actions];

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(action => action.category === selectedCategory);
    }

    // Filter by completion status
    if (!showCompleted) {
      filtered = filtered.filter(action => !action.completed);
    }

    // Sort by selected option
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'priority': {
          const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
          const prioDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
          if (prioDiff !== 0) return prioDiff;
          return (a.daysUntil ?? 999) - (b.daysUntil ?? 999);
        }
        case 'date':
          return (a.daysUntil ?? 999) - (b.daysUntil ?? 999);
        case 'category':
          return a.category.localeCompare(b.category);
        case 'amount':
          return (b.amount ?? 0) - (a.amount ?? 0); // Descending
        default:
          return 0;
      }
    });

    return filtered;
  }, [actions, selectedCategory, showCompleted, sortBy]);

  const categoryCounts = useMemo(() => {
    const active = actions.filter(a => !a.completed);
    return {
      all: active.length,
      urgent: active.filter(a => a.category === 'urgent').length,
      financial: active.filter(a => a.category === 'financial').length,
      logistics: active.filter(a => a.category === 'logistics').length,
      opportunity: active.filter(a => a.category === 'opportunity').length
    };
  }, [actions]);

  const handleActionClick = useCallback((action: SmartAction) => {
    if (action.coords) {
      setFocus({
        lng: action.coords.lng,
        lat: action.coords.lat
      });
    }
  }, [setFocus]);

  const handleRetry = useCallback(() => {
    setIsLoading(true);
    setError(null);
    setTimeout(() => setIsLoading(false), 500);
  }, []);

  const handleCategoryClick = useCallback((cat: ActionCategory | 'all') => {
    setSelectedCategory(cat);
  }, []);

  const handleToggleCompleted = useCallback((actionId: string, isCompleted: boolean) => {
    if (isCompleted) {
      unmarkCompleted(actionId);
    } else {
      markCompleted(actionId);
    }
  }, [markCompleted, unmarkCompleted]);

  const criticalCount = actions.filter(a => a.priority === 'critical' && !a.completed).length;

  if (isLoading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-theme bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
        <div className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-5 w-32 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
              <div className="h-3 w-24 bg-interactive rounded animate-pulse" />
            </div>
            <div className="h-4 w-16 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
          </div>
          <div className="flex gap-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-8 w-24 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded-md animate-pulse" />
            ))}
          </div>
          <div className="border border-theme rounded-lg divide-y divide-slate-200 dark:divide-white/5">
            {[1, 2, 3].map(i => (
              <div key={i} className="p-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-200 dark:bg-slate-200 dark:bg-white/10 animate-pulse" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 w-48 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                    <div className="h-3 w-64 bg-interactive rounded animate-pulse" />
                  </div>
                  <div className="h-7 w-16 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-red-500/30 bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
        <div className="p-8 text-center">
          <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <h3 className="text-lg font-semibold mb-2">Failed to Load Actions</h3>
          <p className="text-sm opacity-70 mb-6">{error}</p>
          <button onClick={handleRetry} className="px-4 py-2 rounded-lg bg-accent-500/20 hover:bg-accent-500/30 border border-accent-500/30 text-sm font-medium transition-all duration-300 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-accent-500/50">
            <RefreshCw className="w-4 h-4" />
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (categoryCounts.all === 0) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-theme bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-transparent to-transparent pointer-events-none" />
        <div className="relative p-8 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-green-500/20 to-emerald-500/20 flex items-center justify-center">
            <CheckCircle className="w-8 h-8 text-green-400" />
          </div>
          <h3 className="text-lg font-semibold mb-2">All Clear!</h3>
          <p className="text-sm opacity-70">
            {completedCount > 0
              ? `Great work! ${completedCount} actions completed`
              : 'No action items require your attention right now'}
          </p>
          {completedCount > 0 && showCompleted && (
            <button
              onClick={() => setShowCompleted(false)}
              className="mt-3 text-xs text-accent-400 hover:text-accent-300 underline"
            >
              Hide completed
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-theme bg-gradient-to-br from-slate-900/50 to-slate-800/30 backdrop-blur-sm transition-all duration-300 hover:border-white/20">
      <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 via-transparent to-transparent pointer-events-none" />
      <div className="relative p-5 flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base md:text-lg font-semibold tracking-tight">Action Center</h2>
            {criticalCount > 0 && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <AlertTriangle className="w-3 h-3 text-red-400" />
                <span className="text-xs text-red-300">{criticalCount} critical</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-2 py-1 text-xs rounded bg-slate-200 dark:bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 hover:bg-slate-300 dark:bg-white/15 focus:outline-none focus:ring-2 focus:ring-accent-500/50 transition-all cursor-pointer"
              aria-label="Sort actions by"
            >
              <option value="priority">Sort: Priority</option>
              <option value="date">Sort: Date</option>
              <option value="category">Sort: Category</option>
              <option value="amount">Sort: Amount</option>
            </select>
            {completedCount > 0 && (
              <button
                onClick={() => setShowCompleted(!showCompleted)}
                className="text-xs opacity-60 hover:opacity-100 transition-opacity underline"
                aria-label={showCompleted ? 'Hide completed actions' : 'Show completed actions'}
              >
                {showCompleted ? 'Hide' : 'Show'} completed ({completedCount})
              </button>
            )}
            <span className="text-xs opacity-60">{filteredAndSortedActions.length} items</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => handleCategoryClick('all')} className={`px-4 py-2 min-h-[44px] md:min-h-0 rounded-lg text-xs font-medium transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 ${selectedCategory === 'all' ? 'bg-accent-500/20 text-accent-300 border border-accent-500/30 shadow-lg shadow-accent-500/10 focus:ring-accent-500/50' : 'bg-interactive border border-theme hover:bg-slate-200 dark:bg-white/10 hover:border-slate-300 dark:border-white/20 focus:ring-white/50'}`} aria-label={`Filter all actions, ${categoryCounts.all} items`} aria-pressed={selectedCategory === 'all'}>
            All ({categoryCounts.all})
          </button>
          {(Object.keys(CATEGORY_ICONS) as ActionCategory[]).map(cat => {
            const Icon = CATEGORY_ICONS[cat];
            const count = categoryCounts[cat];
            if (count === 0) return null;
            return (
              <button key={cat} onClick={() => handleCategoryClick(cat)} className={`flex items-center gap-2 px-4 py-2 min-h-[44px] md:min-h-0 rounded-lg text-xs font-medium transition-all duration-300 active:scale-95 focus:outline-none focus:ring-2 ${selectedCategory === cat ? 'bg-slate-300 dark:bg-white/15 border border-slate-300 dark:border-white/20 shadow-lg focus:ring-white/50' : 'bg-interactive border border-theme hover:bg-slate-200 dark:bg-white/10 hover:border-slate-300 dark:border-white/20 focus:ring-white/50'}`} aria-label={`Filter ${cat} actions, ${count} items`} aria-pressed={selectedCategory === cat}>
                <Icon className="w-3.5 h-3.5" aria-hidden="true" />
                <span className="capitalize">{cat}</span>
                <span className="ml-1 opacity-60">({count})</span>
              </button>
            );
          })}
        </div>

        <div className="border border-theme rounded-xl overflow-hidden bg-gradient-to-b from-slate-100 dark:from-white/5 to-transparent backdrop-blur-sm">
          {filteredAndSortedActions.length === 0 ? (
            <div className="p-10 text-center">
              <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-gradient-to-br from-white/10 to-slate-50 dark:to-white/5 flex items-center justify-center">
                <Filter className="w-7 h-7 opacity-50" />
              </div>
              <div className="text-sm font-medium mb-1">No {selectedCategory !== 'all' ? selectedCategory : ''} actions</div>
              <div className="text-xs opacity-60">Try selecting a different category</div>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 dark:divide-white/5">
              {filteredAndSortedActions.map((action, index) => {
                const config = PRIORITY_COLORS[action.priority];
                const CategoryIcon = CATEGORY_ICONS[action.category];
                return (
                  <div
                    key={action.id}
                    className={`group border-l-2 transition-all duration-300 hover:bg-white/8 relative overflow-hidden ${action.completed ? 'opacity-60' : ''} ${
                      action.priority === 'critical' ? 'border-l-red-500 hover:bg-red-500/5' :
                      action.priority === 'high' ? 'border-l-amber-500 hover:bg-amber-500/5' :
                      action.priority === 'medium' ? 'border-l-blue-500 hover:bg-blue-500/5' :
                      'border-l-green-500 hover:bg-green-500/5'
                    }`}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                    <div className="relative p-3.5 flex items-start gap-3">
                      {/* Checkbox */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleToggleCompleted(action.id, action.completed || false);
                        }}
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center flex-shrink-0 mt-1 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500/50 active:scale-95 ${action.completed
                          ? 'bg-accent-500 border-accent-500'
                          : 'border-white/30 hover:border-accent-400'
                          }`}
                        aria-label={action.completed ? 'Mark as incomplete' : 'Mark as complete'}
                      >
                        {action.completed && <Check className="w-3.5 h-3.5 text-theme-primary" />}
                      </button>

                      {/* Main Content */}
                      <div className="flex-1 min-w-0 py-0.5">
                        {/* Title + Priority Badge */}
                        <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                          <h3 className="font-semibold text-sm truncate group-hover:text-slate-700 dark:text-slate-700 dark:text-white/90 transition-colors">{action.title}</h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-sm uppercase tracking-wide font-medium flex-shrink-0 ${
                            action.priority === 'critical' ? 'bg-red-500/20 text-red-300' :
                            action.priority === 'high' ? 'bg-amber-500/20 text-amber-300' :
                            action.priority === 'medium' ? 'bg-blue-500/20 text-blue-300' :
                            'bg-green-500/20 text-green-300'
                          }`}>{action.priority}</span>
                        </div>

                        {/* Description */}
                        <p className="text-xs text-slate-400 dark:text-white/60 group-hover:text-slate-500 dark:text-white/70 transition-colors truncate mb-2">{action.description}</p>

                        {/* Meta Info */}
                        <div className="flex items-center gap-3 text-xs text-slate-300 dark:text-white/50 group-hover:text-slate-400 dark:text-white/60 transition-colors flex-wrap">
                          {action.city && (
                            <div className="flex items-center gap-1.5">
                              <MapPin className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{action.city}</span>
                            </div>
                          )}
                          {action.daysUntil !== undefined && (
                            <div className="flex items-center gap-1.5">
                              <Clock className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium">{action.daysUntil === 0 ? 'Today' : action.daysUntil === 1 ? 'Tomorrow' : `${action.daysUntil}d`}</span>
                            </div>
                          )}
                          {action.amount && (
                            <div className="flex items-center gap-1.5">
                              <DollarSign className="w-3 h-3 flex-shrink-0" />
                              <span className="font-medium">{fmtMoney(action.amount)}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0 pt-1">
                        {/* Category Icon */}
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200 ${
                          action.priority === 'critical' ? 'bg-red-500/20 text-red-400' :
                          action.priority === 'high' ? 'bg-amber-500/20 text-amber-400' :
                          action.priority === 'medium' ? 'bg-blue-500/20 text-blue-400' :
                          'bg-green-500/20 text-green-400'
                        } group-hover:scale-110`}>
                          <CategoryIcon className="w-3.5 h-3.5" aria-hidden="true" />
                        </div>

                        {/* Action Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleActionClick(action);
                          }}
                          className="px-3 py-1.5 min-h-[44px] md:min-h-0 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-accent-500/20 hover:border-accent-500/30 border border-theme text-xs font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-500/50 active:scale-95 whitespace-nowrap"
                          aria-label={`${action.actionText} for ${action.city || action.title}`}
                          disabled={action.completed}
                        >
                          {action.actionText}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Memoized export para evitar re-renders innecesarios
export const ActionHubPro = React.memo(ActionHubProComponent);

export default ActionHubPro;
