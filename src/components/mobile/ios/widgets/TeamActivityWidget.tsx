import React from 'react';
import { motion } from 'framer-motion';
import { Users, Plus, DollarSign, Calendar, Clock } from 'lucide-react';

interface Activity {
  id: string;
  user: string;
  action: string;
  type: 'show' | 'expense' | 'task';
  timestamp: string;
  avatar?: string;
}

interface TeamActivityWidgetProps {
  className?: string;
}

const MOCK_ACTIVITY: Activity[] = [
  {
    id: '1',
    user: 'Ana García',
    action: 'añadió un show en Barcelona',
    type: 'show',
    timestamp: 'hace 2h',
  },
  {
    id: '2',
    user: 'Carlos Ruiz',
    action: 'registró un gasto de €450',
    type: 'expense',
    timestamp: 'hace 4h',
  },
  {
    id: '3',
    user: 'María López',
    action: 'completó una tarea',
    type: 'task',
    timestamp: 'hace 6h',
  },
];

export const TeamActivityWidget: React.FC<TeamActivityWidgetProps> = ({ className = '' }) => {
  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'show':
        return Calendar;
      case 'expense':
        return DollarSign;
      case 'task':
        return Plus;
    }
  };

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'show':
        return { bg: 'bg-blue-500/20', icon: 'text-blue-400' };
      case 'expense':
        return { bg: 'bg-green-500/20', icon: 'text-green-400' };
      case 'task':
        return { bg: 'bg-purple-500/20', icon: 'text-purple-400' };
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className={`relative bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl p-4 gpu-accelerate ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-orange-500/20 flex items-center justify-center">
          <Users className="w-4 h-4 text-orange-400" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-white tracking-tight">Actividad del Equipo</h2>
          <p className="text-[10px] text-white/50 font-medium">Últimas acciones</p>
        </div>
      </div>

      {/* Activity List */}
      <div className="space-y-2.5">
        {MOCK_ACTIVITY.length === 0 ? (
          <div className="text-center py-6 text-white/40">
            <Users className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">No hay actividad reciente</p>
          </div>
        ) : (
          MOCK_ACTIVITY.map((activity, index) => {
            const Icon = getActivityIcon(activity.type);
            const colors = getActivityColor(activity.type);
            
            return (
              <motion.div
                key={activity.id}
                className="flex items-start gap-3 p-2.5 rounded-xl bg-white/5 border border-white/10"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Avatar */}
                <div className="flex-shrink-0 w-9 h-9 rounded-xl bg-gradient-to-br from-accent-500/30 to-purple-500/30 flex items-center justify-center">
                  <span className="text-xs font-bold text-white">
                    {getInitials(activity.user)}
                  </span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-white font-medium leading-tight">
                    <span className="font-semibold">{activity.user}</span>
                    {' '}
                    <span className="text-white/70">{activity.action}</span>
                  </p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Clock className="w-3 h-3 text-white/40" strokeWidth={2} />
                    <span className="text-[10px] text-white/50 font-medium">{activity.timestamp}</span>
                  </div>
                </div>

                {/* Activity Type Icon */}
                <div className={`flex-shrink-0 w-7 h-7 rounded-lg ${colors.bg} flex items-center justify-center`}>
                  <Icon className={`w-3.5 h-3.5 ${colors.icon}`} strokeWidth={2.5} />
                </div>
              </motion.div>
            );
          })
        )}
      </div>

      {/* View All Button */}
      {MOCK_ACTIVITY.length > 0 && (
        <motion.button
          className="w-full mt-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white/70 text-xs font-semibold hover:bg-white/10 transition-colors"
          whileTap={{ scale: 0.98 }}
        >
          Ver toda la actividad
        </motion.button>
      )}
    </div>
  );
};
