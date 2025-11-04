/**
 * Test Utilities & Provider Setup
 *
 * Centralized test helpers for rendering components and hooks with all necessary providers.
 * This file implements the "AllTheProviders" pattern to ensure consistent test setup.
 *
 * Usage:
 * ```tsx
 * // For components:
 * const { getByText } = renderWithProviders(<MyComponent />);
 *
 * // For hooks:
 * const { result } = renderHookWithProviders(() => useMyHook());
 * ```
 *
 * @module test-utils
 */

import React, { ReactNode } from 'react';
import { render, RenderOptions } from '@testing-library/react';
import { renderHook, RenderOptions as HookRenderOptions } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { vi } from 'vitest';
import { MemoryRouter, Routes, Route } from 'react-router-dom';

// Import all context providers
import { AuthProvider } from '@/context/AuthContext';
import { SettingsProvider } from '@/context/SettingsContext';
import { OrgProvider } from '@/context/OrgContext';
import { DashboardProvider } from '@/context/DashboardContext';
import { ShowModalProvider } from '@/context/ShowModalContext';
import { FinanceProvider } from '@/context/FinanceContext';
import { HighContrastProvider } from '@/context/HighContrastContext';
import { MissionControlProvider } from '@/context/MissionControlContext';
import { KPIDataProvider } from '@/context/KPIDataContext';

/**
 * Mock setup for common dependencies
 */
export const setupCommonMocks = () => {
  // Mock secureStorage
  const mockSecureStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
  };

  // Mock localStorage
  const mockLocalStorage = {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
    key: vi.fn(),
    length: 0,
  };

  return { mockSecureStorage, mockLocalStorage };
};

/**
 * Create a new QueryClient for each test
 * Prevents test isolation issues from shared cache
 */
const createTestQueryClient = () => {
  return new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        gcTime: 0, // Disable garbage collection in tests
      },
      mutations: {
        retry: false,
      },
    },
  });
};

/**
 * Wrapper component that provides all contexts
 * Used for rendering both components and hooks in tests
 */
export interface AllTheProvidersProps {
  children: ReactNode;
  queryClient?: QueryClient;
  initialRoute?: string;
}

export const AllTheProviders: React.FC<AllTheProvidersProps> = ({
  children,
  queryClient = createTestQueryClient(),
  initialRoute = '/',
}) => {
  return (
    <MemoryRouter initialEntries={[initialRoute]}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <SettingsProvider>
            <OrgProvider>
              <DashboardProvider>
                <ShowModalProvider>
                  <FinanceProvider>
                    <HighContrastProvider>
                      <MissionControlProvider>
                        <KPIDataProvider>{children}</KPIDataProvider>
                      </MissionControlProvider>
                    </HighContrastProvider>
                  </FinanceProvider>
                </ShowModalProvider>
              </DashboardProvider>
            </OrgProvider>
          </SettingsProvider>
        </AuthProvider>
      </QueryClientProvider>
    </MemoryRouter>
  );
};

/**
 * Custom render function that wraps components with all providers
 *
 * @param ui - React element to render
 * @param options - Additional render options
 * @returns Render result from @testing-library/react
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProviders(<MyComponent />);
 * ```
 */
export function renderWithProviders(
  ui: React.ReactElement,
  {
    queryClient = createTestQueryClient(),
    initialRoute = '/',
    ...renderOptions
  }: RenderOptions & { queryClient?: QueryClient; initialRoute?: string } = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AllTheProviders queryClient={queryClient} initialRoute={initialRoute}>
        {children}
      </AllTheProviders>
    );
  }

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Custom renderHook function that wraps hooks with all providers
 *
 * @param hook - Hook function to render
 * @param options - Additional render options
 * @returns Hook render result from @testing-library/react
 *
 * @example
 * ```tsx
 * const { result } = renderHookWithProviders(() => useMyHook());
 * ```
 */
export function renderHookWithProviders<TResult,>(
  hook: () => TResult,
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: { queryClient?: QueryClient } = {}
) {
  function Wrapper({ children }: { children: ReactNode }) {
    return (
      <AllTheProviders queryClient={queryClient}>
        {children}
      </AllTheProviders>
    );
  }

  return renderHook(hook, { wrapper: Wrapper, ...renderOptions });
}

