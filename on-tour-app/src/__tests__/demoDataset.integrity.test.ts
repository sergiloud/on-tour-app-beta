import { forceReplaceDemoData, DEMO_SHOWS } from '../lib/demoDataset';
import { showStore } from '../shared/showStore';
import { describe, it, expect } from 'vitest';

describe('Demo dataset integrity', () => {
  it.skip('force replace loads exactly curated shows with required fields', () => {
    // TODO: Update expected show IDs to match actual demo dataset
    const res = forceReplaceDemoData();
    expect(res.replaced).toBe(true);
    const shows = showStore.getAll();
    // Count
    expect(shows.length).toBe(DEMO_SHOWS.length);
    // Each show has id, name, city, country, date, fee, status confirmed
    for (const s of shows) {
      expect(typeof s.id).toBe('string');
      expect(typeof (s as any).name).toBe('string');
      expect((s as any).name!.length).toBeGreaterThan(0);
      expect(typeof s.city).toBe('string');
      expect(typeof s.country).toBe('string');
      expect(s.date).toMatch(/2025-\d{2}-\d{2}/);
      expect(typeof s.fee).toBe('number');
      expect(['confirmed', 'pending', 'postponed', 'archived']).toContain(s.status);
    }
  });
});
