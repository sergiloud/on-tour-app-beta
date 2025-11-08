import React, { useMemo, useState, useCallback } from 'react';
import { AlertTriangle, Clock, TrendingUp, MapPin, DollarSign, Calendar, CheckCircle2, XCircle, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card } from '../../ui/Card';
import { useFilteredShows } from '../../features/shows/selectors';
import { useMissionControl } from '../../context/MissionControlContext';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { staggerFast, listItem, fadeIn } from '../../lib/animations';

// Action priority system
type ActionPriority = 'critical' | 'high' | 'medium' | 'low';
type ActionCategory = 'urgent' | 'financial' | 'logistics' | 'opportunity';

interface SmartAction {
  id: string;
  priority: ActionPriority;
  category: ActionCategory;
  title: string;
  description: string;
  city?: string;
  date?: string;
  amount?: number;
  daysUntil?: number;
  showId?: string;
  actionText: string;
  coords?: { lng: number; lat: number };
}

const PRIORITY_CONFIG = {
  critical: {
    text: 'text-red-400',
    icon: AlertTriangle,
  },
  high: {
    text: 'text-amber-400',
    icon: AlertCircle,
  },
  medium: {
    text: 'text-blue-400',
    icon: Info,
  },
  low: {
    text: 'text-green-400',
    icon: CheckCircle2,
  }
};

const CATEGORY_CONFIG = {
  urgent: { icon: Clock, label: 'Urgent', color: 'text-red-400' },
  financial: { icon: DollarSign, label: 'Financial', color: 'text-green-400' },
  logistics: { icon: MapPin, label: 'Logistics', color: 'text-blue-400' },
  opportunity: { icon: TrendingUp, label: 'Opportunity', color: 'text-amber-400' }
};

type Kind = 'risk' | 'urgency' | 'opportunity' | 'offer' | 'finrisk';

