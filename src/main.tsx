import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { KPIDataProvider } from './context/KPIDataContext';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './hooks/useTheme';
import { HighContrastProvider } from './context/HighContrastContext';
import { SettingsProvider } from './context/SettingsContext';
import { initTelemetry } from './lib/telemetry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import './styles/index.css';
import './styles/performance.css';
// DISABLED FOR PRODUCTION BETA - all data comes from Firestore now
// import { ensureDemoTenants } from './lib/tenants';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { logger } from './lib/logger';
import { initWebVitals, trackResourceTiming, trackLongTasks } from './lib/webVitals';

const el = document.getElementById('root');
if (!el) {
  throw new Error('Root element not found');
}

initTelemetry();
// DISABLED FOR PRODUCTION BETA - all data comes from Firestore now
// try { ensureDemoTenants(); } catch { }

// Initialize Web Vitals monitoring - TEMPORARILY DISABLED TO FIX 405 ERRORS
// initWebVitals();
// trackResourceTiming();
// trackLongTasks();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 10 * 60 * 1000, // 10 minutes - data stays fresh longer
      gcTime: 30 * 60 * 1000, // 30 minutes - cache lifetime extended
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && 'status' in error && typeof error.status === 'number') {
          return error.status >= 500 && failureCount < 2;
        }
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      refetchOnMount: false, // Don't refetch if data is fresh
      networkMode: 'online',
      structuralSharing: true, // Enable for better performance
    },
    mutations: {
      retry: 1,
      networkMode: 'online',
    },
  },
});

const AppProviders = ({ children }: { children: React.ReactNode }) => (
  <ErrorBoundary>
    <ThemeProvider>
      <HighContrastProvider>
        <SettingsProvider>
          <QueryClientProvider client={queryClient}>
            <FinanceProvider>
              <KPIDataProvider>
                {children}
                {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
              </KPIDataProvider>
            </FinanceProvider>
          </QueryClientProvider>
        </SettingsProvider>
      </HighContrastProvider>
    </ThemeProvider>
  </ErrorBoundary>
);

const root = createRoot(el);

if (import.meta.env.DEV) {
  root.render(
    <StrictMode>
      <AppProviders>
        <App />
      </AppProviders>
    </StrictMode>
  );
} else {
  root.render(
    <AppProviders>
      <App />
    </AppProviders>
  );
}

// Register Service Worker for PWA - ENABLED for iOS session persistence
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw-v3.js', { scope: '/' })
      .then((registration) => {
        logger.info('Service Worker registered', { scope: registration.scope });

        // Check for updates on page load
        registration.update();

        // Handle service worker updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (!newWorker) return;

          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              logger.info('New service worker available', { state: newWorker.state });
              // The PWAUpdatePrompt component will handle showing the update UI
            }
          });
        });
      })
      .catch((error) => {
        logger.error('Service Worker registration failed', error as Error, { component: 'main' });
      });
  });

  // Listen for messages from service worker
  navigator.serviceWorker.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SW_UPDATED') {
      logger.info('Service worker updated', { type: event.data.type });
    }
  });
}

