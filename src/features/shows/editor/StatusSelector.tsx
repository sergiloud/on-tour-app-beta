import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, MessageCircle, Clock, RotateCw, X, Archive } from 'lucide-react'
import { t } from '../../../lib/i18n'
import StatusBadge from '../../../ui/StatusBadge'

export type ShowStatus = 'offer' | 'pending' | 'confirmed' | 'postponed' | 'canceled' | 'archived';

export interface StatusSelectorProps {
  value: ShowStatus;
  onChange: (status: ShowStatus) => void;
  label?: string;
  help?: string;
  disabled?: boolean;
}

/**
 * Status Configuration
 * Centralized configuration for all status options
 * Easy to maintain and extend in the future
 */
interface StatusOption {
  value: ShowStatus
  labelKey: string
  bgColor: string
  borderColor: string
  selectedBg: string
  selectedBorder: string
  selectedShadow: string
  accentColor: string
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>
}

const STATUS_OPTIONS: StatusOption[] = [
  {
    value: 'offer',
    labelKey: 'shows.status.offer',
    bgColor: 'bg-amber-500/5',
    borderColor: 'border-amber-500/20',
    selectedBg: 'bg-amber-500/15',
    selectedBorder: 'border-amber-500/40',
    selectedShadow: 'shadow-lg shadow-amber-500/20',
    accentColor: 'text-amber-400',
    icon: MessageCircle,
  },
  {
    value: 'pending',
    labelKey: 'shows.status.pending',
    bgColor: 'bg-blue-500/5',
    borderColor: 'border-blue-500/20',
    selectedBg: 'bg-blue-500/15',
    selectedBorder: 'border-blue-500/40',
    selectedShadow: 'shadow-lg shadow-blue-500/20',
    accentColor: 'text-blue-400',
    icon: Clock,
  },
  {
    value: 'confirmed',
    labelKey: 'shows.status.confirmed',
    bgColor: 'bg-green-500/5',
    borderColor: 'border-green-500/20',
    selectedBg: 'bg-green-500/15',
    selectedBorder: 'border-green-500/40',
    selectedShadow: 'shadow-lg shadow-green-500/20',
    accentColor: 'text-green-400',
    icon: CheckCircle,
  },
  {
    value: 'postponed',
    labelKey: 'shows.status.postponed',
    bgColor: 'bg-orange-500/5',
    borderColor: 'border-orange-500/20',
    selectedBg: 'bg-orange-500/15',
    selectedBorder: 'border-orange-500/40',
    selectedShadow: 'shadow-lg shadow-orange-500/20',
    accentColor: 'text-orange-400',
    icon: RotateCw,
  },
  {
    value: 'canceled',
    labelKey: 'shows.status.canceled',
    bgColor: 'bg-red-500/5',
    borderColor: 'border-red-500/20',
    selectedBg: 'bg-red-500/15',
    selectedBorder: 'border-red-400/40',
    selectedShadow: 'shadow-lg shadow-red-500/20',
    accentColor: 'text-red-400',
    icon: X,
  },
  {
    value: 'archived',
    labelKey: 'shows.status.archived',
    bgColor: 'bg-slate-500/5',
    borderColor: 'border-slate-500/20',
    selectedBg: 'bg-slate-500/15',
    selectedBorder: 'border-slate-500/40',
    selectedShadow: 'shadow-lg shadow-slate-500/20',
    accentColor: 'text-slate-400',
    icon: Archive,
  },
]

/**
 * Premium Status Selector
 * - Glassmorphism with layoutId animations
 * - Framer Motion spring physics
 * - i18n support with centralized configuration
 * - Responsive grid (2 cols mobile, 3 cols desktop)
 * - lucide-react icons for premium feel
 */
export const StatusSelector: React.FC<StatusSelectorProps> = ({
  value,
  onChange,
  label,
  help,
  disabled = false,
}) => {
  const handleStatusChange = (newStatus: ShowStatus) => {
    if (!disabled) {
      onChange(newStatus);
    }
  };

  const selectedOption = STATUS_OPTIONS.find(opt => opt.value === value);

  return (
    <div className="flex flex-col gap-2.5">
      {label && (
        <div className="flex items-center gap-2" id="status-label">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
            {label}
          </label>
          {help && (
            <span className="text-xs lowercase tracking-normal opacity-50 font-normal">
              {help}
            </span>
          )}
        </div>
      )}

      {/* Status Grid - Responsive (2 cols mobile, 3 cols desktop) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 relative" role="group" aria-labelledby={label ? "status-label" : undefined}>
        {/* Animated Background Indicator */}
        <AnimatePresence mode="wait">
          {selectedOption && (
            <motion.div
              key={`indicator-${selectedOption.value}`}
              layoutId="status-selector-indicator"
              className={`absolute rounded-lg border-2 pointer-events-none ${selectedOption.selectedBorder} ${selectedOption.selectedShadow}`}
              style={{
                background: selectedOption.selectedBg,
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              aria-hidden="true"
            />
          )}
        </AnimatePresence>

        {STATUS_OPTIONS.map((option) => {
          const isSelected = value === option.value;
          const tooltipKey = `shows.status.${option.value}.tooltip`;
          const tooltipDesc = t(tooltipKey);
          const titleAttr = tooltipDesc && tooltipDesc !== tooltipKey ? tooltipDesc : undefined;
          const statusLabel = t(option.labelKey) || option.value.charAt(0).toUpperCase() + option.value.slice(1);

          return (
            <motion.button
              key={option.value}
              type="button"
              disabled={disabled}
              onClick={() => handleStatusChange(option.value)}
              title={titleAttr}
              aria-label={`${t('shows.editor.label.status') || 'Status'}: ${statusLabel}`}
              aria-pressed={isSelected}
              whileHover={!disabled ? { scale: 1.02 } : {}}
              whileTap={!disabled ? { scale: 0.97 } : {}}
              className={`relative px-2.5 py-2.5 rounded-lg border-2 transition-all duration-200 flex flex-col items-center justify-center gap-1 backdrop-blur-sm z-10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-400 overflow-hidden ${
                isSelected
                  ? `${option.borderColor} text-white`
                  : `${option.bgColor} ${option.borderColor} border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 hover:bg-white/5`
              } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              {/* Status Icon */}
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                className="shrink-0"
              >
                {React.createElement(option.icon, {
                  className: `w-4 h-4 ${isSelected ? option.accentColor : 'text-white/70'} transition-all duration-200`,
                  strokeWidth: 2.5,
                })}
              </motion.div>

              {/* Animated Check Icon - Only for selected */}
              <AnimatePresence mode="wait">
                {isSelected && (
                  <motion.div
                    key="check-icon"
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    exit={{ scale: 0, rotate: 180 }}
                    transition={{ type: 'spring', stiffness: 400, damping: 15 }}
                    className="absolute top-0.5 right-0.5 shrink-0"
                    aria-hidden="true"
                  >
                    <CheckCircle className={`w-3.5 h-3.5 ${option.accentColor}`} strokeWidth={2.5} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      {/* Hint text - Subtle and informative */}
      <p className="text-xs text-slate-400 dark:text-white/40 text-center italic pt-1" id="status-hint">
        {t('shows.editor.status.hint') || 'Click to change status'}
      </p>
    </div>
  );
};

export default StatusSelector;
