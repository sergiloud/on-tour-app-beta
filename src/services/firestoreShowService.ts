import { 
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
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Show } from '../lib/shows';
import { deduplicateFirestoreQuery } from '../lib/requestDeduplication';

export class FirestoreShowService {
  private static COLLECTION = 'shows';

  /**
   * Save show to Firestore
   */
  static async saveShow(show: Show, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const showData = {
      ...show,
      userId,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now() // Always use current time for creation
    };

    await setDoc(doc(db, this.COLLECTION, show.id), showData);
  }

  /**
   * Get all shows for a user - con deduplication
   */
  static async getUserShows(userId: string): Promise<Show[]> {
    // ✅ Deduplica requests cuando múltiples componentes piden shows simultáneamente
    return deduplicateFirestoreQuery('shows', userId, async () => {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const q = query(
        collection(db, this.COLLECTION),
        where('userId', '==', userId),
        orderBy('date', 'desc')
      );

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
  static async getShow(showId: string, userId: string): Promise<Show | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, this.COLLECTION, showId);
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
  static async updateShow(showId: string, updates: Partial<Show>, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, this.COLLECTION, showId);
    
    // Security: Check ownership first
    const existingDoc = await getDoc(docRef);
    if (!existingDoc.exists() || existingDoc.data().userId !== userId) {
      throw new Error('Show not found or access denied');
    }

    await updateDoc(docRef, {
      ...updates,
      updatedAt: Timestamp.now()
    });
  }

  /**
   * Delete a show
   */
  static async deleteShow(showId: string, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, this.COLLECTION, showId);
    
    // Security: Check ownership first
    const existingDoc = await getDoc(docRef);
    if (!existingDoc.exists() || existingDoc.data().userId !== userId) {
      throw new Error('Show not found or access denied');
    }

    await deleteDoc(docRef);
  }

  /**
   * Bulk save shows (for migration/seeding)
   */
  static async bulkSaveShows(shows: Show[], userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const promises = shows.map(show => this.saveShow(show, userId));
    await Promise.all(promises);
  }

  /**
   * Subscribe to real-time updates for user shows
   */
  static subscribeToUserShows(userId: string, callback: (shows: Show[]) => void): () => void {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const q = query(
      collection(db, this.COLLECTION),
      where('userId', '==', userId),
      orderBy('date', 'desc')
    );

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
  static async migrateFromLocalStorage(userId: string): Promise<number> {
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
      const existingShows = await this.getUserShows(userId);
      if (existingShows.length > 0) {
        console.log('User already has shows in Firestore, skipping migration');
        return 0;
      }

      // Migrate shows to Firestore
      await this.bulkSaveShows(shows, userId);
      
      console.log(`✅ Migrated ${shows.length} shows to Firestore`);
      return shows.length;
    } catch (error) {
      console.error('❌ Failed to migrate shows:', error);
      return 0;
    }
  }
}