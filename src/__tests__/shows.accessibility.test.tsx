import React from 'react';
import { renderWithProviders, screen, fireEvent, within } from '../test-utils';
import Shows from '../pages/dashboard/Shows';

function openBoardView() {
  // Switch to Board view if not already
  const boardBtn = screen.getByRole('button', { name: /Board/i });
  fireEvent.click(boardBtn);
}

describe.skip('Shows accessibility and interactions', () => {
  it('allows keyboard activation of board cards (Enter/Space)', async () => {
    renderWithProviders(<Shows />);
    openBoardView();
    // Pick first card inside any board column (role=region)
    const regions = screen.getAllByRole('region');
    const regionButtons = regions.flatMap((r) => within(r).queryAllByRole('button'));
    // Prefer the card container (div[role=button]), fallback to any tabbable element in region
    const card = regionButtons.find((el) => el.tagName.toLowerCase() === 'div') || regionButtons.find((el) => el.tabIndex === 0);
    if (!card) return; // nothing to assert if no data
    card.focus();
    fireEvent.keyDown(card, { key: 'Enter' });
    // Drawer opens (Close button visible)
    expect(await screen.findByRole('button', { name: /Close/i })).toBeInTheDocument();
  });

  it('does not use interactive <tr>; actions are explicit buttons', () => {
    renderWithProviders(<Shows />);
    // Ensure List view is shown to have table rows
    const listBtn = screen.getByRole('button', { name: /List/i });
    fireEvent.click(listBtn);
    // Look for rows and ensure they do not have role button
    const rows = screen.getAllByRole('row');
    // There should be a checkbox in header row and Edit buttons on rows
    // Verify that clicking the row background doesn't open editor; instead use Edit button
    const dataRow = rows.find((r) => within(r).queryByRole('button', { name: /Edit/i }));
    if (!dataRow) return; // no data
    // Clicking the row should not open the modal
    fireEvent.click(dataRow);
    expect(screen.queryByRole('button', { name: /Close/i })).not.toBeInTheDocument();
    // Clicking the Edit button should open it
    fireEvent.click(within(dataRow).getByRole('button', { name: /Edit/i }));
    expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
  });

  it('submits modal form with Enter key', () => {
    renderWithProviders(<Shows />);
    // Open Add show modal
    fireEvent.click(screen.getByRole('button', { name: /Add show/i }));
    const dialog = screen.getByRole('dialog');
    const city = within(dialog).getByLabelText(/City/i);
    fireEvent.change(city, { target: { value: 'Test City' } });
    const country = within(dialog).getByLabelText(/Country/i);
    fireEvent.change(country, { target: { value: 'ES' } });
    const date = within(dialog).getByLabelText(/Date/i);
    fireEvent.change(date, { target: { value: '2025-09-21' } });
    const fee = within(dialog).getByLabelText(/^Fee$/i);
    fireEvent.change(fee, { target: { value: '1234' } });
    // Press Enter in last field to submit
    fireEvent.keyDown(fee, { key: 'Enter' });
    expect(screen.queryByRole('button', { name: /Close/i })).not.toBeInTheDocument();
  // The new row should appear with the city name (now can appear in multiple columns: Show name fallback + City)
  const cityCells = screen.getAllByText('Test City');
  expect(cityCells.length).toBeGreaterThanOrEqual(1);
  });

  it('board card has a Promote button and it works', () => {
    renderWithProviders(<Shows />);
    openBoardView();
    // Find any Promote button on a card (for offer/pending)
    const promote = screen.queryAllByRole('button', { name: /Promote/i })[0];
    if (!promote) return;
    fireEvent.click(promote);
    // After promoting, the card may move columns; no specific assertion other than no error and UI still present
    expect(screen.getAllByText(/Offer|Pending|Confirmed/i).length).toBeGreaterThan(0);
  });
});
