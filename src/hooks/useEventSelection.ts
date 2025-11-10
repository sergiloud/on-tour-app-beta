import { useState, useCallback } from 'react';
import type { CalEvent } from '../components/calendar/types';

type SelectionMode = 'none' | 'single' | 'multi' | 'range';

export function useEventSelection() {
  const [selectedEventIds, setSelectedEventIds] = useState<Set<string>>(new Set());
  const [lastSelectedId, setLastSelectedId] = useState<string | null>(null);
  const [selectionMode, setSelectionMode] = useState<SelectionMode>('none');

  const clearSelection = useCallback(() => {
    setSelectedEventIds(new Set());
    setLastSelectedId(null);
    setSelectionMode('none');
  }, []);

  const toggleSelection = useCallback((eventId: string, multiSelect: boolean = false) => {
    setSelectedEventIds((prev) => {
      const newSet = new Set(prev);
      if (multiSelect) {
        if (newSet.has(eventId)) {
          newSet.delete(eventId);
        } else {
          newSet.add(eventId);
        }
        setSelectionMode(newSet.size > 1 ? 'multi' : newSet.size === 1 ? 'single' : 'none');
      } else {
        // Single select
        newSet.clear();
        newSet.add(eventId);
        setSelectionMode('single');
      }
      setLastSelectedId(eventId);
      return newSet;
    });
  }, []);

  const selectRange = useCallback((fromId: string, toId: string, allEvents: CalEvent[]) => {
    // Find indices
    const fromIdx = allEvents.findIndex((e) => e.id === fromId);
    const toIdx = allEvents.findIndex((e) => e.id === toId);

    if (fromIdx === -1 || toIdx === -1) return;

    const start = Math.min(fromIdx, toIdx);
    const end = Math.max(fromIdx, toIdx);

    const newSet = new Set<string>();
    for (let i = start; i <= end; i++) {
      const event = allEvents[i];
      if (event) newSet.add(event.id);
    }

    setSelectedEventIds(newSet);
    setSelectionMode('range');
    setLastSelectedId(toId);
  }, []);

  const selectAll = useCallback((allEvents: CalEvent[]) => {
    const newSet = new Set(allEvents.map((e) => e.id));
    setSelectedEventIds(newSet);
    setSelectionMode(newSet.size > 1 ? 'multi' : 'single');
  }, []);

  const isSelected = useCallback((eventId: string) => selectedEventIds.has(eventId), [selectedEventIds]);

  const getSelectedCount = useCallback(() => selectedEventIds.size, [selectedEventIds]);

  const getSelectedIds = useCallback(() => Array.from(selectedEventIds), [selectedEventIds]);

  return {
    selectedEventIds,
    lastSelectedId,
    selectionMode,
    clearSelection,
    toggleSelection,
    selectRange,
    selectAll,
    isSelected,
    getSelectedCount,
    getSelectedIds,
  };
}
