import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useShows } from '../../hooks/useShows';
import { useEventSelection } from '../../hooks/useEventSelection';
import type { Show } from '../../lib/shows';
import { useSettings } from '../../context/SettingsContext';
import { t } from '../../lib/i18n';
import { fetchItinerariesGentle, onItinerariesUpdated, Itinerary, saveItinerary, removeItinerary } from '../../services/travelApi';
import StatusBadge from '../../ui/StatusBadge';
import { countryLabel } from '../../lib/countries';
import { useNavigate } from 'react-router-dom';
import { trackEvent } from '../../lib/telemetry';
import { useCalendarState } from '../../hooks/useCalendarState';
import { useCalendarMatrix } from '../../hooks/useCalendarMatrix';
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
import { useCalendarEvents } from '../../hooks/useCalendarEvents';
import { parseICS } from '../../lib/calendar/ics';
import EventCreationModal, { EventType, EventData } from '../../components/calendar/EventCreationModal';
import DayDetailsModal from '../../components/calendar/DayDetailsModal';
import TravelFlightModal from '../../components/calendar/TravelFlightModal';
import ShowEventModal from '../../components/calendar/ShowEventModal';
import EventEditorModal from '../../components/calendar/EventEditorModal';
import { getCurrentOrgId } from '../../lib/tenants';

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

