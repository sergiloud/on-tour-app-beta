import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AppRouter } from './routes/AppRouter';
import { ToastProvider } from './ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { ShowModalProvider } from './context/ShowModalContext';
import { GlobalShowModal } from './components/GlobalShowModal';
import { PWAComponents } from './components/pwa/PWAComponents';
import { prefetch } from './routes/prefetch';
import { useNetworkStatus } from './hooks/useNetworkStatus';
import { useShowsSync } from './hooks/useShowsSync';
import { swManager } from './lib/serviceWorkerManager';
import { ServiceWorkerUpdater } from './components/common/ServiceWorkerUpdater';
import { nuclearCleanupLocations } from './services/travelApi';

export const App: React.FC = () => {
  // Enable cross-tab synchronization and React Query cache integration
  useShowsSync();

  // Network status monitoring
  useNetworkStatus();

  // Run migrations on app startup
  useEffect(() => {
    nuclearCleanupLocations();
  }, []);

  // Prefetch critical routes when app loads and browser is idle
  useEffect(() => {
    // Skip in dev mode for faster HMR
    if (import.meta.env.DEV) return;

    // Register advanced service worker for offline support and caching
    swManager.register();

    // Check if browser supports requestIdleCallback
    if ('requestIdleCallback' in window) {
      // Prefetch high-traffic routes when browser is idle
      requestIdleCallback(() => {
        prefetch.shows();
        prefetch.finance();
      }, { timeout: 2000 }); // Reducido de 3000 a 2000ms

      // Prefetch secondary routes later
      requestIdleCallback(() => {
        prefetch.travel();
        prefetch.calendar();
      }, { timeout: 5000 }); // Reducido de 6000 a 5000ms
    } else {
      // Fallback for browsers without requestIdleCallback
      setTimeout(() => {
        prefetch.shows();
        prefetch.finance();
      }, 2000); // Reducido de 3000 a 2000ms
    }
  }, []);

  return (
    <>
      {/* Service Worker Update Notifications */}
      <ServiceWorkerUpdater />

      {/* Sonner toast notifications */}
      <Toaster
        position="top-right"
        expand={false}
        richColors
        closeButton
      />

      <ToastProvider>
        <AuthProvider>
          <ShowModalProvider>
            <AppRouter />
            <GlobalShowModal />
            <PWAComponents />
          </ShowModalProvider>
        </AuthProvider>
      </ToastProvider>
    </>
  );
};
