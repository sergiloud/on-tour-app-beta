import { render, screen, fireEvent, within } from '../test-utils';
import React from 'react';
import { ShowEditorDrawer } from '../features/shows/editor/ShowEditorDrawer';

const baseDraft = {
  id: 'test1', city: 'Madrid', country: 'ES', date: '2025-04-20', fee: 10000,
  costs: [], status: 'pending'
};

describe('ShowEditorDrawer Quick Entry', () => {
  test('parses quick entry and applies fields', () => {
    const handleSave = vi.fn();
    render(<ShowEditorDrawer open mode="edit" initial={baseDraft as any} onSave={handleSave} onRequestClose={()=>{}} />);

    const input = screen.getByPlaceholderText(/20\/04\/2025/i);
    fireEvent.change(input, { target: { value: '20/04/2025 "Rock Fest" Barcelona ES fee 12k wht 15%' } });

    // Preview chips appear
    const preview = screen.getByText(/Barcelona/);
    expect(preview).toBeInTheDocument();
    const applyBtn = screen.getByRole('button', { name: /apply/i });
    expect(applyBtn).not.toBeDisabled();
    fireEvent.click(applyBtn);

    // City should update
    const cityField = screen.getByDisplayValue('Barcelona');
    expect(cityField).toBeInTheDocument();
    // Fee updated
    expect(screen.getByDisplayValue('12000')).toBeInTheDocument();
  });

  test('handles invalid quick entry gracefully', () => {
    render(<ShowEditorDrawer open mode="edit" initial={baseDraft as any} onSave={()=>{}} onRequestClose={()=>{}} />);
    const input = screen.getByPlaceholderText(/20\/04\/2025/i);
    fireEvent.change(input, { target: { value: 'xyz ???' } });
    expect(screen.getByText(/Cannot interpret|No pude|Cannot/i)).toBeInTheDocument();
  });
});
