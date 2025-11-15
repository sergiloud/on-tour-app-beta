/**
 * Scalable Firestore Hooks
 * 
 * New architecture with sub-collections for unlimited scalability
 * 
 * Features:
 * - Pagination support
 * - Date range queries
 * - Server-side filtering
 * - Real-time updates
 * - Optimistic updates
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  Timestamp,
  DocumentSnapshot,
  QueryConstraint,
  writeBatch
} from 'firebase/firestore';
import { db as _db, auth as _auth } from '../lib/firebase';

// Assert non-null for hooks - Firebase must be configured for these features to work
function getDb() {
  if (!_db) {
    throw new Error('Firestore is not initialized. Please configure Firebase environment variables.');
  }
  return _db;
}

function getAuth() {
  if (!_auth) {
    throw new Error('Firebase Auth is not initialized. Please configure Firebase environment variables.');
  }
  return _auth;
}


// ========================================
// Types
// ========================================

export interface Transaction {
  id: string;
  amount: number;
  type: 'income' | 'expense';
  category: string;
  description: string;
  date: Timestamp;
  currency: 'EUR' | 'USD' | 'GBP' | 'AUD';
  showId?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Show {
  id: string;
  name: string;
  venue: string;
  city: string;
  country: string;
  date: Timestamp;
  fee: number;
  currency: string;
  status: 'confirmed' | 'tentative' | 'cancelled' | 'postponed';
  lat: number;
  lng: number;
  route?: string;
  promoter?: string;
  contractIds?: string[]; // IDs de contratos asociados
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: Timestamp;
  end: Timestamp;
  type: 'show' | 'travel' | 'meeting' | 'other';
  showId?: string;
  metadata?: Record<string, any>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Contact {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  company?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface FinanceSnapshotMetadata {
  id: string;
  asOf: Timestamp;
  month: {
    start: Timestamp;
    end: Timestamp;
    income: number;
    expenses: number;
    net: number;
  };
  year: {
    income: number;
    expenses: number;
    net: number;
  };
  pending: number;
  categories: string[];
  budgets: Record<string, number>;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

// ========================================
// Helper: Get current org path
// ========================================

function getCurrentOrgPath(): string {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error('Not authenticated');
  
  // TODO: Get from context or localStorage
  const orgId = localStorage.getItem('currentOrgId') || 'default';
  
  return `users/${currentUser.uid}/organizations/${orgId}`;
}

// ========================================
// Transactions Hooks
// ========================================

export function useTransactionsPaginated(
  snapshotId: string,
  pageSize = 50
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentSnapshot | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const loadMore = useCallback(async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    setError(null);

    try {
      const orgPath = getCurrentOrgPath();
      const txPath = `${orgPath}/finance_snapshots/${snapshotId}/transactions`;

      let constraints: QueryConstraint[] = [
        orderBy('date', 'desc'),
        limit(pageSize)
      ];

      if (lastDoc) {
        constraints.push(startAfter(lastDoc));
      }

      const q = query(collection(db, txPath), ...constraints);
      const snapshot = await getDocs(q);

      if (snapshot.empty) {
        setHasMore(false);
        setIsLoading(false);
        return;
      }

      const newTxs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Transaction[];

      setTransactions(prev => [...prev, ...newTxs]);
      const lastDocument = snapshot.docs[snapshot.docs.length - 1];
      if (lastDocument) {
        setLastDoc(lastDocument);
      }
      setHasMore(snapshot.docs.length === pageSize);
    } catch (err) {
      setError(err as Error);
      console.error('[useTransactionsPaginated] Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [snapshotId, pageSize, lastDoc, hasMore, isLoading]);

  // Initial load
  useEffect(() => {
    if (transactions.length === 0 && hasMore) {
      loadMore();
    }
  }, [snapshotId]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    transactions,
    loadMore,
    hasMore,
    isLoading,
    error
  };
}

export function useTransactionsByDateRange(
  snapshotId: string,
  startDate: Date,
  endDate: Date
) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const orgPath = getCurrentOrgPath();
      const txPath = `${orgPath}/finance_snapshots/${snapshotId}/transactions`;

      const q = query(
        collection(db, txPath),
        where('date', '>=', Timestamp.fromDate(startDate)),
        where('date', '<=', Timestamp.fromDate(endDate)),
        orderBy('date', 'desc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const txs = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Transaction[];

          setTransactions(txs);
          setIsLoading(false);
        },
        (err) => {
          setError(err as Error);
          setIsLoading(false);
          console.error('[useTransactionsByDateRange] Error:', err);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      console.error('[useTransactionsByDateRange] Error:', err);
      return undefined;
    }
  }, [snapshotId, startDate, endDate]);

  return { transactions, isLoading, error };
}

export async function createTransaction(
  snapshotId: string,
  data: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const orgPath = getCurrentOrgPath();
  const txPath = `${orgPath}/finance_snapshots/${snapshotId}/transactions`;

  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, txPath), {
    ...data,
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
}

export async function updateTransaction(
  snapshotId: string,
  transactionId: string,
  data: Partial<Omit<Transaction, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const orgPath = getCurrentOrgPath();
  const txPath = `${orgPath}/finance_snapshots/${snapshotId}/transactions`;

  await updateDoc(doc(db, txPath, transactionId), {
    ...data,
    updatedAt: Timestamp.now()
  });
}

export async function deleteTransaction(
  snapshotId: string,
  transactionId: string
): Promise<void> {
  const orgPath = getCurrentOrgPath();
  const txPath = `${orgPath}/finance_snapshots/${snapshotId}/transactions`;

  await deleteDoc(doc(db, txPath, transactionId));
}

// ========================================
// Shows Hooks
// ========================================

export function useShows(options?: {
  status?: Show['status'];
  dateFrom?: Date;
  dateTo?: Date;
  limit?: number;
}) {
  const [shows, setShows] = useState<Show[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const orgPath = getCurrentOrgPath();
      const showsPath = `${orgPath}/shows`;

      let constraints: QueryConstraint[] = [
        orderBy('date', 'desc')
      ];

      if (options?.status) {
        constraints.push(where('status', '==', options.status));
      }

      if (options?.dateFrom) {
        constraints.push(where('date', '>=', Timestamp.fromDate(options.dateFrom)));
      }

      if (options?.dateTo) {
        constraints.push(where('date', '<=', Timestamp.fromDate(options.dateTo)));
      }

      if (options?.limit) {
        constraints.push(limit(options.limit));
      }

      const q = query(collection(getDb(), showsPath), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const showsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Show[];

          setShows(showsData);
          setIsLoading(false);
        },
        (err) => {
          setError(err as Error);
          setIsLoading(false);
          console.error('[useShows] Error:', err);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      console.error('[useShows] Error:', err);
      return undefined;
    }
  }, [options?.status, options?.dateFrom, options?.dateTo, options?.limit]);

  return { shows, isLoading, error };
}

export async function createShow(
  data: Omit<Show, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const orgPath = getCurrentOrgPath();
  const showsPath = `${orgPath}/shows`;

  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, showsPath), {
    ...data,
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
}

export async function updateShow(
  showId: string,
  data: Partial<Omit<Show, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const orgPath = getCurrentOrgPath();
  const showsPath = `${orgPath}/shows`;

  await updateDoc(doc(db, showsPath, showId), {
    ...data,
    updatedAt: Timestamp.now()
  });
}

export async function deleteShow(showId: string): Promise<void> {
  const orgPath = getCurrentOrgPath();
  const showsPath = `${orgPath}/shows`;

  await deleteDoc(doc(db, showsPath, showId));
}

// ========================================
// Calendar Events Hooks
// ========================================

export function useCalendarEvents(options?: {
  type?: CalendarEvent['type'];
  dateFrom?: Date;
  dateTo?: Date;
}) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const orgPath = getCurrentOrgPath();
      const eventsPath = `${orgPath}/calendar_events`;

      let constraints: QueryConstraint[] = [
        orderBy('start', 'desc')
      ];

      if (options?.type) {
        constraints.push(where('type', '==', options.type));
      }

      if (options?.dateFrom) {
        constraints.push(where('start', '>=', Timestamp.fromDate(options.dateFrom)));
      }

      if (options?.dateTo) {
        constraints.push(where('start', '<=', Timestamp.fromDate(options.dateTo)));
      }

      const q = query(collection(getDb(), eventsPath), ...constraints);

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const eventsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as CalendarEvent[];

          setEvents(eventsData);
          setIsLoading(false);
        },
        (err) => {
          setError(err as Error);
          setIsLoading(false);
          console.error('[useCalendarEvents] Error:', err);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      console.error('[useCalendarEvents] Error:', err);
      return undefined;
    }
  }, [options?.type, options?.dateFrom, options?.dateTo]);

  return { events, isLoading, error };
}

export async function createCalendarEvent(
  data: Omit<CalendarEvent, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const orgPath = getCurrentOrgPath();
  const eventsPath = `${orgPath}/calendar_events`;

  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, eventsPath), {
    ...data,
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
}

// ========================================
// Contacts Hooks
// ========================================

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);

    try {
      const orgPath = getCurrentOrgPath();
      const contactsPath = `${orgPath}/contacts`;

      const q = query(
        collection(getDb(), contactsPath),
        orderBy('name', 'asc')
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const contactsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          })) as Contact[];

          setContacts(contactsData);
          setIsLoading(false);
        },
        (err) => {
          setError(err as Error);
          setIsLoading(false);
          console.error('[useContacts] Error:', err);
        }
      );

      return () => unsubscribe();
    } catch (err) {
      setError(err as Error);
      setIsLoading(false);
      console.error('[useContacts] Error:', err);
      return undefined;
    }
  }, []);

  return { contacts, isLoading, error };
}

export async function createContact(
  data: Omit<Contact, 'id' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const orgPath = getCurrentOrgPath();
  const contactsPath = `${orgPath}/contacts`;

  const now = Timestamp.now();
  const docRef = await addDoc(collection(db, contactsPath), {
    ...data,
    createdAt: now,
    updatedAt: now
  });

  return docRef.id;
}

// ========================================
// Aggregation Helpers
// ========================================

export async function getMonthlyTransactionTotals(
  snapshotId: string,
  month: Date
): Promise<{ income: number; expenses: number; net: number }> {
  const orgPath = getCurrentOrgPath();
  const txPath = `${orgPath}/finance_snapshots/${snapshotId}/transactions`;

  const monthStart = new Date(month.getFullYear(), month.getMonth(), 1);
  const monthEnd = new Date(month.getFullYear(), month.getMonth() + 1, 0);

  const q = query(
    collection(db, txPath),
    where('date', '>=', Timestamp.fromDate(monthStart)),
    where('date', '<=', Timestamp.fromDate(monthEnd))
  );

  const snapshot = await getDocs(q);

  const totals = snapshot.docs.reduce(
    (acc, doc) => {
      const tx = doc.data() as Transaction;
      if (tx.type === 'income') {
        acc.income += tx.amount;
      } else {
        acc.expenses += tx.amount;
      }
      return acc;
    },
    { income: 0, expenses: 0 }
  );

  return {
    ...totals,
    net: totals.income - totals.expenses
  };
}
