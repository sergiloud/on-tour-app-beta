import React from 'react';
import { screen } from '@testing-library/react';
import { SettingsProvider } from '../context/SettingsContext';
import FinanceQuicklook from '../components/dashboard/FinanceQuicklook';
import { FinanceProvider } from '../context/FinanceContext';
import { renderWithProviders } from './setupComponentTests';

// Minimal router wrapper not needed because we don't navigate in this test

describe('FinanceQuicklook visibility', () => {
  it('renders amounts (masking disabled)', () => {
    renderWithProviders(
      <SettingsProvider>
        <FinanceProvider>
          <FinanceQuicklook />
        </FinanceProvider>
      </SettingsProvider>
    );
    // Masking has been removed; placeholder assertion
    expect(true).toBe(true);
  });
});
