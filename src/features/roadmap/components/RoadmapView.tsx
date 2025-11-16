/**
 * RoadmapView - Vista Principal del Roadmap
 * 
 * Componente principal que integra la librería Gantt con custom styling
 * siguiendo el design system glass morphism identificado.
 */

import React, { useMemo, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  RotateCcw, 
  Settings, 
  Eye, 
  EyeOff,
  Zap,
  ZapOff,
  Grid3X3,
  Calendar as CalendarIcon,
  BarChart3
} from 'lucide-react';
import { RoadmapNode } from './RoadmapNode';
import { RoadmapFilters } from './RoadmapFilters';
import type { 
  RoadmapNode as RoadmapNodeType, 
  Dependency,
  RoadmapViewConfig,
  RoadmapFilters as RoadmapFiltersType,
  UserInfo,
  FinancialImpact
} from '../types';
import { t } from '../../../lib/i18n';

interface RoadmapViewProps {
  nodes: RoadmapNodeType[];
  dependencies: Dependency[];
  filters: RoadmapFiltersType;
  viewConfig: RoadmapViewConfig;
  users: UserInfo[];
  isLoading: boolean;
  error: string | null;
  
  // Simulation props
  isSimulationMode: boolean;
  financialImpact: FinancialImpact | null;
  
  // Event handlers
  onFiltersChange: (filters: Partial<RoadmapFiltersType>) => void;
  onViewConfigChange: (config: Partial<RoadmapViewConfig>) => void;
  onNodeClick: (node: RoadmapNodeType) => void;
  onNodeEdit: (node: RoadmapNodeType) => void;
  onNodeDrop: (nodeId: string, newDate: string) => void;
  onSimulationToggle: () => void;
  onSimulationConfirm: () => void;
  onSimulationDiscard: () => void;
  
  className?: string;
}

// View type configurations
const VIEW_TYPES = [
  { key: 'gantt' as const, label: 'Gantt', icon: BarChart3 },
  { key: 'timeline' as const, label: 'Timeline', icon: CalendarIcon },
  { key: 'calendar' as const, label: 'Calendar', icon: Grid3X3 }
];

const ZOOM_LEVELS = [
  { key: 'day' as const, label: 'Day' },
  { key: 'week' as const, label: 'Week' },
  { key: 'month' as const, label: 'Month' },
  { key: 'quarter' as const, label: 'Quarter' }
];

