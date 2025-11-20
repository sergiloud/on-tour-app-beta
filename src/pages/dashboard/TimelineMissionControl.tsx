/**
 * Timeline Mission Control v2.0
 * 
 * The ultimate operational brain for tour management.
 * Features: Gantt-style horizontal timeline, drag & drop, critical path detection,
 * what-if simulations, conflict radar, and AI-powered insights.
 * 
 * Fully integrated with On Tour App design system.
 */

import React, { useState, useMemo, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, Clock, AlertTriangle, Sparkles, GitBranch,
  ZoomIn, ZoomOut, Play, Save, History, Wand2, Settings,
  Filter, Undo2, Redo2, Target, RotateCcw
} from 'lucide-react';
import { t } from '../../lib/i18n';
import { useAuth } from '../../context/AuthContext';
import { useOrg } from '../../context/OrgContext';
import TimelineCanvas from '../../components/timeline/TimelineCanvas';
import TimelineStats from '../../components/timeline/TimelineStats';
import TimelineMinimap from '../../components/timeline/TimelineMinimap';
import EventDetailModal from '../../components/timeline/EventDetailModal';
import QuickActionsPopover from '../../components/timeline/QuickActionsPopover';
import KeyboardShortcutsHelp from '../../components/timeline/KeyboardShortcutsHelp';
import TimelineInstructions from '../../components/timeline/TimelineInstructions';
import TimelineMissionControlService from '../../services/timelineMissionControlService';
import type { 
  TimelineEvent, 
  TimelineConflict, 
  TimelineScenario,
  EventType
} from '../../services/timelineMissionControlService';

// Types
type ViewMode = 'horizontal' | 'vertical';
type TimelineMode = 'live' | 'simulation';

/**
 * Main Mission Control Page
 */
