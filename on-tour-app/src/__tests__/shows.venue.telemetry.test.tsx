import { render, screen, fireEvent } from '../test-utils';
import React from 'react';
import { ShowEditorDrawer } from '../features/shows/editor/ShowEditorDrawer';
import { TE } from '../lib/telemetryEvents';

// Mock telemetry trackEvent
vi.mock('../lib/telemetry', () => ({ trackEvent: vi.fn() }));
import { trackEvent } from '../lib/telemetry';

const baseDraft = { id:'v1', city:'Madrid', country:'ES', date:'2025-04-20', fee:1000, status:'pending', name:'Test' } as any;

describe('Venue telemetry', () => {
  beforeEach(()=> { (trackEvent as any).mockClear(); });

  it('emits set, changed, cleared sequence', () => {
    render(<ShowEditorDrawer open mode="edit" initial={baseDraft} onSave={()=>{}} onRequestClose={()=>{}} />);
    const venueInput = screen.getByPlaceholderText(/Venue name|Nombre de la sala/i);
    // Set
    fireEvent.change(venueInput, { target: { value: 'Sala 1' }});
    // Change
    fireEvent.change(venueInput, { target: { value: 'Sala 2' }});
    // Clear
    fireEvent.change(venueInput, { target: { value: '' }});

  const calls = (trackEvent as any).mock.calls.map((c: any)=> c[0]);
    expect(calls).toContain(TE.SHOW_VENUE_SET);
    expect(calls).toContain(TE.SHOW_VENUE_CHANGED);
    expect(calls).toContain(TE.SHOW_VENUE_CLEARED);
  });
});