export const ActionHub: React.FC<{ kinds?: Kind[] }> = React.memo(({ kinds }) => {
  const { shows } = useFilteredShows();
  const { setFocus } = useMissionControl();
  const { fmtMoney } = useSettings();
  const [selectedCategory, setSelectedCategory] = useState<ActionCategory | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<ActionPriority | 'all'>('all');

  // Generate smart actions from shows data
  const actions = useMemo((): SmartAction[] => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const result: SmartAction[] = [];

    // Filter to only include real shows (not Personal, Meeting, etc.)
    const realShows = shows.filter((show: any) => {
      const btnType = show.notes?.match(/__btnType:(\w+)/)?.[1];
      return !btnType || btnType === 'show'; // Include if no btnType or if btnType is 'show'
    });

    realShows.forEach((show: any) => {
      const showDate = new Date(show.date).getTime();
      const daysUntil = Math.ceil((showDate - now) / DAY);

      // Critical: Shows without contracts within 7 days
      if (show.status === 'pending' && daysUntil <= 7 && daysUntil > 0) {
        result.push({
          id: `contract-${show.id}`,
          priority: 'critical',
          category: 'urgent',
          title: 'Contract Pending',
          description: `${show.city} show needs immediate contract signature`,
          city: show.city,
          date: show.date,
          daysUntil,
          showId: show.id,
          actionText: 'Sign Contract',
          coords: { lng: show.lng, lat: show.lat }
        });
      }

      // High: Payment issues
      if (show.status === 'confirmed' && !show.depositReceived && daysUntil <= 30) {
        result.push({
          id: `deposit-${show.id}`,
          priority: 'high',
          category: 'financial',
          title: 'Deposit Outstanding',
          description: `Missing deposit payment from ${show.city}`,
          city: show.city,
          amount: show.fee * 0.5,
          daysUntil,
          showId: show.id,
          actionText: 'Request Payment',
          coords: { lng: show.lng, lat: show.lat }
        });
      }

      // Medium: Travel logistics needed
      if (show.status === 'confirmed' && daysUntil <= 14 && daysUntil > 7) {
        result.push({
          id: `travel-${show.id}`,
          priority: 'medium',
          category: 'logistics',
          title: 'Travel Arrangements',
          description: `Book travel for ${show.city} show`,
          city: show.city,
          date: show.date,
          daysUntil,
          showId: show.id,
          actionText: 'Book Travel',
          coords: { lng: show.lng, lat: show.lat }
        });
      }

      // Opportunity: High-value pending shows
      if (show.status === 'offer' && show.fee > 10000) {
        result.push({
          id: `opportunity-${show.id}`,
          priority: 'low',
          category: 'opportunity',
          title: 'High-Value Opportunity',
          description: `Potential ${fmtMoney(show.fee)} show in ${show.city}`,
          city: show.city,
          amount: show.fee,
          daysUntil,
          showId: show.id,
          actionText: 'Review Offer',
          coords: { lng: show.lng, lat: show.lat }
        });
      }
    });

    // Sort by priority then by days until
    const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
    return result.sort((a, b) => {
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }
      return (a.daysUntil || 999) - (b.daysUntil || 999);
    });
  }, [shows, fmtMoney]);

  // Filter actions
  const filteredActions = useMemo(() => {
    return actions.filter(action => {
      if (selectedCategory !== 'all' && action.category !== selectedCategory) return false;
      if (selectedPriority !== 'all' && action.priority !== selectedPriority) return false;
      return true;
    });
  }, [actions, selectedCategory, selectedPriority]);

  // Category counts
  const categoryCounts = useMemo(() => {
    return {
      all: actions.length,
      urgent: actions.filter(a => a.category === 'urgent').length,
      financial: actions.filter(a => a.category === 'financial').length,
      logistics: actions.filter(a => a.category === 'logistics').length,
      opportunity: actions.filter(a => a.category === 'opportunity').length
    };
  }, [actions]);

  const handleActionClick = useCallback((action: SmartAction) => {
    if (action.coords) {
      setFocus({
        id: action.showId || action.id,
        lng: action.coords.lng,
        lat: action.coords.lat
      });
    }
  }, [setFocus]);

  // Optimized filter handlers with useCallback
  const handleCategoryFilterAll = useCallback(() => {
    setSelectedCategory('all');
  }, []);

  const handleCategoryFilter = useCallback((cat: ActionCategory) => {
    setSelectedCategory(cat);
  }, []);

  return (
    <Card className="p-4 flex flex-col gap-4">
      {/* Header - estilo MissionHud */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base md:text-lg font-semibold tracking-tight">{t('dashboard.actionCenter')}</h2>
          {actions.filter(a => a.priority === 'critical').length > 0 && (
            <div className="flex items-center gap-1.5 mt-1">
              <AlertTriangle className="w-3 h-3 text-red-400" />
              <span className="text-xs text-red-300">
                {actions.filter(a => a.priority === 'critical').length} critical items
              </span>
            </div>
          )}
        </div>
        <span className="text-xs opacity-60">
          {filteredActions.length} items
        </span>
      </div>

      {/* Category filters - estilo tabs como MissionHud */}
      <div className="flex flex-wrap gap-2 text-sm">
        <button
          onClick={handleCategoryFilterAll}
          className={`px-3 py-1.5 rounded-md text-xs transition-all ${selectedCategory === 'all'
            ? 'bg-accent-500/20 text-accent-400'
            : 'bg-white/10 hover:bg-white/20'
            }`}
        >
          All ({categoryCounts.all})
        </button>
        {(Object.keys(CATEGORY_CONFIG) as ActionCategory[]).map(cat => {
          const config = CATEGORY_CONFIG[cat];
          const Icon = config.icon;
          const count = categoryCounts[cat];
          return (
            <button
              key={cat}
              onClick={() => handleCategoryFilter(cat)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs transition-all ${selectedCategory === cat
                ? 'bg-white/15'
                : 'bg-white/10 hover:bg-white/20'
                }`}
            >
              <Icon className={`w-3.5 h-3.5 ${config.color}`} />
              <span>{config.label}</span>
              <span className="opacity-60">({count})</span>
            </button>
          );
        })}
      </div>

      {/* Actions list */}
      <motion.div
        className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar scroll-optimize"
        variants={staggerFast}
        initial="hidden"
        animate="visible"
      >
        <AnimatePresence mode="popLayout">
          {filteredActions.length === 0 ? (
            <motion.div
              variants={fadeIn}
              initial="hidden"
              animate="visible"
              exit="hidden"
              className="flex flex-col items-center justify-center py-12 text-center"
            >
              <CheckCircle2 className="w-12 h-12 text-green-500/40 mb-3" />
              <p className="text-sm font-medium opacity-70">{t('dashboard.allCaughtUp')}</p>
              <p className="text-xs opacity-50 mt-1">{t('dashboard.noActionsRequired')}</p>
            </motion.div>
          ) : (
            filteredActions.map((action) => {
              const config = PRIORITY_CONFIG[action.priority];
              const PriorityIcon = config.icon;
              const CategoryIcon = CATEGORY_CONFIG[action.category].icon;

              return (
                <motion.div
                  key={action.id}
                  variants={listItem}
                  onClick={() => handleActionClick(action)}
                  className="border border-white/10 rounded-lg overflow-hidden cursor-pointer transition-all hover:border-white/20 hover:bg-white/5 gpu-accelerate list-item-optimize"
                >
                  {/* Header con color de prioridad */}
                  <div className={`px-3 py-2 bg-white/5 flex items-center justify-between border-l-2 ${action.priority === 'critical' ? 'border-l-red-500' :
                    action.priority === 'high' ? 'border-l-amber-500' :
                      action.priority === 'medium' ? 'border-l-blue-500' :
                        'border-l-green-500'
                    }`}>
                    <div className="flex items-center gap-2">
                      <PriorityIcon className={`w-3.5 h-3.5 ${config.text}`} />
                      <h3 className="font-semibold text-sm">{action.title}</h3>
                    </div>
                    <span className="text-xs opacity-60 uppercase font-medium">
                      {action.priority}
                    </span>
                  </div>

                  {/* Contenido */}
                  <div className="p-3">
                    {/* Description */}
                    <p className="text-sm opacity-80 mb-3">{action.description}</p>

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs opacity-70 mb-3 flex-wrap">
                      {action.city && (
                        <div className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          <span>{action.city}</span>
                        </div>
                      )}
                      {action.daysUntil !== undefined && (
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>
                            {action.daysUntil === 0 ? 'Today' :
                              action.daysUntil === 1 ? 'Tomorrow' :
                                `${action.daysUntil} days`}
                          </span>
                        </div>
                      )}
                      {action.amount && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="w-3 h-3" />
                          <span className="font-medium">{fmtMoney(action.amount)}</span>
                        </div>
                      )}
                    </div>

                    {/* Footer con categoría y acción */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-white/10 text-xs">
                        <CategoryIcon className={`w-3 h-3 ${CATEGORY_CONFIG[action.category].color}`} />
                        <span className="opacity-70">{CATEGORY_CONFIG[action.category].label}</span>
                      </div>
                      <button className="px-2.5 py-1 rounded bg-white/10 hover:bg-white/20 text-xs font-medium transition-all hover-lift">
                        {action.actionText}
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </AnimatePresence>
      </motion.div>
    </Card>
  );
});

ActionHub.displayName = 'ActionHub';

export default ActionHub;
