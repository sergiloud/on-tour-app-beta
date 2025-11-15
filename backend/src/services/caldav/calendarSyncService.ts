/**
 * Calendar Sync Service
 * 
 * Manages synchronization between On Tour events and CalDAV calendars
 * Handles conflict resolution and change tracking
 */

import { firestore as db } from '../../config/firebase';
import { CalDAVClient, OnTourEvent } from './caldavClient';

// Helper to ensure db is initialized
function getDb() {
  if (!db) {
    throw new Error('Firestore is not initialized');
  }
  return db;
}

export interface SyncConfig {
  userId: string;
  calendarUrl: string;
  direction: 'import' | 'export' | 'bidirectional';
  enabled: boolean;
  lastSync?: Date;
  credentials: {
    serverUrl: string;
    username: string;
    encryptedPassword: string;
  };
}

export interface SyncResult {
  success: boolean;
  imported: number;
  exported: number;
  conflicts: number;
  errors: string[];
}

export class CalendarSyncService {
  /**
   * Sync a user's calendar
   */
  static async syncUserCalendar(userId: string): Promise<SyncResult> {
    const result: SyncResult = {
      success: false,
      imported: 0,
      exported: 0,
      conflicts: 0,
      errors: [],
    };

    try {
      // Get user's sync configuration
      const config = await this.getUserSyncConfig(userId);
      if (!config || !config.enabled) {
        return result;
      }

      // Create CalDAV client
      const client = new CalDAVClient();
      const password = this.decryptPassword(config.credentials.encryptedPassword);

      await client.connect({
        serverUrl: config.credentials.serverUrl,
        username: config.credentials.username,
        password,
      });

      // Perform sync based on direction
      if (config.direction === 'import' || config.direction === 'bidirectional') {
        const imported = await this.importFromCalendar(client, config, userId);
        result.imported = imported;
      }

      if (config.direction === 'export' || config.direction === 'bidirectional') {
        const exported = await this.exportToCalendar(client, config, userId);
        result.exported = exported;
      }

      // Update last sync timestamp
      await this.updateLastSync(userId, new Date());

      client.disconnect();
      result.success = true;
    } catch (error) {
      console.error('[CalendarSync] Sync failed:', error);
      result.errors.push(error instanceof Error ? error.message : 'Unknown error');
    }

    return result;
  }

  /**
   * Import events from CalDAV calendar to On Tour
   */
  private static async importFromCalendar(
    client: CalDAVClient,
    config: SyncConfig,
    userId: string
  ): Promise<number> {
    let imported = 0;

    try {
      // Get remote events
      const remoteEvents = await client.getEvents(config.calendarUrl);

      for (const remoteEvent of remoteEvents) {
        if (!remoteEvent.data) continue;

        const parsedEvent = client.parseICSToEvent(remoteEvent.data);
        if (!parsedEvent) continue;

        // Check if event already exists in Firestore
        const existingEvent = await this.findEventByUid(userId, parsedEvent.uid!);

        if (existingEvent) {
          // Update if remote is newer
          if (await this.shouldUpdateLocal(existingEvent, parsedEvent)) {
            await this.updateLocalEvent(userId, existingEvent.id, parsedEvent);
            imported++;
          }
        } else {
          // Create new event
          await this.createLocalEvent(userId, parsedEvent);
          imported++;
        }
      }
    } catch (error) {
      console.error('[CalendarSync] Import failed:', error);
      throw error;
    }

    return imported;
  }

  /**
   * Export On Tour events to CalDAV calendar
   */
  private static async exportToCalendar(
    client: CalDAVClient,
    config: SyncConfig,
    userId: string
  ): Promise<number> {
    let exported = 0;

    try {
      // Get local events that need to be synced
      const localChanges = await this.getLocalChanges(userId, config.lastSync);

      for (const change of localChanges) {
        try {
          if (change.type === 'created' || change.type === 'updated') {
            const event = change.event as OnTourEvent;
            
            if (event.uid) {
              // Update existing event
              await client.updateEvent(config.calendarUrl, event);
            } else {
              // Create new event
              const uid = await client.createEvent(config.calendarUrl, event);
              // Save UID back to local event
              await this.updateEventUid(userId, change.eventId, uid);
            }
            exported++;
          } else if (change.type === 'deleted') {
            if (change.event.uid) {
              await client.deleteEvent(config.calendarUrl, change.event.uid);
              exported++;
            }
          }
        } catch (error) {
          console.error(`[CalendarSync] Failed to export event ${change.eventId}:`, error);
          // Continue with other events
        }
      }
    } catch (error) {
      console.error('[CalendarSync] Export failed:', error);
      throw error;
    }

    return exported;
  }

