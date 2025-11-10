import React from 'react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import { vi } from 'vitest';

// Mock the flights provider to ensure in-app results are available
vi.mock('../features/travel/providers', () => {
  return {
    searchFlights: async (p: any) => ({
      results: [
        { id: 'r1', origin: p.origin || 'MAD', dest: p.dest || 'CDG', dep: `${p.date||'2025-10-12'}T10:00:00.000Z`, arr: `${p.date||'2025-10-12'}T13:00:00.000Z`, durationM: 180, stops: 0, price: 199, currency: 'EUR', carrier: 'IB' }
      ],
      deepLink: 'https://example.com',
      provider: 'mock'
    })
  } as any;
});

// Ensure mock provider is used in tests to return in-app results
// @ts-ignore
;(import.meta as any).env = { ...((import.meta as any).env||{}), VITE_TRAVEL_PROVIDER: 'mock' };

describe('SmartFlightSearch interactions', () => {
  it('swaps origin and destination', async () => {
    const { default: SmartFlightSearch } = await import('../features/travel/components/SmartFlightSearch/SmartFlightSearch');
    renderWithProviders(<SmartFlightSearch />);
  const origin = screen.getByLabelText(/From/i) as HTMLInputElement;
  const dest = screen.getByLabelText(/To/i) as HTMLInputElement;
    await userEvent.clear(origin);
    await userEvent.type(origin, 'MAD');
    await userEvent.clear(dest);
    await userEvent.type(dest, 'CDG');

    const swapBtn = screen.getByRole('button', { name: /swap/i });
    await userEvent.click(swapBtn);

  expect((screen.getByLabelText(/From/i) as HTMLInputElement).value).toBe('CDG');
  expect((screen.getByLabelText(/To/i) as HTMLInputElement).value).toBe('MAD');
  });

  it('clears retDate when round trip is toggled off and syncs URL', async () => {
    const { default: SmartFlightSearch } = await import('../features/travel/components/SmartFlightSearch/SmartFlightSearch');
    renderWithProviders(<SmartFlightSearch />);
  const origin = screen.getByLabelText(/From/i) as HTMLInputElement;
  const dest = screen.getByLabelText(/To/i) as HTMLInputElement;
  const depart = screen.getByLabelText(/Date/i) as HTMLInputElement;
    await userEvent.clear(origin); await userEvent.type(origin, 'MAD');
    await userEvent.clear(dest); await userEvent.type(dest, 'CDG');
    await userEvent.clear(depart); await userEvent.type(depart, '2025-10-12');

    // Enable round trip, set return date
    const roundTrip = screen.getByLabelText(/Round trip/i) as HTMLInputElement;
    await userEvent.click(roundTrip); // check
    const ret = screen.getByLabelText(/Return/i) as HTMLInputElement;
    await userEvent.clear(ret); await userEvent.type(ret, '2025-10-18');

    // Disable round trip -> should clear retDate
    await userEvent.click(roundTrip); // uncheck
    await waitFor(() => {
      expect(window.location.search).not.toMatch(/retDate=/);
    }, { timeout: 2000 });
  });

  it('opens and closes QuickTripPicker from Add to trip', async () => {
    const { default: SmartFlightSearch } = await import('../features/travel/components/SmartFlightSearch/SmartFlightSearch');
    renderWithProviders(<SmartFlightSearch initial={{ origin: 'MAD', dest: 'CDG', date: '2025-10-12' }} />);

  // wait for results to render (pick the first list if multiple present)
  const lists = await screen.findAllByRole('list', undefined, { timeout: 4000 });
  expect(lists.length).toBeGreaterThan(0);
  const addBtn = await screen.findByText(/Add to trip/i, { selector: 'button' });
  await userEvent.click(addBtn);

    // dialog visible
    expect(await screen.findByRole('dialog')).toBeInTheDocument();

    // cancel closes
    await userEvent.click(screen.getByRole('button', { name: /Cancel/i }));
    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });
});
