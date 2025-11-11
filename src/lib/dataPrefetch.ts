/**
 * Smart Data Prefetcher - Precarga datos en idle time
 * Usa requestIdleCallback para no interferir con interacciones del usuario
 */

import { QueryClient } from '@tanstack/react-query';
import { HybridShowService } from '../services/hybridShowService';
import { HybridContactService } from '../services/hybridContactService';
import { contactKeys } from '../hooks/useContactsQuery';

interface PrefetchOptions {
  queryClient: QueryClient;
  userId: string;
  priority?: 'high' | 'medium' | 'low';
}

/**
 * Prefetch shows data en idle time
 */
export function prefetchShows({ queryClient, userId, priority = 'medium' }: PrefetchOptions) {
  const callback = async () => {
    try {
      // Verificar si ya tenemos datos cacheados
      const cachedShows = queryClient.getQueryData(['shows']);
      if (cachedShows) return; // Ya tenemos datos

      console.log('[Prefetch] Loading shows in idle time...');
      await queryClient.prefetchQuery({
        queryKey: ['shows'],
        queryFn: async () => {
          // Cargar desde localStorage primero (rápido)
          const stored = localStorage.getItem('shows-store-v3');
          if (stored) {
            return JSON.parse(stored);
          }
          return [];
        },
        staleTime: 30 * 60 * 1000,
      });
    } catch (error) {
      console.warn('[Prefetch] Failed to prefetch shows:', error);
    }
  };

  if (priority === 'high') {
    // Ejecutar inmediatamente
    callback();
  } else if ('requestIdleCallback' in window) {
    // Esperar a idle time
    requestIdleCallback(callback, { timeout: priority === 'medium' ? 2000 : 5000 });
  } else {
    // Fallback para navegadores sin requestIdleCallback
    setTimeout(callback, priority === 'medium' ? 100 : 500);
  }
}

/**
 * Prefetch contacts data en idle time
 */
export function prefetchContacts({ queryClient, userId, priority = 'medium' }: PrefetchOptions) {
  const callback = async () => {
    try {
      const cachedContacts = queryClient.getQueryData(contactKeys.lists());
      if (cachedContacts) return;

      console.log('[Prefetch] Loading contacts in idle time...');
      await queryClient.prefetchQuery({
        queryKey: contactKeys.lists(),
        queryFn: () => HybridContactService.getAllContacts(userId),
        staleTime: 30 * 60 * 1000,
      });
    } catch (error) {
      console.warn('[Prefetch] Failed to prefetch contacts:', error);
    }
  };

  if (priority === 'high') {
    callback();
  } else if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: priority === 'medium' ? 2000 : 5000 });
  } else {
    setTimeout(callback, priority === 'medium' ? 100 : 500);
  }
}

/**
 * Prefetch finance data
 */
export function prefetchFinance({ queryClient, priority = 'low' }: Omit<PrefetchOptions, 'userId'>) {
  const callback = async () => {
    try {
      console.log('[Prefetch] Warming finance calculations...');
      // Finance ya usa FinanceContext, no necesita prefetch específico
      // Solo aseguramos que los datos estén listos
    } catch (error) {
      console.warn('[Prefetch] Failed to prefetch finance:', error);
    }
  };

  if ('requestIdleCallback' in window) {
    requestIdleCallback(callback, { timeout: priority === 'low' ? 5000 : 3000 });
  } else {
    setTimeout(callback, 1000);
  }
}

/**
 * Prefetch all critical data después del login
 */
export function prefetchCriticalData(options: PrefetchOptions) {
  console.log('[Prefetch] Starting critical data prefetch...');
  
  // Prefetch en orden de prioridad
  prefetchShows({ ...options, priority: 'high' });
  
  // Contacts después de shows
  setTimeout(() => {
    prefetchContacts({ ...options, priority: 'medium' });
  }, 100);
  
  // Finance al final
  setTimeout(() => {
    prefetchFinance({ ...options, priority: 'low' });
  }, 500);
}

/**
 * Hook para auto-prefetch en navigation hover
 */
export function setupNavigationPrefetch(queryClient: QueryClient, userId: string) {
  // Agregar listeners para hover en nav links
  const prefetchOnHover = (route: string) => {
    switch (route) {
      case '/dashboard/contacts':
        prefetchContacts({ queryClient, userId, priority: 'high' });
        break;
      case '/dashboard/shows':
        prefetchShows({ queryClient, userId, priority: 'high' });
        break;
      case '/dashboard/finance':
      case '/dashboard/financeV2':
        prefetchFinance({ queryClient, priority: 'high' });
        break;
    }
  };

  return prefetchOnHover;
}
