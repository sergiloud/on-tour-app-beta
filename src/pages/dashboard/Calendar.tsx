import React, { useEffect, useMemo, useRef, useState, useCallback, lazy, Suspense } from 'react';
import { useEventSelection } from '../../hooks/useEventSelection';
import type { Show } from '../../lib/shows';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { Itinerary } from '../../services/travelApi';
import StatusBadge from '../../ui/StatusBadge';
import { countryLabel } from '../../lib/countries';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../../lib/telemetry';
import { useCalendarState } from '../../hooks/useCalendarState';
import { useCalendarMatrix } from '../../hooks/useCalendarMatrix';
import { useCalendarData } from '../../hooks/useCalendarData';
import { useCalendarModals } from '../../hooks/useCalendarModals';
import { useCalendarActions } from '../../hooks/useCalendarActions';
import { useCalendarAutoSync } from '../../hooks/useCalendarAutoSync';
import CalendarToolbar from '../../components/calendar/CalendarToolbar';
import BulkOperationsToolbar from '../../components/calendar/BulkOperationsToolbar';
import type { EventButton } from '../../components/calendar/DraggableEventButtons';
import { announce } from '../../lib/announcer';
import MonthGrid from '../../components/calendar/MonthGrid';
import WeekGrid from '../../components/calendar/WeekGrid';
import DayGrid from '../../components/calendar/DayGrid';
import AgendaList from '../../components/calendar/AgendaList';
import { TimelineView } from '../../components/calendar/TimelineView';
import { CalEvent } from '../../components/calendar/types';
import { parseICS } from '../../lib/calendar/ics';
import type { EventType, EventData } from '../../components/calendar/EventCreationModal';
import DayDetailsModal from '../../components/calendar/DayDetailsModal';
import TravelFlightModal from '../../components/calendar/TravelFlightModal';
import ShowEventModal from '../../components/calendar/ShowEventModal';
import { getCurrentOrgId } from '../../lib/tenants';
import { usePerfMonitor } from '../../lib/perfMonitor';
import { Loader2 } from 'lucide-react';

// Lazy load modales pesados - solo cuando el usuario los abre
const EventCreationModal = lazy(() => import('../../components/calendar/EventCreationModal'));
const CalendarEventModal = lazy(() => import('../../components/calendar/CalendarEventModal'));
const EventEditorModal = lazy(() => import('../../components/calendar/EventEditorModal'));
import { generateId } from '../../lib/id';
import { logger } from '../../lib/logger';

// Calendar event type is shared in components/calendar/types

// TZ-aware YYYY-MM-DD from ISO. Falls back to simple slice if parts missing.
const toDateOnlyTz = (iso: string, tz: string) => {
  try {
    const d = new Date(iso);
    // Use Intl parts to avoid UTC shift issues
    const parts = new Intl.DateTimeFormat('en-CA', { timeZone: tz, year: 'numeric', month: '2-digit', day: '2-digit' })
      .formatToParts(d)
      .reduce<Record<string, string>>((acc, p) => { if (p.type !== 'literal') acc[p.type] = p.value; return acc; }, {});
    const y = parts.year, m = parts.month, day = parts.day;
    if (y && m && day) return `${y}-${m}-${day}`;
  } catch { }
  // If iso already like YYYY-MM-DD or T00:00:00, slice first 10
  return iso.slice(0, 10);
};

// Map button colors to calendar event colors
const COLOR_MAP: Record<EventButton['color'], CalEvent['color']> = {
  'emerald': 'green',
  'sky': 'blue',
  'amber': 'yellow',
  'rose': 'red',
  'purple': 'purple',
  'cyan': 'blue'
};

