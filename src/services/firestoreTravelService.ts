/**
 * Firestore Travel Service - Cloud sync for itineraries
 * Handles flights, hotels, ground transport events
 * Data isolation: users/{userId}/itineraries/{itineraryId}
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
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';

export interface TravelEvent {
  id: string;
  type: 'flight' | 'hotel' | 'ground_transport' | 'other';
  title: string;
  startDate: string;
  endDate?: string;
  location?: string;
  notes?: string;
  confirmationNumber?: string;
  cost?: number;
  currency?: string;
}

export interface TravelItinerary {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  events: TravelEvent[];
  showIds?: string[]; // Associated shows
  createdAt: string;
  updatedAt: string;
}

export class FirestoreTravelService {
  /**
   * Save itinerary to Firestore
   */
  static async saveItinerary(itinerary: TravelItinerary, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const itineraryRef = doc(db, `users/${userId}/itineraries/${itinerary.id}`);
    const itineraryData = {
      ...itinerary,
      updatedAt: Timestamp.now()
    };

    await setDoc(itineraryRef, itineraryData);
  }

  /**
   * Get single itinerary by ID
   */
  static async getItinerary(itineraryId: string, userId: string): Promise<TravelItinerary | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const itineraryRef = doc(db, `users/${userId}/itineraries/${itineraryId}`);
    const itinerarySnap = await getDoc(itineraryRef);

    if (!itinerarySnap.exists()) {
      return null;
    }

    const data = itinerarySnap.data();
    return {
      ...data,
      id: itinerarySnap.id,
      startDate: data.startDate?.toDate?.().toISOString() || data.startDate,
      endDate: data.endDate?.toDate?.().toISOString() || data.endDate,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
    } as TravelItinerary;
  }

  /**
   * Get all itineraries for a user
   */
  static async getUserItineraries(userId: string): Promise<TravelItinerary[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const itinerariesRef = collection(db, `users/${userId}/itineraries`);
    const q = query(itinerariesRef, orderBy('startDate', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        startDate: data.startDate?.toDate?.().toISOString() || data.startDate,
        endDate: data.endDate?.toDate?.().toISOString() || data.endDate,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
      } as TravelItinerary;
    });
  }

  /**
   * Delete itinerary from Firestore
   */
  static async deleteItinerary(itineraryId: string, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const itineraryRef = doc(db, `users/${userId}/itineraries/${itineraryId}`);
    await deleteDoc(itineraryRef);
  }

  /**
   * Batch save multiple itineraries (for migration/import)
   */
  static async saveItineraries(itineraries: TravelItinerary[], userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const promises = itineraries.map(itinerary =>
      this.saveItinerary(itinerary, userId)
    );

    await Promise.all(promises);
  }

  /**
   * Subscribe to real-time updates for user's itineraries
   */
  static subscribeToUserItineraries(
    userId: string,
    callback: (itineraries: TravelItinerary[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const itinerariesRef = collection(db, `users/${userId}/itineraries`);
    const q = query(itinerariesRef, orderBy('startDate', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const itineraries = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          startDate: data.startDate?.toDate?.().toISOString() || data.startDate,
          endDate: data.endDate?.toDate?.().toISOString() || data.endDate,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
        } as TravelItinerary;
      });

      callback(itineraries);
    });
  }

  /**
   * Migrate localStorage itineraries to Firestore
   * Only runs once per user (idempotent)
   */
  static async migrateFromLocalStorage(userId: string): Promise<number> {
    if (!db) {
      return 0;
    }

    try {
      // Check if user already has itineraries in Firestore
      const existing = await this.getUserItineraries(userId);
      if (existing.length > 0) {
        return 0; // Already migrated
      }

      // Load itineraries from localStorage
      const stored = localStorage.getItem('travel-itineraries');
      if (!stored) {
        return 0;
      }

      const itineraries: TravelItinerary[] = JSON.parse(stored);
      
      // Migrate itineraries to Firestore
      await this.saveItineraries(itineraries, userId);

      return itineraries.length;
    } catch (error) {
      console.error('❌ Failed to migrate itineraries:', error);
      return 0;
    }
  }
}
