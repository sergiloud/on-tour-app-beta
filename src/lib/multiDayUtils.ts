/**
 * Utilities for handling multi-day events in calendar grids
 */

import type { CalEvent } from '../components/calendar/types';

export interface MultiDayEventSpan {
  event: CalEvent;
  startDate: string; // ISO date where this span starts in the grid
  endDate: string; // ISO date where this span ends in the grid
  spanDays: number; // Number of days this span covers
  spanStartsHere: boolean; // True if the event starts on startDate
  spanEndsHere: boolean; // True if the event ends on endDate
  rowIndex: number; // Which row (0 = first row, 1 = second row, etc.)
}

/**
 * Calculate multi-day event spans for a given date range
 * Returns arrays of event spans organized by row for proper rendering
 */
export function calculateMultiDaySpans(
  events: CalEvent[],
  monthStart: string,
  monthEnd: string,
  gridDates: string[]
): MultiDayEventSpan[] {
  const spans: MultiDayEventSpan[] = [];
  const occupiedCells = new Map<string, number>(); // Track which row each cell is occupied in

  const monthStartDate = new Date(monthStart);
  const monthEndDate = new Date(monthEnd);

  for (const event of events) {
    const eventStart = new Date(event.date);
    const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.date);

    // Only include events that overlap with the month view
    if (eventEnd < monthStartDate || eventStart > monthEndDate) continue;

    // Determine where this event's span starts and ends in the grid
    const spanStart = eventStart < monthStartDate ? monthStartDate : eventStart;
    const spanEnd = eventEnd > monthEndDate ? monthEndDate : eventEnd;

    const spanStartStr = spanStart.toISOString().slice(0, 10);
    const spanEndStr = spanEnd.toISOString().slice(0, 10);

    const spanDays = Math.ceil(
      (spanEnd.getTime() - spanStart.getTime()) / (1000 * 60 * 60 * 24)
    ) + 1;

    // Find the appropriate row for this event
    let rowIndex = 0;
    for (let i = 0; i < spanDays; i++) {
      const dateIndex = gridDates.indexOf(
        new Date(spanStart.getTime() + i * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      );

      if (dateIndex >= 0) {
        const cellKey = `${dateIndex}:${rowIndex}`;
        while (occupiedCells.has(cellKey)) {
          rowIndex++;
          occupiedCells.set(cellKey, rowIndex);
        }
      }
    }

    // Mark cells as occupied
    for (let i = 0; i < spanDays; i++) {
      const dateIndex = gridDates.indexOf(
        new Date(spanStart.getTime() + i * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10)
      );
      if (dateIndex >= 0) {
        occupiedCells.set(`${dateIndex}:${rowIndex}`, rowIndex);
      }
    }

    spans.push({
      event,
      startDate: spanStartStr,
      endDate: spanEndStr,
      spanDays,
      spanStartsHere: eventStart <= monthStartDate === false,
      spanEndsHere: eventEnd >= monthEndDate === false,
      rowIndex,
    });
  }

  return spans;
}

/**
 * Check if an event spans multiple days
 */
export function isMultiDayEvent(event: CalEvent): boolean {
  if (!event.endDate) return false;
  const start = new Date(event.date);
  const end = new Date(event.endDate);
  return end.getTime() > start.getTime();
}

/**
 * Get the number of days an event spans
 */
export function getEventSpanDays(event: CalEvent): number {
  if (!event.endDate) return 1;
  const start = new Date(event.date);
  const end = new Date(event.endDate);
  return Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Check if a date falls within an event's span
 */
export function isDateInEventSpan(date: string, event: CalEvent): boolean {
  const dateObj = new Date(date);
  const eventStart = new Date(event.date);
  const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.date);

  return dateObj >= eventStart && dateObj <= eventEnd;
}

/**
 * Get all dates an event spans
 */
export function getEventDateSpan(event: CalEvent): string[] {
  const dates: string[] = [];
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : new Date(event.date);

  let current = new Date(start);
  while (current <= end) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}
