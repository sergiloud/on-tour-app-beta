/**
 * Timeline Canvas Component
 * 
 * Visual horizontal timeline with event blocks, dependencies, and interactions.
 * Supports drag & drop, zoom, critical path highlighting.
 */

import React, { useMemo, useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Plane, DollarSign, CheckSquare, FileText, Clock, TrendingUp, AlertCircle } from 'lucide-react';
import type { TimelineEvent, TimelineDependency } from '../../services/timelineMissionControlService';
import DependencyLines from './DependencyLines';
import TourRouteLines from './TourRouteLines';

// Native drag state type
interface DragState {
  id: string;
  startX: number;
  startY: number;
  currentX: number;
  currentY: number;
  originalX: number;
  originalY: number;
}

interface TimelineCanvasProps {
  events: TimelineEvent[];
  viewMode: 'horizontal' | 'vertical';
  zoomLevel: number;
  showCriticalPath?: boolean;
  showTourRoutes?: boolean;
  dependencies?: TimelineDependency[];
  criticalPathIds?: Set<string>;
  onEventClick?: (event: TimelineEvent) => void;
  onEventDrag?: (eventId: string, newStartTime: Date) => void;
  onContextMenu?: (event: TimelineEvent, x: number, y: number) => void;
}

/**
 * Get icon for event type
 */
function getEventIcon(type: TimelineEvent['type']) {
  switch (type) {
    case 'show':
      return MapPin;
    case 'travel':
      return Plane;
    case 'finance':
      return DollarSign;
    case 'task':
      return CheckSquare;
    case 'contract':
      return FileText;
    default:
      return Clock;
  }
}

/**
 * Get color scheme for event type (professional gradient design)
 */
function getEventColors(type: TimelineEvent['type'], importance: TimelineEvent['importance']) {
  // Professional gradients and refined colors
  const colors = {
    show: {
      bg: 'bg-gradient-to-br from-purple-600 via-purple-500 to-violet-600',
      bgLight: 'bg-purple-500/10',
      border: 'border-purple-400/20',
      text: 'text-white',
      hover: 'hover:from-purple-500 hover:via-purple-400 hover:to-violet-500',
      shadow: 'shadow-purple-500/40',
      glow: 'shadow-[0_0_20px_rgba(168,85,247,0.4)]',
    },
    travel: {
      bg: 'bg-gradient-to-br from-blue-600 via-blue-500 to-cyan-600',
      bgLight: 'bg-blue-500/10',
      border: 'border-blue-400/20',
      text: 'text-white',
      hover: 'hover:from-blue-500 hover:via-blue-400 hover:to-cyan-500',
      shadow: 'shadow-blue-500/40',
      glow: 'shadow-[0_0_20px_rgba(59,130,246,0.4)]',
    },
    finance: {
      bg: 'bg-gradient-to-br from-emerald-600 via-green-500 to-teal-600',
      bgLight: 'bg-green-500/10',
      border: 'border-green-400/20',
      text: 'text-white',
      hover: 'hover:from-emerald-500 hover:via-green-400 hover:to-teal-500',
      shadow: 'shadow-green-500/40',
      glow: 'shadow-[0_0_20px_rgba(34,197,94,0.4)]',
    },
    task: {
      bg: 'bg-gradient-to-br from-amber-600 via-amber-500 to-orange-600',
      bgLight: 'bg-amber-500/10',
      border: 'border-amber-400/20',
      text: 'text-white',
      hover: 'hover:from-amber-500 hover:via-amber-400 hover:to-orange-500',
      shadow: 'shadow-amber-500/40',
      glow: 'shadow-[0_0_20px_rgba(245,158,11,0.4)]',
    },
    contract: {
      bg: 'bg-gradient-to-br from-slate-600 via-slate-500 to-gray-600',
      bgLight: 'bg-slate-500/10',
      border: 'border-slate-400/20',
      text: 'text-white',
      hover: 'hover:from-slate-500 hover:via-slate-400 hover:to-gray-500',
      shadow: 'shadow-slate-500/40',
      glow: 'shadow-[0_0_20px_rgba(100,116,139,0.4)]',
    },
  };
  
  return colors[type] || colors.task;
}

/**
 * Draggable Event Component - MEMOIZED for performance
 */
