import { renderWithProviders as render, screen } from '../test-utils';
import React from 'react';
import { Home } from '../pages/Home';
import { ThemeProvider } from '../hooks/useTheme';

describe('Home', () => {
  it('renders hero title', () => {
    render(<ThemeProvider><Home /></ThemeProvider>);
    expect(screen.getByText(/Your tour, elevated/i)).toBeInTheDocument();
  });
});