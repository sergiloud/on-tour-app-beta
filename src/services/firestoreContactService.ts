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
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Contact } from '../types/crm';

export class FirestoreContactService {
  /**
   * Save contact to Firestore
   */
  static async saveContact(contact: Contact, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactRef = doc(db, `users/${userId}/contacts/${contact.id}`);
    const contactData = {
      ...contact,
      updatedAt: Timestamp.now()
    };

    await setDoc(contactRef, contactData);
  }

  /**
   * Get single contact by ID
   */
  static async getContact(contactId: string, userId: string): Promise<Contact | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactRef = doc(db, `users/${userId}/contacts/${contactId}`);
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
   * Get all contacts for a user
   */
  static async getUserContacts(userId: string): Promise<Contact[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactsRef = collection(db, `users/${userId}/contacts`);
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
  }

  /**
   * Get contacts by type (promoter, venue_manager, etc.)
   */
  static async getContactsByType(
    type: Contact['type'],
    userId: string
  ): Promise<Contact[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactsRef = collection(db, `users/${userId}/contacts`);
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
  static async deleteContact(contactId: string, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactRef = doc(db, `users/${userId}/contacts/${contactId}`);
    await deleteDoc(contactRef);
  }

  /**
   * Batch save multiple contacts (for migration/import)
   */
  static async saveContacts(contacts: Contact[], userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const promises = contacts.map(contact =>
      this.saveContact(contact, userId)
    );

    await Promise.all(promises);
  }

  /**
   * Subscribe to real-time updates for user's contacts
   */
  static subscribeToUserContacts(
    userId: string,
    callback: (contacts: Contact[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contactsRef = collection(db, `users/${userId}/contacts`);
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
  static async migrateFromLocalStorage(userId: string): Promise<number> {
    if (!db) {
      return 0;
    }

    try {
      // Check if user already has contacts in Firestore
      const existing = await this.getUserContacts(userId);
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
      await this.saveContacts(contacts, userId);

      return contacts.length;
    } catch (error) {
      console.error('❌ Failed to migrate contacts:', error);
      return 0;
    }
  }
}