/**
 * Render component with providers at a specific route
 * Useful for testing components that depend on routing context
 *
 * @param ui - React element to render
 * @param initialRoute - Initial route path
 * @param options - Additional render options
 * @returns Render result from @testing-library/react
 *
 * @example
 * ```tsx
 * const { getByText } = renderWithProvidersAtRoute(<MyComponent />, '/dashboard');
 * ```
 */
export function renderWithProvidersAtRoute(
  ui: React.ReactElement,
  initialRoute: string = '/',
  {
    queryClient = createTestQueryClient(),
    ...renderOptions
  }: RenderOptions & { queryClient?: QueryClient } = {}
) {
  return renderWithProviders(ui, {
    queryClient,
    initialRoute,
    ...renderOptions,
  });
}

/**
 * Specialized setup for testing hooks that depend on specific contexts
 *
 * @param selectedContexts - Names of contexts to include
 * @returns Render function with selected providers
 *
 * @example
 * ```tsx
 * // Test hook that only needs Auth and Settings
 * const renderWithContexts = createRenderWithContexts(['Auth', 'Settings']);
 * const { result } = renderHookWithContexts(() => useMyHook());
 * ```
 */
export function createRenderWithContexts(
  selectedContexts: Array<
    'Auth' | 'Settings' | 'Org' | 'Dashboard' | 'ShowModal' | 'Finance' | 'HighContrast' | 'MissionControl' | 'KPIData'
  >,
  queryClient: QueryClient = createTestQueryClient()
) {
  const ContextWrapper: React.FC<{ children: ReactNode }> = ({ children }) => {
    let wrapped = children;

    // Apply contexts in reverse order (bottom-up in provider hierarchy)
    const contextMap = {
      KPIData: (el: React.ReactNode) => <KPIDataProvider>{el}</KPIDataProvider>,
      MissionControl: (el: React.ReactNode) => (
        <MissionControlProvider>{el}</MissionControlProvider>
      ),
      HighContrast: (el: React.ReactNode) => (
        <HighContrastProvider>{el}</HighContrastProvider>
      ),
      Finance: (el: React.ReactNode) => <FinanceProvider>{el}</FinanceProvider>,
      ShowModal: (el: React.ReactNode) => (
        <ShowModalProvider>{el}</ShowModalProvider>
      ),
      Dashboard: (el: React.ReactNode) => (
        <DashboardProvider>{el}</DashboardProvider>
      ),
      Org: (el: React.ReactNode) => <OrgProvider>{el}</OrgProvider>,
      Settings: (el: React.ReactNode) => (
        <SettingsProvider>{el}</SettingsProvider>
      ),
      Auth: (el: React.ReactNode) => <AuthProvider>{el}</AuthProvider>,
    };

    for (const context of selectedContexts.reverse()) {
      wrapped = contextMap[context](wrapped);
    }

    return (
      <QueryClientProvider client={queryClient}>
        {wrapped}
      </QueryClientProvider>
    );
  };

  return {
    renderComponent: (ui: React.ReactElement, options?: Omit<RenderOptions, 'wrapper'>) =>
      render(ui, { wrapper: ContextWrapper, ...options }),
    renderHook: <TResult,>(
      hook: () => TResult,
      options?: any
    ) => renderHook(hook, { wrapper: ContextWrapper, ...options }),
  };
}

/**
 * Mock data generators for common types
 */
export const mockDataGenerators = {
  /**
   * Create a mock Show object
   */
  createMockShow: (overrides = {}) => ({
    id: 'show-1',
    name: 'Test Show',
    date: new Date().toISOString(),
    venue: 'Test Venue',
    city: 'Test City',
    status: 'draft' as const,
    ...overrides,
  }),

  /**
   * Create a mock User object
   */
  createMockUser: (overrides = {}) => ({
    id: 'user-1',
    email: 'test@example.com',
    name: 'Test User',
    role: 'user' as const,
    ...overrides,
  }),

  /**
   * Create a mock Settings object
   */
  createMockSettings: (overrides = {}) => ({
    theme: 'light' as const,
    lang: 'en' as const,
    currency: 'EUR' as const,
    ...overrides,
  }),
};

/**
 * Helper to wait for async state updates
 * Use when testing async operations with react-query
 */
export const waitForAsync = () => new Promise((resolve) => setTimeout(resolve, 0));

/**
 * Export all testing library utilities for convenience
 */
export * from '@testing-library/react';
export { userEvent } from '@testing-library/user-event';

/**
 * Re-export vitest utilities
 */
export { vi, describe, it, expect, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
