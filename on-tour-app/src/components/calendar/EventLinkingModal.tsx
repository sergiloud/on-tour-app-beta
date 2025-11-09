import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import { announce } from '../../lib/announcer';
import type { CalEvent } from './types';

export type EventLink = {
  fromId: string;
  toId: string;
  type: 'before' | 'after' | 'sameDay'; // Event dependency type
  gap?: number; // minimum gap in days (for "before" type)
};

type Props = {
  open: boolean;
  fromEvent?: CalEvent;
  toEvent?: CalEvent;
  existingLink?: EventLink;
  onLink: (link: EventLink) => void;
  onDelete?: () => void;
  onClose: () => void;
};

const EventLinkingModal: React.FC<Props> = ({
  open,
  fromEvent,
  toEvent,
  existingLink,
  onLink,
  onDelete,
  onClose,
}) => {
  const [linkType, setLinkType] = React.useState<'before' | 'after' | 'sameDay'>('before');
  const [gap, setGap] = React.useState<number>(0);

  React.useEffect(() => {
    if (existingLink) {
      setLinkType(existingLink.type);
      setGap(existingLink.gap || 0);
    }
  }, [existingLink]);

  const handleLink = () => {
    if (!fromEvent || !toEvent) return;

    const link: EventLink = {
      fromId: fromEvent.id,
      toId: toEvent.id,
      type: linkType,
      gap: linkType === 'before' ? gap : undefined,
    };

    onLink(link);
    announce(
      `Linked ${fromEvent.title} ${linkType === 'before' ? 'before' : 'after'} ${toEvent.title}${gap ? ` with ${gap} day gap` : ''}`
    );
    onClose();
  };

  const getDescription = () => {
    switch (linkType) {
      case 'before':
        return `${fromEvent?.title} should happen before ${toEvent?.title} (with optional gap)`;
      case 'after':
        return `${fromEvent?.title} should happen after ${toEvent?.title}`;
      case 'sameDay':
        return `${fromEvent?.title} and ${toEvent?.title} should be on the same day`;
    }
  };

  if (!open || !fromEvent || !toEvent) return null;

  return (
    <div role="dialog" aria-labelledby="link-modal-title" aria-modal="true" className="fixed inset-0 z-[var(--z-modal)] flex items-center justify-center">
      <motion.div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      <motion.div
        className="relative glass rounded-xl p-6 w-[420px] border border-slate-300 dark:border-white/20 shadow-2xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
      >
        <div className="flex items-center justify-between mb-6">
          <h2 id="link-modal-title" className="text-lg font-semibold text-slate-900 dark:text-white">
            {t('calendar.link.title') || 'Link Events'}
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-200 dark:bg-white/10 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Events display */}
        <div className="space-y-3 mb-6">
          <div className="flex items-center gap-2 text-sm">
            <div className="px-2 py-1 rounded bg-sky-500/30 border border-sky-500/50 text-sky-200">
              📌 {fromEvent.title}
            </div>
            <div className="text-slate-300 dark:text-white/50">→</div>
            <div className="px-2 py-1 rounded bg-emerald-500/30 border border-emerald-500/50 text-emerald-200">
              🎯 {toEvent.title}
            </div>
          </div>
        </div>

        {/* Link type selector */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-slate-600 dark:text-white/80 font-medium mb-3 block">Link Type</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-100 dark:bg-white/5 transition-colors">
                <input
                  type="radio"
                  name="linkType"
                  value="before"
                  checked={linkType === 'before'}
                  onChange={(e) => setLinkType('before')}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-900 dark:text-white">Before</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-100 dark:bg-white/5 transition-colors">
                <input
                  type="radio"
                  name="linkType"
                  value="after"
                  checked={linkType === 'after'}
                  onChange={(e) => setLinkType('after')}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-900 dark:text-white">After</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer p-2 rounded hover:bg-slate-100 dark:bg-white/5 transition-colors">
                <input
                  type="radio"
                  name="linkType"
                  value="sameDay"
                  checked={linkType === 'sameDay'}
                  onChange={(e) => setLinkType('sameDay')}
                  className="w-4 h-4"
                />
                <span className="text-sm text-slate-900 dark:text-white">Same Day</span>
              </label>
            </div>
          </div>

          {/* Gap input for "before" type */}
          {linkType === 'before' && (
            <div>
              <label className="text-sm text-slate-600 dark:text-white/80 font-medium mb-2 block">
                {t('calendar.link.minGap') || 'Minimum gap (days)'}
              </label>
              <input
                type="number"
                min="0"
                max="365"
                value={gap}
                onChange={(e) => setGap(Math.max(0, parseInt(e.target.value) || 0))}
                className="w-full px-3 py-2 rounded bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-white text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500"
              />
            </div>
          )}

          {/* Description */}
          <div className="p-2 rounded bg-slate-100 dark:bg-white/5 border border-white/10">
            <p className="text-xs text-slate-500 dark:text-white/70">{getDescription()}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 mt-6">
          <motion.button
            onClick={onClose}
            className="flex-1 px-4 py-2 rounded bg-slate-600 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Cancel
          </motion.button>
          {existingLink && onDelete && (
            <motion.button
              onClick={() => {
                onDelete();
                onClose();
              }}
              className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium transition-colors"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              Delete Link
            </motion.button>
          )}
          <motion.button
            onClick={handleLink}
            className="flex-1 px-4 py-2 rounded bg-cyan-600 hover:bg-cyan-700 text-white text-sm font-medium transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {existingLink ? 'Update' : 'Create'} Link
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default React.memo(EventLinkingModal);
