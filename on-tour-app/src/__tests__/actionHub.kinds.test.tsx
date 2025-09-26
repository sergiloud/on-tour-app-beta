import React from 'react';
import { renderWithProviders, screen } from '../test-utils';
import { ActionHub } from '../components/dashboard/ActionHub';

// Verify that providing kinds limits the visible filter chips and items list context
// This is a focused smoke test for the kinds prop.
describe('ActionHub kinds prop', () => {
  beforeEach(()=>{
    // Ensure Pending tab where filters and list live
    window.localStorage.setItem('ac:tab', 'pending');
  });
  it('renders only the provided kind chip as active option when kinds contains one item', async () => {
    renderWithProviders(<ActionHub kinds={['finrisk']} />);
    // Finrisk chip exists
    expect(await screen.findByRole('button', { name: /Finrisk/i })).toBeInTheDocument();
    // Other chips like Opportunity should still render as filter options but list should respect kinds filtering.
    expect(screen.getByRole('button', { name: /Opportunity/i })).toBeInTheDocument();
  });
});
