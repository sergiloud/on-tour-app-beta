import { useState } from 'react';
import { offlineQueue } from '../services/offlineQueue';

interface OptimisticUpdateOptions<T> {
  /** Collection name */
  collection: 'shows' | 'contacts' | 'venues' | 'transactions';
  /** Entity ID */
  entityId: string;
  /** Operation type */
  operation: 'create' | 'update' | 'delete';
  /** New data */
  data?: any;
  /** Optimistic update function (called immediately) */
  onOptimistic: () => void;
  /** Revert function (called on failure) */
  onRevert: () => void;
  /** Success callback (called after server confirms) */
  onSuccess?: () => void;
  /** Custom error message */
  errorMessage?: string;
}

/**
 * Hook for optimistic UI updates
 * Updates UI immediately, reverts on failure with snackbar
 * 
 * @example
 * ```tsx
 * const { performOptimistic, isProcessing, error } = useOptimisticUpdate();
 * 
 * const handleMarkComplete = async (taskId: string) => {
 *   const task = tasks.find(t => t.id === taskId);
 *   
 *   await performOptimistic({
 *     collection: 'shows',
 *     entityId: taskId,
 *     operation: 'update',
 *     data: { ...task, completed: true },
 *     onOptimistic: () => {
 *       // Update local state immediately
 *       setTasks(tasks.map(t => 
 *         t.id === taskId ? { ...t, completed: true } : t
 *       ));
 *     },
 *     onRevert: () => {
 *       // Revert on failure
 *       setTasks(tasks.map(t => 
 *         t.id === taskId ? { ...t, completed: false } : t
 *       ));
 *     },
 *   });
 * };
 * ```
 */
export const useOptimisticUpdate = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const performOptimistic = async <T,>(options: OptimisticUpdateOptions<T>) => {
    const {
      collection,
      entityId,
      operation,
      data,
      onOptimistic,
      onRevert,
      onSuccess,
      errorMessage = 'Failed to sync changes',
    } = options;

    setIsProcessing(true);
    setError(null);

    // Apply optimistic update immediately
    onOptimistic();

    // Queue operation with revert callback
    offlineQueue.addOperation(
      operation,
      collection,
      entityId,
      data,
      {
        optimistic: true,
        onRevert: () => {
          // Revert the UI change
          onRevert();
          
          // Show error notification
          const errorEvent = new CustomEvent('showSnackbar', {
            detail: {
              message: errorMessage,
              type: 'error',
              duration: 4000,
            },
          });
          window.dispatchEvent(errorEvent);
          
          setError(new Error(errorMessage));
          setIsProcessing(false);
        },
        onSuccess: () => {
          // Success callback
          if (onSuccess) {
            onSuccess();
          }
          setIsProcessing(false);
        },
        onFailure: (err) => {
          setError(err);
          setIsProcessing(false);
        },
      }
    );
  };

  const clearError = () => setError(null);

  return {
    performOptimistic,
    isProcessing,
    error,
    clearError,
  };
};

/**
 * Predefined optimistic actions for common operations
 */
export const optimisticActions = {
  /**
   * Mark item as favorite
   */
  toggleFavorite: <T extends { id: string; favorite?: boolean }>(
    item: T,
    updateState: (updater: (items: T[]) => T[]) => void
  ) => {
    const newFavorite = !item.favorite;
    
    return {
      onOptimistic: () => {
        updateState((items) =>
          items.map((i) => (i.id === item.id ? { ...i, favorite: newFavorite } : i))
        );
      },
      onRevert: () => {
        updateState((items) =>
          items.map((i) => (i.id === item.id ? { ...i, favorite: !newFavorite } : i))
        );
      },
    };
  },

  /**
   * Archive/unarchive item
   */
  toggleArchive: <T extends { id: string; archived?: boolean }>(
    item: T,
    updateState: (updater: (items: T[]) => T[]) => void
  ) => {
    const newArchived = !item.archived;
    
    return {
      onOptimistic: () => {
        updateState((items) =>
          items.map((i) => (i.id === item.id ? { ...i, archived: newArchived } : i))
        );
      },
      onRevert: () => {
        updateState((items) =>
          items.map((i) => (i.id === item.id ? { ...i, archived: !newArchived } : i))
        );
      },
    };
  },

  /**
   * Mark task/item as completed
   */
  toggleComplete: <T extends { id: string; completed?: boolean }>(
    item: T,
    updateState: (updater: (items: T[]) => T[]) => void
  ) => {
    const newCompleted = !item.completed;
    
    return {
      onOptimistic: () => {
        updateState((items) =>
          items.map((i) => (i.id === item.id ? { ...i, completed: newCompleted } : i))
        );
      },
      onRevert: () => {
        updateState((items) =>
          items.map((i) => (i.id === item.id ? { ...i, completed: !newCompleted } : i))
        );
      },
    };
  },

  /**
   * Delete item
   */
  deleteItem: <T extends { id: string }>(
    itemId: string,
    items: T[],
    updateState: (updater: (items: T[]) => T[]) => void
  ) => {
    const deletedItem = items.find((i) => i.id === itemId);
    
    return {
      onOptimistic: () => {
        updateState((items) => items.filter((i) => i.id !== itemId));
      },
      onRevert: () => {
        if (deletedItem) {
          updateState((items) => [...items, deletedItem]);
        }
      },
    };
  },
};
