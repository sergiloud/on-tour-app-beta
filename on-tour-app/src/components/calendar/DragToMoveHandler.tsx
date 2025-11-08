import React, { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { CalEvent } from './types';
import { t } from '../../lib/i18n';

interface DragToMoveHandlerProps {
  event: CalEvent;
  onMove?: (eventId: string, newDate: string, newStartTime?: string, newEndTime?: string) => void;
  onCopy?: (eventId: string, newDate: string) => void;
  children: React.ReactNode;
  isDraggable?: boolean;
}

/**
 * Drag-to-Move Handler Component
 * Manages dragging existing events to new times/dates
 * - Drag event to move to new time/date
 * - Alt+Drag to copy event
 * - Visual feedback during drag
 */
export const DragToMoveHandler: React.FC<DragToMoveHandlerProps> = ({
  event,
  onMove,
  onCopy,
  children,
  isDraggable = true,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const dragStartRef = useRef<{ x: number; y: number; isAlt: boolean } | null>(null);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (!isDraggable) return;

      // Only drag from the event chip itself, not from buttons
      if ((e.target as HTMLElement).closest('button')) return;

      dragStartRef.current = {
        x: e.clientX,
        y: e.clientY,
        isAlt: e.altKey,
      };

      setIsDragging(true);
    },
    [isDraggable]
  );

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    setDragOffset({ x: dx, y: dy });
  }, []);

  const handleMouseUp = useCallback(
    (e: MouseEvent) => {
      if (!dragStartRef.current) return;

      const isCopy = dragStartRef.current.isAlt;
      const element = document.elementFromPoint(e.clientX, e.clientY);

      // Find the time slot or date cell
      const timeSlot = element?.closest('[data-time-slot]') as HTMLElement;
      const dateCell = element?.closest('[data-date-cell]') as HTMLElement;

      if (timeSlot) {
        const newTime = timeSlot.getAttribute('data-time-slot');
        const newDate = timeSlot.getAttribute('data-date');

        if (newDate) {
          if (isCopy) {
            onCopy?.(event.id, newDate);
          } else {
            onMove?.(event.id, newDate, newTime);
          }
        }
      } else if (dateCell) {
        const newDate = dateCell.getAttribute('data-date');

        if (newDate) {
          if (isCopy) {
            onCopy?.(event.id, newDate);
          } else {
            onMove?.(event.id, newDate);
          }
        }
      }

      setIsDragging(false);
      setDragOffset({ x: 0, y: 0 });
      dragStartRef.current = null;
    },
    [event.id, onMove, onCopy]
  );

  React.useEffect(() => {
    if (!isDragging) return;

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, handleMouseMove, handleMouseUp]);

  return (
    <motion.div
      onMouseDown={handleMouseDown}
      animate={isDragging ? { scale: 1.05, opacity: 0.8 } : { scale: 1, opacity: 1 }}
      transition={{ duration: 0.2 }}
      className={`relative ${isDraggable ? 'cursor-grab active:cursor-grabbing' : ''}`}
      title={isDraggable ? `${t('calendar.drag.move') || 'Drag to move'} • Alt+Drag to copy` : undefined}
    >
      {isDragging && (
        <motion.div
          className="absolute inset-0 pointer-events-none rounded-lg ring-2 ring-accent-500 ring-offset-2 ring-offset-slate-900"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        />
      )}
      {children}
    </motion.div>
  );
};

export default DragToMoveHandler;
