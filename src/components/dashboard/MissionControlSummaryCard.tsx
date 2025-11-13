import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';

interface Mission {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in_progress' | 'completed';
  assignee?: string;
}

interface MissionControlSummaryCardProps {
  pendingMissions: Mission[];
  totalMissions: number;
  completedToday: number;
}

export const MissionControlSummaryCard: React.FC<MissionControlSummaryCardProps> = ({
  pendingMissions,
  totalMissions,
  completedToday
}) => {
  const navigate = useNavigate();
  
  const getPriorityColor = (priority: Mission['priority']) => {
    switch (priority) {
      case 'high': return 'text-red-400';
      case 'medium': return 'text-amber-400';
      case 'low': return 'text-green-400';
      default: return 'text-slate-400';
    }
  };

  const getPriorityIcon = (priority: Mission['priority']) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  const getStatusIcon = (status: Mission['status']) => {
    switch (status) {
      case 'completed': return '✅';
      case 'in_progress': return '🔄';
      case 'pending': return '⏳';
      default: return '⏳';
    }
  };

  const highPriorityCount = pendingMissions.filter(m => m.priority === 'high').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="p-6 rounded-xl border border-white/20 bg-white/5 backdrop-blur-sm hover:scale-105 transition-transform duration-200 cursor-pointer"
      onClick={() => navigate('/dashboard/mission/lab')}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-orange-500/20 to-red-500/20 flex items-center justify-center">
            <span className="text-lg">🎯</span>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">
              {t('dashboard.card.mission.title') || 'Mission Control'}
            </h3>
            <p className="text-sm text-slate-400">
              {t('dashboard.card.mission.subtitle') || 'Tasks & objectives'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold text-white">{pendingMissions.length}</div>
          <div className="text-xs text-slate-400">
            {t('dashboard.card.mission.pending') || 'Pending'}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {/* High priority alert */}
        {highPriorityCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-3 rounded-lg bg-red-500/10 border border-red-500/20"
          >
            <div className="flex items-center gap-2">
              <span className="text-red-400">🚨</span>
              <span className="text-sm text-red-300 font-medium">
                {highPriorityCount} {t('dashboard.card.mission.highPriority') || 'high priority tasks'}
              </span>
            </div>
          </motion.div>
        )}

        {/* Recent missions */}
        <div>
          <h4 className="text-sm font-medium text-slate-900 dark:text-white mb-3">
            {t('dashboard.card.mission.recent') || 'Recent Missions'}
          </h4>
          <div className="space-y-2">
            {pendingMissions.slice(0, 3).map((mission, index) => (
              <motion.div
                key={mission.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 dark:text-white truncate">
                    {mission.title}
                  </div>
                  {mission.assignee && (
                    <div className="text-xs text-slate-400">
                      {t('dashboard.card.mission.assignedTo') || 'Assigned to'}: {mission.assignee}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-2">
                  <span className="text-sm">
                    {getPriorityIcon(mission.priority)}
                  </span>
                  <span className="text-sm">
                    {getStatusIcon(mission.status)}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/10">
          <div className="text-center">
            <div className="text-lg font-bold text-green-400">{completedToday}</div>
            <div className="text-xs text-slate-400">
              {t('dashboard.card.mission.completedToday') || 'Completed Today'}
            </div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-white">{totalMissions}</div>
            <div className="text-xs text-slate-400">
              {t('dashboard.card.mission.total') || 'Total Missions'}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="px-4 py-2 text-sm font-medium bg-white/10 hover:bg-white/20 rounded-full transition-colors"
          >
            {t('dashboard.card.viewAll') || 'View All Missions'}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
