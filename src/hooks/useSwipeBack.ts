import { useEffect, useRef, useCallback } from 'react';
import { haptic } from '../lib/haptics';

interface UseSwipeBackOptions {
  /** Callback when swipe-back is completed */
  onSwipeBack: () => void;
  /** Distance threshold to trigger swipe-back (default: 100px) */
  threshold?: number;
  /** Whether swipe-back is enabled (default: true) */
  enabled?: boolean;
  /** Edge margin to start gesture (default: 20px) */
  edgeMargin?: number;
}

/**
 * iOS-style swipe-back gesture
 * Swipe from left edge to go back
 * 
 * @example
 * const { ref } = useSwipeBack({
 *   onSwipeBack: () => navigate(-1),
 * });
 * <div ref={ref}>...</div>
 */
export const useSwipeBack = (options: UseSwipeBackOptions) => {
  const {
    onSwipeBack,
    threshold = 100,
    enabled = true,
    edgeMargin = 20,
  } = options;

  const ref = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number>(0);
  const touchStartY = useRef<number>(0);
  const isSwiping = useRef<boolean>(false);

  const handleTouchStart = useCallback(
    (e: TouchEvent) => {
      if (!enabled) return;

      const touch = e.touches[0];
      if (!touch) return;

      // Only start gesture if touch is near left edge
      if (touch.clientX > edgeMargin) return;

      touchStartX.current = touch.clientX;
      touchStartY.current = touch.clientY;
      isSwiping.current = true;
    },
    [enabled, edgeMargin]
  );

  const handleTouchMove = useCallback(
    (e: TouchEvent) => {
      if (!isSwiping.current || !enabled) return;

      const touch = e.touches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX.current;
      const deltaY = touch.clientY - touchStartY.current;

      // Prevent swipe if vertical scroll is dominant
      if (Math.abs(deltaY) > Math.abs(deltaX)) {
        isSwiping.current = false;
        return;
      }

      // Only swipe right (positive deltaX)
      if (deltaX > 0) {
        e.preventDefault();
      }
    },
    [enabled]
  );

  const handleTouchEnd = useCallback(
    (e: TouchEvent) => {
      if (!isSwiping.current || !enabled) return;

      const touch = e.changedTouches[0];
      if (!touch) return;

      const deltaX = touch.clientX - touchStartX.current;

      // Trigger swipe-back if threshold is met
      if (deltaX > threshold) {
        haptic('medium');
        onSwipeBack();
      }

      isSwiping.current = false;
      touchStartX.current = 0;
      touchStartY.current = 0;
    },
    [enabled, threshold, onSwipeBack]
  );

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    element.addEventListener('touchstart', handleTouchStart, { passive: true });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  return { ref };
};
