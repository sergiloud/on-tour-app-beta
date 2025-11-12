import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Clock, AlertCircle } from 'lucide-react';
import { hapticSelection } from '../../../../lib/haptics';

interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  deadline?: string;
  completed: boolean;
}

interface TasksWidgetProps {
  className?: string;
}

// Mock data - en producción vendría de un store
const MOCK_TASKS: Task[] = [
  {
    id: '1',
    title: 'Revisar contratos Madrid',
    priority: 'high',
    deadline: 'Hoy',
    completed: false,
  },
  {
    id: '2',
    title: 'Confirmar hotel Barcelona',
    priority: 'medium',
    deadline: 'Mañana',
    completed: false,
  },
  {
    id: '3',
    title: 'Enviar rider técnico',
    priority: 'low',
    deadline: '3 días',
    completed: true,
  },
];

export const TasksWidget: React.FC<TasksWidgetProps> = ({ className = '' }) => {
  const [tasks, setTasks] = React.useState<Task[]>(MOCK_TASKS);

  const toggleTask = (id: string) => {
    setTasks(prev =>
      prev.map(task =>
        task.id === id ? { ...task, completed: !task.completed } : task
      )
    );

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
