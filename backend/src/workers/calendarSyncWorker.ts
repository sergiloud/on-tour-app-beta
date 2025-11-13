/**
 * Calendar Sync Background Worker
 * 
 * Automatically syncs calendars for all users with sync enabled
 * Runs every 5 minutes via cron job
 */

import cron from 'node-cron';
import { firestore as db } from '../config/firebase.js';
import { CalendarSyncService } from '../services/caldav/calendarSyncService.js';
import { logger } from '../utils/logger.js';

const syncService = new CalendarSyncService();

/**
 * Sync all users' calendars that have sync enabled
 */
async function syncAllEnabledCalendars() {
  try {
    logger.info('🔄 Starting automatic calendar sync for all users...');

    if (!db) {
      logger.warn('⚠️  Firestore not initialized - skipping calendar sync');
      return;
    }

    // Get all users with calendar sync enabled
    const usersSnapshot = await db.collection('users').get();
    const syncPromises: Promise<void>[] = [];
    let syncCount = 0;
    let errorCount = 0;

    for (const userDoc of usersSnapshot.docs) {
      const userId = userDoc.id;
      
      // Check if user has sync enabled
      const configDoc = await db
        .collection('users')
        .doc(userId)
        .collection('calendarSync')
        .doc('config')
        .get();

      const config = configDoc.data();
      
      if (config?.enabled) {
        syncCount++;
        
        // Queue sync for this user (don't await - run in parallel)
        const syncPromise = CalendarSyncService
          .syncUserCalendar(userId)
          .then((result: any) => {
            logger.info(`✅ Synced calendar for user ${userId}:`, {
              imported: result.imported,
              exported: result.exported,
              errors: result.errors,
            });
          })
          .catch((error: any) => {
            errorCount++;
            logger.error(`❌ Failed to sync calendar for user ${userId}:`, error);
          });

        syncPromises.push(syncPromise);
      }
    }

    // Wait for all syncs to complete
    await Promise.all(syncPromises);

    logger.info(`✅ Calendar sync completed: ${syncCount} users synced, ${errorCount} errors`);
  } catch (error) {
    logger.error('❌ Failed to sync calendars:', error);
  }
}

/**
 * Start the calendar sync worker
 * Runs every 5 minutes
 */
export function startCalendarSyncWorker() {
  // Run every 5 minutes
  cron.schedule('*/5 * * * *', async () => {
    logger.info('📅 Calendar sync worker triggered');
    await syncAllEnabledCalendars();
  });

  logger.info('🚀 Calendar sync worker started (runs every 5 minutes)');

  // Optional: Run once on startup (after a 30-second delay to let server settle)
  setTimeout(async () => {
    logger.info('📅 Running initial calendar sync...');
    await syncAllEnabledCalendars();
  }, 30000);
}

/**
 * Manual trigger for calendar sync (useful for testing)
 */
export async function triggerManualSync() {
  logger.info('🔧 Manual calendar sync triggered');
  await syncAllEnabledCalendars();
}
