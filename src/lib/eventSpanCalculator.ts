/**
 * Calculate event spans for multi-day rendering
 * Groups events by their date range and returns positioning info
 */

import type { CalEvent } from '../components/calendar/types';

export interface EventSpanInfo {
  event: CalEvent;
  startDate: string; // ISO date where this display starts
  endDate: string; // ISO date where this display ends
  spanDays: number; // How many days wide to display
  isStart: boolean; // True if display starts on event start date
  isEnd: boolean; // True if display ends on event end date
  row: number; // Which row to display on (0-based)
}

/**
 * Get all dates an event spans, clamped to visible grid dates
 */
function getEventSpanDates(event: CalEvent, gridStartDate: string, gridEndDate: string): string[] {
  const eventStart = new Date(event.date);
  const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.date);
  const gridStart = new Date(gridStartDate);
  const gridEnd = new Date(gridEndDate);

  const spanStart = eventStart < gridStart ? gridStart : eventStart;
  const spanEnd = eventEnd > gridEnd ? gridEnd : eventEnd;

  const dates: string[] = [];
  let current = new Date(spanStart);

  while (current <= spanEnd) {
    dates.push(current.toISOString().slice(0, 10));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Calculate all event spans for month view
 * Returns info needed to render events spanning multiple days
 */
export function calculateEventSpans(
  events: CalEvent[],
  gridDates: string[]
): Map<string, EventSpanInfo[]> {
  const spansByDate = new Map<string, EventSpanInfo[]>();

  // Track which rows are occupied on each date
  const occupiedRows = new Map<string, Set<number>>();

  // Get grid boundaries
  const gridStart = gridDates[0];
  const gridEnd = gridDates[gridDates.length - 1];
  
  if (!gridStart || !gridEnd) {
    // Empty grid
    return spansByDate;
  }

  events.forEach((event) => {
    // Only include events that overlap with visible grid
    const eventEnd = event.endDate ? new Date(event.endDate) : new Date(event.date);
    const gridEndDate = new Date(gridEnd);
    const eventStart = new Date(event.date);

    if (eventEnd < new Date(gridStart) || eventStart > gridEndDate) {
      return;
    }

    // Get the dates this event spans
    const spanDates = getEventSpanDates(event, gridStart, gridEnd);
    if (spanDates.length === 0) return;

    // Find available row for this event
    let row = 0;
    let foundRow = false;

    while (!foundRow) {
      let rowAvailable = true;

      // Check if this row is available for all span dates
      for (const date of spanDates) {
        const occupiedOnDate = occupiedRows.get(date) || new Set();
        if (occupiedOnDate.has(row)) {
          rowAvailable = false;
          break;
        }
      }

      if (rowAvailable) {
        foundRow = true;
      } else {
        row++;
      }
    }

    // Mark row as occupied for all span dates
    for (const date of spanDates) {
      if (!occupiedRows.has(date)) {
        occupiedRows.set(date, new Set());
      }
      occupiedRows.get(date)!.add(row);
    }

    const firstSpan = spanDates[0];
    const lastSpan = spanDates[spanDates.length - 1];
    if (!firstSpan || !lastSpan) return; // Safety check

    // Create span info for this event
    const spanInfo: EventSpanInfo = {
      event,
      startDate: firstSpan,
      endDate: lastSpan,
      spanDays: spanDates.length,
      isStart: firstSpan === event.date.slice(0, 10),
      isEnd: lastSpan === (event.endDate ? event.endDate.slice(0, 10) : event.date.slice(0, 10)),
      row,
    };

    // Add to each date's spans
    for (const date of spanDates) {
      if (!spansByDate.has(date)) {
        spansByDate.set(date, []);
      }
      spansByDate.get(date)!.push(spanInfo);
    }
  });

  return spansByDate;
}

/**
 * Get the maximum row index for a given date
 */
export function getMaxRowForDate(spansByDate: Map<string, EventSpanInfo[]>, date: string): number {
  const spans = spansByDate.get(date) || [];
  if (spans.length === 0) return -1;
  return Math.max(...spans.map(s => s.row));
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
