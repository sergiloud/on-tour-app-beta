import React, { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import AdvancedEventCard from './AdvancedEventCard';
import MultiDayEventDurationEditor from './MultiDayEventDurationEditor';
import PatternAnalyzer from './PatternAnalyzer';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  endDate?: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  color?: 'accent' | 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  type?: 'show' | 'travel' | 'rest' | 'meeting';
  city?: string;
  revenue?: number;
}

export interface CalendarConflict {
  id: string;
  type: 'overlap' | 'back-to-back' | 'travel-time' | 'overbooked';
  eventIds: string[];
  severity: 'critical' | 'warning' | 'info';
  message: string;
  suggestion: string;
}

export interface EventMetric {
  date: string;
  count: number;
  revenue: number;
  type: 'show' | 'travel' | 'rest';
}

interface CalendarIntegrationProps {
  events: CalendarEvent[];
  onEventMove: (eventId: string, newDate: string) => void;
  onEventExtend: (eventId: string, newEndDate: string) => void;
  onEventDuplicate: (eventId: string, newDate: string) => void;
  onEventDelete: (eventId: string) => void;
  onEventEdit: (eventId: string) => void;
  onSync?: (config: any) => void;
  year: number;
  month: number;
  weekStartsOn: 0 | 1;
  heatmapMode: 'none' | 'financial' | 'activity' | 'status';
}

