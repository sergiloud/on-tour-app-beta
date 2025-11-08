import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CalEvent } from './types';
import { t } from '../../lib/i18n';
import { Trash2, Copy, Move, CheckCircle } from 'lucide-react';

interface MultiSelectManagerProps {
  events: CalEvent[];
  onBulkMove?: (eventIds: string[], newDate: string) => void;
  onBulkDelete?: (eventIds: string[]) => void;
  onBulkCopy?: (eventIds: string[], newDate: string) => void;
  onStatusChange?: (eventIds: string[], newStatus: CalEvent['status']) => void;
}

interface SelectionState {
  selectedIds: Set<string>;
  isOpen: boolean;
}

/**
 * Multi-Selection Manager
 * Manage selection of multiple events for bulk operations
 * - Ctrl/Cmd+Click to select/deselect
 * - Shift+Click to select range
 * - Bulk move, copy, delete, status change
 */
export const useMultiSelect = () => {
  const [selection, setSelection] = useState<SelectionState>({
    selectedIds: new Set(),
    isOpen: false,
  });

  const toggleSelection = useCallback((eventId: string, multiselect: boolean = false) => {
    setSelection((prev) => {
      const newIds = new Set(prev.selectedIds);

      if (multiselect) {
        if (newIds.has(eventId)) {
          newIds.delete(eventId);
        } else {
          newIds.add(eventId);
        }
      } else {
        // Single select
        newIds.clear();
        newIds.add(eventId);
      }

      return {
        ...prev,
        selectedIds: newIds,
        isOpen: newIds.size > 0,
      };
    });
  }, []);

  const selectAll = useCallback((eventIds: string[]) => {
    setSelection((prev) => ({
      ...prev,
      selectedIds: new Set(eventIds),
      isOpen: eventIds.length > 0,
    }));
  }, []);

  const clearSelection = useCallback(() => {
    setSelection((prev) => ({
      ...prev,
      selectedIds: new Set(),
      isOpen: false,
    }));
  }, []);

  const isSelected = useCallback(
    (eventId: string) => selection.selectedIds.has(eventId),
    [selection.selectedIds]
  );

  return {
    selectedIds: selection.selectedIds,
    isOpen: selection.isOpen,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    count: selection.selectedIds.size,
  };
};

/**
 * Multi-Select Actions Panel
 * Displays bulk actions for selected events
 */
export const MultiSelectPanel: React.FC<{
  selectedCount: number;
  onMove?: (date: string) => void;
  onCopy?: (date: string) => void;
  onDelete?: () => void;
  onStatusChange?: (status: CalEvent['status']) => void;
  onClear?: () => void;
}> = ({ selectedCount, onMove, onCopy, onDelete, onStatusChange, onClear }) => {
  const [showDatePicker, setShowDatePicker] = useState(false);

  return (
    <AnimatePresence>
      {selectedCount > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 glass rounded-xl border border-white/10 backdrop-blur-md p-4 shadow-2xl"
        >
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Count */}
            <div className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-accent-400" />
              <span className="text-sm font-semibold text-white">
                {selectedCount} {selectedCount === 1 ? 'event' : 'events'} selected
              </span>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onMove?.('')}
                className="px-3 py-1.5 rounded-lg bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-medium transition-all flex items-center gap-1.5"
                title={t('calendar.bulkActions.move') || 'Move selected events'}
              >
                <Move size={14} />
                Move
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => onCopy?.('')}
                className="px-3 py-1.5 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-300 text-xs font-medium transition-all flex items-center gap-1.5"
                title={t('calendar.bulkActions.copy') || 'Copy selected events'}
              >
                <Copy size={14} />
                Copy
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onDelete}
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-medium transition-all flex items-center gap-1.5"
                title={t('calendar.bulkActions.delete') || 'Delete selected events'}
              >
                <Trash2 size={14} />
                Delete
              </motion.button>

              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={onClear}
                className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white/70 text-xs font-medium transition-all"
                title="Clear selection"
              >
                ✕
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MultiSelectPanel;
