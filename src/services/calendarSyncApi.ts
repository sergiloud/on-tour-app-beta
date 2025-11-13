/**
 * Calendar Sync API Client
 * 
 * Frontend service for interacting with CalDAV calendar sync endpoints
 */

export interface CalendarSyncCredentials {
  provider: 'icloud' | 'google' | 'outlook' | 'caldav';
  email: string;
  password: string;
  serverUrl?: string;
}

export interface Calendar {
  url: string;
  displayName: string;
  description?: string;
}

export interface SyncResult {
  imported: number;
  exported: number;
  errors: string[];
}

export interface SyncStatus {
  enabled: boolean;
  lastSync?: Date;
  calendarName?: string;
  direction?: 'import' | 'export' | 'bidirectional';
}

/**
 * Test connection to CalDAV provider and list available calendars
 */
export async function connectToCalendar(
  credentials: CalendarSyncCredentials,
  userId: string
): Promise<{ calendars: Calendar[]; credentials: any }> {
  const response = await fetch('/api/calendar-sync/connect', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...credentials,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to connect to calendar');
  }

  return response.json();
}

/**
 * Enable calendar synchronization
 */
export async function enableCalendarSync(
  calendarUrl: string,
  direction: 'import' | 'export' | 'bidirectional',
  credentials: any,
  userId: string
): Promise<{ success: boolean }> {
  const response = await fetch('/api/calendar-sync/enable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      calendarUrl,
      direction,
      credentials,
      userId,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to enable sync');
  }

  return response.json();
}

/**
 * Disable calendar synchronization
 */
export async function disableCalendarSync(userId: string): Promise<{ success: boolean }> {
  const response = await fetch('/api/calendar-sync/disable', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to disable sync');
  }

  return response.json();
}

/**
 * Manually trigger calendar sync
 */
export async function syncNow(userId: string): Promise<{ result: SyncResult }> {
  const response = await fetch('/api/calendar-sync/sync-now', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ userId }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Sync failed');
  }

  return response.json();
}

/**
 * Get calendar sync status
 */
export async function getCalendarSyncStatus(userId: string): Promise<SyncStatus> {
  const response = await fetch(`/api/calendar-sync/status?userId=${userId}`);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to get sync status');
  }

  const data = await response.json();
  
  // Convert lastSync to Date if present
  if (data.lastSync) {
    data.lastSync = new Date(data.lastSync);
  }

  return data;
}
