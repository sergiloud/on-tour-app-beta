/**
 * Firestore Finance Service - Cloud sync for financial transactions
 * Handles income/expenses, budgets, and financial targets
 * Data isolation: users/{userId}/transactions/{transactionId}
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
import { logger } from '../lib/logger';

export interface FinanceTransaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  currency: string;
  category: string;
  showId?: string;
  description: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface FinanceTargets {
  monthlyRevenue: number;
  categoryBudgets: Record<string, number>;
  savingsGoal: number;
  updatedAt: string;
}

export class FirestoreFinanceService {
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
   * Save transaction to Firestore
   */
  static async saveTransaction(transaction: FinanceTransaction, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const transactionRef = doc(db, `users/${userId}/organizations/${orgId}/transactions/${transaction.id}`);
    const transactionData = this.removeUndefined({
      ...transaction,
      updatedAt: Timestamp.now()
    });

    await setDoc(transactionRef, transactionData, { merge: true });
  }

  /**
   * Get single transaction by ID
   */
  static async getTransaction(transactionId: string, userId: string, orgId: string): Promise<FinanceTransaction | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const transactionRef = doc(db, `users/${userId}/organizations/${orgId}/transactions/${transactionId}`);
    const transactionSnap = await getDoc(transactionRef);

    if (!transactionSnap.exists()) {
      return null;
    }

    const data = transactionSnap.data();
    return {
      ...data,
      id: transactionSnap.id,
      date: data.date?.toDate?.().toISOString() || data.date,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
    } as FinanceTransaction;
  }

  /**
   * Get all transactions for a user
   */
  static async getUserTransactions(userId: string, orgId: string): Promise<FinanceTransaction[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const transactionsRef = collection(db, `users/${userId}/organizations/${orgId}/transactions`);
    const q = query(transactionsRef, orderBy('date', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date?.toDate?.().toISOString() || data.date,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
      } as FinanceTransaction;
    });
  }

  /**
   * Get transactions by type (income or expense)
   */
  static async getTransactionsByType(
    type: 'income' | 'expense',
    userId: string,
    orgId: string
  ): Promise<FinanceTransaction[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const transactionsRef = collection(db, `users/${userId}/organizations/${orgId}/transactions`);
    const q = query(
      transactionsRef,
      where('type', '==', type),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date?.toDate?.().toISOString() || data.date,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
      } as FinanceTransaction;
    });
  }

  /**
   * Get transactions for a specific show
   */
  static async getTransactionsByShow(showId: string, userId: string, orgId: string): Promise<FinanceTransaction[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const transactionsRef = collection(db, `users/${userId}/organizations/${orgId}/transactions`);
    const q = query(
      transactionsRef,
      where('showId', '==', showId),
      orderBy('date', 'desc')
    );
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        date: data.date?.toDate?.().toISOString() || data.date,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
      } as FinanceTransaction;
    });
  }

  /**
   * Delete transaction from Firestore
   */
  static async deleteTransaction(transactionId: string, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const transactionRef = doc(db, `users/${userId}/organizations/${orgId}/transactions/${transactionId}`);
    await deleteDoc(transactionRef);
  }

  /**
   * Batch save multiple transactions (for migration/import)
   */
  static async saveTransactions(transactions: FinanceTransaction[], userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const promises = transactions.map(transaction =>
      this.saveTransaction(transaction, userId, orgId)
    );

    await Promise.all(promises);
  }

  /**
   * Subscribe to real-time updates for user's transactions
   */
  static subscribeToUserTransactions(
    userId: string,
    orgId: string,
    callback: (transactions: FinanceTransaction[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const transactionsRef = collection(db, `users/${userId}/organizations/${orgId}/transactions`);
    const q = query(transactionsRef, orderBy('date', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const transactions = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          date: data.date?.toDate?.().toISOString() || data.date,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
        } as FinanceTransaction;
      });

      callback(transactions);
    });
  }

  /**
   * Save financial targets (budgets, goals)
   */
  static async saveTargets(targets: FinanceTargets, userId: string, orgId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const targetsRef = doc(db, `users/${userId}/organizations/${orgId}/finance/targets`);
    const targetsData = this.removeUndefined({
      ...targets,
      updatedAt: Timestamp.now()
    });

    await setDoc(targetsRef, targetsData, { merge: true });
  }

  /**
   * Get financial targets
   */
  static async getTargets(userId: string, orgId: string): Promise<FinanceTargets | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const targetsRef = doc(db, `users/${userId}/organizations/${orgId}/finance/targets`);
    const targetsSnap = await getDoc(targetsRef);

    if (!targetsSnap.exists()) {
      return null;
    }

    const data = targetsSnap.data();
    return {
      ...data,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
    } as FinanceTargets;
  }

  /**
   * Migrate localStorage transactions to Firestore
   * Only runs once per user (idempotent)
   */
  static async migrateFromLocalStorage(userId: string, orgId: string): Promise<number> {
    if (!db) {
      return 0;
    }

    try {
      // Check if user already has transactions in Firestore
      const existing = await this.getUserTransactions(userId, orgId);
      if (existing.length > 0) {
        return 0; // Already migrated
      }

      // Load transactions from localStorage (expenses.ts format)
      const { loadExpenses } = await import('../lib/expenses');
      const expenses = loadExpenses();
      
      if (!expenses || expenses.length === 0) {
        return 0;
      }

      // Convert expenses to FinanceTransaction format
      const transactions: FinanceTransaction[] = expenses.map(expense => ({
        id: expense.id || crypto.randomUUID(),
        type: 'expense',
        amount: expense.amount,
        currency: expense.currency || 'EUR',
        category: expense.category,
        description: expense.description,
        date: expense.date,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Migrate transactions to Firestore
      await this.saveTransactions(transactions, userId, orgId);

      return transactions.length;
    } catch (error) {
      logger.error('[FirestoreFinanceService] Failed to migrate transactions', error as Error, { userId });
      return 0;
    }
  }
}
