// Travel telemetry typed helpers
// Uses the existing lightweight event queue in lib/telemetry.ts
// Batch policy: rely on global batching (visibilitychange + idle flush)

import { trackEvent } from '../telemetry';

export type TravelSearchCtx = {
  origin?: string;
  dest?: string;
  date?: string; // YYYY-MM-DD
  retDate?: string;
  pax?: number;
  cabin?: 'E' | 'W' | 'B' | 'F';
  nonstop?: boolean;
  provider?: string;
};

export type TravelResultMeta = {
  id: string;
  price?: number;
  durationM?: number;
  stops?: number;
  date?: string; // YYYY-MM-DD
};

export const TravelEvents = {
  searchStarted: (ctx: TravelSearchCtx) => trackEvent('travel.search.started', ctx as any),
  searchResults: (payload: { count: number; groupedByDay?: boolean; ms?: number } & TravelSearchCtx) =>
    trackEvent('travel.search.completed', payload as any),
  searchError: (ctx?: Partial<TravelSearchCtx> & { code?: string }) => trackEvent('travel.search.error', ctx as any),

  resultPinned: (meta: TravelResultMeta) => trackEvent('travel.result.pinned', meta as any),
  resultUnpinned: (meta: Pick<TravelResultMeta, 'id'>) => trackEvent('travel.result.unpinned', meta as any),
  compareViewed: (payload: { items: number; sortBy?: 'price' | 'time' | 'balance'; badgesShown?: number }) =>
    trackEvent('travel.compare.view', payload as any),
  deepLinkOpened: (payload: { provider: string; url: string }) => trackEvent('travel.deeplink.open', payload as any),

  timelineMoved: (payload: { flightId: string; fromDay: string; toDay: string; method: 'dnd' | 'keyboard' }) =>
    trackEvent('travel.timeline.move', payload as any),
  quickTripPickerOpened: (payload: { from: 'result' | 'compare' }) =>
    trackEvent('travel.quickTripPicker.open', payload as any),
  addedToTrip: (payload: { tripId: string; flightId: string }) => trackEvent('travel.trip.add', payload as any),

  providerChanged: (payload: { from?: string; to: string }) => trackEvent('travel.provider.change', payload as any),
};

export type TravelEventName =
  | 'travel.search.started'
  | 'travel.search.completed'
  | 'travel.search.error'
  | 'travel.result.pinned'
  | 'travel.result.unpinned'
  | 'travel.compare.view'
  | 'travel.deeplink.open'
  | 'travel.timeline.move'
  | 'travel.quickTripPicker.open'
  | 'travel.trip.add'
  | 'travel.provider.change';
