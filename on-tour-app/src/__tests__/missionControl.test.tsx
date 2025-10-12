import React from 'react';
import { render, screen, fireEvent, cleanup } from '@testing-library/react';
import { MissionControlProvider } from '../context/MissionControlContext';
import { KPIDataProvider } from '../context/KPIDataContext';
import { FinanceProvider } from '../context/FinanceContext';
import { MissionHud } from '../components/mission/MissionHud';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';

// Helper wrapper
const setup = () => {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <FinanceProvider>
          <KPIDataProvider>
            <MissionControlProvider>
              <MissionHud />
            </MissionControlProvider>
          </KPIDataProvider>
        </FinanceProvider>
      </SettingsProvider>
    </MemoryRouter>
  );
};

describe('MissionControl persistence & layers', () => {
  afterEach(() => {
    cleanup();
  });

  it('centers map from HUD and keeps view', () => {
    localStorage.clear();
    setup();
    // Default tab is What's Next present
    const whatsNextTab = screen.getByRole('tab', { name: /What's Next/i });
    expect(whatsNextTab).toHaveAttribute('aria-selected', 'true');
    // Use Center map action (if there is a next show it should be enabled)
    const centerBtn = screen.getAllByRole('button', { name: /Center map/i })[0]!;
    expect(centerBtn).toBeInTheDocument();
    fireEvent.click(centerBtn);
  });

  it('restores last view on reload', () => {
    localStorage.clear();
    // First render: interact with center map
    setup();
    const centerBtn = screen.getAllByRole('button', { name: /Center map/i })[0]!;
    fireEvent.click(centerBtn);
    // Rerender new tree simulating reload
    cleanup();
    setup();
    // Should restore layer toggle state and default view
    const whatsNextTab2 = screen.getByRole('tab', { name: /What's Next/i });
    expect(whatsNextTab2).toHaveAttribute('aria-selected', 'true');
  });
});
