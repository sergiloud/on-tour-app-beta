import { Show } from '../lib/shows';
import { FirestoreShowService } from './firestoreShowService';
import { isFirebaseConfigured } from '../lib/firebase';
import { getCurrentUserId } from '../lib/demoAuth';
import { getCurrentOrgId } from '../lib/tenants';
import { logger } from '../lib/logger';

/**
 * Hybrid Show Service - Uses both localStorage and Firestore
 * - localStorage: Fast local access, works offline
 * - Firestore: Persistent cloud storage, cross-device sync
 */
export class HybridShowService {
  private static STORAGE_KEY = 'shows-store-v3';
  private static MIGRATED_KEY = 'firestore-migrated';

  /**
   * Initialize the hybrid system for a user
   */
  static async initialize(userId: string, orgId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      logger.info('[HybridShowService] Firebase not configured, using localStorage only', { userId, orgId });
      return;
    }

    if (!orgId) {
      logger.info('[HybridShowService] No orgId provided, skipping cloud sync', { userId });
      return;
    }

    try {
      // Check if we've already migrated for this user+org
      const migrationKey = `${this.MIGRATED_KEY}-${userId}-${orgId}`;
      const alreadyMigrated = localStorage.getItem(migrationKey);
      
      if (!alreadyMigrated) {
        // Migrate existing localStorage data to Firestore
        const migrated = await FirestoreShowService.migrateFromLocalStorage(userId, orgId);
        if (migrated > 0) {
          logger.info('[HybridShowService] Migrated shows to cloud storage', { userId, orgId, count: migrated });
        }
        localStorage.setItem(migrationKey, 'true');
      }

      // Sync from Firestore to localStorage
      await this.syncFromCloud(userId, orgId);
      
      // Set up real-time sync
      this.setupRealtimeSync(userId, orgId);
      
      logger.info('[HybridShowService] Hybrid show service initialized', { userId, orgId });
    } catch (error) {
      logger.error('[HybridShowService] Failed to initialize hybrid service', error as Error, { userId, orgId });
    }
  }

  /**
   * Save a show (both localStorage and Firestore)
   */
  static async saveShow(show: Show): Promise<void> {
    const userId = getCurrentUserId();
    const orgId = getCurrentOrgId();
    
    // Always save to localStorage first (fast, works offline)
    this.saveToLocalStorage(show);
    
    // Try to save to Firestore only if orgId is available
    if (isFirebaseConfigured() && orgId) {
      try {
        await FirestoreShowService.saveShow(show, userId, orgId);
        logger.info('[HybridShowService] Show saved to cloud', { userId, orgId, showId: show.id });
      } catch (error) {
        logger.warn('[HybridShowService] Failed to save to cloud, saved locally', { userId, orgId, showId: show.id, error: String(error) });
      }
    }
  }

  /**
   * Get all shows for current user
   */
  static async getShows(): Promise<Show[]> {
    const userId = getCurrentUserId();
    const orgId = getCurrentOrgId();
    
    // Try Firestore first if available and orgId exists
    if (isFirebaseConfigured() && orgId) {
      try {
        const cloudShows = await FirestoreShowService.getUserShows(userId, orgId);
        if (cloudShows.length > 0) {
          // Update localStorage with cloud data
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cloudShows));
          return cloudShows;
        }
      } catch (error) {
        logger.warn('[HybridShowService] Failed to load from cloud, using local data', { userId, orgId, error: String(error) });
      }
    }

    // Fallback to localStorage
    return this.getFromLocalStorage();
  }

  /**
   * Delete a show
   */
  static async deleteShow(showId: string): Promise<void> {
    const userId = getCurrentUserId();
    const orgId = getCurrentOrgId();
    
    // Delete from localStorage
    const shows = this.getFromLocalStorage().filter(s => s.id !== showId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shows));
    
    // Delete from Firestore only if orgId exists
    if (isFirebaseConfigured() && orgId) {
      try {
        await FirestoreShowService.deleteShow(showId, userId, orgId);
        logger.info('[HybridShowService] Show deleted from cloud', { userId, orgId, showId });
      } catch (error) {
        logger.warn('[HybridShowService] Failed to delete from cloud, deleted locally', { userId, orgId, showId, error: String(error) });
      }
    }
  }

  /**
   * Get shows from localStorage
   */
  private static getFromLocalStorage(): Show[] {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  }

  /**
   * Save show to localStorage
   */
  private static saveToLocalStorage(show: Show): void {
    try {
      const shows = this.getFromLocalStorage();
      const existingIndex = shows.findIndex(s => s.id === show.id);
      
      if (existingIndex >= 0) {
        shows[existingIndex] = show;
      } else {
        shows.push(show);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shows));
    } catch (error) {
      logger.error('[HybridShowService] Failed to save to localStorage', error as Error, { showId: show.id });
    }
  }

  /**
   * Sync shows from Firestore to localStorage
   */
  private static async syncFromCloud(userId: string, orgId: string): Promise<void> {
    try {
      const cloudShows = await FirestoreShowService.getUserShows(userId, orgId);
      if (cloudShows.length > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cloudShows));
        logger.info('[HybridShowService] Synced shows from cloud', { userId, orgId, count: cloudShows.length });
      }
    } catch (error) {
      logger.warn('[HybridShowService] Failed to sync from cloud', { userId, orgId, error: String(error) });
    }
  }

  /**
   * Set up real-time synchronization
   */
  private static setupRealtimeSync(userId: string, orgId: string): void {
    try {
      FirestoreShowService.subscribeToUserShows(userId, orgId, (shows: Show[]) => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shows));
        logger.info('[HybridShowService] Real-time sync updated', { userId, orgId, count: shows.length });
        
        // Notify other parts of the app
        window.dispatchEvent(new CustomEvent('shows-updated', { detail: shows }));
      });
    } catch (error) {
      logger.warn('[HybridShowService] Failed to set up real-time sync', { userId, orgId, error: String(error) });
    }
  }

  /**
   * Get storage status for debugging
   */
  static getStatus(): { localStorage: number; cloudEnabled: boolean; userId: string } {
    return {
      localStorage: this.getFromLocalStorage().length,
      cloudEnabled: isFirebaseConfigured(),
      userId: getCurrentUserId()
    };
  }
}