import React from 'react';
import { motion } from 'framer-motion';
import EventChip from './EventChip';
import type { CalEvent } from './types';

type Props = {
  event: CalEvent;
  startDate: string; // First day of event in this month view
  endDate: string; // Last day of event in this month view
  spanDays: number; // Number of days this event spans (1-7 for one week, etc.)
  spanStartsHere: boolean; // True if event starts on startDate
  spanEndsHere: boolean; // True if event ends on endDate
  dayWidth: number; // Width of one day cell in grid (helps with positioning)
  onClick?: () => void;
  onResizeStart?: (e: React.DragEvent, direction: 'start' | 'end') => void;
  isSelected?: boolean;
  onMultiSelect?: (isSelected: boolean) => void;
};

/**
 * Multi-day event renderer that spans across calendar cells
 * Handles proper grid positioning and visual adaptation
 */
const MultiDayEventBar: React.FC<Props> = ({
  event,
  startDate,
  endDate,
  spanDays,
  spanStartsHere,
  spanEndsHere,
  dayWidth,
  onClick,
  onResizeStart,
  isSelected,
  onMultiSelect,
}) => {
  const isMultiDay = spanDays > 1;

  return (
    <motion.div
      className={`
        absolute top-0 left-0 h-6
        ${isMultiDay ? 'rounded-none' : 'rounded-md'}
        ${spanStartsHere ? 'rounded-l-md' : 'rounded-l-none'}
        ${spanEndsHere ? 'rounded-r-md' : 'rounded-r-none'}
        overflow-hidden
      `}
      style={{
        width: `calc(${dayWidth}px * ${spanDays} - 2px)`,
        zIndex: 20,
      }}
      layout
      layoutId={`event-${event.id}`}
      initial={{ opacity: 0, scaleX: 0.95 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={{ opacity: 0, scaleX: 0.95 }}
      transition={{
        type: 'spring',
        stiffness: 400,
        damping: 25,
        duration: 0.3
      }}
    >
      <EventChip
        id={event.id}
        title={event.title}
        status={event.status}
        kind={event.kind}
        startIso={event.date}
        endIso={event.endDate}
        city={event.city}
        country={event.country}
        meta={event.meta}
        color={event.color}
        pinned={event.pinned}
        spanLength={spanDays}
        spanIndex={0}
        spanStart={spanStartsHere}
        spanEnd={spanEndsHere}
        onClick={onClick}
        onResizeStart={onResizeStart}
        onMultiSelect={onMultiSelect}
        isSelected={isSelected}
        className={`
          ${isMultiDay ? 'text-[8px]' : 'text-[9px]'}
          px-2 py-1 w-full h-full
          ${spanDays > 3 ? 'justify-between' : ''}
        `}
      />
    </motion.div>
  );
};

export default React.memo(MultiDayEventBar);
