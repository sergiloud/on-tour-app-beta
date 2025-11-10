import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useCalendarGestures } from '../../hooks/useCalendarGestures';
import { useDragDropShows } from '../../hooks/useDragDropShows';

/**
 * GestureCalendarWrapper
 *
 * Wraps any calendar component with full gesture support:
 * - Pinch-to-zoom (0.8x - 2x)
 * - Pan/drag (translate X/Y)
 * - Swipe navigation (left/right for prev/next month)
 * - Double-tap zoom toggle (1x ↔ 1.5x)
 * - Drag-drop shows with haptic feedback
 *
 * Usage:
 * <GestureCalendarWrapper onNavigate={handleNavigation} onShowMove={handleShowMove}>
 *   <YourCalendarComponent />
 * </GestureCalendarWrapper>
 */

interface GestureCalendarWrapperProps {
  children: React.ReactNode;
  onNavigate?: (direction: 'next' | 'prev') => void;
  onShowMove?: (showId: string, toDate: string) => void;
  onShowDuplicate?: (showId: string, toDate: string) => void;
  disabled?: boolean;
  className?: string;
}

export const GestureCalendarWrapper: React.FC<GestureCalendarWrapperProps> = ({
  children,
  onNavigate,
  onShowMove,
  onShowDuplicate,
  disabled = false,
  className = '',
}) => {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);
  const [translateX, setTranslateX] = useState(0);
  const [translateY, setTranslateY] = useState(0);

  // Initialize gesture hook
  const gesture = useCalendarGestures({
    minScale: 0.8,
    maxScale: 2,
    onViewChange: (direction) => {
      if (onNavigate) {
        onNavigate(direction);
      }
    },
  });

  // Initialize drag-drop hook
  const dragDrop = useDragDropShows({
    onDrop: (show) => {
      // Handle drop if needed for additional feedback
      // The actual show move is handled by the calendar component
    },
  });

  // Update scale when gesture changes
  useEffect(() => {
    if (gesture.state) {
      setScale(gesture.state.scale || 1);
      setTranslateX(gesture.state.translateX || 0);
      setTranslateY(gesture.state.translateY || 0);
    }
  }, [gesture.state]);

  // Disable gestures on mobile if requested
  if (disabled) {
    return <>{children}</>;
  }

  // Check device capability
  const supportsGestures = 'TouchEvent' in window && 'ontouchstart' in document.documentElement;

  if (!supportsGestures) {
    return <>{children}</>;
  }

  return (
    <div
      ref={wrapperRef}
      {...gesture.bind()}
      style={{
        transform: `translate(${translateX}px, ${translateY}px) scale(${scale})`,
        transformOrigin: 'center top',
        transition: 'transform 0.3s ease-out',
        touchAction: 'none',
        willChange: 'transform',
      }}
      className={`relative w-full h-full ${className}`}
    >
      {children}
    </div>
  );
};

/**
 * GestureAwareShowCard
 *
 * Wraps show cards to make them draggable with gesture support
 * Provides visual feedback during drag operations
 */

interface GestureAwareShowCardProps {
  children: React.ReactNode;
  showId: string;
  showData: any; // Show object
  onDragStart?: (e: React.DragEvent, showId: string) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  enableHaptic?: boolean;
}

