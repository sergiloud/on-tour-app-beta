import React from 'react';
import { renderWithProviders as render, screen } from '../test-utils';
import { SettingsProvider } from '../context/SettingsContext';
import { FinanceProvider } from '../context/FinanceContext';
import GlobalKPIBar from '../components/dashboard/GlobalKPIBar';

describe.skip('GlobalKPIBar sparkline', () => {
  it('renders sparklines', () => {
    render(
      <SettingsProvider>
        <FinanceProvider>
          <GlobalKPIBar />
        </FinanceProvider>
      </SettingsProvider>
    );
    // We can't easily read SVG values here, but we can assert KPI labels are present
    // Multiple elements can contain the same text (visible label + sr-only live regions), so use *AllBy* queries.
    expect(screen.getAllByText(/Income \(Month\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Costs \(Month\)/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Net \(Month\)/i).length).toBeGreaterThan(0);
  });
});
