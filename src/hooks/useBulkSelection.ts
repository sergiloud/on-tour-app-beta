/**
 * Custom hook for managing bulk selection of items
 * 
 * Features:
 * - Select/deselect individual items
 * - Select all / deselect all
 * - Get selected IDs
 * - Check if item is selected
 * - Clear selection
 * 
 * @example
 * const { selected, selectItem, deselectItem, selectAll, clearSelection, isSelected } = useBulkSelection();
 */

import { useState, useCallback, useMemo } from 'react';

export interface UseBulkSelectionOptions {
  initialSelection?: Set<string>;
}

export function useBulkSelection(options: UseBulkSelectionOptions = {}) {
  const [selected, setSelected] = useState<Set<string>>(
    options.initialSelection || new Set()
  );

  const selectItem = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const deselectItem = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelected(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelected(new Set());
  }, []);

  const isSelected = useCallback((id: string) => {
    return selected.has(id);
  }, [selected]);

  const selectedCount = useMemo(() => selected.size, [selected]);

  const selectedIds = useMemo(() => Array.from(selected), [selected]);

  return {
    selected,
    selectedIds,
    selectedCount,
    selectItem,
    deselectItem,
    toggleItem,
    selectAll,
    clearSelection,
    isSelected,
  };
}
