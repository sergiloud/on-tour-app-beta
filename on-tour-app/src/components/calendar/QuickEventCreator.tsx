import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import type { EventButton } from './DraggableEventButtons';

type QuickEventData = {
  label: string;
  city: string;
  country: string;
  category?: string;
  notes?: string;
  color: EventButton['color'];
  type: 'show' | 'travel';
};

type Props = {
  open: boolean;
  button?: EventButton;
  date?: string;
  onClose: () => void;
  onSave: (data: QuickEventData) => void;
};

const countryList = [
  'US', 'ES', 'UK', 'DE', 'FR', 'IT', 'JP', 'BR', 'CA', 'AU', 'MX', 'CN',
  'AR', 'IN', 'RU', 'SG', 'NZ', 'SE', 'NO', 'NL', 'BE', 'AT', 'CH', 'PL'
];

const QuickEventCreator: React.FC<Props> = ({ open, button, date, onClose, onSave }) => {
  const [step, setStep] = useState<1 | 2>(1); // Step 1: Quick, Step 2: Details
  const [data, setData] = useState<QuickEventData>({
    label: button?.label || '',
    city: '',
    country: 'US',
    category: button?.category,
    notes: '',
    color: button?.color || 'emerald',
    type: button?.type || 'show',
  });

  const handleSubmit = () => {
    if (!data.city.trim()) return;
    onSave(data);
    setStep(1);
    setData({
      label: button?.label || '',
      city: '',
      country: 'US',
      category: button?.category,
      notes: '',
      color: button?.color || 'emerald',
      type: button?.type || 'show',
    });
    onClose();
  };

  const colorEmojis: Record<EventButton['color'], string> = {
    emerald: '🟢',
    amber: '🟡',
    sky: '🔵',
    rose: '🔴',
    purple: '🟣',
    cyan: '🔷',
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/50 backdrop-blur-md"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            className="relative glass rounded-lg p-5 md:p-6 w-[90vw] max-w-[480px] border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-md space-y-4"
            initial={{ opacity: 0, scale: 0.8, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 40 }}
            transition={{ duration: 0.35, type: 'spring', stiffness: 300, damping: 30 }}
          >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1">
                <h2 className="text-lg md:text-xl font-bold text-slate-900 dark:text-white">
                  {step === 1 ? t('calendar.quickCreate') || 'Quick Event' : t('calendar.eventDetails') || 'Event Details'}
                </h2>
                <p className="text-xs md:text-sm text-slate-400 dark:text-white/60 mt-1">
                  {date ? new Date(date).toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' }) : 'Select date'}
                </p>
              </div>
              <motion.button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg hover:bg-slate-200 dark:bg-white/10 transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
              >
                <svg className="w-5 h-5 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Step 1: Quick Create */}
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div
                  key="step1"
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* City Input */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-white/80 flex items-center gap-2">
                      <span>City/Venue</span>
                      <span className="text-xs px-1.5 py-0.5 bg-accent-500/20 rounded text-accent-100">*</span>
                    </label>
                    <input
                      type="text"
                      value={data.city}
                      onChange={(e) => setData({ ...data, city: e.target.value })}
                      placeholder="Madrid, London, New York..."
                      className="w-full px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-accent-400 text-white placeholder-slate-400 dark:placeholder-slate-400 dark:placeholder-white/40 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
                      autoFocus
                    />
                  </div>

                  {/* Country Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-white/80">Country</label>
                    <div className="grid grid-cols-4 gap-2 max-h-[120px] overflow-y-auto">
                      {countryList.map((c) => (
                        <motion.button
                          key={c}
                          type="button"
                          onClick={() => setData({ ...data, country: c })}
                          className={`px-2 py-1.5 rounded-md border text-xs font-semibold transition-all ${
                            data.country === c
                              ? 'bg-accent-500/20 border-accent-500/40 text-accent-100 shadow-md'
                              : 'bg-white/5 border-slate-200 dark:border-white/10 text-slate-500 dark:text-white/70 hover:bg-white/10'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          {c}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Type Indicator */}
                  <div className="flex items-center justify-between p-2.5 bg-slate-100 dark:bg-white/5 rounded-lg border border-white/10">
                    <span className="text-xs font-medium text-slate-500 dark:text-white/70">Type:</span>
                    <span className="text-sm font-semibold text-accent-100 capitalize">{data.type}</span>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <motion.button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:bg-white/10 text-white text-sm font-medium transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={() => setStep(2)}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 hover:bg-slate-300 dark:hover:bg-white/15 text-white text-sm font-medium transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      More Details
                    </motion.button>
                    <motion.button
                      type="button"
                      disabled={!data.city.trim()}
                      onClick={handleSubmit}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-black text-sm font-bold shadow-lg hover:shadow-accent-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create
                    </motion.button>
                  </div>
                </motion.div>
              )}

              {/* Step 2: Detailed */}
              {step === 2 && (
                <motion.div
                  key="step2"
                  className="space-y-4"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Summary of Quick Info */}
                  <div className="p-3 bg-slate-100 dark:bg-white/5 rounded-lg border border-slate-200 dark:border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 dark:text-white/60">City:</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{data.city}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-slate-400 dark:text-white/60">Country:</span>
                      <span className="text-sm font-semibold text-slate-900 dark:text-white">{data.country}</span>
                    </div>
                  </div>

                  {/* Category */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-white/80">Category</label>
                    <input
                      type="text"
                      value={data.category || ''}
                      onChange={(e) => setData({ ...data, category: e.target.value })}
                      placeholder="Performance, Promotion, Rehearsal..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-accent-400 text-white placeholder-slate-400 dark:placeholder-slate-400 dark:placeholder-white/40 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400/50"
                    />
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-600 dark:text-white/80">Notes</label>
                    <textarea
                      value={data.notes || ''}
                      onChange={(e) => setData({ ...data, notes: e.target.value })}
                      placeholder="Add any notes about this event..."
                      className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 focus:border-accent-400 text-white placeholder-slate-400 dark:placeholder-slate-400 dark:placeholder-white/40 text-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-accent-400/50 resize-none h-20"
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <motion.button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200 dark:bg-white/10 text-white text-sm font-medium transition-all"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Back
                    </motion.button>
                    <motion.button
                      type="button"
                      onClick={handleSubmit}
                      disabled={!data.city.trim()}
                      className="flex-1 px-3 py-2.5 rounded-lg bg-gradient-to-r from-accent-500 to-accent-600 text-black text-sm font-bold shadow-lg hover:shadow-accent-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      Create Event
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default QuickEventCreator;
