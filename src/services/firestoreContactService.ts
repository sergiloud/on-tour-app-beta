/**
 * Firestore Contact Service - Cloud sync for CRM contacts
 * Handles CRUD operations and real-time synchronization
 * Data isolation: contacts/{userId}/contacts/{contactId}
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  writeBatch,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Contact } from '../types/crm';
import { deduplicateFirestoreQuery } from '../lib/requestDeduplication';

export class FirestoreContactService {
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
   * Save contact to Firestore
   */
  static async saveContact(contact: Contact, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactRef = doc(db, `users/${userId}/organizations/${orgId}/contacts/${contact.id}`);
    const contactData = this.removeUndefined({
      ...contact,
      updatedAt: Timestamp.now()
    });

    await setDoc(contactRef, contactData, { merge: true });
  }

  /**
   * Get single contact by ID
   */
  static async getContact(contactId: string, userId: string, orgId: string): Promise<Contact | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactRef = doc(db, `users/${userId}/organizations/${orgId}/contacts/${contactId}`);
    const contactSnap = await getDoc(contactRef);

    if (!contactSnap.exists()) {
      return null;
    }

    const data = contactSnap.data();
    return {
      ...data,
      id: contactSnap.id,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
      lastContactedAt: data.lastContactedAt?.toDate?.().toISOString() || data.lastContactedAt
    } as Contact;
  }

  /**
   * Get all contacts for a user - con deduplication
   */
  static async getUserContacts(userId: string, orgId: string): Promise<Contact[]> {
    // ✅ Deduplica requests cuando múltiples componentes piden contactos simultáneamente
    return deduplicateFirestoreQuery('contacts', userId, async () => {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const contactsRef = collection(db, `users/${userId}/organizations/${orgId}/contacts`);
      const q = query(contactsRef, orderBy('updatedAt', 'desc'));
      const querySnapshot = await getDocs(q);

      return querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
          lastContactedAt: data.lastContactedAt?.toDate?.().toISOString() || data.lastContactedAt
        } as Contact;
      });
    });
  }

  /**
   * Get contacts by type (promoter, venue_manager, etc.)
   */
  static async getContactsByType(
    type: Contact['type'],
    userId: string,
    orgId: string
  ): Promise<Contact[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactsRef = collection(db, `users/${userId}/organizations/${orgId}/contacts`);
    const q = query(
      contactsRef,
      where('type', '==', type),
      orderBy('updatedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
        lastContactedAt: data.lastContactedAt?.toDate?.().toISOString() || data.lastContactedAt
      } as Contact;
    });
  }

  /**
   * Delete contact from Firestore
   */
  static async deleteContact(contactId: string, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactRef = doc(db, `users/${userId}/organizations/${orgId}/contacts/${contactId}`);
    await deleteDoc(contactRef);
  }

  /**
   * Batch save multiple contacts (for migration/import)
   */
  /**
   * Batch save contacts - Optimized with batch writes
   */
  static async saveContacts(contacts: Contact[], userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Firestore batches have a limit of 500 operations
    const BATCH_SIZE = 500;
    const chunks = [];
    
    for (let i = 0; i < contacts.length; i += BATCH_SIZE) {
      chunks.push(contacts.slice(i, i + BATCH_SIZE));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      
      for (const contact of chunk) {
        const contactRef = doc(db, `users/${userId}/organizations/${orgId}/contacts/${contact.id}`);
        const contactData = this.removeUndefined({
          ...contact,
          updatedAt: Timestamp.now()
        });
        
        batch.set(contactRef, contactData, { merge: true });
      }
      
      await batch.commit();
    }
    
    console.log(`✅ Batch saved ${contacts.length} contacts`);
  }

  /**
   * Subscribe to real-time updates for user's contacts
   */
  static subscribeToUserContacts(
    userId: string,
    orgId: string,
    callback: (contacts: Contact[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactsRef = collection(db, `users/${userId}/organizations/${orgId}/contacts`);
    const q = query(contactsRef, orderBy('updatedAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const contacts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt,
          lastContactedAt: data.lastContactedAt?.toDate?.().toISOString() || data.lastContactedAt
        } as Contact;
      });

      callback(contacts);
    });
  }

  /**
   * Migrate localStorage contacts to Firestore
   * Only runs once per user (idempotent)
   */
  static async migrateFromLocalStorage(userId: string, orgId: string): Promise<number> {
    if (!db) {
      return 0;
    }

    try {
      // Check if user already has contacts in Firestore
      const existing = await this.getUserContacts(userId, orgId);
      if (existing.length > 0) {
        return 0; // Already migrated
      }

      // Load contacts from localStorage
      const stored = localStorage.getItem('on-tour-contacts');
      if (!stored) {
        return 0;
      }

      const contacts: Contact[] = JSON.parse(stored);
      
      // Migrate contacts to Firestore
      await this.saveContacts(contacts, userId, orgId);

      return contacts.length;
    } catch (error) {
      console.error('❌ Failed to migrate contacts:', error);
      return 0;
    }
  }
}
