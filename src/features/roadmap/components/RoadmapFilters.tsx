/**
 * RoadmapFilters - Componente de Filtros
 * 
 * Filtros inteligentes siguiendo el design system identificado.
 * Incluye filtros por tipo, estado, prioridad, usuarios asignados y rango de fechas.
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar,
  Plane, 
  CheckSquare,
  DollarSign,
  Rocket,
  Flag,
  Users,
  X,
  Filter,
  ChevronDown,
  Clock
} from 'lucide-react';
import type { RoadmapFilters as RoadmapFiltersType, UserInfo, RoadmapNode } from '../types';
import { t } from '../../../lib/i18n';

interface RoadmapFiltersProps {
  filters: RoadmapFiltersType;
  users: UserInfo[];
  onFiltersChange: (filters: Partial<RoadmapFiltersType>) => void;
  className?: string;
}

// Configuración de filtros por tipo
const TYPE_FILTERS = [
  { 
    key: 'show' as const, 
    label: 'Shows', 
    icon: Calendar, 
    color: 'emerald',
    bg: 'bg-emerald-500/20',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30'
  },
  { 
    key: 'travel' as const, 
    label: 'Travel', 
    icon: Plane, 
    color: 'blue',
    bg: 'bg-blue-500/20',
    text: 'text-blue-400', 
    border: 'border-blue-500/30'
  },
  { 
    key: 'task' as const, 
    label: 'Tasks', 
    icon: CheckSquare, 
    color: 'amber',
    bg: 'bg-amber-500/20',
    text: 'text-amber-400',
    border: 'border-amber-500/30'
  },
  { 
    key: 'finance' as const, 
    label: 'Finance', 
    icon: DollarSign, 
    color: 'purple',
    bg: 'bg-purple-500/20',
    text: 'text-purple-400',
    border: 'border-purple-500/30'
  },
  { 
    key: 'release' as const, 
    label: 'Releases', 
    icon: Rocket, 
    color: 'accent',
    bg: 'bg-accent-500/20',
    text: 'text-accent-400',
    border: 'border-accent-500/30'
  },
  { 
    key: 'milestone' as const, 
    label: 'Milestones', 
    icon: Flag, 
    color: 'red',
    bg: 'bg-red-500/20',
    text: 'text-red-400',
    border: 'border-red-500/30'
  }
];

const STATUS_FILTERS = [
  { key: 'confirmed' as const, label: 'Confirmed', color: 'emerald' },
  { key: 'pending' as const, label: 'Pending', color: 'amber' },
  { key: 'draft' as const, label: 'Draft', color: 'gray' },
  { key: 'completed' as const, label: 'Completed', color: 'emerald' },
  { key: 'cancelled' as const, label: 'Cancelled', color: 'red' }
];

const PRIORITY_FILTERS = [
  { key: 'low' as const, label: 'Low', color: 'emerald' },
  { key: 'medium' as const, label: 'Medium', color: 'amber' },
  { key: 'high' as const, label: 'High', color: 'orange' },
  { key: 'critical' as const, label: 'Critical', color: 'red' }
];

export const RoadmapFilters: React.FC<RoadmapFiltersProps> = ({
  filters,
  users,
  onFiltersChange,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [dateRange, setDateRange] = useState({
    start: filters.dateRange.start || '',
    end: filters.dateRange.end || ''
  });

  // Update date range when filters change externally
  useEffect(() => {
    setDateRange({
      start: filters.dateRange.start || '',
      end: filters.dateRange.end || ''
    });
  }, [filters.dateRange]);

  const handleTypeToggle = (type: RoadmapNode['type']) => {
    const currentTypes = filters.types || [];
    const newTypes = currentTypes.includes(type)
      ? currentTypes.filter(t => t !== type)
      : [...currentTypes, type];
    
    onFiltersChange({ 
      types: newTypes.length === 0 ? null : newTypes 
    });
  };

  const handleStatusToggle = (status: RoadmapNode['status']) => {
    const currentStatus = filters.status || [];
    const newStatus = currentStatus.includes(status)
      ? currentStatus.filter(s => s !== status)
      : [...currentStatus, status];
    
    onFiltersChange({ 
      status: newStatus.length === 0 ? null : newStatus 
    });
  };

  const handlePriorityToggle = (priority: RoadmapNode['priority']) => {
    const currentPriority = filters.priority || [];
    const newPriority = currentPriority.includes(priority)
      ? currentPriority.filter(p => p !== priority)
      : [...currentPriority, priority];
    
    onFiltersChange({ 
      priority: newPriority.length === 0 ? null : newPriority 
    });
  };

  const handleUserToggle = (userId: string) => {
    const currentUsers = filters.assignedTo || [];
    const newUsers = currentUsers.includes(userId)
      ? currentUsers.filter(u => u !== userId)
      : [...currentUsers, userId];
    
    onFiltersChange({ 
      assignedTo: newUsers.length === 0 ? null : newUsers 
    });
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const newDateRange = { ...dateRange, [field]: value };
    setDateRange(newDateRange);
    
    onFiltersChange({
      dateRange: {
        start: newDateRange.start || null,
        end: newDateRange.end || null
      }
    });
  };

  const clearAllFilters = () => {
    onFiltersChange({
      types: null,
      status: null,
      priority: null,
      assignedTo: null,
      dateRange: { start: null, end: null }
    });
    setDateRange({ start: '', end: '' });
  };

  const hasActiveFilters = !!(
    filters.types?.length || 
    filters.status?.length || 
    filters.priority?.length || 
    filters.assignedTo?.length ||
    filters.dateRange.start ||
    filters.dateRange.end
  );

  return (
    <div className={`glass rounded-xl border border-white/10 overflow-hidden ${className}`}>
      {/* Header siguiendo design system */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center border border-white/5">
              <Filter className="w-5 h-5 text-accent-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white tracking-tight">
                Filters
              </h3>
              <p className="text-xs text-white/40">
                Filter events by type, status, and more
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={clearAllFilters}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/30 transition-all"
              >
                Clear All
              </motion.button>
            )}
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className={`p-2 rounded-lg transition-all ${
                isExpanded ? 'bg-accent-500/20 text-accent-400' : 'bg-white/5 text-white/60'
              }`}
            >
              <ChevronDown className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} />
            </motion.button>
          </div>
        </div>
      </div>

      {/* Filters content */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-6 space-y-6">
              
              {/* Types Filter */}
              <div>
                <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Event Types
                </div>
                <div className="flex flex-wrap gap-2">
                  {TYPE_FILTERS.map((type) => {
                    const isActive = filters.types?.includes(type.key);
                    const Icon = type.icon;
                    
                    return (
                      <motion.button
                        key={type.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleTypeToggle(type.key)}
                        className={`
                          flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all
                          ${isActive 
                            ? `${type.bg} ${type.text} border ${type.border}` 
                            : 'bg-white/5 text-white/60 border border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{type.label}</span>
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Status Filter */}
              <div>
                <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Status
                </div>
                <div className="flex flex-wrap gap-2">
                  {STATUS_FILTERS.map((status) => {
                    const isActive = filters.status?.includes(status.key);
                    
                    return (
                      <motion.button
                        key={status.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleStatusToggle(status.key)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all border
                          ${isActive 
                            ? `bg-${status.color}-500/20 text-${status.color}-400 border-${status.color}-500/30`
                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        {status.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Priority Filter */}
              <div>
                <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Priority
                </div>
                <div className="flex flex-wrap gap-2">
                  {PRIORITY_FILTERS.map((priority) => {
                    const isActive = filters.priority?.includes(priority.key);
                    
                    return (
                      <motion.button
                        key={priority.key}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handlePriorityToggle(priority.key)}
                        className={`
                          px-3 py-2 rounded-lg text-sm font-medium transition-all border
                          ${isActive 
                            ? `bg-${priority.color}-500/20 text-${priority.color}-400 border-${priority.color}-500/30`
                            : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                          }
                        `}
                      >
                        {priority.label}
                      </motion.button>
                    );
                  })}
                </div>
              </div>

              {/* Assigned Users */}
              {users.length > 0 && (
                <div>
                  <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                    Assigned To
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {users.map((user) => {
                      const isActive = filters.assignedTo?.includes(user.id);
                      
                      return (
                        <motion.button
                          key={user.id}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => handleUserToggle(user.id)}
                          className={`
                            flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all border
                            ${isActive 
                              ? 'bg-accent-500/20 text-accent-400 border-accent-500/30'
                              : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                            }
                          `}
                        >
                          <Users className="w-4 h-4" />
                          <span>{user.name}</span>
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Date Range */}
              <div>
                <div className="text-xs font-medium text-white/40 uppercase tracking-wider mb-3">
                  Date Range
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs text-white/50 mb-1">Start Date</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => handleDateChange('start', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/30 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-white/50 mb-1">End Date</label>
                    <div className="relative">
                      <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-white/40" />
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => handleDateChange('end', e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white text-sm focus:border-accent-500/30 focus:bg-white/10 transition-all"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active filters summary (when collapsed) */}
      {!isExpanded && hasActiveFilters && (
        <div className="px-6 py-3 bg-white/5 border-t border-white/10">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-white/40">Active filters:</span>
            
            {filters.types && filters.types.map(type => {
              const typeConfig = TYPE_FILTERS.find(t => t.key === type);
              return typeConfig && (
                <span key={type} className={`text-xs px-2 py-1 rounded ${typeConfig.bg} ${typeConfig.text}`}>
                  {typeConfig.label}
                </span>
              );
            })}
            
            {(filters.status?.length || 0) > 0 && (
              <span className="text-xs px-2 py-1 rounded bg-amber-500/20 text-amber-400">
                {filters.status!.length} status
              </span>
            )}
            
            {(filters.assignedTo?.length || 0) > 0 && (
              <span className="text-xs px-2 py-1 rounded bg-accent-500/20 text-accent-400">
                {filters.assignedTo!.length} users
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
};