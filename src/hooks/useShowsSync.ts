import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { showsQueryKeys } from './useShowsQuery';

/**
 * useShowsSync - Integrate showStore sync events with React Query cache
 *
 * This hook:
 * - Listens to BroadcastChannel messages from other tabs
 * - Listens to showStore change events
 * - Invalidates React Query cache when changes detected
 * - Enables automatic cross-tab synchronization
 *
 * @example
 * function App() {
 *   useShowsSync(); // Call once in root component
 *   // ... rest of app
 * }
 */
export function useShowsSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // Setup BroadcastChannel listener for cross-tab sync
    let broadcastChannel: BroadcastChannel | null = null;

    try {
      broadcastChannel = new BroadcastChannel('shows-sync');

      broadcastChannel.addEventListener('message', (event) => {
        if (event.data.type === 'shows-updated') {
          // Another tab updated shows - invalidate cache
          queryClient.invalidateQueries({
            queryKey: showsQueryKeys.all,
          });
        }
      });
    } catch (error) {
      console.warn('BroadcastChannel not available:', error);
    }

    // Cleanup
    return () => {
      if (broadcastChannel) {
        broadcastChannel.close();
      }
    };
  }, [queryClient]);
}

/**
 * useShowsRefetchOnFocus - Refetch shows when window regains focus
 *
 * Useful for ensuring data freshness when user switches back from another app/tab
 *
 * @example
 * function ShowsPage() {
 *   const { data: shows } = useShowsQuery();
 *   useShowsRefetchOnFocus(); // Auto-refetch when focused
 *   // ...
 * }
 */
export function useShowsRefetchOnFocus() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const handleFocus = () => {
      queryClient.refetchQueries({
        queryKey: showsQueryKeys.all,
      });
    };

    window.addEventListener('focus', handleFocus);

    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [queryClient]);
}

/**
 * useShowsCacheSync - Advanced: Sync shows cache with localStorage
 *
 * This keeps localStorage and React Query cache in sync
 * Useful for offline support and data persistence
 *
 * @example
 * useShowsCacheSync(); // Call in App root
 */
export function useShowsCacheSync() {
  const queryClient = useQueryClient();

  useEffect(() => {
    // When cache invalidates, save to localStorage
    const unsubscribe = queryClient.getQueryCache().subscribe(event => {
      if (
        event.type === 'updated' &&
        event.query.queryKey[0] === 'shows'
      ) {
        const shows = queryClient.getQueryData(showsQueryKeys.all);
        if (shows) {
          localStorage.setItem('shows:query-cache', JSON.stringify(shows));
        }
      }
    });

    return unsubscribe;
  }, [queryClient]);
}
