import React, { ReactNode } from 'react';
import { motion } from 'framer-motion';

export interface Tab {
  id: string;
  label: string;
  icon?: ReactNode;
  badge?: number | string;
  disabled?: boolean;
}

interface TabListProps {
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  variant?: 'underline' | 'pills';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

/**
 * TabList Component - Unified tab navigation
 * Features:
 * - Multiple variants (underline, pills)
 * - Icon support with badges
 * - Accessible keyboard navigation
 * - Smooth animations
 * - Multiple sizes
 */
const TabList: React.FC<TabListProps> = ({
  tabs,
  activeTabId,
  onTabChange,
  variant = 'underline',
  size = 'md',
  className = '',
}) => {
  const handleKeyDown = (e: React.KeyboardEvent, tabId: string) => {
    const currentIndex = tabs.findIndex((t) => t.id === tabId);

    if (e.key === 'ArrowLeft' && currentIndex >= 0) {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      const prevTab = tabs[prevIndex];
      if (prevTab) onTabChange(prevTab.id);
    } else if (e.key === 'ArrowRight' && currentIndex >= 0) {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % tabs.length;
      const nextTab = tabs[nextIndex];
      if (nextTab) onTabChange(nextTab.id);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onTabChange(tabId);
    }
  };

  const sizeClass =
    size === 'sm'
      ? 'px-3 py-1.5 text-xs'
      : size === 'md'
      ? 'px-4 py-2 text-sm'
      : 'px-5 py-2.5 text-base';

  const isActive = (tabId: string) => tabId === activeTabId;

  return (
    <div
      className={`flex items-center gap-2 ${
        variant === 'underline' ? 'border-b border-white/10' : ''
      } ${className}`}
      role="tablist"
    >
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          role="tab"
          aria-selected={isActive(tab.id)}
          aria-disabled={tab.disabled}
          disabled={tab.disabled}
          onClick={() => !tab.disabled && onTabChange(tab.id)}
          onKeyDown={(e) => !tab.disabled && handleKeyDown(e, tab.id)}
          whileHover={!tab.disabled ? { scale: 1.02 } : {}}
          whileTap={!tab.disabled ? { scale: 0.98 } : {}}
          className={`
            relative inline-flex items-center gap-2 font-medium
            transition-all duration-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-accent-500/50
            ${sizeClass}
            ${
              tab.disabled
                ? 'opacity-50 cursor-not-allowed'
                : isActive(tab.id)
                ? variant === 'underline'
                  ? 'text-accent-400 border-b-2 border-accent-500 -mb-[2px]'
                  : 'bg-accent-500/15 text-accent-300 border border-accent-500/30'
                : variant === 'underline'
                ? 'text-white/70 hover:text-white'
                : 'text-white/70 hover:text-white hover:bg-white/5 border border-white/10'
            }
          `}
        >
          {tab.icon && <span className="flex-shrink-0">{tab.icon}</span>}
          <span>{tab.label}</span>
          {tab.badge && (
            <motion.span
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="ml-1 inline-flex items-center justify-center w-5 h-5 text-[10px] font-bold
                bg-accent-500/20 text-accent-400 rounded-full"
            >
              {tab.badge}
            </motion.span>
          )}
        </motion.button>
      ))}
    </div>
  );
};

TabList.displayName = 'TabList';

export default TabList;
