/**
 * Unit tests for useBulkSelection hook
 */

import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBulkSelection } from '../../../src/hooks/useBulkSelection';

describe('useBulkSelection', () => {
  describe('Initial state', () => {
    it('starts with empty selection', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      expect(result.current.selected.size).toBe(0);
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.selectedIds).toEqual([]);
    });

    it('accepts initial selection', () => {
      const initialSelection = new Set(['item-1', 'item-2']);
      const { result } = renderHook(() => 
        useBulkSelection({ initialSelection })
      );
      
      expect(result.current.selected.size).toBe(2);
      expect(result.current.selectedCount).toBe(2);
      expect(result.current.selectedIds).toEqual(['item-1', 'item-2']);
    });
  });

  describe('Selection operations', () => {
    it('selects an item', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      act(() => {
        result.current.selectItem('item-1');
      });
      
      expect(result.current.isSelected('item-1')).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it('deselects an item', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      act(() => {
        result.current.selectItem('item-1');
        result.current.selectItem('item-2');
      });
      
      act(() => {
        result.current.deselectItem('item-1');
      });
      
      expect(result.current.isSelected('item-1')).toBe(false);
      expect(result.current.isSelected('item-2')).toBe(true);
      expect(result.current.selectedCount).toBe(1);
    });

    it('toggles an item', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      // Toggle on
      act(() => {
        result.current.toggleItem('item-1');
      });
      
      expect(result.current.isSelected('item-1')).toBe(true);
      
      // Toggle off
      act(() => {
        result.current.toggleItem('item-1');
      });
      
      expect(result.current.isSelected('item-1')).toBe(false);
    });

    it('selects all items', () => {
      const { result } = renderHook(() => useBulkSelection());
      const items = ['item-1', 'item-2', 'item-3', 'item-4'];
      
      act(() => {
        result.current.selectAll(items);
      });
      
      expect(result.current.selectedCount).toBe(4);
      items.forEach(item => {
        expect(result.current.isSelected(item)).toBe(true);
      });
    });

    it('clears selection', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      act(() => {
        result.current.selectAll(['item-1', 'item-2', 'item-3']);
      });
      
      expect(result.current.selectedCount).toBe(3);
      
      act(() => {
        result.current.clearSelection();
      });
      
      expect(result.current.selectedCount).toBe(0);
      expect(result.current.selectedIds).toEqual([]);
    });
  });

  describe('Query operations', () => {
    it('checks if item is selected', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      expect(result.current.isSelected('item-1')).toBe(false);
      
      act(() => {
        result.current.selectItem('item-1');
      });
      
      expect(result.current.isSelected('item-1')).toBe(true);
      expect(result.current.isSelected('item-2')).toBe(false);
    });

    it('returns selected count', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      expect(result.current.selectedCount).toBe(0);
      
      act(() => {
        result.current.selectAll(['item-1', 'item-2', 'item-3']);
      });
      
      expect(result.current.selectedCount).toBe(3);
    });

    it('returns selected IDs array', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      act(() => {
        result.current.selectItem('item-1');
        result.current.selectItem('item-3');
        result.current.selectItem('item-2');
      });
      
      expect(result.current.selectedIds).toHaveLength(3);
      expect(result.current.selectedIds).toContain('item-1');
      expect(result.current.selectedIds).toContain('item-2');
      expect(result.current.selectedIds).toContain('item-3');
    });
  });

  describe('Edge cases', () => {
    it('handles selecting same item multiple times', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      act(() => {
        result.current.selectItem('item-1');
        result.current.selectItem('item-1');
        result.current.selectItem('item-1');
      });
      
      expect(result.current.selectedCount).toBe(1);
    });

    it('handles deselecting non-existent item', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      act(() => {
        result.current.deselectItem('item-1');
      });
      
      expect(result.current.selectedCount).toBe(0);
    });

    it('handles empty selectAll', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      act(() => {
        result.current.selectAll([]);
      });
      
      expect(result.current.selectedCount).toBe(0);
    });

    it('replaces selection on selectAll', () => {
      const { result } = renderHook(() => useBulkSelection());
      
      act(() => {
        result.current.selectAll(['item-1', 'item-2']);
      });
      
      expect(result.current.selectedCount).toBe(2);
      
      act(() => {
        result.current.selectAll(['item-3', 'item-4', 'item-5']);
      });
      
      expect(result.current.selectedCount).toBe(3);
      expect(result.current.isSelected('item-1')).toBe(false);
      expect(result.current.isSelected('item-3')).toBe(true);
    });
  });

  describe('Performance', () => {
    it('handles large selections efficiently', () => {
      const { result } = renderHook(() => useBulkSelection());
      const largeList = Array.from({ length: 10000 }, (_, i) => `item-${i}`);
      
      act(() => {
        result.current.selectAll(largeList);
      });
      
      expect(result.current.selectedCount).toBe(10000);
      expect(result.current.isSelected('item-5000')).toBe(true);
    });

    it('memoizes selectedIds array', () => {
      const { result, rerender } = renderHook(() => useBulkSelection());
      
      act(() => {
        result.current.selectItem('item-1');
      });
      
      const ids1 = result.current.selectedIds;
      
      rerender();
      
      const ids2 = result.current.selectedIds;
      
      // Should be the same reference if selection hasn't changed
      expect(ids1).toBe(ids2);
    });
  });
});
