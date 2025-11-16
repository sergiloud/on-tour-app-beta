/**
 * Hook to load synced calendar events from Firestore
 */

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';
import { useMemoryManagement, useFirestoreListener } from '../lib/memoryManagement';

export interface SyncedCalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD for multi-day events
  description?: string;
  location?: string;
  syncedFrom: 'caldav';
  syncedAt: string;
}

export function useSyncedCalendarEvents() {
  const { userId } = useAuth();
  const [events, setEvents] = useState<SyncedCalendarEvent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  // Memory management for this component
  const { isMounted, safeSetState } = useMemoryManagement('useSyncedCalendarEvents');
  
  // Safe state setters
  const safeSetEvents = safeSetState(setEvents);
  const safeSetLoading = safeSetState(setLoading);
  const safeSetError = safeSetState(setError);

  // Use our professional Firestore listener with automatic cleanup
  useFirestoreListener({
    collectionPath: userId ? `users/${userId}/calendarEvents` : '',
    queryConstraints: userId ? [where('syncedFrom', '==', 'caldav')] : [],
    onData: (data) => {
      if (!isMounted()) return;
      
      const loadedEvents: SyncedCalendarEvent[] = data.map((doc: any) => ({
        id: doc.id,
        title: doc.title || 'Untitled Event',
        date: doc.date || '',
        endDate: doc.endDate,
        description: doc.description,
        location: doc.location,
        syncedFrom: 'caldav' as const,
        syncedAt: doc.syncedAt || new Date().toISOString(),
      }));
      
      safeSetEvents(loadedEvents);
      safeSetLoading(false);
      console.log('[SyncedEvents] Loaded', loadedEvents.length, 'synced events from Firestore');
    },
    onError: (err) => {
      if (!isMounted()) return;
      console.error('[SyncedEvents] Error loading events:', err);
      safeSetError(err);
      safeSetLoading(false);
    },
    debounceMs: 500 // Debounce rapid updates
  });

  // Clear events when no user
  useEffect(() => {
    if (!userId) {
      safeSetEvents([]);
      safeSetLoading(false);
      safeSetError(null);
    } else {
      safeSetLoading(true);
      safeSetError(null);
    }
  }, [userId, safeSetEvents, safeSetLoading, safeSetError]);

  return { events, loading, error };
}
