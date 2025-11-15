import { logger } from '../lib/logger';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  Timestamp
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import type { Contract } from '../types/contract';
import { deduplicateFirestoreQuery } from '../lib/requestDeduplication';

export class FirestoreContractService {
  /**
   * Get collection path for user contracts (org-scoped)
   */
  private static getUserContractsPath(userId: string, orgId: string): string {
    return `users/${userId}/organizations/${orgId}/contracts`;
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
   * Save contract to Firestore
   */
  static async saveContract(contract: Contract, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contractData = this.removeUndefined({
      ...contract,
      userId,
      updatedAt: Timestamp.now(),
      createdAt: contract.createdAt ? Timestamp.fromDate(new Date(contract.createdAt)) : Timestamp.now()
    });

    await setDoc(doc(db, this.getUserContractsPath(userId, orgId), contract.id), contractData, { merge: true });
  }

  /**
   * Get all contracts for a user - with deduplication
   */
  static async getUserContracts(userId: string, orgId: string): Promise<Contract[]> {
    return deduplicateFirestoreQuery('contracts', userId, async () => {
      if (!db) {
        throw new Error('Firestore not initialized');
      }

      const contractsRef = collection(db, this.getUserContractsPath(userId, orgId));
      const q = query(contractsRef, orderBy('createdAt', 'desc'));

      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'draft',
          parties: data.parties || [],
          fileUrl: data.fileUrl || '',
          fileName: data.fileName || '',
          fileSize: data.fileSize || 0,
          requiresSignature: data.requiresSignature || false,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          ...data,
        } as Contract;
      });
    });
  }

  /**
   * Get contracts by showId
   */
  static async getContractsByShow(showId: string, userId: string, orgId: string): Promise<Contract[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const contractsRef = collection(db, this.getUserContractsPath(userId, orgId));
    const q = query(
      contractsRef, 
      where('showId', '==', showId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || '',
        description: data.description || '',
        status: data.status || 'draft',
        parties: data.parties || [],
        fileUrl: data.fileUrl || '',
        fileName: data.fileName || '',
        fileSize: data.fileSize || 0,
        requiresSignature: data.requiresSignature || false,
        tags: data.tags || [],
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        ...data,
      } as Contract;
    });
  }

  /**
   * Get a specific contract
   */
  static async getContract(contractId: string, userId: string, orgId: string): Promise<Contract | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const docRef = doc(db, this.getUserContractsPath(userId, orgId), contractId);
    const docSnap = await getDoc(docRef);

    if (!docSnap.exists()) {
      return null;
    }

    const data = docSnap.data();
    
    // Security: Only return if user owns the contract
    if (data.userId !== userId) {
      return null;
    }

    return {
      id: docSnap.id,
      title: data.title || '',
      description: data.description || '',
      status: data.status || 'draft',
      parties: data.parties || [],
      fileUrl: data.fileUrl || '',
      fileName: data.fileName || '',
      fileSize: data.fileSize || 0,
      requiresSignature: data.requiresSignature || false,
      tags: data.tags || [],
      createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      ...data,
    } as Contract;
  }

  /**
   * Delete a contract
   */
  static async deleteContract(contractId: string, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    await deleteDoc(doc(db, this.getUserContractsPath(userId, orgId), contractId));
  }

  /**
   * Migrate existing localStorage contracts to Firestore
   */
  static async migrateFromLocalStorage(userId: string, orgId: string): Promise<number> {
    try {
      const stored = localStorage.getItem('on-tour-contracts');
      if (!stored) return 0;

      const contracts: Contract[] = JSON.parse(stored);
      if (!Array.isArray(contracts) || contracts.length === 0) return 0;

      let migrated = 0;
      for (const contract of contracts) {
        try {
          await this.saveContract(contract, userId, orgId);
          migrated++;
        } catch (error) {
          logger.warn('[FirestoreContractService] Failed to migrate contract', { contractId: contract.id, error: String(error) });
        }
      }

      logger.info('[FirestoreContractService] Migration complete', { migrated, total: contracts.length });
      return migrated;
    } catch (error) {
      logger.error('[FirestoreContractService] Migration failed', error as Error);
      return 0;
    }
  }

  /**
   * Set up real-time sync for contracts
   */
  static setupRealtimeSync(
    userId: string, 
    orgId: string, 
    onUpdate: (contracts: Contract[]) => void
  ): () => void {
    if (!db) {
      logger.warn('[FirestoreContractService] Firestore not initialized, skipping real-time sync');
      return () => {};
    }

    const contractsRef = collection(db, this.getUserContractsPath(userId, orgId));
    const q = query(contractsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const contracts = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          status: data.status || 'draft',
          parties: data.parties || [],
          fileUrl: data.fileUrl || '',
          fileName: data.fileName || '',
          fileSize: data.fileSize || 0,
          requiresSignature: data.requiresSignature || false,
          tags: data.tags || [],
          createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          ...data,
        } as Contract;
      });
      
      onUpdate(contracts);
      logger.info('[FirestoreContractService] Real-time sync updated', { count: contracts.length });
    }, (error) => {
      logger.error('[FirestoreContractService] Real-time sync error', error as Error);
    });
  }
}
