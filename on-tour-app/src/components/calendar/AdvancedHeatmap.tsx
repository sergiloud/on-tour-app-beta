import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

type Props = {
  events: Map<string, Array<{ id: string; fee?: number; status?: string }>>;
  mode: 'financial' | 'activity' | 'status';
  year: number;
  month: number;
  weekStartsOn?: 0 | 1;
};

/**
 * Advanced Heatmap Calendar View
 * Shows financial revenue, activity density, or status patterns
 */
const AdvancedHeatmap: React.FC<Props> = ({ events, mode, year, month, weekStartsOn = 1 }) => {
  // Generate calendar grid
  const grid = useMemo(() => {
    const firstDay = new Date(year, month - 1, 1);
    const lastDay = new Date(year, month, 0);
    const startPadding = (firstDay.getDay() - weekStartsOn + 7) % 7;
    const cells: (number | null)[] = [];

    // Add padding
    for (let i = 0; i < startPadding; i++) {
      cells.push(null);
    }
    // Add days
    for (let d = 1; d <= lastDay.getDate(); d++) {
      cells.push(d);
    }
    return cells;
  }, [year, month, weekStartsOn]);

  // Calculate heatmap values
  const heatmapData = useMemo(() => {
    const data: Record<number, number> = {};
    events.forEach((eventList, dateStr) => {
      const date = new Date(dateStr);
      const day = date.getDate();
      if (date.getFullYear() === year && date.getMonth() + 1 === month) {
        if (mode === 'financial') {
          const total = eventList.reduce((sum, e) => sum + (e.fee || 0), 0);
          data[day] = (data[day] || 0) + total;
        } else if (mode === 'activity') {
          data[day] = (data[day] || 0) + eventList.length;
        } else if (mode === 'status') {
          const confirmed = eventList.filter((e) => e.status === 'confirmed').length;
          data[day] = (data[day] || 0) + confirmed;
        }
      }
    });
    return data;
  }, [events, mode, year, month]);

  // Get max value for normalization
  const maxValue = Math.max(...Object.values(heatmapData), 1);

  // Get color intensity
  const getHeatColor = (value: number) => {
    if (value === 0) return 'opacity-10';
    const intensity = Math.min(value / maxValue, 1);

    if (intensity < 0.25) return 'opacity-20';
    if (intensity < 0.5) return 'opacity-40';
    if (intensity < 0.75) return 'opacity-60';
    return 'opacity-90';
  };

  const getGradient = () => {
    if (mode === 'financial') return 'from-green-400 to-green-600';
    if (mode === 'activity') return 'from-blue-400 to-blue-600';
    return 'from-purple-400 to-purple-600';
  };

  const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const startLabel = weekStartsOn === 1 ? 1 : 0;
  const displayLabels = dayLabels.slice(startLabel).concat(dayLabels.slice(0, startLabel));

  return (
    <div className="w-full space-y-6">
      {/* Legend */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between p-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-white/10"
      >
        <div>
          <h3 className="text-sm font-semibold text-white mb-2">
            {mode === 'financial' ? 'Revenue' : mode === 'activity' ? 'Activity' : 'Confirmations'} Heatmap
          </h3>
          <p className="text-xs text-slate-400 dark:text-white/60">
            {mode === 'financial' ? 'Total earnings per day' : mode === 'activity' ? 'Event count per day' : 'Confirmed events per day'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {[0.1, 0.3, 0.5, 0.7, 0.9].map((opacity, idx) => (
              <div
                key={idx}
                className={`w-6 h-6 rounded bg-gradient-to-br ${getGradient()} opacity-${Math.round(opacity * 100)}`}
              />
            ))}
          </div>
        </div>
      </motion.div>

      {/* Heatmap Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="p-4 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 overflow-x-auto"
      >
        {/* Day labels */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {displayLabels.map((label) => (
            <div key={label} className="aspect-square flex items-center justify-center text-xs font-semibold text-slate-400 dark:text-white/60">
              {label}
            </div>
          ))}
        </div>

        {/* Calendar cells */}
        <div className="grid grid-cols-7 gap-1">
          {grid.map((day, idx) => {
            const value = day ? heatmapData[day] || 0 : 0;
            const intensity = getHeatColor(value);

            return (
              <motion.div
                key={idx}
                whileHover={day ? { scale: 1.1 } : {}}
                className={`
                  aspect-square rounded-lg flex flex-col items-center justify-center text-xs font-semibold
                  cursor-pointer transition-all duration-200
                  ${day ? `bg-gradient-to-br ${getGradient()} ${intensity} hover:shadow-lg` : 'bg-transparent'}
                  ${day ? 'text-white' : 'text-transparent'}
                  border ${day ? 'border-slate-200 dark:border-white/10 hover:border-white/30' : 'border-transparent'}
                `}
                title={day ? `${day} ${month}/${year}${value > 0 ? `: ${value} ${mode === 'financial' ? 'EUR' : 'event(s)'}` : ''}` : ''}
              >
                {day && (
                  <>
                    <div>{day}</div>
                    {value > 0 && (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="text-[10px] opacity-75 font-bold"
                      >
                        {mode === 'financial' ? `€${(value / 100).toFixed(0)}` : mode === 'activity' ? `+${value}` : `✓${value}`}
                      </motion.div>
                    )}
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </motion.div>

      {/* Stats Panel */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-3 gap-3"
      >
        {/* Total */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/20 border border-accent-500/30">
          <p className="text-xs text-slate-400 dark:text-white/60 mb-1">Total</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {mode === 'financial' ? `€${(Object.values(heatmapData).reduce((a, b) => a + b, 0) / 100).toFixed(0)}` : Object.values(heatmapData).reduce((a, b) => a + b, 0)}
          </p>
        </div>

        {/* Average */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/20 to-blue-600/20 border border-blue-500/30">
          <p className="text-xs text-slate-400 dark:text-white/60 mb-1">Average</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {mode === 'financial'
              ? `€${((Object.values(heatmapData).reduce((a, b) => a + b, 0) / Object.keys(heatmapData).length) / 100).toFixed(0)}`
              : (Object.values(heatmapData).reduce((a, b) => a + b, 0) / Object.keys(heatmapData).length).toFixed(1)}
          </p>
        </div>

        {/* Peak */}
        <div className="p-3 rounded-lg bg-gradient-to-br from-green-500/20 to-green-600/20 border border-green-500/30">
          <p className="text-xs text-slate-400 dark:text-white/60 mb-1">Peak</p>
          <p className="text-lg font-bold text-slate-900 dark:text-white">
            {mode === 'financial' ? `€${(Math.max(...Object.values(heatmapData)) / 100).toFixed(0)}` : Math.max(...Object.values(heatmapData))}
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AdvancedHeatmap;
