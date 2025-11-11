/**
 * Hybrid Venue Service - Uses both localStorage and Firestore
 * - localStorage: Fast offline access, fallback
 * - Firestore: Persistent cloud storage, cross-device sync
 */

import { FirestoreVenueService } from './firestoreVenueService';
import { venueStore } from '../shared/venueStore';
import { isFirebaseConfigured } from '../lib/firebase';
import type { Venue } from '../types/venue';

export class HybridVenueService {
  private static MIGRATED_KEY = 'firestore-venues-migrated';
  private static unsubscribe: (() => void) | null = null;

  /**
   * Initialize hybrid service for a user
   * Migrates localStorage data to Firestore if needed
   */
  static async initialize(userId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      // Check if already migrated
      const migrated = localStorage.getItem(this.MIGRATED_KEY);
      if (!migrated) {
        // Migrate existing localStorage data to Firestore
        const migratedCount = await FirestoreVenueService.migrateFromLocalStorage(userId);
        if (migratedCount > 0) {
          localStorage.setItem(this.MIGRATED_KEY, 'true');
        }
      }

      // Sync from Firestore to localStorage
      await this.syncFromCloud(userId);

      // Setup real-time sync
      this.setupRealtimeSync(userId);
    } catch (error) {
      console.error('❌ Failed to initialize hybrid venue service:', error);
    }
  }

  /**
   * Save a venue (both localStorage and Firestore)
   */
  static async saveVenue(venue: Venue, userId: string): Promise<void> {
    // Save to localStorage first (immediate)
    venueStore.add(venue);

    // Try to save to Firestore
    if (isFirebaseConfigured()) {
      try {
        await FirestoreVenueService.saveVenue(venue, userId);
      } catch (error) {
        console.warn('⚠️ Failed to save venue to cloud, saved locally:', error);
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
    // Update localStorage first
    venueStore.update(venueId, updates);

    // Try to update Firestore
    if (isFirebaseConfigured()) {
      try {
        const venue = venueStore.getById(venueId);
        if (venue) {
          await FirestoreVenueService.saveVenue(venue, userId);
        }
      } catch (error) {
        console.warn('⚠️ Failed to update venue in cloud, updated locally:', error);
      }
    }
  }

  /**
   * Delete a venue
   */
  static async deleteVenue(venueId: string, userId: string): Promise<void> {
    // Delete from localStorage first
    venueStore.delete(venueId);

    // Try to delete from Firestore
    if (isFirebaseConfigured()) {
      try {
        await FirestoreVenueService.deleteVenue(venueId, userId);
      } catch (error) {
        console.warn('⚠️ Failed to delete venue from cloud, deleted locally:', error);
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
  private static async syncFromCloud(userId: string): Promise<void> {
    try {
      const cloudVenues = await FirestoreVenueService.getUserVenues(userId);
      if (cloudVenues.length > 0) {
        venueStore.setAll(cloudVenues);
        console.log(`✅ Synced ${cloudVenues.length} venues from cloud`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to sync venues from cloud:', error);
    }
  }

  /**
   * Setup real-time sync listener
   */
  private static setupRealtimeSync(userId: string): void {
    // Clean up previous listener
    if (this.unsubscribe) {
      this.unsubscribe();
    }

    try {
      this.unsubscribe = FirestoreVenueService.listenToUserVenues(userId, (venues) => {
        venueStore.setAll(venues);
        console.log(`🔄 Real-time sync: ${venues.length} venues updated`);
      });
    } catch (error) {
      console.warn('⚠️ Failed to setup real-time sync for venues:', error);
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
