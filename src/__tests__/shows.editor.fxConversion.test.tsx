import React from 'react';
import { renderWithProviders } from '../test-utils';
import { ShowEditorDrawer } from '../features/shows/editor/ShowEditorDrawer';
import { screen, waitFor } from '@testing-library/react';

// Basic test: when feeCurrency != base currency, converted fee line renders with rate label
// Assumes SettingsContext default base currency = EUR (see SettingsContext implementation).

function makeInitial(){
  return {
    id: 'fx-test',
    name: 'FX Test',
    city: 'Paris',
    country: 'FR',
    date: '2025-12-20',
    status: 'pending',
    fee: 10000,
    feeCurrency: 'USD',
    whtPct: 15,
    costs: [],
    notes: ''
  } as any;
}

describe('ShowEditorDrawer FX conversion', () => {
  test('shows converted fee line and rate label when currency differs', async () => {
    renderWithProviders(
      <ShowEditorDrawer
        open
        mode="edit"
        initial={makeInitial()}
        onSave={()=>{}}
        onRequestClose={()=>{}}
      />
    );

    // Ensure currency select is present
    expect(await screen.findByLabelText(/currency/i)).toBeInTheDocument();

    // Converted line contains the approximate sign and Rate label
    await waitFor(()=> {
      const converted = screen.getByText(/≈/);
      expect(converted).toBeInTheDocument();
      expect(screen.getByText(/Rate/i)).toBeInTheDocument();
    });
  });
});