const Calendar: React.FC = () => {
  // Performance monitoring
  usePerfMonitor('Calendar:render');
  
  // Settings & navigation
  const { lang } = useSettings();
  const navigate = useNavigate();
  
  // Auto-sync for calendar changes
  const { triggerSync } = useCalendarAutoSync();
  
  // Calendar state (view, cursor, filters, tz)
  const { view, setView, cursor, setCursor, tz, setTz, filters, setFilters, today } = useCalendarState();
  const year = Number(cursor.slice(0, 4));
  const month = Number(cursor.slice(5, 7));
  
  // Debounced cursor for data fetching
  const [debouncedCursor, setDebouncedCursor] = useState(cursor);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedCursor(cursor), 180);
    return () => clearTimeout(id);
  }, [cursor]);
  
  // UI state
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(() => { 
    try { return Number(localStorage.getItem('calendar:weekStart') || '1') as 0 | 1; } 
    catch { return 1; } 
  });
  
  // Calendar grid matrix
  const grid = useCalendarMatrix(year, month, weekStartsOn);
  
  // Data management (shows + travel)
  const {
    shows,
    travel,
    eventsByDay,
    travelError,
    showOperations,
    travelOperations,
  } = useCalendarData({
    debouncedCursor,
    filters: { kinds: filters.kinds, status: filters.status },
    lang,
    tz,
    toDateOnlyTz,
  });
  
  // Modal management
  const modals = useCalendarModals();
  
  // Estado para el modal de eventos de calendario
  const [calendarEventModal, setCalendarEventModal] = useState({
    isOpen: false,
    selectedEvent: null as any,
    initialDate: undefined as string | undefined,
    initialType: 'other' as any,
    initialData: undefined as any,
  });
  
  // Business logic actions
  const actions = useCalendarActions({
    shows,
    travel,
    showOperations,
    travelOperations,
  });
  
  // UI state
  const [selectedDay, setSelectedDay] = useState<string>('');
  const [heatmapMode, setHeatmapMode] = useState<'none' | 'financial' | 'activity'>(() => { 
    try { return (localStorage.getItem('calendar:heatmap') || 'none') as 'none' | 'financial' | 'activity'; } 
    catch { return 'none'; } 
  });
  
  // Persist UI preferences
  useEffect(() => { 
    try { localStorage.setItem('calendar:weekStart', String(weekStartsOn)); } 
    catch { } 
  }, [weekStartsOn]);
  
  useEffect(() => { 
    try { localStorage.setItem('calendar:heatmap', heatmapMode); } 
    catch { } 
  }, [heatmapMode]);
  
  // Multi-selection hook
  const {
    selectedEventIds,
    clearSelection,
    toggleSelection,
    isSelected,
    getSelectedCount,
    getSelectedIds,
  } = useEventSelection();

  const changeMonth = useCallback((delta: number) => {
    const d = new Date(year, month - 1 + delta, 1);
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCursor(next);
    trackEvent('calendar.month.change', { month: next });
  }, [year, month, setCursor]);

  const goToday = useCallback(() => {
    const d = new Date();
    const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
    setCursor(next);
    setSelectedDay(toDateOnlyTz(d.toISOString(), tz));
    trackEvent('calendar.today');
  }, [setCursor, setSelectedDay, tz]);

  const goTravel = useCallback((day: string) => {
    const { origin, dest } = inferRouteForDate(day);
    const q = new URLSearchParams();
    q.set('date', day);
    if (origin) q.set('origin', origin.toUpperCase());
    if (dest) q.set('dest', dest.toUpperCase());
    q.set('adults', '1'); q.set('bags', '1'); q.set('nonstop', '1'); q.set('cabin', 'E');
    navigate(`/dashboard/travel?${q.toString()}`);
    try { trackEvent('calendar.open.travel', { day, origin: origin || null, dest: dest || null }); } catch { }
  }, [shows, navigate]);

  // Infer origin/dest for planning travel around a given date: origin = previous show city (or base), dest = show on/after date
  const inferRouteForDate = (day: string): { origin?: string; dest?: string } => {
    try {
      const dayTs = new Date(`${day}T00:00:00`).getTime();
      const ordered = shows.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      let prev: typeof ordered[number] | undefined;
      let next: typeof ordered[number] | undefined;
      for (const s of ordered) {
        const ts = new Date(s.date).getTime();
        if (ts <= dayTs) prev = s; // keep walking, last <= day
        if (!next && ts >= dayTs) next = s; // first >= day
      }
      const origin = prev?.city || 'MAD';
      const dest = next?.city;
      return { origin, dest };
    } catch { return {}; }
  };

  // Handle opening event editor modal
  const handleOpenEventEditor = (ev: CalEvent) => {
    if (ev.kind === 'show') {
      // Find the show event
      const id = ev.id.split(':')[1];
      const show = shows.find(s => s.id === id);
      if (show) {
        modals.openEventEditor({ ...show, kind: 'show' });
      }
    } else {
      // Find the itinerary/travel event
      const travelId = ev.id.split(':')[1] || ev.id;
      const itinerary = travel.find(t => t.id === travelId);
      if (itinerary) {
        modals.openEventEditor({ ...itinerary, kind: 'travel' });
      }
    }
  };

  // Handle saving edited event
  const handleSaveEditedEvent = async (event: Show | Itinerary) => {
    await actions.saveEditedEvent(event);
  };

  // Centralized event opening logic (P6.3)
  const handleEventOpen = useCallback((ev: CalEvent) => {
    if (ev.kind === 'show') {
      // For show events, open ShowEventModal with show data
      const id = ev.id.split(':')[1];
      const show = shows.find(s => s.id === id);
      if (show) {
        const showData = {
          id: show.id,
          date: show.date.slice(0, 10),
          title: show.city,
          city: show.city,
          country: show.country,
          status: show.status,
          notes: show.notes,
        };
        modals.openShowEvent(showData);
      }
    } else if (ev.kind === 'travel') {
      // For travel events, open TravelFlightModal with travel data
      const id = ev.id.split(':')[1];
      const travelEvent = travel.find(t => t.id === id);
      if (travelEvent) {
        const travelData = {
          type: 'travel',
          date: travelEvent.date.slice(0, 10),
          dateEnd: (travelEvent as any).endDate || (travelEvent as any).dateEnd,
          origin: (travelEvent as any).departure || (travelEvent as any).origin,
          destination: travelEvent.city || travelEvent.destination,
          travelMode: (travelEvent as any).travelMode || 'flight',
          confirmationCode: (travelEvent as any).confirmationCode,
          departureTime: (travelEvent as any).startTime || (travelEvent as any).departureTime,
          arrivalTime: (travelEvent as any).arrivalTime,
          flightNumber: (travelEvent as any).flightNumber,
          airline: (travelEvent as any).airline,
          departureTerminal: (travelEvent as any).departureTerminal,
          arrivalTerminal: (travelEvent as any).arrivalTerminal,
          seat: (travelEvent as any).seat,
          notes: (travelEvent as any).description || (travelEvent as any).notes,
        } as EventData;
        modals.openTravelFlight(travelData, id);
      }
    } else {
      // For other events (meeting, rehearsal, break, other, etc), open CalendarEventModal
      const id = ev.id.split(':')[1];
      
      // Try to find in calendar events first
      const otherEvent = travel.find(t => t.id === id);
      
      if (otherEvent) {
        // Open CalendarEventModal for editing
        setCalendarEventModal({
          isOpen: true,
          selectedEvent: {
            id: otherEvent.id,
            type: ev.kind as any,
            title: otherEvent.title,
            date: otherEvent.date.slice(0, 10),
            dateEnd: (otherEvent as any).endDate,
            description: (otherEvent as any).description,
            location: (otherEvent as any).location,
            color: (otherEvent as any).buttonColor as any,
            time: (otherEvent as any).startTime,
            timeEnd: (otherEvent as any).endTime,
            attendees: (otherEvent as any).attendees,
            notes: (otherEvent as any).notes,
          },
          initialDate: otherEvent.date.slice(0, 10),
          initialType: ev.kind as any,
          initialData: undefined,
        });
      }
    }
  }, [shows, travel, modals]);

  const handleSpanAdjust = (eventId: string, direction: 'start' | 'end', deltaDays: number) => {
    actions.adjustEventSpan(eventId, direction, deltaDays);
  };

  // Bulk operations handlers
  const handleBulkDelete = useCallback(() => {
    const selectedIds = getSelectedIds();
    actions.bulkDeleteEvents(selectedIds);
    clearSelection();
  }, [getSelectedIds, actions, clearSelection]);

  const handleBulkMove = useCallback((direction: 'forward' | 'backward', days: number) => {
    const selectedIds = getSelectedIds();
    actions.bulkMoveEvents(selectedIds, direction, days);
    clearSelection();
  }, [getSelectedIds, shows, showOperations, clearSelection]);

  // prev/next per view
  const onPrev = () => {
    if (view === 'month') return changeMonth(-1);
    if (view === 'week') {
      const cur = selectedDay || `${cursor}-01`;
      const d = new Date(cur); d.setDate(d.getDate() - 7);
      setSelectedDay(d.toISOString().slice(0, 10));
      if (d.getMonth() + 1 !== month) setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      trackEvent('cal.navigate', { view: 'week', dir: 'prev' });
      return;
    }
    if (view === 'day') {
      const cur = selectedDay || `${cursor}-01`;
      const d = new Date(cur); d.setDate(d.getDate() - 1);
      setSelectedDay(d.toISOString().slice(0, 10));
      if (d.getMonth() + 1 !== month) setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      trackEvent('cal.navigate', { view: 'day', dir: 'prev' });
      return;
    }
  };
  const onNext = () => {
    if (view === 'month') return changeMonth(1);
    if (view === 'week') {
      const cur = selectedDay || `${cursor}-01`;
      const d = new Date(cur); d.setDate(d.getDate() + 7);
      setSelectedDay(d.toISOString().slice(0, 10));
      if (d.getMonth() + 1 !== month) setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      trackEvent('cal.navigate', { view: 'week', dir: 'next' });
      return;
    }
    if (view === 'day') {
      const cur = selectedDay || `${cursor}-01`;
      const d = new Date(cur); d.setDate(d.getDate() + 1);
      setSelectedDay(d.toISOString().slice(0, 10));
      if (d.getMonth() + 1 !== month) setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      trackEvent('cal.navigate', { view: 'day', dir: 'next' });
      return;
    }
  };

  // Go to date dialog - Enhanced with glassmorphism
  const GoToDateDialog: React.FC<{ open: boolean; onClose: () => void; onGo: (isoDate: string) => void }> = ({ open, onClose, onGo }) => {
    const [val, setVal] = useState<string>(new Date().toISOString().slice(0, 10));
    const ref = useRef<HTMLInputElement | null>(null);
    const dialogRef = useRef<HTMLDivElement | null>(null);
    useEffect(() => { if (open) setTimeout(() => ref.current?.focus(), 0); }, [open]);
    useEffect(() => {
      if (!open) return;
      const key = (e: KeyboardEvent) => {
        if (e.key === 'Escape') { e.preventDefault(); onClose(); }
        if (e.key === 'Tab' && dialogRef.current) {
          const nodes = dialogRef.current.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
          if (!nodes.length) return;
          const first = nodes[0]; const last = nodes[nodes.length - 1];
          if (!first || !last) return;
          if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
          if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        }
      };
      window.addEventListener('keydown', key);
      return () => window.removeEventListener('keydown', key);
    }, [open]);
    if (!open) return null;
    return (
      <div role="dialog" aria-labelledby="goto-title" aria-modal="true" className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
        <div ref={dialogRef} className="relative glass rounded-xl p-6 w-[380px] border border-slate-300 dark:border-white/20 shadow-2xl">
          <div className="flex items-center justify-between mb-4">
            <div id="goto-title" className="text-lg font-semibold text-theme-primary">{t('calendar.goto') || 'Go to date'}</div>
            <button className="p-1.5 rounded-lg hover:bg-slate-200 dark:bg-slate-200 dark:bg-white/10 transition-colors" onClick={onClose} aria-label="Close">
              <svg className="w-5 h-5 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 dark:text-white/60 font-medium mb-2 block">Select date</label>
              <input
                ref={ref}
                type="date"
                className="w-full rounded-lg bg-interactive border border-theme hover:border-slate-300 dark:border-white/20 px-3 py-2.5 text-sm text-white focus:border-accent-500/50 focus:outline-none transition-colors"
                value={val}
                onChange={e => setVal(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { onGo(val); onClose(); } if (e.key === 'Escape') { onClose(); } }}
              />
            </div>
            <div className="flex items-center justify-between gap-2 pt-2">
              <div className="text-xs text-slate-300 dark:text-white/50">{t('calendar.goto.hint') || 'Press Enter to go'}</div>
              <div className="flex gap-2">
                <button
                  className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 text-slate-700 dark:text-white text-sm font-medium transition-colors"
                  onClick={onClose}
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
                <button
                  className="px-3 py-2 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-black text-sm font-semibold shadow-lg hover:shadow-accent-500/30 transition-all hover:scale-105"
                  onClick={() => { onGo(val); onClose(); }}
                >
                  {t('common.go') || 'Go'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Memoize monthLabel to avoid recreation on every render
  const monthLabel = useMemo(() => 
    new Date(`${cursor}-01`).toLocaleDateString(lang, { year: 'numeric', month: 'long', timeZone: tz }),
    [cursor, lang, tz]
  );

  const weekLabel = useMemo(() => {
    const base = selectedDay || `${cursor}-01`;
    const d0 = new Date(base);
    const day = d0.getDay(); // 0 Sun
    const startDelta = weekStartsOn === 1 ? (day + 6) % 7 : day; // days since start of week
    const start = new Date(d0); start.setDate(start.getDate() - startDelta);
    const end = new Date(start); end.setDate(end.getDate() + 6);
    const fmt = (d: Date) => d.toLocaleDateString(lang, { month: 'short', day: 'numeric', timeZone: tz });
    return `${fmt(start)} – ${fmt(end)}`;
  }, [selectedDay, cursor, lang, tz, weekStartsOn]);
  
  // Memoize dayLabel to avoid recreation on every render
  const dayLabel = useMemo(() => 
    selectedDay 
      ? new Date(selectedDay).toLocaleDateString(lang, { weekday: 'long', month: 'long', day: 'numeric', timeZone: tz }) 
      : monthLabel,
    [selectedDay, lang, tz, monthLabel]
  );

  // Memoize selectedEvents to avoid filtering on every render
  const selectedEvents = useMemo(() => 
    selectedDay ? (eventsByDay.get(selectedDay) || []) : [],
    [selectedDay, eventsByDay]
  );

  // Memoized values for Week/Day views (hooks must not be inside conditionals)
  const weekStart = useMemo(() => {
    const base = selectedDay || `${cursor}-01`;
    const d0 = new Date(base);
    const day = d0.getDay();
    const startDelta = weekStartsOn === 1 ? (day + 6) % 7 : day;
    const start = new Date(d0);
    start.setDate(start.getDate() - startDelta);
    return start.toISOString().slice(0, 10);
  }, [selectedDay, cursor, weekStartsOn]);

  const weekEventsByDay = useMemo(() => {
    const out = new Map<string, CalEvent[]>();
    eventsByDay.forEach((arr, day) => {
      out.set(day, arr.map((e) => ({ ...e })));
    });
    return out;
  }, [eventsByDay]);

  const dayEvents = useMemo(() => {
    const d = selectedDay || `${cursor}-01`;
    const list = (eventsByDay.get(d) || []) as CalEvent[];
    return list.map((e) => ({ ...e }));
  }, [selectedDay, cursor, eventsByDay]);

  // Filtered events for agenda view - moved from JSX to follow Rules of Hooks
  const agendaEventsByDay = useMemo(() => {
    const filtered = new Map<string, any>();
    const startOfMonth = `${cursor}-01`;
    const endOfMonth = `${cursor}-${new Date(year, month, 0).getDate().toString().padStart(2, '0')}`;

    for (const [date, events] of eventsByDay.entries()) {
      if (date >= startOfMonth && date <= endOfMonth) {
        filtered.set(date, events);
      }
    }
    return filtered;
  }, [eventsByDay, cursor, year, month]);

  // Listen for calendar event creation from drag & drop
  useEffect(() => {
    const handleEventCreation = (e: CustomEvent) => {
      const { date, type, initialData } = e.detail;
      
      logger.info('[Calendar] Received calendar event creation', { date, type, initialData });
      
      // Abrir modal de eventos de calendario para tipos no-show/travel
      if (!['show', 'travel'].includes(type)) {
        setCalendarEventModal({
          isOpen: true,
          selectedEvent: null,
          initialDate: date,
          initialType: type === 'other' ? 'other' : type,
          initialData: initialData,
        });
      } else {
        // Para show/travel, usar el modal existente
        modals.openEventCreation(date, type, initialData);
      }
    };
    
    window.addEventListener('calendar:openEventCreation' as any, handleEventCreation);
    
    return () => {
      window.removeEventListener('calendar:openEventCreation' as any, handleEventCreation);
    };
  }, [modals]);

  // Global keyboard shortcuts (T/←/→/PgUp/PgDn)
  useEffect(() => {
    const onPrev = () => changeMonth(-1);
    const onNext = () => changeMonth(1);
    const onToday = () => goToday();
    const onGotoKey = (e: KeyboardEvent) => {
      const meta = (e.ctrlKey || e.metaKey);
      if (meta && (e.key === 'g' || e.key === 'G')) { e.preventDefault(); modals.openGotoDate(); }
      // Alt+Left/Right navigate within Week/Day views
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        if (view === 'week' || view === 'day') {
          e.preventDefault();
          if (e.key === 'ArrowLeft') { (view === 'week' || view === 'day') && (onPrevWeekDay()); }
          else { (view === 'week' || view === 'day') && (onNextWeekDay()); }
        }
      }
    };
    const onPrevWeekDay = () => { if (view === 'week') { const cur = selectedDay || `${cursor}-01`; const d = new Date(cur); d.setDate(d.getDate() - 7); setSelectedDay(d.toISOString().slice(0, 10)); if (d.getMonth() + 1 !== month) setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); trackEvent('cal.navigate', { view: 'week', dir: 'prev' }); } else if (view === 'day') { const cur = selectedDay || `${cursor}-01`; const d = new Date(cur); d.setDate(d.getDate() - 1); setSelectedDay(d.toISOString().slice(0, 10)); if (d.getMonth() + 1 !== month) setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); trackEvent('cal.navigate', { view: 'day', dir: 'prev' }); } };
    const onNextWeekDay = () => { if (view === 'week') { const cur = selectedDay || `${cursor}-01`; const d = new Date(cur); d.setDate(d.getDate() + 7); setSelectedDay(d.toISOString().slice(0, 10)); if (d.getMonth() + 1 !== month) setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); trackEvent('cal.navigate', { view: 'week', dir: 'next' }); } else if (view === 'day') { const cur = selectedDay || `${cursor}-01`; const d = new Date(cur); d.setDate(d.getDate() + 1); setSelectedDay(d.toISOString().slice(0, 10)); if (d.getMonth() + 1 !== month) setCursor(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`); trackEvent('cal.navigate', { view: 'day', dir: 'next' }); } };
    const prevL = () => onPrev(); const nextL = () => onNext(); const todayL = () => onToday();
    window.addEventListener('cal:prev' as any, prevL);
    window.addEventListener('cal:next' as any, nextL);
    window.addEventListener('cal:today' as any, todayL);
    window.addEventListener('keydown', onGotoKey);
    return () => {
      window.removeEventListener('cal:prev' as any, prevL);
      window.removeEventListener('cal:next' as any, nextL);
      window.removeEventListener('cal:today' as any, todayL);
      window.removeEventListener('keydown', onGotoKey);
    };
  }, [year, month, view, selectedDay, cursor]);

  // Handler para crear evento
  const handleCreateEvent = (eventType: EventType) => {
    // Event creation handled via drag-drop interface
  };

  // Handler para guardar evento
  const handleSaveEvent = async (data: EventData) => {
    await actions.saveEvent(data, modals.state.travelFlight.editingId);
    // Trigger auto-sync after creating/editing event
    triggerSync();
  };

  // Handler para abrir modal de detalles del día
  const handleOpenDayDetails = (date: string) => {
    // Day details currently not needed - events shown inline
  };

  return (
    <div className="max-w-[1400px] mx-auto px-3 md:px-4 space-y-4">
      {/* Accessible page heading for screen readers and tests */}
      <h2 className="sr-only">{t('calendar.title') || 'Calendar'}</h2>
      <div aria-live="polite" aria-atomic="true" className="sr-only" id="cal-live" />
      {/* Visually hidden keyboard shortcuts description for month grid */}
      <p id="cal-kb-hint" className="sr-only">
        {t('calendar.kb.hint') || 'Keyboard: Arrow keys move day, PageUp/PageDown change month, T go to today, Enter or Space select day.'}
      </p>
      <CalendarToolbar
        title={view === 'month' ? monthLabel : view === 'week' ? weekLabel : dayLabel}
        onPrev={onPrev}
        onNext={onNext}
        onToday={goToday}
        onGoToDate={() => modals.openGotoDate()}
        view={view}
        setView={(v) => { setView(v); try { trackEvent('cal.view.change', { view: v }); } catch { }; announce((t('calendar.view.announce') || '{v} view').replace('{v}', t(`calendar.view.${v}`) || v)); }}
        tz={tz}
        setTz={(next) => { setTz(next); try { announce((t('calendar.tz.changed') || 'Time zone set to {tz}').replace('{tz}', next)); } catch { } }}
        weekStartsOn={weekStartsOn}
        setWeekStartsOn={setWeekStartsOn}
        filters={filters}
        setFilters={setFilters}
        onImportIcs={async (file) => {
          try {
            const text = await file.text();
            const events = parseICS(text);
            let created = 0;
            for (const ev of events) {
              // Only map VEVENTs with DTSTART; derive city/country heuristically from LOCATION e.g., "Madrid, ES"
              if (!ev.dtStart) continue;
              const dateOnly = ev.dtStart.slice(0, 10);
              const id = generateId();
              let city = 'CITY', country = 'US';
              if (ev.location) {
                const parts = ev.location.split(',').map(s => s.trim());
                if (parts[0]) city = parts[0].toUpperCase();
                if (parts[1]) country = parts[1].toUpperCase().slice(0, 2);
              }
              showOperations.add({ id, city, country, lat: 0, lng: 0, date: `${dateOnly}T00:00:00`, fee: 0, status: 'pending', __version: 0, __modifiedAt: Date.now(), __modifiedBy: 'system' } as Show);
              created++;
            }
            announce((t('calendar.import.done') || 'Imported {n} events').replace('{n}', String(created)));
            try { trackEvent('calendar.import.ics', { count: created }); } catch { }
          } catch {
            announce(t('calendar.import.error') || 'Failed to import .ics');
          }
        }}
        heatmapMode={heatmapMode}
        setHeatmapMode={setHeatmapMode}
        onEventDropped={(button, dateStr) => {
          const eventColor = COLOR_MAP[button.color];
          const id = generateId();

          // Map EventButton.type to event creation logic
          if (button.type === 'show') {
            // Create a Show ONLY for 'show' type
            const orgId = getCurrentOrgId();
            const newShow: Show = {
              id,
              tenantId: orgId,
              city: button.label,
              country: 'US',
              lat: 0,
              lng: 0,
              date: `${dateStr}T00:00:00`,
              fee: 0,
              status: 'confirmed',
              notes: `__btnColor:${button.color}|__btnType:${button.type}|__dispColor:${eventColor}`,
              __version: 0,
              __modifiedAt: Date.now(),
              __modifiedBy: 'system'
            } as Show;
            showOperations.add(newShow);
            announce(`Show created: ${button.label} on ${dateStr}`);
          } else {
            // Create Itinerary for all other types (travel, personal, meeting, soundcheck, rehearsal, interview, other)
            const parts = button.label?.split(/[→\-]/);
            const departure = parts?.[0]?.trim().toUpperCase() || '';
            const destination = parts?.[1]?.trim().toUpperCase() || button.label?.toUpperCase() || '';

            const it: Itinerary = {
              id,
              date: dateStr,
              title: button.label || button.type,
              team: 'A',
              city: button.label,
              status: 'confirmed',
              buttonColor: button.color,
              btnType: button.type as any,
              departure: button.type === 'travel' ? departure : undefined,
              destination: button.type === 'travel' ? destination : undefined,
              startTime: undefined
            };
            travelOperations.save(it).then(() => {
              announce(`${button.type} event created: ${button.label} on ${dateStr}`);
            }).catch((err: any) => {
              // Handle error silently
            });
          }
          try { trackEvent('cal.drag.create', { id, day: dateStr, color: eventColor, type: button.type }); } catch { }
        }}
      />

      {view === 'month' && (
        <MonthGrid
          grid={grid}
          eventsByDay={eventsByDay}
          today={today}
          selectedDay={selectedDay}
          setSelectedDay={(d) => { setSelectedDay(d); trackEvent('calendar.day.select', { day: d }); }}
          locale={lang}
          tz={tz}
          ariaDescribedBy="cal-kb-hint"
          selectedEventIds={selectedEventIds}
          onMultiSelectEvent={(eventId, isSelected) => toggleSelection(eventId, true)}
          onOpenDay={(d) => {
            handleOpenDayDetails(d);
            setSelectedDay(d);
          }}
          onOpen={handleEventOpen}
          onMoveShow={(showId, toDate, duplicate) => {
            actions.moveEvent(showId, toDate, duplicate);
          }}
          onQuickAddSave={(dateStr, data) => {
            const newId = actions.quickAddShow(dateStr, data);
            navigate(`/dashboard/shows?edit=${newId}`);
          }}
          onDeleteShow={(eventId) => {
            actions.deleteEvent(eventId);
          }}
          onSpanAdjust={handleSpanAdjust}
          heatmapMode={heatmapMode}
          shows={shows}
        />
      )}

      {view === 'week' && (
        <WeekGrid
          weekStart={weekStart}
          eventsByDay={weekEventsByDay}
          tz={tz}
          onOpen={handleEventOpen}
        />
      )}

      {view === 'day' && (
        <DayGrid
          day={selectedDay || `${cursor}-01`}
          events={dayEvents}
          tz={tz}
          onOpen={handleEventOpen}
        />
      )}

      {view === 'agenda' && (
        <AgendaList
          eventsByDay={agendaEventsByDay}
          onOpen={handleEventOpen}
        />
      )}      {view === 'timeline' && (
        <TimelineView
          events={Array.from(eventsByDay.values()).flat().filter(ev => ev.kind === 'show' || ev.kind === 'travel') as any}
          from={`${cursor}-01`}
          to={`${cursor}-${new Date(Number(cursor.split('-')[0]), Number(cursor.split('-')[1]), 0).getDate().toString().padStart(2, '0')}`}
          onEventClick={(ev) => {
            if (ev.kind === 'show') { const id = ev.id.split(':')[1]; navigate(`/dashboard/shows?edit=${id}`); }
            else { const day = ev.date; goTravel(day); }
          }}
          density="normal"
        />
      )}

      {/* Day details */}
      {selectedDay && (
        <div className="glass rounded-lg p-4">
          <div className="text-sm opacity-80 mb-2">{new Date(selectedDay).toLocaleDateString(lang, { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}</div>
          {selectedEvents.length ? (
            <ul className="space-y-2">
              {selectedEvents.map(ev => (
                <li key={ev.id} className="flex items-center gap-2">
                  <span className={`inline-block w-2 h-2 rounded-full border ${ev.kind === 'show' ? 'bg-accent-400 border-accent-300/60' : 'bg-cyan-300 border-cyan-200/60'}`} aria-hidden />
                  <span className="text-sm">{ev.title}</span>
                  {ev.meta && <span className="text-xs opacity-70">{ev.meta}</span>}
                  {ev.status && <span className="ml-auto"><StatusBadge status={ev.status as any}>{ev.status}</StatusBadge></span>}
                  <div className="ml-2 flex items-center gap-1">
                    {ev.kind === 'show' ? (
                      <button className="text-xs underline opacity-80 hover:opacity-100" onClick={() => { const id = ev.id.split(':')[1]; navigate(`/dashboard/shows?edit=${id}`); trackEvent('calendar.open.show', { id }); }}>{t('common.open') || 'Open'}</button>
                    ) : (
                      <button className="text-xs underline opacity-80 hover:opacity-100" onClick={() => { const day = ev.date; goTravel(day); }}>{t('common.open') || 'Open'}</button>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="text-sm opacity-70">{t('calendar.noEvents') || 'No events for this day'}</div>
          )}
        </div>
      )}

      {/* Event Creation Modal */}
      {modals.state.eventCreation.isOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>}>
          <EventCreationModal
            open={modals.state.eventCreation.isOpen}
            initialDate={modals.state.eventCreation.date}
            initialType={modals.state.eventCreation.type ?? 'show'}
            initialData={modals.state.eventCreation.initialData}
            onClose={modals.closeEventCreation}
            onSave={handleSaveEvent}
          />
        </Suspense>
      )}

      {/* Day Details Modal */}
      <DayDetailsModal
        open={modals.state.dayDetails.isOpen}
        day={modals.state.dayDetails.date}
        events={modals.state.dayDetails.date ? eventsByDay.get(modals.state.dayDetails.date) || [] : []}
        onClose={modals.closeDayDetails}
        onCreateEvent={handleCreateEvent}
      />

      {/* Gentle error banner for travel refresh failures */}
      {travelError && (
        <div role="status" aria-live="polite" className="p-2 rounded-md bg-rose-500/10 border border-rose-500/30 text-xs">
          {t('travel.refresh.error') || "Couldn't refresh travel. Showing cached data."}
        </div>
      )}

      <GoToDateDialog
        open={modals.state.gotoDate.isOpen}
        onClose={modals.closeGotoDate}
        onGo={(iso) => {
          if (!iso) return;
          const d = new Date(iso);
          const next = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
          setCursor(next);
          setSelectedDay(iso);
          trackEvent('calendar.goto', { date: iso });
        }}
      />

      {/* Show Event Modal */}
      <ShowEventModal
        open={modals.state.showEvent.isOpen}
        onClose={modals.closeShowEvent}
        initialData={modals.state.showEvent.data}
        onSave={(data) => {
          if (data.id) {
            // Update existing show
            showOperations.update(data.id, {
              date: data.date,
              city: data.city,
              country: data.country,
              status: data.status,
              notes: data.notes,
            } as any);
          } else {
            // Create new show
            const id = generateId();
            const newShow: Show = {
              id,
              city: data.city,
              country: data.country,
              lat: 0,
              lng: 0,
              date: `${data.date}T00:00:00`,
              fee: 0,
              status: (data.status || 'pending') as any,
              __version: 0,
              __modifiedAt: Date.now(),
              __modifiedBy: 'system',
            } as Show;
            showOperations.add(newShow);
          }
        }}
      />

      {/* Travel Flight Modal */}
      <TravelFlightModal
        open={modals.state.travelFlight.isOpen}
        onClose={modals.closeTravelFlight}
        initialData={modals.state.travelFlight.data}
        onSave={async (data) => {
          try {
            // Build itinerary object with flight details
            const itinerary: Itinerary = {
              id: modals.state.travelFlight.editingId || generateId(),
              date: data.date,
              endDate: data.dateEnd,
              title: `${data.origin} → ${data.destination}`,
              team: 'A',
              city: data.destination,
              status: 'pending',
              btnType: 'travel',
              departure: data.origin,
              destination: data.destination,
              startTime: data.departureTime,
              description: data.notes,
              location: `${data.origin} → ${data.destination}`,
            };

            // Store additional flight details in localStorage or as needed
            // For now, extend with extra fields
            const extendedItinerary = {
              ...itinerary,
              travelMode: data.travelMode,
              confirmationCode: data.confirmationCode,
              flightNumber: data.flightNumber,
              airline: data.airline,
              seat: data.seat,
              departureTerminal: data.departureTerminal,
              arrivalTerminal: data.arrivalTerminal,
              arrivalTime: data.arrivalTime,
            } as any;

            await travelOperations.save(extendedItinerary);
            announce(`Travel event ${modals.state.travelFlight.editingId ? 'updated' : 'created'}`);
            modals.closeTravelFlight();
          } catch (err) {
            logger.error('Error saving travel event', err as Error);
            announce('Error saving travel event');
          }
        }}
      />

      {/* Event Editor Modal */}
      {modals.state.eventEditor.isOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>}>
          <EventEditorModal
            open={modals.state.eventEditor.isOpen}
            event={modals.state.eventEditor.event}
            onClose={modals.closeEventEditor}
            onSave={handleSaveEditedEvent}
          />
        </Suspense>
      )}

      {/* Calendar Event Modal */}
      {calendarEventModal.isOpen && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <Loader2 className="w-8 h-8 text-white animate-spin" />
        </div>}>
          <CalendarEventModal
            open={calendarEventModal.isOpen}
            onClose={() => setCalendarEventModal(prev => ({ ...prev, isOpen: false }))}
            onSave={async (eventData) => {
          try {
            if (calendarEventModal.selectedEvent?.id) {
              // Actualizar evento existente
              const eventId = calendarEventModal.selectedEvent.id;
              
              // Construir el objeto itinerary actualizado
              const updatedEvent = {
                id: eventId,
                date: eventData.date,
                endDate: eventData.dateEnd,
                title: eventData.title || 'Untitled',
                team: 'A' as const,
                city: eventData.location || '',
                status: 'pending' as const,
                btnType: eventData.type,
                description: eventData.description,
                location: eventData.location,
                buttonColor: eventData.color,
                startTime: eventData.time,
                endTime: eventData.timeEnd,
                attendees: eventData.attendees,
              } as any;
              
              await travelOperations.save(updatedEvent);
              announce('Calendar event updated successfully');
            } else {
              // Crear nuevo evento
              const newId = generateId();
              const newEvent = {
                id: newId,
                date: eventData.date,
                endDate: eventData.dateEnd,
                title: eventData.title || 'Untitled',
                team: 'A' as const,
                city: eventData.location || '',
                status: 'pending' as const,
                btnType: eventData.type,
                description: eventData.description,
                location: eventData.location,
                buttonColor: eventData.color,
                startTime: eventData.time,
                endTime: eventData.timeEnd,
                attendees: eventData.attendees,
              } as any;
              
              await travelOperations.save(newEvent);
              announce('Calendar event created successfully');
            }
            
            setCalendarEventModal(prev => ({ ...prev, isOpen: false }));
          } catch (error) {
            logger.error('Error saving calendar event', error as Error);
            announce('Error saving calendar event');
          }
        }}
        onDelete={async (eventId) => {
          try {
            await travelOperations.remove(eventId);
            setCalendarEventModal(prev => ({ ...prev, isOpen: false }));
            announce('Calendar event deleted successfully');
          } catch (error) {
            logger.error('Error deleting calendar event', error as Error);
            announce('Error deleting calendar event');
          }
        }}
        initialDate={calendarEventModal.initialDate}
        initialType={calendarEventModal.initialType}
        initialData={calendarEventModal.selectedEvent}
      />
        </Suspense>
      )}

      {/* Bulk operations toolbar */}
      <BulkOperationsToolbar
        selectedCount={getSelectedCount()}
        onBulkDelete={handleBulkDelete}
        onBulkMove={handleBulkMove}
        onClearSelection={clearSelection}
      />
    </div>
  );
};

export default Calendar;
