import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import type { Conflict } from '../../lib/conflictDetector';

type Props = {
  conflicts: Conflict[];
  onDismiss?: (conflictId: string) => void;
};

const ConflictAlert: React.FC<Props> = ({ conflicts, onDismiss }) => {
  const [dismissed, setDismissed] = React.useState<Set<string>>(new Set());

  const visibleConflicts = conflicts.filter((c) => !dismissed.has(c.id));

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
    onDismiss?.(id);
  };

  const getSeverityStyles = (severity: 'warning' | 'error') => {
    if (severity === 'error') {
      return {
        bg: 'bg-rose-500/10',
        border: 'border-rose-500/30',
        icon: '⚠️',
        text: 'text-rose-200',
      };
    }
    return {
      bg: 'bg-amber-500/10',
      border: 'border-amber-500/30',
      icon: '⚡',
      text: 'text-amber-200',
    };
  };

  return (
    <div className="fixed bottom-4 right-4 space-y-2 z-40 max-w-sm">
      <AnimatePresence>
        {visibleConflicts.map((conflict) => {
          const styles = getSeverityStyles(conflict.severity);
          return (
            <motion.div
              key={conflict.id}
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 100 }}
              className={`p-3 rounded-lg border ${styles.bg} ${styles.border} backdrop-blur-sm`}
            >
              <div className="flex gap-2">
                <span className="text-xl flex-shrink-0">{styles.icon}</span>
                <div className="flex-1">
                  <p className={`text-sm font-semibold ${styles.text}`}>
                    {conflict.message}
                  </p>
                  {conflict.suggestion && (
                    <p className="text-xs text-slate-400 dark:text-white/60 mt-1">
                      💡 {conflict.suggestion}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleDismiss(conflict.id)}
                  className="flex-shrink-0 text-slate-400 dark:text-white/40 hover:text-slate-500 dark:text-white/70 transition-colors"
                  title={t('common.dismiss') || 'Dismiss'}
                >
                  ✕
                </button>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(ConflictAlert);
