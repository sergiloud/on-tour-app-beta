/**
 * Advanced Calendar Types & Utilities
 * Multi-day event handling, drag-drop, smart features
 */

export interface CalendarEvent {
  id: string;
  title: string;
  kind: 'show' | 'travel';
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD for multi-day events
  startTime?: string; // HH:mm
  endTime?: string; // HH:mm
  status?: string;
  meta?: string;
  city?: string;
  country?: string;
  color?: 'accent' | 'green' | 'red' | 'blue' | 'yellow' | 'purple';
  pinned?: boolean;
  reminder?: 'none' | '15min' | '1hour' | '1day';
  notes?: string;
  attachments?: string[];
}

export interface DragEvent {
  eventId: string;
  from: string; // YYYY-MM-DD
  to: string; // YYYY-MM-DD
  endDate?: string; // Preserve end date if multi-day
}

export interface CalendarFilter {
  search?: string;
  kinds?: ('show' | 'travel')[];
  status?: string[];
  colors?: string[];
  pinned?: boolean;
  dateRange?: { from: string; to: string };
}

export interface CalendarViewConfig {
  view: 'month' | 'week' | 'day' | 'agenda' | 'timeline';
  groupBy?: 'date' | 'type' | 'status' | 'city';
  density?: 'compact' | 'normal' | 'spacious';
  weekStartsOn: 0 | 1; // 0=Sunday, 1=Monday
}

export type ExportFormat = 'ics' | 'csv' | 'json' | 'pdf';

/**
 * Get all dates spanned by an event (for multi-day visualization)
 */
export function getEventDateRange(event: CalendarEvent): string[] {
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : new Date(event.date);
  const dates: string[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    dates.push(d.toISOString().slice(0, 10));
  }

  return dates;
}

/**
 * Check if event spans multiple days
 */
export function isMultiDayEvent(event: CalendarEvent): boolean {
  if (!event.endDate) return false;
  return event.endDate > event.date;
}

/**
 * Get visual span for multi-day event (for grid positioning)
 */
