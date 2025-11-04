import React from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { SettingsProvider } from './context/SettingsContext';
import { HighContrastProvider } from './context/HighContrastContext';
import { KPIDataProvider } from './context/KPIDataContext';
import { FinanceProvider } from './context/FinanceContext';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from './hooks/useTheme';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MissionControlProvider } from './context/MissionControlContext';
import { ToastProvider } from './ui/Toast';
import { AuthProvider } from './context/AuthContext';

type ProvidersProps = { children: React.ReactNode };
const createProviders = (initialEntries?: string[]) => {
  const ProvidersImpl: React.FC<ProvidersProps> = ({ children }) => {
    const client = new QueryClient();
    return (
      <SettingsProvider>
        <HighContrastProvider>
          <ThemeProvider>
            <QueryClientProvider client={client}>
              <FinanceProvider>
                <KPIDataProvider>
                  <MissionControlProvider>
                    <ToastProvider>
                      <AuthProvider>
                        <MemoryRouter initialEntries={initialEntries || ['/']}>
                          {children}
                        </MemoryRouter>
                      </AuthProvider>
                    </ToastProvider>
                  </MissionControlProvider>
                </KPIDataProvider>
              </FinanceProvider>
            </QueryClientProvider>
          </ThemeProvider>
        </HighContrastProvider>
      </SettingsProvider>
    );
  };
  return ProvidersImpl;
};

const Providers = createProviders();

// Re-export everything from testing-library first
export * from '@testing-library/react';

// Then override render to use our Providers by default
export function render(ui: React.ReactElement, options?: RenderOptions) {
  return rtlRender(ui, { wrapper: Providers, ...options });
}

export function renderWithProviders(ui: React.ReactElement, options?: RenderOptions) {
  return rtlRender(ui, { wrapper: Providers, ...options });
}

// Helper to render at a specific route (avoids nested MemoryRouter in tests needing an initial path)
export function renderWithProvidersAtRoute(ui: React.ReactElement, route: string, options?: RenderOptions) {
  const RoutedProviders = createProviders([route]);
  return rtlRender(ui, { wrapper: RoutedProviders, ...options });
}