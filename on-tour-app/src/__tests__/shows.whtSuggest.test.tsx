import { render, screen, fireEvent } from '../test-utils';
import React from 'react';
import { ShowEditorDrawer } from '../features/shows/editor/ShowEditorDrawer';

const baseDraft = {
  id: 'wht1', city: 'Madrid', country: 'ES', date: '2025-04-20', fee: 10000,
  costs: [], status: 'pending'
};

describe('ShowEditorDrawer WHT Suggest', () => {
  test('shows suggestion badge for ES and applies it', () => {
    render(<ShowEditorDrawer open mode="edit" initial={baseDraft as any} onSave={()=>{}} onRequestClose={()=>{}} />);
    const badge = screen.getByRole('button', { name: /15%/ });
    expect(badge).toBeInTheDocument();
    fireEvent.click(badge);
    const whtInput = screen.getByDisplayValue('15');
    expect(whtInput).toBeInTheDocument();
  });

  test('no badge if country has no default', () => {
    render(<ShowEditorDrawer open mode="edit" initial={{...baseDraft, country: 'ZZ'} as any} onSave={()=>{}} onRequestClose={()=>{}} />);
    const maybe = screen.queryByText(/suggest|15%/i);
    expect(maybe).toBeNull();
  });
});
