import React from 'react';
import MonthGrid from './MonthGrid';
import { GestureCalendarWrapper, GestureAwareShowCard, GestureAwareDropZone } from '../mobile/GestureCalendarWrapper';
import { useCalendarGestures } from '../../hooks/useCalendarGestures';
import type { CalEvent } from './types';

/**
 * EnhancedMonthGrid
 *
 * Wraps MonthGrid with gesture support:
 * - Pinch-to-zoom for calendar view
 * - Pan/swipe for navigation
 * - Double-tap to zoom
 * - Drag-drop with haptic feedback
 */

interface EnhancedMonthGridProps {
  grid: Array<Array<{ dateStr: string; inMonth: boolean; weekend: boolean }>>;
  eventsByDay: Map<string, CalEvent[]>;
  today: string;
  selectedDay: string;
  setSelectedDay: (d: string) => void;
  onOpen: (ev: CalEvent) => void;
  locale?: string;
  tz?: string;
  onOpenDay?: (dateStr: string) => void;
  onMoveShow?: (showId: string, toDate: string, duplicate?: boolean) => void;
  onQuickAdd?: (dateStr: string) => void;
  onQuickAddSave?: (dateStr: string, data: { city: string; country: string; fee?: number }) => void;
  ariaDescribedBy?: string;
  heatmapMode?: 'none' | 'financial' | 'activity';
  shows?: Array<{ id: string; date: string; fee: number; status: string }>;
  enableGestures?: boolean;
}

export const EnhancedMonthGrid: React.FC<EnhancedMonthGridProps> = ({
  enableGestures = true,
  ...props
}) => {
  const gesture = useCalendarGestures({
    minScale: 0.8,
    maxScale: 2,
    onViewChange: (direction) => {
      // Could dispatch view change events
      console.log('Navigate to:', direction);
    },
  });

  if (!enableGestures) {
    return <MonthGrid {...props} />;
  }

  return (
    <GestureCalendarWrapper
      onNavigate={(direction) => {
        // Handle calendar navigation
        console.log('Navigate:', direction);
      }}
      onShowMove={(showId, toDate) => {
        if (props.onMoveShow) {
          props.onMoveShow(showId, toDate);
        }
      }}
      className="rounded-lg border border-white/10"
    >
      <MonthGrid {...props} />
    </GestureCalendarWrapper>
  );
};

export default EnhancedMonthGrid;
