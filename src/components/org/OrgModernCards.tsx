import React from 'react';
import { motion } from 'framer-motion';
import { AlertCircle, AlertTriangle, Info } from 'lucide-react';

// ============================================================================
// Modern Dashboard-style KPI Cards
// ============================================================================

interface OrgKPICardProps {
  label: string;
  value: string | number;
  subValue?: string | React.ReactNode;
  trend?: {
    symbol: string | React.ReactNode;
    text: string;
    color: string;
  };
  icon?: React.ReactNode;
  color?: 'green' | 'blue' | 'purple' | 'amber' | 'rose' | 'cyan';
  accent?: boolean;
}

const colorMap: Record<string, string> = {
  green: 'from-green-500/20 to-green-600/10 hover:border-green-500/30',
  blue: 'from-blue-500/20 to-blue-600/10 hover:border-blue-500/30',
  purple: 'from-purple-500/20 to-purple-600/10 hover:border-purple-500/30',
  amber: 'from-amber-500/20 to-amber-600/10 hover:border-amber-500/30',
  rose: 'from-rose-500/20 to-rose-600/10 hover:border-rose-500/30',
  cyan: 'from-cyan-500/20 to-cyan-600/10 hover:border-cyan-500/30',
};

export const OrgKPICard: React.FC<OrgKPICardProps> = ({
  label,
  value,
  subValue,
  trend,
  icon,
  color = 'blue',
  accent,
}) => {
  const bgGradient = colorMap[color] || colorMap.blue;

  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0 },
      }}
      className={`glass rounded-xl border border-slate-200 dark:border-white/10 bg-gradient-to-br ${bgGradient} p-4 md:p-5 transition-all duration-300 cursor-pointer group`}
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wider">
          {label}
        </div>
        {icon && (
          <div className="text-lg opacity-60 group-hover:opacity-100 transition-opacity">
            {icon}
          </div>
        )}
      </div>
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`text-2xl md:text-3xl font-bold mb-3 ${
          accent ? 'text-accent-100' : 'text-white/95'
        }`}
      >
        {value}
      </motion.div>
      {(subValue || trend) && (
        <div className="text-xs text-slate-400 dark:text-white/60 flex items-center gap-1.5">
          {trend && <span className={trend.color}>{trend.symbol}</span>}
          <span>{trend?.text || subValue}</span>
        </div>
      )}
    </motion.div>
  );
};

// ============================================================================
// Modern List Items (like Shows and Calendar)
// ============================================================================

interface OrgListItemProps {
  title: string;
  subtitle?: string;
  value?: string | React.ReactNode;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  onClick?: () => void;
  interactive?: boolean;
  badge?: {
    label: string;
    color: 'success' | 'warning' | 'info' | 'danger';
  };
}

const badgeColors = {
  success: 'bg-emerald-500/15 text-emerald-300 border-emerald-400/20',
  warning: 'bg-amber-500/15 text-amber-200 border-amber-400/25',
  info: 'bg-sky-500/15 text-sky-200 border-sky-400/25',
  danger: 'bg-rose-500/15 text-rose-300 border-rose-400/20',
};

export const OrgListItem: React.FC<OrgListItemProps> = ({
  title,
  subtitle,
  value,
  icon,
  action,
  onClick,
  interactive = false,
  badge,
}) => {
  return (
    <motion.div
      whileHover={interactive ? { x: 4 } : undefined}
      className={`flex items-center justify-between gap-4 p-3 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 transition-all duration-300 ${
        interactive ? 'cursor-pointer' : ''
      }`}
      onClick={onClick}
    >
      <div className="flex items-center gap-3 flex-1 min-w-0">
        {icon && <div className="flex-shrink-0">{icon}</div>}
        <div className="min-w-0 flex-1">
          <div className="text-sm font-medium text-slate-700 dark:text-white/90">{title}</div>
          {subtitle && (
            <div className="text-xs text-slate-400 dark:text-white/60 truncate">{subtitle}</div>
          )}
        </div>
      </div>
      {badge && (
        <span
          className={`px-2.5 py-1 rounded-lg text-[10px] font-medium border transition-colors cursor-default ${
            badgeColors[badge.color]
          }`}
        >
          {badge.label}
        </span>
      )}
      {value && (
        <div className="text-sm font-semibold text-slate-700 dark:text-slate-700 dark:text-white/90 text-right flex-shrink-0">
          {value}
        </div>
      )}
      {action && <div className="flex-shrink-0">{action}</div>}
    </motion.div>
  );
};

// ============================================================================
// Section Header with Title and Actions
// ============================================================================

