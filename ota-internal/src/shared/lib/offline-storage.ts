// Offline storage using Dexie (IndexedDB wrapper)
import Dexie, { type Table } from 'dexie';
import type { Database } from './supabase';

// Local database schema mirrors Supabase schema
export interface LocalShow {
  id: string;
  organization_id: string;
  venue_id?: string;
  title: string;
  date: string;
  status: 'tentative' | 'confirmed' | 'cancelled' | 'overdue' | 'pending';
  guarantee_amount: number;
  guarantee_currency: string;
  
  // Sync metadata
  synced_at?: Date;
  dirty: boolean; // needs sync
  deleted: boolean; // soft delete until synced
}

export interface LocalExpense {
  id: string;
  organization_id: string;
  show_id?: string;
  category: string;
  description: string;
  amount: number;
  currency: string;
  expense_date: string;
  
  // Sync metadata
  synced_at?: Date;
  dirty: boolean;
  deleted: boolean;
}

export interface SyncOperation {
  id: string;
  table_name: string;
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
  record_id: string;
  data: any;
  created_at: Date;
  retries: number;
  last_error?: string;
}

class OfflineDatabase extends Dexie {
  shows!: Table<LocalShow>;
  expenses!: Table<LocalExpense>;
  sync_queue!: Table<SyncOperation>;

  constructor() {
    super('OTAOfflineDB');
    
    this.version(1).stores({
      shows: 'id, organization_id, date, status, dirty, deleted',
      expenses: 'id, organization_id, show_id, expense_date, dirty, deleted',
      sync_queue: '++id, table_name, created_at, retries'
    });
  }
}

export const offlineDB = new OfflineDatabase();

// Offline-first operations
export class OfflineDataService {
  private organizationId: string;

  constructor(organizationId: string) {
    this.organizationId = organizationId;
  }

  // Shows operations
  async getShows(filters?: { status?: string; dateFrom?: string; dateTo?: string }) {
    let query = offlineDB.shows
      .where('organization_id')
      .equals(this.organizationId)
      .and(show => !show.deleted);

    if (filters?.status) {
      query = query.and(show => show.status === filters.status);
    }

    if (filters?.dateFrom) {
      query = query.and(show => show.date >= filters.dateFrom!);
    }

    if (filters?.dateTo) {
      query = query.and(show => show.date <= filters.dateTo!);
    }

    return await query.toArray();
  }

  async createShow(showData: Omit<LocalShow, 'id' | 'organization_id' | 'dirty' | 'deleted'>) {
    const id = crypto.randomUUID();
    const show: LocalShow = {
      ...showData,
      id,
      organization_id: this.organizationId,
      dirty: true,
      deleted: false,
    };

    await offlineDB.shows.add(show);
    await this.queueSync('shows', 'INSERT', id, show);
    
    return show;
  }

  async updateShow(id: string, updates: Partial<LocalShow>) {
    const updatedShow = {
      ...updates,
      dirty: true,
    };

    await offlineDB.shows.update(id, updatedShow);
    await this.queueSync('shows', 'UPDATE', id, updatedShow);
    
    return await offlineDB.shows.get(id);
  }

  async deleteShow(id: string) {
    await offlineDB.shows.update(id, { deleted: true, dirty: true });
    await this.queueSync('shows', 'DELETE', id, { id });
  }

  // Expenses operations
  async getExpenses(showId?: string) {
    let query = offlineDB.expenses
      .where('organization_id')
      .equals(this.organizationId)
      .and(expense => !expense.deleted);

    if (showId) {
      query = query.and(expense => expense.show_id === showId);
    }

    return await query.toArray();
  }

  async createExpense(expenseData: Omit<LocalExpense, 'id' | 'organization_id' | 'dirty' | 'deleted'>) {
    const id = crypto.randomUUID();
    const expense: LocalExpense = {
      ...expenseData,
      id,
      organization_id: this.organizationId,
      dirty: true,
      deleted: false,
    };

    await offlineDB.expenses.add(expense);
    await this.queueSync('expenses', 'INSERT', id, expense);
    
    return expense;
  }

  // Sync queue management
  private async queueSync(
    tableName: string, 
    operation: 'INSERT' | 'UPDATE' | 'DELETE',
    recordId: string,
    data: any
  ) {
    const syncOp: SyncOperation = {
      id: crypto.randomUUID(),
      table_name: tableName,
      operation,
      record_id: recordId,
      data,
      created_at: new Date(),
      retries: 0,
    };

    await offlineDB.sync_queue.add(syncOp);
  }

  async getPendingSyncOperations() {
    return await offlineDB.sync_queue
      .orderBy('created_at')
      .toArray();
  }

  async markSyncComplete(syncOpId: string) {
    await offlineDB.sync_queue.delete(syncOpId);
  }

  async markSyncFailed(syncOpId: string, error: string) {
    await offlineDB.sync_queue.update(syncOpId, {
      retries: offlineDB.sync_queue.get(syncOpId).then(op => (op?.retries || 0) + 1),
      last_error: error,
    });
  }

  // Data synchronization
  async syncWithServer(supabaseClient: any) {
    const pendingOps = await this.getPendingSyncOperations();
    
    for (const op of pendingOps) {
      try {
        await this.executeSyncOperation(supabaseClient, op);
        await this.markSyncComplete(op.id);
      } catch (error) {
        console.error('Sync failed for operation:', op, error);
        await this.markSyncFailed(op.id, String(error));
        
        // Skip after 3 retries
        if (op.retries >= 3) {
          await this.markSyncComplete(op.id);
        }
      }
    }
  }

  private async executeSyncOperation(supabaseClient: any, op: SyncOperation) {
    const { table_name, operation, record_id, data } = op;
    
    switch (operation) {
      case 'INSERT':
        await supabaseClient
          .from(table_name)
          .insert(data);
        break;
        
      case 'UPDATE':
        await supabaseClient
          .from(table_name)
          .update(data)
          .eq('id', record_id);
        break;
        
      case 'DELETE':
        await supabaseClient
          .from(table_name)
          .delete()
          .eq('id', record_id);
        break;
    }

    // Mark local record as synced
    if (table_name === 'shows') {
      await offlineDB.shows.update(record_id, { 
        dirty: false, 
        synced_at: new Date() 
      });
    } else if (table_name === 'expenses') {
      await offlineDB.expenses.update(record_id, { 
        dirty: false, 
        synced_at: new Date() 
      });
    }
  }
}

// Auto-sync when online
export class SyncManager {
  private syncInterval: number | null = null;
  private dataService: OfflineDataService;
  private supabaseClient: any;

  constructor(dataService: OfflineDataService, supabaseClient: any) {
    this.dataService = dataService;
    this.supabaseClient = supabaseClient;
    
    // Listen for online/offline events
    window.addEventListener('online', () => this.startSync());
    window.addEventListener('offline', () => this.stopSync());
    
    // Start sync if online
    if (navigator.onLine) {
      this.startSync();
    }
  }

  startSync() {
    if (this.syncInterval) return;
    
    // Immediate sync
    this.sync();
    
    // Sync every 30 seconds when online
    this.syncInterval = window.setInterval(() => {
      this.sync();
    }, 30000);
  }

  stopSync() {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  private async sync() {
    try {
      await this.dataService.syncWithServer(this.supabaseClient);
    } catch (error) {
      console.error('Sync failed:', error);
    }
  }
}
