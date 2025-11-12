import { getFirestore, doc, setDoc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { app } from '../lib/firebase';

const db = app ? getFirestore(app) : null;

export interface CompletedActions {
  userId: string;
  completedActionIds: string[];
  lastUpdated: number;
}

export class FirestoreActionsService {
  /**
   * Guarda las acciones completadas del usuario
   */
  static async saveCompletedActions(userId: string, actionIds: string[]): Promise<void> {
    if (!userId || !db) {
      console.warn('[FirestoreActionsService] No userId provided or Firebase not initialized');
      return;
    }

    try {
      const actionsRef = doc(db, `users/${userId}/profile/completedActions`);
      const data: CompletedActions = {
        userId,
        completedActionIds: actionIds,
        lastUpdated: Date.now()
      };

      await setDoc(actionsRef, data, { merge: true });
      console.log('[FirestoreActionsService] Completed actions saved:', actionIds.length);
    } catch (error) {
      console.error('[FirestoreActionsService] Error saving completed actions:', error);
      throw error;
    }
  }

  /**
   * Obtiene las acciones completadas del usuario
   */
  static async getCompletedActions(userId: string): Promise<string[]> {
    if (!userId || !db) {
      console.warn('[FirestoreActionsService] No userId provided or Firebase not initialized');
      return [];
    }

    try {
      const actionsRef = doc(db, `users/${userId}/profile/completedActions`);
      const docSnap = await getDoc(actionsRef);

      if (docSnap.exists()) {
        const data = docSnap.data() as CompletedActions;
        return data.completedActionIds || [];
      }

      return [];
    } catch (error) {
      console.error('[FirestoreActionsService] Error getting completed actions:', error);
      return [];
    }
  }

  /**
   * Marca una acción como completada
   */
  static async markActionCompleted(userId: string, actionId: string): Promise<void> {
    if (!userId || !actionId || !db) {
      console.warn('[FirestoreActionsService] Missing userId, actionId, or Firebase not initialized');
      return;
    }

    try {
      const currentActions = await this.getCompletedActions(userId);
      if (!currentActions.includes(actionId)) {
        const updatedActions = [...currentActions, actionId];
        await this.saveCompletedActions(userId, updatedActions);
      }
    } catch (error) {
      console.error('[FirestoreActionsService] Error marking action completed:', error);
      throw error;
    }
  }

  /**
   * Desmarca una acción como completada
   */
  static async unmarkActionCompleted(userId: string, actionId: string): Promise<void> {
    if (!userId || !actionId) {
      console.warn('[FirestoreActionsService] Missing userId or actionId');
      return;
    }

    try {
      const currentActions = await this.getCompletedActions(userId);
      const updatedActions = currentActions.filter(id => id !== actionId);
      await this.saveCompletedActions(userId, updatedActions);
    } catch (error) {
      console.error('[FirestoreActionsService] Error unmarking action:', error);
      throw error;
    }
  }

  /**
   * Limpia todas las acciones completadas
   */
  static async clearCompletedActions(userId: string): Promise<void> {
    if (!userId) {
      console.warn('[FirestoreActionsService] No userId provided');
      return;
    }

    try {
      await this.saveCompletedActions(userId, []);
    } catch (error) {
      console.error('[FirestoreActionsService] Error clearing actions:', error);
      throw error;
    }
  }

  /**
   * Suscribe a cambios en tiempo real de las acciones completadas
   */
  static subscribeToCompletedActions(
    userId: string,
    onUpdate: (actionIds: string[]) => void
  ): Unsubscribe {
    if (!userId || !db) {
      console.warn('[FirestoreActionsService] No userId or Firebase not initialized for subscription');
      return () => {};
    }

    const actionsRef = doc(db, `users/${userId}/profile/completedActions`);

    return onSnapshot(
      actionsRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data() as CompletedActions;
          onUpdate(data.completedActionIds || []);
        } else {
          onUpdate([]);
        }
      },
      (error) => {
        console.error('[FirestoreActionsService] Error in subscription:', error);
      }
    );
  }

  /**
   * Migra acciones completadas desde localStorage a Firestore
   */
  static async migrateFromLocalStorage(userId: string): Promise<void> {
    if (!userId || !db) {
      console.warn('[FirestoreActionsService] No userId or Firebase not initialized for migration');
      return;
    }

    try {
      // Verificar si ya hay datos en Firestore
      const existingActions = await this.getCompletedActions(userId);
      if (existingActions.length > 0) {
        console.log('[FirestoreActionsService] Firestore data already exists, skipping migration');
        return;
      }

      // Obtener datos de localStorage
      const localData = localStorage.getItem('on-tour-completed-actions');
      if (!localData) {
        console.log('[FirestoreActionsService] No localStorage data to migrate');
        return;
      }

      const localActions: string[] = JSON.parse(localData);
      if (localActions.length > 0) {
        await this.saveCompletedActions(userId, localActions);
        console.log(`[FirestoreActionsService] Migrated ${localActions.length} completed actions from localStorage`);
      }
    } catch (error) {
      console.error('[FirestoreActionsService] Error during migration:', error);
    }
  }
}