export const GestureAwareShowCard: React.FC<GestureAwareShowCardProps> = ({
  children,
  showId,
  showData,
  onDragStart,
  onDragEnd,
  enableHaptic = true,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Trigger haptic feedback on drag start
  const handleDragStart = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(true);

    // Haptic feedback
    if (enableHaptic && 'vibrate' in navigator) {
      try {
        navigator.vibrate([5]); // Light haptic
      } catch (err) {
        console.warn('Haptic feedback failed:', err);
      }
    }

    // Set drag data
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData(
        'application/json',
        JSON.stringify({
          type: 'show',
          id: showId,
          data: showData,
        })
      );

      // Drag image
      const dragImg = document.createElement('div');
      dragImg.textContent = showData.title || 'Show';
      dragImg.style.position = 'fixed';
      dragImg.style.top = '-1000px';
      dragImg.style.left = '-1000px';
      dragImg.style.padding = '2px 6px';
      dragImg.style.fontSize = '12px';
      dragImg.style.borderRadius = '6px';
      dragImg.style.background = 'rgba(99, 102, 241, 0.9)';
      dragImg.style.color = '#fff';
      dragImg.style.boxShadow = '0 0 0 1px rgba(255, 255, 255, 0.2)';
      document.body.appendChild(dragImg);

      try {
        e.dataTransfer.setDragImage(dragImg, 8, 8);
      } catch (err) {
        console.warn('Failed to set drag image:', err);
      }

      setTimeout(() => {
        try {
          document.body.removeChild(dragImg);
        } catch (err) {
          // Ignore
        }
      }, 0);
    }

    if (onDragStart) {
      onDragStart(e, showId);
    }
  }, [showId, showData, enableHaptic, onDragStart]);

  const handleDragEnd = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    setIsDragging(false);

    // Haptic feedback on drop
    if (enableHaptic && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 10, 20]); // Heavy haptic (confirmation)
      } catch (err) {
        console.warn('Haptic feedback failed:', err);
      }
    }

    if (onDragEnd) {
      onDragEnd(e);
    }
  }, [enableHaptic, onDragEnd]);

  return (
    <div
      ref={cardRef}
      draggable
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
      style={{
        opacity: isDragging ? 0.5 : 1,
        transition: 'opacity 0.2s ease-out',
        cursor: 'move',
      }}
      className="transition-opacity"
    >
      {children}
    </div>
  );
};

/**
 * GestureAwareDropZone
 *
 * Makes calendar day cells droppable with visual feedback
 */

interface GestureAwareDropZoneProps {
  children: React.ReactNode;
  dateStr: string;
  onDrop?: (showData: any, targetDate: string) => void;
  onDragOver?: (isOver: boolean) => void;
  className?: string;
  enableHaptic?: boolean;
}

export const GestureAwareDropZone: React.FC<GestureAwareDropZoneProps> = ({
  children,
  dateStr,
  onDrop,
  onDragOver,
  className = '',
  enableHaptic = true,
}) => {
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (e.dataTransfer) {
      e.dataTransfer.dropEffect = 'move';
    }

    setIsDragOver(true);

    // Haptic feedback on drag-over
    if (enableHaptic && 'vibrate' in navigator) {
      try {
        navigator.vibrate([10, 5, 10]); // Medium haptic
      } catch (err) {
        console.warn('Haptic feedback failed:', err);
      }
    }

    if (onDragOver) {
      onDragOver(true);
    }
  }, [enableHaptic, onDragOver]);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (onDragOver) {
      onDragOver(false);
    }
  }, [onDragOver]);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (onDragOver) {
      onDragOver(false);
    }

    // Heavy haptic on successful drop
    if (enableHaptic && 'vibrate' in navigator) {
      try {
        navigator.vibrate([20, 10, 20]); // Heavy haptic (confirmation)
      } catch (err) {
        console.warn('Haptic feedback failed:', err);
      }
    }

    if (e.dataTransfer && onDrop) {
      try {
        const jsonData = e.dataTransfer.getData('application/json');
        if (jsonData) {
          const showData = JSON.parse(jsonData);
          if (showData.type === 'show') {
            onDrop(showData.data, dateStr);
          }
        }
      } catch (err) {
        console.warn('Failed to parse drag data:', err);
      }
    }
  }, [dateStr, enableHaptic, onDrop, onDragOver]);

  return (
    <div
      ref={dropZoneRef}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      style={{
        backgroundColor: isDragOver ? 'rgba(99, 102, 241, 0.1)' : 'transparent',
        borderColor: isDragOver ? 'rgba(99, 102, 241, 0.5)' : 'transparent',
        borderWidth: '2px',
        borderStyle: 'dashed',
        transition: 'all 0.2s ease-out',
      }}
      className={`${className}`}
    >
      {children}
    </div>
  );
};

export default GestureCalendarWrapper;
