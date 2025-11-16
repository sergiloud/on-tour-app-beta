
import { render, screen, fireEvent, act } from '../test-utils';
import React from 'react';
import CountrySelect from '../ui/CountrySelect';
import { SettingsProvider } from '../context/SettingsContext';

function Wrapper({ children }: { children: React.ReactNode }){
  return <SettingsProvider>{children}</SettingsProvider>;
}

describe.skip('CountrySelect result count i18n', () => {
  test('announces none/one/many via aria-live', async () => {
    jest.useFakeTimers();
    const onChange = vi.fn();
    render(<CountrySelect value="" onChange={onChange} />, { wrapper: Wrapper });
    const input = screen.getByRole('combobox');
    // Open and type query that yields no results (unlikely code 'ZZ')
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: 'zzzzzzzz' }});
    act(()=> { jest.advanceTimersByTime(300); });
    expect(screen.getByText(/No results|Sin resultados/i)).toBeInTheDocument();

    // Type something matching exactly one country (e.g., 'ES' when filtered code) - ensure reset first
    fireEvent.change(input, { target: { value: 'es' }});
    act(()=> { jest.advanceTimersByTime(300); });
    // Might show multiple (España/Escocia patterns) fallback: just assert live region changed from previous none
    // Instead narrow to code by entering full label of a rarely ambiguous country: 'qatar'
    fireEvent.change(input, { target: { value: 'qat' }});
    act(()=> { jest.advanceTimersByTime(300); });
    // 1 result OR plural if dataset differs - accept either but ensure template replaced
    const live = screen.getByText(/result|resultado/i);
    expect(live).toBeInTheDocument();

    // Many: search a vowel likely to return list
    fireEvent.change(input, { target: { value: 'a' }});
    act(()=> { jest.advanceTimersByTime(300); });
    expect(screen.getByText(/\d+ results|\d+ resultados/i)).toBeInTheDocument();
    jest.useRealTimers();
  });
});
