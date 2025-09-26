import { describe, it, expect } from 'vitest';
import { haversine, calcItinerary } from '../features/travel/calc';

describe('travel calc', () => {
  it('haversine ~ known distance (NYC-LA ~ 3940km)', () => {
    const d = haversine({ lat:40.7128, lng:-74.0060 }, { lat:34.0522, lng:-118.2437 });
    expect(Math.round(d)).toBeGreaterThan(3800);
    expect(Math.round(d)).toBeLessThan(4100);
  });

  it('itinerary has coherent totals', () => {
    const t = calcItinerary();
    const sumKm = t.segments.reduce((s,x)=>s+x.distanceKm,0);
    expect(t.totalKm).toBe(sumKm);
    expect(t.totalKm).toBeGreaterThanOrEqual(t.airKm + t.groundKm - 1);
    expect(t.cost).toBeGreaterThan(0);
  });
});
