import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced Calendar Components - Phase 4
 *
 * Mejoras visuales modernistas para todos los elementos del calendario:
 * - Glassmorphism mejorado
 * - Animaciones suaves
 * - Nuevos efectos visuales
 * - Mejor tipografía
 * - Paleta de colores actualizada
 */

// ============================================================================
// TIPOS Y INTERFACES
// ============================================================================

export interface CalendarTheme {
  // Fondos y bordes
  background: {
    primary: string;
    secondary: string;
    tertiary: string;
    hover: string;
  };
  // Bordes
  border: {
    subtle: string;
    accent: string;
    divider: string;
  };
  // Texto
  text: {
    primary: string;
    secondary: string;
    muted: string;
    inverse: string;
  };
  // Estados
  state: {
    hover: string;
    active: string;
    focus: string;
    disabled: string;
  };
}

export const defaultTheme: CalendarTheme = {
  background: {
    primary: 'bg-white/5 backdrop-blur-lg',
    secondary: 'bg-white/8 backdrop-blur-md',
    tertiary: 'bg-slate-200 dark:bg-white/10 backdrop-blur-sm',
    hover: 'hover:bg-white/12 hover:backdrop-blur-lg',
  },
  border: {
    subtle: 'border border-white/10',
    accent: 'border-2 border-white/20',
    divider: 'border-b border-white/5',
  },
  text: {
    primary: 'text-gray-900 dark:text-white',
    secondary: 'text-gray-600 dark:text-gray-300',
    muted: 'text-gray-500 dark:text-gray-400',
    inverse: 'text-white dark:text-gray-900',
  },
  state: {
    hover: 'hover:shadow-lg hover:shadow-slate-200 dark:shadow-white/10',
    active: 'ring-2 ring-blue-500/50',
    focus: 'focus:ring-2 focus:ring-blue-500/50 focus:outline-none',
    disabled: 'opacity-50 cursor-not-allowed',
  },
};

// ============================================================================
// ENHANCED DAY CELL COMPONENT
// ============================================================================

interface EnhancedDayCellProps {
  date: string;
  isToday: boolean;
  isCurrentMonth: boolean;
  isWeekend: boolean;
  dayNumber: number;
  eventsCount: number;
  heatmapIntensity?: number; // 0-100
  onClick?: () => void;
  theme?: CalendarTheme;
}

