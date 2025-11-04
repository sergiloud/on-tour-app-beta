import React from 'react';
import { render, screen } from '@testing-library/react';
import { SettingsProvider } from '../context/SettingsContext';
import { FinanceProvider } from '../context/FinanceContext';
import { FinanceQuicklook } from '../components/dashboard/FinanceQuicklook';
import { MemoryRouter } from 'react-router-dom';

describe.skip('FinanceQuicklook', () => {
  it('renders quicklook with Pipeline section', () => {
    render(
      <MemoryRouter>
        <SettingsProvider>
          <FinanceProvider>
            <FinanceQuicklook />
          </FinanceProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(screen.getByRole('heading', { name: /Finance Quicklook/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Pipeline/i })).toBeInTheDocument();
  });
});
