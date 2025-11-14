/**
 * Offline Queue Service
 * Queues operations when offline and syncs when back online
 */

import { logger } from '../lib/logger';
import { getCurrentOrgId } from '../lib/tenants';

interface QueuedOperation {
  id: string;
  type: 'create' | 'update' | 'delete';
  collection: 'shows' | 'contacts' | 'venues' | 'transactions';
  entityId: string;
  data?: any;
  timestamp: number;
  retries: number;
  /** Optimistic mode: UI already updated, revert on failure */
  optimistic?: boolean;
  /** Callback to revert optimistic update */
  onRevert?: () => void;
  /** Callback on success */
  onSuccess?: () => void;
  /** Callback on failure */
  onFailure?: (error: Error) => void;
}

class OfflineQueueService {
  private static QUEUE_KEY = 'firestore-offline-queue';
  private queue: QueuedOperation[] = [];
  private processing = false;
  private maxRetries = 3;

  constructor() {
    this.loadQueue();
    this.setupOnlineListener();
  }

  /**
   * Load queue from localStorage
   */
  private loadQueue(): void {
    try {
      const stored = localStorage.getItem(OfflineQueueService.QUEUE_KEY);
      if (stored) {
        this.queue = JSON.parse(stored);
      }
    } catch (error) {
      logger.error('[OfflineQueue] Failed to load offline queue', error as Error);
    }
  }

  /**
   * Save queue to localStorage
   */
  private saveQueue(): void {
    try {
      localStorage.setItem(
        OfflineQueueService.QUEUE_KEY,
        JSON.stringify(this.queue)
      );
    } catch (error) {
      logger.error('[OfflineQueue] Failed to save offline queue', error as Error);
    }
  }

  /**
   * Add operation to queue
   * @param optimistic If true, assumes success and only reverts on failure
   */
  addOperation(
    type: QueuedOperation['type'],
    collection: QueuedOperation['collection'],
    entityId: string,
    data?: any,
    options?: {
      optimistic?: boolean;
      onRevert?: () => void;
      onSuccess?: () => void;
      onFailure?: (error: Error) => void;
    }
  ): void {
    const operation: QueuedOperation = {
      id: crypto.randomUUID(),
      type,
      collection,
      entityId,
      data,
      timestamp: Date.now(),
      retries: 0,
      optimistic: options?.optimistic,
      onRevert: options?.onRevert,
      onSuccess: options?.onSuccess,
      onFailure: options?.onFailure,
    };

    this.queue.push(operation);
    this.saveQueue();

    logger.info('[OfflineQueue] Queued operation', { type, collection, entityId, optimistic: options?.optimistic });
    
    // If online and optimistic, process immediately
    if (navigator.onLine && options?.optimistic) {
      this.processQueue();
    }
  }

  /**
   * Setup listener for online/offline events
   */
  private setupOnlineListener(): void {
    window.addEventListener('online', () => {
      logger.info('[OfflineQueue] Back online, processing queued operations');
      this.processQueue();
    });
  }

  /**
   * Process queued operations
   */
  async processQueue(): Promise<void> {
    if (this.processing || this.queue.length === 0) {
      return;
    }

    if (!navigator.onLine) {
      logger.info('[OfflineQueue] Still offline, skipping queue processing');
      return;
    }

    this.processing = true;
    logger.info('[OfflineQueue] Processing queued operations', { count: this.queue.length });

    const failedOps: QueuedOperation[] = [];

    for (const operation of this.queue) {
      try {
        await this.executeOperation(operation);
        logger.info('[OfflineQueue] Processed operation', { type: operation.type, collection: operation.collection, entityId: operation.entityId });
        
        // Call success callback if provided
        if (operation.onSuccess) {
          operation.onSuccess();
        }
      } catch (error) {
        logger.error('[OfflineQueue] Failed to process operation', error as Error, { type: operation.type, collection: operation.collection, entityId: operation.entityId });
        
        // If optimistic, revert the UI change
        if (operation.optimistic && operation.onRevert) {
          logger.info('[OfflineQueue] Reverting optimistic update', { collection: operation.collection, entityId: operation.entityId });
          operation.onRevert();
        }
        
        // Call failure callback if provided
        if (operation.onFailure) {
          operation.onFailure(error as Error);
        }
        
        operation.retries++;
        
        if (operation.retries < this.maxRetries && !operation.optimistic) {
          // Only retry non-optimistic operations
          failedOps.push(operation);
        } else {
          logger.error('[OfflineQueue] Operation failed after max retries, discarding', undefined, { retries: this.maxRetries, operation });
        }
      }
    }

    // Update queue with only failed operations
    this.queue = failedOps;
    this.saveQueue();
    this.processing = false;

    if (failedOps.length > 0) {
      logger.warn('[OfflineQueue] Operations failed, will retry later', { count: failedOps.length });
    } else {
      logger.info('[OfflineQueue] All queued operations processed successfully');
    }
  }

  /**
   * Execute a single queued operation
   */
  private async executeOperation(operation: QueuedOperation): Promise<void> {
    const { type, collection, entityId, data } = operation;

    // Import services dynamically to avoid circular dependencies
    const userId = localStorage.getItem('userId');
    if (!userId) {
      throw new Error('No user ID found');
    }

    const orgId = getCurrentOrgId();

    switch (collection) {
      case 'shows':
        const { FirestoreShowService } = await import('./firestoreShowService');
        if (type === 'create' || type === 'update') {
          await FirestoreShowService.saveShow(data, userId, orgId);
        } else if (type === 'delete') {
          await FirestoreShowService.deleteShow(entityId, userId, orgId);
        }
        break;

      case 'contacts':
        const { FirestoreContactService } = await import('./firestoreContactService');
        if (type === 'create' || type === 'update') {
          await FirestoreContactService.saveContact(data, userId);
        } else if (type === 'delete') {
          await FirestoreContactService.deleteContact(entityId, userId);
        }
        break;

      case 'venues':
        const { FirestoreVenueService } = await import('./firestoreVenueService');
        if (type === 'create' || type === 'update') {
          await FirestoreVenueService.saveVenue(data, userId);
        } else if (type === 'delete') {
          await FirestoreVenueService.deleteVenue(entityId, userId);
        }
        break;

      default:
        throw new Error(`Unknown collection: ${collection}`);
    }
  }

  /**
   * Get queue stats
   */
  getStats(): { pending: number; operations: QueuedOperation[] } {
    return {
      pending: this.queue.length,
      operations: this.queue
    };
  }

  /**
   * Clear queue (use with caution!)
   */
  clearQueue(): void {
    this.queue = [];
    this.saveQueue();
  }
}

// Singleton instance
export const offlineQueue = new OfflineQueueService();
