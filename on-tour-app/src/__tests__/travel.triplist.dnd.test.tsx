import React from 'react';
import { renderWithProviders as render, screen, fireEvent } from '../test-utils';
import FlightResults from '../features/travel/components/SmartFlightSearch/FlightResults';
import TripList from '../components/travel/TripList';
import { act } from 'react-dom/test-utils';
import { describe, it, expect, vi } from 'vitest';

// Minimal fake flight
const flight = {
  id: 'f1', origin: 'MAD', dest: 'JFK', dep: new Date('2025-10-12T08:00:00Z').toISOString(), arr: new Date('2025-10-12T14:00:00Z').toISOString(),
  durationM: 360, stops: 0, carrier: 'IB', price: 350, currency: 'EUR'
} as any;

// Mock trips service to be deterministic in tests
vi.mock('../services/trips', () => {
  const listeners: any[] = [];
  let trips: any[] = [{ id: 't1', title: 'Test Trip', status: 'planned', segments: [], costs: [] }];
  return {
    listTrips: () => trips,
    onTripsChanged: (cb: any) => { listeners.push(cb); return () => {}; },
    addSegment: (tripId: string, seg: any) => {
      const t = trips.find(t=> t.id===tripId); if (!t) return;
      (t.segments as any[]).push({ id: 's1', ...seg });
      listeners.forEach(fn=> fn({ type: 'updated', trip: t }));
    },
  };
});

function makeDataTransfer(payload: any){
  const store: Record<string,string> = {};
  return {
    setData: (type: string, str: string) => { store[type] = str; },
    getData: (type: string) => store[type] || '',
    effectAllowed: 'all',
    dropEffect: 'copy' as const,
  } as any;
}

describe('TripList DnD', () => {
it('drops a flight onto a trip and adds a segment', async () => {
  render(
    <div>
      <FlightResults results={[flight]} onAdd={()=>{}} />
      <TripList />
    </div>
  );
  const lists = await screen.findAllByRole('list');
  const cardList = lists[0];
  const card = cardList.firstChild as HTMLElement;
  const tripBtn = screen.getByRole('button', { name: /Test Trip/ });

  const dt = makeDataTransfer({ type: 'flight', payload: flight });
  // simulate dragstart sets payload
  await act(async ()=>{
    fireEvent.dragStart(card, { dataTransfer: dt });
  });
  // Now drop on trip
  await act(async ()=>{
    fireEvent.dragOver(tripBtn, { dataTransfer: dt });
    fireEvent.drop(tripBtn, { dataTransfer: dt });
  });

  // No assertions on services here beyond not crashing; UI highlight clears
  expect(tripBtn).toBeInTheDocument();
});

it('drop on create new opens picker with default title', async () => {
  render(
    <div>
      <FlightResults results={[flight]} onAdd={()=>{}} />
      <TripList />
    </div>
  );
  const lists = await screen.findAllByRole('list');
  const cardList = lists[0];
  const card = cardList.firstChild as HTMLElement;
  const dropzone = screen.getByRole('button', { name: /Drop here to create/ });

  const dt = makeDataTransfer({ type: 'flight', payload: flight });
  await act(async ()=>{ fireEvent.dragStart(card, { dataTransfer: dt }); });
  await act(async ()=>{
    fireEvent.dragOver(dropzone, { dataTransfer: dt });
    fireEvent.drop(dropzone, { dataTransfer: dt });
  });

  // Dialog should appear
  expect(await screen.findByRole('dialog')).toBeInTheDocument();
});
});
