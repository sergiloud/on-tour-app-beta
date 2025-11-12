import { useCallback } from 'react';
import { generateId } from '../lib/id';
import { trackEvent } from '../lib/telemetry';
import { announce } from '../lib/announcer';
import type { Show } from '../lib/shows';
import type { Itinerary } from '../services/travelApi';
import type { CalEvent } from '../components/calendar/types';
import type { EventData, EventType } from '../components/calendar/EventCreationModal';

/**
 * useCalendarActions
 * 
 * Centralizes all calendar business logic (CRUD operations, bulk actions, event manipulation).
 * Decouples Calendar.tsx from business rules, making logic testable and reusable.
 * 
 * Responsibilities:
 * - Move/duplicate events
 * - Delete events
 * - Adjust multi-day event spans
 * - Save new/edited events
 * - Bulk operations (delete, move)
 * - Create events from drag-drop
 */

interface UseCalendarActionsParams {
  shows: Show[];
  travel: Itinerary[];
  showOperations: {
    add: (show: Show) => void;
    update: (id: string, changes: Partial<Show>) => void;
    remove: (id: string) => void;
  };
  travelOperations: {
    save: (itinerary: Itinerary) => Promise<Itinerary | void>;
    remove: (id: string) => Promise<void>;
  };
}

export function useCalendarActions({
  shows,
  travel,
  showOperations,
  travelOperations,
}: UseCalendarActionsParams) {
  
  /**
   * Move or duplicate an event to a new date
   */
  const moveEvent = useCallback((eventId: string, toDate: string, duplicate = false) => {
    // Check if it's an itinerary event (not a show)
    if (!eventId.startsWith('show:') && eventId.includes(':')) {
      const [eventType, itineraryId] = eventId.split(':');

      // Find the itinerary
      const foundItinerary = travel.find((it: Itinerary) => it.id === itineraryId);
      if (!foundItinerary) return;

      const startDate = new Date(foundItinerary.date);
      const targetDate = new Date(toDate);
      const deltaDays = Math.round((targetDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));

      if (duplicate) {
        const newId = generateId();
        const duplicatedItinerary = { ...foundItinerary, id: newId, date: toDate };
        travelOperations.save(duplicatedItinerary);
        trackEvent('cal.drag.duplicate', { id: newId, toDate });
      } else {
        const movedItinerary = { ...foundItinerary, date: toDate };
        if (foundItinerary.endDate) {
          const endDate = new Date(foundItinerary.endDate);
          endDate.setDate(endDate.getDate() + deltaDays);
          movedItinerary.endDate = endDate.toISOString().slice(0, 10);
        }
        travelOperations.save(movedItinerary);
        trackEvent('cal.drag.move', { id: itineraryId, toDate });
      }
      return;
    }

    // It's a show event
    const id = eventId.split(':')[1] || eventId;
    const found = shows.find(s => s.id === id);
    if (!found) return;

    const iso = `${toDate}T00:00:00`;
    if (duplicate) {
      const newId = generateId();
      const copy: Show = { ...found, id: newId, date: iso };
      showOperations.add(copy);
      trackEvent('cal.drag.duplicate', { id: newId, toDate });
    } else {
      showOperations.update(id, { date: iso });
      trackEvent('cal.drag.move', { id, toDate });
    }
  }, [shows, travel, showOperations, travelOperations]);

  /**
   * Delete an event (show or travel)
   */
  const deleteEvent = useCallback((eventId: string) => {
    // Check if it's an itinerary event (not a show)
    if (!eventId.startsWith('show:') && eventId.includes(':')) {
      const [eventType, itineraryId] = eventId.split(':');
      if (itineraryId) {
        travelOperations.remove(itineraryId).catch((err: any) => {
          // Handle error silently
        });
      }
    } else {
      // It's a show event
      const id = eventId.split(':')[1] || eventId;
      showOperations.remove(id);
    }
    trackEvent('cal.drag.delete_outside', { id: eventId });
  }, [showOperations, travelOperations]);

  /**
   * Adjust the start or end date of a multi-day event
   */
  const adjustEventSpan = useCallback((eventId: string, direction: 'start' | 'end', deltaDays: number) => {
    try {
      const actualEventId = eventId.split(':')[1] || eventId;
      const show = shows.find(s => s.id === actualEventId);
      if (!show) return;

      const startDate = new Date(show.date);
      const endDate = show.endDate ? new Date(show.endDate) : new Date(show.date);

      const updateData: any = {};

      if (direction === 'start') {
        // Adjust start date (move the beginning)
        startDate.setDate(startDate.getDate() + deltaDays);

        // Ensure start doesn't go past end
        if (startDate > endDate) {
          startDate.setTime(endDate.getTime());
        }

        const newStartStr = startDate.toISOString().slice(0, 10);
        updateData.date = `${newStartStr}T00:00:00`;

        // If event had an end date, preserve it
        if (show.endDate && startDate.getTime() !== endDate.getTime()) {
          const endDateStr = show.endDate.slice(0, 10);
          updateData.endDate = `${endDateStr}T00:00:00`;
        } else if (show.endDate) {
          updateData.endDate = undefined;
        }

        showOperations.update(actualEventId, updateData);
      } else {
        // Adjust end date (move the ending)
        endDate.setDate(endDate.getDate() + deltaDays);

        // Ensure end doesn't go before start
        if (endDate < startDate) {
          endDate.setTime(startDate.getTime());
        }

        const newEndStr = endDate.toISOString().slice(0, 10);
        const showDateStr = show.date.slice(0, 10);
        updateData.date = `${showDateStr}T00:00:00`;

        // If end date is same as start date, remove it (single day event)
        if (endDate.getTime() === startDate.getTime()) {
          updateData.endDate = undefined;
        } else {
          updateData.endDate = `${newEndStr}T00:00:00`;
        }

        showOperations.update(actualEventId, updateData);
      }
    } catch (err) {
      // Handle error silently
    }
  }, [shows, showOperations]);

  /**
   * Bulk delete multiple events
   */
  const bulkDeleteEvents = useCallback((eventIds: string[]) => {
    eventIds.forEach(id => {
      showOperations.remove(id);
    });
    announce(`Deleted ${eventIds.length} event${eventIds.length !== 1 ? 's' : ''}`);
    trackEvent('calendar.bulk.delete', { count: eventIds.length });
  }, [showOperations]);

  /**
   * Bulk move multiple events forward or backward by N days
   */
  const bulkMoveEvents = useCallback((eventIds: string[], direction: 'forward' | 'backward', days: number) => {
    const delta = direction === 'forward' ? days : -days;

    eventIds.forEach(id => {
      const show = shows.find(s => s.id === id);
      if (show) {
        const currentDate = new Date(show.date);
        currentDate.setDate(currentDate.getDate() + delta);
        const newDateStr = currentDate.toISOString().slice(0, 10);
        showOperations.update(id, { date: `${newDateStr}T00:00:00` } as any);
      }
    });

    const dirText = direction === 'forward' ? 'forward' : 'backward';
    announce(`Moved ${eventIds.length} event${eventIds.length !== 1 ? 's' : ''} ${dirText} by ${days} day${days !== 1 ? 's' : ''}`);
    trackEvent('calendar.bulk.move', { count: eventIds.length, direction, days });
  }, [shows, showOperations]);

  /**
   * Save a new or edited event (from modals)
   */
  const saveEvent = useCallback(async (data: EventData, editingTravelId?: string) => {
    try {
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
          showOperations.add(newShow);
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

                await travelOperations.save(updatedTravel);
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

              await travelOperations.save(it);
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

            await travelOperations.save(eventItinerary);
            trackEvent('calendar.create.event', { type: data.type, date: data.date });
            announce(`${data.type} event created`);
          } catch (err) {
            // Handle error silently
          }
          break;
      }
    } catch (err) {
      // Handle error silently
    }
  }, [shows, travel, showOperations, travelOperations]);

  /**
   * Save an edited event (from EventEditorModal)
   */
  const saveEditedEvent = useCallback(async (event: Show | Itinerary) => {
    if ('kind' in event && event.kind === 'show') {
      const show = event as any;
      const id = show.id;
      const { kind, ...showData } = show;
      showOperations.update(id, showData);
      trackEvent('calendar.edit.event', { type: 'show', id });
      announce('Show updated');
    } else {
      const itinerary = event as Itinerary;
      await travelOperations.save(itinerary);
      trackEvent('calendar.edit.event', { type: 'travel', id: itinerary.id });
      announce('Travel event updated');
    }
  }, [showOperations, travelOperations]);

  /**
   * Create event from quick add (calendar drag-drop shortcut)
   */
  const quickAddShow = useCallback((dateStr: string, data: { city: string; country: string; fee?: number }) => {
    const id = generateId();
    const newShow: Show = {
      id,
      city: data.city,
      country: data.country,
      lat: 0,
      lng: 0,
      date: `${dateStr}T00:00:00`,
      fee: Number(data.fee || 0),
      status: 'pending',
      __version: 0,
      __modifiedAt: Date.now(),
      __modifiedBy: 'system'
    } as Show;
    showOperations.add(newShow);
    trackEvent('cal.create.quick', { id, day: dateStr });
    return id; // Return the generated ID for navigation
  }, [showOperations]);

  return {
    moveEvent,
    deleteEvent,
    adjustEventSpan,
    bulkDeleteEvents,
    bulkMoveEvents,
    saveEvent,
    saveEditedEvent,
    quickAddShow,
  };
}
