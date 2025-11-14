import React from 'react';
import { t } from '../../lib/i18n';

interface QuickAction {
  id: string;
  icon: string;
  title: string;
  description: string;
  action: () => void;
  color: string;
  shortcut?: string;
}

interface QuickActionsProps {
  actions: QuickAction[];
}

export const QuickActions: React.FC<QuickActionsProps> = ({ actions }) => {
  return (
    <div
      className="p-6 rounded-xl border border-slate-300 dark:border-white/20 bg-slate-100 dark:bg-white/5 backdrop-blur-sm animate-slide-up"
    >
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <span className="text-lg">⚡</span>
        </div>
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('quickActions.title') || 'Quick Actions'}
          </h3>
          <p className="text-sm text-slate-400">
            {t('quickActions.subtitle') || 'Common tasks and shortcuts'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 animate-stagger">
        {actions.map((action) => (
          <button
            key={action.id}
            onClick={action.action}
            className="group p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:border-slate-300 dark:hover:border-white/20 transition-all duration-200 text-left hover-scale active-scale"
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${action.color} flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-200`}>
                <span className="text-xl">{action.icon}</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-semibold text-white group-hover:text-blue-300 transition-colors">
                    {action.title}
                  </h4>
                  {action.shortcut && (
                    <span className="text-xs text-slate-500 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 px-2 py-1 rounded">
                      {action.shortcut}
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  {action.description}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      <div
        className="mt-6 pt-4 border-t border-slate-200 dark:border-white/10 text-center animate-fade-in"
        style={{ animationDelay: '400ms' }}
      >
        <button className="px-4 py-2 text-sm font-medium bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-white/20 rounded-full transition-colors hover-lift active-scale">
          {t('quickActions.customize') || 'Customize Actions'}
        </button>
      </div>
    </div>
  );
};

// Predefined quick actions for common use cases
export const getDefaultQuickActions = (
  onAddShow: () => void,
  onViewFinance: () => void,
  onCreateMission: () => void,
  onBookTravel: () => void,
  onViewCalendar: () => void,
  onExportData: () => void
): QuickAction[] => [
  {
    id: 'add-show',
    icon: '🎭',
    title: t('quickActions.addShow') || 'Add Show',
    description: t('quickActions.addShowDesc') || 'Schedule a new performance',
    action: onAddShow,
    color: 'from-purple-500/20 to-pink-500/20',
    shortcut: 'Ctrl+N'
  },
  {
    id: 'view-finance',
    icon: '💰',
    title: t('quickActions.viewFinance') || 'View Finance',
    description: t('quickActions.viewFinanceDesc') || 'Check revenue and expenses',
    action: onViewFinance,
    color: 'from-green-500/20 to-emerald-500/20',
    shortcut: 'Ctrl+F'
  },
  {
    id: 'create-mission',
    icon: '🎯',
    title: t('quickActions.createMission') || 'Create Mission',
    description: t('quickActions.createMissionDesc') || 'Add a new task or objective',
    action: onCreateMission,
    color: 'from-orange-500/20 to-red-500/20',
    shortcut: 'Ctrl+M'
  },
  {
    id: 'book-travel',
    icon: '✈️',
    title: t('quickActions.bookTravel') || 'Book Travel',
    description: t('quickActions.bookTravelDesc') || 'Arrange transportation',
    action: onBookTravel,
    color: 'from-blue-500/20 to-cyan-500/20',
    shortcut: 'Ctrl+T'
  },
  {
    id: 'view-calendar',
    icon: '📅',
    title: t('quickActions.viewCalendar') || 'View Calendar',
    description: t('quickActions.viewCalendarDesc') || 'See upcoming events',
    action: onViewCalendar,
    color: 'from-indigo-500/20 to-purple-500/20',
    shortcut: 'Ctrl+C'
  },
  {
    id: 'export-data',
    icon: '📊',
    title: t('quickActions.exportData') || 'Export Data',
    description: t('quickActions.exportDataDesc') || 'Download reports and data',
    action: onExportData,
    color: 'from-slate-500/20 to-gray-500/20',
    shortcut: 'Ctrl+E'
  }
];