  /**
   * Get user's sync configuration from Firestore
   */
  private static async getUserSyncConfig(userId: string): Promise<SyncConfig | null> {
    try {
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      const doc = await getDb().collection('users').doc(userId).get();
      const data = doc.data();
      
      if (!data || !data.calendarSync) {
        return null;
      }

      return data.calendarSync as SyncConfig;
    } catch (error) {
      console.error('[CalendarSync] Failed to get config:', error);
      return null;
    }
  }

  /**
   * Find event by UID in Firestore
   */
  private static async findEventByUid(userId: string, uid: string): Promise<any | null> {
    try {
      if (!db) {
        throw new Error('Firestore is not initialized');
      }
      const snapshot = await db
        .collection('users')
        .doc(userId)
        .collection('calendarEvents')
        .where('uid', '==', uid)
        .limit(1)
        .get();

      if (snapshot.empty) {
        return null;
      }

      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      console.error('[CalendarSync] Failed to find event by UID:', error);
      return null;
    }
  }

  /**
   * Create local event in Firestore
   */
  private static async createLocalEvent(userId: string, event: OnTourEvent): Promise<string> {
    const eventData = {
      ...event,
      syncedFromCalendar: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const docRef = await getDb()
      .collection('users')
      .doc(userId)
      .collection('calendarEvents')
      .add(eventData);

    return docRef.id;
  }

  /**
   * Update local event in Firestore
   */
  private static async updateLocalEvent(
    userId: string,
    eventId: string,
    event: OnTourEvent
  ): Promise<void> {
    await getDb()
      .collection('users')
      .doc(userId)
      .collection('calendarEvents')
      .doc(eventId)
      .update({
        ...event,
        syncedFromCalendar: true,
        updatedAt: new Date(),
      });
  }

  /**
   * Update event UID after creation
   */
  private static async updateEventUid(userId: string, eventId: string, uid: string): Promise<void> {
    await getDb()
      .collection('users')
      .doc(userId)
      .collection('calendarEvents')
      .doc(eventId)
      .update({ uid });
  }

  /**
   * Get local changes since last sync
   */
  private static async getLocalChanges(
    userId: string,
    lastSync?: Date
  ): Promise<Array<{ type: 'created' | 'updated' | 'deleted'; eventId: string; event: any }>> {
    const changes: Array<{ type: 'created' | 'updated' | 'deleted'; eventId: string; event: any }> = [];

    try {
      let query = getDb().collection('users').doc(userId).collection('calendarEvents');

      if (lastSync) {
        query = query.where('updatedAt', '>', lastSync) as any;
      }

      const snapshot = await query.get();

      snapshot.forEach((doc) => {
        const data = doc.data();
        const type = data.createdAt?.toDate() > (lastSync || new Date(0)) ? 'created' : 'updated';
        
        changes.push({
          type,
          eventId: doc.id,
          event: data,
        });
      });

      // TODO: Track deleted events in a separate collection
    } catch (error) {
      console.error('[CalendarSync] Failed to get local changes:', error);
    }

    return changes;
  }

  /**
   * Determine if local event should be updated
   */
  private static async shouldUpdateLocal(localEvent: any, remoteEvent: OnTourEvent): Promise<boolean> {
    // Simple last-write-wins strategy
    // In production, you might want more sophisticated conflict resolution
    const localUpdated = localEvent.updatedAt?.toDate() || new Date(0);
    const remoteUpdated = remoteEvent.start; // Use start date as proxy for modified date

    return remoteUpdated > localUpdated;
  }

  /**
   * Update last sync timestamp
   */
  private static async updateLastSync(userId: string, timestamp: Date): Promise<void> {
    await getDb().collection('users').doc(userId).update({
      'calendarSync.lastSync': timestamp,
    });
  }

  /**
   * Encrypt password for storage
   */
  static encryptPassword(password: string): string {
    // TODO: Implement proper encryption with crypto
    // For prototype, using base64 (NOT SECURE - replace in production)
    return Buffer.from(password).toString('base64');
  }

  /**
   * Decrypt password from storage
   */
  private static decryptPassword(encryptedPassword: string): string {
    // TODO: Implement proper decryption
    // For prototype, using base64 (NOT SECURE - replace in production)
    return Buffer.from(encryptedPassword, 'base64').toString('utf-8');
  }

  /**
   * Save user's sync configuration
   */
  static async saveSyncConfig(userId: string, config: Partial<SyncConfig>): Promise<void> {
    await getDb().collection('users').doc(userId).update({
      calendarSync: {
        ...config,
        userId,
      },
    });
  }

  /**
   * Disable sync for a user
   */
  static async disableSync(userId: string): Promise<void> {
    await getDb().collection('users').doc(userId).update({
      'calendarSync.enabled': false,
    });
  }
}
