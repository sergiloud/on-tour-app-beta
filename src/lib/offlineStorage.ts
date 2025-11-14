/**
 * IndexedDB Offline Storage Layer
 * 
 * Propósito: Persistencia local de datos críticos para funcionamiento offline
 * - Calendar events
 * - Financial transactions
 * - Shows data
 * - Contacts
 * 
 * Sincronización bidireccional con Firestore mediante background sync
 */

import { openDB, IDBPDatabase, DBSchema } from 'idb';

// ========================================
// Schema Definition
// ========================================

interface OnTourDB extends DBSchema {
  // Calendar events
  calendar: {
    key: string; // event ID
    value: {
      id: string;
      title: string;
      start: string; // ISO date
      end: string;
      type: 'show' | 'travel' | 'meeting' | 'other';
      showId?: string;
      metadata: Record<string, any>;
      syncStatus: 'synced' | 'pending' | 'failed';
      lastModified: number; // timestamp
    };
    indexes: { 'by-date': string; 'by-sync': string };
  };

  // Financial transactions
  transactions: {
    key: string;
    value: {
      id: string;
      type: 'income' | 'expense';
      amount: number;
      currency: string;
      category: string;
      description: string;
      date: string;
      showId?: string;
      metadata: Record<string, any>;
      syncStatus: 'synced' | 'pending' | 'failed';
      lastModified: number;
    };
    indexes: { 'by-date': string; 'by-sync': string; 'by-show': string };
  };

  // Shows
  shows: {
    key: string;
    value: {
      id: string;
      name: string;
      venue: string;
      city: string;
      country: string;
      date: string;
      status: 'confirmed' | 'tentative' | 'cancelled';
      fee?: number;
      currency?: string;
      metadata: Record<string, any>;
      syncStatus: 'synced' | 'pending' | 'failed';
      lastModified: number;
    };
    indexes: { 'by-date': string; 'by-sync': string; 'by-status': string };
  };

  // Contacts
  contacts: {
    key: string;
    value: {
      id: string;
      name: string;
      email?: string;
      phone?: string;
      role?: string;
      company?: string;
      metadata: Record<string, any>;
      syncStatus: 'synced' | 'pending' | 'failed';
      lastModified: number;
    };
    indexes: { 'by-name': string; 'by-sync': string };
  };

  // Sync queue - operaciones pendientes
  syncQueue: {
    key: number; // auto-increment ID
    value: {
      id: number;
      collection: 'calendar' | 'transactions' | 'shows' | 'contacts';
      operation: 'create' | 'update' | 'delete';
      documentId: string;
      data: any;
      timestamp: number;
      retryCount: number;
    };
    indexes: { 'by-timestamp': number };
  };
}

// ========================================
// Database Instance
// ========================================

const DB_NAME = 'ontour-offline';
const DB_VERSION = 1;

let dbInstance: IDBPDatabase<OnTourDB> | null = null;

export async function getDB(): Promise<IDBPDatabase<OnTourDB>> {
  if (dbInstance) return dbInstance;

  dbInstance = await openDB<OnTourDB>(DB_NAME, DB_VERSION, {
    upgrade(db) {
      // Calendar events
      if (!db.objectStoreNames.contains('calendar')) {
        const calendarStore = db.createObjectStore('calendar', { keyPath: 'id' });
        calendarStore.createIndex('by-date', 'start');
        calendarStore.createIndex('by-sync', 'syncStatus');
      }

      // Transactions
      if (!db.objectStoreNames.contains('transactions')) {
        const txStore = db.createObjectStore('transactions', { keyPath: 'id' });
        txStore.createIndex('by-date', 'date');
        txStore.createIndex('by-sync', 'syncStatus');
        txStore.createIndex('by-show', 'showId');
      }

      // Shows
      if (!db.objectStoreNames.contains('shows')) {
        const showsStore = db.createObjectStore('shows', { keyPath: 'id' });
        showsStore.createIndex('by-date', 'date');
        showsStore.createIndex('by-sync', 'syncStatus');
        showsStore.createIndex('by-status', 'status');
      }

      // Contacts
      if (!db.objectStoreNames.contains('contacts')) {
        const contactsStore = db.createObjectStore('contacts', { keyPath: 'id' });
        contactsStore.createIndex('by-name', 'name');
        contactsStore.createIndex('by-sync', 'syncStatus');
      }

      // Sync queue
      if (!db.objectStoreNames.contains('syncQueue')) {
        const queueStore = db.createObjectStore('syncQueue', { 
          keyPath: 'id', 
          autoIncrement: true 
        });
        queueStore.createIndex('by-timestamp', 'timestamp');
      }
    },
  });

  return dbInstance;
}

