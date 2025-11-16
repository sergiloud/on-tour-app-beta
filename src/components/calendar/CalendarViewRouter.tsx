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
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          onEventDoubleClick={onEventDoubleClick}
          onCreateEvent={onCreateEvent}
          onMoveEvent={onMoveEvent}
          selectedEventIds={selectedEventIds}
          isSelected={isSelected}
          toggleSelection={toggleSelection}
          onSpanAdjust={onSpanAdjust}
          heatmapMode={heatmapMode}
          shows={shows}
        />
      );
      
    case 'week':
      return (
        <WeekGrid
          cursor={cursor}
          eventsByDay={eventsByDay}
          selectedDay={selectedDay}
          today={today}
          onDayClick={onDayClick}
          onEventClick={onEventClick}
          onEventDoubleClick={onEventDoubleClick}
          onCreateEvent={onCreateEvent}
          onMoveEvent={onMoveEvent}
          selectedEventIds={selectedEventIds}
          isSelected={isSelected}
          toggleSelection={toggleSelection}
          weekStartsOn={weekStartsOn}
          tz={tz}
        />
      );
      
    case 'day':
      return (
        <DayGrid
          date={selectedDay || today}
          eventsByDay={eventsByDay}
          onEventClick={onEventClick}
          onEventDoubleClick={onEventDoubleClick}
          onCreateEvent={onCreateEvent}
          selectedEventIds={selectedEventIds}
          isSelected={isSelected}
          toggleSelection={toggleSelection}
        />
      );
      
    case 'agenda':
      return (
        <AgendaList
          eventsByDay={eventsByDay}
          cursor={cursor}
          onEventClick={onEventClick}
          onEventDoubleClick={onEventDoubleClick}
          selectedEventIds={selectedEventIds}
          isSelected={isSelected}
          toggleSelection={toggleSelection}
          lang={lang}
        />
      );
      
    case 'timeline':
      return (
        <TimelineView
          shows={shows}
          travel={travel}
          onEventClick={(ev) => {
            // Convert to CalEvent format for consistency
            if ('city' in ev) {
              // It's a show
              onEventClick({
                id: `show:${ev.id}`,
                date: ev.date,
                kind: 'show',
                title: ev.city,
                meta: '',
                status: ev.status,
                spanLength: 1,
                spanIndex: 0,
              });
            } else {
              // It's travel
              onEventClick({
                id: `travel:${ev.id}`,
                date: ev.date,
                kind: 'travel',
                title: ev.title,
                meta: '',
                spanLength: 1,
                spanIndex: 0,
              });
            }
          }}
          lang={lang}
        />
      );
      
    default:
      return null;
  }
});

CalendarViewRouter.displayName = 'CalendarViewRouter';
