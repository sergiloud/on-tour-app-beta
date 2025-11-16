/**
 * GanttChart - Custom Gantt Chart Component
 * 
 * Integra react-gantt-timeline con styling personalizado
 * siguiendo el design system glass morphism.
 */

import React, { useMemo, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, 
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Calendar,
  Clock,
  User,
  AlertCircle
} from 'lucide-react';
import type { 
  RoadmapNode, 
  Dependency,
  RoadmapViewConfig,
  UserInfo,
  GanttTask,
  TimelineRange
} from '../types';

interface GanttChartProps {
  nodes: RoadmapNode[];
  dependencies: Dependency[];
  config: RoadmapViewConfig;
  users: UserInfo[];
  selectedNodeId?: string | null;
  isSimulationMode?: boolean;
  onNodeClick?: (node: RoadmapNode) => void;
  onNodeDrop?: (nodeId: string, newDate: string) => void;
  onDateRangeChange?: (range: TimelineRange) => void;
  className?: string;
}

// Color scheme siguiendo design system
const NODE_COLORS = {
  show: { bg: 'bg-emerald-500/20', border: 'border-emerald-500/30', text: 'text-emerald-400' },
  travel: { bg: 'bg-blue-500/20', border: 'border-blue-500/30', text: 'text-blue-400' },
  task: { bg: 'bg-purple-500/20', border: 'border-purple-500/30', text: 'text-purple-400' },
  milestone: { bg: 'bg-amber-500/20', border: 'border-amber-500/30', text: 'text-amber-400' }
};

const PRIORITY_COLORS = {
  high: { bg: 'bg-red-500/30', border: 'border-red-500/50' },
  medium: { bg: 'bg-yellow-500/30', border: 'border-yellow-500/50' },
  low: { bg: 'bg-green-500/30', border: 'border-green-500/50' }
};

