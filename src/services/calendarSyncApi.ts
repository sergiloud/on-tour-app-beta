/**
 * Calendar Sync API Client
 * 
 * Frontend service for interacting with CalDAV calendar sync endpoints
 */

import { t } from '../lib/i18n';

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
 * 
 * @param userId - User ID
 * @param showToast - Optional toast function to show feedback
 * @returns Sync result with counts and errors
 */
export async function syncNow(
  userId: string, 
  showToast?: (message: string, opts?: { tone?: 'info' | 'success' | 'error'; timeout?: number }) => void
): Promise<{ result: SyncResult }> {
  // Show "syncing..." toast if toast function provided
  if (showToast) {
    showToast(t('calendar.sync.inProgress') || 'Syncing with iCloud...', { tone: 'info', timeout: 6000 });
  }

  try {
    const response = await fetch('/api/calendar-sync/sync-now', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId }),
    });

    if (!response.ok) {
      const error = await response.json();
      const errorMessage = error.message || t('calendar.sync.error.failed') || 'Sync failed';
      
      if (showToast) {
        showToast(errorMessage, { tone: 'error', timeout: 5000 });
      }
      
      throw new Error(errorMessage);
    }

    const data = await response.json();
    
    // Show success toast
    if (showToast) {
      showToast(t('calendar.sync.success') || 'Calendar synced successfully!', { tone: 'success', timeout: 3000 });
    }
    
    return data;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : (t('calendar.sync.error.failed') || 'Sync failed');
    
    if (showToast) {
      showToast(errorMessage, { tone: 'error', timeout: 5000 });
    }
    
    throw error;
  }
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
