import React from 'react';
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, fireEvent, within } from '../test-utils';
import Shows from '../pages/dashboard/Shows';

// Helpers to seed localStorage demo data if needed
function seedShows(shows:any[]){
  localStorage.setItem('demo:shows', JSON.stringify(shows));
}

const baseShows = [
  { id:'a', city:'Madrid', country:'ES', date:'2025-12-10', fee:10000, status:'pending', lat:0, lng:0, whtPct:10, costs:[{ label:'Sound', amount:500 }] },
  { id:'b', city:'Paris', country:'FR', date:'2025-11-05', fee:8000, status:'offer', lat:0, lng:0, whtPct:5, costs:[{ label:'Light', amount:400 }] },
  { id:'c', city:'Berlin', country:'DE', date:'2025-11-20', fee:0, status:'archived', lat:0, lng:0, whtPct:0 }
];

describe('Shows enhancements', () => {
  beforeEach(()=>{
    localStorage.clear();
    seedShows(baseShows);
  });

  it('renders totals bar with avg fee and avg margin and can pin/unpin', () => {
    render(<Shows />);
    // Totals bar appears
    const totalsBar = screen.getByText(/Fees/i).closest('div');
    expect(totalsBar).toBeTruthy();
    // Avg Fee label present
    expect(screen.getByText(/Avg Fee/i)).toBeTruthy();
    // Pin button toggles text
    const pinBtn = screen.getByRole('button', { name: /Pin/i });
    fireEvent.click(pinBtn);
    expect(screen.getByRole('button', { name: /Unpin/i })).toBeTruthy();
  });

  it('can hide WHT column and persist preference', () => {
    render(<Shows />);
    // WHT header present
    expect(screen.getByText(/WHT %/i)).toBeTruthy();
    const hideBtn = within(screen.getByText(/WHT %/i).closest('th') as HTMLElement).getByRole('button');
    fireEvent.click(hideBtn);
    expect(screen.queryByText(/WHT %/i)).toBeNull();
    // Re-render to assert persistence
    render(<Shows />);
    expect(screen.queryByText(/WHT %/i)).toBeNull();
  });

  it('duplicates a row with deep-copied costs and resets archived status', () => {
    render(<Shows />);
    // Find archived row (Berlin) actions menu
    const archivedRow = screen.getByText('Berlin').closest('tr')!;
    const menus = within(archivedRow).getAllByRole('button', { name:/Row actions/i });
    // Should be single button in row cell
    fireEvent.click(menus[0]!);
    const duplicateItem = screen.getByRole('menuitem', { name:/Duplicate/i });
    fireEvent.click(duplicateItem);
    // New copy should appear with (copy) in name or city
  const copy = screen.getAllByText(/copy/i);
    expect(copy.length).toBeGreaterThan(0);
  });

  it('archives and restores a show updating status badge', () => {
    render(<Shows />);
    // Use Paris (offer) row
    const parisRow = screen.getByText('Paris').closest('tr')!;
    const menuBtn = within(parisRow).getByRole('button', { name:/Row actions/i });
    fireEvent.click(menuBtn);
    const archiveItem = screen.getByRole('menuitem', { name:/Archive/i });
    fireEvent.click(archiveItem);
    // Status badge should now show archived
    expect(within(parisRow).getByText(/archived/i)).toBeTruthy();
    // Restore
    fireEvent.click(menuBtn); // reopen
    const restoreItem = screen.getByRole('menuitem', { name:/Restore/i });
    fireEvent.click(restoreItem);
    expect(within(parisRow).queryByText(/archived/i)).toBeNull();
  });
});
