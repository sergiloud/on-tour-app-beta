import React from 'react';
import { render, screen } from '@testing-library/react';
import { SettingsProvider } from '../context/SettingsContext';
import { FinanceProvider } from '../context/FinanceContext';
import { FinanceQuicklook } from '../components/dashboard/FinanceQuicklook';
import { MemoryRouter } from 'react-router-dom';

describe.skip('FinanceQuicklook KPIs', () => {
  it('renders new KPI badges (DSO, GM, MTD, FvT, Δ)', () => {
    render(
      <MemoryRouter>
        <SettingsProvider>
          <FinanceProvider>
            <FinanceQuicklook />
          </FinanceProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
    expect(screen.getByText(/DSO/i)).toBeInTheDocument();
    expect(screen.getByText(/GM/i)).toBeInTheDocument();
    expect(screen.getByText(/MTD/i)).toBeInTheDocument();
    expect(screen.getByText(/FvT/i)).toBeInTheDocument();
    // Δ badge includes arrow or dash; just assert the symbol exists in context
    const delta = screen.getAllByText(/Δ/)[0];
    expect(delta).toBeInTheDocument();
  });
});
