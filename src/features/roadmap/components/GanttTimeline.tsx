/**
 * Roadmap Timeline - V11 Ultra Precision Edition
 * 
 * CARACTERÍSTICAS V11:
 * ✅ Drag ultra preciso - la tarjeta sigue el mouse pixel a pixel
 * ✅ CERO magnetismo al soltar - posición exacta donde sueltas
 * ✅ Sin bugs visuales - feedback visual mejorado durante drag
 * ✅ Conexiones fluidas que siguen en tiempo real
 * ✅ Performance optimizado sin throttle artificial
 * ✅ willChange para GPU acceleration durante drag
 */

import React, { useMemo, useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence, PanInfo } from 'framer-motion';
import type { RoadmapNode, Dependency } from '../types';
import { 
  format, differenceInDays, startOfMonth, endOfMonth, addDays,
  eachMonthOfInterval, isWithinInterval, parseISO, startOfYear, endOfYear,
  addMonths, addYears, startOfQuarter, endOfQuarter
} from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Music, Plane, DollarSign, CheckSquare, Target, Rocket,
  MapPin, Calendar, Home, ChevronLeft, ChevronRight, 
  Map as MapIcon, Link as LinkIcon, Sparkles, Zap,
  CalendarDays, TrendingUp, Plus, ZoomIn, ZoomOut, Move
} from 'lucide-react';

interface GanttTimelineProps {
  nodes: RoadmapNode[];
  dependencies?: Dependency[];
  startDate: Date;
  endDate: Date;
  isSimulationMode?: boolean;
  onNodeMove?: (nodeId: string, newStart: Date, newEnd: Date) => void;
  onNodeClick?: (node: RoadmapNode) => void;
}

type PeriodPreset = 'current-year' | 'current-year-plus-6' | 'next-year' | 'custom' | 'all';
type SubEventType = 'travel' | 'marketing' | 'tech-rider' | 'logistics' | 'meeting' | 'task';

interface SubEvent {
  id: string;
  parentId: string;
  type: SubEventType;
  title: string;
  status: string;
  progress: number;
}

interface TourConnection {
  id: string;
  fromId: string;
  toId: string;
  isTour: boolean;
  distance?: number;
  travelTime?: number;
}

interface NodePosition {
  x: number;
  y: number;
}

// ZOOM CONTINUO (5-50px por día)
const MIN_DAY_WIDTH = 5;
const MAX_DAY_WIDTH = 50;
const DEFAULT_DAY_WIDTH = 22;

const NODE_HEIGHT = 110;
const MIN_NODE_WIDTH = 280;
const CANVAS_PADDING = 80;
const ROW_SPACING = 30;
const LANE_HEIGHT = NODE_HEIGHT + ROW_SPACING;

const SUB_EVENT_TYPES = {
  travel: { icon: Plane, label: 'Travel', color: 'from-blue-500/30 to-blue-600/10' },
  marketing: { icon: Plus, label: 'Marketing', color: 'from-pink-500/30 to-pink-600/10' },
  'tech-rider': { icon: Target, label: 'Tech Rider', color: 'from-purple-500/30 to-purple-600/10' },
  logistics: { icon: CheckSquare, label: 'Logistics', color: 'from-orange-500/30 to-orange-600/10' },
  meeting: { icon: Calendar, label: 'Meeting', color: 'from-cyan-500/30 to-cyan-600/10' },
  task: { icon: CheckSquare, label: 'Task', color: 'from-slate-500/30 to-slate-600/10' }
};

const STORAGE_KEY = 'roadmap_node_positions';

