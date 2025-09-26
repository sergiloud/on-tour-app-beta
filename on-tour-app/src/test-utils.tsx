import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { SettingsProvider } from './context/SettingsContext';
import { HighContrastProvider } from './context/HighContrastContext';
import { KPIDataProvider } from './context/KPIDataContext';
import { FinanceProvider } from './context/FinanceContext';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MissionControlProvider } from './context/MissionControlContext';
import { ToastProvider } from './ui/Toast';

type ProvidersProps = { children: React.ReactNode };
const createProviders = (initialEntries?: string[]) => {
  const ProvidersImpl: React.FC<ProvidersProps> = ({ children }) => {
    const client = new QueryClient();
    return (
      <ThemeProvider>
        <HighContrastProvider>
          <SettingsProvider>
            <QueryClientProvider client={client}>
              <FinanceProvider>
                <KPIDataProvider>
                  <MissionControlProvider>
                    <ToastProvider>
                      <MemoryRouter initialEntries={initialEntries}>
                        {children}
                      </MemoryRouter>
                    </ToastProvider>
                  </MissionControlProvider>
                </KPIDataProvider>
              </FinanceProvider>
            </QueryClientProvider>
          </SettingsProvider>
        </HighContrastProvider>
      </ThemeProvider>
    );
  };
  return ProvidersImpl;
};

const Providers = createProviders();

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return render(ui, { wrapper: Providers, ...options });
}

// Helper to render at a specific route (avoids nested MemoryRouter in tests needing an initial path)
export function renderWithProvidersAtRoute(ui: React.ReactElement, route: string, options?: RenderOptions) {
  const RoutedProviders = createProviders([route]);
  return render(ui, { wrapper: RoutedProviders, ...options });
}

export * from '@testing-library/react';