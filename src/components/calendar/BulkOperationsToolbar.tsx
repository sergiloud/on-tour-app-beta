import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';
import { announce } from '../../lib/announcer';
import { trackEvent } from '../../lib/telemetry';

type Props = {
  selectedCount: number;
  onBulkDelete: () => void;
  onBulkMove?: (direction: 'forward' | 'backward', days: number) => void;
  onBulkStatusChange?: (status: string) => void;
  onClearSelection: () => void;
  isDeletionPending?: boolean;
};

/**
 * Bulk operations toolbar for calendar events
 * Shows when multiple events are selected
 */
const BulkOperationsToolbar: React.FC<Props> = ({
  selectedCount,
  onBulkDelete,
  onBulkMove,
  onBulkStatusChange,
  onClearSelection,
  isDeletionPending = false,
}) => {
  const [confirmDelete, setConfirmDelete] = React.useState(false);

  const handleDelete = () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      announce(`Ready to delete ${selectedCount} events. Click delete again to confirm.`);
      return;
    }

    onBulkDelete();
    announce(`Deleted ${selectedCount} events`);
    trackEvent('calendar.bulk.delete', { count: selectedCount });
    setConfirmDelete(false);
  };

  const handleMove = (direction: 'forward' | 'backward') => {
    const days = 1;
    onBulkMove?.(direction, days);
    const directionText = direction === 'forward' ? 'forward' : 'backward';
    announce(`Moved ${selectedCount} events ${directionText} by ${days} day${days !== 1 ? 's' : ''}`);
    trackEvent('calendar.bulk.move', { count: selectedCount, direction, days });
  };

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          key="bulk-toolbar"
          className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 border-t border-slate-700 shadow-2xl z-40"
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
            {/* Selection info */}
            <motion.div
              className="flex items-center gap-2"
              layout
            >
              <div className="text-slate-900 dark:text-white font-semibold">
                {selectedCount} {selectedCount === 1 ? 'event' : 'events'} selected
              </div>
              <motion.button
                onClick={onClearSelection}
                className="text-xs px-2 py-1 rounded bg-slate-700 hover:bg-slate-600 text-slate-200 transition-colors"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Clear selection
              </motion.button>
            </motion.div>

            {/* Actions */}
            <motion.div
              className="flex items-center gap-2"
              layout
            >
              {/* Move buttons */}
              {onBulkMove && (
                <>
                  <motion.button
                    onClick={() => handleMove('backward')}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Move selected events backward by 1 day"
                  >
                    <span>← Back</span>
                  </motion.button>
                  <motion.button
                    onClick={() => handleMove('forward')}
                    className="px-3 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors flex items-center gap-1"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    title="Move selected events forward by 1 day"
                  >
                    <span>Forward →</span>
                  </motion.button>
                </>
              )}

              {/* Delete button */}
              <motion.button
                onClick={handleDelete}
                disabled={isDeletionPending}
                className={`
                  px-4 py-1 rounded text-white text-sm font-medium transition-all
                  ${confirmDelete
                    ? 'bg-red-600 hover:bg-red-700 ring-2 ring-red-400'
                    : 'bg-rose-600 hover:bg-rose-700'
                  }
                  disabled:opacity-50 disabled:cursor-not-allowed
                `}
                whileHover={{ scale: !isDeletionPending ? 1.05 : 1 }}
                whileTap={{ scale: !isDeletionPending ? 0.95 : 1 }}
                title={confirmDelete ? 'Click again to confirm deletion' : 'Delete selected events'}
              >
                {isDeletionPending ? (
                  <>
                    <span className="inline-block mr-1">⏳</span>
                    Deleting...
                  </>
                ) : confirmDelete ? (
                  <>
                    <span className="inline-block mr-1">⚠️</span>
                    Confirm Delete
                  </>
                ) : (
                  <>
                    <span className="inline-block mr-1">🗑️</span>
                    Delete
                  </>
                )}
              </motion.button>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(BulkOperationsToolbar);
