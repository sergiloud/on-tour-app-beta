import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import React from 'react';
import CountrySelect from '../ui/CountrySelect';
import { SettingsProvider } from '../context/SettingsContext';

vi.mock('../lib/telemetry', () => ({ track: vi.fn() }));

function renderControl(){
  let value = '';
  const Wrapper = () => {
    const [val, setVal] = React.useState(value);
    return <CountrySelect value={val} onChange={setVal} />;
  };
  render(<SettingsProvider><Wrapper /></SettingsProvider>);
}

describe('CountrySelect', () => {
  it('shows no results message when query empty returns none (unlikely) or filtered mismatch', () => {
    renderControl();
    const input = screen.getByPlaceholderText(/country|país/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zzzzzz' } });
    expect(screen.getByText(/no results|sin resultados/i)).toBeInTheDocument();
  });

  it('clear button appears and clears value', () => {
    renderControl();
    const input = screen.getByPlaceholderText(/country|país/i);
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'spain' } });
    // pick first option if exists
    const opt = screen.getByRole('option');
    fireEvent.mouseDown(opt);
    // clear button
    const clearBtn = screen.getByRole('button', { name: /clear|limpiar/i });
    fireEvent.click(clearBtn);
    expect((input as HTMLInputElement).value).toBe('');
  });
});
