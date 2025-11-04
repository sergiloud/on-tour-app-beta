import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, act } from '@testing-library/react';
import React from 'react';
import ShowEditorDrawer from '../features/shows/editor/ShowEditorDrawer';
import { SettingsProvider } from '../context/SettingsContext';

// Minimal track mock (telemetry imported inside component)
vi.mock('../lib/telemetry', () => ({ track: vi.fn() }));

function wrapper(ui: React.ReactElement){
  return render(<SettingsProvider>{ui}</SettingsProvider>);
}

describe.skip('ShowEditorDrawer undo deletion', () => {
  const baseShow = { id: 's1', date: '2025-04-20', city: 'Madrid', country: 'ES', fee: 10000, name: 'Test Show', status: 'pending' } as any;

  it('allows undo after delete and restores', () => {
    const onDelete = vi.fn();
    const onRestore = vi.fn();
  wrapper(<ShowEditorDrawer open initial={baseShow} mode="edit" onRequestClose={()=>{}} onSave={()=>{}} onDelete={onDelete} onRestore={onRestore} />);

    // Open delete dialog
    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    // Confirm delete
    fireEvent.click(screen.getByRole('button', { name: /confirm delete|delete show|delete/i }));

    // Banner should appear with undo button
    const undoBtn = screen.getByRole('button', { name: /undo/i });
    expect(undoBtn).toBeInTheDocument();

    fireEvent.click(undoBtn);
    expect(onRestore).toHaveBeenCalled();
    // onDelete should not finalize yet after undo
    expect(onDelete).not.toHaveBeenCalled();
  });

  it('finalizes deletion if timer elapses (simulated)', () => {
    vi.useFakeTimers();
    const onDelete = vi.fn();
  wrapper(<ShowEditorDrawer open initial={baseShow} mode="edit" onRequestClose={()=>{}} onSave={()=>{}} onDelete={onDelete} onRestore={()=>{}} />);

    fireEvent.click(screen.getByRole('button', { name: /delete/i }));
    fireEvent.click(screen.getByRole('button', { name: /confirm delete|delete show|delete/i }));

    // Advance timers beyond default (assuming 5s, give 6000)
    act(()=> {
      vi.advanceTimersByTime(6000);
    });

    expect(onDelete).toHaveBeenCalled();
    vi.useRealTimers();
  });
});
