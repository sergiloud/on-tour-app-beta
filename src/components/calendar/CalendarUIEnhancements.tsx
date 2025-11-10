import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * CalendarUIEnhancements - Complete Visual Overhaul
 *
 * Componente wrapper que mejora todos los elementos visuales del calendario:
 * - Efectos de animación avanzados
 * - Nuevas interacciones
 * - Efectos visuales modernos
 * - Mejora de accesibilidad
 */

interface CalendarUIEnhancementsProps {
  children: React.ReactNode;
  theme?: 'light' | 'dark' | 'auto';
  enableAnimations?: boolean;
  enableHeatmap?: boolean;
  heatmapMode?: 'none' | 'financial' | 'activity' | 'status';
}

/**
 * Wrapper que agrega efectos visuales a toda la interfaz del calendario
 */
export const CalendarUIEnhancements: React.FC<CalendarUIEnhancementsProps> = ({
  children,
  theme = 'auto',
  enableAnimations = true,
  enableHeatmap = false,
  heatmapMode = 'none',
}) => {
  const [showGrid, setShowGrid] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  // Track mouse position para efecto parallax
  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  return (
    <motion.div
      onMouseMove={handleMouseMove}
      className="relative w-full h-full overflow-hidden"
    >
      {/* Animated background grid */}
      {showGrid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.05 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-grid-pattern pointer-events-none z-0"
        />
      )}

      {/* Glow effect que sigue el mouse */}
      {enableAnimations && (
        <motion.div
          animate={{
            x: mousePos.x,
            y: mousePos.y,
          }}
          transition={{ type: 'tween', duration: 0.3 }}
          className="absolute w-96 h-96 bg-gradient-radial from-blue-500/20 to-transparent rounded-full blur-3xl pointer-events-none -z-10"
          style={{
            left: -192,
            top: -192,
          }}
        />
      )}

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>

      {/* Toggle grid button */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => setShowGrid(!showGrid)}
        className="fixed bottom-6 right-6 p-3 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-white/20 border border-slate-300 dark:border-white/20 text-white text-sm font-semibold transition-all z-50 backdrop-blur-lg"
      >
        {showGrid ? '⊞' : '⊟'}
      </motion.button>
    </motion.div>
  );
};

/**
 * Componente para mejorar eventos individuales
 */
interface EventCardEnhancementProps {
  children: React.ReactNode;
  isSelected?: boolean;
  isDragging?: boolean;
  status?: 'confirmed' | 'pending' | 'cancelled';
  onClick?: () => void;
}

export const EventCardEnhancement: React.FC<EventCardEnhancementProps> = ({
  children,
  isSelected,
  isDragging,
  status = 'confirmed',
  onClick,
}) => {
  const statusConfigs = {
    confirmed: {
      border: 'border-emerald-400/50',
      glow: 'shadow-emerald-500/20',
      bg: 'from-emerald-500/20 to-teal-500/10',
    },
    pending: {
      border: 'border-amber-400/50',
      glow: 'shadow-amber-500/20',
      bg: 'from-amber-500/20 to-orange-500/10',
    },
    cancelled: {
      border: 'border-red-400/50',
      glow: 'shadow-red-500/20',
      bg: 'from-red-500/20 to-pink-500/10',
    },
  };

  const config = statusConfigs[status];

  return (
    <motion.div
      whileHover={{ scale: 1.02, y: -4 }}
      whileTap={{ scale: 0.98 }}
      animate={isDragging ? { scale: 1.05, opacity: 0.9 } : {}}
      className={`
        relative group cursor-pointer
        border-2 ${config.border}
        rounded-lg backdrop-blur-lg
        bg-gradient-to-br ${config.bg}
        transition-all duration-300
        ${isSelected ? `ring-2 ring-blue-500 shadow-lg ${config.glow}` : ''}
        hover:shadow-lg hover:${config.glow}
      `}
      onClick={onClick}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-20 rounded-lg"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.5 }}
      />

      {/* Animated border */}
      {isSelected && (
        <motion.div
          className="absolute inset-0 rounded-lg border-2 border-transparent bg-gradient-to-r from-blue-500 to-purple-500 opacity-50 -z-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
        />
      )}

      {/* Content */}
      <div className="relative">
        {children}
      </div>

      {/* Status indicator dot */}
      <motion.div
        animate={{ scale: [1, 1.2, 1] }}
        transition={{ duration: 2, repeat: Infinity }}
        className={`
          absolute top-2 right-2 w-3 h-3 rounded-full
          ${
            status === 'confirmed'
              ? 'bg-emerald-400 shadow-lg shadow-emerald-500/50'
              : status === 'pending'
              ? 'bg-amber-400 shadow-lg shadow-amber-500/50'
              : 'bg-red-400 shadow-lg shadow-red-500/50'
          }
        `}
      />
    </motion.div>
  );
};

