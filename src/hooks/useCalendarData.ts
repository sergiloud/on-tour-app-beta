/**
 * useCalendarData
 * Centralizes all data fetching and subscription logic for the calendar
 * 
 * Responsibilities:
 * - Fetch and subscribe to travel/itinerary events
 * - Merge shows + travel into unified event structure
 * - Handle data loading states and errors
 * - Provide CRUD operations for events
 * 
 * @module hooks/useCalendarData
 */

import { useState, useEffect, useMemo } from 'react';
import { useShows } from './useShows';
import { fetchItinerariesGentle, onItinerariesUpdated, Itinerary, saveItinerary, removeItinerary } from '../services/travelApi';
import { useCalendarEvents } from './useCalendarEvents';
import { useSyncedCalendarEvents } from './useSyncedCalendarEvents';
import type { Show } from '../lib/shows';
import type { CalEvent } from '../components/calendar/types';

export interface CalendarDataFilters {
  kinds: { shows: boolean; travel: boolean };
  status?: { confirmed: boolean; pending: boolean; offer: boolean };
}

export interface UseCalendarDataParams {
  debouncedCursor: string; // YYYY-MM format
  filters: CalendarDataFilters;
  lang: 'en' | 'es';
  tz: string;
  toDateOnlyTz: (iso: string, tz: string) => string;
}

export interface UseCalendarDataReturn {
  // Data
  shows: Show[];
  travel: Itinerary[];
  eventsByDay: Map<string, CalEvent[]>;
  
  // Loading states
  travelLoading: boolean;
  travelError: boolean;
  
  // CRUD operations
  showOperations: {
    add: (show: Show) => void;
    update: (id: string, patch: Partial<Show> & Record<string, unknown>) => void;
    remove: (id: string) => Promise<void>;
  };
  
  travelOperations: {
    save: (itinerary: Itinerary) => Promise<Itinerary>;
    remove: (id: string) => Promise<void>;
  };
}

/**
 * Custom hook that handles all calendar data fetching and management
 * Replaces scattered data logic from Calendar.tsx
 */
export function useCalendarData({
  debouncedCursor,
  filters,
  lang,
  tz,
  toDateOnlyTz,
}: UseCalendarDataParams): UseCalendarDataReturn {
  // Shows data (from existing hook)
  const { shows, add, update, remove } = useShows();
  
  // Synced calendar events from CalDAV
  const { events: syncedEvents } = useSyncedCalendarEvents();
  
  // Travel/itinerary data
  const [travel, setTravel] = useState<Itinerary[]>([]);
  const [travelLoading, setTravelLoading] = useState(false);
  const [travelError, setTravelError] = useState(false);
  
  // Fetch travel data when cursor changes
  useEffect(() => {
    const year = Number(debouncedCursor.slice(0, 4));
    const month = Number(debouncedCursor.slice(5, 7));
    const from = new Date(year, month - 1, 1).toISOString().slice(0, 10);
    const to = new Date(year, month, 0).toISOString().slice(0, 10);
    
    const ac = new AbortController();
    setTravelLoading(true);
    setTravelError(false);
    
    fetchItinerariesGentle({ from, to }, { signal: ac.signal })
      .then(res => {
        setTravel(res.data);
        setTravelError(false);
      })
      .catch(err => {
        if ((err as any)?.name !== 'AbortError') {
          setTravelError(true);
        }
      })
      .finally(() => {
        setTravelLoading(false);
      });
    
    // Subscribe to real-time updates
    const unsub = onItinerariesUpdated((e) => {
      setTravel(e.data);
    });
    
    return () => {
      ac.abort();
      unsub();
    };
  }, [debouncedCursor]);
  
  // Merge shows + travel + synced events into unified event structure
  const eventsByDay = useCalendarEvents({
    shows,
    travel,
    syncedEvents,
    lang,
    kinds: filters.kinds,
    filters: { status: filters.status },
    toDateOnlyTz,
    tz,
  });
  
  // CRUD operations
  const showOperations = useMemo(() => ({
    add,
    update,
    remove,
  }), [add, update, remove]);
  
  const travelOperations = useMemo(() => ({
    save: saveItinerary,
    remove: removeItinerary,
  }), []);
  
  return {
    shows,
    travel,
    eventsByDay,
    travelLoading,
    travelError,
    showOperations,
    travelOperations,
  };
}