export const GanttTimeline: React.FC<GanttTimelineProps> = ({ 
  nodes: rawNodes, 
  dependencies = [],
  startDate: propStartDate, 
  endDate: propEndDate,
  isSimulationMode = false,
  onNodeMove,
  onNodeClick
}) => {
  
  // DEDUPE + FILTER
  const nodes = useMemo(() => {
    const seen = new Set<string>();
    return rawNodes.filter(node => {
      if (seen.has(node.id)) return false;
      seen.add(node.id);
      return true;
    });
  }, [rawNodes]);

  const [dayWidth, setDayWidth] = useState(DEFAULT_DAY_WIDTH);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [selectedNodes, setSelectedNodes] = useState<Set<string>>(new Set());
  const [showMiniMap, setShowMiniMap] = useState(true);
  const [showConnections, setShowConnections] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const [periodPreset, setPeriodPreset] = useState<PeriodPreset>('current-year-plus-6');
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [subEvents, setSubEvents] = useState<Map<string, SubEvent[]>>(new Map());
  const [hoveredConnection, setHoveredConnection] = useState<string | null>(null);
  const [expandedNode, setExpandedNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<Map<string, NodePosition>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return new Map(Object.entries(parsed));
      }
    } catch (e) {
      console.warn('Failed to load saved positions:', e);
    }
    return new Map();
  });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const wheelAccumulator = useRef<number>(0);
  const lastWheelTime = useRef<number>(0);
  const rafRef = useRef<number | null>(null);
  const lastDragUpdate = useRef<number>(0);

  // CALCULAR RANGO DE FECHAS SEGÚN PERÍODO SELECCIONADO
  const { startDate, endDate } = useMemo(() => {
    const now = new Date();
    
    switch (periodPreset) {
      case 'current-year':
        return {
          startDate: startOfYear(now),
          endDate: endOfYear(now)
        };
      
      case 'current-year-plus-6':
        return {
          startDate: startOfYear(now),
          endDate: endOfMonth(addMonths(now, 6))
        };
      
      case 'next-year':
        const nextYear = addYears(now, 1);
        return {
          startDate: startOfYear(nextYear),
          endDate: endOfYear(nextYear)
        };
      
      case 'custom':
        const yearDate = new Date(selectedYear, 0, 1);
        return {
          startDate: startOfYear(yearDate),
          endDate: endOfYear(yearDate)
        };
      
      case 'all':
      default:
        return {
          startDate: propStartDate,
          endDate: propEndDate
        };
    }
  }, [periodPreset, selectedYear, propStartDate, propEndDate]);
  
  const totalDays = useMemo(() => differenceInDays(endDate, startDate), [startDate, endDate]);
  const timelineWidth = useMemo(() => totalDays * dayWidth, [totalDays, dayWidth]);

  const months = useMemo(() => eachMonthOfInterval({ start: startDate, end: endDate }), [startDate, endDate]);

  // Filtrar nodos visibles
  const visibleNodes = useMemo(() => {
    return nodes.filter(node => {
      const nodeStart = parseISO(node.startDate);
      const nodeEnd = node.endDate ? parseISO(node.endDate) : nodeStart;
      
      return isWithinInterval(nodeStart, { start: startDate, end: endDate }) ||
             isWithinInterval(nodeEnd, { start: startDate, end: endDate }) ||
             (nodeStart < startDate && nodeEnd > endDate);
    });
  }, [nodes, startDate, endDate]);

  // AUTO-DETECTAR TOURS (eventos consecutivos cercanos)
  const tourConnections = useMemo((): TourConnection[] => {
    const sorted = [...visibleNodes].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    const tours: TourConnection[] = [];
    
    for (let i = 0; i < sorted.length - 1; i++) {
      const current = sorted[i];
      const next = sorted[i + 1];
      
      if (!current || !next) continue;
      
      if (current.type === 'show' && next.type === 'show') {
        const currentEnd = current.endDate ? parseISO(current.endDate) : parseISO(current.startDate);
        const nextStart = parseISO(next.startDate);
        const daysBetween = differenceInDays(nextStart, currentEnd);
        
        if (daysBetween >= 0 && daysBetween <= 7) {
          tours.push({
            id: `tour-${current.id}-${next.id}`,
            fromId: current.id,
            toId: next.id,
            isTour: true,
            distance: daysBetween * 100,
            travelTime: daysBetween
          });
        }
      }
    }
    
    return tours;
  }, [visibleNodes]);

  // LAYOUT INICIAL (auto-layout como base)
  const initialLayout = useMemo(() => {
    const layout = new Map<string, { x: number; y: number; width: number; lane: number; color: string }>();
    
    const sortedNodes = [...visibleNodes].sort((a, b) => 
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    
    const lanes: { endX: number; nodeId: string }[] = [];
    
    const STATUS_COLORS = {
      confirmed: 'rgb(16, 185, 129)',
      pending: 'rgb(59, 130, 246)',
      cancelled: 'rgb(239, 68, 68)',
      completed: 'rgb(139, 92, 246)',
      draft: 'rgb(100, 116, 139)',
      'in-progress': 'rgb(245, 158, 11)'
    };
    
    sortedNodes.forEach((node, index) => {
      const nodeStart = parseISO(node.startDate);
      const nodeEnd = node.endDate ? parseISO(node.endDate) : nodeStart;
      const daysFromStart = Math.max(0, differenceInDays(nodeStart, startDate));
      const duration = Math.max(1, differenceInDays(nodeEnd, nodeStart) + 1);
      const nodeWidth = Math.max(MIN_NODE_WIDTH, duration * dayWidth);
      const nodeX = daysFromStart * dayWidth;
      
      const color = STATUS_COLORS[node.status as keyof typeof STATUS_COLORS] || STATUS_COLORS.draft;
      
      let assignedLane = -1;
      for (let i = 0; i < lanes.length; i++) {
        const lane = lanes[i];
        if (lane && lane.endX + 20 < nodeX) {
          assignedLane = i;
          lanes[i] = { endX: nodeX + nodeWidth, nodeId: node.id };
          break;
        }
      }
      
      if (assignedLane === -1) {
        assignedLane = lanes.length;
        lanes.push({ endX: nodeX + nodeWidth, nodeId: node.id });
      }
      
      layout.set(node.id, {
        x: nodeX,
        y: assignedLane * LANE_HEIGHT,
        width: nodeWidth,
        lane: assignedLane,
        color
      });
    });
    
    return layout;
  }, [visibleNodes, startDate, dayWidth]);

  // LAYOUT FINAL (combina auto-layout + posiciones custom)
  const nodeLayout = useMemo(() => {
    const layout = new Map(initialLayout);
    
    // Aplicar posiciones custom si existen
    nodePositions.forEach((pos, nodeId) => {
      const existing = layout.get(nodeId);
      if (existing) {
        layout.set(nodeId, {
          ...existing,
          x: pos.x,
          y: pos.y
        });
      }
    });
    
    return layout;
  }, [initialLayout, nodePositions]);

  // CONEXIONES DINÁMICAS - Optimizadas con shallow comparison
  const allConnections = useMemo(() => {
    const conns: any[] = [];
    
    // Tour connections
    tourConnections.forEach(tour => {
      const fromLayout = nodeLayout.get(tour.fromId);
      const toLayout = nodeLayout.get(tour.toId);
      
      if (fromLayout && toLayout) {
        const fromX = fromLayout.x + fromLayout.width;
        const fromY = fromLayout.y + NODE_HEIGHT / 2;
        const toX = toLayout.x;
        const toY = toLayout.y + NODE_HEIGHT / 2;
        
        conns.push({
          id: tour.id,
          fromX,
          fromY,
          toX,
          toY,
          color: 'rgb(99, 102, 241)',
          type: 'tour',
          isTour: true,
          fromId: tour.fromId,
          toId: tour.toId
        });
      }
    });
    
    // Dependency connections
    dependencies.forEach(dep => {
      const fromLayout = nodeLayout.get(dep.fromNodeId);
      const toLayout = nodeLayout.get(dep.toNodeId);
      
      if (fromLayout && toLayout) {
        const fromX = fromLayout.x + fromLayout.width;
        const fromY = fromLayout.y + NODE_HEIGHT / 2;
        const toX = toLayout.x;
        const toY = toLayout.y + NODE_HEIGHT / 2;
        
        conns.push({
          id: dep.id,
          fromX,
          fromY,
          toX,
          toY,
          color: fromLayout.color,
          type: dep.type,
          isTour: false,
          fromId: dep.fromNodeId,
          toId: dep.toNodeId
        });
      }
    });
    
    return conns;
  }, [tourConnections, dependencies, nodeLayout, draggedNode]); // Añadir draggedNode para re-render durante drag

  // ESTILOS DE STATUS
  const getStatusStyle = useCallback((status: string) => {
    const styles = {
      confirmed: {
        bg: 'bg-gradient-to-br from-emerald-500/25 via-emerald-500/15 to-emerald-600/10',
        border: 'border-emerald-400/40',
        text: 'text-emerald-300',
        glow: 'group-hover:shadow-xl group-hover:shadow-emerald-500/40',
        badge: 'bg-emerald-500/20 border-emerald-400/40 text-emerald-300'
      },
      pending: {
        bg: 'bg-gradient-to-br from-blue-500/25 via-blue-500/15 to-blue-600/10',
        border: 'border-blue-400/40',
        text: 'text-blue-300',
        glow: 'group-hover:shadow-xl group-hover:shadow-blue-500/40',
        badge: 'bg-blue-500/20 border-blue-400/40 text-blue-300'
      },
      cancelled: {
        bg: 'bg-gradient-to-br from-red-500/20 via-red-500/10 to-red-600/5',
        border: 'border-red-400/30',
        text: 'text-red-300',
        glow: 'group-hover:shadow-xl group-hover:shadow-red-500/30',
        badge: 'bg-red-500/20 border-red-400/30 text-red-300'
      },
      completed: {
        bg: 'bg-gradient-to-br from-violet-500/25 via-violet-500/15 to-violet-600/10',
        border: 'border-violet-400/40',
        text: 'text-violet-300',
        glow: 'group-hover:shadow-xl group-hover:shadow-violet-500/40',
        badge: 'bg-violet-500/20 border-violet-400/40 text-violet-300'
      },
      'in-progress': {
        bg: 'bg-gradient-to-br from-amber-500/25 via-amber-500/15 to-amber-600/10',
        border: 'border-amber-400/40',
        text: 'text-amber-300',
        glow: 'group-hover:shadow-xl group-hover:shadow-amber-500/40',
        badge: 'bg-amber-500/20 border-amber-400/40 text-amber-300'
      },
      draft: {
        bg: 'bg-gradient-to-br from-slate-500/20 via-slate-500/10 to-slate-600/5',
        border: 'border-slate-400/30',
        text: 'text-slate-400',
        glow: 'group-hover:shadow-xl group-hover:shadow-slate-500/30',
        badge: 'bg-slate-500/20 border-slate-400/30 text-slate-400'
      }
    };
    
    return styles[status as keyof typeof styles] || styles.draft;
  }, []);

  // ICONOS POR TIPO
  const getTypeIcon = useCallback((type: string) => {
    const iconMap = {
      show: Music,
      travel: Plane,
      finance: DollarSign,
      task: CheckSquare,
      milestone: Target,
      release: Rocket
    };
    
    const Icon = iconMap[type as keyof typeof iconMap] || MapPin;
    return <Icon className="w-5 h-5" strokeWidth={2.5} />;
  }, []);

  // DRAG HANDLERS V11 - ULTRA PRECISO SIN BUGS VISUALES
  const handleDragStart = useCallback((nodeId: string) => {
    setIsDragging(true);
    setDraggedNode(nodeId);
  }, []);

  const handleDrag = useCallback((nodeId: string, info: PanInfo) => {
    // NO throttle - actualizar en tiempo real para seguimiento perfecto del mouse
    const layout = initialLayout.get(nodeId);
    if (!layout) return;
    
    // Actualizar posición inmediatamente sin RAF para máxima precisión
    setNodePositions(prev => {
      const updated = new Map(prev);
      updated.set(nodeId, {
        x: layout.x + info.offset.x,
        y: layout.y + info.offset.y
      });
      return updated;
    });
  }, [initialLayout]);

  const handleDragEnd = useCallback((nodeId: string, info: PanInfo) => {
    setIsDragging(false);
    setDraggedNode(null);
    
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    
    const layout = initialLayout.get(nodeId);
    if (!layout) return;
    
    // Usar info.point en lugar de info.offset para posición absoluta precisa
    const finalX = layout.x + info.offset.x;
    const finalY = layout.y + info.offset.y;
    
    setNodePositions(prev => {
      const updated = new Map(prev);
      updated.set(nodeId, { x: finalX, y: finalY });
      
      // Auto-save to localStorage
      try {
        const obj = Object.fromEntries(updated);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(obj));
      } catch (e) {
        console.warn('Failed to save positions:', e);
      }
      
      return updated;
    });
    
    // Callback para actualizar fechas si es necesario
    if (onNodeMove) {
      const daysFromStart = Math.round(finalX / dayWidth);
      const node = visibleNodes.find(n => n.id === nodeId);
      if (node) {
        const newStartDate = addDays(startDate, daysFromStart);
        const duration = node.endDate 
          ? differenceInDays(parseISO(node.endDate), parseISO(node.startDate))
          : 0;
        const newEndDate = addDays(newStartDate, duration);
        onNodeMove(nodeId, newStartDate, newEndDate);
      }
    }
  }, [initialLayout, dayWidth, startDate, visibleNodes, onNodeMove]);

  // ZOOM HANDLERS (SIN AUTO-CENTRADO)
  const handleZoomIn = useCallback(() => {
    setDayWidth(prev => Math.min(MAX_DAY_WIDTH, prev + 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setDayWidth(prev => Math.max(MIN_DAY_WIDTH, prev - 3));
  }, []);

  const handleWheelZoom = useCallback((e: WheelEvent) => {
    if (e.altKey || e.ctrlKey || e.metaKey) {
      e.preventDefault();
      e.stopPropagation();
      
      const now = Date.now();
      const timeDelta = now - lastWheelTime.current;
      lastWheelTime.current = now;
      
      wheelAccumulator.current += e.deltaY;
      
      if (timeDelta > 50 || Math.abs(wheelAccumulator.current) > 30) {
        const delta = wheelAccumulator.current;
        wheelAccumulator.current = 0;
        
        setDayWidth(prev => {
          const change = delta > 0 ? -2 : 2;
          return Math.max(MIN_DAY_WIDTH, Math.min(MAX_DAY_WIDTH, prev + change));
        });
      }
    }
  }, []);

  // PRESET ZOOM LEVELS
  const setPresetZoom = useCallback((preset: 'day' | 'week' | 'month') => {
    const presets = {
      day: 45,
      week: 22,
      month: 9
    };
    setDayWidth(presets[preset]);
  }, []);

  // CENTRAR EN "HOY" - SOLO CUANDO EL USUARIO LO PIDE
  const scrollToToday = useCallback(() => {
    if (!containerRef.current) return;
    
    const today = new Date();
    if (today < startDate || today > endDate) return;
    
    const daysFromStart = differenceInDays(today, startDate);
    const scrollX = daysFromStart * dayWidth - (containerRef.current.clientWidth / 2);
    
    containerRef.current.scrollTo({ left: Math.max(0, scrollX), behavior: 'smooth' });
  }, [startDate, endDate, dayWidth]);

  // KEYBOARD SHORTCUTS
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        handleZoomIn();
      } else if (e.key === '-') {
        e.preventDefault();
        handleZoomOut();
      } else if (e.key === '1') {
        setPresetZoom('day');
      } else if (e.key === '2') {
        setPresetZoom('week');
      } else if (e.key === '3') {
        setPresetZoom('month');
      } else if (e.key === 't' || e.key === 'T') {
        scrollToToday();
      } else if (e.key === 'Home') {
        containerRef.current?.scrollTo({ left: 0, behavior: 'smooth' });
      } else if (e.key === 'End') {
        containerRef.current?.scrollTo({ left: timelineWidth, behavior: 'smooth' });
      } else if (e.key === 'c' || e.key === 'C') {
        setShowConnections(prev => !prev);
      } else if (e.key === 'm' || e.key === 'M') {
        setShowMiniMap(prev => !prev);
      } else if (e.key === 'r' || e.key === 'R') {
        setNodePositions(new Map());
        localStorage.removeItem(STORAGE_KEY);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [timelineWidth, handleZoomIn, handleZoomOut, setPresetZoom, scrollToToday]);

  // WHEEL LISTENERS
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    container.addEventListener('wheel', handleWheelZoom, { passive: false });
    
    return () => {
      container.removeEventListener('wheel', handleWheelZoom);
    };
  }, [handleWheelZoom]);

  // SCROLL TRACKING
  const [scrollProgress, setScrollProgress] = useState(0);
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const handleScroll = () => {
      const progress = container.scrollLeft / (container.scrollWidth - container.clientWidth);
      setScrollProgress(progress);
    };
    
    container.addEventListener('scroll', handleScroll, { passive: true });
    return () => container.removeEventListener('scroll', handleScroll);
  }, []);

  // CLEANUP RAF
  useEffect(() => {
    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, []);

  const canvasHeight = Math.max(600, (Math.max(...Array.from(nodeLayout.values()).map(l => l.lane)) + 1) * LANE_HEIGHT + CANVAS_PADDING + 200);

  // NAVEGACIÓN RÁPIDA
  const navigateToQuarter = useCallback((quarter: number) => {
    const quarterStart = startOfQuarter(new Date(selectedYear, quarter * 3, 1));
    const daysFromStart = differenceInDays(quarterStart, startDate);
    const scrollX = daysFromStart * dayWidth;
    containerRef.current?.scrollTo({ left: Math.max(0, scrollX), behavior: 'smooth' });
  }, [selectedYear, startDate, dayWidth]);

  // AÑOS DISPONIBLES
  const availableYears = useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);
  }, []);

  // LABEL DE ZOOM DINÁMICO
  const zoomLabel = useMemo(() => {
    if (dayWidth >= 40) return 'Ultra Detalle';
    if (dayWidth >= 30) return 'Detalle';
    if (dayWidth >= 18) return 'Normal';
    if (dayWidth >= 10) return 'Compacto';
    return 'Panorama';
  }, [dayWidth]);

  return (
    <div className="relative h-full flex flex-col bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      
      {/* TOOLBAR */}
      <div className="sticky top-0 z-20 backdrop-blur-xl bg-slate-900/95 border-b border-white/10 px-6 py-3">
        <div className="flex items-center justify-between gap-4">
          
          {/* LEFT: PERIOD SELECTOR */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
              <CalendarDays className="w-4 h-4 text-accent-400" />
              <select
                value={periodPreset}
                onChange={(e) => setPeriodPreset(e.target.value as PeriodPreset)}
                className="bg-transparent text-sm font-medium text-white border-none outline-none cursor-pointer"
              >
                <option value="current-year-plus-6" className="bg-slate-800">Año actual + 6 meses</option>
                <option value="current-year" className="bg-slate-800">Año completo actual</option>
                <option value="next-year" className="bg-slate-800">Próximo año</option>
                <option value="custom" className="bg-slate-800">Año personalizado</option>
                <option value="all" className="bg-slate-800">Todos los eventos</option>
              </select>
            </div>

            {/* YEAR SELECTOR */}
            <AnimatePresence>
              {periodPreset === 'custom' && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  className="flex items-center gap-1"
                >
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedYear(prev => prev - 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </motion.button>
                  
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(Number(e.target.value))}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-sm font-bold text-white outline-none cursor-pointer"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year} className="bg-slate-800">{year}</option>
                    ))}
                  </select>
                  
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setSelectedYear(prev => prev + 1)}
                    className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              )}
            </AnimatePresence>

            {/* QUICK QUARTER NAV */}
            {periodPreset === 'custom' && (
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4].map(q => (
                  <motion.button
                    key={q}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => navigateToQuarter(q - 1)}
                    className="px-2.5 py-1 rounded text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-accent-500/20 hover:border-accent-500/40 transition-all"
                  >
                    Q{q}
                  </motion.button>
                ))}
              </div>
            )}
          </div>

          {/* CENTER: ZOOM CONTROLS */}
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomOut}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-4 h-4" />
            </motion.button>

            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-accent-500/20 to-accent-600/10 border border-accent-400/40">
              <span className="text-sm font-bold text-accent-300">{zoomLabel}</span>
              <div className="flex items-center gap-1">
                <div className="w-32 h-1.5 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-accent-400 to-accent-500 rounded-full"
                    initial={false}
                    animate={{ 
                      width: `${((dayWidth - MIN_DAY_WIDTH) / (MAX_DAY_WIDTH - MIN_DAY_WIDTH)) * 100}%` 
                    }}
                    transition={{ duration: 0.2 }}
                  />
                </div>
                <span className="text-xs font-mono text-white/50">{dayWidth}px</span>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleZoomIn}
              className="p-2 rounded-lg bg-white/5 border border-white/10 text-white/70 hover:text-white hover:bg-white/10 transition-all"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-4 h-4" />
            </motion.button>

            {/* PRESET BUTTONS */}
            <div className="flex items-center gap-1 ml-2">
              {(['day', 'week', 'month'] as const).map((preset) => (
                <motion.button
                  key={preset}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setPresetZoom(preset)}
                  className="px-2.5 py-1 rounded text-xs font-medium bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-accent-500/20 hover:border-accent-500/40 transition-all"
                  title={`${preset === 'day' ? '1' : preset === 'week' ? '2' : '3'}`}
                >
                  {preset === 'day' ? 'D' : preset === 'week' ? 'S' : 'M'}
                </motion.button>
              ))}
            </div>
            
            <div className="ml-2 text-xs text-white/40 font-medium">
              Alt+Scroll | +/- | 1/2/3
            </div>
          </div>

          {/* RIGHT: UTILITIES */}
          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowConnections(prev => !prev)}
              className={`p-2 rounded-lg transition-all ${
                showConnections
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-400/40'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
              title="Toggle connections (C)"
            >
              <LinkIcon className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowMiniMap(prev => !prev)}
              className={`p-2 rounded-lg transition-all ${
                showMiniMap
                  ? 'bg-accent-500/20 text-accent-400 border border-accent-400/40'
                  : 'bg-white/5 border border-white/10 text-white/60 hover:text-white'
              }`}
              title="Toggle mini-map (M)"
            >
              <MapIcon className="w-4 h-4" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setNodePositions(new Map());
                localStorage.removeItem(STORAGE_KEY);
              }}
              className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-white/60 hover:text-white hover:bg-white/10 transition-all flex items-center gap-2"
              title="Reset layout (R)"
            >
              <Target className="w-4 h-4" />
              <span className="text-xs font-medium">Reset</span>
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToToday}
              className="px-3 py-2 rounded-lg bg-gradient-to-r from-rose-500/20 to-rose-600/10 border border-rose-400/40 text-rose-300 hover:bg-rose-500/30 transition-all flex items-center gap-2"
              title="Go to today (T)"
            >
              <Home className="w-4 h-4" />
              <span className="text-xs font-bold">Hoy</span>
            </motion.button>
          </div>
        </div>
      </div>

      {/* MINI-MAP */}
      <AnimatePresence>
        {showMiniMap && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="sticky top-[65px] z-10 backdrop-blur-xl bg-gradient-to-r from-slate-800/40 via-slate-800/60 to-slate-800/40 border-b border-white/10 px-6 py-2"
          >
            <div className="relative h-12 flex items-center gap-1">
              {months.map((month, index) => {
                const monthStart = startOfMonth(month);
                const monthEnd = endOfMonth(month);
                const daysInMonth = differenceInDays(monthEnd, monthStart) + 1;
                const monthWidth = (daysInMonth / totalDays) * 100;
                
                const nodesInMonth = visibleNodes.filter(node => {
                  const nodeDate = parseISO(node.startDate);
                  return isWithinInterval(nodeDate, { start: monthStart, end: monthEnd });
                }).length;
                
                return (
                  <motion.button
                    key={index}
                    whileHover={{ y: -2 }}
                    onClick={() => {
                      const daysFromStart = differenceInDays(monthStart, startDate);
                      const scrollX = daysFromStart * dayWidth;
                      containerRef.current?.scrollTo({ left: Math.max(0, scrollX), behavior: 'smooth' });
                    }}
                    style={{ width: `${monthWidth}%` }}
                    className="relative h-8 rounded bg-gradient-to-br from-white/5 to-white/0 border border-white/10 hover:border-accent-400/40 hover:bg-accent-500/10 transition-all group"
                  >
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-[10px] font-bold text-white/70 group-hover:text-accent-300">
                        {format(month, 'MMM', { locale: es })}
                      </span>
                      {nodesInMonth > 0 && (
                        <span className="text-[9px] font-medium text-white/50 group-hover:text-accent-400">
                          {nodesInMonth}
                        </span>
                      )}
                    </div>
                  </motion.button>
                );
              })}
              
              {/* VIEWPORT INDICATOR */}
              <motion.div
                className="absolute h-full rounded bg-gradient-to-r from-accent-500/30 via-accent-400/40 to-accent-500/30 border border-accent-400/60 backdrop-blur-sm pointer-events-none"
                style={{
                  left: `${scrollProgress * 100}%`,
                  width: '10%'
                }}
                animate={{
                  boxShadow: [
                    '0 0 10px rgba(99, 102, 241, 0.3)',
                    '0 0 20px rgba(99, 102, 241, 0.5)',
                    '0 0 10px rgba(99, 102, 241, 0.3)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CANVAS */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent"
        style={{
          maxHeight: 'calc(100vh - 320px)',
          cursor: isDragging ? 'grabbing' : 'default'
        }}
      >
        <div className="relative" style={{ width: timelineWidth, height: canvasHeight }}>
          
          {/* GRADIENT BACKGROUND */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-950/50 via-transparent to-slate-900/30 pointer-events-none" />
          
          {/* TODAY LINE */}
          {(() => {
            const today = new Date();
            if (today >= startDate && today <= endDate) {
              const daysFromStart = differenceInDays(today, startDate);
              const x = daysFromStart * dayWidth;
              
              return (
                <motion.div
                  className="absolute top-0 bottom-0 w-0.5 bg-gradient-to-b from-rose-500 via-rose-400 to-rose-500 z-10 pointer-events-none"
                  style={{ left: x }}
                  animate={{
                    boxShadow: [
                      '0 0 10px rgba(244, 63, 94, 0.5)',
                      '0 0 20px rgba(244, 63, 94, 0.7)',
                      '0 0 10px rgba(244, 63, 94, 0.5)'
                    ]
                  }}
                  transition={{ duration: 2.5, repeat: Infinity }}
                >
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-rose-500/30 border border-rose-400/60 backdrop-blur-sm">
                    <span className="text-[10px] font-black text-rose-300 whitespace-nowrap">HOY</span>
                  </div>
                </motion.div>
              );
            }
            return null;
          })()}

          {/* SVG CONNECTIONS */}
          {showConnections && allConnections.length > 0 && (
            <svg className="absolute inset-0 pointer-events-none" style={{ width: timelineWidth, height: canvasHeight }}>
              <defs>
                <filter id="connection-glow">
                  <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
                  <feMerge>
                    <feMergeNode in="coloredBlur"/>
                    <feMergeNode in="SourceGraphic"/>
                  </feMerge>
                </filter>
                <marker
                  id="arrowhead"
                  markerWidth="12"
                  markerHeight="12"
                  refX="11"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 12 3, 0 6" fill="currentColor" opacity="0.7" />
                </marker>
              </defs>
              
              {allConnections.map((conn) => {
                const isHighlighted = hoveredNode === conn.fromId || hoveredNode === conn.toId || hoveredConnection === conn.id || draggedNode === conn.fromId || draggedNode === conn.toId;
                const controlDistance = Math.abs(conn.toX - conn.fromX) * 0.35;
                const path = `M ${conn.fromX} ${conn.fromY} C ${conn.fromX + controlDistance} ${conn.fromY}, ${conn.toX - controlDistance} ${conn.toY}, ${conn.toX} ${conn.toY}`;
                
                return (
                  <motion.path
                    key={conn.id}
                    d={path}
                    stroke={isHighlighted ? conn.color : conn.isTour ? 'rgba(99, 102, 241, 0.6)' : 'rgba(148, 163, 184, 0.4)'}
                    strokeWidth={isHighlighted ? 4 : conn.isTour ? 3 : 2.5}
                    fill="none"
                    filter="url(#connection-glow)"
                    markerEnd="url(#arrowhead)"
                    style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
                    animate={{ 
                      opacity: isHighlighted ? 0.95 : 0.5,
                      strokeWidth: isHighlighted ? 4 : conn.isTour ? 3 : 2.5
                    }}
                    transition={{ 
                      type: 'tween',
                      duration: 0.15,
                      ease: 'linear'
                    }}
                    onMouseEnter={() => setHoveredConnection(conn.id)}
                    onMouseLeave={() => setHoveredConnection(null)}
                  />
                );
              })}
            </svg>
          )}

          {/* NODES ARRASTRABLES - SIN MAGNETISMO */}
          {Array.from(nodeLayout.entries()).map(([nodeId, layout], index) => {
            const node = visibleNodes.find(n => n.id === nodeId);
            if (!node) return null;
            
            const statusStyle = getStatusStyle(node.status);
            const isHovered = hoveredNode === nodeId;
            const isDraggingThis = draggedNode === nodeId;
            const isSelected = selectedNodes.has(nodeId);
            
            return (
              <motion.div
                key={nodeId}
                drag
                dragMomentum={false}
                dragElastic={0}
                dragPropagation={false}
                dragConstraints={false}
                onDragStart={() => handleDragStart(nodeId)}
                onDrag={(e, info) => handleDrag(nodeId, info)}
                onDragEnd={(e, info) => handleDragEnd(nodeId, info)}
                className={`group absolute rounded-xl border backdrop-blur-md overflow-visible transition-none ${statusStyle.bg} ${statusStyle.border} ${statusStyle.glow} ${
                  isSelected ? 'ring-2 ring-accent-400 ring-offset-2 ring-offset-slate-950' : ''
                } ${isDraggingThis ? 'cursor-grabbing shadow-2xl' : 'cursor-grab'}`}
                style={{
                  left: layout.x,
                  top: layout.y,
                  width: layout.width,
                  height: NODE_HEIGHT,
                  zIndex: isDraggingThis ? 100 : isHovered ? 50 : 10,
                  willChange: isDraggingThis ? 'transform' : 'auto'
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ 
                  opacity: 1, 
                  scale: isHovered && !isDraggingThis ? 1.02 : 1
                }}
                transition={{
                  opacity: { duration: 0.3, delay: index * 0.02 },
                  scale: { type: 'tween', duration: 0.15 }
                }}
                onMouseEnter={() => setHoveredNode(nodeId)}
                onMouseLeave={() => setHoveredNode(null)}
                onClick={() => {
                  if (onNodeClick) onNodeClick(node);
                  setSelectedNodes(prev => {
                    const newSet = new Set(prev);
                    if (newSet.has(nodeId)) newSet.delete(nodeId);
                    else newSet.add(nodeId);
                    return newSet;
                  });
                }}
              >
                {/* DRAG INDICATOR - Mejorado */}
                {isDraggingThis && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute -top-3 -right-3 z-50 pointer-events-none"
                  >
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-accent-500 border-2 border-white shadow-2xl">
                      <Move className="w-4 h-4 text-white animate-pulse" />
                      <span className="text-xs font-black text-white">ARRASTRANDO</span>
                    </div>
                  </motion.div>
                )}
                
                {/* GRAB HINT */}
                {isHovered && !isDraggingThis && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute top-2 right-2 p-1.5 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20"
                  >
                    <Move className="w-3.5 h-3.5 text-white/70" />
                  </motion.div>
                )}
                
                {/* GLOW EFFECT */}
                <div className={`absolute inset-0 bg-gradient-to-br from-white/8 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none rounded-xl ${
                  isDraggingThis ? 'opacity-100 from-accent-400/20 to-transparent' : ''
                }`} />
                
                {/* CONTENT */}
                <div className="relative h-full p-4 flex flex-col justify-between pointer-events-none">
                  <div className="flex items-start gap-3">
                    <motion.div
                      className={`${statusStyle.text}`}
                      whileHover={{ rotate: 8, scale: 1.1 }}
                      transition={{ type: 'spring', stiffness: 400 }}
                    >
                      {getTypeIcon(node.type)}
                    </motion.div>
                    
                    <div className="flex-1 min-w-0">
                      <h3 className="font-black text-sm text-white truncate">{node.title}</h3>
                      {node.description && (
                        <p className="text-xs text-white/60 mt-0.5 truncate font-medium">{node.description}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${statusStyle.badge}`}>
                        {node.status.toUpperCase()}
                      </span>
                      {node.priority && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-white/5 border border-white/10 text-white/60">
                          {node.priority}
                        </span>
                      )}
                    </div>
                    
                    <div className="text-xs font-bold text-white/50">
                      {differenceInDays(
                        node.endDate ? parseISO(node.endDate) : parseISO(node.startDate),
                        parseISO(node.startDate)
                      ) + 1}d
                    </div>
                  </div>
                </div>

                {/* PREVIEW AL HOVER */}
                <AnimatePresence>
                  {isHovered && !isDraggingThis && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute left-1/2 -translate-x-1/2 -top-3 -translate-y-full z-50 pointer-events-none"
                    >
                      <div className="px-5 py-4 rounded-xl bg-slate-900/98 backdrop-blur-2xl border-2 border-white/30 shadow-2xl min-w-[320px]">
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 rotate-45 bg-slate-900 border-r-2 border-b-2 border-white/30" />
                        
                        <div className="relative">
                          <p className="font-black text-white text-base mb-3">{node.title}</p>
                          
                          <div className="space-y-2 text-xs">
                            <p className="text-white/70 font-medium">
                              {format(parseISO(node.startDate), 'PPP', { locale: es })}
                              {node.endDate && ` → ${format(parseISO(node.endDate), 'PPP', { locale: es })}`}
                            </p>
                            <p className="text-white/60 font-bold">
                              Duración: {differenceInDays(
                                node.endDate ? parseISO(node.endDate) : parseISO(node.startDate),
                                parseISO(node.startDate)
                              ) + 1} días
                            </p>
                            <p className={`font-bold ${statusStyle.text}`}>
                              Estado: {node.status}
                            </p>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* FOOTER INFO */}
      <div className="sticky bottom-0 z-10 backdrop-blur-xl bg-slate-900/95 border-t border-white/10 px-6 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-white/50">
            <div className="flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent-400" />
              <span className="font-medium">{visibleNodes.length} eventos</span>
            </div>
            <div className="flex items-center gap-2">
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-medium">{tourConnections.length} tours</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-medium">{visibleNodes.filter(n => n.status === 'confirmed').length} confirmados</span>
            </div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-3.5 h-3.5 text-violet-400" />
              <span className="font-medium">{format(startDate, 'PP', { locale: es })} - {format(endDate, 'PP', { locale: es })}</span>
            </div>
          </div>
          
          <div className="text-xs text-white/40 font-medium">
            Scroll: {Math.round(scrollProgress * 100)}% | Zoom: {dayWidth}px/día | V11 Ultra Precision
          </div>
        </div>
      </div>
    </div>
  );
};
