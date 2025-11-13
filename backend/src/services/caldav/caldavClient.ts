/**
 * CalDAV Client Service
 * 
 * Handles communication with CalDAV servers (iCloud, Google Calendar, etc.)
 * Provides bidirectional sync between On Tour events and calendar events
 */

import { createDAVClient, DAVClient, DAVCalendar, DAVCalendarObject, fetchCalendars } from 'tsdav';
import { v4 as uuidv4 } from 'uuid';

export interface CalendarCredentials {
  serverUrl: string;
  username: string;
  password: string;
}

export interface OnTourEvent {
  id?: string;
  uid?: string;
  title: string;
  start: Date;
  end: Date;
  location?: string;
  description?: string;
  status?: 'confirmed' | 'pending' | 'cancelled';
  type?: 'show' | 'travel' | 'meeting' | 'rehearsal' | 'break' | 'other';
  attendees?: string[];
  city?: string;
  country?: string;
  fee?: number;
}

export class CalDAVClient {
  private client: DAVClient | null = null;
  private connected: boolean = false;
  private credentials: CalendarCredentials | null = null;

  /**
   * Connect to CalDAV server (iCloud, Google, etc.)
   */
  async connect(credentials: CalendarCredentials): Promise<boolean> {
    try {
      this.credentials = credentials;
      this.client = await createDAVClient({
        serverUrl: credentials.serverUrl,
        credentials: {
          username: credentials.username,
          password: credentials.password,
        },
        authMethod: 'Basic',
        defaultAccountType: 'caldav',
      }) as unknown as DAVClient;

      // Test connection by fetching calendars
      if (this.client) {
        await fetchCalendars({ client: this.client });
        this.connected = true;
        return true;
      }
      
      throw new Error('Client initialization failed');
    } catch (error) {
      console.error('[CalDAV] Connection failed:', error);
      this.connected = false;
      throw new Error('Failed to connect to CalDAV server');
    }
  }

