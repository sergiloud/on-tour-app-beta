import { useEffect, useState } from 'react';
import { useNotifications } from '../stores/notificationStore';
import { showStore } from '../shared/showStore';
import type { Show } from '../lib/shows';
import { isFuture, parseISO, isToday, isTomorrow } from 'date-fns';

interface AppBadges {
  shows: number | null;
  finance: number | null;
  calendar: number | null;
  travel: number | null;
  settings: number | null;
}

/**
 * Hook to manage dynamic app badges based on app state
 */
export const useAppBadges = (): AppBadges => {
  const { notifications } = useNotifications();
  const [shows, setShows] = useState<Show[]>([]);

  // Subscribe to shows
  useEffect(() => {
    const updateShows = (allShows: Show[]) => {
      setShows(allShows);
    };

    updateShows(showStore.getAll());
    const unsubscribe = showStore.subscribe(updateShows);

    return () => unsubscribe();
  }, []);

  // Calculate badges
  const badges: AppBadges = {
    // Shows: upcoming shows in next 7 days
    shows: shows.filter(show => {
      const showDate = typeof show.date === 'string' ? parseISO(show.date) : new Date(show.date);
      return isFuture(showDate) && show.status === 'confirmed';
    }).length || null,

    // Finance: unread finance notifications
    finance: notifications.filter(
      n => !n.read && n.title.toLowerCase().includes('gasto')
    ).length || null,

    // Calendar: events today or tomorrow
    calendar: shows.filter(show => {
      const showDate = typeof show.date === 'string' ? parseISO(show.date) : new Date(show.date);
      return (isToday(showDate) || isTomorrow(showDate)) && show.status === 'confirmed';
    }).length || null,

    // Travel: pending travel notifications
    travel: notifications.filter(
      n => !n.read && (n.title.toLowerCase().includes('viaje') || n.title.toLowerCase().includes('vuelo'))
    ).length || null,

    // Settings: always null (no badge)
    settings: null,
  };

  return badges;
};