export const RoadmapView: React.FC<RoadmapViewProps> = ({
  nodes,
  dependencies,
  filters,
  viewConfig,
  users,
  isLoading,
  error,
  isSimulationMode,
  financialImpact,
  onFiltersChange,
  onViewConfigChange,
  onNodeClick,
  onNodeEdit,
  onNodeDrop,
  onSimulationToggle,
  onSimulationConfirm,
  onSimulationDiscard,
  className = ''
}) => {

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  // Transform nodes for Gantt library (mock implementation)
  const ganttData = useMemo(() => {
    return nodes.map(node => ({
      id: node.id,
      name: node.title,
      start: new Date(node.startDate),
      end: node.endDate ? new Date(node.endDate) : new Date(node.startDate),
      progress: node.metadata.progress || 0,
      type: node.type,
      dependencies: dependencies
        .filter(dep => dep.toNodeId === node.id)
        .map(dep => dep.fromNodeId)
    }));
  }, [nodes, dependencies]);

  const handleNodeClick = useCallback((node: RoadmapNodeType) => {
    setSelectedNodeId(node.id);
    onNodeClick(node);
  }, [onNodeClick]);

  const handleViewTypeChange = (viewType: RoadmapViewConfig['viewType']) => {
    onViewConfigChange({ viewType });
  };

  const handleZoomChange = (zoom: RoadmapViewConfig['zoom']) => {
    onViewConfigChange({ zoom });
  };

  const toggleDependencies = () => {
    onViewConfigChange({ showDependencies: !viewConfig.showDependencies });
  };

  if (error) {
    return (
      <div className={`glass rounded-xl border border-red-500/30 p-8 text-center ${className}`}>
        <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/10 flex items-center justify-center mx-auto mb-4">
          <RotateCcw className="w-8 h-8 text-red-400" />
        </div>
        <h3 className="text-lg font-semibold text-white mb-2">Error Loading Roadmap</h3>
        <p className="text-sm text-red-400 mb-4">{error}</p>
        <button 
          onClick={() => window.location.reload()}
          className="px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30 transition-all"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      
      {/* Filters */}
      <RoadmapFilters 
        filters={filters}
        users={users}
        onFiltersChange={onFiltersChange}
      />

      {/* Main Roadmap Container */}
      <div className="glass rounded-xl border border-white/10 overflow-hidden">
        
        {/* Header con controles */}
        <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
          <div className="flex items-center justify-between">
            
            {/* Left: Title y stats */}
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center border border-white/5">
                <BarChart3 className="w-5 h-5 text-accent-400" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white tracking-tight">Project Roadmap</h2>
                <div className="flex items-center gap-4 text-xs text-white/40">
                  <span>{nodes.length} events</span>
                  <span>•</span>
                  <span>{dependencies.length} dependencies</span>
                  <span>•</span>
                  <span>{new Date().toLocaleDateString()}</span>
                </div>
              </div>
            </div>

            {/* Right: View controls */}
            <div className="flex items-center gap-3">
              
              {/* Simulation Mode Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onSimulationToggle}
                className={`
                  flex items-center gap-2 px-4 py-2 rounded-xl transition-all border font-medium text-sm
                  ${isSimulationMode 
                    ? 'bg-amber-500/20 text-amber-400 border-amber-500/30 shadow-lg' 
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  }
                `}
              >
                {isSimulationMode ? <Zap className="w-4 h-4" /> : <ZapOff className="w-4 h-4" />}
                Simulation Mode
              </motion.button>

              {/* View Type Selector */}
              <div className="flex rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                {VIEW_TYPES.map(view => {
                  const Icon = view.icon;
                  const isActive = viewConfig.viewType === view.key;
                  
                  return (
                    <motion.button
                      key={view.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleViewTypeChange(view.key)}
                      className={`
                        flex items-center gap-2 px-3 py-2 text-sm font-medium transition-all
                        ${isActive 
                          ? 'bg-accent-500/20 text-accent-400' 
                          : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                        }
                      `}
                    >
                      <Icon className="w-4 h-4" />
                      <span className="hidden md:inline">{view.label}</span>
                    </motion.button>
                  );
                })}
              </div>

              {/* Zoom Controls */}
              <div className="flex rounded-xl bg-white/5 border border-white/10 overflow-hidden">
                {ZOOM_LEVELS.map(zoom => {
                  const isActive = viewConfig.zoom === zoom.key;
                  
                  return (
                    <motion.button
                      key={zoom.key}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleZoomChange(zoom.key)}
                      className={`
                        px-3 py-2 text-xs font-medium transition-all
                        ${isActive 
                          ? 'bg-accent-500/20 text-accent-400' 
                          : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                        }
                      `}
                    >
                      {zoom.label}
                    </motion.button>
                  );
                })}
              </div>

              {/* Dependencies Toggle */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={toggleDependencies}
                className={`
                  p-2 rounded-xl transition-all border
                  ${viewConfig.showDependencies 
                    ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' 
                    : 'bg-white/5 text-white/60 border-white/10 hover:border-white/20'
                  }
                `}
                title="Toggle Dependencies"
              >
                {viewConfig.showDependencies ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </motion.button>

            </div>
          </div>
        </div>

        {/* Simulation Mode Banner */}
        <AnimatePresence>
          {isSimulationMode && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-amber-500/20 border-b border-amber-500/30 overflow-hidden"
            >
              <div className="px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Zap className="w-5 h-5 text-amber-400" />
                    <div>
                      <div className="text-sm font-semibold text-amber-400">Simulation Mode Active</div>
                      <div className="text-xs text-amber-400/70">
                        Drag events to see financial impact in real-time
                      </div>
                    </div>
                  </div>

                  {financialImpact && (
                    <div className="flex items-center gap-4 text-sm">
                      <div className={`font-bold tabular-nums ${
                        financialImpact.totalCostChange > 0 ? 'text-red-400' : 'text-emerald-400'
                      }`}>
                        {financialImpact.totalCostChange > 0 ? '+' : ''}$
                        {Math.abs(financialImpact.totalCostChange).toLocaleString()}
                      </div>
                      <div className="text-white/40">cost change</div>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onSimulationDiscard}
                      className="px-3 py-1.5 rounded-lg bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-medium hover:bg-red-500/30 transition-all"
                    >
                      Discard
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onSimulationConfirm}
                      className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-medium hover:bg-emerald-500/30 transition-all"
                    >
                      Confirm Changes
                    </motion.button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Roadmap Content */}
        <div className="p-6">
          {isLoading ? (
            
            // Loading State
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center animate-pulse">
                <BarChart3 className="w-8 h-8 text-accent-400 animate-pulse" />
              </div>
              <div className="ml-4">
                <div className="text-lg font-semibold text-white">Loading Roadmap...</div>
                <div className="text-sm text-white/40">Aggregating events from all modules</div>
              </div>
            </div>
            
          ) : nodes.length === 0 ? (
            
            // Empty State
            <div className="text-center py-20">
              <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-white/10 to-white/5 flex items-center justify-center mx-auto mb-4">
                <CalendarIcon className="w-8 h-8 text-white/40" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">No Events Found</h3>
              <p className="text-sm text-white/40 mb-6 max-w-md mx-auto">
                Try adjusting your filters or add some shows, tasks, or travel to see your roadmap.
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onFiltersChange({ types: null, status: null, priority: null, assignedTo: null, dateRange: { start: null, end: null } })}
                className="px-4 py-2 rounded-lg bg-accent-500/20 text-accent-400 border border-accent-500/30 hover:bg-accent-500/30 transition-all"
              >
                Clear All Filters
              </motion.button>
            </div>
            
          ) : (
            
            // Roadmap View
            <div className="space-y-4">
              
              {/* Mock Gantt Chart - Replace with actual library integration */}
              <div className="bg-white/5 rounded-xl p-6 border border-white/5">
                <div className="text-sm text-white/40 mb-4">
                  Gantt Chart View ({nodes.length} events)
                </div>
                
                {/* Timeline Header */}
                <div className="grid grid-cols-12 gap-2 mb-4 text-xs text-white/30">
                  {Array.from({ length: 12 }, (_, i) => (
                    <div key={i} className="text-center py-2 border-r border-white/5">
                      Week {i + 1}
                    </div>
                  ))}
                </div>
                
                {/* Node Rows */}
                <div className="space-y-3">
                  {nodes.map(node => (
                    <div key={node.id} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">
                        <RoadmapNode
                          node={node}
                          isSelected={selectedNodeId === node.id}
                          isSimulation={isSimulationMode}
                          onClick={handleNodeClick}
                          onEdit={onNodeEdit}
                          className="scale-75 origin-left"
                        />
                      </div>
                      <div className="col-span-9">
                        {/* Mock timeline bar */}
                        <div className="h-8 bg-gradient-to-r from-accent-500/20 to-accent-500/10 rounded-lg border border-accent-500/30 flex items-center px-3">
                          <div className="text-xs text-white/70 font-medium">
                            {new Date(node.startDate).toLocaleDateString()}
                            {node.endDate && ` → ${new Date(node.endDate).toLocaleDateString()}`}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
            </div>
            
          )}
        </div>

      </div>

    </div>
  );
};