  /**
   * List all available calendars for the connected account
   */
  async listCalendars(): Promise<DAVCalendar[]> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to CalDAV server');
    }

    try {
      const calendars = await this.client.fetchCalendars();
      return calendars;
    } catch (error) {
      console.error('[CalDAV] Failed to list calendars:', error);
      throw error;
    }
  }

  /**
   * Get all events from a specific calendar
   */
  async getEvents(calendarUrl: string): Promise<DAVCalendarObject[]> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to CalDAV server');
    }

    try {
      const events = await this.client.fetchCalendarObjects({
        calendar: { url: calendarUrl } as DAVCalendar,
      });
      return events;
    } catch (error) {
      console.error('[CalDAV] Failed to get events:', error);
      throw error;
    }
  }

  /**
   * Create a new event in the calendar
   */
  async createEvent(calendarUrl: string, event: OnTourEvent): Promise<string> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to CalDAV server');
    }

    const uid = event.uid || uuidv4();
    const iCalString = this.convertToICS(event, uid);

    try {
      await this.client.createCalendarObject({
        calendar: { url: calendarUrl } as DAVCalendar,
        filename: `${uid}.ics`,
        iCalString,
      });
      return uid;
    } catch (error) {
      console.error('[CalDAV] Failed to create event:', error);
      throw error;
    }
  }

  /**
   * Update an existing event
   */
  async updateEvent(calendarUrl: string, event: OnTourEvent): Promise<void> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to CalDAV server');
    }

    if (!event.uid) {
      throw new Error('Event UID is required for updates');
    }

    const iCalString = this.convertToICS(event, event.uid);

    try {
      await this.client.updateCalendarObject({
        calendar: { url: calendarUrl } as DAVCalendar,
        filename: `${event.uid}.ics`,
        iCalString,
      });
    } catch (error) {
      console.error('[CalDAV] Failed to update event:', error);
      throw error;
    }
  }

  /**
   * Delete an event from the calendar
   */
  async deleteEvent(calendarUrl: string, eventUid: string): Promise<void> {
    if (!this.client || !this.connected) {
      throw new Error('Not connected to CalDAV server');
    }

    try {
      await this.client.deleteCalendarObject({
        calendar: { url: calendarUrl } as DAVCalendar,
        filename: `${eventUid}.ics`,
      });
    } catch (error) {
      console.error('[CalDAV] Failed to delete event:', error);
      throw error;
    }
  }

  /**
   * Convert On Tour event to iCalendar format
   */
  private convertToICS(event: OnTourEvent, uid: string): string {
    const now = new Date();
    const dtstamp = this.formatDate(now);
    const dtstart = this.formatDate(event.start);
    const dtend = this.formatDate(event.end);

    // Build location string
    let location = event.location || '';
    if (event.city && event.country) {
      location = `${event.city}, ${event.country}`;
    }

    // Build description
    let description = event.description || '';
    if (event.type) {
      description = `[${event.type.toUpperCase()}] ${description}`;
    }
    if (event.fee) {
      description += `\nFee: €${event.fee}`;
    }

    // Map status
    const status = this.mapStatus(event.status);

    return `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//On Tour App//Calendar Sync//EN
CALSCALE:GREGORIAN
METHOD:PUBLISH
BEGIN:VEVENT
UID:${uid}
DTSTAMP:${dtstamp}
DTSTART:${dtstart}
DTEND:${dtend}
SUMMARY:${this.escapeText(event.title)}
LOCATION:${this.escapeText(location)}
DESCRIPTION:${this.escapeText(description)}
STATUS:${status}
TRANSP:OPAQUE
SEQUENCE:0
END:VEVENT
END:VCALENDAR`;
  }

  /**
   * Parse iCalendar string to On Tour event
   */
  parseICSToEvent(icsString: string): OnTourEvent | null {
    try {
      // Simple regex-based parsing (para prototipo rápido)
      const uidMatch = icsString.match(/UID:(.*)/);
      const summaryMatch = icsString.match(/SUMMARY:(.*)/);
      const dtstartMatch = icsString.match(/DTSTART:(.*)/);
      const dtendMatch = icsString.match(/DTEND:(.*)/);
      const locationMatch = icsString.match(/LOCATION:(.*)/);
      const descriptionMatch = icsString.match(/DESCRIPTION:(.*)/);
      const statusMatch = icsString.match(/STATUS:(.*)/);

      if (!summaryMatch || !dtstartMatch || !dtendMatch) {
        return null;
      }

      return {
        uid: uidMatch ? uidMatch[1].trim() : uuidv4(),
        title: this.unescapeText(summaryMatch[1].trim()),
        start: this.parseDate(dtstartMatch[1].trim()),
        end: this.parseDate(dtendMatch[1].trim()),
        location: locationMatch ? this.unescapeText(locationMatch[1].trim()) : undefined,
        description: descriptionMatch ? this.unescapeText(descriptionMatch[1].trim()) : undefined,
        status: this.parseStatus(statusMatch ? statusMatch[1].trim() : 'CONFIRMED'),
      };
    } catch (error) {
      console.error('[CalDAV] Failed to parse ICS:', error);
      return null;
    }
  }

  /**
   * Format date to iCalendar format (YYYYMMDDTHHMMSSZ)
   */
  private formatDate(date: Date): string {
    return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
  }

  /**
   * Parse iCalendar date to JavaScript Date
   */
  private parseDate(icsDate: string): Date {
    // Format: 20250113T140000Z
    const year = parseInt(icsDate.substring(0, 4));
    const month = parseInt(icsDate.substring(4, 6)) - 1;
    const day = parseInt(icsDate.substring(6, 8));
    const hour = parseInt(icsDate.substring(9, 11));
    const minute = parseInt(icsDate.substring(11, 13));
    const second = parseInt(icsDate.substring(13, 15));

    return new Date(Date.UTC(year, month, day, hour, minute, second));
  }

  /**
   * Map On Tour status to iCalendar status
   */
  private mapStatus(status?: string): string {
    switch (status) {
      case 'confirmed':
        return 'CONFIRMED';
      case 'pending':
        return 'TENTATIVE';
      case 'cancelled':
        return 'CANCELLED';
      default:
        return 'CONFIRMED';
    }
  }

  /**
   * Parse iCalendar status to On Tour status
   */
  private parseStatus(icsStatus: string): 'confirmed' | 'pending' | 'cancelled' {
    switch (icsStatus.toUpperCase()) {
      case 'CONFIRMED':
        return 'confirmed';
      case 'TENTATIVE':
        return 'pending';
      case 'CANCELLED':
        return 'cancelled';
      default:
        return 'confirmed';
    }
  }

  /**
   * Escape text for iCalendar format
   */
  private escapeText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  }

  /**
   * Unescape iCalendar text
   */
  private unescapeText(text: string): string {
    return text
      .replace(/\\n/g, '\n')
      .replace(/\\,/g, ',')
      .replace(/\\;/g, ';')
      .replace(/\\\\/g, '\\');
  }

  /**
   * Disconnect from CalDAV server
   */
  disconnect(): void {
    this.client = null;
    this.connected = false;
  }

  /**
   * Check if client is connected
   */
  isConnected(): boolean {
    return this.connected;
  }
}

/**
 * Factory function to create CalDAV clients for different providers
 */
export function createCalDAVClientForProvider(provider: 'icloud' | 'google' | 'outlook'): CalendarCredentials {
  const serverUrls = {
    icloud: 'https://caldav.icloud.com',
    google: 'https://apidata.googleusercontent.com/caldav/v2',
    outlook: 'https://outlook.office365.com',
  };

  return {
    serverUrl: serverUrls[provider],
    username: '', // To be filled by user
    password: '', // To be filled by user (app-specific password)
  };
}
