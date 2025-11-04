import React from 'react';
import { renderWithProviders, screen, fireEvent } from '../test-utils';
import DashboardLayout from '../layouts/DashboardLayout';

describe('Global shortcuts', () => {
  it('opens palette with Cmd/Ctrl+K and shortcuts overlay with ?', async () => {
    // Force mac platform so metaKey path is used
    const origPlatform = Object.getOwnPropertyDescriptor(Navigator.prototype, 'platform');
    Object.defineProperty(Navigator.prototype, 'platform', { configurable: true, get: () => 'MacIntel' });
    renderWithProviders(<DashboardLayout />);
    // Cmd/Ctrl+K
    fireEvent.keyDown(window, { key:'k', metaKey: true });
    expect(await screen.findByRole('dialog', { name: /Command palette/i })).toBeInTheDocument();
    // ESC to close
    fireEvent.keyDown(window, { key:'Escape' });
    // Shift+/ as '?'
    fireEvent.keyDown(window, { key:'/', shiftKey: true });
    expect(await screen.findByRole('dialog', { name: /Keyboard shortcuts/i })).toBeInTheDocument();
    // restore
    if (origPlatform) Object.defineProperty(Navigator.prototype, 'platform', origPlatform);
  });
});
