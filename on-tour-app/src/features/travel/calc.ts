import { showStore } from '../../shared/showStore';
import { getCurrentOrgId } from '../../lib/tenants';
import type { DemoShow } from '../lib/shows';

export type Segment = {
  from: Show;
  to: Show;
  distanceKm: number;
  mode: 'air' | 'ground';
  cost: number;
};

export type TravelSummary = {
  totalKm: number;
  airKm: number;
  groundKm: number;
  cost: number;
  segments: Segment[];
};

const R = 6371; // km
export function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const toRad = (d: number) => d * Math.PI / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function calcItinerary(shows = showStore.getAll()): TravelSummary {
  const org = getCurrentOrgId();
  shows = shows.filter((s: any) => !s.tenantId || s.tenantId === org);
  const ordered = shows.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const segs: Segment[] = [];
  for (let i = 0; i < ordered.length - 1; i++) {
    const from = ordered[i];
    const to = ordered[i + 1];
    if (!from || !to || from.lat === undefined || from.lng === undefined || to.lat === undefined || to.lng === undefined) continue;
    const distanceKm = haversine({ lat: from.lat, lng: from.lng }, { lat: to.lat, lng: to.lng });
    const mode: 'air' | 'ground' = distanceKm > 700 ? 'air' : 'ground';
    const cost = mode === 'air' ? distanceKm * 0.12 : distanceKm * 0.4; // € per km (air cheaper per km, ground cost includes driver/coach)
    segs.push({ from, to, distanceKm: Math.round(distanceKm), mode, cost: Math.round(cost) });
  }
  const totalKm = Math.round(segs.reduce((s, x) => s + x.distanceKm, 0));
  const airKm = Math.round(segs.filter(s => s.mode === 'air').reduce((s, x) => s + x.distanceKm, 0));
  const groundKm = totalKm - airKm;
  const cost = Math.round(segs.reduce((s, x) => s + x.cost, 0));
  return { totalKm, airKm, groundKm, cost, segments: segs };
}
