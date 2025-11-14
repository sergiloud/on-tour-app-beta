/**
 * Hybrid Contact Service - Uses both localStorage and Firestore
 * - localStorage: Fast offline access, fallback
 * - Firestore: Persistent cloud storage, cross-device sync
 */

import { FirestoreContactService } from './firestoreContactService';
import { contactStore } from '../shared/contactStore';
import { isFirebaseConfigured } from '../lib/firebase';
import { getCurrentOrgId } from '../lib/tenants';
import { logger } from '../lib/logger';
import type { Contact } from '../types/crm';

export class HybridContactService {
  private static MIGRATED_KEY = 'firestore-contacts-migrated';

  /**
   * Initialize hybrid service for a user
   * Migrates localStorage data to Firestore if needed
   */
  static async initialize(userId: string, orgId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    if (!orgId) {
      logger.info('[HybridContactService] No orgId provided, skipping cloud sync', { userId });
      return;
    }

    try {
      // Check if already migrated
      const migrationKey = `${this.MIGRATED_KEY}-${userId}-${orgId}`;
      const migrated = localStorage.getItem(migrationKey);
      if (!migrated) {
        // Migrate existing localStorage data to Firestore
        const migratedCount = await FirestoreContactService.migrateFromLocalStorage(userId, orgId);
        if (migratedCount > 0) {
          localStorage.setItem(migrationKey, 'true');
        }
      }

      // Sync from Firestore to localStorage
      await this.syncFromCloud(userId, orgId);

      // Setup real-time sync
      this.setupRealtimeSync(userId, orgId);
    } catch (error) {
      logger.error('Failed to initialize hybrid contact service', error as Error, { userId });
    }
  }

  /**
   * Save a contact (both localStorage and Firestore)
   */
  static async saveContact(contact: Contact, userId: string): Promise<void> {
    const orgId = getCurrentOrgId();
    
    // Save to localStorage first (immediate)
    contactStore.add(contact);

    // Try to save to Firestore
    if (isFirebaseConfigured() && orgId) {
      try {
        await FirestoreContactService.saveContact(contact, userId, orgId);
      } catch (error) {
        logger.warn('Failed to save contact to cloud, saved locally', { userId, contactId: contact.id, error });
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
    const orgId = getCurrentOrgId();
    
    logger.info('[HybridContactService] Updating contact', {
      contactId,
      userId,
      orgId,
      hasNotes: !!updates.notes,
      notesCount: updates.notes?.length || 0
    });

    // Update localStorage first
    contactStore.update(contactId, updates);

    // Try to update Firestore
    if (isFirebaseConfigured() && orgId) {
      try {
        const contact = contactStore.getById(contactId);
        if (contact) {
          logger.info('[HybridContactService] Saving to Firestore', {
            contactId: contact.id,
            userId,
            orgId,
            notesInContact: contact.notes?.length || 0
          });
          await FirestoreContactService.saveContact(contact, userId, orgId);
        }
      } catch (error) {
        logger.warn('Failed to update contact in cloud', { userId, contactId, error });
      }
    }
  }

  /**
   * Get all contacts (prefers Firestore, falls back to localStorage)
   */
  static async getAllContacts(userId: string): Promise<Contact[]> {
    const orgId = getCurrentOrgId();
    
    // Try Firestore first if available
    if (isFirebaseConfigured() && orgId) {
      try {
        const cloudContacts = await FirestoreContactService.getUserContacts(userId, orgId);
        
        // ✅ Batch update - una sola notificación
        if (cloudContacts.length > 0) {
          contactStore.setAll(cloudContacts);
        }
        
        return cloudContacts;
      } catch (error) {
        logger.warn('Failed to load from cloud, using local data', { userId, error });
      }
    }

    // Fallback to localStorage
    return contactStore.getAll();
  }

  /**
   * Delete a contact (both localStorage and Firestore)
   */
  static async deleteContact(contactId: string, userId: string): Promise<void> {
    const orgId = getCurrentOrgId();
    
    // Delete from localStorage
    contactStore.delete(contactId);

    // Delete from Firestore
    if (isFirebaseConfigured() && orgId) {
      try {
        await FirestoreContactService.deleteContact(contactId, userId, orgId);
      } catch (error) {
        logger.warn('Failed to delete from cloud, deleted locally', { userId, contactId, error });
      }
    }
  }

  /**
   * Sync contacts from Firestore to localStorage
   */
  static async syncFromCloud(userId: string, orgId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      return;
    }

    try {
      const cloudContacts = await FirestoreContactService.getUserContacts(userId, orgId);
      
      // ✅ Batch update - una sola notificación para todos los contactos
      contactStore.setAll(cloudContacts);
      
      logger.info('[HybridContactService] Synced contacts from cloud', { userId, count: cloudContacts.length });
    } catch (error) {
      logger.warn('Failed to sync from cloud', { userId, error });
    }
  }

  /**
   * Setup real-time sync from Firestore
   */
  static setupRealtimeSync(userId: string, orgId: string): () => void {
    if (!isFirebaseConfigured()) {
      return () => {};
    }

    try {
      return FirestoreContactService.subscribeToUserContacts(userId, orgId, (contacts: Contact[]) => {
        // ✅ Batch update - evita 454 notificaciones individuales
        contactStore.updateMany(contacts);
        
        // Dispatch evento para React Query
        window.dispatchEvent(new CustomEvent('contacts-updated', { detail: contacts }));
      });
    } catch (error) {
      logger.warn('Failed to set up real-time sync', { userId, error });
      return () => {};
    }
  }
}
