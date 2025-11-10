import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../test-utils';
import userEvent from '@testing-library/user-event';

const load = async () => (await import('../features/travel/components/SmartFlightSearch/SmartFlightSearch')).default;

describe('Trip type toggle a11y', () => {
  it('has accessible group and toggles aria-pressed', async () => {
    const SmartFlightSearch = await load();
    renderWithProviders(<SmartFlightSearch />);
    const group = screen.getByRole('group', { name: /trip type/i });
    expect(group).toBeInTheDocument();
    const oneWay = screen.getByRole('button', { name: /one-way/i });
    const roundTrip = screen.getByRole('button', { name: /round trip/i });
  // Default: roundTrip state false so oneWay aria-pressed should be true and roundTrip false
  expect(oneWay).toHaveAttribute('aria-pressed', 'true');
  expect(roundTrip).toHaveAttribute('aria-pressed', 'false');

    // Activate round trip
    await userEvent.click(roundTrip);
  expect(roundTrip).toHaveAttribute('aria-pressed', 'true');
  expect(oneWay).toHaveAttribute('aria-pressed', 'false');

    // Switch back to one-way
    await userEvent.click(oneWay);
  expect(roundTrip).toHaveAttribute('aria-pressed', 'false');
  expect(oneWay).toHaveAttribute('aria-pressed', 'true');
  });
});
