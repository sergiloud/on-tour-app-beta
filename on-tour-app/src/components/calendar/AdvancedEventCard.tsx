import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { t } from '../../lib/i18n';

type Props = {
  eventId: string;
  eventTitle: string;
  eventDate: string; // YYYY-MM-DD
  eventEndDate?: string; // YYYY-MM-DD (for multi-day)
  eventStatus?: string;
  eventColor?: string;
  onMove?: (eventId: string, newDate: string) => void;
  onExtend?: (eventId: string, newEndDate: string) => void;
  onDuplicate?: (eventId: string, onDate: string) => void;
  onDelete?: (eventId: string) => void;
  onEdit?: (eventId: string) => void;
  isDragging?: boolean;
  isDraggedOver?: boolean;
};

/**
 * Advanced Event Card with:
 * - Drag to move
 * - Drag edge to extend/shrink duration
 * - Right-click context menu
 * - Color coding
 * - Quick actions
 */
const AdvancedEventCard: React.FC<Props> = ({
  eventId,
  eventTitle,
  eventDate,
  eventEndDate,
  eventStatus,
  eventColor = 'accent',
  onMove,
  onExtend,
  onDuplicate,
  onDelete,
  onEdit,
  isDragging = false,
  isDraggedOver = false,
}) => {
  const [dragMode, setDragMode] = useState<'move' | 'extend-start' | 'extend-end' | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const contextRef = useRef<HTMLDivElement>(null);

  // Calculate duration in days
  const calcDuration = () => {
    if (!eventEndDate) return 1;
    const start = new Date(eventDate);
    const end = new Date(eventEndDate);
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  const duration = calcDuration();
  const hasMultipleDays = eventEndDate && eventEndDate !== eventDate;

  // Color mapping
  const colorClass = {
    accent: 'from-accent-500 to-accent-600',
    green: 'from-green-500 to-green-600',
    red: 'from-red-500 to-red-600',
    blue: 'from-blue-500 to-blue-600',
    yellow: 'from-yellow-500 to-yellow-600',
    purple: 'from-purple-500 to-purple-600',
  }[eventColor] || 'from-accent-500 to-accent-600';

  // Handle drag start
  const handleDragStart = (e: any, mode: 'move' | 'extend-start' | 'extend-end') => {
    setDragMode(mode);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('eventId', eventId);
      e.dataTransfer.setData('dragMode', mode);
    }
  };

  // Handle context menu
  const handleContextMenu = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setContextMenu({ x: e.clientX, y: e.clientY });
  };

  // Close context menu when clicking outside
  React.useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (contextRef.current && !contextRef.current.contains(e.target as Node)) {
        setContextMenu(null);
      }
    };
    if (contextMenu) {
      window.addEventListener('click', handleClick);
      return () => window.removeEventListener('click', handleClick);
    }
    return undefined;
  }, [contextMenu]);

  return (
    <>
      <motion.div
        ref={cardRef}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className={`
          relative group rounded-lg overflow-hidden cursor-move
          bg-gradient-to-r ${colorClass}
          border border-white/20 hover:border-white/40
          p-2.5 shadow-lg hover:shadow-xl
          transition-all duration-200
          ${isDraggedOver ? 'ring-2 ring-accent-300 scale-105' : ''}
          ${isDragging ? 'opacity-50' : 'opacity-100'}
        `}
        draggable
        onDragStart={(e) => handleDragStart(e, 'move')}
        onContextMenu={handleContextMenu}
      >
        {/* Event Content */}
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-white truncate">{eventTitle}</p>
              {eventStatus && (
                <span className="inline-block text-xs font-medium text-white/80 mt-0.5 capitalize">
                  {eventStatus}
                </span>
              )}
            </div>
            {/* Duration Badge */}
            {hasMultipleDays && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xs font-bold text-white bg-black/30 px-2 py-1 rounded-md whitespace-nowrap"
              >
                {duration}d
              </motion.span>
            )}
          </div>

          {/* Date Display */}
          <div className="text-xs text-white/70 space-y-1">
            <div>{new Date(eventDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}</div>
            {eventEndDate && eventEndDate !== eventDate && (
              <div className="text-white/60">
                → {new Date(eventEndDate).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
              </div>
            )}
          </div>
        </div>

        {/* Extend Handles (visible on hover) */}
        {hasMultipleDays && (
          <>
            {/* Start Extend Handle */}
            <div
              className="absolute left-0 top-0 bottom-0 w-1 hover:w-1.5 bg-white/40 hover:bg-white/80 cursor-col-resize opacity-0 group-hover:opacity-100 transition-all"
              draggable
              onDragStart={(e) => handleDragStart(e, 'extend-start')}
              title="Drag to shorten from start"
            />
            {/* End Extend Handle */}
            <div
              className="absolute right-0 top-0 bottom-0 w-1 hover:w-1.5 bg-white/40 hover:bg-white/80 cursor-col-resize opacity-0 group-hover:opacity-100 transition-all"
              draggable
              onDragStart={(e) => handleDragStart(e, 'extend-end')}
              title="Drag to extend duration"
            />
          </>
        )}

        {/* Quick Action Buttons */}
        <div className="absolute inset-0 bg-black/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
          {onEdit && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                onEdit(eventId);
              }}
              className="p-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors"
              title="Edit event"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </motion.button>
          )}
          {onDuplicate && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                const nextDay = new Date(eventDate);
                nextDay.setDate(nextDay.getDate() + (duration || 1));
                onDuplicate(eventId, nextDay.toISOString().slice(0, 10));
              }}
              className="p-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors"
              title="Duplicate event"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </motion.button>
          )}
          {onDelete && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${eventTitle}"?`)) {
                  onDelete(eventId);
                }
              }}
              className="p-2 rounded-lg bg-red-500 hover:bg-red-600 text-white transition-colors"
              title="Delete event"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </motion.button>
          )}
        </div>
      </motion.div>

      {/* Context Menu */}
      {contextMenu && (
        <motion.div
          ref={contextRef}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          className="fixed z-50 bg-slate-900 border border-white/20 rounded-lg shadow-2xl overflow-hidden"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
        >
          <button
            className="w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2"
            onClick={() => {
              onEdit?.(eventId);
              setContextMenu(null);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
            </svg>
            Edit
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2 border-t border-white/10"
            onClick={() => {
              const nextDay = new Date(eventDate);
              nextDay.setDate(nextDay.getDate() + (duration || 1));
              onDuplicate?.(eventId, nextDay.toISOString().slice(0, 10));
              setContextMenu(null);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Duplicate
          </button>
          <button
            className="w-full px-4 py-2 text-sm text-white hover:bg-white/10 transition-colors flex items-center gap-2 border-t border-white/10"
            onClick={() => {
              if (confirm(`Delete "${eventTitle}"?`)) {
                onDelete?.(eventId);
              }
              setContextMenu(null);
            }}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete
          </button>
        </motion.div>
      )}
    </>
  );
};

export default AdvancedEventCard;
