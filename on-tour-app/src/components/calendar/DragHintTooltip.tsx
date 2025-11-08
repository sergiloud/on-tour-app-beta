import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';

type Props = {
  visible?: boolean;
};

const DragHintTooltip: React.FC<Props> = ({ visible: externalVisible }) => {
  const [internalVisible, setInternalVisible] = useState(false);
  const [dismissedCount, setDismissedCount] = useState(0);

  useEffect(() => {
    // Load dismissal count from localStorage
    const stored = localStorage.getItem('calendar:dragHintDismissed');
    setDismissedCount(stored ? parseInt(stored, 10) : 0);
  }, []);

  useEffect(() => {
    if (!internalVisible) return;
    const timer = setTimeout(() => {
      setInternalVisible(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, [internalVisible]);

  useEffect(() => {
    // Show hint if external visible is true and we haven't dismissed it too many times
    if (externalVisible && dismissedCount < 2) {
      setInternalVisible(true);
    }
  }, [externalVisible, dismissedCount]);

  const handleDismiss = () => {
    setInternalVisible(false);
    const newCount = dismissedCount + 1;
    setDismissedCount(newCount);
    localStorage.setItem('calendar:dragHintDismissed', newCount.toString());
  };

  return (
    <AnimatePresence>
      {internalVisible && (
        <motion.div
          className="fixed bottom-24 md:bottom-32 right-4 md:right-6 z-40 max-w-xs"
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          transition={{ duration: 0.3, type: 'spring', stiffness: 300, damping: 25 }}
        >
          <div className="glass rounded-lg border border-white/10 backdrop-blur-md p-3 md:p-4 shadow-xl bg-gradient-to-br from-blue-500/10 to-cyan-500/10 ring-1 ring-blue-500/20">
            <div className="space-y-2">
              <div className="flex items-start gap-2">
                <motion.div
                  className="flex-shrink-0 pt-0.5"
                  animate={{ rotate: [0, 10, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M10 9V5l7 7-7 7v-4H4V9h6z" />
                  </svg>
                </motion.div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-white">
                    {t('calendar.dragHint.title') || 'Drag buttons to create events'}
                  </p>
                  <p className="text-xs text-white/70 mt-0.5">
                    {t('calendar.dragHint.description') || 'Drag any button above to a calendar date'}
                  </p>
                </div>
              </div>

              {/* Dismiss button */}
              <motion.button
                type="button"
                onClick={handleDismiss}
                className="w-full px-2 py-1.5 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-white/70 hover:text-white transition-all"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('common.gotIt') || 'Got it'}
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default DragHintTooltip;
