import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../test-utils';
import PinnedDrawer from '../features/travel/components/SmartFlightSearch/PinnedDrawer';

const mkItem = (id: string, overrides: Partial<any> = {}) => ({
  id,
  origin: 'MAD',
  dest: 'CDG',
  dep: new Date().toISOString(),
  arr: new Date().toISOString(),
  carrier: 'IB',
  stops: 0,
  durationM: 120,
  price: 123,
  currency: 'EUR',
  ...overrides,
});

describe('PinnedDrawer', () => {
  test('shows badge counter and aria-live header', () => {
    renderWithProviders(<PinnedDrawer items={[mkItem('a'), mkItem('b')]} onUnpin={()=>{}} onAdd={()=>{}} />);
    const hdr = screen.getByText(/Compare/i);
    expect(hdr).toBeInTheDocument();
    const live = hdr.closest('div');
    expect(live).toHaveAttribute('aria-live', 'polite');
  });

  test('opens drawer to show table', () => {
    renderWithProviders(<PinnedDrawer items={[mkItem('a')]} onUnpin={()=>{}} onAdd={()=>{}} />);
    const btn = screen.getByRole('button', { name: /Compare/i });
    fireEvent.click(btn);
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
});
