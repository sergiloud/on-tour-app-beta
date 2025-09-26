import { describe, it, expect } from 'vitest';
import { showStore } from '../shared/showStore';

describe('showStore', () => {
  it('subscribes and adds shows', () => {
    const seen: number[] = [];
    const unsub = showStore.subscribe(list => { seen.push(list.length); });
    const baseLen = showStore.getAll().length;
    showStore.addShow({ id:'test-1', city:'Test', country:'TT', lat:0, lng:0, date:new Date().toISOString(), fee:1000, status:'pending' });
    unsub();
    expect(seen[0]).toBe(baseLen);
    expect(showStore.getAll().length).toBe(baseLen + 1);
  });

  it('updates a show by id', () => {
    const baseLen = showStore.getAll().length;
    const id = 'test-update-1';
    showStore.addShow({ id, city:'A', country:'AA', lat:0, lng:0, date:new Date().toISOString(), fee:100, status:'offer' });
    showStore.updateShow(id, { city: 'B', fee: 250, status: 'confirmed' });
    const found = showStore.getAll().find(s => s.id === id)!;
    expect(found.city).toBe('B');
    expect(found.fee).toBe(250);
    expect(found.status).toBe('confirmed');
    expect(showStore.getAll().length).toBe(baseLen + 1);
  });

  it('removes a show by id', () => {
    const id = 'test-remove-1';
    showStore.addShow({ id, city:'X', country:'XX', lat:0, lng:0, date:new Date().toISOString(), fee:100, status:'pending' });
    const before = showStore.getAll().length;
    showStore.removeShow(id);
    const after = showStore.getAll().length;
    expect(after).toBe(before - 1);
    expect(showStore.getAll().some(s => s.id === id)).toBe(false);
  });

  it('keeps shows sorted by date after updates', () => {
    const id = 'test-sort-1';
    const d1 = new Date('2025-01-01T00:00:00Z').toISOString();
    const d2 = new Date('2025-02-01T00:00:00Z').toISOString();
    showStore.addShow({ id, city:'S', country:'SS', lat:0, lng:0, date:d2, fee:100, status:'pending' });
    showStore.updateShow(id, { date: d1 });
    const all = showStore.getAll();
    const idx = all.findIndex(s => s.id === id);
    // Ensure there's no item with a date earlier than d1 after it (basic monotonicity check around the updated item)
    const updatedTime = new Date(all[idx].date).getTime();
    for (let i = 0; i < all.length; i++) {
      if (i > idx) {
        expect(new Date(all[i].date).getTime()).toBeGreaterThanOrEqual(updatedTime);
      }
    }
  });
});
