/**
 * useCalendarGestures
 * Handles pinch-zoom, pan, and touch interactions for calendar views
 *
 * Features:
 * - Pinch-to-zoom: Scale between 0.8x and 2x
 * - Pan: Drag to move between weeks/months
 * - Swipe: Navigate between views
 * - Touch feedback: Visual indicators
 * - Fallback: Works without gesture support
 *
 * @module hooks/useCalendarGestures
 */

import { useRef, useState, useCallback, CSSProperties } from 'react';

export interface CalendarGestureState {
  scale: number;
  translateX: number;
  translateY: number;
}

export interface UseCalendarGesturesOptions {
  minScale?: number;
  maxScale?: number;
  onScaleChange?: (scale: number) => void;
  onPan?: (x: number, y: number) => void;
  onViewChange?: (direction: 'next' | 'prev') => void;
  enableGestures?: boolean;
}

export function useCalendarGestures(
  options: UseCalendarGesturesOptions = {}
) {
  const {
    minScale = 0.8,
    maxScale = 2,
    onScaleChange,
    onPan,
    onViewChange,
    enableGestures = true,
  } = options;

  // State
  const [state, setState] = useState<CalendarGestureState>({
    scale: 1,
    translateX: 0,
    translateY: 0,
  });

  const [isTransitioning, setIsTransitioning] = useState(false);

  // Track gesture state
  const gestureRef = useRef({
    initialScale: 1,
    initialDistance: 0,
    panStart: { x: 0, y: 0 },
    isPinching: false,
    isPanning: false,
    lastPanTime: 0,
    panVelocityX: 0,
  });

  /**
   * Clamp value between min and max
   */
  const clamp = (value: number, min: number, max: number) =>
    Math.max(min, Math.min(max, value));

  /**
   * Calculate distance between two touch points (for pinch)
   */
  const calculateDistance = (
    touch1: React.Touch,
    touch2: React.Touch
  ): number => {
    const dx = touch2.clientX - touch1.clientX;
    const dy = touch2.clientY - touch1.clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  /**
   * Handle pinch gesture (zoom)
   */
  const handlePinch = useCallback(
    (touches: React.TouchList) => {
      if (touches.length !== 2 || !enableGestures) return;

      const touch1 = touches[0]!;
      const touch2 = touches[1]!;
      const currentDistance = calculateDistance(touch1, touch2);
      const gesture = gestureRef.current;

      // First pinch: initialize
      if (!gesture.isPinching) {
        gesture.isPinching = true;
        gesture.initialScale = state.scale;
        gesture.initialDistance = currentDistance;
        return;
      }

      // Calculate scale delta
      if (gesture.initialDistance > 0) {
        const scaleDelta = currentDistance / gesture.initialDistance;
        const newScale = clamp(
          gesture.initialScale * scaleDelta,
          minScale,
          maxScale
        );

        setState((prev) => ({
          ...prev,
          scale: newScale,
        }));

        onScaleChange?.(newScale);
      }
    },
    [state.scale, enableGestures, minScale, maxScale, onScaleChange]
  );

  /**
   * Handle pan gesture (drag)
   */
  const handlePan = useCallback(
    (touches: React.TouchList) => {
      if (touches.length !== 1 || !enableGestures) return;

      const touch = touches[0]!;
      const gesture = gestureRef.current;
      const now = Date.now();

      // First touch: initialize pan
      if (!gesture.isPanning) {
        gesture.isPanning = true;
        gesture.panStart = { x: touch.clientX, y: touch.clientY };
        gesture.lastPanTime = now;
        gesture.panVelocityX = 0;
        return;
      }

      // Calculate delta
      const dx = touch.clientX - gesture.panStart.x;
      const dy = touch.clientY - gesture.panStart.y;
      const timeDelta = now - gesture.lastPanTime;

      // Calculate velocity
      if (timeDelta > 0) {
        gesture.panVelocityX = dx / timeDelta;
      }

      setState((prev) => ({
        ...prev,
        translateX: prev.translateX + dx / state.scale,
        translateY: prev.translateY + dy / state.scale,
      }));

      // Update pan start for next iteration
      gesture.panStart = { x: touch.clientX, y: touch.clientY };
      gesture.lastPanTime = now;

      onPan?.(state.translateX, state.translateY);
    },
    [state.scale, enableGestures, onPan]
  );

  /**
   * Handle touch move
   */
  const handleTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (!enableGestures) return;

      const touches = e.touches;

      if (touches.length === 2) {
        e.preventDefault();
        handlePinch(touches);
      } else if (touches.length === 1) {
        handlePan(touches);
      }
    },
    [enableGestures, handlePinch, handlePan]
  );

  /**
   * Handle touch end - detect swipe
   */
  const handleTouchEnd = useCallback(() => {
    const gesture = gestureRef.current;

    // Detect swipe based on velocity
    if (
      gesture.isPanning &&
      Math.abs(gesture.panVelocityX) > 0.5
    ) {
      if (gesture.panVelocityX < 0) {
        // Swiped left: next view
        onViewChange?.('next');
      } else if (gesture.panVelocityX > 0) {
        // Swiped right: prev view
        onViewChange?.('prev');
      }
    }

    // Reset gesture state
    gesture.isPinching = false;
    gesture.isPanning = false;
    gesture.initialScale = 1;
    gesture.initialDistance = 0;
    gesture.panVelocityX = 0;
  }, [onViewChange]);

  /**
   * Double-tap to zoom in/out
   */
  const handleDoubleTap = useCallback(() => {
    if (!enableGestures) return;
    setIsTransitioning(true);
    const newScale = state.scale > 1.2 ? 1 : 1.5;
    setState((prev) => ({ ...prev, scale: newScale }));
    onScaleChange?.(newScale);
    setTimeout(() => setIsTransitioning(false), 300);
  }, [enableGestures, state.scale, onScaleChange]);

  /**
   * Reset to default view
   */
  const reset = useCallback(() => {
    setIsTransitioning(true);
    setState({ scale: 1, translateX: 0, translateY: 0 });
    setTimeout(() => setIsTransitioning(false), 300);
  }, []);

  /**
   * Set specific scale
   */
  const setScale = useCallback(
    (newScale: number) => {
      const clampedScale = clamp(newScale, minScale, maxScale);
      setIsTransitioning(true);
      setState((prev) => ({ ...prev, scale: clampedScale }));
      onScaleChange?.(clampedScale);
      setTimeout(() => setIsTransitioning(false), 300);
    },
    [minScale, maxScale, onScaleChange]
  );

  /**
   * Get transform style object
   */
  const getTransformStyle = (): CSSProperties => ({
    transform: `translate(${state.translateX}px, ${state.translateY}px) scale(${state.scale})`,
    transformOrigin: 'center center',
    transition: isTransitioning
      ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)'
      : 'none',
  });

  /**
   * Bind touch handlers to element
   */
  const bind = () => ({
    onTouchMove: handleTouchMove,
    onTouchEnd: handleTouchEnd,
    onDoubleClick: handleDoubleTap,
    style: {
      touchAction: 'none',
      userSelect: 'none' as const,
    },
  });

  return {
    // State
    state,
    scale: state.scale,
    translateX: state.translateX,
    translateY: state.translateY,
    // Style getter
    getTransformStyle,
    // Bind handlers
    bind,
    // Controls
    reset,
    setScale,
    // UI state
    isTransitioning,
  };
}
