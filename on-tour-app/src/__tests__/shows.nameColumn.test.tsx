import React from 'react';
import { renderWithProviders, screen, fireEvent, within } from '../test-utils';
import Shows from '../pages/dashboard/Shows';

// This test validates the new Show (name) column and fallback behavior.
// When a show has a name it should display it; when not provided it should fallback to the city.

describe.skip('Shows table name column', () => {
  it('renders Show header and falls back to city when name missing', () => {
    renderWithProviders(<Shows />);

    // Ensure List view so the table is visible
    const listBtn = screen.getByRole('button', { name: /List/i });
    fireEvent.click(listBtn);

    // Header present
    expect(screen.getByRole('columnheader', { name: /Show/i })).toBeInTheDocument();

    // Find any existing row (dataset loaded maybe empty if no demo data loaded yet) - if empty we add one
    const addBtn = screen.getByRole('button', { name: /Add show/i });
    fireEvent.click(addBtn);

  const dialog = screen.getByRole('dialog');
  // Scope queries to the dialog to avoid picking up the global search input with aria-label
  const cityInput = within(dialog).getByLabelText(/City/i);
  const countryInput = within(dialog).getByLabelText(/Country/i);
  const dateInput = within(dialog).getByLabelText(/Date/i);
  const feeInput = within(dialog).getByLabelText(/^Fee$/i);

    fireEvent.change(cityInput, { target: { value: 'Fallback City' } });
    fireEvent.change(countryInput, { target: { value: 'ES' } });
    fireEvent.change(dateInput, { target: { value: '2025-08-10' } });
    fireEvent.change(feeInput, { target: { value: '2000' } });

    // Submit via Enter
    fireEvent.keyDown(feeInput, { key: 'Enter' });

    // Two occurrences are possible (Show column + City column). Ensure at least one cell in the Show column has title attr (added) set to city.
  const fallbackCells = screen.getAllByText('Fallback City');
  // One cell should have the title attribute (Show column), ensure at least one match has it
  expect(fallbackCells.some(el => el.getAttribute('title') === 'Fallback City')).toBe(true);
  });
});