export const EnhancedDayCell: React.FC<EnhancedDayCellProps> = ({
  date,
  isToday,
  isCurrentMonth,
  isWeekend,
  dayNumber,
  eventsCount,
  heatmapIntensity = 0,
  onClick,
  theme = defaultTheme,
}) => {
  const intensity = Math.min(Math.max(heatmapIntensity, 0), 100);
  const heatmapOpacity = 0.1 + (intensity / 100) * 0.3; // 10-40% opacity

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`
        relative group h-24 rounded-lg transition-all duration-300
        ${isCurrentMonth ? theme.background.primary : 'bg-gray-500/5'}
        ${isToday ? `ring-2 ring-blue-500/50 ${theme.background.secondary}` : theme.border.subtle}
        ${isWeekend ? 'bg-gradient-to-br from-slate-100 dark:from-white/5 to-white/3' : ''}
        ${theme.state.hover} cursor-pointer overflow-hidden
      `}
    >
      {/* Heatmap Background */}
      {intensity > 0 && (
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br from-emerald-500 to-blue-500 pointer-events-none`}
          style={{ opacity: heatmapOpacity }}
          initial={{ opacity: 0 }}
          animate={{ opacity: heatmapOpacity }}
        />
      )}

      {/* Grid Pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-grid-pattern pointer-events-none" />

      {/* Content */}
      <div className="relative p-2 h-full flex flex-col">
        {/* Day Number */}
        <div className="flex items-center justify-between mb-1">
          <span className={`
            text-sm font-bold transition-colors
            ${isToday
              ? 'text-blue-400 drop-shadow-lg'
              : isCurrentMonth
              ? theme.text.primary
              : theme.text.muted
            }
          `}>
            {dayNumber}
          </span>

          {isToday && (
            <motion.div
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-2 h-2 bg-blue-400 rounded-full"
            />
          )}
        </div>

        {/* Event Count Badge */}
        {eventsCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className={`
              absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-semibold
              bg-gradient-to-r from-blue-500/40 to-purple-500/40
              border border-blue-400/50 text-white
              backdrop-blur-sm shadow-lg
            `}
          >
            {eventsCount > 9 ? '9+' : eventsCount}
          </motion.div>
        )}

        {/* Event Dots */}
        {eventsCount > 0 && eventsCount <= 3 && (
          <div className="flex gap-1 mt-auto">
            {Array.from({ length: eventsCount }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: i * 0.05 }}
                className={`
                  w-1.5 h-1.5 rounded-full
                  bg-gradient-to-r from-emerald-400 to-blue-400
                  shadow-md
                `}
              />
            ))}
          </div>
        )}

        {/* Hover Indicator */}
        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </motion.button>
  );
};

// ============================================================================
// ENHANCED EVENT CHIP
// ============================================================================

interface EnhancedEventChipProps {
  title: string;
  status: 'confirmed' | 'pending' | 'offer';
  type: 'show' | 'travel';
  color?: string;
  duration?: number; // days
  pinned?: boolean;
  onClick?: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

export const EnhancedEventChip: React.FC<EnhancedEventChipProps> = ({
  title,
  status,
  type,
  color = 'blue',
  duration,
  pinned,
  onClick,
  onContextMenu,
}) => {
  const statusColors = {
    confirmed: 'from-emerald-500/40 to-emerald-600/20 border-emerald-400/50 text-emerald-100',
    pending: 'from-amber-500/40 to-amber-600/20 border-amber-400/50 text-amber-100 border-dashed',
    offer: 'from-purple-500/40 to-purple-600/20 border-purple-400/50 text-purple-100',
  };

  const typeIcons = {
    show: '🎭',
    travel: '✈️',
  };

  return (
    <motion.button
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        group relative w-full px-3 py-2 rounded-lg text-xs font-semibold
        bg-gradient-to-r ${statusColors[status]}
        border backdrop-blur-lg
        transition-all duration-300
        hover:shadow-lg hover:shadow-white/20
        overflow-hidden
      `}
    >
      {/* Shimmer effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-30"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.5 }}
      />

      {/* Content */}
      <div className="relative flex items-center gap-1 truncate">
        <span>{typeIcons[type]}</span>
        <span className="truncate">{title}</span>
        {pinned && <span className="ml-auto text-xs">📌</span>}
        {duration && duration > 1 && (
          <span className="ml-auto text-[10px] opacity-75">{duration}d</span>
        )}
      </div>

      {/* Status indicator line */}
      <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
    </motion.button>
  );
};

// ============================================================================
// ENHANCED WEEKDAY HEADER
// ============================================================================

interface EnhancedWeekdayHeaderProps {
  weekdays: string[];
  theme?: CalendarTheme;
}

