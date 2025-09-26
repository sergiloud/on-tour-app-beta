import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useShowDraft } from '../features/shows/editor/useShowDraft';

function makeInitial(id: string){
  return { id, city: 'Madrid', country: 'ES', date: '2025-09-26', fee: 1000 } as any;
}

const key = (id: string) => `shows.editor.draft.${id}`;

describe('useShowDraft autosave/restore', () => {
  beforeEach(() => {
    // reset timers and storage
    vi.useFakeTimers();
    try {
      Object.keys(localStorage)
        .filter(k => k.startsWith('shows.editor.draft.'))
        .forEach(k => localStorage.removeItem(k));
    } catch { /* ignore */ }
  });

  it('autosaves changes and restores for same id', async () => {
    const id = 'auto-1';
    const { result, unmount } = renderHook(() => useShowDraft(makeInitial(id)));
    // Change a field to mark dirty and trigger autosave
    act(() => result.current.setDraft(d => ({ ...d, fee: 1500 })));
    // Advance debounce timer
    vi.advanceTimersByTime(650);
    // Verify storage written
    const raw = localStorage.getItem(key(id));
    expect(raw).toBeTruthy();
    // Unmount and mount again to trigger restore
    unmount();
    const { result: result2 } = renderHook(() => useShowDraft(makeInitial(id)));
    // Draft should be restored and flagged
    expect(result2.current.restored).toBe(true);
    expect(result2.current.draft.fee).toBe(1500);
    // Discard saved draft clears storage
    act(() => result2.current.discardSavedDraft());
    expect(localStorage.getItem(key(id))).toBeNull();
  });
});