export default function TimelineMissionControl() {
  const { profile } = useAuth();
  const { orgId, org } = useOrg();
  
  // State
  const [viewMode, setViewMode] = useState<ViewMode>('horizontal');
  const [mode, setMode] = useState<TimelineMode>('live');
  const [selectedVersion, setSelectedVersion] = useState<string | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null); // null = all years
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [showConflicts, setShowConflicts] = useState(true);
  const [showCriticalPath, setShowCriticalPath] = useState(false); // Disabled by default (performance)
  const [showTourRoutes, setShowTourRoutes] = useState(false); // Disabled by default (performance)
  const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [showInstructions, setShowInstructions] = useState(true); // Show on first load
  const [showConflictRadar, setShowConflictRadar] = useState(true); // Right sidebar
  const [showVersions, setShowVersions] = useState(false); // Left sidebar (collapsed by default)
  const [contextMenu, setContextMenu] = useState<{ event: TimelineEvent; x: number; y: number } | null>(null);
  const [activeFilters, setActiveFilters] = useState<Set<EventType>>(
    new Set<EventType>(['show', 'travel', 'finance', 'task', 'contract'])
  );
  const [dragHistory, setDragHistory] = useState<Array<{eventId: string; oldStart: Date; newStart: Date}>>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const canvasRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const lastMouseX = useRef<number>(0);
  const lastMouseY = useRef<number>(0);
  const isPanning = useRef<boolean>(false);
  const panStartX = useRef<number>(0);
  const panStartY = useRef<number>(0);
  const panStartScrollLeft = useRef<number>(0);
  const panStartScrollTop = useRef<number>(0);
  
  // Get available years for filtering
  const availableYears = useMemo(() => {
    if (!orgId || !profile?.id) return [];
    return TimelineMissionControlService.getAvailableYears(orgId, profile.id);
  }, [orgId, profile?.id]);
  
  // Count events per year (for dropdown display)
  const eventCountByYear = useMemo(() => {
    const allEvents = TimelineMissionControlService.getEvents(orgId, profile?.id || '', null);
    const counts = new Map<number, number>();
    allEvents.forEach(event => {
      const year = new Date(event.startTime).getFullYear();
      counts.set(year, (counts.get(year) || 0) + 1);
    });
    return counts;
  }, [orgId, profile?.id]);
  
  // Load real data from service - memoize with stable dependencies + year filter
  const events: TimelineEvent[] = useMemo(() => {
    if (!orgId || !profile?.id) return [];
    return TimelineMissionControlService.getEvents(orgId, profile.id, selectedYear);
  }, [orgId, profile?.id, selectedYear]);
  
  const dependencies = useMemo(() => {
    if (!orgId) return [];
    return TimelineMissionControlService.getDependencies(orgId);
  }, [orgId]);
  
  // PERFORMANCE: Only recalculate conflicts when events array changes (not on every render)
  const conflicts: TimelineConflict[] = useMemo(() => {
    if (events.length === 0) return [];
    return TimelineMissionControlService.detectConflicts(events, dependencies);
  }, [events.length, dependencies.length]);
  
  // PERFORMANCE: Critical path is expensive - only calculate when needed
  const criticalPath = useMemo(() => {
    if (!showCriticalPath || events.length === 0) return [];
    return TimelineMissionControlService.computeCriticalPath(events, dependencies);
  }, [events.length, dependencies.length, showCriticalPath]);
  
  const versions: TimelineScenario[] = useMemo(() => {
    if (!orgId || !profile?.id) return [];
    
    return [
      {
        id: 'v1',
        orgId,
        name: 'Plan Original',
        description: 'Current live timeline',
        events: events,
        dependencies: dependencies,
        projectedMetrics: {
          revenue: 45200,
          expenses: 18700,
          margin: 26500,
          showCount: events.filter(e => e.type === 'show').length,
        },
        createdAt: new Date(),
        createdBy: profile.id,
        isActive: true,
      },
    ];
  }, [events, dependencies, orgId, profile]);
  
  const handleSimulationToggle = () => {
    setMode(mode === 'live' ? 'simulation' : 'live');
  };
  
  const handleZoom = (direction: 'in' | 'out', mouseClientX?: number, mouseClientY?: number) => {
    if (!scrollContainerRef.current) return;
    
    const container = scrollContainerRef.current;
    const prevZoom = zoomLevel;
    
    // Calculate new zoom level
    const newZoom = direction === 'in' 
      ? Math.min(prevZoom + 0.5, 4) 
      : Math.max(prevZoom - 0.5, 0.5);
    
    if (newZoom === prevZoom) return; // No change
    
    // Get mouse position relative to the VIEWPORT
    const rect = container.getBoundingClientRect();
    const viewportX = mouseClientX !== undefined 
      ? mouseClientX - rect.left 
      : container.clientWidth / 2;
    const viewportY = mouseClientY !== undefined 
      ? mouseClientY - rect.top 
      : container.clientHeight / 2;
    
    // Calculate position in the CONTENT (scroll + viewport position)
    const contentX = container.scrollLeft + viewportX;
    const contentY = container.scrollTop + viewportY;
    
    // This position as a PERCENTAGE of the content
    const contentWidthBefore = container.scrollWidth;
    const contentHeightBefore = container.scrollHeight;
    const percentX = contentX / contentWidthBefore;
    const percentY = contentY / contentHeightBefore;
    
    // Update zoom level
    setZoomLevel(newZoom);
    
    // After zoom, recalculate scroll to keep the same point under cursor
    // Use double RAF to ensure DOM has updated with new zoom
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        if (!scrollContainerRef.current) return;
        
        // Read the updated content dimensions
        const contentWidthAfter = scrollContainerRef.current.scrollWidth;
        const contentHeightAfter = scrollContainerRef.current.scrollHeight;

        // The same point (as percentage) is now at a different pixel position
        const newContentX = percentX * contentWidthAfter;
        const newContentY = percentY * contentHeightAfter;
        
        // Adjust scroll to keep that point under the cursor
        scrollContainerRef.current.scrollLeft = newContentX - viewportX;
        scrollContainerRef.current.scrollTop = newContentY - viewportY;
      });
    });
  };
  
  const handleEventClick = (event: TimelineEvent) => {
    setSelectedEvent(event);
    setIsModalOpen(true);
  };
  
  const handleContextMenu = (event: TimelineEvent, x: number, y: number) => {
    setContextMenu({ event, x, y });
  };
  
  const handleConflictClick = (conflict: TimelineConflict) => {
    // Get the first event involved in the conflict
    const firstEventId = conflict.eventIds[0];
    if (!firstEventId) return;
    
    const targetEvent = events.find(e => e.id === firstEventId);
    if (!targetEvent || !scrollContainerRef.current) return;
    
    // Calculate position of the event in the timeline
    const timeRange = events.reduce((range, event) => {
      const start = event.startTime.getTime();
      const end = event.endTime?.getTime() || start;
      return {
        min: Math.min(range.min, start),
        max: Math.max(range.max, end)
      };
    }, { min: Infinity, max: -Infinity });
    
    const eventPercent = ((targetEvent.startTime.getTime() - timeRange.min) / (timeRange.max - timeRange.min)) * 100;
    const scrollTarget = (eventPercent / 100) * scrollContainerRef.current.scrollWidth;
    
    // Smooth scroll to the event
    scrollContainerRef.current.scrollTo({
      left: scrollTarget - scrollContainerRef.current.clientWidth / 2,
      behavior: 'smooth'
    });
    
    // Optional: Highlight the event temporarily
    // TODO: Add visual highlight effect
  };
  
  const handleEventDelete = (eventId: string) => {
    console.log('Delete event:', eventId);
    // TODO: Implement delete logic
    setIsModalOpen(false);
    setContextMenu(null);
  };
  
  const handleEventDuplicate = (event: TimelineEvent) => {
    console.log('Duplicate event:', event);
    // TODO: Implement duplicate logic
  };
  
  const handleEventDrag = (eventId: string, newStartTime: Date) => {
    console.log('Drag event:', eventId, 'to', newStartTime);
    // TODO: Implement drag logic - update event startTime in state/Firestore
    // For now, just log the action
    
    // Add to history for undo/redo
    const event = events.find(e => e.id === eventId);
    if (event) {
      const newHistory = dragHistory.slice(0, historyIndex + 1);
      newHistory.push({
        eventId,
        oldStart: event.startTime,
        newStart: newStartTime
      });
      setDragHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
  };
  
  const handleUndo = () => {
    if (historyIndex >= 0) {
      const action = dragHistory[historyIndex];
      console.log('Undo drag:', action);
      // TODO: Revert event to oldStart
      setHistoryIndex(historyIndex - 1);
    }
  };
  
  const handleRedo = () => {
    if (historyIndex < dragHistory.length - 1) {
      const action = dragHistory[historyIndex + 1];
      console.log('Redo drag:', action);
      // TODO: Apply event to newStart
      setHistoryIndex(historyIndex + 1);
    }
  };
  
  const toggleFilter = (type: EventType) => {
    setActiveFilters(prev => {
      const newFilters = new Set(prev);
      if (newFilters.has(type)) {
        newFilters.delete(type);
      } else {
        newFilters.add(type);
      }
      return newFilters;
    });
  };
  
  const scrollToToday = () => {
    // Calculate today's position and scroll smoothly
    const today = new Date();
    const firstEvent = events[0];
    if (!firstEvent || !scrollContainerRef.current) return;
    
    const timeRange = events.reduce((range, event) => {
      const start = event.startTime.getTime();
      const end = event.endTime?.getTime() || start;
      return {
        min: Math.min(range.min, start),
        max: Math.max(range.max, end)
      };
    }, { min: Infinity, max: -Infinity });
    
    const todayPercent = ((today.getTime() - timeRange.min) / (timeRange.max - timeRange.min)) * 100;
    const scrollTarget = (todayPercent / 100) * scrollContainerRef.current.scrollWidth;
    
    scrollContainerRef.current.scrollTo({
      left: scrollTarget - scrollContainerRef.current.clientWidth / 2,
      behavior: 'smooth'
    });
  };
  
  const resetView = () => {
    setZoomLevel(1);
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({
        left: 0,
        top: 0,
        behavior: 'smooth'
      });
    }
  };
  
  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter(event => activeFilters.has(event.type));
  }, [events, activeFilters]);
  
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape to close modal
      if (e.key === 'Escape' && isModalOpen) {
        setIsModalOpen(false);
        return;
      }
      
      // Don't handle shortcuts if modal is open
      if (isModalOpen) return;
      
      // Arrow keys for precise navigation (faster with Shift)
      const container = scrollContainerRef.current;
      if (container && ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        const step = e.shiftKey ? 100 : 50; // Faster scroll with Shift
        
        if (e.key === 'ArrowLeft') {
          container.scrollLeft -= step;
        } else if (e.key === 'ArrowRight') {
          container.scrollLeft += step;
        } else if (e.key === 'ArrowUp') {
          container.scrollTop -= step;
        } else if (e.key === 'ArrowDown') {
          container.scrollTop += step;
        }
        return;
      }
      
      // Home/End keys for quick navigation
      if (container && e.key === 'Home') {
        e.preventDefault();
        container.scrollLeft = 0;
        return;
      }
      if (container && e.key === 'End') {
        e.preventDefault();
        container.scrollLeft = container.scrollWidth;
        return;
      }
      
      // Zoom shortcuts
      if ((e.metaKey || e.ctrlKey) && e.key === '+') {
        e.preventDefault();
        handleZoom('in');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '-') {
        e.preventDefault();
        handleZoom('out');
      }
      if ((e.metaKey || e.ctrlKey) && e.key === '0') {
        e.preventDefault();
        setZoomLevel(1);
      }
      
      // View mode toggle (V key)
      if (e.key === 'v' && !e.metaKey && !e.ctrlKey) {
        setViewMode(prev => prev === 'horizontal' ? 'vertical' : 'horizontal');
      }
      
      // Simulation mode toggle (S key)
      if (e.key === 's' && !e.metaKey && !e.ctrlKey) {
        handleSimulationToggle();
      }
      
      // Toggle conflict radar (C key)
      if (e.key === 'c' && !e.metaKey && !e.ctrlKey) {
        setShowConflicts(prev => !prev);
      }
      
      // Show help (? key)
      if (e.key === '?' && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        setShowHelp(true);
      }
      
      // Undo (Cmd/Ctrl + Z)
      if ((e.metaKey || e.ctrlKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      
      // Redo (Cmd/Ctrl + Shift + Z)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'z') {
        e.preventDefault();
        handleRedo();
      }
      
      // Scroll to today (T key)
      if (e.key === 't' && !e.metaKey && !e.ctrlKey) {
        scrollToToday();
      }
      
      // Reset view (R key)
      if (e.key === 'r' && !e.metaKey && !e.ctrlKey) {
        resetView();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, zoomLevel, historyIndex, dragHistory, events]);
  
  // Mouse wheel zoom support (Ctrl + Wheel)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleWheel = (e: WheelEvent) => {
      // Ctrl/Cmd + Wheel for zoom
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        
        // Pass mouse CLIENT coordinates (relative to viewport)
        const direction = e.deltaY < 0 ? 'in' : 'out';
        handleZoom(direction, e.clientX, e.clientY);
      }
      // Shift + Wheel for horizontal scroll
      else if (e.shiftKey) {
        e.preventDefault();
        container.scrollLeft += e.deltaY;
      }
    };
    
    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => container.removeEventListener('wheel', handleWheel);
  }, [zoomLevel]);
  
  // Close context menu on scroll
  // Close context menu on scroll (PERFORMANCE: close immediately, no debounce needed)
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container || !contextMenu) return;
    
    const handleScroll = () => {
      setContextMenu(null);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, [contextMenu]);
  
  // Track mouse position for zoom centering
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      lastMouseX.current = e.clientX - rect.left + container.scrollLeft;
      lastMouseY.current = e.clientY - rect.top + container.scrollTop;
      
      // Handle panning when spacebar is held
      if (isPanning.current) {
        const deltaX = e.clientX - panStartX.current;
        const deltaY = e.clientY - panStartY.current;
        
        container.scrollLeft = panStartScrollLeft.current - deltaX;
        container.scrollTop = panStartScrollTop.current - deltaY;
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      // Start panning on middle mouse button or when spacebar is held
      if (e.button === 1 || (e.button === 0 && e.target === container)) {
        // Check if spacebar is currently pressed (we'll track this separately)
        if (e.button === 1) {
          e.preventDefault();
          isPanning.current = true;
          panStartX.current = e.clientX;
          panStartY.current = e.clientY;
          panStartScrollLeft.current = container.scrollLeft;
          panStartScrollTop.current = container.scrollTop;
          container.style.cursor = 'grabbing';
        }
      }
    };
    
    const handleMouseUp = () => {
      if (isPanning.current) {
        isPanning.current = false;
        container.style.cursor = '';
      }
    };
    
    container.addEventListener('mousemove', handleMouseMove);
    container.addEventListener('mousedown', handleMouseDown);
    container.addEventListener('mouseup', handleMouseUp);
    container.addEventListener('mouseleave', handleMouseUp);
    
    return () => {
      container.removeEventListener('mousemove', handleMouseMove);
      container.removeEventListener('mousedown', handleMouseDown);
      container.removeEventListener('mouseup', handleMouseUp);
      container.removeEventListener('mouseleave', handleMouseUp);
    };
  }, []);
  
  // Spacebar panning support
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;
    
    let spacePressed = false;
    
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !isModalOpen && document.activeElement === document.body) {
        e.preventDefault();
        if (!spacePressed) {
          spacePressed = true;
          container.style.cursor = 'grab';
        }
      }
    };
    
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        spacePressed = false;
        if (!isPanning.current) {
          container.style.cursor = '';
        }
      }
    };
    
    const handleMouseDown = (e: MouseEvent) => {
      // Pan with Spacebar + click OR with direct click on background (not on events)
      const target = e.target as HTMLElement;
      const isEventCard = target.closest('[data-event-card]'); // Events should have this attribute
      
      if ((spacePressed && e.button === 0) || (e.button === 0 && !isEventCard)) {
        e.preventDefault();
        isPanning.current = true;
        panStartX.current = e.clientX;
        panStartY.current = e.clientY;
        panStartScrollLeft.current = container.scrollLeft;
        panStartScrollTop.current = container.scrollTop;
        container.style.cursor = 'grabbing';
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    container.addEventListener('mousedown', handleMouseDown);
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      container.removeEventListener('mousedown', handleMouseDown);
    };
  }, [isModalOpen]);
  
  // Calculate stats
  const stats = useMemo(() => {
    const now = new Date();
    const pastEvents = events.filter(e => e.startTime < now);
    const futureEvents = events.filter(e => e.startTime >= now);
    
    const totalRevenue = events
      .filter(e => e.type === 'show' && e.metadata?.fee)
      .reduce((sum, e) => sum + (e.metadata?.fee || 0), 0);
    
    const totalExpenses = events
      .filter(e => e.type === 'travel' && e.metadata?.cost)
      .reduce((sum, e) => sum + (e.metadata?.cost || 0), 0);
    
    return {
      totalEvents: events.length,
      pastEvents: pastEvents.length,
      futureEvents: futureEvents.length,
      confirmedEvents: events.filter(e => e.status === 'confirmed').length,
      tentativeEvents: events.filter(e => e.status === 'tentative' || e.status === 'offer').length,
      conflicts: conflicts.length,
      projectedRevenue: totalRevenue,
      projectedExpenses: totalExpenses,
    };
  }, [events, conflicts]);
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut' }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            {t('missionControl.title')}
          </h1>
          <p className="text-white/60">
            {t('missionControl.description')}
          </p>
        </div>
        
        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <div className="relative group">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-2 rounded-lg glass border border-white/10 text-white/60 hover:text-white transition-all relative"
              title="Filter events (F)"
            >
              <Filter className="w-5 h-5" />
              {activeFilters.size < 5 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 text-white text-[10px] rounded-full flex items-center justify-center">
                  {activeFilters.size}
                </span>
              )}
            </motion.button>
            
            {/* Filter dropdown */}
            <div className="absolute top-full right-0 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
              <div className="glass rounded-xl border border-white/10 p-3 min-w-[200px] space-y-2">
                <div className="text-xs font-medium text-white/40 uppercase tracking-wide mb-2">Filter by Type</div>
                {(['show', 'travel', 'finance', 'task', 'contract'] as EventType[]).map(type => (
                  <label key={type} className="flex items-center gap-2 cursor-pointer hover:bg-white/5 rounded-lg p-1.5 transition-all">
                    <input
                      type="checkbox"
                      checked={activeFilters.has(type)}
                      onChange={() => toggleFilter(type)}
                      className="w-4 h-4 rounded border-white/20 bg-white/5 checked:bg-accent-500"
                    />
                    <span className="text-sm capitalize text-white/80">{type}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          
          {/* Year Filter Selector */}
          <div className="relative group">
            <select
              value={selectedYear || 'all'}
              onChange={(e) => setSelectedYear(e.target.value === 'all' ? null : parseInt(e.target.value))}
              className="glass border border-white/10 rounded-lg px-3 py-2 text-sm text-white/80 bg-transparent cursor-pointer hover:border-accent-500/30 transition-all appearance-none pr-8"
              title="Filter by year"
            >
              <option value="all" className="bg-slate-800 text-white">
                All Years ({events.length} events)
              </option>
              {availableYears.map(year => (
                <option key={year} value={year} className="bg-slate-800 text-white">
                  {year} ({eventCountByYear.get(year) || 0} events)
                </option>
              ))}
            </select>
            <Calendar className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
          
          {/* Event Stats Indicator */}
          {events.length > 0 && (
            <div className="glass rounded-lg border border-white/10 px-3 py-2 flex items-center gap-3 text-xs">
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span className="text-white/60">Past:</span>
                <span className="text-white font-medium">{stats.pastEvents}</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-white/60">Future:</span>
                <span className="text-white font-medium">{stats.futureEvents}</span>
              </div>
            </div>
          )}
          
          {/* Undo/Redo */}
          <div className="flex items-center gap-1">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleUndo}
              disabled={historyIndex < 0}
              className="p-2 rounded-lg glass border border-white/10 text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (⌘Z)"
            >
              <Undo2 className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleRedo}
              disabled={historyIndex >= dragHistory.length - 1}
              className="p-2 rounded-lg glass border border-white/10 text-white/60 hover:text-white transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (⌘⇧Z)"
            >
              <Redo2 className="w-5 h-5" />
            </motion.button>
          </div>
          
          {/* Scroll to Today */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={scrollToToday}
            className="p-2 rounded-lg glass border border-white/10 text-white/60 hover:text-white transition-all"
            title="Jump to Today (T)"
          >
            <Target className="w-5 h-5" />
          </motion.button>
          
          {/* Toggle Tour Routes */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowTourRoutes(!showTourRoutes)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${showTourRoutes 
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
                : 'glass border border-white/10 text-white/60 hover:text-white'
              }
            `}
            title="Show Tour Routes"
          >
            <GitBranch className="w-4 h-4" />
            {showTourRoutes ? 'Routes' : 'Routes'}
          </motion.button>
        </div>
        
        {/* Mode Toggle */}
        <div className="flex items-center gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowHelp(true)}
            className="p-2 rounded-lg glass border border-white/10 text-white/60 hover:text-white transition-all"
            title="Keyboard shortcuts (?)"
          >
            <Settings className="w-5 h-5" />
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowConflicts(!showConflicts)}
            className={`
              px-3 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2
              ${showConflicts 
                ? 'glass border border-white/10 text-white/60' 
                : 'glass border border-white/10 text-white/40'
              }
            `}
          >
            <AlertTriangle className="w-4 h-4" />
            {showConflicts ? 'Hide' : 'Show'} Radar
          </motion.button>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSimulationToggle}
            className={`
              px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2
              ${mode === 'simulation' 
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                : 'glass border border-white/10 text-white/60 hover:text-white hover:border-accent-500/30'
              }
            `}
          >
            {mode === 'simulation' ? <Play className="w-4 h-4" /> : <Wand2 className="w-4 h-4" />}
            {mode === 'simulation' ? 'Exit Simulation' : 'Start Simulation'}
          </motion.button>
        </div>
      </div>
      
      {/* Simulation Banner */}
      <AnimatePresence>
        {mode === 'simulation' && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="glass rounded-xl border border-amber-500/30 bg-amber-500/10 p-4"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                <span className="font-medium text-amber-400">Simulation Mode Active</span>
                <span className="text-sm text-white/60">Changes won't affect live data</span>
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 rounded-lg glass border border-white/10 text-sm hover:border-accent-500/30 transition-all">
                  <Save className="w-4 h-4 inline mr-1" />
                  Save as Version
                </button>
                <button className="px-3 py-1.5 rounded-lg bg-accent-500/20 border border-accent-500/30 text-accent-400 text-sm hover:bg-accent-500/30 transition-all">
                  Apply Changes
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Timeline Stats */}
      <TimelineStats
        totalEvents={stats.totalEvents}
        confirmedEvents={stats.confirmedEvents}
        tentativeEvents={stats.tentativeEvents}
        conflicts={stats.conflicts}
        projectedRevenue={stats.projectedRevenue}
        projectedExpenses={stats.projectedExpenses}
      />
      
      {/* Main Layout: Integrated Sidebars + Timeline Canvas */}
      <div className="relative flex gap-4">
        {/* Left Sidebar - Timeline Versions (collapsible) */}
        <AnimatePresence>
          {showVersions && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-shrink-0 overflow-hidden"
            >
              <div className="glass rounded-xl border border-white/10 p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <History className="w-4 h-4 text-purple-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Timeline Versions
                    </h3>
                  </div>
                  <button
                    onClick={() => setShowVersions(false)}
                    className="p-1 hover:bg-white/5 rounded transition-colors"
                  >
                    <span className="text-white/40 text-xs">✕</span>
                  </button>
                </div>
                
                <div className="space-y-2">
                  {versions.map((version) => (
                    <motion.button
                      key={version.id}
                      whileHover={{ scale: 1.01 }}
                      onClick={() => setSelectedVersion(version.id)}
                      className={`
                        w-full text-left p-3 rounded-lg border transition-all
                        ${selectedVersion === version.id 
                          ? 'bg-accent-500/20 border-accent-500/30' 
                          : 'glass border-white/10 hover:border-accent-500/20'}
                      `}
                    >
                      <div className="font-medium text-white text-sm mb-1">
                        {version.name}
                      </div>
                      <div className="text-xs text-white/40">
                        {version.createdAt.toLocaleDateString()}
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Center - Timeline Canvas */}
        <div className="flex-1 min-w-0">
          <div className="glass rounded-xl border border-white/10 p-6 h-full">
            {/* Timeline Controls */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                {/* Version toggle button */}
                <button
                  onClick={() => setShowVersions(!showVersions)}
                  className={`
                    p-2 rounded-lg transition-all text-sm flex items-center gap-1.5
                    ${showVersions
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' 
                      : 'glass border border-white/10 text-white/60 hover:text-white'}
                  `}
                  title="Toggle Versions (V)"
                >
                  <History className="w-4 h-4" />
                </button>
                
                <div className="w-px h-6 bg-white/10" />
                
                <button
                  onClick={() => setViewMode('horizontal')}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-all
                    ${viewMode === 'horizontal' 
                      ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30' 
                      : 'glass border border-white/10 text-white/60 hover:text-white'}
                  `}
                >
                  Horizontal
                </button>
                <button
                  onClick={() => setViewMode('vertical')}
                  className={`
                    px-3 py-1.5 rounded-lg text-sm transition-all
                    ${viewMode === 'vertical' 
                      ? 'bg-accent-500/20 text-accent-400 border border-accent-500/30' 
                      : 'glass border border-white/10 text-white/60 hover:text-white'}
                  `}
                >
                  Vertical
                </button>
              </div>
              
              <div className="flex items-center gap-3">
                {/* Navigation Controls */}
                <button
                  onClick={scrollToToday}
                  className="px-3 py-2 rounded-lg glass border border-white/10 text-white/60 hover:text-white hover:border-accent-500/30 transition-all text-sm flex items-center gap-1.5"
                  title="Scroll to Today (T)"
                >
                  <Target className="w-4 h-4" />
                  Today
                </button>
                
                <button
                  onClick={resetView}
                  className="p-2 rounded-lg glass border border-white/10 text-white/60 hover:text-white hover:border-accent-500/30 transition-all"
                  title="Reset View (R)"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                
                <div className="w-px h-6 bg-white/10" />
                
                {/* Zoom Controls */}
                <button
                  onClick={() => handleZoom('out')}
                  disabled={zoomLevel <= 0.5}
                  className="p-2 rounded-lg glass border border-white/10 text-white/60 hover:text-white hover:border-accent-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Zoom Out (Ctrl + -)"
                >
                  <ZoomOut className="w-4 h-4" />
                </button>
                
                {/* Zoom indicator with slider */}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/10">
                  <span className="text-xs text-white/40">Zoom:</span>
                  <input
                    type="range"
                    min="0.5"
                    max="4"
                    step="0.25"
                    value={zoomLevel}
                    onChange={(e) => setZoomLevel(parseFloat(e.target.value))}
                    className="w-20 h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-500"
                    style={{
                      background: `linear-gradient(to right, rgb(139, 92, 246) 0%, rgb(139, 92, 246) ${((zoomLevel - 0.5) / 3.5) * 100}%, rgba(255,255,255,0.1) ${((zoomLevel - 0.5) / 3.5) * 100}%, rgba(255,255,255,0.1) 100%)`
                    }}
                    title="Drag to zoom, or use Ctrl + Wheel"
                  />
                  <span className="text-xs text-white font-semibold tabular-nums min-w-[2.5rem] text-right">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                </div>
                
                <button
                  onClick={() => handleZoom('in')}
                  disabled={zoomLevel >= 4}
                  className="p-2 rounded-lg glass border border-white/10 text-white/60 hover:text-white hover:border-accent-500/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  title="Zoom In (Ctrl + +)"
                >
                  <ZoomIn className="w-4 h-4" />
                </button>
                
                <div className="w-px h-6 bg-white/10" />
                
                {/* Conflict Radar toggle */}
                <button
                  onClick={() => setShowConflictRadar(!showConflictRadar)}
                  className={`
                    p-2 rounded-lg transition-all flex items-center gap-1.5
                    ${showConflictRadar
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' 
                      : 'glass border border-white/10 text-white/60 hover:text-white'}
                  `}
                  title="Toggle Conflict Radar (C)"
                >
                  <AlertTriangle className="w-4 h-4" />
                  {conflicts.length > 0 && (
                    <span className="text-xs font-semibold">{conflicts.length}</span>
                  )}
                </button>
              </div>
            </div>
            
            {/* Minimap */}
            {viewMode === 'horizontal' && filteredEvents.length > 0 && (
              <div className="mb-6">
                <TimelineMinimap 
                  events={filteredEvents} 
                  scrollContainerRef={scrollContainerRef}
                />
              </div>
            )}
            
            {/* Timeline Canvas */}
            <div 
              ref={scrollContainerRef} 
              className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-400px)] relative"
              style={{
                scrollBehavior: 'auto',
                WebkitOverflowScrolling: 'touch'
              }}
            >
              <TimelineCanvas
                events={filteredEvents}
                viewMode={viewMode}
                zoomLevel={zoomLevel}
                showCriticalPath={showCriticalPath}
                showTourRoutes={showTourRoutes}
                dependencies={dependencies}
                criticalPathIds={new Set(criticalPath.filter(n => n.isOnCriticalPath).map(n => n.event.id))}
                onEventClick={handleEventClick}
                onEventDrag={handleEventDrag}
                onContextMenu={handleContextMenu}
              />
            </div>
          </div>
          
          {/* P&L Projection Bar (Simulation Mode) */}
          {mode === 'simulation' && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 glass rounded-xl border border-white/10 p-4"
            >
              <div className="grid grid-cols-3 gap-6">
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                    Projected Revenue
                  </div>
                  <div className="text-2xl font-bold text-green-400 tabular-nums">
                    +45.2K €
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                    Projected Expenses
                  </div>
                  <div className="text-2xl font-bold text-amber-400 tabular-nums">
                    -18.7K €
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-white/40 mb-1">
                    Net Margin
                  </div>
                  <div className="text-2xl font-bold text-accent-400 tabular-nums">
                    +26.5K € <span className="text-sm text-white/40">(+58%)</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
        
        {/* Right Sidebar - Conflict Radar (collapsible) */}
        <AnimatePresence>
          {showConflictRadar && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="flex-shrink-0 overflow-hidden"
            >
              <div className="glass rounded-xl border border-white/10 p-4 h-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <h3 className="text-sm font-semibold text-white">
                      Conflict Radar
                    </h3>
                    <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-semibold">
                      {conflicts.length}
                    </span>
                  </div>
                  <button
                    onClick={() => setShowConflictRadar(false)}
                    className="p-1 hover:bg-white/5 rounded transition-colors"
                  >
                    <span className="text-white/40 text-xs">✕</span>
                  </button>
                </div>
                
                <div className="space-y-3 max-h-[calc(100vh-450px)] overflow-y-auto pr-2">
                  {conflicts.length === 0 ? (
                    <div className="text-center py-8">
                      <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-3">
                        <span className="text-2xl">✓</span>
                      </div>
                      <div className="text-sm text-white/60">
                        No conflicts detected
                      </div>
                    </div>
                  ) : (
                    conflicts.map((conflict) => (
                      <motion.div
                        key={conflict.id}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleConflictClick(conflict)}
                        className={`
                          p-3 rounded-lg border cursor-pointer transition-all
                          ${conflict.level === 'CRITICAL' 
                            ? 'bg-red-500/10 border-red-500/30 hover:bg-red-500/20' 
                            : conflict.level === 'HIGH'
                            ? 'bg-amber-500/10 border-amber-500/30 hover:bg-amber-500/20'
                            : conflict.level === 'MEDIUM'
                            ? 'bg-yellow-500/10 border-yellow-500/30 hover:bg-yellow-500/20'
                            : 'bg-blue-500/10 border-blue-500/30 hover:bg-blue-500/20'}
                        `}
                      >
                        <div className={`
                          text-[10px] uppercase tracking-wider mb-1 font-semibold
                          ${conflict.level === 'CRITICAL' 
                            ? 'text-red-400' 
                            : conflict.level === 'HIGH'
                            ? 'text-amber-400'
                            : conflict.level === 'MEDIUM'
                            ? 'text-yellow-400'
                            : 'text-blue-400'}
                        `}>
                          {conflict.level}
                        </div>
                        <div className="font-medium text-white text-sm mb-1">
                          {conflict.message}
                        </div>
                        <div className="text-xs text-white/60">
                          {conflict.detail}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      
      {/* AI Copilot Button (Floating) */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-8 right-8 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-xl shadow-purple-500/25 flex items-center justify-center group"
      >
        <Sparkles className="w-6 h-6 text-white group-hover:rotate-12 transition-transform" />
      </motion.button>
      
      {/* Quick Actions Popover */}
      <QuickActionsPopover
        event={contextMenu?.event ?? null}
        position={contextMenu ? { x: contextMenu.x, y: contextMenu.y } : null}
        isOpen={contextMenu !== null}
        onClose={() => setContextMenu(null)}
        onDelete={handleEventDelete}
        onDuplicate={handleEventDuplicate}
        onEdit={(event: TimelineEvent) => {
          setSelectedEvent(event);
          setIsModalOpen(true);
          setContextMenu(null);
        }}
      />
      
      {/* Event Detail Modal */}
      <EventDetailModal
        event={selectedEvent}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onDelete={handleEventDelete}
        onDuplicate={handleEventDuplicate}
      />
      
      {/* Keyboard Shortcuts Help */}
      <KeyboardShortcutsHelp
        isOpen={showHelp}
        onClose={() => setShowHelp(false)}
      />
      
      {/* Timeline Instructions (first load) */}
      <TimelineInstructions
        isOpen={showInstructions}
        onClose={() => setShowInstructions(false)}
      />
    </motion.div>
  );
}
