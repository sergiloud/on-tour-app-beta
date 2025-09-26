import React from 'react';
import { renderWithProviders, screen, fireEvent, within } from '../test-utils';
import Shows from '../pages/dashboard/Shows';

// Helper to open the Add show drawer quickly
function openAdd() {
  fireEvent.click(screen.getByRole('button', { name: /Add show/i }));
  return screen.getByRole('dialog');
}

describe('Show Editor Enhancements', () => {
  test('status selector and name field present', () => {
    renderWithProviders(<Shows />);
    const dialog = openAdd();
    expect(within(dialog).getByLabelText(/Status/i)).toBeInTheDocument();
    expect(within(dialog).getByLabelText(/Show name|Name/i)).toBeInTheDocument();
  });

  test('cost template prompt injects items and subtotals appear', () => {
    renderWithProviders(<Shows />);
    const dialog = openAdd();
    const city = within(dialog).getByLabelText(/City/i);
    fireEvent.change(city, { target: { value: 'TemplateCity' } });
    fireEvent.change(within(dialog).getByLabelText(/Country/i), { target: { value: 'ES' } });
    fireEvent.change(within(dialog).getByLabelText(/Date/i), { target: { value: '2025-10-10' } });
    fireEvent.change(within(dialog).getByLabelText(/^Fee$/i), { target: { value: '1000' } });
    // Navigate to Costs tab
    fireEvent.click(within(dialog).getByRole('tab', { name: /Costs/i }));
    // Mock prompt
    const promptSpy = jest.spyOn(window, 'prompt').mockReturnValue('travel');
    const addTemplateBtn = within(dialog).getByRole('button', { name: /Add template|Plantilla/i });
    fireEvent.click(addTemplateBtn);
    promptSpy.mockRestore();
    // Expect at least one injected cost input
    expect(within(dialog).getAllByPlaceholderText(/Type|Tipo/i).length).toBeGreaterThan(0);
    // Subtotals bar should show label
    expect(within(dialog).getByText(/Subtotals|Subtotales/i)).toBeInTheDocument();
  });

  test('save button shows saving state', () => {
    renderWithProviders(<Shows />);
    const dialog = openAdd();
    fireEvent.change(within(dialog).getByLabelText(/City/i), { target: { value: 'SaveCity' } });
    fireEvent.change(within(dialog).getByLabelText(/Country/i), { target: { value: 'ES' } });
    fireEvent.change(within(dialog).getByLabelText(/Date/i), { target: { value: '2025-12-24' } });
    fireEvent.change(within(dialog).getByLabelText(/^Fee$/i), { target: { value: '1500' } });
    const saveBtn = within(dialog).getByRole('button', { name: /Save|Guardar/i });
    fireEvent.click(saveBtn);
    // Immediately after click, either Saving… or Saved appears depending on sync speed
    expect(screen.getByRole('button', { name: /Saving|Guardando|Saved|Guardado/i })).toBeInTheDocument();
  });

  test('country autocomplete accepts direct typing of code', () => {
    renderWithProviders(<Shows />);
    const dialog = openAdd();
    const country = within(dialog).getByLabelText(/Country/i);
    fireEvent.focus(country);
    fireEvent.change(country, { target: { value: 'ES' } });
    expect((country as HTMLInputElement).value).toMatch(/ES/i);
  });
});