interface DraggableEventProps {
  event: TimelineEvent;
  x: number;
  y: number; // Add vertical position
  width: number;
  index: number;
  isHovered: boolean;
  isDragging?: boolean; // Add isDragging prop to render drag state
  zoomLevel: number; // Pass zoom for intelligent display
  onHover: (id: string | null) => void;
  onClick: (event: TimelineEvent) => void;
  onContextMenu: (event: TimelineEvent, x: number, y: number) => void;
  onPositionChange?: (eventId: string, x: number, y: number) => void;
  onMouseDown?: (clientX: number, clientY: number) => void;
}

const DraggableEvent = React.memo(function DraggableEvent({ 
  event, 
  x, 
  y,
  width, 
  index, 
  isHovered,
  isDragging = false,
  zoomLevel,
  onHover, 
  onClick,
  onContextMenu,
  onPositionChange,
  onMouseDown
}: DraggableEventProps) {
  const Icon = getEventIcon(event.type);
  const [hasDragged, setHasDragged] = React.useState(false);
  
  // Native drag - NO libraries
  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent text selection
    e.stopPropagation();
    setHasDragged(false);
    if (onMouseDown) {
      onMouseDown(e.clientX, e.clientY);
    }
  };
  
  // Track if dragged to prevent click
  React.useEffect(() => {
    if (isDragging) {
      setHasDragged(true);
    }
  }, [isDragging]);
  
  // Intelligent content display based on WIDTH (in pixels), NOT zoom
  const showTitle = width > 80;
  const showDuration = width > 120;
  const showLocation = width > 160;
  const showMetadata = width > 200;
  
  // FIXED card height - 40px compact style (like TourAgenda)
  const cardHeight = 40;
  
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ 
        opacity: 1, 
        scale: isDragging ? 1.05 : 1,
      }}
      transition={{ 
        delay: index * 0.03,
        duration: isDragging ? 0.1 : 0.2,
        type: isDragging ? 'tween' : 'spring',
      }}
      className="absolute group"
      style={{
        left: `${x}px`,
        top: `${y}px`,
        width: `${width}px`,
      }}
    >
      <motion.div
        onMouseDown={handleMouseDown}
        data-event-card="true"
        whileHover={{ 
          y: -2, 
          scale: 1.01,
          transition: { 
            duration: 0.15
          }
        }}
        whileTap={{ 
          scale: 0.99,
          transition: { 
            duration: 0.1
          }
        }}
        onClick={(e) => {
          e.stopPropagation();
          // Prevent click if user was dragging
          if (!hasDragged) {
            onClick(event);
          }
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
          onContextMenu(event, e.clientX, e.clientY);
        }}
        onMouseEnter={() => onHover(event.id)}
        onMouseLeave={() => onHover(null)}
        className={`
          relative overflow-hidden cursor-pointer
          bg-slate-800/70 backdrop-blur-sm
          hover:bg-slate-700/80 transition-all duration-200
          border-l-2
          ${event.type === 'show' ? 'border-l-purple-500/60' :
            event.type === 'travel' ? 'border-l-blue-500/60' :
            event.type === 'finance' ? 'border-l-green-500/60' :
            event.type === 'task' ? 'border-l-amber-500/60' :
            'border-l-accent-500/60'}
          ${event.status === 'tentative' || event.status === 'offer' ? 'opacity-85' : ''}
          ${event.status === 'canceled' ? 'opacity-40 line-through grayscale' : ''}
          ${isHovered && !isDragging ? 'bg-slate-700/85 ring-1 ring-white/15 shadow-lg' : ''}
          ${isDragging ? 'opacity-95 shadow-2xl ring-2 ring-white/30 z-50 scale-[1.02]' : 'cursor-grab active:cursor-grabbing'}
          rounded-md border border-white/10
          will-change-transform
        `}
        style={{
          height: `${cardHeight}px`,
        }}
      >
        {/* Event content - Clean professional style like TourAgenda */}
        <div className="p-2 h-full flex items-center gap-2">
          {/* Critical indicator - subtle */}
          {event.importance === 'critical' && (
            <div className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-red-500 ring-1 ring-white/50" />
          )}
          
          {/* Icon - small and subtle */}
          <Icon className="w-3 h-3 flex-shrink-0 opacity-70" />
          
          {/* Main content */}
          <div className="flex-1 min-w-0">
            {showTitle && (
              <div className="flex items-center gap-1.5 mb-0.5">
                <span className="font-semibold truncate text-sm">
                  {event.title}
                </span>
                {/* Status badge - minimal */}
                {event.status && event.type === 'show' && (
                  <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold flex-shrink-0 uppercase tracking-wide ${
                    event.status === 'confirmed'
                      ? 'bg-green-500/25 text-green-300'
                      : event.status === 'tentative' || event.status === 'offer'
                      ? 'bg-amber-500/25 text-amber-300'
                      : 'bg-blue-500/25 text-blue-300'
                  }`}>
                    {event.status}
                  </span>
                )}
              </div>
            )}
            
            {/* Secondary info - like TourAgenda */}
            {showLocation && event.location && (
              <div className="flex items-center gap-1 text-[11px] text-white/60">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                <span className="truncate">{event.location}</span>
              </div>
            )}
          </div>
          
          {/* Financial info - if available */}
          {showMetadata && event.type === 'show' && event.metadata?.fee && (
            <div className="text-[11px] font-semibold text-green-400 flex-shrink-0">
              ${event.metadata.fee.toLocaleString()}
            </div>
          )}
        </div>
      </motion.div>
      
      {/* Enhanced Tooltip - pointer-events-none to not block clicks */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 bottom-full mb-2 z-50 min-w-[280px] pointer-events-none"
            style={{ left: `${Math.min(x, 70)}%` }}
          >
            <div className="glass rounded-lg border border-white/20 p-3 shadow-2xl">
              <div className="space-y-2">
                {/* Title & status */}
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-semibold text-white text-sm">{event.title}</h4>
                  <span className={`
                    px-2 py-0.5 rounded-full text-[10px] uppercase font-medium
                    ${event.status === 'confirmed' ? 'bg-green-500/20 text-green-400' : ''}
                    ${event.status === 'tentative' ? 'bg-amber-500/20 text-amber-400' : ''}
                    ${event.status === 'offer' ? 'bg-blue-500/20 text-blue-400' : ''}
                    ${event.status === 'canceled' ? 'bg-red-500/20 text-red-400' : ''}
                  `}>
                    {event.status}
                  </span>
                </div>
                
                {/* Time range */}
                <div className="flex items-center gap-2 text-white/70 text-xs">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{event.startTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                  {event.endTime && (
                    <>
                      <span>→</span>
                      <span>{event.endTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}</span>
                    </>
                  )}
                </div>
                
                {/* Location */}
                {event.metadata?.location && (
                  <div className="flex items-center gap-2 text-white/70 text-xs">
                    <MapPin className="w-3.5 h-3.5" />
                    <span>{event.metadata.location}</span>
                  </div>
                )}
                
                {/* Financial info */}
                {(event.metadata?.fee || event.metadata?.cost) && (
                  <div className="flex items-center gap-3 text-xs pt-1 border-t border-white/10">
                    {event.metadata.fee && (
                      <div className="flex items-center gap-1.5 text-green-400">
                        <DollarSign className="w-3.5 h-3.5" />
                        <span className="font-mono">€{event.metadata.fee.toLocaleString()}</span>
                      </div>
                    )}
                    {event.metadata.cost && (
                      <div className="flex items-center gap-1.5 text-amber-400">
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span className="font-mono">€{event.metadata.cost.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
                
                {/* Capacity */}
                {event.metadata?.capacity && (
                  <div className="text-white/60 text-xs">
                    Capacity: {event.metadata.capacity}
                    {event.metadata.doorPercentage && ` (${event.metadata.doorPercentage}% door)`}
                  </div>
                )}
                
                {/* Drag hint */}
                <div className="text-white/40 text-[10px] pt-1 border-t border-white/10">
                  Click to edit • Drag to reschedule
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison for performance - only re-render if these props changed
  return (
    prevProps.event.id === nextProps.event.id &&
    prevProps.x === nextProps.x &&
    prevProps.y === nextProps.y &&
    prevProps.width === nextProps.width &&
    prevProps.isHovered === nextProps.isHovered &&
    prevProps.isDragging === nextProps.isDragging &&
    prevProps.zoomLevel === nextProps.zoomLevel
  );
});

/**
 * Timeline Canvas Component
 */
export default function TimelineCanvas({
  events,
  viewMode,
  zoomLevel,
  showCriticalPath = false,
  showTourRoutes = true,
  dependencies = [],
  criticalPathIds = new Set(),
  onEventClick,
  onEventDrag,
  onContextMenu,
}: TimelineCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const [hoveredEvent, setHoveredEvent] = useState<string | null>(null);
  
  // Store custom drag positions (user-modified positions) - BOTH X and Y now
  const [customPositions, setCustomPositions] = useState<Map<string, { x: number; y: number }>>(new Map());
  
  // Track which events have EVER been manually positioned (permanent list)
  const draggedEventIds = useRef<Set<string>>(new Set());
  
  // Snapshot of auto-layout event IDs (stable, doesn't change when events update)
  const autoLayoutEventIdsRef = useRef<string[]>([]);
  
  // Native drag state - more fluid than @dnd-kit
  const [draggingEvent, setDraggingEvent] = useState<{
    id: string;
    startX: number;
    startY: number;
    currentX: number;
    currentY: number;
    originalX: number;
    originalY: number;
    moved?: boolean;
  } | null>(null);
  
  // Temporary flag to suppress click after a drag
  const justDraggedRef = useRef(false);
  
  // Native drag handlers - completely fluid
  const handleMouseDown = (event: TimelineEvent, clientX: number, clientY: number, eventX: number, eventY: number) => {
    // Prevent text selection while dragging
    try { document.body.style.userSelect = 'none'; } catch {}

    setDraggingEvent({
      id: event.id,
      startX: clientX,
      startY: clientY,
      currentX: clientX,
      currentY: clientY,
      originalX: eventX,
      originalY: eventY,
      moved: false,
    });
  };
  
  // Calculate timeline bounds
  const { startDate, endDate, durationDays } = useMemo(() => {
    if (events.length === 0) {
      const now = new Date();
      // Show 30 days back and 60 days forward for empty state
      return {
        startDate: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
        endDate: new Date(now.getTime() + 60 * 24 * 60 * 60 * 1000),
        durationDays: 90,
      };
    }
    
    const dates = events.flatMap(e => [e.startTime, e.endTime].filter(Boolean) as Date[]);
    const start = new Date(Math.min(...dates.map(d => d.getTime())));
    const end = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Add padding - 7 days before first event, 14 days after last
    const paddedStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
    const paddedEnd = new Date(end.getTime() + 14 * 24 * 60 * 60 * 1000);
    
    paddedStart.setHours(0, 0, 0, 0);
    paddedEnd.setHours(23, 59, 59, 999);
    
    const duration = Math.ceil((paddedEnd.getTime() - paddedStart.getTime()) / (24 * 60 * 60 * 1000));
    
    return {
      startDate: paddedStart,
      endDate: paddedEnd,
      durationDays: Math.max(duration, 1),
    };
  }, [events]);
  
  // Calculate events per day for dynamic day widths
  const eventsPerDay = useMemo(() => {
    const dayMap = new Map<string, number>();
    
    events.forEach(event => {
      const dateKey = event.startTime.toISOString().split('T')[0];
      if (dateKey) {
        dayMap.set(dateKey, (dayMap.get(dateKey) || 0) + 1);
      }
    });
    
    return dayMap;
  }, [events]);
  
  // Calculate dynamic day widths (min 120px, max 400px based on event count)
  const getDayWidth = (date: Date): number => {
    const dateKey = date.toISOString().split('T')[0];
    if (!dateKey) return 120 * zoomLevel;
    
    const eventCount = eventsPerDay.get(dateKey) || 0;
    
    // Base width + extra per event
    const baseWidth = 120;
    const extraPerEvent = 60;
    const calculatedWidth = baseWidth + (eventCount * extraPerEvent);
    
    return Math.min(calculatedWidth, 400) * zoomLevel;
  };
  
  // Calculate cumulative X positions for days
  const dayPositions = useMemo(() => {
    const positions = new Map<string, number>();
    let cumulativeX = 0;
    
    const current = new Date(startDate);
    while (current <= endDate) {
      const dateKey = current.toISOString().split('T')[0];
      if (dateKey) {
        positions.set(dateKey, cumulativeX);
      }
      cumulativeX += getDayWidth(current);
      current.setDate(current.getDate() + 1);
    }
    
    return { positions, totalWidth: cumulativeX };
  }, [startDate, endDate, eventsPerDay, zoomLevel]);
  
  // Convert date to X position in pixels (not percentage!)
  const dateToX = (date: Date): number => {
    const current = new Date(startDate);
    current.setHours(0, 0, 0, 0);
    
    const targetDate = new Date(date);
    targetDate.setHours(0, 0, 0, 0);
    
    let x = 0;
    
    // Sum up widths of all days before target date
    while (current < targetDate) {
      x += getDayWidth(current);
      current.setDate(current.getDate() + 1);
    }
    
    // Add intra-day offset
    const dayStart = new Date(targetDate);
    const dayMs = date.getTime() - dayStart.getTime();
    const dayWidth = getDayWidth(targetDate);
    const intraDayOffset = (dayMs / (24 * 60 * 60 * 1000)) * dayWidth;
    
    return x + intraDayOffset;
  };
  
  // Calculate event width in pixels
  const getEventWidth = (event: TimelineEvent): number => {
    if (!event.endTime) {
      // Point events get 25% of their day's width
      const dayWidth = getDayWidth(event.startTime);
      return Math.max(dayWidth * 0.25, 80);
    }
    
    const startX = dateToX(event.startTime);
    const endX = dateToX(event.endTime);
    
    return Math.max(endX - startX, 100); // Minimum 100px
  };
  
  // Generate day markers
  const dayMarkers = useMemo(() => {
    const markers: { date: Date; label: string; x: number }[] = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      markers.push({
        date: new Date(current),
        label: current.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        x: dateToX(current),
      });
      current.setDate(current.getDate() + 1);
    }
    
    return markers;
  }, [startDate, endDate, dateToX]);
  
  // Update auto-layout event IDs snapshot ONLY when events are added/removed (not when times change)
  useEffect(() => {
    const currentAutoIds = events
      .filter(e => !draggedEventIds.current.has(e.id))
      .map(e => e.id);
    
    // Only update if the IDs actually changed (not just event properties)
    const currentSet = new Set(currentAutoIds);
    const prevSet = new Set(autoLayoutEventIdsRef.current);
    
    const hasChanges = 
      currentSet.size !== prevSet.size ||
      currentAutoIds.some(id => !prevSet.has(id));
    
    if (hasChanges) {
      autoLayoutEventIdsRef.current = currentAutoIds;
    }
  }, [events.length]); // Only depend on LENGTH, not full events array
  
  // Calculate event positions with smart vertical layout (lanes to avoid overlap)
  // Split into two parts: auto-layout (stable) and custom positions (dynamic)
  const autoLayoutPositions = useMemo(() => {
    const positions = new Map<string, { x: number; y: number; width: number; height: number }>();
    
    // Use STABLE ref of auto-layout IDs (doesn't trigger recalc when event times change)
    const autoEventIds = autoLayoutEventIdsRef.current;
    
    // Build Map for fast lookup
    const eventMap = new Map(events.map(e => [e.id, e]));
    
    // Get actual events and sort by start time
    const autoEvents = autoEventIds
      .map(id => eventMap.get(id))
      .filter((e): e is TimelineEvent => e !== undefined);
    
    const sortedEvents = [...autoEvents].sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
    
    // Compact card dimensions - 40px height
    const cardHeight = 40;
    const rowGap = 12;
    const rowHeight = cardHeight + rowGap;
    const baseY = 60; // Offset for time axis
    
    // Track occupied time ranges per lane
    interface Lane {
      lastEndTime: number;
      lastEndX: number;
    }
    const lanes: Lane[] = [];
    
    sortedEvents.forEach((event) => {
      const defaultX = dateToX(event.startTime);
      const width = getEventWidth(event);
      const eventStartTime = event.startTime.getTime();
      const eventEndTime = event.endTime?.getTime() || event.startTime.getTime() + (2 * 60 * 60 * 1000); // Default 2h
      
      const startX = defaultX;
      const endX = defaultX + width;
      
      // Find first lane where this event doesn't overlap
      let targetLane = -1;
      
      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i];
        if (!lane) continue;
        
        // Event must have BOTH time AND visual separation to fit in lane
        const timeGap = eventStartTime >= lane.lastEndTime;
        const visualGap = startX >= (lane.lastEndX + 16); // 16px buffer
        
        if (timeGap && visualGap) {
          targetLane = i;
          break;
        }
      }
      
      // If no suitable lane found, create new one
      if (targetLane === -1) {
        targetLane = lanes.length;
        lanes.push({ lastEndTime: 0, lastEndX: 0 });
      }
      
      // Update lane's last position
      const lane = lanes[targetLane];
      if (lane) {
        lane.lastEndTime = eventEndTime;
        lane.lastEndX = endX;
      }
      
      // Calculate Y position
      const y = targetLane * rowHeight + baseY;
      
      positions.set(event.id, { x: defaultX, y, width, height: cardHeight });
    });
    
    return positions;
  }, [autoLayoutEventIdsRef.current.length]); // PERFORMANCE: Only recalc when number of events changes
  
  // Merge auto-layout with custom positions
  const eventPositions = useMemo(() => {
    const positions = new Map(autoLayoutPositions);
    
    // Override with custom positions (user-dragged events)
    customPositions.forEach((customPos, eventId) => {
      const event = events.find(e => e.id === eventId);
      if (!event) return;
      
      const width = getEventWidth(event);
      positions.set(eventId, { 
        x: customPos.x, 
        y: customPos.y, 
        width, 
        height: 40 
      });
    });
    
    return positions;
  }, [autoLayoutPositions, customPositions, events.length, zoomLevel]);
  
  // Real-time positions during drag (for dependency lines)
  const liveEventPositions = useMemo(() => {
    const positions = new Map(eventPositions);
    
    if (draggingEvent) {
      const deltaX = draggingEvent.currentX - draggingEvent.startX;
      const deltaY = draggingEvent.currentY - draggingEvent.startY;
      
      const originalPos = eventPositions.get(draggingEvent.id);
      if (originalPos) {
        positions.set(draggingEvent.id, {
          ...originalPos,
          x: draggingEvent.originalX + deltaX,
          y: draggingEvent.originalY + deltaY,
        });
      }
    }
    
    return positions;
  }, [eventPositions, draggingEvent]);
  
  // Native drag effect - handles mouse move and up
  useEffect(() => {
    if (!draggingEvent) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      if (!draggingEvent) return;
      const dx = e.clientX - draggingEvent.startX;
      const dy = e.clientY - draggingEvent.startY;
      const moved = Math.abs(dx) > 4 || Math.abs(dy) > 4; // small threshold

      setDraggingEvent(prev => prev ? {
        ...prev,
        currentX: e.clientX,
        currentY: e.clientY,
        moved: prev.moved || moved,
      } : null);
    };
    
    const handleMouseUp = (e: MouseEvent) => {
      if (!draggingEvent) return;
      
      const deltaX = e.clientX - draggingEvent.startX;
      const deltaY = e.clientY - draggingEvent.startY;
      
      let newX = draggingEvent.originalX + deltaX;
      const newY = draggingEvent.originalY + deltaY;
      
      // DAY SNAP: If close to a day boundary, snap to it
      const draggedEventData = events.find(ev => ev.id === draggingEvent.id);
      if (draggedEventData) {
        // Find which day this X position corresponds to
        let cumulativeX = 0;
        const currentDay = new Date(startDate);
        let closestDayStart = 0;
        let minDistance = Infinity;
        
        while (currentDay <= endDate) {
          const dayWidth = getDayWidth(currentDay);
          const dayStartX = cumulativeX;
          const dayEndX = cumulativeX + dayWidth;
          
          // Check distance to both day boundaries
          const distToStart = Math.abs(newX - dayStartX);
          const distToEnd = Math.abs(newX - dayEndX);
          
          if (distToStart < minDistance && distToStart < 30) { // 30px snap threshold
            minDistance = distToStart;
            closestDayStart = dayStartX;
          }
          if (distToEnd < minDistance && distToEnd < 30) {
            minDistance = distToEnd;
            closestDayStart = dayEndX;
          }
          
          cumulativeX += dayWidth;
          currentDay.setDate(currentDay.getDate() + 1);
        }
        
        // Apply snap if close enough
        if (minDistance < 30) {
          newX = closestDayStart;
        }
        
        // Apply the move
        setCustomPositions(prev => {
          const newMap = new Map(prev);
          newMap.set(draggingEvent.id, { x: newX, y: newY });
          return newMap;
        });
        
        // Mark this event as permanently custom-positioned (never auto-layout again)
        draggedEventIds.current.add(draggingEvent.id);
        
        // Calculate new time from X position
        const totalMs = endDate.getTime() - startDate.getTime();
        const msPerPx = totalMs / dayPositions.totalWidth;
        const timeOffsetMs = (newX - draggingEvent.originalX) * msPerPx;
        const newStartTime = new Date(draggedEventData.startTime.getTime() + timeOffsetMs);
        
        if (onEventDrag) {
          onEventDrag(draggingEvent.id, newStartTime);
        }
      }
      
      // Suppress click if event was actually moved
      if (draggingEvent.moved) {
        justDraggedRef.current = true;
        window.setTimeout(() => { justDraggedRef.current = false; }, 220);
      }

      setDraggingEvent(null);

      // Restore text selection
      try { document.body.style.userSelect = ''; } catch {}
    };
    
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [draggingEvent, events, onEventDrag, endDate, startDate, dayPositions]);
  
  // Horizontal view
  if (viewMode === 'horizontal') {
    return (
        <motion.div 
          ref={canvasRef} 
          className={`relative w-full ${draggingEvent ? 'cursor-grabbing' : ''}`}
          style={{ minHeight: '600px' }}
          initial={false}
          animate={{ 
            scale: 1,
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30,
          }}
        >
          {/* Grid background - FIXED size, not zoom dependent */}
          <div className="absolute inset-0 opacity-5 pointer-events-none">
            <div className="w-full h-full" style={{
              backgroundImage: `
                linear-gradient(to right, rgba(255,255,255,0.1) 1px, transparent 1px),
                linear-gradient(to bottom, rgba(255,255,255,0.1) 1px, transparent 1px)
              `,
              backgroundSize: `120px 72px`
            }} />
          </div>
          
          <div 
            className="relative p-8" 
            data-total-width={dayPositions.totalWidth}
            style={{ 
              width: `${dayPositions.totalWidth}px`,
              minHeight: '2000px', // Allow infinite vertical space
            }}
          >
            {/* Time axis with day markers - STICKY */}
            <div className="sticky top-0 z-30 h-10 mb-4 border-b border-white/20 bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-900/80 backdrop-blur-md">
              {dayMarkers.map((marker, i) => (
                <div
                  key={i}
                  className="absolute top-0 h-full"
                  style={{ left: `${marker.x}px` }}
                >
                  {/* Vertical day line */}
                  <div className="absolute w-px h-screen bg-white/5 -top-0 pointer-events-none" />
                  
                  {/* Date label - FIXED font size */}
                  <div className="flex flex-col items-start">
                    <div className="font-medium text-white/70 mb-0.5 text-sm">
                      {marker.label}
                    </div>
                    <div className="w-1 h-1 rounded-full bg-white/30" />
                  </div>
                </div>
              ))}
              
              {/* Today marker */}
              {(() => {
                const today = new Date();
                const todayX = dateToX(today);
                return (
                  <div
                    className="absolute top-0 h-10 pointer-events-none z-10"
                    style={{ left: `${todayX}px` }}
                  >
                    <div className="w-0.5 h-full bg-accent-500/60" />
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-accent-500 text-white text-[10px] font-medium uppercase tracking-wide whitespace-nowrap">
                      Today
                    </div>
                  </div>
                );
              })()}
            </div>
            
            {/* Events with drag & drop */}
            <div className="relative space-y-2 pb-8">
              {/* Tour route lines - behind everything - PERFORMANCE: only render if enabled */}
              {showTourRoutes && events.length > 1 && events.length < 100 && (
                <TourRouteLines
                  events={events}
                  eventPositions={eventPositions}
                  zoomLevel={zoomLevel}
                />
              )}
              
              {/* Dependency lines - PERFORMANCE: only render if there are dependencies */}
              {dependencies.length > 0 && dependencies.length < 50 && (
                <DependencyLines
                  dependencies={dependencies}
                  eventPositions={liveEventPositions}
                  showCriticalPath={showCriticalPath}
                  criticalEventIds={criticalPathIds}
                  zoomLevel={zoomLevel}
                />
              )}
              
              {events.map((event, index) => {
                const pos = eventPositions.get(event.id);
                let x = pos?.x ?? dateToX(event.startTime);
                let y = pos?.y ?? (index * 64 + 80);
                
                // Apply drag offset if this event is being dragged
                const isDragging = draggingEvent?.id === event.id;
                if (isDragging && draggingEvent) {
                  const deltaX = draggingEvent.currentX - draggingEvent.startX;
                  const deltaY = draggingEvent.currentY - draggingEvent.startY;
                  x = draggingEvent.originalX + deltaX;
                  y = draggingEvent.originalY + deltaY;
                }
                
                return (
                  <DraggableEvent
                    key={event.id}
                    event={event}
                    x={x}
                    y={y}
                    width={pos?.width ?? getEventWidth(event)}
                    index={index}
                    isHovered={hoveredEvent === event.id}
                    isDragging={isDragging}
                    zoomLevel={zoomLevel}
                    onHover={setHoveredEvent}
                    onClick={(e) => { if (!justDraggedRef.current) onEventClick?.(e); }}
                    onContextMenu={(e, x, y) => onContextMenu?.(e, x, y)}
                    onMouseDown={(clientX, clientY) => handleMouseDown(event, clientX, clientY, x, y)}
                  />
                );
              })}
            </div>
            
            {/* Empty state */}
            {events.length === 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute inset-0 flex items-center justify-center"
              >
                <div className="text-center glass rounded-2xl border border-white/10 p-12">
                  <Clock className="w-16 h-16 mx-auto mb-4 text-white/20" />
                  <h3 className="text-lg font-medium text-white mb-2">
                    No events to display
                  </h3>
                  <p className="text-sm text-white/40 max-w-sm">
                    Your timeline is empty. Add shows, travel, or tasks to see them visualized here.
                  </p>
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
    );
  }
  
  // Vertical view (list)
  return (
    <div ref={canvasRef} className="space-y-2 overflow-auto h-full p-4">
      {events.map((event, index) => {
        const Icon = getEventIcon(event.type);
        const isHovered = hoveredEvent === event.id;
        
        return (
          <motion.div
            key={event.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onMouseEnter={() => setHoveredEvent(event.id)}
            onMouseLeave={() => setHoveredEvent(null)}
          >
            <motion.div
              whileHover={{ scale: 1.01, x: 4 }}
              onClick={() => onEventClick?.(event)}
              className={`
                p-4 rounded-lg border cursor-pointer
                bg-gradient-to-r backdrop-blur-sm
                ${getEventColors(event.type, event.importance)}
                ${event.status === 'tentative' || event.status === 'offer' ? 'opacity-60 border-dashed' : ''}
                ${event.status === 'canceled' ? 'opacity-30' : ''}
                transition-all duration-200
              `}
            >
              <div className="flex items-center gap-3">
                <Icon className="w-5 h-5 text-white flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-white mb-1">
                    {event.title}
                  </div>
                  <div className="text-sm text-white/60 flex items-center gap-3">
                    <span>
                      {event.startTime.toLocaleString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                    {event.location && (
                      <>
                        <span className="text-white/30">•</span>
                        <span>{event.location}</span>
                      </>
                    )}
                  </div>
                </div>
                {event.importance === 'critical' && (
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
                )}
              </div>
            </motion.div>
          </motion.div>
        );
      })}
      
      {events.length === 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="h-full flex items-center justify-center"
        >
          <div className="text-center glass rounded-2xl border border-white/10 p-12">
            <Clock className="w-16 h-16 mx-auto mb-4 text-white/20" />
            <h3 className="text-lg font-medium text-white mb-2">
              No events to display
            </h3>
            <p className="text-sm text-white/40 max-w-sm">
              Your timeline is empty. Add shows, travel, or tasks to see them visualized here.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  );
}
