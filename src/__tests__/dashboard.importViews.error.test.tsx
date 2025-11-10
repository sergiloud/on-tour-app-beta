import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { SettingsProvider } from '../context/SettingsContext';
import { FinanceProvider } from '../context/FinanceContext';
import { DashboardOverview } from '../pages/Dashboard';
import { MemoryRouter } from 'react-router-dom';

// Focus: invalid JSON + invalid shape surfaces error with aria-describedby link
describe.skip('Dashboard view import validation', () => {
  function setup() {
    render(
      <MemoryRouter>
        <SettingsProvider>
          <FinanceProvider>
            <DashboardOverview />
          </FinanceProvider>
        </SettingsProvider>
      </MemoryRouter>
    );
  }
  it('shows invalid JSON error', () => {
    setup();
    // Open views menu
    const btn = screen.getByRole('button', { name: /views/i }); // rely on accessible name containing Views
    fireEvent.click(btn);
    const importBtn = screen.getAllByRole('menuitem').find(el => /import/i.test(el.textContent||''));
    expect(importBtn).toBeTruthy();
    fireEvent.click(importBtn!);
    const textarea = screen.getByLabelText(/paste json/i);
    fireEvent.change(textarea, { target: { value: '{ invalid' } });
    const importAction = screen.getByRole('button', { name: /import/i });
    fireEvent.click(importAction);
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid json/i);
  });
  it('shows invalid shape error', () => {
    setup();
    const btn = screen.getByRole('button', { name: /views/i });
    fireEvent.click(btn);
    const importBtn = screen.getAllByRole('menuitem').find(el => /import/i.test(el.textContent||''));
    fireEvent.click(importBtn!);
    const textarea = screen.getByLabelText(/paste json/i);
    fireEvent.change(textarea, { target: { value: '{"bad": {}}' } });
    const importAction = screen.getByRole('button', { name: /import/i });
    fireEvent.click(importAction);
    expect(screen.getByRole('alert')).toHaveTextContent(/invalid view shape/i);
  });
});
