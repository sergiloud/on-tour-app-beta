import React from 'react';
import { motion } from 'framer-motion';
import EventChip from './EventChip';
import type { CalEvent } from './types';

type Props = {
  event: CalEvent;
  startDate: string; // First day of span
  endDate: string; // Last day of span
  spanDays: number; // Number of days wide
  isSpanStart: boolean; // Does event start on startDate?
  isSpanEnd: boolean; // Does event end on endDate?
  dayWidth: number; // Width of one calendar day cell
  onOpen?: () => void;
  onResizeStart?: (e: React.DragEvent, direction: 'start' | 'end') => void;
  isSelected?: boolean;
  onMultiSelect?: (isSelected: boolean) => void;
};

/**
 * Multi-day event bar that spans across calendar cells
 * Positioned absolutely to stretch across multiple days in a week
 */
const MultiDayEventStripe: React.FC<Props> = ({
  event,
  startDate,
  endDate,
  spanDays,
  isSpanStart,
  isSpanEnd,
  dayWidth,
  onOpen,
  onResizeStart,
  isSelected,
  onMultiSelect,
}) => {
  const isMultiDay = spanDays > 1;

  // Width calculation: each day is dayWidth pixels, minus 1px gap per day
  const width = spanDays * dayWidth - (spanDays - 1);

  return (
    <motion.div
      layout
      layoutId={`multiday-${event.id}`}
      className={`
        absolute top-1 h-6 left-0
        ${isMultiDay ? 'rounded-none' : 'rounded-md'}
        ${isSpanStart ? 'rounded-l-md' : 'rounded-l-none'}
        ${isSpanEnd ? 'rounded-r-md' : 'rounded-r-none'}
        overflow-hidden
        z-30
      `}
      style={{
        width: `${width}px`,
        pointerEvents: 'auto',
      }}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
    >
      <EventChip
        id={event.id}
        title={event.title}
        kind={event.kind}
        status={event.status}
        city={event.kind === 'show' ? event.title.split(',')[0] : undefined}
        color={event.color}
        pinned={event.pinned}
        meta={event.meta}
        isSelected={isSelected}
        onMultiSelect={onMultiSelect}
        onClick={onOpen}
        onResizeStart={onResizeStart}
        className="h-full w-full"
      />
    </motion.div>
  );
};

export default MultiDayEventStripe;
