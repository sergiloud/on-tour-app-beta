// Local trips service with simple persistence to secureStorage (ENCRYPTED) and event subscriptions
import { secureStorage } from '../lib/secureStorage';

export type TripStatus = 'planned' | 'requested' | 'booked' | 'canceled' | 'archived';
export type SegmentType = 'flight' | 'hotel' | 'ground';
export type Currency = 'EUR' | 'USD' | 'GBP';

export type Segment = {
  id: string;
  type: SegmentType;
  from?: string; // IATA or city
  to?: string;   // IATA or city
  dep?: string;  // ISO
  arr?: string;  // ISO
  carrier?: string;
  fareClass?: string;
  pnr?: string;
  price?: number;
  currency?: Currency;
  co2?: number;
  riskScore?: number;
};

export type CostCategory = 'flight' | 'hotel' | 'ground' | 'taxes' | 'fees' | 'other';
export type Cost = {
  id: string;
  tripId: string;
  segmentId?: string;
  category: CostCategory;
  amount: number;
  currency: Currency;
  tax?: number;
  source?: 'manual' | 'ocr' | 'email';
  docRef?: string;
  note?: string;
};

export type Trip = {
  id: string;
  title: string;
  travelerId?: string;
  showId?: string;
  status: TripStatus;
  segments: Segment[];
  budget?: { amount: number; currency: Currency };
  actuals?: { amount: number; currency: Currency };
  policyFlags?: string[];
  notes?: string;
  costs?: Cost[];
};

const KEY = 'travel:trips';

function _load(): Trip[] {
  try {
    const trips = secureStorage.getItem<Trip[]>(KEY);
    return trips || [];
  } catch {
    return [];
  }
}
function _save(list: Trip[]) {
  try { secureStorage.setItem(KEY, list); } catch { }
}

export function listTrips(): Trip[] { return _load(); }
export function getTrip(id: string): Trip | undefined { return _load().find(t => t.id === id); }
export function createTrip(data: Partial<Trip>): Trip {
  const id = crypto?.randomUUID?.() ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
  const next: Trip = { id, title: data.title || 'New Trip', status: data.status || 'planned', segments: [], costs: [], ...data } as Trip;
  const list = _load();
  list.push(next); _save(list); _emit({ type: 'created', trip: next });
  return next;
}
export function updateTrip(id: string, patch: Partial<Trip>): Trip | undefined {
  const list = _load();
  const idx = list.findIndex(t => t.id === id);
  if (idx === -1) return undefined;
  const prev = list[idx];
  if (!prev) return undefined;
  const next = { ...prev, ...patch, id: prev.id } as Trip;
  list[idx] = next; _save(list); _emit({ type: 'updated', trip: next });
  return next;
}
export function deleteTrip(id: string) {
  const list = _load();
  const next = list.filter(t => t.id !== id);
  _save(next); _emit({ type: 'deleted', id });
}

export function addSegment(tripId: string, seg: Omit<Segment, 'id'>): Segment | undefined {
  const t = getTrip(tripId); if (!t) return undefined;
  const id = crypto?.randomUUID?.() ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
  const s: Segment = { id, ...seg } as Segment;
  updateTrip(tripId, { segments: [...(t.segments || []), s] });
  return s;
}
export function updateSegment(tripId: string, segmentId: string, patch: Partial<Segment>): Segment | undefined {
  const t = getTrip(tripId); if (!t) return undefined;
  const segs = (t.segments || []).map(s => s.id === segmentId ? { ...s, ...patch } : s);
  updateTrip(tripId, { segments: segs });
  return segs.find(s => s.id === segmentId);
}
export function removeSegment(tripId: string, segmentId: string) {
  const t = getTrip(tripId); if (!t) return;
  const segs = (t.segments || []).filter(s => s.id !== segmentId);
  updateTrip(tripId, { segments: segs });
}

export function addCost(tripId: string, cost: Omit<Cost, 'id' | 'tripId'>): Cost | undefined {
  const t = getTrip(tripId); if (!t) return undefined;
  const id = crypto?.randomUUID?.() ? crypto.randomUUID() : Math.random().toString(36).slice(2, 10);
  const c: Cost = { id, tripId, ...cost } as Cost;
  updateTrip(tripId, { costs: [...(t.costs || []), c] });
  return c;
}
export function updateCost(tripId: string, costId: string, patch: Partial<Cost>): Cost | undefined {
  const t = getTrip(tripId); if (!t) return undefined;
  const costs = (t.costs || []).map(c => c.id === costId ? { ...c, ...patch } : c);
  updateTrip(tripId, { costs });
  return costs.find(c => c.id === costId);
}
export function removeCost(tripId: string, costId: string) {
  const t = getTrip(tripId); if (!t) return;
  const costs = (t.costs || []).filter(c => c.id !== costId);
  updateTrip(tripId, { costs });
}

// Subscriptions
type TripEvent = { type: 'created' | 'updated' | 'deleted'; trip?: Trip; id?: string };
const subs = new Set<(e: TripEvent) => void>();
export function onTripsChanged(cb: (e: TripEvent) => void) { subs.add(cb); return () => subs.delete(cb); }
function _emit(e: TripEvent) { subs.forEach(cb => { try { cb(e); } catch { } }); }
