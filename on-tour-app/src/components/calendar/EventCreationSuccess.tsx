import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import type { EventButton } from './DraggableEventButtons';

type Props = {
  show: boolean;
  button?: EventButton;
  city?: string;
  country?: string;
  onDismiss: () => void;
};

const colorClasses: Record<EventButton['color'], { bg: string; ring: string }> = {
  emerald: { bg: 'from-emerald-500/20 to-emerald-600/20', ring: 'ring-emerald-500/30' },
  amber: { bg: 'from-amber-500/20 to-amber-600/20', ring: 'ring-amber-500/30' },
  sky: { bg: 'from-sky-500/20 to-sky-600/20', ring: 'ring-sky-500/30' },
  rose: { bg: 'from-rose-500/20 to-rose-600/20', ring: 'ring-rose-500/30' },
  purple: { bg: 'from-purple-500/20 to-purple-600/20', ring: 'ring-purple-500/30' },
  cyan: { bg: 'from-cyan-500/20 to-cyan-600/20', ring: 'ring-cyan-500/30' },
};

const EventCreationSuccess: React.FC<Props> = ({ show, button, city, country, onDismiss }) => {
  useEffect(() => {
    if (!show) return;
    const timer = setTimeout(onDismiss, 3000);
    return () => clearTimeout(timer);
  }, [show, onDismiss]);

  const colors = button ? colorClasses[button.color] : colorClasses.emerald;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed bottom-4 md:bottom-6 right-4 md:right-6 z-40 max-w-sm"
          initial={{ opacity: 0, y: 100, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.9 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 30 }}
        >
          <div className={`glass rounded-lg border border-slate-200 dark:border-white/10 backdrop-blur-md p-4 md:p-5 shadow-xl bg-gradient-to-br ${colors.bg} ring-1 ${colors.ring}`}>
            <div className="flex items-center gap-3">
              {/* Success Icon */}
              <motion.div
                className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-accent-500/20 ring-2 ring-accent-500/30 flex items-center justify-center flex-shrink-0"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.1, type: 'spring', stiffness: 400, damping: 25 }}
              >
                <motion.svg
                  className="w-5 h-5 md:w-6 md:h-6 text-accent-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ delay: 0.2, duration: 0.5 }}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                </motion.svg>
              </motion.div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <p className="text-sm md:text-base font-bold text-white truncate">
                  {button?.label || 'Event'} created
                </p>
                {city && country && (
                  <p className="text-xs md:text-sm text-slate-500 dark:text-white/70 truncate mt-0.5">
                    {city}, {country}
                  </p>
                )}
              </div>

              {/* Close Button */}
              <motion.button
                onClick={onDismiss}
                className="ml-2 flex-shrink-0 w-6 h-6 rounded-full bg-slate-200 dark:bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-500 dark:text-white/70 hover:text-white transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </motion.button>
            </div>

            {/* Progress bar */}
            <motion.div
              className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-accent-500 to-accent-400 rounded-b-lg"
              initial={{ scaleX: 1 }}
              animate={{ scaleX: 0 }}
              transition={{ duration: 2.7, ease: 'linear' }}
              style={{ transformOrigin: 'left' }}
            />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EventCreationSuccess;
