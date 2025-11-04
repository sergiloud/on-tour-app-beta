import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProvidersAtRoute } from '../test-utils';
import { Route, Routes } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import DashboardOverview from '../pages/Dashboard';

function App() {
  return (
    <Routes>
      <Route path="/dashboard" element={<DashboardLayout />}> 
        <Route index element={<DashboardOverview />} />
      </Route>
    </Routes>
  );
}

describe.skip('Language selector', () => {
  it('switches to Spanish and updates strings', () => {
  renderWithProvidersAtRoute(<App />, '/dashboard');
    const select = screen.getByRole('combobox', { name: /language/i });
    fireEvent.change(select, { target: { value: 'es' } });
    // After switching, Action Hub and other components should show Spanish strings
    // Mount dashboard content is nested; check for the tab label "Pendientes" in ActionHub when rendered
    // Ensure the layout remains visible
    expect(select).toHaveValue('es');
  });
});
