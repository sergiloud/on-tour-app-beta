import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, Plus, MoreVertical, ArrowLeft } from 'lucide-react';
import { usePullToRefresh } from '../../../../../hooks/usePullToRefresh';
import { haptic } from '../../../../../lib/haptics';

interface AppLayoutProps {
  title: string;
  subtitle?: string;
  children: ReactNode;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  onRefresh?: () => Promise<void>;
  headerActions?: ReactNode;
  showAddButton?: boolean;
  onAdd?: () => void;
  showFilterButton?: boolean;
  onFilter?: () => void;
  showBackButton?: boolean;
  onBack?: () => void;
  tabs?: Array<{ id: string; label: string; count?: number }>;
  activeTab?: string;
  onTabChange?: (tabId: string) => void;
  isRefreshing?: boolean;
  stats?: Array<{ label: string; value: string | number; color?: string }>;
}

export const AppLayout: React.FC<AppLayoutProps> = ({
  title,
  subtitle,
  children,
  searchPlaceholder = 'Buscar...',
  searchValue = '',
  onSearchChange,
  onRefresh,
  headerActions,
  showAddButton = false,
  onAdd,
  showFilterButton = false,
  onFilter,
  showBackButton = false,
  onBack,
  tabs,
  activeTab,
  onTabChange,
  isRefreshing: externalRefreshing,
  stats,
}) => {
  const handleRefresh = async () => {
    if (onRefresh) {
      await onRefresh();
    }
    haptic('success');
  };

  const { isRefreshing: internalRefreshing } = usePullToRefresh({ 
    onRefresh: onRefresh || (async () => {})
  });

  const isRefreshing = externalRefreshing ?? (onRefresh ? internalRefreshing : false);

  return (
    <div className="h-full bg-gradient-to-b from-gray-900 via-gray-900 to-black text-white flex flex-col">
      {/* Header - Desktop Style */}
      <div className="px-5 pt-5 pb-4 border-b border-white/10 bg-gray-900/60 backdrop-blur-xl">
        {/* Title Row */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            {showBackButton && onBack && (
              <button
                onClick={() => {
                  onBack();
                  haptic('light');
                }}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <div>
              <h1 className="text-xl font-bold tracking-tight">{title}</h1>
              {subtitle && (
                <p className="text-xs text-white/50 mt-0.5">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            {headerActions}
            {showFilterButton && onFilter && (
              <button
                onClick={() => {
                  onFilter();
                  haptic('light');
                }}
                className="w-9 h-9 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Filter className="w-4 h-4" />
              </button>
            )}
            {showAddButton && onAdd && (
              <button
                onClick={() => {
                  onAdd();
                  haptic('light');
                }}
                className="w-9 h-9 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center transition-colors shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Stats Row - Desktop Style */}
        {stats && stats.length > 0 && (
          <div className="grid grid-cols-3 gap-2 mb-4">
            {stats.map((stat, index) => (
              <div
                key={index}
                className="bg-white/5 rounded-lg px-3 py-2 border border-white/10"
              >
                <div className="text-[10px] text-white/50 uppercase tracking-wider font-medium mb-0.5">
                  {stat.label}
                </div>
                <div className={`text-sm font-bold ${stat.color || 'text-white'}`}>
                  {stat.value}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Search Bar - Desktop Style */}
        {onSearchChange && (
          <div className="relative mb-3">
            <input
              type="text"
              placeholder={searchPlaceholder}
              value={searchValue}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 pl-10 text-sm text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-transparent transition-all"
            />
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-white/40" />
          </div>
        )}

        {/* Tabs - Desktop Style */}
        {tabs && tabs.length > 0 && (
          <div className="flex gap-1.5 overflow-x-auto no-scrollbar -mx-1 px-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  onTabChange?.(tab.id);
                  haptic('selection');
                }}
                className={`px-3.5 py-1.5 rounded-md whitespace-nowrap transition-all text-xs font-medium ${
                  activeTab === tab.id
                    ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/20'
                    : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white/80'
                }`}
              >
                {tab.label}
                {tab.count !== undefined && (
                  <span className={`ml-1.5 px-1.5 py-0.5 rounded text-[10px] ${
                    activeTab === tab.id
                      ? 'bg-white/20'
                      : 'bg-white/10'
                  }`}>
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Refresh Indicator - Subtle */}
      {isRefreshing && (
        <div className="text-center py-2 bg-blue-500/10 border-b border-blue-500/20">
          <div className="inline-flex items-center gap-2 text-xs text-blue-400">
            <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin" />
            <span>Actualizando...</span>
          </div>
        </div>
      )}

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
};

// Empty State Component - Desktop Style
interface EmptyStateProps {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
}) => {
  return (
    <div className="flex flex-col items-center justify-center h-full px-6 py-16 text-center">
      <div className="w-14 h-14 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-white/30" />
      </div>
      <h3 className="text-base font-semibold text-white/70 mb-1.5">{title}</h3>
      {description && (
        <p className="text-xs text-white/40 mb-6 max-w-sm leading-relaxed">{description}</p>
      )}
      {action && (
        <button
          onClick={() => {
            action.onClick();
            haptic('light');
          }}
          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 rounded-lg text-sm font-semibold transition-colors shadow-lg shadow-blue-500/20"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

// Card Component - Desktop Style
interface CardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
  delay?: number;
}

export const Card: React.FC<CardProps> = ({
  children,
  onClick,
  className = '',
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.2 }}
      onClick={() => {
        if (onClick) {
          onClick();
          haptic('light');
        }
      }}
      className={`bg-white/5 border border-white/10 rounded-lg p-4 ${
        onClick ? 'cursor-pointer hover:bg-white/10 active:scale-[0.98]' : ''
      } transition-all ${className}`}
    >
      {children}
    </motion.div>
  );
};

// Section Header Component - Desktop Style
interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
}) => {
  return (
    <div className="flex items-center justify-between px-5 py-3">
      <div>
        <h2 className="text-sm font-semibold text-white/90">{title}</h2>
        {subtitle && (
          <p className="text-xs text-white/40 mt-0.5">{subtitle}</p>
        )}
      </div>
      {action && (
        <button
          onClick={() => {
            action.onClick();
            haptic('light');
          }}
          className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};
