import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../test-utils';
import SmartFlightSearch from '../features/travel/components/SmartFlightSearch/SmartFlightSearch';

describe('Travel a11y quick wins', () => {
  test('marks same route as invalid and shows alert', async () => {
    renderWithProviders(<SmartFlightSearch initial={{ origin: 'MAD', dest: 'MAD', date: '2025-10-12' }} />);
    const from = await screen.findByLabelText(/Origin|Origen/i);
    const to = await screen.findByLabelText(/Destination|Destino/i);
    expect(from).toHaveAttribute('aria-invalid', 'true');
    expect(to).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByRole('alert')).toHaveTextContent(/same/i);
  });

  test('autocomplete shows No results when no matches', async () => {
    renderWithProviders(<SmartFlightSearch initial={{ date: '2025-10-12' }} />);
    const from = await screen.findByLabelText(/Origin|Origen/i);
    fireEvent.focus(from);
    fireEvent.change(from, { target: { value: 'ZZZ' } });
    const nodes = await screen.findAllByText(/No results|Sin resultados/i);
    expect(nodes.length).toBeGreaterThanOrEqual(1);
  });
});
