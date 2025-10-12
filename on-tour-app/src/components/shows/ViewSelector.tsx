import React from 'react';
import { motion } from 'framer-motion';

export type ShowView = 'list' | 'board' | 'calendar';

interface ViewSelectorProps {
  currentView: ShowView;
  onViewChange: (view: ShowView) => void;
}

export const ViewSelector: React.FC<ViewSelectorProps> = ({
  currentView,
  onViewChange
}) => {
  const views = [
    {
      id: 'list' as ShowView,
      label: 'Itinerary',
      icon: '📋',
      description: 'Detailed list view'
    },
    {
      id: 'board' as ShowView,
      label: 'Board',
      icon: '🎯',
      description: 'Kanban-style workflow'
    },
    {
      id: 'calendar' as ShowView,
      label: 'Calendar',
      icon: '📅',
      description: 'Monthly calendar view'
    }
  ];

  return (
    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-xl border border-white/10 backdrop-blur-sm">
      {views.map((view, index) => (
        <motion.button
          key={view.id}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: index * 0.05 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => onViewChange(view.id)}
          className={`relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
            currentView === view.id
              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30 shadow-lg'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }`}
        >
          <span className="text-lg">{view.icon}</span>
          <div className="text-left">
            <div className={`text-sm font-medium ${
              currentView === view.id ? 'text-blue-300' : 'text-slate-300'
            }`}>
              {view.label}
            </div>
            <div className="text-xs text-slate-500">
              {view.description}
            </div>
          </div>

          {/* Active indicator */}
          {currentView === view.id && (
            <motion.div
              layoutId="activeIndicator"
              className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30"
              initial={false}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          )}
        </motion.button>
      ))}
    </div>
  );
};