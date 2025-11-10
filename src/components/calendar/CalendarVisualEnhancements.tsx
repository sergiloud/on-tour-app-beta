/**
 * Calendar Visual Enhancements
 *
 * Mejoras visuales SUTILES para componentes existentes:
 * - Mejora de botones (tamaños, hover effects, transiciones)
 * - Mejora de chips de eventos (sombras, borders, animations)
 * - Mejora de celdas de día (contrast, spacing, visual feedback)
 * - Mejora de tipografía y espaciado
 *
 * NO CAMBIA LA ESTRUCTURA - solo mejora lo visual
 */

import React from 'react';
import { motion } from 'framer-motion';

/**
 * Enhanced Button - Mejora visual de botones existentes
 * Compatible con botones que usan className normalmente
 */
export const EnhancedButtonStyles = {
  // Clase para botones principales mejorados
  primary: 'px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-black font-semibold shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200',

  // Clase para botones secundarios mejorados
  secondary: 'px-4 py-2.5 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-white font-medium transition-all duration-200 border border-slate-300 dark:border-white/20 hover:border-white/30',

  // Clase para botones pequeños mejorados
  small: 'px-3 py-1.5 rounded-lg bg-white/5 hover:bg-slate-200 dark:bg-white/10 text-white text-sm font-medium transition-colors duration-200',

  // Clase para botones de icono mejorados
  icon: 'p-2.5 rounded-lg hover:bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/70 hover:text-white transition-all duration-200',
};

/**
 * Enhanced Event Chip - Mejora visual de chips de eventos
 * Envolver componentes existentes de EventChip
 */
export const EnhancedEventChipStyles = {
  // Estilos base para un evento
  base: 'px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer',

  // Estados visuales
  states: {
    confirmed: 'bg-green-500/20 text-green-100 border border-green-500/30 hover:bg-green-500/30 shadow-lg hover:shadow-green-500/20',
    pending: 'bg-amber-500/20 text-amber-100 border border-amber-500/30 hover:bg-amber-500/30 shadow-lg hover:shadow-amber-500/20',
    tentative: 'bg-blue-500/20 text-blue-100 border border-blue-500/30 hover:bg-blue-500/30 shadow-lg hover:shadow-blue-500/20',
    cancelled: 'bg-red-500/20 text-red-100 border border-red-500/30 line-through opacity-70 hover:opacity-80',
  },
};

/**
 * Enhanced Day Cell - Mejora visual de celdas de día
 * Envolver celdas existentes sin cambiar lógica
 */
export const EnhancedDayCellStyles = {
  // Contenedor mejorado
  container: 'rounded-lg p-3 transition-all duration-200 hover:shadow-md',

  // Estados
  today: 'bg-gradient-to-br from-accent-500/20 to-accent-600/10 border-2 border-accent-500/50',
  selected: 'bg-slate-200 dark:bg-white/10 border border-white/30 shadow-lg',
  weekend: 'bg-white/3 hover:bg-white/5',
  other_month: 'opacity-40 hover:opacity-60',
};

/**
 * Wrapper Component - Mejorador visual para botones existentes
 */
export const EnhancedButton: React.FC<{
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'small' | 'icon';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  title?: string;
}> = ({ children, variant = 'secondary', className = '', onClick, disabled, title }) => {
  const variantClass = EnhancedButtonStyles[variant];
  const disabledClass = disabled ? 'opacity-50 cursor-not-allowed' : '';

  return (
    <motion.button
      className={`${variantClass} ${disabledClass} ${className}`.trim()}
      onClick={onClick}
      disabled={disabled}
      title={title}
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.button>
  );
};

/**
 * Wrapper para EventChip existentes - Agrega efectos visuales
 */
