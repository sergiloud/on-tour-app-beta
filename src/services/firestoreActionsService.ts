import { getFirestore, doc, setDoc, getDoc, onSnapshot, Unsubscribe } from 'firebase/firestore';
import { app } from '../lib/firebase';
import { logger } from '../lib/logger';

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
      logger.warn('[FirestoreActionsService] No userId provided or Firebase not initialized', { userId });
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
      logger.info('[FirestoreActionsService] Completed actions saved', { userId, count: actionIds.length });
    } catch (error) {
      logger.error('[FirestoreActionsService] Error saving completed actions', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Obtiene las acciones completadas del usuario
   */
  static async getCompletedActions(userId: string): Promise<string[]> {
    if (!userId || !db) {
      logger.warn('[FirestoreActionsService] No userId provided or Firebase not initialized', { userId });
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
      logger.error('[FirestoreActionsService] Error getting completed actions', error as Error, { userId });
      return [];
    }
  }

  /**
   * Marca una acción como completada
   */
  static async markActionCompleted(userId: string, actionId: string): Promise<void> {
    if (!userId || !actionId || !db) {
      logger.warn('[FirestoreActionsService] Missing userId, actionId, or Firebase not initialized', { userId, actionId });
      return;
    }

    try {
      const currentActions = await this.getCompletedActions(userId);
      if (!currentActions.includes(actionId)) {
        const updatedActions = [...currentActions, actionId];
        await this.saveCompletedActions(userId, updatedActions);
      }
    } catch (error) {
      logger.error('[FirestoreActionsService] Error marking action completed', error as Error, { userId, actionId });
      throw error;
    }
  }

  /**
   * Desmarca una acción como completada
   */
  static async unmarkActionCompleted(userId: string, actionId: string): Promise<void> {
    if (!userId || !actionId) {
      logger.warn('[FirestoreActionsService] Missing userId or actionId', { userId, actionId });
      return;
    }

    try {
      const currentActions = await this.getCompletedActions(userId);
      const updatedActions = currentActions.filter(id => id !== actionId);
      await this.saveCompletedActions(userId, updatedActions);
    } catch (error) {
      logger.error('[FirestoreActionsService] Error unmarking action', error as Error, { userId, actionId });
      throw error;
    }
  }

  /**
   * Limpia todas las acciones completadas
   */
  static async clearCompletedActions(userId: string): Promise<void> {
    if (!userId) {
      logger.warn('[FirestoreActionsService] No userId provided', { userId });
      return;
    }

    try {
      await this.saveCompletedActions(userId, []);
    } catch (error) {
      logger.error('[FirestoreActionsService] Error clearing actions', error as Error, { userId });
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
      logger.warn('[FirestoreActionsService] No userId or Firebase not initialized for subscription', { userId });
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
        logger.error('[FirestoreActionsService] Error in subscription', error as Error, { userId });
      }
    );
  }

  /**
   * Migra acciones completadas desde localStorage a Firestore
   */
  static async migrateFromLocalStorage(userId: string): Promise<void> {
    if (!userId || !db) {
      logger.warn('[FirestoreActionsService] No userId or Firebase not initialized for migration', { userId });
      return;
    }

    try {
      // Verificar si ya hay datos en Firestore
      const existingActions = await this.getCompletedActions(userId);
      if (existingActions.length > 0) {
        logger.info('[FirestoreActionsService] Firestore data already exists, skipping migration', { userId });
        return;
      }

      // Obtener datos de localStorage
      const localData = localStorage.getItem('on-tour-completed-actions');
      if (!localData) {
        logger.info('[FirestoreActionsService] No localStorage data to migrate', { userId });
        return;
      }

      const localActions: string[] = JSON.parse(localData);
      if (localActions.length > 0) {
        await this.saveCompletedActions(userId, localActions);
        logger.info('[FirestoreActionsService] Migrated completed actions from localStorage', { userId, count: localActions.length });
      }
    } catch (error) {
      logger.error('[FirestoreActionsService] Error during migration', error as Error, { userId });
    }
  }
}
