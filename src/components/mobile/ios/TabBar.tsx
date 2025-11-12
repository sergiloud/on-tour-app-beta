import React from 'react';
import { motion } from 'framer-motion';
import { Home, Calendar, DollarSign, Map, Settings } from 'lucide-react';
import { sfSymbols } from '../../../lib/sfSymbols';
import { hapticSelection } from '../../../lib/haptics';

export type TabId = 'home' | 'shows' | 'finance' | 'map' | 'settings';

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  className?: string;
}

interface Tab {
  id: TabId;
  label: string;
  icon: any;
  badge?: number;
}

const tabs: Tab[] = [
  { id: 'home', label: 'Inicio', icon: Home },
  { id: 'shows', label: 'Shows', icon: Calendar },
  { id: 'finance', label: 'Finance', icon: DollarSign },
  { id: 'map', label: 'Mapa', icon: Map },
  { id: 'settings', label: 'Ajustes', icon: Settings },
];

/**
 * iOS-style Tab Bar
 * Fixed bottom navigation with safe area support
 */
export const TabBar: React.FC<TabBarProps> = ({ activeTab, onTabChange, className = '' }) => {
  const handleTabPress = (tabId: TabId) => {
    if (tabId !== activeTab) {
      hapticSelection();
      onTabChange(tabId);
    }
  };

  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-50 ${className}`}
      style={{
        paddingBottom: 'env(safe-area-inset-bottom, 0px)',
      }}
    >
      {/* Backdrop blur */}
      <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-2xl border-t border-white/10" />

      {/* Tab items */}
      <div className="relative flex items-stretch justify-around px-2 pt-1">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;

          return (
            <motion.button
              key={tab.id}
              onClick={() => handleTabPress(tab.id)}
              className="flex-1 flex flex-col items-center justify-center py-1.5 px-2 min-h-[49px] relative"
              whileTap={{ scale: 0.92 }}
              transition={{ duration: 0.1 }}
            >
              {/* Icon container */}
              <div className="relative mb-0.5">
                <Icon
                  className={`w-6 h-6 transition-colors duration-150 ${
                    isActive ? 'text-accent-500' : 'text-white/60'
                  }`}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                
                {/* Badge indicator */}
                {tab.badge !== undefined && tab.badge > 0 && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 bg-red-500 rounded-full flex items-center justify-center"
                  >
                    <span className="text-[10px] font-bold text-white leading-none">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  </motion.div>
                )}
              </div>

              {/* Label */}
              <span
                className={`text-[10px] font-medium transition-colors duration-150 ${
                  isActive ? 'text-accent-500' : 'text-white/60'
                }`}
              >
                {tab.label}
              </span>

              {/* Active indicator - subtle underline */}
              {isActive && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-0.5 bg-accent-500 rounded-full"
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                  }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </div>
  );
};
