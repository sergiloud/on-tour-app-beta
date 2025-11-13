/**
 * 📅 UNIFIED CALENDAR EVENTS HOOK
 * 
 * Hook que combina shows, travel y eventos de calendario en una vista unificada
 * Distingue entre diferentes tipos de eventos para el manejo correcto
 */

import { useMemo } from 'react';
import { CalEvent } from '../components/calendar/types';
import { Show } from '../lib/shows';
import { Itinerary } from '../services/travelApi';
import { useCalendarEvents, CalendarEvent } from '../services/calendarEventService';
import { getCurrentOrgId } from '../lib/tenants';
import { useAuth } from '../context/AuthContext';

// Map para convertir colores de eventos de calendario a colores de CalEvent
const CALENDAR_COLOR_MAP: Record<string, CalEvent['color']> = {
  'accent': 'accent',
  'green': 'green', 
  'red': 'red',
  'blue': 'blue',
  'yellow': 'yellow',
  'purple': 'purple'
};

// TZ-aware YYYY-MM-DD from ISO
const toDateOnlyTz = (iso: string, tz: string = 'UTC') => {
  try {
    const d = new Date(iso);
    const parts = new Intl.DateTimeFormat('en-CA', { 
      timeZone: tz, 
      year: 'numeric', 
      month: '2-digit', 
      day: '2-digit' 
    }).formatToParts(d).reduce<Record<string, string>>((acc, p) => { 
      if (p.type !== 'literal') acc[p.type] = p.value; 
      return acc; 
    }, {});
    
    const y = parts.year, m = parts.month, day = parts.day;
    if (y && m && day) return `${y}-${m}-${day}`;
  } catch { }
  return iso.slice(0, 10);
};

interface UseUnifiedCalendarEventsParams {
  shows: Show[];
  travel: Itinerary[];
  tz?: string;
}

interface UseUnifiedCalendarEventsReturn {
  // Eventos unificados por día
  eventsByDay: Record<string, CalEvent[]>;
  
  // Operaciones de eventos de calendario
  calendarEvents: CalendarEvent[];
  createCalendarEvent: (eventData: any, userId: string) => Promise<string>;
  updateCalendarEvent: (eventId: string, updates: any) => Promise<void>;
  deleteCalendarEvent: (eventId: string) => Promise<void>;
  moveCalendarEvent: (eventId: string, newDate: string) => Promise<void>;
  
  // Estado de carga y errores
  loading: boolean;
  error: string | null;
}

export function useUnifiedCalendarEvents({
  shows,
  travel,
  tz = 'UTC'
}: UseUnifiedCalendarEventsParams): UseUnifiedCalendarEventsReturn {
  
  const { userId } = useAuth();
  const organizationId = getCurrentOrgId();
  
  // Hook para eventos de calendario desde Firebase
  const {
    events: calendarEvents,
    loading,
    error,
    createEvent,
    updateEvent,
    deleteEvent,
    moveEvent
  } = useCalendarEvents(organizationId);

  // Convertir shows a CalEvent
  const showEvents = useMemo(() => {
    const events: CalEvent[] = [];
    
    shows.forEach(show => {
      const dateOnly = toDateOnlyTz(show.date, tz);
      
      events.push({
        id: `show:${show.id}`,
        date: dateOnly,
        kind: 'show',
        title: show.city || 'Unknown Show',
        status: show.status,
        meta: `${show.city}, ${show.country}`,
        city: show.city,
        country: show.country,
        start: show.date,
        allDay: false,
        color: show.status === 'confirmed' ? 'green' : 
               show.status === 'pending' ? 'yellow' : 'red'
      });
    });
    
    return events;
  }, [shows, tz]);

  // Convertir travel a CalEvent
  const travelEvents = useMemo(() => {
    const events: CalEvent[] = [];
    
    travel.forEach(item => {
      const dateOnly = toDateOnlyTz(item.date, tz);
      
      events.push({
        id: `travel:${item.id}`,
        date: dateOnly,
        kind: 'travel',
        title: item.title || item.city || 'Travel',
        status: 'confirmed',
        meta: item.destination || item.city,
        start: item.date,
        allDay: false,
        color: 'blue'
      });
    });
    
    return events;
  }, [travel, tz]);

  // Convertir eventos de calendario a CalEvent
  const calendarEventsConverted = useMemo(() => {
    const events: CalEvent[] = [];
    
    calendarEvents.forEach(event => {
      events.push({
        id: `calendar:${event.id}`,
        date: event.date,
        kind: event.type as CalEvent['kind'],
        title: event.title,
        status: 'confirmed',
        meta: event.description || event.location,
        start: event.allDay ? `${event.date}T00:00:00` : `${event.date}T${event.time || '09:00'}:00`,
        end: event.timeEnd ? `${event.date}T${event.timeEnd}:00` : undefined,
        allDay: event.allDay || false,
        color: CALENDAR_COLOR_MAP[event.color || 'accent'] || 'accent',
        notes: event.notes
      });
    });
    
    return events;
  }, [calendarEvents]);

  // Combinar todos los eventos y agrupar por día
  const eventsByDay = useMemo(() => {
    const allEvents = [...showEvents, ...travelEvents, ...calendarEventsConverted];
    const grouped: Record<string, CalEvent[]> = {};
    
    allEvents.forEach(event => {
      if (!grouped[event.date]) {
        grouped[event.date] = [];
      }
      grouped[event.date]!.push(event);
    });
    
    // Ordenar eventos dentro de cada día
    Object.keys(grouped).forEach(date => {
      grouped[date]!.sort((a, b) => {
        // Primero por allDay (eventos todo el día arriba)
        if (a.allDay && !b.allDay) return -1;
        if (!a.allDay && b.allDay) return 1;
        
        // Luego por hora de inicio
        if (a.start && b.start) {
          return a.start.localeCompare(b.start);
        }
        
        // Finalmente por título
        return a.title.localeCompare(b.title);
      });
    });
    
    return grouped;
  }, [showEvents, travelEvents, calendarEventsConverted]);

  // Wrapper functions para eventos de calendario
  const createCalendarEvent = async (eventData: any, userIdParam?: string) => {
    const currentUserId = userIdParam || userId;
    if (!currentUserId) throw new Error('User not authenticated');
    return await createEvent(eventData, currentUserId);
  };

  const updateCalendarEvent = async (eventId: string, updates: any) => {
    return await updateEvent(eventId, updates);
  };

  const deleteCalendarEvent = async (eventId: string) => {
    return await deleteEvent(eventId);
  };

  const moveCalendarEvent = async (eventId: string, newDate: string) => {
    return await moveEvent(eventId, newDate);
  };

  return {
    eventsByDay,
    calendarEvents,
    createCalendarEvent,
    updateCalendarEvent,
    deleteCalendarEvent,
    moveCalendarEvent,
    loading,
    error
  };
}

export default useUnifiedCalendarEvents;