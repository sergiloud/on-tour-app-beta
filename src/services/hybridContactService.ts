/**
 * Hybrid Contact Service - Uses both localStorage and Firestore
 * - localStorage: Fast offline access, fallback
 * - Firestore: Persistent cloud storage, cross-device sync
 */

import { FirestoreContactService } from './firestoreContactService';
import { contactStore } from '../shared/contactStore';
import { isFirebaseConfigured } from '../lib/firebase';
import type { Contact } from '../types/crm';

export class HybridContactService {
  private static MIGRATED_KEY = 'firestore-contacts-migrated';

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
        const migratedCount = await FirestoreContactService.migrateFromLocalStorage(userId);
        if (migratedCount > 0) {
          localStorage.setItem(this.MIGRATED_KEY, 'true');
        }
      }

      // Sync from Firestore to localStorage
      await this.syncFromCloud(userId);

      // Setup real-time sync
      this.setupRealtimeSync(userId);
    } catch (error) {
      console.error('❌ Failed to initialize hybrid contact service:', error);
    }
  }

  /**
   * Save a contact (both localStorage and Firestore)
   */
  static async saveContact(contact: Contact, userId: string): Promise<void> {
    // Save to localStorage first (immediate)
    contactStore.add(contact);

    // Try to save to Firestore
    if (isFirebaseConfigured()) {
      try {
        await FirestoreContactService.saveContact(contact, userId);
      } catch (error) {
        console.warn('⚠️ Failed to save contact to cloud, saved locally:', error);
      }
    }
  }

  /**
   * Update a contact
   */
  static async updateContact(
    contactId: string,
    updates: Partial<Contact>,
    userId: string
  ): Promise<void> {
    // Update localStorage first
    contactStore.update(contactId, updates);

    // Try to update Firestore
    if (isFirebaseConfigured()) {
      try {
        const contact = contactStore.getById(contactId);
        if (contact) {
          await FirestoreContactService.saveContact(contact, userId);
        }
      } catch (error) {
        console.warn('⚠️ Failed to update contact in cloud:', error);
      }
    }
  }

  /**
   * Get all contacts (prefers Firestore, falls back to localStorage)
   */
  static async getAllContacts(userId: string): Promise<Contact[]> {
    // Try Firestore first if available
    if (isFirebaseConfigured()) {
      try {
        const cloudContacts = await FirestoreContactService.getUserContacts(userId);
        
        // ✅ Batch update - una sola notificación
        if (cloudContacts.length > 0) {
          contactStore.setAll(cloudContacts);
        }
        
        return cloudContacts;
      } catch (error) {
        console.warn('⚠️ Failed to load from cloud, using local data:', error);
      }
    }

    // Fallback to localStorage
    return contactStore.getAll();
  }

  /**
   * Delete a contact (both localStorage and Firestore)
   */
  static async deleteContact(contactId: string, userId: string): Promise<void> {
    // Delete from localStorage
    contactStore.delete(contactId);

    // Delete from Firestore
    if (isFirebaseConfigured()) {
      try {
        await FirestoreContactService.deleteContact(contactId, userId);
      } catch (error) {
        console.warn('⚠️ Failed to delete from cloud, deleted locally:', error);
      }
    }
  }

  /**
   * Sync contacts from Firestore to localStorage
   */
  static async syncFromCloud(userId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const cloudContacts = await FirestoreContactService.getUserContacts(userId);
      
      // ✅ Batch update - una sola notificación para todos los contactos
      contactStore.setAll(cloudContacts);
      
      console.log(`[HybridContactService] ✅ Synced ${cloudContacts.length} contacts from cloud`);
    } catch (error) {
      console.warn('⚠️ Failed to sync from cloud:', error);
    }
  }

  /**
   * Setup real-time sync from Firestore
   */
  static setupRealtimeSync(userId: string): () => void {
    if (!isFirebaseConfigured()) {
      return () => {};
    }

    try {
      return FirestoreContactService.subscribeToUserContacts(userId, (contacts) => {
        // ✅ Batch update - evita 454 notificaciones individuales
        contactStore.updateMany(contacts);
        
        // Dispatch evento para React Query
        window.dispatchEvent(new CustomEvent('contacts-updated', { detail: contacts }));
      });
    } catch (error) {
      console.warn('⚠️ Failed to set up real-time sync:', error);
      return () => {};
    }
  }
}
