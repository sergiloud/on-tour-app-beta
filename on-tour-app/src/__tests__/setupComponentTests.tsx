import React from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from '../hooks/useTheme';
import { AuthProvider } from '../context/AuthContext';
import { OrgProvider } from '../context/OrgContext';
import { HighContrastProvider } from '../context/HighContrastContext';
import { ToastProvider } from '../ui/Toast';
import { SettingsProvider } from '../context/SettingsContext';

const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
};

class LocalStorageMock implements Storage {
  private store: Record<string, string> = {};
  readonly length: number = 0;

  getItem(key: string): string | null {
    return this.store[key] ?? null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  clear(): void {
    this.store = {};
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] ?? null;
  }
}

export const setupGlobalMocks = () => {
  if (!globalThis.localStorage) {
    Object.defineProperty(globalThis, 'localStorage', {
      value: new LocalStorageMock(),
    });
  }
  if (!globalThis.sessionStorage) {
    Object.defineProperty(globalThis, 'sessionStorage', {
      value: new LocalStorageMock(),
    });
  }
};

export function AllTheProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = React.useState(() => createTestQueryClient());
  
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <OrgProvider>
            <SettingsProvider>
              <ThemeProvider>
                <HighContrastProvider>
                  <ToastProvider>
                    {children}
                  </ToastProvider>
                </HighContrastProvider>
              </ThemeProvider>
            </SettingsProvider>
          </OrgProvider>
        </AuthProvider>
      </QueryClientProvider>
    </BrowserRouter>
  );
}

export function renderWithProviders(
  ui: React.ReactElement,
  options?: Omit<RenderOptions, 'wrapper'>
) {
  return render(ui, { wrapper: AllTheProviders, ...options });
}

export const createMockShow = (overrides = {}) => ({
  id: 'show-1',
  date: '2025-11-15',
  city: 'Madrid',
  country: 'ES',
  venue: 'Teatro Real',
  fee: 5000,
  feeCurrency: 'EUR',
  whtPct: 15,
  mgmtAgencyPct: 10,
  bookingAgencyPct: 8,
  costs: [],
  fxRate: 1.0,
  status: 'confirmed' as const,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  __version: 1,
  __modifiedAt: Date.now(),
  ...overrides,
});

export * from '@testing-library/react';
