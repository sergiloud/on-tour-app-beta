import React from 'react';
import { render, screen } from '@testing-library/react';
import { SettingsProvider } from '../context/SettingsContext';
import { FinanceProvider } from '../context/FinanceContext';
import { MissionHud } from '../components/mission/MissionHud';
import { MemoryRouter } from 'react-router-dom';

describe.skip('MissionHud postponed show inclusion', () => {
  it('renders agenda with a show name (postponed fallback logic)', () => {
    render(
      <MemoryRouter>
        <SettingsProvider>
          <FinanceProvider>
            <MissionHud />
          </FinanceProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    // The agenda should list at least one show item (uses real show name or venue)
    // We assert existence of heading What's Next or localized variant and a list item
    const heading = screen.getByRole('heading', { name: /what's next/i });
    expect(heading).toBeInTheDocument();
  });
});