export const GanttChart: React.FC<GanttChartProps> = ({
  nodes,
  dependencies,
  config,
  users,
  selectedNodeId,
  isSimulationMode = false,
  onNodeClick,
  onNodeDrop,
  onDateRangeChange,
  className = ''
}) => {

  const containerRef = useRef<HTMLDivElement>(null);
  const [draggedNode, setDraggedNode] = React.useState<string | null>(null);
  const [timelineRange, setTimelineRange] = React.useState<TimelineRange>({
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
    end: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)    // 90 days future
  });

  // Transform nodes to Gantt tasks
  const ganttTasks = useMemo((): GanttTask[] => {
    return nodes.map(node => ({
      id: node.id,
      title: node.title,
      start: new Date(node.startDate),
      end: node.endDate ? new Date(node.endDate) : new Date(node.startDate),
      type: node.type,
      priority: node.priority,
      assignedTo: Array.isArray(node.assignedTo) ? node.assignedTo[0] : node.assignedTo,
      progress: node.metadata.progress || 0,
      dependencies: dependencies
        .filter(dep => dep.toNodeId === node.id)
        .map(dep => dep.fromNodeId),
      cost: node.metadata.cost || 0,
      location: node.metadata.location,
      status: node.metadata.status || 'pending'
    }));
  }, [nodes, dependencies]);

  // Calculate timeline grid based on zoom level
  const timelineGrid = useMemo(() => {
    const { start, end } = timelineRange;
    const diffMs = end.getTime() - start.getTime();
    
    let gridSize: number;
    let formatLabel: (date: Date) => string;
    
    switch (config.zoom) {
      case 'day':
        gridSize = 24 * 60 * 60 * 1000; // 1 day
        formatLabel = (date) => date.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });
        break;
      case 'week':
        gridSize = 7 * 24 * 60 * 60 * 1000; // 1 week
        formatLabel = (date) => `W${Math.ceil(date.getDate() / 7)}`;
        break;
      case 'month':
        gridSize = 30 * 24 * 60 * 60 * 1000; // ~1 month
        formatLabel = (date) => date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        break;
      case 'quarter':
        gridSize = 90 * 24 * 60 * 60 * 1000; // ~3 months
        formatLabel = (date) => `Q${Math.ceil((date.getMonth() + 1) / 3)} ${date.getFullYear()}`;
        break;
      default:
        gridSize = 7 * 24 * 60 * 60 * 1000;
        formatLabel = (date) => date.toLocaleDateString();
    }

    const columns = Math.ceil(diffMs / gridSize);
    return Array.from({ length: columns }, (_, i) => {
      const date = new Date(start.getTime() + i * gridSize);
      return {
        date,
        label: formatLabel(date),
        x: (i * 100) / columns
      };
    });
  }, [timelineRange, config.zoom]);

  // Calculate task positions
  const calculateTaskPosition = useCallback((task: GanttTask) => {
    const { start, end } = timelineRange;
    const totalMs = end.getTime() - start.getTime();
    
    const taskStart = Math.max(task.start.getTime(), start.getTime());
    const taskEnd = Math.min(task.end.getTime(), end.getTime());
    
    const x = ((taskStart - start.getTime()) / totalMs) * 100;
    const width = ((taskEnd - taskStart) / totalMs) * 100;
    
    return { x: Math.max(0, x), width: Math.max(1, width) };
  }, [timelineRange]);

  // Handle node drag and drop
  const handleDragStart = useCallback((e: React.DragEvent, nodeId: string) => {
    e.dataTransfer.setData('text/plain', nodeId);
    setDraggedNode(nodeId);
  }, []);

  const handleDragEnd = useCallback(() => {
    setDraggedNode(null);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent, date: Date) => {
    e.preventDefault();
    const nodeId = e.dataTransfer.getData('text/plain');
    if (nodeId && onNodeDrop) {
      onNodeDrop(nodeId, date.toISOString());
    }
    setDraggedNode(null);
  }, [onNodeDrop]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  // Navigate timeline
  const navigateTimeline = useCallback((direction: 'left' | 'right') => {
    const { start, end } = timelineRange;
    const diffMs = end.getTime() - start.getTime();
    const shift = direction === 'left' ? -diffMs * 0.5 : diffMs * 0.5;
    
    const newRange = {
      start: new Date(start.getTime() + shift),
      end: new Date(end.getTime() + shift)
    };
    
    setTimelineRange(newRange);
    onDateRangeChange?.(newRange);
  }, [timelineRange, onDateRangeChange]);

  // Zoom timeline
  const zoomTimeline = useCallback((direction: 'in' | 'out') => {
    const { start, end } = timelineRange;
    const center = start.getTime() + (end.getTime() - start.getTime()) / 2;
    const currentSpan = end.getTime() - start.getTime();
    
    const newSpan = direction === 'in' ? currentSpan * 0.7 : currentSpan * 1.4;
    
    const newRange = {
      start: new Date(center - newSpan / 2),
      end: new Date(center + newSpan / 2)
    };
    
    setTimelineRange(newRange);
    onDateRangeChange?.(newRange);
  }, [timelineRange, onDateRangeChange]);

  return (
    <div className={`glass rounded-xl border border-white/10 overflow-hidden ${className}`}>
      
      {/* Timeline Header */}
      <div className="px-6 py-4 border-b border-white/10 bg-gradient-to-r from-transparent via-white/5 to-transparent">
        <div className="flex items-center justify-between">
          
          {/* Timeline Info */}
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-500/20 to-accent-600/10 flex items-center justify-center">
              <Calendar className="w-4 h-4 text-accent-400" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">
                {timelineRange.start.toLocaleDateString()} - {timelineRange.end.toLocaleDateString()}
              </div>
              <div className="text-xs text-white/40">
                {ganttTasks.length} tasks • {config.zoom} view
              </div>
            </div>
          </div>

          {/* Timeline Controls */}
          <div className="flex items-center gap-2">
            
            {/* Navigation */}
            <div className="flex rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateTimeline('left')}
                className="p-2 hover:bg-white/5 text-white/60 hover:text-white/80"
              >
                <ChevronLeft className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigateTimeline('right')}
                className="p-2 hover:bg-white/5 text-white/60 hover:text-white/80"
              >
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            {/* Zoom Controls */}
            <div className="flex rounded-lg bg-white/5 border border-white/10 overflow-hidden">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => zoomTimeline('out')}
                className="p-2 hover:bg-white/5 text-white/60 hover:text-white/80"
              >
                <ZoomOut className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => zoomTimeline('in')}
                className="p-2 hover:bg-white/5 text-white/60 hover:text-white/80"
              >
                <ZoomIn className="w-4 h-4" />
              </motion.button>
            </div>

          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div ref={containerRef} className="overflow-x-auto">
        <div className="min-w-[800px]">
          
          {/* Timeline Grid Header */}
          <div className="sticky top-0 z-10 bg-white/5 border-b border-white/10">
            <div className="flex h-12 relative">
              {timelineGrid.map((col, i) => (
                <div
                  key={i}
                  className="flex-1 border-r border-white/5 flex items-center justify-center text-xs text-white/40 font-medium"
                  style={{ left: `${col.x}%`, width: `${100 / timelineGrid.length}%` }}
                >
                  {col.label}
                </div>
              ))}
            </div>
          </div>

          {/* Task Rows */}
          <div className="divide-y divide-white/5">
            {ganttTasks.map((task, index) => {
              const position = calculateTaskPosition(task);
              const colors = NODE_COLORS[task.type as keyof typeof NODE_COLORS] || NODE_COLORS.task;
              const priorityColors = PRIORITY_COLORS[task.priority as keyof typeof PRIORITY_COLORS] || PRIORITY_COLORS.medium;
              const isSelected = selectedNodeId === task.id;
              const isDragging = draggedNode === task.id;
              const user = users.find(u => u.id === task.assignedTo);

              return (
                <div
                  key={task.id}
                  className="h-16 relative flex items-center hover:bg-white/5 transition-all group"
                  onDragOver={handleDragOver}
                  onDrop={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const x = (e.clientX - rect.left) / rect.width;
                    const { start, end } = timelineRange;
                    const date = new Date(start.getTime() + x * (end.getTime() - start.getTime()));
                    handleDrop(e, date);
                  }}
                >
                  
                  {/* Task Bar */}
                  <motion.div
                    draggable={isSimulationMode}
                    onDragStart={(e) => handleDragStart(e as any, task.id)}
                    onDragEnd={handleDragEnd}
                    onClick={() => onNodeClick && onNodeClick(nodes.find(n => n.id === task.id)!)}
                    whileHover={{ scale: isDragging ? 1 : 1.02, y: -1 }}
                    whileTap={{ scale: 0.98 }}
                    className={`
                      absolute h-8 rounded-lg border-2 cursor-pointer transition-all
                      ${colors.bg} ${colors.border}
                      ${isSelected ? 'ring-2 ring-accent-400/50 shadow-lg shadow-accent-400/25' : ''}
                      ${isDragging ? 'opacity-50 scale-105' : ''}
                      ${isSimulationMode ? 'hover:shadow-lg' : ''}
                    `}
                    style={{ 
                      left: `${position.x}%`, 
                      width: `${position.width}%`,
                      minWidth: '80px'
                    }}
                  >
                    
                    {/* Progress Bar */}
                    {task.progress > 0 && (
                      <div 
                        className={`absolute inset-y-0 left-0 rounded-lg ${priorityColors.bg} ${priorityColors.border}`}
                        style={{ width: `${task.progress}%` }}
                      />
                    )}

                    {/* Task Content */}
                    <div className="relative h-full flex items-center px-3 gap-2">
                      
                      {/* Task Title */}
                      <div className={`text-xs font-semibold truncate ${colors.text}`}>
                        {task.title}
                      </div>

                      {/* Assigned User Avatar */}
                      {user && (
                        <div className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center border border-white/30">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.name}
                              className="w-full h-full rounded-full object-cover"
                            />
                          ) : (
                            <div className="text-xs font-bold text-white/80">
                              {user.name.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Priority Indicator */}
                      {task.priority === 'high' && (
                        <AlertCircle className="w-3 h-3 text-red-400" />
                      )}

                    </div>

                    {/* Tooltip on Hover */}
                    <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
                      <div className="bg-black/90 backdrop-blur-sm rounded-lg px-3 py-2 text-xs text-white whitespace-nowrap border border-white/20">
                        <div className="font-semibold">{task.title}</div>
                        <div className="text-white/60 space-y-1">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {task.start.toLocaleDateString()} - {task.end.toLocaleDateString()}
                          </div>
                          {user && (
                            <div className="flex items-center gap-1">
                              <User className="w-3 h-3" />
                              {user.name}
                            </div>
                          )}
                          {task.cost > 0 && (
                            <div className="font-semibold">
                              ${task.cost.toLocaleString()}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                  </motion.div>

                  {/* Dependencies Lines */}
                  {config.showDependencies && task.dependencies.map((depId: string) => {
                    const depTask = ganttTasks.find(t => t.id === depId);
                    if (!depTask) return null;
                    
                    const depPosition = calculateTaskPosition(depTask);
                    const currentPosition = calculateTaskPosition(task);
                    
                    return (
                      <svg
                        key={`${depId}-${task.id}`}
                        className="absolute inset-0 pointer-events-none z-5"
                        style={{ width: '100%', height: '100%' }}
                      >
                        <path
                          d={`M ${depPosition.x + depPosition.width}% 50% L ${currentPosition.x}% 50%`}
                          stroke="rgba(168, 85, 247, 0.4)"
                          strokeWidth="2"
                          strokeDasharray="4 4"
                          fill="none"
                        />
                        <circle
                          cx={`${currentPosition.x}%`}
                          cy="50%"
                          r="3"
                          fill="rgba(168, 85, 247, 0.6)"
                        />
                      </svg>
                    );
                  })}

                </div>
              );
            })}
          </div>

          {/* Today Indicator */}
          <div className="absolute inset-y-0 pointer-events-none z-10" style={{
            left: `${((Date.now() - timelineRange.start.getTime()) / (timelineRange.end.getTime() - timelineRange.start.getTime())) * 100}%`
          }}>
            <div className="w-0.5 h-full bg-gradient-to-b from-red-500 to-red-400 shadow-lg">
              <div className="absolute -top-1 -left-2 w-4 h-4 rotate-45 bg-red-500 border border-red-400 rounded-sm"></div>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
};