export const EnhancedWeekdayHeader: React.FC<EnhancedWeekdayHeaderProps> = ({
  weekdays,
  theme = defaultTheme,
}) => {
  return (
    <div className={`grid grid-cols-7 gap-2 p-4 rounded-lg ${theme.background.secondary} ${theme.border.subtle} mb-4`}>
      {weekdays.map((day, idx) => (
        <motion.div
          key={day}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.05 }}
          className={`
            text-center py-2 px-1 rounded
            ${idx >= 5 ? 'bg-red-500/10' : 'bg-blue-500/10'}
            font-semibold text-sm ${theme.text.primary}
            tracking-wider uppercase
          `}
        >
          {day}
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// ENHANCED MONTH HEADER
// ============================================================================

interface EnhancedMonthHeaderProps {
  monthName: string;
  year: number;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  theme?: CalendarTheme;
}

export const EnhancedMonthHeader: React.FC<EnhancedMonthHeaderProps> = ({
  monthName,
  year,
  onPrev,
  onNext,
  onToday,
  theme = defaultTheme,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`
        flex items-center justify-between p-6 rounded-xl
        ${theme.background.primary} ${theme.border.accent}
        mb-6 overflow-hidden relative group
      `}
    >
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Grid pattern */}
      <div className="absolute inset-0 opacity-[0.02] bg-grid-pattern" />

      {/* Content */}
      <div className="relative flex items-center gap-4 flex-1">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onPrev}
          className={`
            p-2 rounded-lg ${theme.background.secondary}
            ${theme.border.subtle} ${theme.state.hover}
            transition-all duration-300
          `}
        >
          ← {/* Left arrow */}
        </motion.button>

        <div className="flex-1 text-center">
          <motion.h2
            key={`${monthName}-${year}`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent`}
          >
            {monthName} {year}
          </motion.h2>
        </div>

        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={onNext}
          className={`
            p-2 rounded-lg ${theme.background.secondary}
            ${theme.border.subtle} ${theme.state.hover}
            transition-all duration-300
          `}
        >
          → {/* Right arrow */}
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onToday}
          className={`
            px-4 py-2 rounded-lg ml-4
            bg-gradient-to-r from-blue-500/30 to-purple-500/30
            border border-blue-400/50
            ${theme.text.primary} font-semibold text-sm
            hover:shadow-lg hover:shadow-blue-500/30
            transition-all duration-300
          `}
        >
          Today
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// ENHANCED TIME SLOT
// ============================================================================

interface EnhancedTimeSlotProps {
  time: string;
  events?: number;
  isNow?: boolean;
  theme?: CalendarTheme;
}

export const EnhancedTimeSlot: React.FC<EnhancedTimeSlotProps> = ({
  time,
  events = 0,
  isNow = false,
  theme = defaultTheme,
}) => {
  return (
    <motion.div
      className={`
        flex items-center gap-3 p-3 rounded-lg
        ${isNow
          ? 'bg-gradient-to-r from-blue-500/20 to-purple-500/20 border-2 border-blue-400/50'
          : theme.background.primary
        }
        ${theme.border.subtle}
        transition-all duration-300
      `}
    >
      <span className={`text-sm font-semibold w-16 ${theme.text.secondary}`}>
        {time}
      </span>

      {isNow && (
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="w-2 h-2 bg-blue-400 rounded-full"
        />
      )}

      {events > 0 && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="ml-auto px-2 py-1 bg-blue-500/40 border border-blue-400/50 rounded text-xs font-bold text-slate-900 dark:text-white"
        >
          {events} {events === 1 ? 'event' : 'events'}
        </motion.div>
      )}
    </motion.div>
  );
};

// ============================================================================
// ENHANCED STATS PANEL
// ============================================================================

interface StatItem {
  label: string;
  value: string | number;
  icon: string;
  color: 'blue' | 'green' | 'purple' | 'amber';
  trend?: 'up' | 'down' | 'stable';
}

interface EnhancedStatsPanelProps {
  stats: StatItem[];
  theme?: CalendarTheme;
}

export const EnhancedStatsPanel: React.FC<EnhancedStatsPanelProps> = ({
  stats,
  theme = defaultTheme,
}) => {
  const colorGradients = {
    blue: 'from-blue-500/30 to-cyan-500/20 border-blue-400/50',
    green: 'from-emerald-500/30 to-teal-500/20 border-emerald-400/50',
    purple: 'from-purple-500/30 to-pink-500/20 border-purple-400/50',
    amber: 'from-amber-500/30 to-orange-500/20 border-amber-400/50',
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: idx * 0.1 }}
          className={`
            p-4 rounded-lg bg-gradient-to-br ${colorGradients[stat.color]}
            border backdrop-blur-lg
            hover:shadow-lg hover:shadow-slate-200 dark:shadow-white/10 transition-all duration-300
            relative overflow-hidden group
          `}
        >
          {/* Shimmer */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20"
            initial={{ x: '-100%' }}
            whileHover={{ x: '100%' }}
            transition={{ duration: 0.5 }}
          />

          {/* Content */}
          <div className="relative flex items-start justify-between">
            <div>
              <p className={`text-sm font-medium ${theme.text.secondary} mb-2`}>
                {stat.label}
              </p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {stat.value}
              </p>
            </div>
            <span className="text-3xl">{stat.icon}</span>
          </div>

          {/* Trend Indicator */}
          {stat.trend && (
            <div className="flex items-center gap-1 mt-2 text-xs">
              <span className="text-slate-400 dark:text-white/60">
                {stat.trend === 'up' ? '↑' : stat.trend === 'down' ? '↓' : '→'}
              </span>
              <span className="text-slate-400 dark:text-white/60">
                {stat.trend === 'up' ? 'Increasing' : stat.trend === 'down' ? 'Decreasing' : 'Stable'}
              </span>
            </div>
          )}
        </motion.div>
      ))}
    </div>
  );
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

export default {
  EnhancedDayCell,
  EnhancedEventChip,
  EnhancedWeekdayHeader,
  EnhancedMonthHeader,
  EnhancedTimeSlot,
  EnhancedStatsPanel,
  defaultTheme,
};
