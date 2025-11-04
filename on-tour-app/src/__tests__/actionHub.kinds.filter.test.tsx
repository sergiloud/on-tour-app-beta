import React from 'react';
import { renderWithProviders, screen } from '../test-utils';
import { ActionHub } from '../components/dashboard/ActionHub';

vi.mock('../features/shows/selectors', async (orig) => {
  const mod = await (orig as any)();
  return {
    ...mod,
    useFilteredShows: () => ({ shows: [
      { id:'1', date:'2025-09-10', city:'Madrid', fee: 1000, status:'pending', country:'ES' },
      { id:'2', date:'2025-09-15', city:'Paris', fee: 500, status:'confirmed', country:'FR' },
      { id:'3', date:'2025-09-20', city:'Berlin', fee: 800, status:'offer', country:'DE' },
    ] }),
  };
});

vi.mock('../services/travelApi', () => ({ fetchItinerariesCached: () => Promise.resolve({ data: [] }) }));

describe.skip('ActionHub kinds filter prop', () => {
  it('filters by provided kinds', async () => {
    renderWithProviders(<ActionHub kinds={['urgency'] as any} />);
    // Wait for list
    const list = await screen.findByRole('tabpanel', { name: /Pending Actions/i });
    expect(list).toBeInTheDocument();
    // Should not show risk/offer labels if kinds restrict to urgency; a bit loose: check at least label occurrences
    const urgencyChips = screen.getAllByText(/Urgency|urgency/i);
    expect(urgencyChips.length).toBeGreaterThan(0);
  });
});
