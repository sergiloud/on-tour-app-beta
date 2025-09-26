import { describe, it, expect, beforeEach } from 'vitest';
import { showStore } from '../shared/showStore';
import { loadDemoData, clearAllShows, DEMO_SHOWS, isDemoLoaded } from '../lib/demoDataset';

// Helper to reset store between tests
function resetStore(){
  clearAllShows();
}

describe('demo dataset load/clear', () => {
  beforeEach(()=>{ resetStore(); });

  it('loads demo data once', () => {
    expect(showStore.getAll().length).toBe(0);
    const res = loadDemoData();
    expect(res.loaded).toBe(true);
    expect(showStore.getAll().length).toBe(DEMO_SHOWS.length);
    // second call should not duplicate
    const res2 = loadDemoData();
    expect(res2.loaded).toBe(false);
    expect(showStore.getAll().length).toBe(DEMO_SHOWS.length);
    expect(isDemoLoaded()).toBe(true);
  });

  it('clear removes all shows and flag', () => {
    loadDemoData();
    expect(showStore.getAll().length).toBeGreaterThan(0);
    clearAllShows();
    expect(showStore.getAll().length).toBe(0);
    expect(isDemoLoaded()).toBe(false);
  });
});
