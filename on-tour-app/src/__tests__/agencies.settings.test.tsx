import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../test-utils';
import SettingsPage from '../pages/dashboard/Settings';
import { useSettings } from '../context/SettingsContext';

// Helper component to directly exercise context API
const AddThreeBooking: React.FC = () => {
  const { addAgency, bookingAgencies } = useSettings();
  return (
    <div>
      <button onClick={()=>{ addAgency({ name:'A1', type:'booking', commissionPct:10, territoryMode:'worldwide' }); }}>add1</button>
      <button onClick={()=>{ addAgency({ name:'A2', type:'booking', commissionPct:12, territoryMode:'worldwide' }); }}>add2</button>
      <button onClick={()=>{ addAgency({ name:'A3', type:'booking', commissionPct:15, territoryMode:'worldwide' }); }}>add3</button>
      <button onClick={()=>{ addAgency({ name:'A4', type:'booking', commissionPct:20, territoryMode:'worldwide' }); }}>add4</button>
      <div data-testid="count">{bookingAgencies.length}</div>
    </div>
  );
};

describe('agency settings', () => {
  beforeEach(() => {
    try { localStorage.clear(); } catch {}
  });

  it('enforces max 3 booking agencies', async () => {
    renderWithProviders(<AddThreeBooking />);
    for (const id of ['add1','add2','add3','add4']) {
      screen.getByText(id).click();
    }
    await waitFor(() => {
      expect(screen.getByTestId('count').textContent).toBe('3');
    });
  });

  it('renders agencies section in settings page', () => {
    renderWithProviders(<SettingsPage />);
    // Ensure main Agencies heading and the specific Booking/Management subsections exist
    const headings = screen.getAllByRole('heading', { level: 3 });
    const texts = headings.map(h=> h.textContent);
    expect(texts.some(t=> /Agencies/i.test(t || ''))).toBe(true);
    expect(texts.some(t=> /Booking Agencies/i.test(t || ''))).toBe(true);
    expect(texts.some(t=> /Management Agencies/i.test(t || ''))).toBe(true);
  });
});