interface OrgSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export const OrgSectionHeader: React.FC<OrgSectionHeaderProps> = ({
  title,
  subtitle,
  icon,
  action,
}) => {
  return (
    <div className="flex items-start justify-between mb-4">
      <div className="flex items-start gap-3 flex-1">
        {icon && <div className="flex-shrink-0 mt-1">{icon}</div>}
        <div className="flex-1">
          <h3 className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase tracking-wider">
            {title}
          </h3>
          {subtitle && (
            <p className="text-xs text-slate-400 dark:text-white/60 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  );
};

// ============================================================================
// Empty State Component
// ============================================================================

interface OrgEmptyStateProps {
  icon?: string | React.ReactNode;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const OrgEmptyState: React.FC<OrgEmptyStateProps> = ({
  icon,
  title,
  description,
  action,
}) => (
  <div className="glass rounded-xl border border-dashed border-white/15 p-6 text-center bg-white/2 hover:border-slate-300 dark:border-white/20 transition-all duration-300">
    {icon && (
      <div className="flex justify-center mb-3 text-slate-300 dark:text-white/50" aria-hidden>
        {typeof icon === 'string' ? <span className="text-3xl">{icon}</span> : icon}
      </div>
    )}
    <div className="text-slate-700 dark:text-slate-700 dark:text-white/90 font-medium text-sm">{title}</div>
    {description && (
      <div className="text-xs text-slate-400 dark:text-white/60 mt-2">{description}</div>
    )}
    {action && (
      <div className="mt-4">
        <button
          onClick={action.onClick}
          className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 hover:from-accent-500/35 hover:to-accent-600/20 text-accent-100 border border-accent-500/40 font-semibold text-xs shadow-lg hover:shadow-lg transition-all cursor-pointer"
        >
          {action.label}
        </button>
      </div>
    )}
  </div>
);

// ============================================================================
// Stat Row Component (for metrics)
// ============================================================================

interface OrgStatRowProps {
  label: string;
  value: string | React.ReactNode;
  subValue?: string;
  icon?: React.ReactNode;
  color?: 'default' | 'success' | 'warning' | 'danger';
}

const statColors = {
  default: 'text-slate-700 dark:text-slate-700 dark:text-white/90 bg-white/5',
  success: 'text-green-400 bg-green-500/10',
  warning: 'text-amber-400 bg-amber-500/10',
  danger: 'text-rose-400 bg-rose-500/10',
};

export const OrgStatRow: React.FC<OrgStatRowProps> = ({
  label,
  value,
  subValue,
  icon,
  color = 'default',
}) => (
  <motion.div
    whileHover={{ x: 4 }}
    className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-100 dark:bg-white/5 transition-all duration-300 cursor-pointer"
  >
    <div className="flex items-center gap-3">
      {icon && <div className="flex-shrink-0">{icon}</div>}
      <div>
        <div className="text-xs text-slate-400 dark:text-white/60 font-medium">{label}</div>
        {subValue && (
          <div className="text-xs text-slate-400 dark:text-white/40 mt-0.5">{subValue}</div>
        )}
      </div>
    </div>
    <motion.span
      initial={{ scale: 1.2, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`text-sm font-semibold px-2 py-1 rounded-md ${statColors[color]}`}
    >
      {value}
    </motion.span>
  </motion.div>
);

// ============================================================================
// Action Priority Card (like in Shows and Calendar)
// ============================================================================

interface OrgActionCardProps {
  id: string;
  priority: 'high' | 'medium' | 'low';
  title: string;
  description: string;
  action: string;
  onAction: () => void;
}

const priorityColors = {
  high: 'border-red-500/20 bg-red-500/8 hover:bg-red-500/12',
  medium: 'border-amber-500/20 bg-amber-500/8 hover:bg-amber-500/12',
  low: 'border-blue-500/20 bg-blue-500/8 hover:bg-blue-500/12',
};

const priorityBadgeColors = {
  high: 'text-red-400',
  medium: 'text-amber-400',
  low: 'text-blue-400',
};

const priorityIconComponents = {
  high: AlertCircle,
  medium: AlertTriangle,
  low: Info,
};

export const OrgActionCard: React.FC<OrgActionCardProps> = ({
  id,
  priority,
  title,
  description,
  action,
  onAction,
}) => {
  const PriorityIcon = priorityIconComponents[priority];

  return (
    <motion.div
      whileHover={{ x: 4 }}
      className={`rounded-lg border p-4 transition-all duration-300 cursor-pointer ${priorityColors[priority]} group`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <PriorityIcon
              className={`w-4 h-4 flex-shrink-0 ${priorityBadgeColors[priority]}`}
              aria-hidden
            />
            <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-700 dark:text-white/90 line-clamp-2 group-hover:text-white transition-colors">
              {title}
            </h4>
          </div>
          <p className="text-xs text-slate-500 dark:text-white/70 line-clamp-2">{description}</p>
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          onClick={onAction}
          className="px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500/25 via-accent-500/15 to-accent-600/10 border border-accent-500/30 hover:border-accent-500/50 hover:from-accent-500/35 hover:via-accent-500/25 hover:to-accent-600/20 text-accent-200 text-xs font-semibold transition-all duration-300 whitespace-nowrap shadow-lg shadow-accent-500/10 flex-shrink-0 cursor-pointer"
        >
          {action}
        </motion.button>
      </div>
    </motion.div>
  );
};

// ============================================================================
// Container Section (like dashboard layout)
// ============================================================================

interface OrgContainerSectionProps {
  children: React.ReactNode;
  className?: string;
  variants?: any;
}

export const OrgContainerSection: React.FC<OrgContainerSectionProps> = ({
  children,
  className = '',
  variants,
}) => {
  return (
    <motion.div
      className={`space-y-4 lg:space-y-5 ${className}`}
      variants={variants}
      initial="hidden"
      animate="visible"
    >
      {children}
    </motion.div>
  );
};
