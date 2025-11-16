/**
 * CalendarViewRouter
 * Routes to the appropriate calendar view based on view mode
 * 
 * Responsibilities:
 * - Render correct view component (Month/Week/Day/Agenda/Timeline)
 * - Pass processed data and handlers to view components
 * - Keep view-specific logic isolated
 * - Reduce conditional rendering complexity in parent
 * 
 * @module components/calendar/CalendarViewRouter
 */

import React from 'react';
import MonthGrid from './MonthGrid';
import WeekGrid from './WeekGrid';
import DayGrid from './DayGrid';
import AgendaList from './AgendaList';
import { TimelineView } from './TimelineView';
import type { CalEvent } from './types';
import type { CalendarEvent } from './AdvancedCalendarTypes';
import type { Show } from '../../lib/shows';
import type { Itinerary } from '../../services/travelApi';
import type { MonthCell } from '../../hooks/useCalendarMatrix';

export type CalendarView = 'month' | 'week' | 'day' | 'agenda' | 'timeline';

export interface CalendarViewRouterProps {
  // Current view mode
  view: CalendarView;
  
  // Data
  eventsByDay: Map<string, CalEvent[]>;
  grid: MonthCell[][];
  shows: Show[];
  travel: Itinerary[];
  
  // View-specific data
  cursor: string; // YYYY-MM format
  selectedDay: string;
  today: string;
  tz: string;
  lang: 'en' | 'es';
  weekStartsOn: 0 | 1;
  heatmapMode: 'none' | 'financial' | 'activity';
  
  // Selection
  selectedEventIds: Set<string>;
  isSelected: (id: string) => boolean;
  toggleSelection: (id: string) => void;
  
  // Handlers
  onDayClick: (date: string) => void;
  setSelectedDay: (date: string) => void;
  onEventClick: (ev: CalEvent) => void;
  onEventDoubleClick: (ev: CalEvent) => void;
  onCreateEvent: (date: string) => void;
  onMoveEvent: (eventId: string, newDate: string) => void;
  onSpanAdjust: (eventId: string, direction: 'start' | 'end', deltaDays: number) => void;
}

/**
 * Router component that delegates to specific calendar views
 * Keeps Calendar.tsx clean by isolating view-specific rendering
 */
export const CalendarViewRouter = React.memo<CalendarViewRouterProps>(({
  view,
  eventsByDay,
  grid,
  shows,
  travel,
  cursor,
  selectedDay,
  today,
  tz,
  lang,
  weekStartsOn,
  heatmapMode,
  selectedEventIds,
  isSelected,
  toggleSelection,
  onDayClick,
  setSelectedDay,
  onEventClick,
  onEventDoubleClick,
  onCreateEvent,
  onMoveEvent,
  onSpanAdjust,
}) => {
  switch (view) {
    case 'month':
      return (
        <MonthGrid
          grid={grid}
          eventsByDay={eventsByDay}
          selectedDay={selectedDay}
          today={today}
          setSelectedDay={setSelectedDay}
          onOpen={onEventClick}
          onOpenDay={onDayClick}
          onMoveShow={onMoveEvent}
          onSpanAdjust={onSpanAdjust}
          heatmapMode={heatmapMode}
          shows={shows}
          selectedEventIds={selectedEventIds}
          onMultiSelectEvent={(eventId, isSelected) => {
            if (isSelected) {
              toggleSelection(eventId);
            }
          }}
        />
      );
      
    case 'week':
      return (
        <WeekGrid
          weekStart={cursor}
          eventsByDay={eventsByDay}
          tz={tz}
          onOpen={onEventClick}
          onCreateEvent={onCreateEvent}
          onMoveEvent={onMoveEvent}
        />
      );
      
    case 'day':
      return (
        <DayGrid
          day={selectedDay || today}
          events={eventsByDay.get(selectedDay || today) || []}
          onOpen={onEventClick}
          tz={tz}
        />
      );
      
    case 'agenda':
      return (
        <AgendaList
          eventsByDay={eventsByDay}
          onOpen={onEventClick}
        />
      );
      
    case 'timeline':
      const timelineEvents: CalendarEvent[] = [
        // Convert shows to events
        ...shows.map(show => ({
          id: `show:${show.id}`,
          date: show.date,
          kind: 'show' as const,
          title: show.city || 'Show',
          meta: show.venue || '',
          status: show.status,
          city: show.city,
          country: show.country,
        })),
        // Convert travel to events
        ...travel.map(trip => ({
          id: `travel:${trip.id}`,
          date: trip.date,
          kind: 'travel' as const,
          title: trip.departure && trip.destination ? `${trip.departure} → ${trip.destination}` : trip.title,
          meta: trip.btnType || '',
          status: trip.status || 'confirmed',
          city: trip.city,
        }))
      ];

      // Get current month from cursor or default to current month
      const now = new Date();
      const currentMonth = cursor || `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      const fromDate = `${currentMonth}-01`;
      const daysInMonth = new Date(Number(currentMonth.split('-')[0]), Number(currentMonth.split('-')[1]), 0).getDate();
      const toDate = `${currentMonth}-${daysInMonth.toString().padStart(2, '0')}`;

      return (
        <TimelineView
          events={timelineEvents}
          from={fromDate}
          to={toDate}
          onEventClick={onEventClick}
        />
      );
      
    default:
      return null;
  }
});

CalendarViewRouter.displayName = 'CalendarViewRouter';
