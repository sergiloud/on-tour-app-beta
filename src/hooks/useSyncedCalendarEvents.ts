/**
 * Hook to load synced calendar events from Firestore
 */

import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../context/AuthContext';

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

  useEffect(() => {
    if (!userId) {
      setEvents([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const eventsRef = collection(db, 'users', userId, 'calendarEvents');
      const q = query(eventsRef, where('syncedFrom', '==', 'caldav'));

      // Real-time subscription
      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const loadedEvents: SyncedCalendarEvent[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            loadedEvents.push({
              id: doc.id,
              title: data.title || 'Untitled Event',
              date: data.date || '',
              endDate: data.endDate,
              description: data.description,
              location: data.location,
              syncedFrom: 'caldav',
              syncedAt: data.syncedAt || new Date().toISOString(),
            });
          });
          setEvents(loadedEvents);
          setLoading(false);
          console.log('[SyncedEvents] Loaded', loadedEvents.length, 'synced events from Firestore');
        },
        (err) => {
          console.error('[SyncedEvents] Error loading events:', err);
          setError(err as Error);
          setLoading(false);
        }
      );

      return unsubscribe;
    } catch (err) {
      console.error('[SyncedEvents] Setup error:', err);
      setError(err as Error);
      setLoading(false);
    }
  }, [userId]);

  return { events, loading, error };
}
