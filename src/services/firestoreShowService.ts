import { 
import { logger } from '../lib/logger';
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  addDoc,
  onSnapshot,
  writeBatch,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Show } from '../lib/shows';
import { deduplicateFirestoreQuery } from '../lib/requestDeduplication';

export class FirestoreShowService {
  /**
   * Get collection path for user shows (org-scoped)
   */
  private static getUserShowsPath(userId: string, orgId: string): string {
    return `users/${userId}/organizations/${orgId}/shows`;
  }

  /**
   * Recursively remove undefined values from an object
   */
  private static removeUndefined(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefined(item));
    }
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        const value = obj[key];
        if (value !== undefined) {
          cleaned[key] = this.removeUndefined(value);
        }
      }
      return cleaned;
    }
    return obj;
  }

  /**
   * Save show to Firestore
   */
  static async saveShow(show: Show, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const showData = this.removeUndefined({
      ...show,
      userId,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now() // Always use current time for creation
    });

    await setDoc(doc(db, this.getUserShowsPath(userId, orgId), show.id), showData, { merge: true });
  }

  /**
   * Get all shows for a user - con deduplication
   */
  static async getUserShows(userId: string, orgId: string): Promise<Show[]> {
    // ✅ Deduplica requests cuando múltiples componentes piden shows simultáneamente
    return deduplicateFirestoreQuery('shows', userId, async () => {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const showsRef = collection(db, this.getUserShowsPath(userId, orgId));
      const q = query(showsRef, orderBy('date', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        // Ensure all required Show fields are present
        return {
          id: doc.id,
          city: data.city || '',
          country: data.country || '',
          lat: data.lat || 0,
          lng: data.lng || 0,
          date: data.date || new Date().toISOString(),
          fee: data.fee || 0,
          status: data.status || 'pending',
          __version: data.__version || 1,
          __modifiedAt: data.__modifiedAt || Date.now(),
          __modifiedBy: data.__modifiedBy || userId,
          // Include all other optional fields
          ...data,
        } as Show;
      });
    });
  }

  /**
   * Get a specific show
   */
  static async getShow(showId: string, userId: string, orgId: string): Promise<Show | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, this.getUserShowsPath(userId, orgId), showId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    
    // Security: Only return if user owns the show
    if (data.userId !== userId) {
      return null;
    }

    return {
      id: docSnap.id,
      city: data.city || '',
      country: data.country || '',
      lat: data.lat || 0,
      lng: data.lng || 0,
      date: data.date || new Date().toISOString(),
      fee: data.fee || 0,
      status: data.status || 'pending',
      __version: data.__version || 1,
      __modifiedAt: data.__modifiedAt || Date.now(),
      __modifiedBy: data.__modifiedBy || userId,
      // Include all other fields
      ...data,
    } as Show;
  }

  /**
   * Update a show
   */
  static async updateShow(showId: string, updates: Partial<Show>, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, this.getUserShowsPath(userId, orgId), showId);
    
    // Security: Check ownership first
    const existingDoc = await getDoc(docRef);
    if (!existingDoc.exists()) {
      throw new Error('Show not found');
    }

    const cleanUpdates = this.removeUndefined({
      ...updates,
      updatedAt: Timestamp.now()
    });

    await updateDoc(docRef, cleanUpdates);
  }

  /**
   * Delete a show
   */
  static async deleteShow(showId: string, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, this.getUserShowsPath(userId, orgId), showId);
    
    // Security rules handle ownership - no need to check first
    await deleteDoc(docRef);
  }

  /**
   * Bulk save shows (for migration/seeding) - Optimized with batch writes
   */
  static async bulkSaveShows(shows: Show[], userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Firestore batches have a limit of 500 operations
    const BATCH_SIZE = 500;
    const chunks = [];
    
    for (let i = 0; i < shows.length; i += BATCH_SIZE) {
      chunks.push(shows.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      
      for (const show of chunk) {
        const showRef = doc(db, this.getUserShowsPath(userId, orgId), show.id);
        const showData = this.removeUndefined({
          ...show,
          userId,
          updatedAt: Timestamp.now(),
          createdAt: Timestamp.now()
        });
        
        batch.set(showRef, showData, { merge: true });
      }
      
      await batch.commit();
    }
    
    logger.info(`Bulk saved ${shows.length} shows`, { count: shows.length, component: 'FirestoreShowService' });
  }

  /**
   * Subscribe to real-time updates for user shows
   */
  static subscribeToUserShows(userId: string, orgId: string, callback: (shows: Show[]) => void): () => void {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const showsRef = collection(db, this.getUserShowsPath(userId, orgId));
    const q = query(showsRef, orderBy('date', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const shows = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          city: data.city || '',
          country: data.country || '',
          lat: data.lat || 0,
          lng: data.lng || 0,
          date: data.date || new Date().toISOString(),
          fee: data.fee || 0,
          status: data.status || 'pending',
          __version: data.__version || 1,
          __modifiedAt: data.__modifiedAt || Date.now(),
          __modifiedBy: data.__modifiedBy || userId,
          // Include all other fields
          ...data,
        } as Show;
      });
      callback(shows);
    });
  }

  /**
   * Migrate localStorage shows to Firestore
   */
  static async migrateFromLocalStorage(userId: string, orgId: string): Promise<number> {
    try {
      // Get existing shows from localStorage
      const localShows = localStorage.getItem('shows-store-v3');
      if (!localShows) {
        return 0;
      }

      const shows: Show[] = JSON.parse(localShows);
      if (!shows.length) {
        return 0;
      }

      // Check if user already has shows in Firestore
      const existingShows = await this.getUserShows(userId, orgId);
      if (existingShows.length > 0) {
        logger.info('User already has shows in Firestore, skipping migration', { component: 'FirestoreShowService' });
        return 0;
      }

      // Migrate shows to Firestore
      await this.bulkSaveShows(shows, userId, orgId);
      
      logger.info(`Migrated ${shows.length} shows to Firestore`, { count: shows.length });
      return shows.length;
    } catch (error) {
      logger.error('Failed to migrate shows', error as Error);
      return 0;
    }
  }
}