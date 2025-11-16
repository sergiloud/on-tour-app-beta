/**
 * RoadmapNode - Componente Polimórfico
 * 
 * Renderiza diferentes tipos de nodos del roadmap siguiendo el design system.
 * Cada tipo (show, travel, task, finance) tiene su propia UI pero mantiene consistencia visual.
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  Plane, 
  CheckSquare, 
  DollarSign, 
  Rocket,
  Flag,
  Clock,
  Users,
  MapPin,
  TrendingUp
} from 'lucide-react';
import type { RoadmapNode as RoadmapNodeType } from '../types';
import { t } from '../../../lib/i18n';

interface RoadmapNodeProps {
  node: RoadmapNodeType;
  isSelected?: boolean;
  isSimulation?: boolean;
  onClick?: (node: RoadmapNodeType) => void;
  onEdit?: (node: RoadmapNodeType) => void;
  className?: string;
}

// Configuración por tipo de nodo - siguiendo design system
const NODE_CONFIGS = {
  show: {
    color: 'emerald',
    icon: Calendar,
    gradient: 'from-emerald-500/20 to-emerald-600/10',
    border: 'border-emerald-500/30',
    text: 'text-emerald-400'
  },
  travel: {
    color: 'blue', 
    icon: Plane,
    gradient: 'from-blue-500/20 to-blue-600/10',
    border: 'border-blue-500/30',
    text: 'text-blue-400'
  },
  task: {
    color: 'amber',
    icon: CheckSquare,
    gradient: 'from-amber-500/20 to-amber-600/10', 
    border: 'border-amber-500/30',
    text: 'text-amber-400'
  },
  finance: {
    color: 'purple',
    icon: DollarSign,
    gradient: 'from-purple-500/20 to-purple-600/10',
    border: 'border-purple-500/30', 
    text: 'text-purple-400'
  },
  release: {
    color: 'accent',
    icon: Rocket,
    gradient: 'from-accent-500/20 to-accent-600/10',
    border: 'border-accent-500/30',
    text: 'text-accent-400'
  },
  milestone: {
    color: 'red',
    icon: Flag,
    gradient: 'from-red-500/20 to-red-600/10',
    border: 'border-red-500/30',
    text: 'text-red-400'
  }
} as const;

// Status badges siguiendo design system
const STATUS_CONFIGS = {
  confirmed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  pending: { bg: 'bg-amber-500/20', text: 'text-amber-400', border: 'border-amber-500/30' },
  cancelled: { bg: 'bg-red-500/20', text: 'text-red-400', border: 'border-red-500/30' },
  completed: { bg: 'bg-emerald-500/20', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  draft: { bg: 'bg-white/10', text: 'text-white/60', border: 'border-white/20' }
} as const;

const PRIORITY_CONFIGS = {
  low: { indicator: 'bg-emerald-500' },
  medium: { indicator: 'bg-amber-500' },
  high: { indicator: 'bg-orange-500' },
  critical: { indicator: 'bg-red-500' }
} as const;

export const RoadmapNode: React.FC<RoadmapNodeProps> = ({
  node,
  isSelected = false,
  isSimulation = false,
  onClick,
  onEdit,
  className = ''
}) => {
  const config = NODE_CONFIGS[node.type];
  const statusConfig = STATUS_CONFIGS[node.status];
  const priorityConfig = PRIORITY_CONFIGS[node.priority];
  const Icon = config.icon;

  const handleClick = () => {
    onClick?.(node);
  };

  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit?.(node);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric'
    });
  };

  const renderNodeContent = () => {
    switch (node.type) {
      case 'show':
        return (
          <>
            <div className="text-sm font-semibold text-white tracking-tight mb-1">
              {node.title}
            </div>
            <div className="text-xs text-white/40 mb-2">
              {node.location?.city} • {formatDate(node.startDate)}
            </div>
            {node.metadata.fee && (
              <div className="text-xs font-medium text-white/70 tabular-nums">
                ${node.metadata.fee.toLocaleString()}
              </div>
            )}
            {node.metadata.capacity && node.metadata.ticketsSold && (
              <div className="text-[10px] text-white/30 mt-1">
                {node.metadata.ticketsSold.toLocaleString()} / {node.metadata.capacity.toLocaleString()} sold
              </div>
            )}
          </>
        );

      case 'travel':
        return (
          <>
            <div className="text-sm font-semibold text-white tracking-tight mb-1">
              {node.title}
            </div>
            <div className="text-xs text-white/40 mb-2">
              {formatDate(node.startDate)}
              {node.endDate && ` - ${formatDate(node.endDate)}`}
            </div>
            {node.metadata.cost && (
              <div className="text-xs font-medium text-white/70 tabular-nums">
                ${node.metadata.cost.toLocaleString()}
              </div>
            )}
          </>
        );

      case 'task':
        return (
          <>
            <div className="text-sm font-semibold text-white tracking-tight mb-1">
              {node.title}
            </div>
            <div className="text-xs text-white/40 mb-2">
              Due {formatDate(node.startDate)}
            </div>
            {typeof node.metadata.progress === 'number' && (
              <div className="flex items-center gap-2 mb-2">
                <div className="flex-1 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <div 
                    className={`h-full bg-gradient-to-r ${config.gradient} transition-all`}
                    style={{ width: `${node.metadata.progress}%` }}
                  />
                </div>
                <span className="text-xs text-white/60 tabular-nums">
                  {node.metadata.progress}%
                </span>
              </div>
            )}
            {node.assignedTo && node.assignedTo.length > 0 && (
              <div className="flex items-center gap-1">
                <Users className="w-3 h-3 text-white/40" />
                <span className="text-xs text-white/40">
                  {node.assignedTo.length} assigned
                </span>
              </div>
            )}
          </>
        );

      case 'finance':
        return (
          <>
            <div className="text-sm font-semibold text-white tracking-tight mb-1">
              {node.title}
            </div>
            <div className="text-xs text-white/40 mb-2">
              {node.metadata.category} • {formatDate(node.startDate)}
            </div>
            {node.metadata.amount && (
              <div className={`text-sm font-bold tabular-nums ${
                node.metadata.amount > 0 ? 'text-emerald-400' : 'text-red-400'
              }`}>
                {node.metadata.amount > 0 ? '+' : ''}$
                {Math.abs(node.metadata.amount).toLocaleString()}
              </div>
            )}
          </>
        );

      case 'release':
        return (
          <>
            <div className="text-sm font-semibold text-white tracking-tight mb-1">
              {node.title}
            </div>
            <div className="text-xs text-white/40 mb-2">
              {node.metadata.version} • {formatDate(node.startDate)}
            </div>
            {node.metadata.deliverables && (
              <div className="text-xs text-white/50">
                {node.metadata.deliverables.length} deliverable{node.metadata.deliverables.length !== 1 ? 's' : ''}
              </div>
            )}
          </>
        );

      case 'milestone':
        return (
          <>
            <div className="text-sm font-semibold text-white tracking-tight mb-1">
              {node.title}
            </div>
            <div className="text-xs text-white/40 mb-2">
              {formatDate(node.startDate)}
            </div>
            {node.description && (
              <div className="text-xs text-white/50 line-clamp-2">
                {node.description}
              </div>
            )}
          </>
        );

      default:
        return (
          <>
            <div className="text-sm font-semibold text-white tracking-tight mb-1">
              {node.title}
            </div>
            <div className="text-xs text-white/40">
              {formatDate(node.startDate)}
            </div>
          </>
        );
    }
  };

  return (
    <motion.div
      whileHover={{ scale: 1.01, y: -1 }}
      whileTap={{ scale: 0.99 }}
      onClick={handleClick}
      className={`
        glass rounded-xl p-4 border border-white/10 transition-all cursor-pointer group relative
        ${isSelected ? `${config.border} shadow-lg` : 'hover:border-accent-500/30'}
        ${isSimulation ? 'ring-2 ring-amber-500/50 ring-offset-2 ring-offset-transparent' : ''}
        ${className}
      `}
    >
      {/* Priority indicator */}
      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full ${priorityConfig.indicator}`} />

      {/* Simulation indicator */}
      {isSimulation && (
        <div className="absolute -top-1 -right-1 w-3 h-3 bg-amber-500 rounded-full animate-pulse" />
      )}

      <div className="flex items-start gap-3">
        {/* Icon container siguiendo design system */}
        <div className={`
          w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} 
          flex items-center justify-center shadow-sm border border-white/5
          group-hover:scale-105 transition-transform
        `}>
          <Icon className={`w-5 h-5 ${config.text}`} />
        </div>

        {/* Content area */}
        <div className="flex-1 min-w-0">
          {renderNodeContent()}
        </div>
      </div>

      {/* Status badge */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/10">
        <span className={`
          text-[10px] uppercase tracking-wider font-medium px-2 py-1 rounded-lg 
          ${statusConfig.bg} ${statusConfig.text} border ${statusConfig.border}
        `}>
          {node.status}
        </span>

        {/* Location indicator */}
        {node.location?.city && (
          <div className="flex items-center gap-1 text-xs text-white/40">
            <MapPin className="w-3 h-3" />
            <span>{node.location.city}</span>
          </div>
        )}

        {/* Edit button */}
        {onEdit && (
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleEdit}
            className="p-1 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
            aria-label="Edit node"
          >
            <TrendingUp className="w-3 h-3 text-white/60" />
          </motion.button>
        )}
      </div>

      {/* Time indicator */}
      <div className="flex items-center gap-1 mt-2 text-xs text-white/30">
        <Clock className="w-3 h-3" />
        <span>{formatDate(node.startDate)}</span>
        {node.endDate && (
          <>
            <span className="mx-1">→</span>
            <span>{formatDate(node.endDate)}</span>
          </>
        )}
      </div>
    </motion.div>
  );
};