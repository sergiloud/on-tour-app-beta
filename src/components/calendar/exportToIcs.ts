/**
 * Export calendar events to ICS format
 * Generates a standard iCalendar format file that can be imported into any calendar app
 */

import type { CalEvent } from './types';

interface IcsEvent {
  summary: string;
  description?: string;
  dtstart: string;
  dtend?: string;
  location?: string;
  url?: string;
}

/**
 * Convert date string (YYYY-MM-DD) to ICS format (YYYYMMDD)
 */
function formatDateForIcs(dateStr: string): string {
  return dateStr.replace(/-/g, '');
}

/**
 * Generate unique UID for event
 */
function generateUid(eventId: string, dateStr: string): string {
  return `event-${eventId}-${dateStr}@on-tour.app`;
}

/**
 * Escape special characters in ICS text fields
 */
function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n');
}

/**
 * Create ICS event line
 */
function createEventIcs(event: CalEvent, index: number): string {
  const uid = generateUid(event.id, event.date);
  const dtstart = formatDateForIcs(event.date);

  // Calculate DTEND: if event has endDate, use it; otherwise next day
  const endDateStr = event.endDate || event.date;
  const nextDay = new Date(endDateStr);
  nextDay.setDate(nextDay.getDate() + 1);
  const dtend = formatDateForIcs(nextDay.toISOString().split('T')[0] || '');

  const summary = escapeIcsText(event.title);
  const description = escapeIcsText('');

  const lines: string[] = [
    'BEGIN:VEVENT',
    `UID:${uid}`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:Z]/g, '').split('.')[0]}Z`,
    `DTSTART;VALUE=DATE:${dtstart}`,
    `DTEND;VALUE=DATE:${dtend}`,
    `SUMMARY:${summary}`,
  ];

  if (description) {
    lines.push(`DESCRIPTION:${description}`);
  }

  const locationPart = event.title.split(',')[1];
  if (locationPart) {
    lines.push(`LOCATION:${escapeIcsText(locationPart.trim())}`);
  }

  // Add status based on event status
  if (event.status === 'cancelled') {
    lines.push('STATUS:CANCELLED');
  } else if (event.status === 'confirmed') {
    lines.push('STATUS:CONFIRMED');
  } else {
    lines.push('STATUS:TENTATIVE');
  }

  // Add category
  if (event.kind === 'show') {
    lines.push('CATEGORIES:Show');
  } else if (event.kind === 'travel') {
    lines.push('CATEGORIES:Travel');
  }

  lines.push('END:VEVENT');
  return lines.join('\r\n');
}

/**
 * Export events to ICS format
 */
export function exportToIcs(
  events: CalEvent[],
  calendarName: string = 'On Tour Calendar'
): string {
  const now = new Date().toISOString().replace(/[-:Z]/g, '').split('.')[0];

  const header = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//On Tour App//On Tour 2.0//EN',
    `CALSCALE:GREGORIAN`,
    `METHOD:PUBLISH`,
    `X-WR-CALNAME:${escapeIcsText(calendarName)}`,
    `X-WR-TIMEZONE:UTC`,
    `DTSTAMP:${now}Z`,
  ];

  const eventLines = events.map((ev, idx) => createEventIcs(ev, idx)).join('\r\n');

  const footer = ['END:VCALENDAR'];

  return [...header, eventLines, ...footer].join('\r\n');
}

/**
 * Trigger download of ICS file
 */
export function downloadIcsFile(icsContent: string, filename: string = 'calendar.ics'): void {
  const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export and download calendar events
 */
export function exportCalendarEvents(
  events: CalEvent[],
  calendarName: string = 'On Tour Calendar',
  filename?: string
): void {
  if (events.length === 0) {
    console.warn('No events to export');
    return;
  }

  const icsContent = exportToIcs(events, calendarName);
  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const defaultFilename = filename || `calendar-${year}-${month}.ics`;

  downloadIcsFile(icsContent, defaultFilename);
}