export const EnhancedEventChipWrapper: React.FC<{
  children: React.ReactNode;
  status?: 'confirmed' | 'pending' | 'tentative' | 'cancelled';
  onClick?: () => void;
  className?: string;
}> = ({ children, status = 'pending', onClick, className = '' }) => {
  const statusClass = EnhancedEventChipStyles.states[status];
  const baseClass = EnhancedEventChipStyles.base;

  return (
    <motion.div
      className={`${baseClass} ${statusClass} ${className}`.trim()}
      onClick={onClick}
      whileHover={{ scale: 1.05, y: -2 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.15 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Wrapper para celdas de día - Mejorador visual puro
 */
export const EnhancedDayCellWrapper: React.FC<{
  children: React.ReactNode;
  isToday?: boolean;
  isSelected?: boolean;
  isWeekend?: boolean;
  isOtherMonth?: boolean;
  onClick?: () => void;
  className?: string;
}> = ({
  children,
  isToday = false,
  isSelected = false,
  isWeekend = false,
  isOtherMonth = false,
  onClick,
  className = ''
}) => {
  const baseClass = EnhancedDayCellStyles.container;
  const stateClasses = [
    isToday && EnhancedDayCellStyles.today,
    isSelected && EnhancedDayCellStyles.selected,
    !isToday && !isSelected && isWeekend && EnhancedDayCellStyles.weekend,
    isOtherMonth && EnhancedDayCellStyles.other_month,
  ].filter(Boolean).join(' ');

  return (
    <motion.div
      className={`${baseClass} ${stateClasses} ${className}`.trim()}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
};

/**
 * Utilidad: Aplicar estilos mejorados a strings de clase
 */
export const applyEnhancedStyles = {
  toButton: (currentClass: string, variant: 'primary' | 'secondary' | 'small' | 'icon' = 'secondary'): string => {
    const variantClass = EnhancedButtonStyles[variant];
    return `${currentClass} ${variantClass}`.trim();
  },

  toEventChip: (currentClass: string, status: 'confirmed' | 'pending' | 'tentative' | 'cancelled' = 'pending'): string => {
    const statusClass = EnhancedEventChipStyles.states[status];
    return `${currentClass} ${EnhancedEventChipStyles.base} ${statusClass}`.trim();
  },

  toDayCell: (
    currentClass: string,
    options: {
      isToday?: boolean;
      isSelected?: boolean;
      isWeekend?: boolean;
      isOtherMonth?: boolean;
    } = {}
  ): string => {
    const stateClasses = [
      options.isToday && EnhancedDayCellStyles.today,
      options.isSelected && EnhancedDayCellStyles.selected,
      !options.isToday && !options.isSelected && options.isWeekend && EnhancedDayCellStyles.weekend,
      options.isOtherMonth && EnhancedDayCellStyles.other_month,
    ].filter(Boolean).join(' ');

    return `${currentClass} ${EnhancedDayCellStyles.container} ${stateClasses}`.trim();
  },
};

/**
 * Colecciones de estilos para diferentes elementos
 */
export const CalendarStyleTokens = {
  colors: {
    primary: 'from-accent-500 to-accent-600',
    success: 'from-green-500 to-green-600',
    warning: 'from-amber-500 to-amber-600',
    danger: 'from-red-500 to-red-600',
    info: 'from-blue-500 to-blue-600',
  },

  shadows: {
    sm: 'shadow-md',
    md: 'shadow-lg',
    lg: 'shadow-xl',
    xl: 'shadow-2xl',
  },

  transitions: {
    fast: 'transition-all duration-150',
    normal: 'transition-all duration-200',
    slow: 'transition-all duration-300',
  },

  borders: {
    subtle: 'border border-white/10',
    light: 'border border-white/20',
    medium: 'border border-white/30',
    strong: 'border-2 border-white/50',
  },

  spacing: {
    buttonPadding: 'px-4 py-2.5',
    chipPadding: 'px-3 py-1.5',
    cellPadding: 'p-3',
  },

  radius: {
    sm: 'rounded-md',
    md: 'rounded-lg',
    lg: 'rounded-xl',
    xl: 'rounded-2xl',
  },
};

export default {
  EnhancedButtonStyles,
  EnhancedEventChipStyles,
  EnhancedDayCellStyles,
  EnhancedButton,
  EnhancedEventChipWrapper,
  EnhancedDayCellWrapper,
  applyEnhancedStyles,
  CalendarStyleTokens,
};
