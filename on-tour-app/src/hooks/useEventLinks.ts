import { useState, useCallback, useEffect } from 'react';
import type { EventLink } from '../components/calendar/EventLinkingModal';
import { trackEvent } from '../lib/telemetry';

const STORAGE_KEY = 'calendar:event-links';

export function useEventLinks() {
  const [links, setLinks] = useState<EventLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setLinks(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load event links:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Save to localStorage whenever links change
  useEffect(() => {
    if (!isLoading) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(links));
      } catch (err) {
        console.error('Failed to save event links:', err);
      }
    }
  }, [links, isLoading]);

  const addLink = useCallback((link: EventLink) => {
    setLinks((prev) => {
      // Check if link already exists
      const exists = prev.some(
        (l) => (l.fromId === link.fromId && l.toId === link.toId) ||
               (l.fromId === link.toId && l.toId === link.fromId)
      );

      if (exists) {
        // Update existing link
        return prev.map((l) =>
          ((l.fromId === link.fromId && l.toId === link.toId) ||
           (l.fromId === link.toId && l.toId === link.fromId))
            ? link
            : l
        );
      }

      return [...prev, link];
    });
    trackEvent('calendar.link.add', { from: link.fromId, to: link.toId, type: link.type });
  }, []);

  const removeLink = useCallback((fromId: string, toId: string) => {
    setLinks((prev) =>
      prev.filter((l) => !(l.fromId === fromId && l.toId === toId) && !(l.fromId === toId && l.toId === fromId))
    );
    trackEvent('calendar.link.remove', { from: fromId, to: toId });
  }, []);

  const getLinkForEvent = useCallback((eventId: string) => {
    return links.filter((l) => l.fromId === eventId || l.toId === eventId);
  }, [links]);

  const getConflicts = useCallback(
    (events: Array<{ id: string; date: string }>) => {
      const conflicts: Array<{ link: EventLink; issue: string }> = [];

      for (const link of links) {
        const fromEvent = events.find((e) => e.id === link.fromId);
        const toEvent = events.find((e) => e.id === link.toId);

        if (!fromEvent || !toEvent) continue;

        const fromDate = new Date(fromEvent.date);
        const toDate = new Date(toEvent.date);
        const daysDiff = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24));

        switch (link.type) {
          case 'before':
            const minGap = link.gap || 0;
            if (daysDiff < minGap) {
              conflicts.push({
                link,
                issue: `Not enough gap: ${daysDiff} days vs ${minGap} required`,
              });
            }
            if (daysDiff < 0) {
              conflicts.push({
                link,
                issue: 'Event order is reversed',
              });
            }
            break;

          case 'after':
            if (daysDiff > 0) {
              conflicts.push({
                link,
                issue: 'Event order is reversed',
              });
            }
            break;

          case 'sameDay':
            if (daysDiff !== 0) {
              conflicts.push({
                link,
                issue: `Events are ${Math.abs(daysDiff)} day${Math.abs(daysDiff) !== 1 ? 's' : ''} apart`,
              });
            }
            break;
        }
      }

      return conflicts;
    },
    [links]
  );

  return {
    links,
    isLoading,
    addLink,
    removeLink,
    getLinkForEvent,
    getConflicts,
  };
}
