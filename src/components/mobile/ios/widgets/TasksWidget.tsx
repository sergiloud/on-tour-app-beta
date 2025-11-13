import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { hapticSelection } from '../../../../lib/haptics';
import { useFilteredShows } from '../../../../features/shows/selectors';
import { useSettings } from '../../../../context/SettingsContext';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  completed: boolean;
  showId?: string;
}

interface TasksWidgetProps {
  className?: string;
}

export const TasksWidget: React.FC<TasksWidgetProps> = ({ className = '' }) => {
  const { shows } = useFilteredShows();
  const { fmtMoney } = useSettings();
  const [completedTasks, setCompletedTasks] = React.useState<Set<string>>(new Set());

  // Generate tasks from shows data (similar to ActionHub logic)
  const tasks = useMemo((): Task[] => {
    const now = Date.now();
    const DAY = 24 * 60 * 60 * 1000;
    const result: Task[] = [];

    // Filter to only include real shows
    const realShows = shows.filter((show: any) => {
      const btnType = show.notes?.match(/__btnType:(\w+)/)?.[1];
      return !btnType || btnType === 'show';
    });

    realShows.forEach((show: any) => {
      const showDate = new Date(show.date).getTime();
      const daysUntil = Math.ceil((showDate - now) / DAY);

      // Critical: Shows without contracts within 7 days
      if (show.status === 'pending' && daysUntil <= 7 && daysUntil > 0) {
        result.push({
          id: `contract-${show.id}`,
          title: `Revisar contratos ${show.city}`,
          priority: 'high',
          deadline: daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `${daysUntil} días`,
          completed: completedTasks.has(`contract-${show.id}`),
          showId: show.id
        });
      }

      // High: Payment issues
      if (show.status === 'confirmed' && !show.depositReceived && daysUntil <= 30) {
        result.push({
          id: `deposit-${show.id}`,
          title: `Solicitar depósito ${show.city}`,
          priority: 'high',
          deadline: daysUntil === 0 ? 'Hoy' : daysUntil === 1 ? 'Mañana' : `${daysUntil} días`,
          completed: completedTasks.has(`deposit-${show.id}`),
          showId: show.id
        });
      }

      // Medium: Travel logistics needed
      if (show.status === 'confirmed' && daysUntil <= 14 && daysUntil > 7) {
        result.push({
          id: `travel-${show.id}`,
          title: `Reservar viaje ${show.city}`,
          priority: 'medium',
          deadline: `${daysUntil} días`,
          completed: completedTasks.has(`travel-${show.id}`),
          showId: show.id
        });
      }

      // Opportunity: High-value pending shows
      if (show.status === 'offer' && show.fee > 10000) {
        result.push({
          id: `opportunity-${show.id}`,
          title: `Revisar oferta ${fmtMoney(show.fee)} en ${show.city}`,
          priority: 'medium',
          deadline: daysUntil > 0 ? `${daysUntil} días` : undefined,
          completed: completedTasks.has(`opportunity-${show.id}`),
          showId: show.id
        });
      }
    });

    // Sort by priority and deadline
    return result.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    }).slice(0, 5); // Show max 5 tasks in widget
  }, [shows, fmtMoney, completedTasks]);

  const toggleTask = (id: string) => {
    setCompletedTasks(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });

    hapticSelection();
  };

  const priorityColors = {
    high: { bg: 'bg-red-500/20', icon: 'text-red-400', border: 'border-red-500/30' },
    medium: { bg: 'bg-yellow-500/20', icon: 'text-yellow-400', border: 'border-yellow-500/30' },
    low: { bg: 'bg-blue-500/20', icon: 'text-blue-400', border: 'border-blue-500/30' },
  };

  const incompleteTasks = tasks.filter(t => !t.completed);
  const completedCount = tasks.filter(t => t.completed).length;

  return (
    <div className={`relative bg-white/5 backdrop-blur-md rounded-[28px] border border-white/10 overflow-hidden shadow-xl p-4 gpu-accelerate ${className}`}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 rounded-xl bg-purple-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-4 h-4 text-purple-400" strokeWidth={2.5} />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-white tracking-tight">Tareas</h2>
          <p className="text-[10px] text-white/50 font-medium">
            {completedCount}/{tasks.length} completadas
          </p>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-2">
        {incompleteTasks.length === 0 ? (
          <div className="text-center py-6 text-white/40">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-40" />
            <p className="text-xs font-medium">¡Todo hecho!</p>
          </div>
        ) : (
          incompleteTasks.slice(0, 3).map((task, index) => {
            const colors = priorityColors[task.priority];
            return (
              <motion.button
                key={task.id}
                onClick={() => toggleTask(task.id)}
                className={`w-full bg-white/5 backdrop-blur-sm rounded-[16px] p-3 border ${colors.border} hover:bg-white/10 transition-colors text-left`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex items-start gap-3">
                  {/* Checkbox */}
                  <div className="flex-shrink-0 pt-0.5">
                    {task.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-accent-500" strokeWidth={2.5} />
                    ) : (
                      <Circle className="w-5 h-5 text-white/40" strokeWidth={2} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold ${task.completed ? 'text-white/40 line-through' : 'text-white'}`}>
                      {task.title}
                    </p>
                    {task.deadline && (
                      <div className="flex items-center gap-1.5 mt-1">
                        <Clock className="w-3 h-3 text-white/50" strokeWidth={2} />
                        <span className="text-[10px] text-white/60 font-medium">{task.deadline}</span>
                      </div>
                    )}
                  </div>

                  {/* Priority indicator */}
                  {task.priority === 'high' && !task.completed && (
                    <div className={`flex-shrink-0 w-6 h-6 rounded-lg ${colors.bg} flex items-center justify-center`}>
                      <AlertCircle className={`w-3.5 h-3.5 ${colors.icon}`} strokeWidth={2.5} />
                    </div>
                  )}
                </div>
              </motion.button>
            );
          })
        )}
      </div>
    </div>
  );
};
