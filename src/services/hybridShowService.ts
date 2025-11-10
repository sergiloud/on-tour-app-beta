import { Show } from '../lib/shows';
import { FirestoreShowService } from './firestoreShowService';
import { isFirebaseConfigured } from '../lib/firebase';
import { getCurrentUserId } from '../lib/demoAuth';

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
  static async initialize(userId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      console.log('🔥 Firebase not configured, using localStorage only');
      return;
    }

    try {
      // Check if we've already migrated for this user
      const migrationKey = `${this.MIGRATED_KEY}-${userId}`;
      const alreadyMigrated = localStorage.getItem(migrationKey);
      
      if (!alreadyMigrated) {
        // Migrate existing localStorage data to Firestore
        const migrated = await FirestoreShowService.migrateFromLocalStorage(userId);
        if (migrated > 0) {
          console.log(`✅ Migrated ${migrated} shows to cloud storage`);
        }
        localStorage.setItem(migrationKey, 'true');
      }

      // Sync from Firestore to localStorage
      await this.syncFromCloud(userId);
      
      // Set up real-time sync
      this.setupRealtimeSync(userId);
      
      console.log('✅ Hybrid show service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize hybrid service:', error);
    }
  }

  /**
   * Save a show (both localStorage and Firestore)
   */
  static async saveShow(show: Show): Promise<void> {
    const userId = getCurrentUserId();
    
    // Always save to localStorage first (fast, works offline)
    this.saveToLocalStorage(show);
    
    // Try to save to Firestore
    if (isFirebaseConfigured()) {
      try {
        await FirestoreShowService.saveShow(show, userId);
        console.log(`✅ Show ${show.id} saved to cloud`);
      } catch (error) {
        console.warn('⚠️ Failed to save to cloud, saved locally:', error);
      }
    }
  }

  /**
   * Get all shows for current user
   */
  static async getShows(): Promise<Show[]> {
    const userId = getCurrentUserId();
    
    // Try Firestore first if available
    if (isFirebaseConfigured()) {
      try {
        const cloudShows = await FirestoreShowService.getUserShows(userId);
        if (cloudShows.length > 0) {
          // Update localStorage with cloud data
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cloudShows));
          return cloudShows;
        }
      } catch (error) {
        console.warn('⚠️ Failed to load from cloud, using local data:', error);
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
    
    // Delete from localStorage
    const shows = this.getFromLocalStorage().filter(s => s.id !== showId);
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shows));
    
    // Delete from Firestore
    if (isFirebaseConfigured()) {
      try {
        await FirestoreShowService.deleteShow(showId, userId);
        console.log(`✅ Show ${showId} deleted from cloud`);
      } catch (error) {
        console.warn('⚠️ Failed to delete from cloud, deleted locally:', error);
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
      console.error('Failed to save to localStorage:', error);
    }
  }

  /**
   * Sync shows from Firestore to localStorage
   */
  private static async syncFromCloud(userId: string): Promise<void> {
    try {
      const cloudShows = await FirestoreShowService.getUserShows(userId);
      if (cloudShows.length > 0) {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cloudShows));
        console.log(`✅ Synced ${cloudShows.length} shows from cloud`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to sync from cloud:', error);
    }
  }

  /**
   * Set up real-time synchronization
   */
  private static setupRealtimeSync(userId: string): void {
    try {
      FirestoreShowService.subscribeToUserShows(userId, (shows) => {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(shows));
        console.log(`🔄 Real-time sync: ${shows.length} shows updated`);
        
        // Notify other parts of the app
        window.dispatchEvent(new CustomEvent('shows-updated', { detail: shows }));
      });
    } catch (error) {
      console.warn('⚠️ Failed to set up real-time sync:', error);
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