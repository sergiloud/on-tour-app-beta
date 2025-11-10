import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ActionHubPreviewProps {
  className?: string;
  animated?: boolean;
}

export const ActionHubPreview: React.FC<ActionHubPreviewProps> = ({
  className = '',
  animated = true
}) => {
  const [visibleTasks, setVisibleTasks] = useState<number[]>([]);

  const tasks = [
    { id: 1, title: 'Book hotel for Berlin show', priority: 'high' },
    { id: 2, title: 'Review contract terms', priority: 'medium' },
    { id: 3, title: 'Update travel itinerary', priority: 'low' },
    { id: 4, title: 'Confirm tech requirements', priority: 'high' }
  ];

  useEffect(() => {
    if (!animated) {
      setVisibleTasks(tasks.map(t => t.id));
      return;
    }

    const timeouts: NodeJS.Timeout[] = [];
    tasks.forEach((task, index) => {
      const timeout = setTimeout(() => {
        setVisibleTasks(prev => [...prev, task.id]);
      }, index * 600); // Stagger by 600ms
      timeouts.push(timeout);
    });

    return () => timeouts.forEach(clearTimeout);
  }, [animated]);

  return (
    <div className={`space-y-2 ${className}`}>
      <AnimatePresence>
        {tasks.map((task, index) => {
          const isVisible = visibleTasks.includes(task.id);

          return (
            <motion.div
              key={task.id}
              initial={{ x: -20, opacity: 0 }}
              animate={isVisible ? { x: 0, opacity: 1 } : { x: -20, opacity: 0 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{
                type: 'spring',
                stiffness: 300,
                damping: 30,
                delay: animated ? index * 0.1 : 0
              }}
              className={`flex items-center gap-2 p-2 rounded transition-all duration-500 bg-white/5`}
            >
              <div className={`w-3 h-3 rounded-full flex items-center justify-center text-xs ${
                task.priority === 'high' ? 'bg-red-500 text-white' :
                task.priority === 'medium' ? 'bg-yellow-500 text-white' : 'bg-blue-500 text-white'
              }`}>
                {task.priority === 'high' ? '!' : '○'}
              </div>
              <span className="text-xs flex-1">
                {task.title}
              </span>
              {isVisible && animated && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
                  className="text-xs text-green-400"
                >
                  ✓
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </AnimatePresence>
      <div className="text-xs text-accent-400 mt-2">
        {animated ? `${visibleTasks.length}/${tasks.length} tasks loaded` : 'Tasks ready'}
      </div>
    </div>
  );
};