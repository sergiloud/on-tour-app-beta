import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  isActive: boolean;
  dateStr?: string;
  delta?: number;
  direction?: 'start' | 'end';
};

/**
 * Professional resize feedback with sophisticated UX
 * Shows direction, target date, and delta in real-time
 * Auto-dismisses after 1.5s
 */
const ResizeFeedback: React.FC<Props> = ({ isActive, dateStr, delta, direction }) => {
  const [showFeedback, setShowFeedback] = React.useState(false);

  useEffect(() => {
    if (isActive) {
      setShowFeedback(true);
      const timer = setTimeout(() => setShowFeedback(false), 1500);
      return () => clearTimeout(timer);
    } else {
      setShowFeedback(false);
    }
  }, [isActive, dateStr, delta, direction]);

  const formattedDate = dateStr ? new Date(dateStr).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  }) : '';

  const deltaAbs = delta === undefined ? 0 : Math.abs(delta);
  const directionText = direction === 'start' ? 'Start Date' : 'End Date';

  // Directional arrow with animation
  const arrowIcon = delta && delta > 0 ? '↘' : delta && delta < 0 ? '↙' : '○';
  const arrowColor = delta && delta > 0 ? 'text-emerald-300' : delta && delta < 0 ? 'text-amber-300' : 'text-cyan-300';

  return (
    <AnimatePresence mode="wait">
      {showFeedback && (
        <motion.div
          key={`resize-${dateStr}-${delta}`}
          className="fixed bottom-6 left-1/2 transform -translate-x-1/2 z-50 pointer-events-none"
          initial={{ opacity: 0, scale: 0.6, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.6, y: 20 }}
          transition={{
            type: 'spring',
            stiffness: 350,
            damping: 28,
            mass: 0.7,
          }}
        >
          <motion.div
            className="px-5 py-3.5 bg-gradient-to-r from-cyan-500/85 via-blue-500/85 to-indigo-500/85 backdrop-blur-xl text-white rounded-xl shadow-2xl border border-cyan-300/30"
            animate={{
              boxShadow: [
                '0 20px 40px rgba(34, 211, 238, 0.2)',
                '0 20px 60px rgba(34, 211, 238, 0.35)',
                '0 20px 40px rgba(34, 211, 238, 0.2)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <div className="flex items-center gap-4">
              {/* Direction indicator */}
              <motion.span
                className={`text-2xl font-bold ${arrowColor}`}
                animate={{ scale: [1, 1.15, 1] }}
                transition={{ duration: 0.9, repeat: Infinity }}
              >
                {arrowIcon}
              </motion.span>

              {/* Info section */}
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold uppercase tracking-widest text-cyan-100 opacity-80">
                  {directionText}
                </span>
                <span className="text-base font-bold text-white">
                  {formattedDate}
                </span>
              </div>

              {/* Delta badge */}
              {delta !== undefined && delta !== 0 && (
                <motion.div
                  className={`ml-3 px-3 py-1.5 rounded-lg border backdrop-blur-sm font-semibold text-xs whitespace-nowrap ${
                    delta > 0
                      ? 'bg-emerald-500/30 border-emerald-400/50 text-emerald-100'
                      : 'bg-amber-500/30 border-amber-400/50 text-amber-100'
                  }`}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.15, type: 'spring', stiffness: 400 }}
                >
                  {delta > 0 ? '↑ +' : '↓ '}{deltaAbs} day{deltaAbs !== 1 ? 's' : ''}
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(ResizeFeedback);