// ========================================
// Generic CRUD Operations
// ========================================

type CollectionName = 'calendar' | 'transactions' | 'shows' | 'contacts';

export async function saveItem<K extends CollectionName>(
  collection: K,
  item: OnTourDB[K]['value']
): Promise<void> {
  const db = await getDB();
  await db.put(collection, item as any);
}

export async function getItem<K extends CollectionName>(
  collection: K,
  id: string
): Promise<OnTourDB[K]['value'] | undefined> {
  const db = await getDB();
  return db.get(collection, id);
}

export async function getAllItems<K extends CollectionName>(
  collection: K
): Promise<OnTourDB[K]['value'][]> {
  const db = await getDB();
  return db.getAll(collection);
}

export async function deleteItem<K extends CollectionName>(
  collection: K,
  id: string
): Promise<void> {
  const db = await getDB();
  await db.delete(collection, id);
}

// ========================================
// Sync Queue Operations
// ========================================

export async function addToSyncQueue(
  collection: CollectionName,
  operation: 'create' | 'update' | 'delete',
  documentId: string,
  data?: any
): Promise<void> {
  const db = await getDB();
  
  await db.add('syncQueue', {
    id: undefined as any, // auto-increment
    collection,
    operation,
    documentId,
    data,
    timestamp: Date.now(),
    retryCount: 0
  });
}

export async function getSyncQueue(): Promise<OnTourDB['syncQueue']['value'][]> {
  const db = await getDB();
  return db.getAll('syncQueue');
}

export async function removeSyncQueueItem(id: number): Promise<void> {
  const db = await getDB();
  await db.delete('syncQueue', id);
}

export async function updateSyncQueueRetry(id: number): Promise<void> {
  const db = await getDB();
  const item = await db.get('syncQueue', id);
  
  if (item) {
    item.retryCount++;
    await db.put('syncQueue', item);
  }
}

// ========================================
// Query Helpers
// ========================================

export async function getItemsByDateRange<K extends CollectionName>(
  collection: K,
  startDate: string,
  endDate: string
): Promise<OnTourDB[K]['value'][]> {
  const db = await getDB();
  const tx = db.transaction(collection);
  const index = tx.store.index('by-date' as any);
  
  const range = IDBKeyRange.bound(startDate, endDate);
  return index.getAll(range);
}

export async function getPendingSyncItems<K extends CollectionName>(
  collection: K
): Promise<OnTourDB[K]['value'][]> {
  const db = await getDB();
  const tx = db.transaction(collection);
  const index = tx.store.index('by-sync' as any);
  
  return index.getAll('pending' as any);
}

// ========================================
// Bulk Operations
// ========================================

export async function bulkSave<K extends CollectionName>(
  collection: K,
  items: OnTourDB[K]['value'][]
): Promise<void> {
  const db = await getDB();
  const tx = db.transaction(collection, 'readwrite');
  
  await Promise.all([
    ...items.map(item => tx.store.put(item as any)),
    tx.done
  ]);
}

export async function clearCollection<K extends CollectionName>(
  collection: K
): Promise<void> {
  const db = await getDB();
  await db.clear(collection);
}

// ========================================
// Status Updates
// ========================================

export async function markAsSynced<K extends CollectionName>(
  collection: K,
  id: string
): Promise<void> {
  const db = await getDB();
  const item = await db.get(collection, id);
  
  if (item) {
    item.syncStatus = 'synced';
    item.lastModified = Date.now();
    await db.put(collection, item as any);
  }
}

export async function markAsPending<K extends CollectionName>(
  collection: K,
  id: string
): Promise<void> {
  const db = await getDB();
  const item = await db.get(collection, id);
  
  if (item) {
    item.syncStatus = 'pending';
    item.lastModified = Date.now();
    await db.put(collection, item as any);
  }
}

// ========================================
// Database Stats
// ========================================

export async function getStorageStats() {
  const db = await getDB();
  
  const [calendar, transactions, shows, contacts, queue] = await Promise.all([
    db.count('calendar'),
    db.count('transactions'),
    db.count('shows'),
    db.count('contacts'),
    db.count('syncQueue')
  ]);
  
  return {
    calendar,
    transactions,
    shows,
    contacts,
    syncQueue: queue,
    total: calendar + transactions + shows + contacts
  };
}

export async function clearAllData(): Promise<void> {
  const db = await getDB();
  
  await Promise.all([
    db.clear('calendar'),
    db.clear('transactions'),
    db.clear('shows'),
    db.clear('contacts'),
    db.clear('syncQueue')
  ]);
}
