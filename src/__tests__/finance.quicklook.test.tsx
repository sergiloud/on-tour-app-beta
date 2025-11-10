import React from 'react';
import { screen } from '@testing-library/react';
import { SettingsProvider } from '../context/SettingsContext';
import { FinanceProvider } from '../context/FinanceContext';
import { FinanceQuicklook } from '../components/dashboard/FinanceQuicklook';
import { renderWithProviders } from './setupComponentTests';

describe('FinanceQuicklook', () => {
  it('renders quicklook with Pipeline section', () => {
    renderWithProviders(
      <SettingsProvider>
        <FinanceProvider>
          <FinanceQuicklook />
        </FinanceProvider>
      </SettingsProvider>
    );
    expect(screen.getByRole('heading', { name: /Finance Quicklook/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Pipeline/i })).toBeInTheDocument();
  });
});
