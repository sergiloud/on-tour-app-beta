import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalendarEvent, getEventDateRange, isMultiDayEvent, colorMap } from './AdvancedCalendarTypes';
import { ChevronRight, Copy, Trash2, Edit2, Flag } from 'lucide-react';

interface MultiDayEventEditorProps {
  event: CalendarEvent;
  onUpdate: (event: CalendarEvent) => void;
  onDelete: (eventId: string) => void;
  onClose: () => void;
}

/**
 * Component to edit and manage multi-day events
 * Allows extending/shrinking event duration, duplicating, and quick actions
 */
export const MultiDayEventEditor: React.FC<MultiDayEventEditorProps> = ({
  event,
  onUpdate,
  onDelete,
  onClose,
}) => {
  const [startDate, setStartDate] = useState(event.date);
  const [endDate, setEndDate] = useState(event.endDate || event.date);
  const [expanded, setExpanded] = useState(false);
  const dateRange = getEventDateRange(event);
  const duration = dateRange.length;

  const handleExtendStart = () => {
    const newStart = new Date(startDate);
    newStart.setDate(newStart.getDate() - 1);
    setStartDate(newStart.toISOString().slice(0, 10));
  };

  const handleShrinkStart = () => {
    if (startDate < endDate) {
      const newStart = new Date(startDate);
      newStart.setDate(newStart.getDate() + 1);
      setStartDate(newStart.toISOString().slice(0, 10));
    }
  };

  const handleExtendEnd = () => {
    const newEnd = new Date(endDate);
    newEnd.setDate(newEnd.getDate() + 1);
    setEndDate(newEnd.toISOString().slice(0, 10));
  };

  const handleShrinkEnd = () => {
    if (endDate > startDate) {
      const newEnd = new Date(endDate);
      newEnd.setDate(newEnd.getDate() - 1);
      setEndDate(newEnd.toISOString().slice(0, 10));
    }
  };

  const handleSave = () => {
    onUpdate({
      ...event,
      date: startDate,
      endDate: endDate !== startDate ? endDate : undefined,
    });
    onClose();
  };

  const newDuration = Math.floor(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) /
      (1000 * 60 * 60 * 24)
  ) + 1;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        className={`relative rounded-xl border border-slate-200 dark:border-white/10 bg-gradient-to-br from-slate-900/50 to-slate-800/30
          backdrop-blur-md shadow-2xl w-full max-w-md p-6`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-3 h-8 rounded-full bg-gradient-to-b ${colorMap[event.color || 'accent']}`} />
            <div>
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{event.title}</h3>
              <p className="text-xs text-slate-300 dark:text-white/50">{event.kind === 'show' ? '🎤 Show' : '✈️ Travel'}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-300 dark:text-white/50 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        {/* Duration Info */}
        <div className="mb-4 p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-white/10">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-slate-500 dark:text-white/70 uppercase">Duration</p>
            <p className="text-sm font-bold text-accent-300">{newDuration} {newDuration === 1 ? 'day' : 'days'}</p>
          </div>
          {duration > 1 && (
            <p className="text-xs text-slate-300 dark:text-white/40">
              Originally: {duration} days
            </p>
          )}
        </div>

        {/* Date Range Editor */}
        <div className="space-y-3 mb-6">
          {/* Start Date */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-white/70 uppercase mb-2 block">
              Start Date
            </label>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShrinkStart}
                disabled={startDate >= endDate}
                className="p-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 disabled:opacity-30 transition"
              >
                ←
              </motion.button>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900/40 border border-white/10
                  text-white text-sm focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/20"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExtendStart}
                className="p-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 transition"
              >
                →
              </motion.button>
            </div>
          </div>

          {/* End Date */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-white/70 uppercase mb-2 block">
              End Date
            </label>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleShrinkEnd}
                disabled={endDate <= startDate}
                className="p-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 disabled:opacity-30 transition"
              >
                ←
              </motion.button>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="flex-1 px-3 py-2 rounded-lg bg-slate-900/40 border border-white/10
                  text-white text-sm focus:border-accent-500/40 focus:ring-2 focus:ring-accent-500/20"
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExtendEnd}
                className="p-2 rounded-lg bg-slate-200 dark:bg-white/10 hover:bg-slate-300 dark:hover:bg-white/15 transition"
              >
                →
              </motion.button>
            </div>
          </div>
        </div>

        {/* Toggle Details */}
        <motion.button
          onClick={() => setExpanded(!expanded)}
          className="w-full flex items-center justify-between p-2 rounded-lg bg-white/5
            hover:bg-slate-200 dark:bg-white/10 transition text-xs text-slate-500 dark:text-white/70 mb-4"
        >
          <span>More Options</span>
          <motion.div
            animate={{ rotate: expanded ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight size={16} />
          </motion.div>
        </motion.button>

        {/* Expanded Options */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-2 mb-4 pb-4 border-b border-white/10"
            >
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-blue-500/10
                  hover:bg-blue-500/20 text-blue-300 text-sm transition"
              >
                <Flag size={16} />
                Pin Event
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full flex items-center gap-2 p-2 rounded-lg bg-purple-500/10
                  hover:bg-purple-500/20 text-purple-300 text-sm transition"
              >
                <Copy size={16} />
                Duplicate
              </motion.button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              onDelete(event.id);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 p-2 rounded-lg
              bg-red-500/10 border border-red-500/20 hover:border-red-500/40
              text-red-400 text-sm font-medium transition"
          >
            <Trash2 size={16} />
            Delete
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSave}
            className="flex-1 p-2 rounded-lg bg-accent-500/20 border border-accent-500/30
              hover:border-accent-500/60 text-accent-300 text-sm font-medium transition"
          >
            Save Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

interface MultiDayEventBarProps {
  event: CalendarEvent;
  span: number;
  position: number;
  isMultiDay: boolean;
  onClick: () => void;
  onDragStart: (e: React.DragEvent) => void;
}

/**
 * Visual component for multi-day event bar in calendar grid
 */
export const MultiDayEventBar: React.FC<MultiDayEventBarProps> = ({
  event,
  span,
  position,
  isMultiDay,
  onClick,
  onDragStart,
}) => {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      className={`relative cursor-move rounded-lg px-2 py-1 border backdrop-blur-sm
        bg-gradient-to-r ${colorMap[event.color || 'accent']}
        hover:shadow-lg hover:brightness-110 transition-all`}
      style={{
        gridColumn: `${position + 1} / span ${Math.min(span, 7 - position)}`,
        minHeight: '28px',
      }}
    >
      <motion.div
        initial={{ opacity: 0, x: -10 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-1.5"
      >
        <span className="text-xs font-semibold truncate text-slate-900 dark:text-white">{event.title}</span>
        {isMultiDay && (
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/20 text-slate-600 dark:text-white/80 whitespace-nowrap">
            Multi
          </span>
        )}
        {event.pinned && <span className="text-xs">📌</span>}
      </motion.div>
    </div>
  );
};
