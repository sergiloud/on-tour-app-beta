import { forceReplaceDemoData, DEMO_SHOWS } from '../lib/demoDataset';
import { showStore } from '../shared/showStore';

describe('Demo dataset integrity', () => {
  it('force replace loads exactly curated shows with required fields', () => {
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
      expect(s.status).toBe('confirmed');
    }
    // Spot check a couple of key entries by id
    expect(shows.some(s=> s.id==='demo-2025-06-14-drifted-dallas' && s.fee===35229)).toBe(true);
    expect(shows.some(s=> s.id==='demo-2025-09-13-nocturnal-wonderland' && s.fee===11024)).toBe(true);
    expect(shows.some(s=> s.id==='demo-2025-12-05-epic-prague' && s.fee===9700)).toBe(true);
  });
});
