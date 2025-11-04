import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsProvider } from '../context/SettingsContext';
import { FinanceProvider } from '../context/FinanceContext';
import { FinanceQuicklook } from '../components/dashboard/FinanceQuicklook';

function renderQuicklook() {
  return render(
    <MemoryRouter>
      <SettingsProvider>
        <FinanceProvider>
          <FinanceQuicklook />
        </FinanceProvider>
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe.skip('Finance targets persistence', () => {
  it('updates and persists targets across remounts', () => {
    // Ensure clean localStorage for deterministic test
    try { localStorage.removeItem('finance-targets-v1'); } catch {}

    const { unmount } = renderQuicklook();

    // Open the targets editor
  const summary = screen.getByText('Targets', { selector: 'summary' as any });
    fireEvent.click(summary);

    const input = screen.getByLabelText('incomeMonth') as HTMLInputElement;
    // Baseline value
    const original = input.value;

    // Change value
    fireEvent.change(input, { target: { value: '12345' } });

    // Close and unmount to simulate navigation
    fireEvent.click(summary);
    unmount();

    // Remount and verify value persisted
    renderQuicklook();
  fireEvent.click(screen.getByText('Targets', { selector: 'summary' as any }));
    const inputAfter = screen.getByLabelText('incomeMonth') as HTMLInputElement;
    expect(inputAfter.value).toBe('12345');

    // Cleanup
    try { localStorage.removeItem('finance-targets-v1'); } catch {}
    expect(original).not.toBe('12345');
  });
});