const CalendarIntegration: React.FC<CalendarIntegrationProps> = ({
  events,
  onEventMove,
  onEventExtend,
  onEventDuplicate,
  onEventDelete,
  onEventEdit,
  onSync,
  year,
  month,
  weekStartsOn,
  heatmapMode,
}) => {
  const [editorOpen, setEditorOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showPatterns, setShowPatterns] = useState(false);
  const [showSync, setShowSync] = useState(false);

  // Detectar conflictos
  const conflicts = useMemo<CalendarConflict[]>(() => {
    const detected: CalendarConflict[] = [];
    const sorted = [...events].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    for (let i = 0; i < sorted.length - 1; i++) {
      const e1 = sorted[i];
      const e2 = sorted[i + 1];
      if (!e1 || !e2) continue;

      const d1Start = new Date(e1.date);
      const d1End = e1.endDate ? new Date(e1.endDate) : d1Start;
      const d2Start = new Date(e2.date);
      const d2End = e2.endDate ? new Date(e2.endDate) : d2Start;

      // Overlap
      if (d1End >= d2Start && d1Start <= d2End && e1.id !== e2.id) {
        detected.push({
          id: `${e1.id}-${e2.id}-overlap`,
          type: 'overlap',
          eventIds: [e1.id, e2.id],
          severity: 'critical',
          message: `"${e1.title}" overlaps with "${e2.title}"`,
          suggestion: 'Move one event or split into separate dates',
        });
      }

      // Back-to-back (without travel days)
      const daysDiff = Math.ceil((d2Start.getTime() - d1End.getTime()) / (1000 * 60 * 60 * 24));
      if (daysDiff === 1 && e1.type === 'show' && e2.type === 'show') {
        detected.push({
          id: `${e1.id}-${e2.id}-btb`,
          type: 'back-to-back',
          eventIds: [e1.id, e2.id],
          severity: 'warning',
          message: `Back-to-back shows: "${e1.title}" → "${e2.title}"`,
          suggestion: 'Consider adding travel/rest days between shows',
        });
      }

      // Travel time insufficient
      if (e1.city && e2.city && e1.city !== e2.city && daysDiff < 2 && e1.type === 'show' && e2.type === 'show') {
        detected.push({
          id: `${e1.id}-${e2.id}-travel`,
          type: 'travel-time',
          eventIds: [e1.id, e2.id],
          severity: 'warning',
          message: `Insufficient travel time: ${e1.city} → ${e2.city}`,
          suggestion: `Add ${3 - daysDiff} more day(s) between events`,
        });
      }
    }

    return detected;
  }, [events]);

  // Calcular métricas para PatternAnalyzer
  const eventMetrics = useMemo<EventMetric[]>(() => {
    const metricsMap = new Map<string, EventMetric>();

    events.forEach(event => {
      const startDate = new Date(event.date);
      const endDate = event.endDate ? new Date(event.endDate) : startDate;

      let current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0] || '';
        if (!dateStr) {
          current.setDate(current.getDate() + 1);
          continue;
        }

        const existing = metricsMap.get(dateStr) || {
          date: dateStr,
          count: 0,
          revenue: 0,
          type: 'show' as const,
        };

        existing.count++;
        if (event.revenue) existing.revenue += event.revenue;
        if (event.type && ['show', 'travel', 'rest'].includes(event.type)) {
          existing.type = event.type as 'show' | 'travel' | 'rest';
        }

        metricsMap.set(dateStr, existing);
        current.setDate(current.getDate() + 1);
      }
    });

    return Array.from(metricsMap.values());
  }, [events]);

  // Agrupar eventos por día para heatmap
  const eventsByDay = useMemo<Map<string, CalendarEvent[]>>(() => {
    const dayMap = new Map<string, CalendarEvent[]>();

    events.forEach(event => {
      const startDate = new Date(event.date);
      const endDate = event.endDate ? new Date(event.endDate) : startDate;

      let current = new Date(startDate);
      while (current <= endDate) {
        const dateStr = current.toISOString().split('T')[0] || '';
        if (!dateStr) {
          current.setDate(current.getDate() + 1);
          continue;
        }

        if (!dayMap.has(dateStr)) dayMap.set(dateStr, []);
        dayMap.get(dateStr)?.push(event);
        current.setDate(current.getDate() + 1);
      }
    });

    return dayMap;
  }, [events]);

  // Handler para abrir editor
  const handleEditDuration = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    setEditorOpen(true);
  }, []);

  // Handler para aplicar cambios de duración
  const handleApplyDurationChanges = useCallback((startDate: string, endDate: string) => {
    if (selectedEvent) {
      onEventExtend(selectedEvent.id, endDate);
      setEditorOpen(false);
      setSelectedEvent(null);
    }
  }, [selectedEvent, onEventExtend]);

  // Handler para mover evento
  const handleMoveEvent = useCallback((eventId: string, newDate: string) => {
    onEventMove(eventId, newDate);
  }, [onEventMove]);

  // Handler para duplicar evento
  const handleDuplicateEvent = useCallback((eventId: string, newDate: string) => {
    onEventDuplicate(eventId, newDate);
  }, [onEventDuplicate]);

  // Handler para eliminar evento
  const handleDeleteEvent = useCallback((eventId: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este evento?')) {
      onEventDelete(eventId);
    }
  }, [onEventDelete]);

  // Handler para sincronizar
  const handleSync = useCallback((config: any) => {
    onSync?.(config);
  }, [onSync]);

  return (
    <div className="space-y-6">
      {/* Control Panel */}
      <div className="flex items-center gap-2 flex-wrap">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowConflicts(!showConflicts)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            showConflicts
              ? 'bg-red-500/20 text-red-700 border border-red-500/30'
              : 'bg-white/5 text-gray-700 border border-slate-200 dark:border-white/10 hover:bg-white/10'
          }`}
        >
          {conflicts.length > 0 && (
            <span className="inline-block w-2 h-2 bg-red-500 rounded-full mr-2" />
          )}
          Conflictos ({conflicts.length})
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowPatterns(!showPatterns)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            showPatterns
              ? 'bg-blue-500/20 text-blue-700 border border-blue-500/30'
              : 'bg-white/5 text-gray-700 border border-slate-200 dark:border-white/10 hover:bg-white/10'
          }`}
        >
          📊 Patrones
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setShowSync(!showSync)}
          className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            showSync
              ? 'bg-green-500/20 text-green-700 border border-green-500/30'
              : 'bg-white/5 text-gray-700 border border-slate-200 dark:border-white/10 hover:bg-white/10'
          }`}
        >
          🔄 Sincronización
        </motion.button>
      </div>

      {/* Conflicts Panel */}
      <AnimatePresence>
        {showConflicts && conflicts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="bg-gradient-to-br from-white/20 via-white/10 to-slate-50 dark:to-white/5 backdrop-blur-md border border-slate-300 dark:border-white/20 rounded-xl p-4 space-y-3"
          >
            {conflicts.map((conflict, idx) => (
              <motion.div
                key={conflict.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-3 rounded-lg border ${
                  conflict.severity === 'critical'
                    ? 'bg-red-500/10 border-red-500/30'
                    : 'bg-yellow-500/10 border-yellow-500/30'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-sm">{conflict.message}</p>
                    <p className="text-xs opacity-75 mt-1">{conflict.suggestion}</p>
                  </div>
                  <button
                    onClick={() => {
                      const event = events.find(e => e.id === conflict.eventIds[0]);
                      if (event) handleEditDuration(event);
                    }}
                    className="px-2 py-1 bg-slate-200 dark:bg-white/10 hover:bg-white/20 rounded text-xs font-medium transition-all"
                  >
                    Resolver
                  </button>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Pattern Analyzer */}
      <AnimatePresence>
        {showPatterns && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <PatternAnalyzer
              eventsData={eventMetrics}
              onPredictionClick={(pred) => {
                console.log('Predicción:', pred);
              }}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {events.map((event) => (
          <AdvancedEventCard
            key={event.id}
            eventId={event.id}
            eventTitle={event.title}
            eventDate={event.date}
            eventEndDate={event.endDate}
            eventStatus={event.status}
            eventColor={event.color || 'accent'}
            onMove={(id, date) => handleMoveEvent(id, date)}
            onExtend={(id, endDate) => {
              setSelectedEvent(event);
              handleEditDuration(event);
            }}
            onDuplicate={(id, date) => handleDuplicateEvent(id, date)}
            onDelete={(id) => handleDeleteEvent(id)}
            onEdit={(id) => onEventEdit(id)}
          />
        ))}
      </div>

      {/* Duration Editor Modal */}
      <AnimatePresence>
        {editorOpen && selectedEvent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
            onClick={() => setEditorOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <MultiDayEventDurationEditor
                eventId={selectedEvent.id}
                eventTitle={selectedEvent.title}
                startDate={selectedEvent.date}
                endDate={selectedEvent.endDate || selectedEvent.date}
                onUpdateDates={handleApplyDurationChanges}
                onClose={() => {
                  setEditorOpen(false);
                  setSelectedEvent(null);
                }}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalendarIntegration;
