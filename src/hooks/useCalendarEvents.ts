import { useMemo } from 'react';
import type { CalEvent, CalEventKind } from '../components/calendar/types';
import { countryLabel } from '../lib/countries';
import { detectTravelRisks } from '../lib/calendar';
import type { SyncedCalendarEvent } from './useSyncedCalendarEvents';

type Inputs = {
  shows: Array<{ id: string; date: string; city: string; country: string; status: string; notes?: string; endDate?: string }>;
  travel: Array<{ id: string; date: string; title: string; city?: string; status?: string; endDate?: string }>;
  syncedEvents?: SyncedCalendarEvent[];
  lang: 'en' | 'es';
  kinds: { shows: boolean; travel: boolean };
  filters?: { status?: { confirmed: boolean; pending: boolean; offer: boolean } };
  toDateOnlyTz: (iso: string, tz: string) => string;
  tz: string;
};

export function useCalendarEvents({ shows, travel, syncedEvents = [], lang, kinds, filters, toDateOnlyTz, tz }: Inputs) {
  return useMemo(() => {
    const map = new Map<string, CalEvent[]>();
    const push = (d: string, ev: CalEvent) => {
      const arr = map.get(d) || [];
      arr.push(ev);
      map.set(d, arr);
    };
    const allowStatus = (s?: string) => {
      if (!filters?.status) return true;
      if (s === 'confirmed') return !!filters.status.confirmed;
      if (s === 'pending') return !!filters.status.pending;
      if (s === 'offer') return !!filters.status.offer;
      return true;
    };

    // Map button colors to calendar colors
    const buttonColorToCalendarColor: Record<string, CalEvent['color']> = {
      'emerald': 'green',
      'amber': 'yellow',
      'sky': 'blue',
      'rose': 'red',
      'purple': 'purple',
      'cyan': 'blue'
    };

    // Collect all events first for risk detection
    const allEvents: CalEvent[] = [];

    if (kinds.shows) for (const s of shows) {
      if (!allowStatus(s.status)) continue;
      const d = toDateOnlyTz(s.date, tz);

      // Extract color from notes if stored with special prefixes
      let color: CalEvent['color'] | undefined;
      if (s.notes) {
        // Try new format first: __dispColor:green|__btnType:show|...
        const dispColorMatch = s.notes.match(/__dispColor:(\w+)/);
        const matchedColor = dispColorMatch?.[1];
        if (matchedColor && ['accent', 'green', 'red', 'blue', 'yellow', 'purple'].includes(matchedColor)) {
          color = matchedColor as CalEvent['color'];
        }
        // Fallback to old format: __color:green... (for backward compat)
        else if (s.notes.startsWith('__color:')) {
          const colorStr = s.notes.substring(8).split('|')[0]; // Get first part before pipe
          if (colorStr && ['accent', 'green', 'red', 'blue', 'yellow', 'purple'].includes(colorStr)) {
            color = colorStr as CalEvent['color'];
          }
        }
      }

      const event: CalEvent = {
        id: `show:${s.id}`,
        date: d,
        kind: 'show',
        title: `${s.city}, ${countryLabel(s.country, lang)}`,
        meta: '',
        status: s.status,
        color,
        endDate: s.endDate ? toDateOnlyTz(s.endDate, tz) : undefined
      };

      // Handle multi-day events
      if (event.endDate && event.endDate !== event.date) {
        // Parse dates correctly for comparison
        const startDate = new Date(event.date + 'T00:00:00Z');
        const endDate = new Date(event.endDate + 'T00:00:00Z');

        // Only distribute if endDate is actually after startDate
        if (endDate > startDate) {
          // Calculate span length and distribute across all days
          const spanDates: string[] = [];
          let current = new Date(event.date + 'T00:00:00Z');

          while (current <= endDate) {
            spanDates.push(current.toISOString().slice(0, 10));
            current.setDate(current.getDate() + 1);
          }

          // Add event to each day with spanIndex information
          spanDates.forEach((spanDate, idx) => {
            const eventCopy: CalEvent = {
              ...event,
              spanLength: spanDates.length,
              spanIndex: idx
            };
            push(spanDate, eventCopy);
          });
        } else {
          // Single-day event
          event.spanLength = 1;
          event.spanIndex = 0;
          push(d, event);
        }
      } else {
        // Single-day event
        event.spanLength = 1;
        event.spanIndex = 0;
        push(d, event);
      }

      allEvents.push(event);
    }

    if (kinds.travel) for (const it of travel) {
      if (!allowStatus(it.status)) continue;
      const d = toDateOnlyTz(it.date, tz);

      // Map buttonColor from itinerary to calendar color
      let color: CalEvent['color'] | undefined;
      if ((it as any).buttonColor && buttonColorToCalendarColor[(it as any).buttonColor]) {
        color = buttonColorToCalendarColor[(it as any).buttonColor];
      }

      // Determine the event kind based on btnType, default to 'travel'
      const eventKind: CalEventKind = ((it as any).btnType as CalEventKind) || 'travel';

      const event: CalEvent = {
        id: `${eventKind}:${it.id}`,
        date: d,
        kind: eventKind,
        title: it.title,
        meta: it.city || '',
        status: it.status,
        color,
        endDate: it.endDate ? toDateOnlyTz(it.endDate, tz) : undefined,
        spanLength: 1,
        spanIndex: 0
      };

      // Travel events: Only show on departure and return dates, not all days in between
      if (event.endDate && event.endDate !== event.date) {
        // Extract origin/destination for title formatting
        const origin = (it as any).departure || '';
        const destination = (it as any).destination || '';

        // Add departure event (origin → destination)
        const departureTitle = origin && destination ? `${origin} → ${destination}` : it.title;
        const departureEvent: CalEvent = {
          ...event,
          date: event.date,
          title: departureTitle,
          spanLength: 1,
          spanIndex: 0
        };
        push(event.date, departureEvent);

        // Add return event (destination → origin) - reverse the title
        const returnTitle = destination && origin ? `${destination} → ${origin}` : it.title;
        const returnEvent: CalEvent = {
          ...event,
          date: event.endDate,
          title: returnTitle,
          spanLength: 1,
          spanIndex: 0
        };
        push(event.endDate, returnEvent);
      } else {
        // Single-day travel event
        push(d, { ...event, spanLength: 1, spanIndex: 0 });
      }

      // Detect travel risks
      const risk = detectTravelRisks(event, allEvents, shows);
      if (risk) {
        event.meta = `${event.meta} [${risk.toUpperCase()}]`.trim();
      }

      allEvents.push(event);
    }

    // Add synced calendar events from CalDAV
    for (const syncedEvent of syncedEvents) {
      const d = syncedEvent.date; // Already in YYYY-MM-DD format
      
      const event: CalEvent = {
        id: `synced:${syncedEvent.id}`,
        date: d,
        kind: 'calendar' as CalEventKind, // Use 'calendar' kind for synced events
        title: syncedEvent.title,
        meta: syncedEvent.location || '',
        color: 'purple' as const, // Purple color for synced events
        endDate: syncedEvent.endDate,
        spanLength: 1,
        spanIndex: 0
      };

      // Handle multi-day synced events
      if (event.endDate && event.endDate !== event.date) {
        const start = new Date(event.date);
        const end = new Date(event.endDate);
        const daysDiff = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;
        
        for (let i = 0; i < daysDiff; i++) {
          const currentDate = new Date(start);
          currentDate.setDate(start.getDate() + i);
          const dateStr = currentDate.toISOString().slice(0, 10);
          
          push(dateStr, {
            ...event,
            date: dateStr,
            spanLength: daysDiff,
            spanIndex: i
          });
        }
      } else {
        // Single-day synced event
        push(d, event);
      }

      allEvents.push(event);
    }

    return map;
  }, [shows, travel, syncedEvents, lang, kinds.shows, kinds.travel, tz, filters?.status?.confirmed, filters?.status?.pending, filters?.status?.offer]);
}
