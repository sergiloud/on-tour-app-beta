import React from 'react';
import { motion } from 'framer-motion';
import EventChip from './EventChip';
import type { CalEvent } from './types';

type Props = {
  event: CalEvent;
  spanDays: number;
  isStart: boolean;
  isEnd: boolean;
  row: number;
  cellHeight: number;
  cellGap: number;
  onClick?: () => void;
  onResizeStart?: (e: React.DragEvent, direction: 'start' | 'end') => void;
  isSelected?: boolean;
  onMultiSelect?: (isSelected: boolean) => void;
  className?: string;
};

/**
 * Renders an event that spans multiple calendar days
 * Displays as a single bar stretching across cells
 */
const ExpandedEventBar: React.FC<Props> = ({
  event,
  spanDays,
  isStart,
  isEnd,
  row,
  cellHeight,
  cellGap,
  onClick,
  onResizeStart,
  isSelected,
  onMultiSelect,
  className = '',
}) => {
  const cellWidth = 100 / 7; // 7 days per week
  const totalWidth = cellWidth * spanDays;
  const topOffset = row * (cellHeight * 0.4); // Each row takes 40% of cell height

  return (
    <motion.div
      layoutId={`event-expanded-${event.id}`}
      className={`absolute z-10 ${className}`}
      style={{
        width: `${totalWidth}%`,
        height: `${cellHeight * 0.35}px`,
        top: `${topOffset}px`,
        left: 0,
      }}
      initial={{ opacity: 0, scaleX: 0.9 }}
      animate={{ opacity: 1, scaleX: 1 }}
      exit={{ opacity: 0, scaleX: 0.9 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
    >
      <div
        className={`
          relative w-full h-full rounded-md overflow-hidden
          ${isStart ? 'rounded-l-md' : 'rounded-l-none'}
          ${isEnd ? 'rounded-r-md' : 'rounded-r-none'}
          border transition-all
          hover:shadow-lg hover:z-20
        `}
        onClick={onClick}
      >
        <EventChip
          id={event.id}
          title={event.title}
          kind={event.kind}
          status={event.status}
          color={event.color}
          pinned={event.pinned}
          meta={event.meta}
          startIso={event.start}
          endIso={event.end}
          spanLength={spanDays}
          spanIndex={0}
          spanStart={isStart}
          spanEnd={isEnd}
          isSelected={isSelected}
          onMultiSelect={onMultiSelect}
          onResizeStart={onResizeStart}
          className="w-full h-full"
        />
      </div>
    </motion.div>
  );
};

export default React.memo(ExpandedEventBar);
