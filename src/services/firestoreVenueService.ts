/**
 * Firestore Venue Service - Cloud sync for venues
 * Handles CRUD operations and real-time synchronization
 * Data isolation: users/{userId}/venues/{venueId}
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Venue } from '../types/venue';

export class FirestoreVenueService {
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
   * Save venue to Firestore
   */
  static async saveVenue(venue: Venue, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const venueRef = doc(db, `users/${userId}/organizations/${orgId}/venues/${venue.id}`);
    const venueData = this.removeUndefined({
      ...venue,
      updatedAt: Timestamp.now()
    });

    await setDoc(venueRef, venueData, { merge: true });
  }

  /**
   * Get single venue by ID
   */
  static async getVenue(venueId: string, userId: string, orgId: string): Promise<Venue | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const venueRef = doc(db, `users/${userId}/organizations/${orgId}/venues/${venueId}`);
    const venueSnap = await getDoc(venueRef);

    if (!venueSnap.exists()) {
      return null;
    }

    const data = venueSnap.data();
    return {
      id: venueSnap.id,
      name: data.name || '',
      city: data.city,
      country: data.country,
      address: data.address,
      capacity: data.capacity,
      notes: data.notes,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
    } as Venue;
  }

  /**
   * Get all venues for a user
   */
  static async getUserVenues(userId: string, orgId: string): Promise<Venue[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const venuesRef = collection(db, `users/${userId}/organizations/${orgId}/venues`);
    const q = query(venuesRef, orderBy('name', 'asc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || '',
        city: data.city,
        country: data.country,
        address: data.address,
        capacity: data.capacity,
        notes: data.notes,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
      } as Venue;
    });
  }

  /**
   * Delete venue from Firestore
   */
  static async deleteVenue(venueId: string, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const venueRef = doc(db, `users/${userId}/organizations/${orgId}/venues/${venueId}`);
    await deleteDoc(venueRef);
  }

  /**
   * Listen to real-time venue updates
   */
  static listenToUserVenues(
    userId: string,
    orgId: string,
    callback: (venues: Venue[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const venuesRef = collection(db, `users/${userId}/organizations/${orgId}/venues`);
    const q = query(venuesRef, orderBy('name', 'asc'));

    return onSnapshot(q, (snapshot) => {
      const venues = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          name: data.name || '',
          city: data.city,
          country: data.country,
          address: data.address,
          capacity: data.capacity,
          notes: data.notes,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
        } as Venue;
      });

      callback(venues);
    });
  }

  /**
   * Batch save venues - Optimized with batch writes
   */
  static async saveVenues(venues: Venue[], userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Firestore batches have a limit of 500 operations
    const BATCH_SIZE = 500;
    const chunks = [];
    
    for (let i = 0; i < venues.length; i += BATCH_SIZE) {
      chunks.push(venues.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      
      for (const venue of chunk) {
        const venueRef = doc(db, `users/${userId}/organizations/${orgId}/venues/${venue.id}`);
        const venueData = this.removeUndefined({
          ...venue,
          updatedAt: Timestamp.now()
        });
        
        batch.set(venueRef, venueData, { merge: true });
      }
      
      await batch.commit();
    }
    
    console.log(`✅ Batch saved ${venues.length} venues`);
  }

  /**
   * Migrate venues from localStorage to Firestore
   */
  static async migrateFromLocalStorage(userId: string, orgId: string): Promise<number> {
    try {
      const stored = localStorage.getItem('on-tour-venues');
      if (!stored) return 0;

      const venues = JSON.parse(stored) as Venue[];
      
      // Check if already migrated
      const existing = await this.getUserVenues(userId, orgId);
      if (existing.length > 0) {
        console.log('Venues already migrated');
        return 0;
      }

      // Use batch save for better performance
      await this.saveVenues(venues, userId, orgId);

      console.log(`✅ Migrated ${venues.length} venues to Firestore`);
      return venues.length;
    } catch (error) {
      console.error('Migration failed:', error);
      return 0;
    }
  }
}
