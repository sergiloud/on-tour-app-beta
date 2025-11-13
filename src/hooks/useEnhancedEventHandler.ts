/**
 * 📅 ENHANCED CALENDAR EVENT HANDLER
 * 
 * Manejador mejorado que distingue entre shows, travel y eventos de calendario
 * Usa Firebase para eventos de calendario y mantiene shows/travel como están
 */

import { useCallback } from 'react';
import { CalEvent } from '../components/calendar/types';
import { EventType, EventData } from '../components/calendar/EventCreationModal';
import { Show } from '../lib/shows';
import { Itinerary } from '../services/travelApi';
import { useCalendarModals } from './useCalendarModals';
import { CalendarEventInput } from '../services/calendarEventService';

interface UseEnhancedEventHandlerParams {
  shows: Show[];
  travel: Itinerary[];
  calendarEvents: any[];
  createCalendarEvent: (eventData: CalendarEventInput, userId?: string) => Promise<string>;
  updateCalendarEvent: (eventId: string, updates: Partial<CalendarEventInput>) => Promise<void>;
  deleteCalendarEvent: (eventId: string) => Promise<void>;
  showOperations: any;
  travelOperations: any;
}

export function useEnhancedEventHandler({
  shows,
  travel,
  calendarEvents,
  createCalendarEvent,
  updateCalendarEvent,
  deleteCalendarEvent,
  showOperations,
  travelOperations,
}: UseEnhancedEventHandlerParams) {
  
  const modals = useCalendarModals();

  /**
   * Manejar apertura de eventos - distingue entre tipos
   */
  const handleEventOpen = useCallback((ev: CalEvent) => {
    console.log('[Calendar] Opening event:', { id: ev.id, kind: ev.kind, title: ev.title });
    
    // Determinar el tipo de evento por el prefijo del ID
    const [eventType, eventId] = ev.id.split(':');
    
    switch (eventType) {
      case 'show': {
        // Evento de show - abrir ShowEventModal
        const show = shows.find(s => s.id === eventId);
        if (show) {
          const showData = {
            id: show.id,
            date: show.date.slice(0, 10),
            title: show.city,
            city: show.city,
            country: show.country,
            status: show.status,
            notes: show.notes,
            time: show.date.includes('T') ? show.date.split('T')[1]?.slice(0, 5) : undefined,
          };
          modals.openShowEvent(showData);
        }
        break;
      }
      
      case 'travel': {
        // Evento de travel - abrir TravelFlightModal
        const travelEvent = travel.find(t => t.id === eventId);
        if (travelEvent) {
          const travelData = {
            type: 'travel' as EventType,
            date: travelEvent.date.slice(0, 10),
            dateEnd: (travelEvent as any).endDate,
            origin: (travelEvent as any).departure || (travelEvent as any).origin,
            destination: travelEvent.city || travelEvent.destination,
            travelMode: (travelEvent as any).travelMode || 'flight',
            confirmationCode: (travelEvent as any).confirmationCode,
            departureTime: (travelEvent as any).startTime || (travelEvent as any).departureTime,
            arrivalTime: (travelEvent as any).arrivalTime,
            flightNumber: (travelEvent as any).flightNumber,
            airline: (travelEvent as any).airline,
            notes: (travelEvent as any).description || (travelEvent as any).notes,
          } as EventData;
          modals.openTravelFlight(travelData, eventId);
        }
        break;
      }
      
      case 'calendar': {
        // Evento de calendario - abrir EventCreationModal con datos existentes
        const calEvent = calendarEvents.find(e => e.id === eventId);
        if (calEvent) {
          const eventData = {
            type: calEvent.type as EventType,
            date: calEvent.date,
            dateEnd: calEvent.dateEnd,
            title: calEvent.title,
            description: calEvent.description,
            time: calEvent.time,
            timeEnd: calEvent.timeEnd,
            location: calEvent.location,
            notes: calEvent.notes,
            attendees: calEvent.attendees,
          } as EventData;
          
          modals.openEventCreation(
            calEvent.date, 
            calEvent.type as EventType, 
            eventData
          );
        }
        break;
      }
      
      default: {
        console.warn('[Calendar] Unknown event type:', eventType, ev);
        // Fallback - try to open as calendar event
        modals.openEventCreation(ev.date, 'meeting');
      }
    }
  }, [shows, travel, calendarEvents, modals]);

  /**
   * Manejar eliminación de eventos
   */
  const handleEventDelete = useCallback(async (eventId: string) => {
    console.log('[Calendar] Deleting event:', eventId);
    
    const [eventType, id] = eventId.split(':');
    
    try {
      switch (eventType) {
        case 'show':
          await showOperations.remove(id);
          break;
          
        case 'travel':
          await travelOperations.remove(id);
          break;
          
        case 'calendar':
          if (id) {
            await deleteCalendarEvent(id);
          }
          break;
          
        default:
          console.warn('[Calendar] Cannot delete unknown event type:', eventType);
      }
    } catch (error) {
      console.error('[Calendar] Error deleting event:', error);
      throw error;
    }
  }, [showOperations, travelOperations, deleteCalendarEvent]);

  /**
   * Manejar movimiento de eventos via drag & drop
   */
  const handleEventMove = useCallback(async (eventId: string, newDate: string, duplicate = false) => {
    console.log('[Calendar] Moving event:', { eventId, newDate, duplicate });
    
    const [eventType, id] = eventId.split(':');
    
    try {
      switch (eventType) {
        case 'show': {
          if (duplicate) {
            const show = shows.find(s => s.id === id);
            if (show) {
              const newShow = { 
                ...show, 
                id: `show_${Date.now()}`,
                date: `${newDate}T${show.date.includes('T') ? show.date.split('T')[1] : '00:00:00'}`
              };
              await showOperations.add(newShow);
            }
          } else {
            await showOperations.update(id, { 
              date: `${newDate}T${shows.find(s => s.id === id)?.date.includes('T') ? 
                shows.find(s => s.id === id)?.date.split('T')[1] : '00:00:00'}`
            });
          }
          break;
        }
        
        case 'travel': {
          if (duplicate) {
            const travelEvent = travel.find(t => t.id === id);
            if (travelEvent) {
              const newTravel = { 
                ...travelEvent, 
                id: `travel_${Date.now()}`,
                date: `${newDate}T${travelEvent.date.includes('T') ? travelEvent.date.split('T')[1] : '00:00:00'}`
              };
              await travelOperations.add(newTravel);
            }
          } else {
            await travelOperations.update(id, { 
              date: `${newDate}T${travel.find(t => t.id === id)?.date.includes('T') ? 
                travel.find(t => t.id === id)?.date.split('T')[1] : '00:00:00'}`
            });
          }
          break;
        }
        
        case 'calendar': {
          if (duplicate) {
            const calEvent = calendarEvents.find(e => e.id === id);
            if (calEvent) {
              const eventData: CalendarEventInput = {
                type: calEvent.type,
                title: `${calEvent.title} (Copy)`,
                description: calEvent.description,
                date: newDate,
                time: calEvent.time,
                timeEnd: calEvent.timeEnd,
                location: calEvent.location,
                allDay: calEvent.allDay,
                notes: calEvent.notes,
                attendees: calEvent.attendees,
                color: calEvent.color,
              };
              await createCalendarEvent(eventData);
            }
          } else {
            if (id) {
              await updateCalendarEvent(id, { date: newDate });
            }
          }
          break;
        }
        
        default:
          console.warn('[Calendar] Cannot move unknown event type:', eventType);
      }
    } catch (error) {
      console.error('[Calendar] Error moving event:', error);
      throw error;
    }
  }, [shows, travel, calendarEvents, showOperations, travelOperations, createCalendarEvent, updateCalendarEvent]);

  /**
   * Manejar creación de eventos desde drag & drop de botones
   */
  const handleCreateEventFromDrop = useCallback(async (
    eventType: EventType,
    date: string,
    buttonData?: any
  ) => {
    console.log('[Calendar] Creating event from drop:', { eventType, date, buttonData });
    
    try {
      if (eventType === 'show') {
        // Crear show a través del sistema existente
        const newShow = {
          id: `show_${Date.now()}`,
          city: buttonData?.label || 'New Show',
          country: 'Unknown',
          date: `${date}T20:00:00`,
          status: 'pending' as const,
          lat: 0,
          lng: 0,
          fee: 0,
        };
        await showOperations.add(newShow);
      } else if (eventType === 'travel') {
        // Crear travel a través del sistema existente
        const newTravel = {
          id: `travel_${Date.now()}`,
          title: buttonData?.label || 'Travel',
          city: 'Unknown',
          date: `${date}T09:00:00`,
          destination: 'Unknown',
        };
        await travelOperations.add(newTravel);
      } else {
        // Crear evento de calendario a través de Firebase
        const eventData: CalendarEventInput = {
          type: eventType,
          title: buttonData?.label || 'New Event',
          date: date,
          time: '09:00',
          allDay: false,
          color: buttonData?.color || 'accent',
        };
        await createCalendarEvent(eventData);
      }
    } catch (error) {
      console.error('[Calendar] Error creating event from drop:', error);
      throw error;
    }
  }, [showOperations, travelOperations, createCalendarEvent]);

  return {
    handleEventOpen,
    handleEventDelete,
    handleEventMove,
    handleCreateEventFromDrop,
  };
}

export default useEnhancedEventHandler;