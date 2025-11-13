/**
 * Offline Queue Service
 * Queues operations when offline and syncs when back online
 */

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
      console.error('Failed to load offline queue:', error);
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
      console.error('Failed to save offline queue:', error);
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

    console.log(`📥 Queued ${type} operation for ${collection}/${entityId}${options?.optimistic ? ' (optimistic)' : ''}`);
    
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
      console.log('🌐 Back online, processing queued operations...');
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
      console.log('📴 Still offline, skipping queue processing');
      return;
    }

    this.processing = true;
    console.log(`🔄 Processing ${this.queue.length} queued operations...`);

    const failedOps: QueuedOperation[] = [];

    for (const operation of this.queue) {
      try {
        await this.executeOperation(operation);
        console.log(`✅ Processed ${operation.type} on ${operation.collection}/${operation.entityId}`);
        
        // Call success callback if provided
        if (operation.onSuccess) {
          operation.onSuccess();
        }
      } catch (error) {
        console.error(`❌ Failed to process operation:`, error);
        
        // If optimistic, revert the UI change
        if (operation.optimistic && operation.onRevert) {
          console.log(`⏪ Reverting optimistic update for ${operation.collection}/${operation.entityId}`);
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
          console.error(`❌ Operation failed after ${this.maxRetries} retries, discarding`, operation);
        }
      }
    }

    // Update queue with only failed operations
    this.queue = failedOps;
    this.saveQueue();
    this.processing = false;

    if (failedOps.length > 0) {
      console.warn(`⚠️ ${failedOps.length} operations failed, will retry later`);
    } else {
      console.log('✅ All queued operations processed successfully');
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

    switch (collection) {
      case 'shows':
        const { FirestoreShowService } = await import('./firestoreShowService');
        if (type === 'create' || type === 'update') {
          await FirestoreShowService.saveShow(data, userId);
        } else if (type === 'delete') {
          await FirestoreShowService.deleteShow(entityId, userId);
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
