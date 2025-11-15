import type { Contract } from '../types/contract';
import { FirestoreContractService } from './firestoreContractService';
import { isFirebaseConfigured } from '../lib/firebase';
import { getCurrentUserId } from '../lib/demoAuth';
import { getCurrentOrgId } from '../lib/tenants';
import { logger } from '../lib/logger';

/**
 * Hybrid Contract Service - Uses both localStorage and Firestore
 * - localStorage: Fast local access, works offline
 * - Firestore: Persistent cloud storage, cross-device sync
 */
export class HybridContractService {
  private static STORAGE_KEY = 'on-tour-contracts';
  private static MIGRATED_KEY = 'firestore-contracts-migrated';

  /**
   * Initialize the hybrid system for a user
   */
  static async initialize(userId: string, orgId: string): Promise<void> {
    if (!isFirebaseConfigured()) {
      logger.info('[HybridContractService] Firebase not configured, using localStorage only', { userId, orgId });
      return;
    }

    if (!orgId) {
      logger.info('[HybridContractService] No orgId provided, skipping cloud sync', { userId });
      return;
    }

    try {
      // Check if we've already migrated for this user+org
      const migrationKey = `${this.MIGRATED_KEY}-${userId}-${orgId}`;
      const alreadyMigrated = localStorage.getItem(migrationKey);
      
      if (!alreadyMigrated) {
        // Migrate existing localStorage data to Firestore
        const migrated = await FirestoreContractService.migrateFromLocalStorage(userId, orgId);
        if (migrated > 0) {
          logger.info('[HybridContractService] Migrated contracts to cloud storage', { userId, orgId, count: migrated });
        }
        localStorage.setItem(migrationKey, 'true');
      }

      // Sync from Firestore to localStorage
      await this.syncFromCloud(userId, orgId);
      
      // Set up real-time sync
      this.setupRealtimeSync(userId, orgId);
      
      logger.info('[HybridContractService] Hybrid contract service initialized', { userId, orgId });
    } catch (error) {
      logger.error('[HybridContractService] Failed to initialize hybrid service', error as Error, { userId, orgId });
    }
  }

  /**
   * Save a contract (both localStorage and Firestore)
   */
  static async saveContract(contract: Contract): Promise<void> {
    const userId = getCurrentUserId();
    const orgId = getCurrentOrgId();
    
    // Always save to localStorage first (fast, works offline)
    this.saveToLocalStorage(contract);
    
    // Try to save to Firestore only if orgId is available
    if (isFirebaseConfigured() && orgId) {
      try {
        await FirestoreContractService.saveContract(contract, userId, orgId);
        logger.info('[HybridContractService] Contract saved to cloud', { userId, orgId, contractId: contract.id });
      } catch (error) {
        logger.warn('[HybridContractService] Failed to save to cloud, saved locally', { userId, orgId, contractId: contract.id, error: String(error) });
      }
    }
  }

  /**
   * Get all contracts for current user
   */
  static async getContracts(): Promise<Contract[]> {
    const userId = getCurrentUserId();
    const orgId = getCurrentOrgId();
    
    // Try Firestore first if available and orgId exists
    if (isFirebaseConfigured() && orgId) {
      try {
        const cloudContracts = await FirestoreContractService.getUserContracts(userId, orgId);
        if (cloudContracts.length > 0) {
          // Update localStorage with cloud data
          localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cloudContracts));
          return cloudContracts;
        }
      } catch (error) {
        logger.warn('[HybridContractService] Failed to load from cloud, using local data', { userId, orgId, error: String(error) });
      }
    }

    // Fallback to localStorage
    return this.getFromLocalStorage();
  }

  /**
   * Delete a contract
   */
  static async deleteContract(contractId: string): Promise<void> {
    const userId = getCurrentUserId();
    const orgId = getCurrentOrgId();
    
    // Delete from localStorage
    this.deleteFromLocalStorage(contractId);
    
    // Try to delete from Firestore
    if (isFirebaseConfigured() && orgId) {
      try {
        await FirestoreContractService.deleteContract(contractId, userId, orgId);
        logger.info('[HybridContractService] Contract deleted from cloud', { userId, orgId, contractId });
      } catch (error) {
        logger.warn('[HybridContractService] Failed to delete from cloud', { userId, orgId, contractId, error: String(error) });
      }
    }
  }

  /**
   * Sync contracts from Firestore to localStorage
   */
  private static async syncFromCloud(userId: string, orgId: string): Promise<void> {
    try {
      const cloudContracts = await FirestoreContractService.getUserContracts(userId, orgId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cloudContracts));
      logger.info('[HybridContractService] Synced contracts from cloud', { userId, orgId, count: cloudContracts.length });
    } catch (error) {
      logger.warn('[HybridContractService] Failed to sync from cloud', { userId, orgId, error: String(error) });
    }
  }

  /**
   * Set up real-time sync from Firestore
   */
  private static setupRealtimeSync(userId: string, orgId: string): void {
    FirestoreContractService.setupRealtimeSync(userId, orgId, (contracts) => {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contracts));
      // Dispatch storage event to notify other tabs/components
      window.dispatchEvent(new StorageEvent('storage', {
        key: this.STORAGE_KEY,
        newValue: JSON.stringify(contracts),
      }));
    });
  }

  /**
   * Save to localStorage
   */
  private static saveToLocalStorage(contract: Contract): void {
    try {
      const contracts = this.getFromLocalStorage();
      const index = contracts.findIndex(c => c.id === contract.id);
      
      if (index >= 0) {
        contracts[index] = contract;
      } else {
        contracts.push(contract);
      }
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(contracts));
    } catch (error) {
      logger.error('[HybridContractService] Failed to save to localStorage', error as Error);
    }
  }

  /**
   * Get from localStorage
   */
  private static getFromLocalStorage(): Contract[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      return JSON.parse(stored);
    } catch (error) {
      logger.error('[HybridContractService] Failed to load from localStorage', error as Error);
      return [];
    }
  }

  /**
   * Delete from localStorage
   */
  private static deleteFromLocalStorage(contractId: string): void {
    try {
      const contracts = this.getFromLocalStorage();
      const filtered = contracts.filter(c => c.id !== contractId);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filtered));
    } catch (error) {
      logger.error('[HybridContractService] Failed to delete from localStorage', error as Error);
    }
  }
}