/**
 * Componente para mejorar botones del calendario
 */
interface CalendarButtonProps {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'subtle' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export const CalendarButton: React.FC<CalendarButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  onClick,
  className = '',
}) => {
  const variantClasses = {
    primary: 'bg-gradient-to-r from-blue-500/40 to-purple-500/40 hover:from-blue-500/60 hover:to-purple-500/60 border-blue-400/50 text-white',
    secondary: 'bg-slate-200 dark:bg-white/10 hover:bg-white/20 border-slate-300 dark:border-white/20 text-gray-100',
    subtle: 'bg-white/5 hover:bg-slate-200 dark:bg-white/10 border-slate-200 dark:border-white/10 text-gray-200',
    danger: 'bg-gradient-to-r from-red-500/40 to-rose-500/40 hover:from-red-500/60 hover:to-rose-500/60 border-red-400/50 text-white',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.05 }}
      whileTap={{ scale: disabled ? 1 : 0.95 }}
      onClick={onClick}
      disabled={disabled}
      className={`
        relative font-semibold rounded-lg
        border backdrop-blur-lg transition-all duration-300
        ${variantClasses[variant]}
        ${sizeClasses[size]}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
    >
      {/* Shine effect */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-0 hover:opacity-30 rounded-lg"
        initial={{ x: '-100%' }}
        whileHover={{ x: '100%' }}
        transition={{ duration: 0.5 }}
      />
      <span className="relative">{children}</span>
    </motion.button>
  );
};

/**
 * Componente para modal mejorado
 */
interface EnhancedModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const EnhancedModal: React.FC<EnhancedModalProps> = ({
  isOpen,
  title,
  children,
  onClose,
  size = 'md',
}) => {
  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className={`
              ${sizeClasses[size]} w-full mx-4
              bg-gradient-to-br from-white/10 to-white/5
              border border-slate-300 dark:border-white/20 rounded-xl
              backdrop-blur-lg shadow-2xl
              overflow-hidden
            `}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">{title}</h2>
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="text-gray-400 hover:text-white transition-colors"
              >
                ✕
              </motion.button>
            </div>

            {/* Content */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/**
 * Componente para tooltip mejorado
 */
interface EnhancedTooltipProps {
  content: string;
  children: React.ReactNode;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

export const EnhancedTooltip: React.FC<EnhancedTooltipProps> = ({
  content,
  children,
  position = 'top',
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
  };

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {children}

      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className={`
              absolute ${positionClasses[position]}
              px-3 py-2 rounded-lg
              bg-gradient-to-r from-gray-900/95 to-black/95
              border border-white/20
              text-sm text-white font-medium
              whitespace-nowrap z-50
              backdrop-blur-lg
            `}
          >
            {content}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

/**
 * Componente para skeleton loader mejorado
 */
interface EnhancedSkeletonProps {
  count?: number;
  height?: string;
  width?: string;
  className?: string;
}

export const EnhancedSkeleton: React.FC<EnhancedSkeletonProps> = ({
  count = 1,
  height = 'h-4',
  width = 'w-full',
  className = '',
}) => {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className={`
            ${width} ${height}
            bg-gradient-to-r from-white/10 via-white/5 to-white/10
            rounded-lg
          `}
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />
      ))}
    </div>
  );
};

export default {
  CalendarUIEnhancements,
  EventCardEnhancement,
  CalendarButton,
  EnhancedModal,
  EnhancedTooltip,
  EnhancedSkeleton,
};
