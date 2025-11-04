import React from 'react';
import DayGrid from './DayGrid';
import { GestureCalendarWrapper } from '../mobile/GestureCalendarWrapper';
import { useCalendarGestures } from '../../hooks/useCalendarGestures';
import type { CalEvent } from './types';

/**
 * EnhancedDayGrid
 *
 * Wraps DayGrid with gesture support:
 * - Pan/swipe for navigation between days
 * - Double-tap to zoom
 * - No pinch-zoom for day view (too detailed)
 */

interface EnhancedDayGridProps {
  day: string; // YYYY-MM-DD
  events: CalEvent[];
  tz?: string;
  onOpen: (ev: CalEvent) => void;
  onNavigate?: (direction: 'next' | 'prev') => void;
  enableGestures?: boolean;
}

export const EnhancedDayGrid: React.FC<EnhancedDayGridProps> = ({
  enableGestures = true,
  onNavigate,
  ...props
}) => {
  const gesture = useCalendarGestures({
    minScale: 1,
    maxScale: 1, // Disable zoom for day view
    onViewChange: (direction) => {
      if (onNavigate) {
        onNavigate(direction);
      }
    },
  });

  if (!enableGestures) {
    return <DayGrid {...props} />;
  }

  return (
    <GestureCalendarWrapper
      onNavigate={onNavigate}
      className="rounded-lg border border-white/10"
    >
      <DayGrid {...props} />
    </GestureCalendarWrapper>
  );
};

export default EnhancedDayGrid;
