/**
 * Calendar Sync API Routes
 * 
 * Endpoints for managing calendar synchronization with CalDAV providers
 */

import express from 'express';
import { CalDAVClient, createCalDAVClientForProvider } from '../services/caldav/caldavClient';
import { CalendarSyncService } from '../services/caldav/calendarSyncService';

const router = express.Router();

/**
 * Connect to CalDAV calendar (iCloud, Google, etc.)
 * POST /api/calendar-sync/connect
 */
router.post('/connect', async (req, res) => {
  try {
    const { provider, email, password } = req.body;
    const userId = req.body.userId; // From auth middleware

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Get server URL for provider
    const credentials = createCalDAVClientForProvider(provider || 'icloud');
    credentials.username = email;
    credentials.password = password;

    // Test connection
    const client = new CalDAVClient();
    await client.connect(credentials);

    // Get available calendars
    const calendars = await client.listCalendars();

    client.disconnect();

    // Save encrypted credentials (don't save yet, just return calendars)
    const encryptedPassword = CalendarSyncService.encryptPassword(password);

    res.json({
      success: true,
      calendars: calendars.map((cal: any) => ({
        url: cal.url,
        displayName: cal.displayName,
        description: cal.description,
        ctag: cal.ctag,
      })),
      credentials: {
        serverUrl: credentials.serverUrl,
        username: email,
        encryptedPassword,
      },
    });
  } catch (error) {
    console.error('[API] Calendar connect failed:', error);
    res.status(500).json({
      error: 'Failed to connect to calendar',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Enable calendar synchronization
 * POST /api/calendar-sync/enable
 */
router.post('/enable', async (req, res) => {
  try {
    const { calendarUrl, direction, credentials } = req.body;
    const userId = req.body.userId; // From auth middleware

    if (!calendarUrl || !direction || !credentials) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Save sync configuration
    await CalendarSyncService.saveSyncConfig(userId, {
      userId,
      calendarUrl,
      direction,
      enabled: true,
      credentials,
    });

    // Trigger initial sync
    const result = await CalendarSyncService.syncUserCalendar(userId);

    res.json({
      success: true,
      syncResult: result,
    });
  } catch (error) {
    console.error('[API] Enable sync failed:', error);
    res.status(500).json({
      error: 'Failed to enable calendar sync',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Disable calendar synchronization
 * POST /api/calendar-sync/disable
 */
router.post('/disable', async (req, res) => {
  try {
    const userId = req.body.userId; // From auth middleware

    await CalendarSyncService.disableSync(userId);

    res.json({ success: true });
  } catch (error) {
    console.error('[API] Disable sync failed:', error);
    res.status(500).json({
      error: 'Failed to disable calendar sync',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Trigger manual sync
 * POST /api/calendar-sync/sync-now
 */
router.post('/sync-now', async (req, res) => {
  try {
    const userId = req.body.userId; // From auth middleware

    const result = await CalendarSyncService.syncUserCalendar(userId);

    res.json({
      success: result.success,
      result,
    });
  } catch (error) {
    console.error('[API] Manual sync failed:', error);
    res.status(500).json({
      error: 'Failed to sync calendar',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

/**
 * Get sync status
 * GET /api/calendar-sync/status
 */
router.get('/status', async (req, res) => {
  try {
    const userId = req.query.userId as string;

    // TODO: Get sync config from Firestore
    const config = {}; // Placeholder

    res.json({
      enabled: false,
      lastSync: null,
      ...config,
    });
  } catch (error) {
    console.error('[API] Get status failed:', error);
    res.status(500).json({
      error: 'Failed to get sync status',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router;
export { router as calendarSyncRouter };
