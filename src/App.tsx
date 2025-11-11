import React, { useEffect } from 'react';
import { Toaster } from 'sonner';
import { AppRouter } from './routes/AppRouter';
import { ToastProvider } from './ui/Toast';
import { AuthProvider } from './context/AuthContext';
import { ShowModalProvider } from './context/ShowModalContext';
import { GlobalShowModal } from './components/common/GlobalShowModal';
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

    // SERVICE WORKER DISABLED - causes MIME type errors on Vercel
    // TODO: Re-enable after fixing Vercel configuration
    // swManager.register();

    // Use requestIdleCallback for better performance
    if ('requestIdleCallback' in window) {
      // Prefetch high-priority routes when idle
      const idleId1 = requestIdleCallback(() => {
        Promise.all([
          prefetch.shows(),
          prefetch.finance(),
        ]).catch(() => {});
      }, { timeout: 1500 });

      // Prefetch secondary routes with lower priority
      const idleId2 = requestIdleCallback(() => {
        Promise.all([
          prefetch.calendar(),
          prefetch.travel(),
        ]).catch(() => {});
      }, { timeout: 4000 });

      return () => {
        cancelIdleCallback(idleId1);
        cancelIdleCallback(idleId2);
      };
    } else {
      // Fallback for browsers without requestIdleCallback
      const timeoutId = setTimeout(() => {
        Promise.all([
          prefetch.shows(),
          prefetch.finance(),
        ]).catch(() => {});
      }, 1500);

      return () => clearTimeout(timeoutId);
    }
  }, []);

  return (
    <>
      {/* SERVICE WORKER DISABLED - causes MIME type errors on Vercel */}
      {/* <ServiceWorkerUpdater /> */}

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