export function getEventSpan(
  event: CalendarEvent,
  monthStart: string,
  monthEnd: string
): { startCol: number; span: number } {
  const start = new Date(event.date);
  const end = event.endDate ? new Date(event.endDate) : new Date(event.date);
  const monthStartDate = new Date(monthStart);

  const startCol = Math.max(
    0,
    Math.floor(
      (start.getTime() - monthStartDate.getTime()) / (1000 * 60 * 60 * 24)
    )
  );

  const span = Math.min(
    7,
    Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  return { startCol, span };
}

/**
 * Color mapping for events
 */
export const colorMap: Record<string, string> = {
  accent: 'from-accent-500/25 via-accent-500/15 to-accent-400/5 border-accent-500/40 text-accent-200',
  green: 'from-green-500/25 via-green-500/15 to-green-400/5 border-green-500/40 text-green-200',
  red: 'from-red-500/25 via-red-500/15 to-red-400/5 border-red-500/40 text-red-200',
  blue: 'from-blue-500/25 via-blue-500/15 to-blue-400/5 border-blue-500/40 text-blue-200',
  yellow: 'from-yellow-500/25 via-yellow-500/15 to-yellow-400/5 border-yellow-500/40 text-yellow-200',
  purple: 'from-purple-500/25 via-purple-500/15 to-purple-400/5 border-purple-500/40 text-purple-200',
};

/**
 * Smart event search (case-insensitive, partial match)
 */
export function searchEvents(
  events: CalendarEvent[],
  query: string
): CalendarEvent[] {
  const q = query.toLowerCase();
  return events.filter(
    (e) =>
      e.title.toLowerCase().includes(q) ||
      e.city?.toLowerCase().includes(q) ||
      e.country?.toLowerCase().includes(q) ||
      e.notes?.toLowerCase().includes(q)
  );
}

/**
 * Apply multiple filters to events
 */
export function filterEvents(
  events: CalendarEvent[],
  filter: CalendarFilter
): CalendarEvent[] {
  let result = [...events];

  if (filter.search) {
    result = searchEvents(result, filter.search);
  }

  if (filter.kinds?.length) {
    result = result.filter((e) => filter.kinds?.includes(e.kind));
  }

  if (filter.status?.length) {
    result = result.filter((e) => e.status && filter.status?.includes(e.status));
  }

  if (filter.colors?.length) {
    result = result.filter((e) => e.color && filter.colors?.includes(e.color));
  }

  if (filter.pinned !== undefined) {
    result = result.filter((e) => e.pinned === filter.pinned);
  }

  if (filter.dateRange) {
    result = result.filter(
      (e) =>
        e.date >= filter.dateRange!.from && e.date <= filter.dateRange!.to
    );
  }

  return result;
}

/**
 * Export events to ICS format
 */
export function exportToICS(events: CalendarEvent[]): string {
  const lines: string[] = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//On Tour App//EN',
    'CALSCALE:GREGORIAN',
  ];

  for (const event of events) {
    const dtStart = event.date.replace(/-/g, '');
    const dtEnd = event.endDate
      ? new Date(event.endDate).toISOString().slice(0, 10).replace(/-/g, '')
      : dtStart;

    lines.push('BEGIN:VEVENT');
    lines.push(`UID:${event.id}@ontourapp.local`);
    lines.push(`DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').slice(0, 15)}Z`);
    lines.push(`DTSTART:${dtStart}`);
    lines.push(`DTEND:${dtEnd}`);
    lines.push(`SUMMARY:${event.title}`);
    if (event.notes) lines.push(`DESCRIPTION:${event.notes}`);
    if (event.city) lines.push(`LOCATION:${event.city}, ${event.country}`);
    lines.push('END:VEVENT');
  }

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Export events to CSV format
 */
export function exportToCSV(events: CalendarEvent[]): string {
  const headers = [
    'ID',
    'Title',
    'Type',
    'Start Date',
    'End Date',
    'City',
    'Country',
    'Status',
    'Notes',
  ];

  const rows = events.map((e) => [
    e.id,
    `"${e.title}"`,
    e.kind,
    e.date,
    e.endDate || e.date,
    e.city || '',
    e.country || '',
    e.status || '',
    `"${e.notes || ''}"`,
  ]);

  return [
    headers.join(','),
    ...rows.map((r) => r.join(',')),
  ].join('\n');
}

/**
 * Get events for a specific day (including multi-day events)
 */
export function getEventsForDay(
  events: CalendarEvent[],
  day: string
): CalendarEvent[] {
  return events.filter((e) => {
    const range = getEventDateRange(e);
    return range.includes(day);
  });
}

/**
 * Sort events by date, then by type (shows first)
 */
export function sortEvents(events: CalendarEvent[]): CalendarEvent[] {
  return [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    return a.kind === 'show' ? -1 : 1;
  });
}

/**
 * Get week dates (Monday-Sunday by default)
 */
export function getWeekDates(date: string, weekStartsOn: 0 | 1 = 1): string[] {
  const d = new Date(date);
  const day = d.getDay();
  const startDelta = weekStartsOn === 1 ? (day + 6) % 7 : day;

  const week: string[] = [];
  for (let i = 0; i < 7; i++) {
    const weekDate = new Date(d);
    weekDate.setDate(weekDate.getDate() - startDelta + i);
    week.push(weekDate.toISOString().slice(0, 10));
  }

  return week;
}

/**
 * Calculate event density for a day (for visual heatmap)
 */
export function calculateEventDensity(
  events: CalendarEvent[],
  day: string
): number {
  const dayEvents = getEventsForDay(events, day);
  const multiDay = dayEvents.filter((e) => isMultiDayEvent(e)).length;
  const singleDay = dayEvents.filter((e) => !isMultiDayEvent(e)).length;

  return multiDay * 2 + singleDay;
}
