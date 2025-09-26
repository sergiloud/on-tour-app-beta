import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { ActionHub } from '../components/dashboard/ActionHub';
import { MissionControlProvider } from '../context/MissionControlContext';
import { SettingsProvider } from '../context/SettingsContext';
import { MemoryRouter } from 'react-router-dom';

describe('ActionHub', () => {
  beforeEach(() => {
    // Ensure the component starts on the Pending tab regardless of previous tests
    window.localStorage.setItem('ac:tab', 'pending');
  });
  it('switches tabs', () => {
    render(
      <MemoryRouter>
        <SettingsProvider>
          <MissionControlProvider>
            <ActionHub />
          </MissionControlProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('tab', { name: /Pending/i, selected: true })).toBeInTheDocument();
    const showsTab = screen.getByRole('tab', { name: /This Month/i });
    fireEvent.click(showsTab);
    expect(showsTab).toHaveAttribute('aria-selected', 'true');
  // The tab switches immediately; content may show a loading skeleton briefly.
  // Assert the tabpanel for This Month is present (accessible name is derived from the tab label via aria-labelledby).
  expect(screen.getByRole('tabpanel', { name: /This Month/i })).toBeInTheDocument();
  });

  it('shows finrisk filter chip', () => {
    render(
      <MemoryRouter>
        <SettingsProvider>
          <MissionControlProvider>
            <ActionHub />
          </MissionControlProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    // Make sure we are on the Pending tab where filters are shown
    const pendingTab = screen.getByRole('tab', { name: /Pending/i });
    if (pendingTab.getAttribute('aria-selected') !== 'true') {
      fireEvent.click(pendingTab);
    }
    expect(screen.getByRole('button', { name: /Finrisk/i })).toBeInTheDocument();
  });
});
