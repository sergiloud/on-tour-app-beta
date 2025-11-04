/**
 * useDragDropShows
 * Hook for dragging and dropping shows on the calendar
 * Includes haptic feedback and visual feedback
 *
 * @module hooks/useDragDropShows
 */

import { useRef, useCallback, useState } from 'react';

export interface DragShowData {
  showId: string;
  showName: string;
  currentDate: string;
  artist: string;
}

export interface DropTarget {
  date: string;
  time?: string;
  isValid: boolean;
}

export interface UseDragDropShowsOptions {
  onDrop?: (data: DragShowData, target: DropTarget) => void;
  onDragStart?: (data: DragShowData) => void;
  onDragEnd?: (success: boolean) => void;
  onValidateTarget?: (target: DropTarget) => boolean;
  enableHaptic?: boolean;
}

export interface DragShowState {
  isDragging: boolean;
  draggedShow: DragShowData | null;
  dragFeedback: string;
  highlightedDate: string | null;
}

/**
 * Hook for drag and drop shows with haptic feedback
 *
 * Usage:
 * ```tsx
 * const { state, handlers, validateTarget } = useDragDropShows({
 *   onDrop: (show, target) => updateShowDate(show, target),
 *   enableHaptic: true
 * });
 *
 * return (
 *   <>
 *     <Show
 *       draggable
 *       onDragStart={(e) => handlers.handleDragStart(e, showData)}
 *       onDragEnd={handlers.handleDragEnd}
 *     />
 *     <CalendarDay
 *       onDragOver={handlers.handleDragOver}
 *       onDrop={(e) => handlers.handleDrop(e, dateTarget)}
 *       highlighted={state.highlightedDate === date}
 *     />
 *   </>
 * );
 * ```
 */
export function useDragDropShows(
  options: UseDragDropShowsOptions = {}
) {
  const {
    onDrop,
    onDragStart,
    onDragEnd,
    onValidateTarget,
    enableHaptic = true,
  } = options;

  // State
  const [state, setState] = useState<DragShowState>({
    isDragging: false,
    draggedShow: null,
    dragFeedback: '',
    highlightedDate: null,
  });

  // Refs
  const dragTimerRef = useRef<NodeJS.Timeout | null>(null);

  /**
   * Trigger haptic feedback
   */
  const triggerHaptic = (intensity: 'light' | 'medium' | 'heavy' = 'medium') => {
    if (!enableHaptic || !('vibrate' in navigator)) return;

    const patterns: Record<'light' | 'medium' | 'heavy', number[]> = {
      light: [5],
      medium: [10, 5, 10],
      heavy: [20, 10, 20],
    };

    navigator.vibrate(patterns[intensity]);
  };

  /**
   * Handle drag start
   */
  const handleDragStart = useCallback(
    (event: React.DragEvent<HTMLElement>, showData: DragShowData) => {
      event.dataTransfer.effectAllowed = 'move';
      event.dataTransfer.setData('application/json', JSON.stringify(showData));

      triggerHaptic('light');

      setState((prev) => ({
        ...prev,
        isDragging: true,
        draggedShow: showData,
        dragFeedback: `Dragging ${showData.showName}...`,
      }));

      onDragStart?.(showData);
    },
    [onDragStart]
  );

  /**
   * Handle drag end
   */
  const handleDragEnd = useCallback(
    (event: React.DragEvent<HTMLElement>, success: boolean = false) => {
      event.preventDefault();

      if (success) {
        triggerHaptic('heavy');
      } else {
        triggerHaptic('light');
      }

      setState((prev) => ({
        ...prev,
        isDragging: false,
        draggedShow: null,
        dragFeedback: '',
        highlightedDate: null,
      }));

      onDragEnd?.(success);
    },
    [onDragEnd]
  );

  /**
   * Handle drag over
   */
  const handleDragOver = useCallback(
    (event: React.DragEvent<HTMLElement>, targetDate: string) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';

      // Clear previous timer
      if (dragTimerRef.current) {
        clearTimeout(dragTimerRef.current);
      }

      // Validate target
      const target: DropTarget = {
        date: targetDate,
        isValid: onValidateTarget?.({ date: targetDate, isValid: true }) ?? true,
      };

      if (target.isValid) {
        triggerHaptic('light');
        setState((prev) => ({
          ...prev,
          highlightedDate: targetDate,
          dragFeedback: `Moving to ${targetDate}...`,
        }));
      }
    },
    [onValidateTarget]
  );

  /**
   * Handle drag leave
   */
  const handleDragLeave = useCallback(() => {
    // Delay to avoid flickering on hover
    dragTimerRef.current = setTimeout(() => {
      setState((prev) => ({
        ...prev,
        highlightedDate: null,
      }));
    }, 100);
  }, []);

  /**
   * Handle drop
   */
  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLElement>, targetDate: string) => {
      event.preventDefault();
      event.stopPropagation();

      try {
        const data = event.dataTransfer.getData('application/json');
        const showData: DragShowData = JSON.parse(data);

        // Validate drop target
        const target: DropTarget = {
          date: targetDate,
          isValid:
            onValidateTarget?.({
              date: targetDate,
              isValid: true,
            }) ?? true,
        };

        if (target.isValid) {
          triggerHaptic('heavy');
          onDrop?.(showData, target);
          handleDragEnd(event, true);
        } else {
          triggerHaptic('light');
          handleDragEnd(event, false);
        }
      } catch (error) {
        console.error('[useDragDropShows] Drop error:', error);
        handleDragEnd(event, false);
      }
    },
    [onDrop, onValidateTarget, handleDragEnd]
  );

  /**
   * Cleanup
   */
  const cleanup = useCallback(() => {
    if (dragTimerRef.current) {
      clearTimeout(dragTimerRef.current);
    }
  }, []);

  return {
    // State
    state,
    isDragging: state.isDragging,
    draggedShow: state.draggedShow,
    highlightedDate: state.highlightedDate,
    dragFeedback: state.dragFeedback,

    // Handlers
    handlers: {
      handleDragStart,
      handleDragEnd,
      handleDragOver,
      handleDragLeave,
      handleDrop,
    },

    // Utilities
    triggerHaptic,
    cleanup,
  };
}
