import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { vi } from 'vitest';
import * as RR from 'react-router-dom';
import { MissionControlProvider } from '../context/MissionControlContext';
import { SettingsProvider } from '../context/SettingsContext';
import { ActionHub } from '../components/dashboard/ActionHub';
import { showStore } from '../shared/showStore';

// Mock useNavigate to capture navigation calls
const navigateMock = vi.fn();
vi.mock('react-router-dom', async (importOriginal) => {
  const mod: any = await importOriginal();
  return {
    ...mod,
    useNavigate: () => navigateMock,
  };
});

function Wrapper({ children }: { children: React.ReactNode }){
  return (
    <MemoryRouter initialEntries={["/dashboard"]}>
      <SettingsProvider>
        <MissionControlProvider>
          {children}
        </MissionControlProvider>
      </SettingsProvider>
    </MemoryRouter>
  );
}

describe('CTA navigation', () => {
  it('pushes travel create URL when clicking Add travel', async () => {
    // Ensure deterministic state: clear dismissed/snoozed and seed a confirmed show within 3 days
    try {
      window.localStorage.removeItem('ac:dismissed');
      window.localStorage.removeItem('ac:snoozed');
      window.localStorage.removeItem('travel:itineraries');
      window.localStorage.setItem('ac:tab', 'pending');
    } catch {}
    const soon = new Date(Date.now() + 3*86400000).toISOString();
    showStore.addShow({ id:'test-opp-1', city:'CTA City', country:'ES', lat:0, lng:0, date:soon, fee:1500, status:'confirmed' });
    render(
      <Wrapper>
        <ActionHub />
      </Wrapper>
    );
    // Find any Add travel CTA button or link
    const cta = await screen.findAllByRole('button', { name: /add travel|añadir viaje/i }).catch(() => []);
    const link = cta[0] || (await screen.findAllByRole('link', { name: /add travel|añadir viaje/i }).catch(() => []))[0];
    expect(cta.length > 0 || !!link).toBeTruthy();
    const el: HTMLElement = (cta[0] as any) || (link as any);
    fireEvent.click(el);
    // Expect navigate to have been called with a travel URL containing create=1 and showId
    const calledWith = navigateMock.mock.calls.map(args => String(args[0]));
    const hit = calledWith.some(u => /\/dashboard\/travel\?/.test(u) && /create=1/.test(u) && /showId=/.test(u));
    expect(hit).toBe(true);
  });
});
