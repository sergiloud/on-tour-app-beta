import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import ShowEditorDrawer from '../features/shows/editor/ShowEditorDrawer';
import { SettingsProvider } from '../context/SettingsContext';

vi.mock('../lib/telemetry', () => ({ track: vi.fn() }));

function renderEditor(initial?: any){
  return render(
    <SettingsProvider>
  <ShowEditorDrawer open mode={initial? 'edit':'add'} initial={initial||{ id:'tmp', date:'2025-04-20', city:'Barcelona', country:'ES', fee:0, name:'', status:'pending' }} onRequestClose={()=>{}} onSave={()=>{}} />
    </SettingsProvider>
  );
}

describe.skip('Quick Entry parsing', () => {
  it('parses fee with currency symbol and k suffix', () => {
    renderEditor();
    const input = screen.getByPlaceholderText(/20\/04\/2025/i);
    fireEvent.change(input, { target: { value: '20/04/2025 "Show" Madrid ES fee €12k wht 15%' } });
    // Apply (Shift+Enter simulation): directly click apply button if present
    const applyBtn = screen.getByRole('button', { name: /apply|aplicar/i });
    fireEvent.click(applyBtn);
    // After apply, expect fee field updated (query fee input by label Fee/WHT section?)
    const feeMatching = screen.getAllByDisplayValue(/12000/);
    expect(feeMatching.length).toBeGreaterThan(0);
  });

  it('shows parse error for unrecognized string', () => {
    renderEditor();
    const input = screen.getByPlaceholderText(/20\/04\/2025/i);
    fireEvent.change(input, { target: { value: 'nonsense xyz ???' } });
    const parseError = screen.getByText(/interpret|no se puede interpretar/i);
    expect(parseError).toBeInTheDocument();
  });
});
