import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import { sanitizeName } from '../../lib/sanitize';

export interface Show {
  id: string;
  name: string;
  date: string;
  city: string;
  country: string;
  venue: string;
  capacity: number;
  status: 'planned' | 'confirmed' | 'on_sale' | 'upcoming' | 'completed' | 'cancelled';
  ticketSalesPercentage: number;
  projectedMargin: number;
  tasksCompleted: number;
  totalTasks: number;
  priority: 'low' | 'medium' | 'high' | 'critical';
}

interface SmartShowRowProps {
  show: Show;
  onEdit: (show: Show) => void;
  onViewTasks: (show: Show) => void;
  onViewFinance: (show: Show) => void;
  onClick: (show: Show) => void;
}

export const SmartShowRow: React.FC<SmartShowRowProps> = ({
  show,
  onEdit,
  onViewTasks,
  onViewFinance,
  onClick
}) => {
  const [isHovered, setIsHovered] = useState(false);

  const getStatusColor = (status: Show['status']) => {
    switch (status) {
      case 'planned': return 'bg-slate-500';
      case 'confirmed': return 'bg-blue-500';
      case 'on_sale': return 'bg-green-500';
      case 'upcoming': return 'bg-amber-500';
      case 'completed': return 'bg-emerald-500';
      case 'cancelled': return 'bg-red-500';
      default: return 'bg-slate-500';
    }
  };

  const getStatusText = (status: Show['status']) => {
    switch (status) {
      case 'planned': return 'Planned';
      case 'confirmed': return 'Confirmed';
      case 'on_sale': return 'On Sale';
      case 'upcoming': return 'Upcoming';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return 'Unknown';
    }
  };

  const getHealthColor = () => {
    if (show.priority === 'critical') return 'bg-red-500';
    if (show.priority === 'high') return 'bg-amber-500';
    if (show.ticketSalesPercentage < 50) return 'bg-amber-500';
    if (show.tasksCompleted < show.totalTasks * 0.7) return 'bg-amber-500';
    return 'bg-green-500';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const taskProgress = show.totalTasks > 0 ? (show.tasksCompleted / show.totalTasks) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      className="group relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        whileHover={{ scale: 1.005 }}
        onClick={() => onClick(show)}
        className="bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 hover:border-white/20 transition-all duration-150 cursor-pointer overflow-hidden"
      >
        <div className="flex items-center p-6">
          {/* Health Indicator */}
          <div className="flex-shrink-0 mr-4">
            <div className={`w-4 h-16 rounded-full ${getHealthColor()}`} />
          </div>

          {/* Main Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-3">
                <h3 className="text-lg font-semibold text-white truncate">
                  {sanitizeName(show.name)}
                </h3>
                <span className={`px-2 py-1 text-xs font-medium rounded-full ${show.status === 'confirmed' ? 'bg-blue-500/20 text-blue-300' :
                    show.status === 'on_sale' ? 'bg-green-500/20 text-green-300' :
                      show.status === 'upcoming' ? 'bg-amber-500/20 text-amber-300' :
                        'bg-slate-500/20 text-slate-300'
                  }`}>
                  {getStatusText(show.status)}
                </span>
              </div>

              <div className="text-sm text-slate-400">
                {formatDate(show.date)}
              </div>
            </div>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">📍</span>
                  <span className="text-white">{show.city}, {show.country}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">🏟️</span>
                  <span className="text-white">{show.venue}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">👥</span>
                  <span className="text-white">{show.capacity.toLocaleString()}</span>
                </div>
              </div>

              {/* KPIs */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">🎫</span>
                  <span className="text-white font-medium">{show.ticketSalesPercentage}%</span>
                  <span className="text-xs text-slate-400">sold</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400">💰</span>
                  <span className={`font-medium ${show.projectedMargin >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                    {show.projectedMargin >= 0 ? '+' : ''}{show.projectedMargin}%
                  </span>
                  <span className="text-xs text-slate-400">margin</span>
                </div>
              </div>
            </div>

            {/* Task Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Tasks Completed</span>
                <span>{show.tasksCompleted}/{show.totalTasks}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${taskProgress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={`h-2 rounded-full ${taskProgress === 100 ? 'bg-green-500' :
                      taskProgress > 70 ? 'bg-blue-500' :
                        taskProgress > 40 ? 'bg-amber-500' : 'bg-red-500'
                    }`}
                />
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions Overlay */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ duration: 0.2 }}
            className="absolute top-4 right-4 flex gap-2"
          >
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(show);
              }}
              className="px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 rounded-lg text-sm font-medium transition-colors"
            >
              Edit
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewTasks(show);
              }}
              className="px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 rounded-lg text-sm font-medium transition-colors"
            >
              Tasks
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onViewFinance(show);
              }}
              className="px-3 py-2 bg-green-500/20 hover:bg-green-500/30 text-green-300 rounded-lg text-sm font-medium transition-colors"
            >
              Finance
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