// Generate UUID with fallback for older browsers
const generateId = () => {
  try {
    return crypto.randomUUID();
  } catch {
    return Math.random().toString(36).slice(2, 10);
  }
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
  const { shows, add, update, remove } = useShows();
  const { lang } = useSettings();
  const navigate = useNavigate();
  const { view, setView, cursor, setCursor, tz, setTz, filters, setFilters, today } = useCalendarState();
  const year = Number(cursor.slice(0, 4));
  const month = Number(cursor.slice(5, 7));
  const [selectedDay, setSelectedDay] = useState<string>('');

  // Multi-selection hook
  const {
    selectedEventIds,
    clearSelection,
    toggleSelection,
    isSelected,
    getSelectedCount,
    getSelectedIds,
  } = useEventSelection();

  // Modal states
  const [eventCreationOpen, setEventCreationOpen] = useState(false);
  const [eventCreationDate, setEventCreationDate] = useState<string | undefined>(undefined);
  const [eventCreationType, setEventCreationType] = useState<EventType | null>(null);
  const [eventCreationInitialData, setEventCreationInitialData] = useState<EventData | undefined>(undefined);
  const [editingTravelId, setEditingTravelId] = useState<string | undefined>(undefined);
  const [dayDetailsOpen, setDayDetailsOpen] = useState(false);
  const [dayDetailsDate, setDayDetailsDate] = useState<string | undefined>(undefined);

  // New modal states for editing events inline
  const [showEventModalOpen, setShowEventModalOpen] = useState(false);
  const [showEventData, setShowEventData] = useState<any | undefined>(undefined);
  const [travelFlightModalOpen, setTravelFlightModalOpen] = useState(false);
  const [travelEventData, setTravelEventData] = useState<any | undefined>(undefined);

  // Event editor modal state
  const [eventEditorOpen, setEventEditorOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<(Show & { kind: 'show' }) | (Itinerary & { kind: 'travel' }) | null>(null);

  const [travel, setTravel] = useState<Itinerary[]>([]);
  const [travelError, setTravelError] = useState(false);
  const [gotoOpen, setGotoOpen] = useState(false);
  const [debouncedCursor, setDebouncedCursor] = useState(cursor);
  const [weekStartsOn, setWeekStartsOn] = useState<0 | 1>(() => { try { return Number(localStorage.getItem('calendar:weekStart') || '1') as 0 | 1; } catch { return 1; } });
  const [heatmapMode, setHeatmapMode] = useState<'none' | 'financial' | 'activity'>(() => { try { return (localStorage.getItem('calendar:heatmap') || 'none') as 'none' | 'financial' | 'activity'; } catch { return 'none'; } });
  useEffect(() => { try { localStorage.setItem('calendar:weekStart', String(weekStartsOn)); } catch { } }, [weekStartsOn]);
  useEffect(() => { try { localStorage.setItem('calendar:heatmap', heatmapMode); } catch { } }, [heatmapMode]);
  useEffect(() => {
    const id = setTimeout(() => setDebouncedCursor(cursor), 180);
    return () => clearTimeout(id);
  }, [cursor]);
  // Gentle refresh travel whenever visible month changes
  useEffect(() => {
    const year = Number(debouncedCursor.slice(0, 4));
    const month = Number(debouncedCursor.slice(5, 7));
    const from = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const to = new Date(year, month, 0).toISOString().slice(0, 10);
    const ac = new AbortController();
    setTravelError(false);
    fetchItinerariesGentle({ from, to }, { signal: ac.signal }).then(res => {
      setTravel(res.data);
    }).catch(err => {
      if ((err as any)?.name !== 'AbortError') setTravelError(true);
    });
    const unsub = onItinerariesUpdated((e) => {
      // naive key match by from/to; update regardless
      setTravel(e.data);
    });
    return () => { ac.abort(); unsub(); };
  }, [debouncedCursor]);

  // Merge shows + travel into day buckets
  const eventsByDay = useCalendarEvents({ shows, travel, lang, kinds: filters.kinds, filters: { status: filters.status }, toDateOnlyTz, tz });

  const grid = useCalendarMatrix(year, month, weekStartsOn);

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
        setEditingEvent({ ...show, kind: 'show' });
        setEventEditorOpen(true);
      }
    } else {
      // Find the itinerary/travel event
      const travelId = ev.id.split(':')[1] || ev.id;
      const itinerary = travel.find(t => t.id === travelId);
      if (itinerary) {
        setEditingEvent({ ...itinerary, kind: 'travel' });
        setEventEditorOpen(true);
      }
    }
  };

  // Handle saving edited event
  const handleSaveEditedEvent = async (event: Show | Itinerary) => {
    if ('kind' in event && event.kind === 'show') {
      // It's a show
      const show = event as Show;
      update(show.id, show);
    } else {
      // It's an itinerary
      const itinerary = event as Itinerary;
      await saveItinerary(itinerary);
    }
  };


  const handleSpanAdjust = (eventId: string, direction: 'start' | 'end', deltaDays: number) => {
    // Check if it's an itinerary event (format: "eventType:UUID" where eventType is not 'show')
    if (!eventId.startsWith('show:') && eventId.includes(':')) {
      const [eventType, itineraryId] = eventId.split(':');
      const itineraryEvent = travel.find(t => t.id === itineraryId);
      if (!itineraryEvent) {
        return;
      }

      try {
        const startDate = new Date(itineraryEvent.date);
        const endDate = itineraryEvent.endDate ? new Date(itineraryEvent.endDate) : new Date(itineraryEvent.date);

        if (direction === 'start') {
          // Adjust start date
          startDate.setDate(startDate.getDate() + deltaDays);
          if (startDate > endDate) {
            startDate.setTime(endDate.getTime());
          }
          const newStartStr = startDate.toISOString().slice(0, 10);
          const updatedTravel: Itinerary = { ...itineraryEvent, date: newStartStr };
          if (itineraryEvent.endDate && startDate.getTime() !== endDate.getTime()) {
            updatedTravel.endDate = itineraryEvent.endDate.slice(0, 10);
          } else if (itineraryEvent.endDate) {
            updatedTravel.endDate = undefined;
          }
          saveItinerary(updatedTravel);
        } else {
          // Adjust end date
          endDate.setDate(endDate.getDate() + deltaDays);
          if (endDate < startDate) {
            endDate.setTime(startDate.getTime());
          }
          const newEndStr = endDate.toISOString().slice(0, 10);
          const updatedTravel: Itinerary = { ...itineraryEvent, date: itineraryEvent.date.slice(0, 10) };
          if (endDate.getTime() === startDate.getTime()) {
            updatedTravel.endDate = undefined;
          } else {
            updatedTravel.endDate = newEndStr;
          }
          saveItinerary(updatedTravel);
        }
      } catch (err) {
        // Handle error silently
      }
      return;
    }

    // Otherwise handle as Show event
    const actualEventId = eventId.startsWith('show:') ? eventId.substring(5) : eventId;
    const show = shows.find(s => s.id === actualEventId);
    if (!show) {
      return;
    }

    try {
      const startDate = new Date(show.date);
      const endDate = show.endDate ? new Date(show.endDate) : new Date(show.date);

      if (direction === 'start') {
        // Adjust start date (move the beginning)
        startDate.setDate(startDate.getDate() + deltaDays);

        // Ensure start date doesn't go after end date
        if (startDate > endDate) {
          startDate.setTime(endDate.getTime());
        }

        const newStartStr = startDate.toISOString().slice(0, 10);
        const updateData: any = { date: `${newStartStr}T00:00:00` };

        // If we had an endDate and it's different from start, keep it
        if (show.endDate && startDate.getTime() !== endDate.getTime()) {
          // Keep the end date from show, ensure it's in correct format (YYYY-MM-DDTHH:MM:SS)
          const endDateStr = show.endDate.slice(0, 10);
          updateData.endDate = `${endDateStr}T00:00:00`;
        } else if (show.endDate) {
          // If start and end are now the same, remove endDate
          updateData.endDate = undefined;
        }

        update(actualEventId, updateData);
      } else {
        // Adjust end date (move the ending)
        endDate.setDate(endDate.getDate() + deltaDays);

        // Ensure end date doesn't go before start date
        if (endDate < startDate) {
          endDate.setTime(startDate.getTime());
        }

        const newEndStr = endDate.toISOString().slice(0, 10);
        // Extract just the date part (YYYY-MM-DD) from show.date
        const showDateStr = show.date.slice(0, 10);
        const updateData: any = { date: `${showDateStr}T00:00:00` };

        // If end date is same as start date, remove it (single day event)
        if (endDate.getTime() === startDate.getTime()) {
          updateData.endDate = undefined;
        } else {
          updateData.endDate = `${newEndStr}T00:00:00`;
        }

        update(actualEventId, updateData);
      }
    } catch (err) {
      // Handle error silently
    }
  };

  // Bulk operations handlers
  const handleBulkDelete = useCallback(() => {
    const selectedIds = getSelectedIds();
    selectedIds.forEach(id => {
      remove(id);
    });
    announce(`Deleted ${selectedIds.length} event${selectedIds.length !== 1 ? 's' : ''}`);
    trackEvent('calendar.bulk.delete', { count: selectedIds.length });
    clearSelection();
  }, [getSelectedIds, remove, clearSelection]);

  const handleBulkMove = useCallback((direction: 'forward' | 'backward', days: number) => {
    const selectedIds = getSelectedIds();
    const delta = direction === 'forward' ? days : -days;

    selectedIds.forEach(id => {
      const show = shows.find(s => s.id === id);
      if (show) {
        const currentDate = new Date(show.date);
        currentDate.setDate(currentDate.getDate() + delta);
        const newDateStr = currentDate.toISOString().slice(0, 10);
        update(id, { date: `${newDateStr}T00:00:00` } as any);
      }
    });

    const dirText = direction === 'forward' ? 'forward' : 'backward';
    announce(`Moved ${selectedIds.length} event${selectedIds.length !== 1 ? 's' : ''} ${dirText} by ${days} day${days !== 1 ? 's' : ''}`);
    trackEvent('calendar.bulk.move', { count: selectedIds.length, direction, days });
    clearSelection();
  }, [getSelectedIds, shows, update, clearSelection]);

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
                  className="px-3 py-2 rounded-lg bg-slate-200 dark:bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:bg-white/15 text-white text-sm font-medium transition-colors"
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

  // Global keyboard shortcuts (T/←/→/PgUp/PgDn)
  useEffect(() => {
    const onPrev = () => changeMonth(-1);
    const onNext = () => changeMonth(1);
    const onToday = () => goToday();
    const onGotoKey = (e: KeyboardEvent) => {
      const meta = (e.ctrlKey || e.metaKey);
      if (meta && (e.key === 'g' || e.key === 'G')) { e.preventDefault(); setGotoOpen(true); }
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
    try {
      console.log('[handleSaveEvent] Called with:', { type: data.type, title: data.title, date: data.date });
      switch (data.type) {
        case 'show':
          const id = generateId();
          const newShow: Show = {
            id,
            city: data.city || '',
            country: data.country || '',
            lat: 0,
            lng: 0,
            date: `${data.date}T00:00:00`,
            fee: data.fee || 0,
            status: 'pending',
            __version: 0,
            __modifiedAt: Date.now(),
            __modifiedBy: 'system'
          };
          add(newShow);
          trackEvent('calendar.create.event', { type: 'show', date: data.date });
          announce(`Show created in ${data.city}, ${data.country}`);
          break;

        case 'travel':
          try {
            if (editingTravelId) {
              // Update existing travel event
              const existingTravel = travel.find(t => t.id === editingTravelId);
              if (existingTravel) {
                const updatedTravel: Itinerary = {
                  ...existingTravel,
                  date: data.date,
                  title: `${data.origin || ''} → ${data.destination || ''}`,
                  city: data.destination || undefined,
                  description: data.description,
                  location: data.location,
                  // Store flight details in the object
                  confirmationCode: data.confirmationCode,
                  departureTime: data.departureTime,
                  arrivalTime: data.arrivalTime,
                  flightNumber: data.flightNumber,
                  airline: data.airline,
                  departureTerminal: data.departureTerminal,
                  arrivalTerminal: data.arrivalTerminal,
                  seat: data.seat,
                  notes: data.notes,
                  travelMode: data.travelMode,
                  dateEnd: data.dateEnd,
                  origin: data.origin,
                  destination: data.destination,
                } as any;

                // NOTE: Do NOT call setTravel directly - the subscription from saveItinerary will update React state
                await saveItinerary(updatedTravel);
                setEditingTravelId(undefined);
                trackEvent('calendar.edit.event', { type: 'travel', from: data.date, to: data.dateEnd });
                announce(`Travel event updated from ${data.origin} to ${data.destination}`);
              }
            } else {
              // Create new travel event
              const tid = generateId();
              const it: Itinerary = {
                id: tid,
                date: data.date,
                title: `${data.origin || ''} → ${data.destination || ''}`,
                team: 'A',
                city: data.destination || undefined,
                status: 'pending',
                description: data.description,
                location: data.location,
                // Store flight details
                confirmationCode: data.confirmationCode,
                departureTime: data.departureTime,
                arrivalTime: data.arrivalTime,
                flightNumber: data.flightNumber,
                airline: data.airline,
                departureTerminal: data.departureTerminal,
                arrivalTerminal: data.arrivalTerminal,
                seat: data.seat,
                notes: data.notes,
                travelMode: data.travelMode,
                dateEnd: data.dateEnd,
                origin: data.origin,
                destination: data.destination,
              } as any;

              // Persist itinerary to travel store
              // NOTE: Do NOT call setTravel directly - the subscription from saveItinerary will update React state
              await saveItinerary(it);
              trackEvent('calendar.create.event', { type: 'travel', from: data.date, to: data.dateEnd });
              announce(`Travel event created from ${data.origin} to ${data.destination}`);
            }
          } catch (err) {
            // Handle error silently
          }
          break;

        case 'meeting':
        case 'rehearsal':
        case 'break':
          try {
            if (editingTravelId) {
              // Update existing meeting/rehearsal/break event
              const existingEvent = travel.find(t => t.id === editingTravelId);
              if (existingEvent) {
                const updatedEvent: Itinerary = {
                  ...existingEvent,
                  date: data.date,
                  title: data.title || data.type,
                  status: data.status || 'pending',
                  description: data.description,
                  location: data.location,
                  btnType: data.type,
                  endDate: data.dateEnd,
                } as any;

                // NOTE: Do NOT call setTravel directly - the subscription from saveItinerary will update React state
                await saveItinerary(updatedEvent);
                setEditingTravelId(undefined);
                trackEvent('calendar.edit.event', { type: data.type, date: data.date });
                announce(`${data.type} event updated`);
              }
            } else {
              // Create new meeting/rehearsal/break event
              const eid = generateId();
              const eventItinerary: Itinerary = {
                id: eid,
                date: data.date,
                title: data.title || data.type,
                team: 'A',
                city: undefined,
                status: data.status || 'pending',
                description: data.description,
                location: data.location,
                btnType: data.type,
                endDate: data.dateEnd,
              } as any;

              // NOTE: Do NOT call setTravel directly - the subscription from saveItinerary will update React state
              await saveItinerary(eventItinerary);
              trackEvent('calendar.create.event', { type: data.type, date: data.date });
              announce(`${data.type} event created`);
            }
          } catch (err) {
            // Handle error silently
          }
          break;
      }
    } catch (err) {
      // Handle error silently
    }
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
        onGoToDate={() => setGotoOpen(true)}
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
              add({ id, city, country, lat: 0, lng: 0, date: `${dateOnly}T00:00:00`, fee: 0, status: 'pending', __version: 0, __modifiedAt: Date.now(), __modifiedBy: 'system' } as Show);
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
            add(newShow);
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
            saveItinerary(it).then(() => {
              announce(`${button.type} event created: ${button.label} on ${dateStr}`);
            }).catch((err) => {
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
          onOpen={(ev) => {
            console.log('MonthGrid onOpen called:', ev.kind, ev.id);
            if (ev.kind === 'show') {
              const id = ev.id.split(':')[1];
              const show = shows.find(s => s.id === id);
              if (show) {
                setShowEventData({
                  id: show.id,
                  date: show.date.slice(0, 10),
                  title: show.city,
                  city: show.city,
                  country: show.country,
                  status: show.status,
                  notes: show.notes,
                });
                setShowEventModalOpen(true);
              }
            } else if (ev.kind === 'travel') {
              // For travel events, open TravelFlightModal with travel data
              console.log('Travel event clicked:', ev.id, ev.kind);
              const id = ev.id.split(':')[1];
              const travelEvent = travel.find(t => t.id === id);
              console.log('Travel event found:', travelEvent);
              if (travelEvent) {
                // Open TravelFlightModal with travel event data
                setEditingTravelId(id);
                // Pre-fill the modal with travel data
                setEventCreationInitialData({
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
                } as EventData);
                setTravelFlightModalOpen(true);
              }
            } else {
              // For other events (meeting, rehearsal, break, etc), open EventCreationModal
              const id = ev.id.split(':')[1];
              const otherEvent = travel.find(t => t.id === id);
              if (otherEvent) {
                setEditingTravelId(id);
                setEventCreationType(ev.kind as EventType);
                setEventCreationDate(otherEvent.date.slice(0, 10));
                setEventCreationInitialData({
                  type: ev.kind as EventType,
                  date: otherEvent.date.slice(0, 10),
                  dateEnd: (otherEvent as any).endDate,
                  title: otherEvent.title,
                  description: (otherEvent as any).description,
                  location: (otherEvent as any).location,
                  color: (otherEvent as any).buttonColor as any,
                } as EventData);
                setEventCreationOpen(true);
              }
            }
          }}
          onMoveShow={(showId, toDate, duplicate) => {
            // Check if it's an itinerary event (not a show)
            if (!showId.startsWith('show:') && showId.includes(':')) {
              const [eventType, itineraryId] = showId.split(':');

              // Find the itinerary
              const foundItinerary = travel.find((it: Itinerary) => it.id === itineraryId);
              if (!foundItinerary) return;

              const iso = `${toDate}T00:00:00`;

              if (duplicate) {
                // Duplicate itinerary
                const newId = generateId();
                const copy: Itinerary = { ...foundItinerary, id: newId, date: iso };
                saveItinerary(copy).catch(err => {
                  console.error('Failed to duplicate itinerary:', err);
                });
              } else {
                // Move itinerary
                const updated: Itinerary = { ...foundItinerary, date: iso };
                saveItinerary(updated).catch(err => {
                  console.error('Failed to move itinerary:', err);
                });
              }
            } else {
              // It's a show event
              const id = showId.split(':')[1] || showId;
              const found = shows.find(s => s.id === id);
              if (!found) return;
              const iso = `${toDate}T00:00:00`;
              if (duplicate) {
                const newId = generateId();
                const copy: Show = { ...found, id: newId, date: iso };
                add(copy);
              } else {
                update(id, { date: iso });
              }
            }
          }}
          onQuickAddSave={(dateStr, data) => {
            const id = generateId();
            const newShow: Show = { id, city: data.city, country: data.country, lat: 0, lng: 0, date: `${dateStr}T00:00:00`, fee: Number(data.fee || 0), status: 'pending', __version: 0, __modifiedAt: Date.now(), __modifiedBy: 'system' } as Show;
            add(newShow);
            try { trackEvent('cal.create.quick', { id, day: dateStr }); } catch { }
            navigate(`/dashboard/shows?edit=${id}`);
          }}
          onDeleteShow={(eventId) => {
            // Check if it's an itinerary event (not a show)
            if (!eventId.startsWith('show:') && eventId.includes(':')) {
              const [eventType, itineraryId] = eventId.split(':');
              if (itineraryId) {
                removeItinerary(itineraryId).catch(err => {
                  // Handle error silently
                });
              }
            } else {
              // It's a show event
              const id = eventId.split(':')[1] || eventId;
              remove(id);
            }
            try { trackEvent('cal.drag.delete_outside', { id: eventId }); } catch { }
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
          onOpen={(ev) => {
            if (ev.kind === 'show') {
              const id = ev.id.split(':')[1];
              const show = shows.find(s => s.id === id);
              if (show) {
                setShowEventData({
                  id: show.id,
                  date: show.date.slice(0, 10),
                  title: show.city,
                  city: show.city,
                  country: show.country,
                  status: show.status,
                  notes: show.notes,
                });
                setShowEventModalOpen(true);
              }
            } else if (ev.kind === 'travel') {
              // For travel events, open TravelFlightModal with travel data
              console.log('Travel event clicked:', ev.id, ev.kind);
              const id = ev.id.split(':')[1];
              const travelEvent = travel.find(t => t.id === id);
              console.log('Travel event found:', travelEvent);
              if (travelEvent) {
                // Open TravelFlightModal with travel event data
                setEditingTravelId(id);
                // Pre-fill the modal with travel data
                setEventCreationInitialData({
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
                } as EventData);
                setTravelFlightModalOpen(true);
              }
            } else {
              // For other events (meeting, rehearsal, break, etc), open EventCreationModal
              const id = ev.id.split(':')[1];
              const otherEvent = travel.find(t => t.id === id);
              if (otherEvent) {
                setEditingTravelId(id);
                setEventCreationType(ev.kind as EventType);
                setEventCreationDate(otherEvent.date.slice(0, 10));
                setEventCreationInitialData({
                  type: ev.kind as EventType,
                  date: otherEvent.date.slice(0, 10),
                  dateEnd: (otherEvent as any).endDate,
                  title: otherEvent.title,
                  description: (otherEvent as any).description,
                  location: (otherEvent as any).location,
                  color: (otherEvent as any).buttonColor as any,
                } as EventData);
                setEventCreationOpen(true);
              }
            }
          }}
        />
      )}

      {view === 'day' && (
        <DayGrid
          day={selectedDay || `${cursor}-01`}
          events={dayEvents}
          tz={tz}
          onOpen={(ev) => {
            if (ev.kind === 'show') {
              const id = ev.id.split(':')[1];
              const show = shows.find(s => s.id === id);
              if (show) {
                setShowEventData({
                  id: show.id,
                  date: show.date.slice(0, 10),
                  title: show.city,
                  city: show.city,
                  country: show.country,
                  status: show.status,
                  notes: show.notes,
                });
                setShowEventModalOpen(true);
              }
            } else {
              const id = ev.id.split(':')[1];
              const travelEvent = travel.find(t => t.id === id);
              if (travelEvent) {
                // Open EventCreationModal with travel event data
                setEditingTravelId(id);
                setEventCreationDate(travelEvent.date.slice(0, 10));
                setEventCreationType('travel');
                // Pre-fill the modal with travel data
                setEventCreationInitialData({
                  type: 'travel',
                  date: travelEvent.date.slice(0, 10),
                  dateEnd: (travelEvent as any).dateEnd,
                  origin: (travelEvent as any).origin,
                  destination: travelEvent.city,
                  travelMode: (travelEvent as any).travelMode || 'flight',
                  confirmationCode: (travelEvent as any).confirmationCode,
                  departureTime: (travelEvent as any).departureTime,
                  arrivalTime: (travelEvent as any).arrivalTime,
                  flightNumber: (travelEvent as any).flightNumber,
                  airline: (travelEvent as any).airline,
                  departureTerminal: (travelEvent as any).departureTerminal,
                  arrivalTerminal: (travelEvent as any).arrivalTerminal,
                  seat: (travelEvent as any).seat,
                  notes: (travelEvent as any).notes,
                } as EventData);
                setEventCreationOpen(true);
              }
            }
          }}
        />
      )}

      {view === 'agenda' && (
        <AgendaList
          eventsByDay={agendaEventsByDay}
          onOpen={(ev) => {
            if (ev.kind === 'show') {
              const id = ev.id.split(':')[1];
              const show = shows.find(s => s.id === id);
              if (show) {
                setShowEventData({
                  id: show.id,
                  date: show.date.slice(0, 10),
                  title: show.city,
                  city: show.city,
                  country: show.country,
                  status: show.status,
                  notes: show.notes,
                });
                setShowEventModalOpen(true);
              }
            } else if (ev.kind === 'travel') {
              // For travel events, open TravelFlightModal with travel data
              const id = ev.id.split(':')[1];
              const travelEvent = travel.find(t => t.id === id);
              if (travelEvent) {
                // Open TravelFlightModal with travel event data
                setEditingTravelId(id);
                // Pre-fill the modal with travel data
                setEventCreationInitialData({
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
                } as EventData);
                setTravelFlightModalOpen(true);
              }
            } else {
              // For other events (meeting, rehearsal, break, etc), open EventCreationModal
              const id = ev.id.split(':')[1];
              const otherEvent = travel.find(t => t.id === id);
              if (otherEvent) {
                setEditingTravelId(id);
                setEventCreationType(ev.kind as EventType);
                setEventCreationDate(otherEvent.date.slice(0, 10));
                setEventCreationInitialData({
                  type: ev.kind as EventType,
                  date: otherEvent.date.slice(0, 10),
                  dateEnd: (otherEvent as any).endDate,
                  title: otherEvent.title,
                  description: (otherEvent as any).description,
                  location: (otherEvent as any).location,
                  color: (otherEvent as any).buttonColor as any,
                } as EventData);
                setEventCreationOpen(true);
              }
            }
          }}
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
      <EventCreationModal
        open={eventCreationOpen}
        initialDate={eventCreationDate}
        initialType={eventCreationType ?? 'show'}
        initialData={eventCreationInitialData}
        onClose={() => {
          console.log('Closing EventCreationModal');
          setEventCreationOpen(false);
          setEventCreationDate(undefined);
          setEventCreationType(null);
          setEventCreationInitialData(undefined);
          setEditingTravelId(undefined);
        }}
        onSave={handleSaveEvent}
      />

      {/* Day Details Modal */}
      <DayDetailsModal
        open={dayDetailsOpen}
        day={dayDetailsDate}
        events={dayDetailsDate ? eventsByDay.get(dayDetailsDate) || [] : []}
        onClose={() => {
          setDayDetailsOpen(false);
          setDayDetailsDate(undefined);
        }}
        onCreateEvent={handleCreateEvent}
      />

      {/* Gentle error banner for travel refresh failures */}
      {travelError && (
        <div role="status" aria-live="polite" className="p-2 rounded-md bg-rose-500/10 border border-rose-500/30 text-xs">
          {t('travel.refresh.error') || "Couldn't refresh travel. Showing cached data."}
        </div>
      )}

      <GoToDateDialog
        open={gotoOpen}
        onClose={() => setGotoOpen(false)}
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
        open={showEventModalOpen}
        onClose={() => {
          setShowEventModalOpen(false);
          setShowEventData(undefined);
        }}
        initialData={showEventData}
        onSave={(data) => {
          if (data.id) {
            // Update existing show
            update(data.id, {
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
            add(newShow);
          }
        }}
      />

      {/* Travel Flight Modal */}
      <TravelFlightModal
        open={travelFlightModalOpen}
        onClose={() => {
          setTravelFlightModalOpen(false);
          setEventCreationInitialData(undefined);
          setEditingTravelId(undefined);
        }}
        initialData={eventCreationInitialData}
        onSave={async (data) => {
          try {
            // Build itinerary object with flight details
            const itinerary: Itinerary = {
              id: editingTravelId || generateId(),
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

            await saveItinerary(extendedItinerary);
            announce(`Travel event ${editingTravelId ? 'updated' : 'created'}`);
            setTravelFlightModalOpen(false);
            setEventCreationInitialData(undefined);
            setEditingTravelId(undefined);
          } catch (err) {
            console.error('Error saving travel event:', err);
            announce('Error saving travel event');
          }
        }}
      />

      {/* Event Editor Modal */}
      <EventEditorModal
        open={eventEditorOpen}
        event={editingEvent}
        onClose={() => {
          setEventEditorOpen(false);
          setEditingEvent(null);
        }}
        onSave={handleSaveEditedEvent}
      />

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
