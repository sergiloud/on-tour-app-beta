import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';

type Props = {
  eventId: string;
  eventTitle: string;
  startDate: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  onUpdateDates?: (startDate: string, endDate: string) => void;
  onClose?: () => void;
};

/**
 * Multi-Day Event Duration Editor
 * Allows users to:
 * - Extend event forward
 * - Shrink event from end
 * - Split into multiple events
 * - Copy to consecutive days
 */
const MultiDayEventEditor: React.FC<Props> = ({
  eventId,
  eventTitle,
  startDate,
  endDate,
  onUpdateDates,
  onClose,
}) => {
  const [mode, setMode] = useState<'extend' | 'shrink' | 'split' | 'copy'>('extend');
  const [selectedDays, setSelectedDays] = useState<number>(1);

  const calcDuration = () => {
    if (!endDate) return 1;
    const start = new Date(startDate);
    const end = new Date(endDate);
    const diff = Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diff);
  };

  const currentDuration = calcDuration();

  // Generate date range preview
  const generateDates = (start: string, days: number) => {
    const dates: string[] = [];
    const d = new Date(start);
    for (let i = 0; i < days; i++) {
      dates.push(d.toISOString().slice(0, 10));
      d.setDate(d.getDate() + 1);
    }
    return dates;
  };

  const previewDates = generateDates(startDate, selectedDays);

  const handleApply = () => {
    if (mode === 'extend' || mode === 'shrink') {
      const newEnd = previewDates[previewDates.length - 1] || startDate;
      onUpdateDates?.(startDate, newEnd);
    } else if (mode === 'split') {
      // Split creates multiple events (handled by parent)
      const splitPoint = previewDates[Math.floor(previewDates.length / 2)] || startDate;
      onUpdateDates?.(startDate, splitPoint);
    } else if (mode === 'copy') {
      // Copy to consecutive days
      const newEnd = previewDates[previewDates.length - 1] || startDate;
      onUpdateDates?.(startDate, newEnd);
    }
    onClose?.();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-300 dark:border-white/20 rounded-xl shadow-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-white">{eventTitle}</h3>
            <p className="text-sm text-slate-400 dark:text-white/60 mt-1">Duration: {currentDuration} day(s)</p>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-200 dark:bg-white/10 transition-colors"
          >
            <svg className="w-5 h-5 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </motion.button>
        </div>

        {/* Mode Selector */}
        <div className="grid grid-cols-2 gap-2 mb-6">
          {[
            { id: 'extend', label: 'Extend', icon: '→', desc: 'Add days to end' },
            { id: 'shrink', label: 'Shrink', icon: '←', desc: 'Remove days' },
            { id: 'split', label: 'Split', icon: '÷', desc: 'Break in two' },
            { id: 'copy', label: 'Copy', icon: '⋯', desc: 'Repeat days' },
          ].map(({ id, label, icon, desc }) => (
            <motion.button
              key={id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMode(id as any)}
              className={`p-3 rounded-lg transition-all text-sm ${
                mode === id
                  ? 'bg-gradient-to-r from-accent-500 to-accent-600 text-black font-semibold shadow-lg'
                  : 'bg-white/5 border border-slate-200 dark:border-white/10 text-white hover:bg-white/10'
              }`}
            >
              <div className="font-bold text-lg mb-0.5">{icon}</div>
              <div className="font-semibold">{label}</div>
              <div className="text-xs opacity-75">{desc}</div>
            </motion.button>
          ))}
        </div>

        {/* Duration Selector */}
        <div className="mb-6">
          <label className="text-sm font-semibold text-white mb-3 block">Duration: {selectedDays} day(s)</label>
          <input
            type="range"
            min="1"
            max="30"
            value={selectedDays}
            onChange={(e) => setSelectedDays(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-accent-500"
          />
          <div className="flex items-center justify-between mt-2 text-xs text-slate-400 dark:text-white/60">
            <span>1 day</span>
            <span>30 days</span>
          </div>
        </div>

        {/* Date Preview */}
        <div className="mb-6">
          <p className="text-xs font-semibold text-slate-400 dark:text-white/60 mb-2 uppercase">Preview</p>
          <div className="space-y-1 max-h-40 overflow-y-auto">
            {previewDates.map((date, idx) => (
              <motion.div
                key={date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.02 }}
                className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                  idx === 0 ? 'bg-accent-500/20 border border-accent-500/40' : idx === previewDates.length - 1 ? 'bg-accent-400/20 border border-accent-400/40' : 'bg-white/5 border border-white/10'
                }`}
              >
                <span className="text-slate-900 dark:text-white">
                  {new Date(date).toLocaleDateString('en', { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
                {idx === 0 && <span className="text-xs text-accent-200 font-semibold">START</span>}
                {idx === previewDates.length - 1 && <span className="text-xs text-accent-200 font-semibold">END</span>}
              </motion.div>
            ))}
          </div>
        </div>

        {/* Mode Description */}
        <div className="mb-6 p-3 rounded-lg bg-blue-500/10 border border-blue-500/30 text-sm text-blue-200">
          {mode === 'extend' && '✏️ Extend the event forward to include more days'}
          {mode === 'shrink' && '✏️ Shrink the event from the end'}
          {mode === 'split' && '✏️ Split this event into two separate events'}
          {mode === 'copy' && '✏️ Copy this event to consecutive days'}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:bg-white/10 text-white font-medium transition-colors"
          >
            Cancel
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleApply}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-black font-semibold shadow-lg hover:shadow-accent-500/30 transition-all"
          >
            Apply Changes
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MultiDayEventEditor;
