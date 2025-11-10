import { renderWithProviders as render, screen } from '../test-utils';
import React from 'react';
import { ShowEditorDrawer } from '../features/shows/editor/ShowEditorDrawer';

const baseDraft = { id:'hdr1', city:'Madrid', country:'ES', date:'2025-04-20', fee:0, status:'pending' } as any;

describe('ShowEditorDrawer quick entry header copy', () => {
  test('uses updated quick add copy (EN)', () => {
    render(<ShowEditorDrawer open mode="edit" initial={baseDraft} onSave={()=>{}} onRequestClose={()=>{}} />);
    // Label
    expect(screen.getByText(/Quick add costs/i)).toBeInTheDocument();
    // Hint (English form)
    expect(screen.getByText(/Hotel 1200/i)).toBeInTheDocument();
  });
});
