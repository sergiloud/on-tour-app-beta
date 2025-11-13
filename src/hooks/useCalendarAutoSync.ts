/**
 * Auto-sync calendar events when changes occur
 * Triggers sync 2 seconds after last change to batch updates
 */

import { useEffect, useRef } from 'react';
import { syncNow } from '../services/calendarSyncApi';
import { useAuth } from '../context/AuthContext';

export function useCalendarAutoSync() {
  const { userId } = useAuth();
  const syncTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const lastSyncRef = useRef<number>(0);
  
  // Minimum time between syncs (5 seconds)
  const MIN_SYNC_INTERVAL = 5000;

  const triggerSync = async () => {
    if (!userId) return;
    
    // Cancel pending sync
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Wait 2 seconds to batch changes
    syncTimeoutRef.current = setTimeout(async () => {
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncRef.current;
      
      // Respect minimum interval
      if (timeSinceLastSync < MIN_SYNC_INTERVAL) {
        return;
      }

      try {
        console.log('[AutoSync] Syncing calendar changes...');
        await syncNow(userId);
        lastSyncRef.current = now;
        console.log('[AutoSync] Sync completed');
      } catch (error) {
        console.error('[AutoSync] Sync failed:', error);
        // Silently fail - user can manually sync if needed
      }
    }, 2000);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  return { triggerSync };
}
