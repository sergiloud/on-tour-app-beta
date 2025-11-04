import React from 'react';
import WeekGrid from './WeekGrid';
import { GestureCalendarWrapper } from '../mobile/GestureCalendarWrapper';
import { useCalendarGestures } from '../../hooks/useCalendarGestures';
import type { CalEvent } from './types';

/**
 * EnhancedWeekGrid
 *
 * Wraps WeekGrid with gesture support:
 * - Pinch-to-zoom for week view
 * - Pan/swipe for navigation
 * - Double-tap to zoom
 */

interface EnhancedWeekGridProps {
  weekStart: string;
  eventsByDay: Map<string, CalEvent[]>;
  tz?: string;
  onOpen: (ev: CalEvent) => void;
  onNavigate?: (direction: 'next' | 'prev') => void;
  enableGestures?: boolean;
}

export const EnhancedWeekGrid: React.FC<EnhancedWeekGridProps> = ({
  enableGestures = true,
  onNavigate,
  ...props
}) => {
  const gesture = useCalendarGestures({
    minScale: 0.9,
    maxScale: 1.5,
    onViewChange: (direction) => {
      if (onNavigate) {
        onNavigate(direction);
      }
    },
  });

  if (!enableGestures) {
    return <WeekGrid {...props} />;
  }

  return (
    <GestureCalendarWrapper
      onNavigate={onNavigate}
      className="rounded-lg border border-white/10"
    >
      <WeekGrid {...props} />
    </GestureCalendarWrapper>
  );
};

export default EnhancedWeekGrid;
