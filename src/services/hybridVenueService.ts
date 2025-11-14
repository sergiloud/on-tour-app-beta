/**
 * Hybrid Venue Service - Uses both localStorage and Firestore
 * - localStorage: Fast offline access, fallback
 * - Firestore: Persistent cloud storage, cross-device sync
 */

import { FirestoreVenueService } from './firestoreVenueService';
import { venueStore } from '../shared/venueStore';
import { isFirebaseConfigured } from '../lib/firebase';
import { getCurrentOrgId } from '../lib/tenants';
import { logger } from '../lib/logger';
import type { Venue } from '../types/venue';

export class HybridVenueService {
  private static MIGRATED_KEY = 'firestore-venues-migrated';
  private static unsubscribe: (() => void) | null = null;

  /**
   * Initialize hybrid service for a user
   * Migrates localStorage data to Firestore if needed
   */
  static async initialize(userId: string, orgId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    if (!orgId) {
      logger.info('[HybridVenueService] No orgId provided, skipping cloud sync', { userId });
      return;
    }

    try {
      // Check if already migrated
      const migrationKey = `${this.MIGRATED_KEY}-${userId}-${orgId}`;
      const migrated = localStorage.getItem(migrationKey);
      if (!migrated) {
        // Migrate existing localStorage data to Firestore
        const migratedCount = await FirestoreVenueService.migrateFromLocalStorage(userId, orgId);
        if (migratedCount > 0) {
          localStorage.setItem(migrationKey, 'true');
        }
      }

      // Sync from Firestore to localStorage
      await this.syncFromCloud(userId, orgId);

      // Setup real-time sync
      this.setupRealtimeSync(userId, orgId);
    } catch (error) {
      logger.error('[HybridVenueService] Failed to initialize hybrid venue service', error as Error, { userId });
    }
  }

  /**
   * Save a venue (both localStorage and Firestore)
   */
  static async saveVenue(venue: Venue, userId: string): Promise<void> {
    const orgId = getCurrentOrgId();
    
    // Save to localStorage first (immediate)
    venueStore.add(venue);

    // Try to save to Firestore
    if (isFirebaseConfigured() && orgId) {
      try {
        await FirestoreVenueService.saveVenue(venue, userId, orgId);
      } catch (error) {
        logger.warn('[HybridVenueService] Failed to save venue to cloud, saved locally', { userId, venueId: venue.id, error: String(error) });
      }
    }
  }

  /**
   * Update a venue
   */
  static async updateVenue(
    venueId: string,
    updates: Partial<Venue>,
    userId: string
  ): Promise<void> {
    const orgId = getCurrentOrgId();
    
    // Update localStorage first
    venueStore.update(venueId, updates);

    // Try to update Firestore
    if (isFirebaseConfigured() && orgId) {
      try {
        const venue = venueStore.getById(venueId);
        if (venue) {
          await FirestoreVenueService.saveVenue(venue, userId, orgId);
        }
      } catch (error) {
        logger.warn('[HybridVenueService] Failed to update venue in cloud, updated locally', { userId, venueId, error: String(error) });
      }
    }
  }

  /**
   * Delete a venue
   */
  static async deleteVenue(venueId: string, userId: string): Promise<void> {
    const orgId = getCurrentOrgId();
    
    // Delete from localStorage first
    venueStore.delete(venueId);

    // Try to delete from Firestore
    if (isFirebaseConfigured() && orgId) {
      try {
        await FirestoreVenueService.deleteVenue(venueId, userId, orgId);
      } catch (error) {
        logger.warn('[HybridVenueService] Failed to delete venue from cloud, deleted locally', { userId, venueId, error: String(error) });
      }
    }
  }

  /**
   * Get all venues (from localStorage)
   */
  static getVenues(): Venue[] {
    return venueStore.getAll();
  }

  /**
   * Get venue by ID (from localStorage)
   */
  static getVenueById(venueId: string): Venue | undefined {
    return venueStore.getById(venueId);
  }

  /**
   * Sync venues from Firestore to localStorage
   */
  private static async syncFromCloud(userId: string, orgId: string): Promise<void> {
    try {
      const cloudVenues = await FirestoreVenueService.getUserVenues(userId, orgId);
      if (cloudVenues.length > 0) {
        venueStore.setAll(cloudVenues);
        logger.info('[HybridVenueService] Synced venues from cloud', { userId, count: cloudVenues.length });
      }
    } catch (error) {
      logger.warn('[HybridVenueService] Failed to sync venues from cloud', { userId, error: String(error) });
    }
  }

  /**
   * Setup real-time sync listener
   */
  private static setupRealtimeSync(userId: string, orgId: string): void {
    // Clean up previous listener
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    try {
      this.unsubscribe = FirestoreVenueService.listenToUserVenues(userId, orgId, (venues: Venue[]) => {
        venueStore.setAll(venues);
        logger.info('[HybridVenueService] Real-time sync updated', { userId, count: venues.length });
      });
    } catch (error) {
      logger.warn('[HybridVenueService] Failed to setup real-time sync for venues', { userId, error: String(error) });
    }
  }

  /**
   * Cleanup listeners
   */
  static cleanup(): void {
    if (this.unsubscribe) {
      this.unsubscribe();
      this.unsubscribe = null;
    }
  }
}
