import { showStore } from '../shared/showStore';
import type { Show } from '../lib/shows';

/**
 * showsService
 * Small promise-based adapter around the existing showStore singleton.
 * Purpose: provide a procedural API that can be used from non-React modules
 * during the migration to React Query. Later this can wrap API calls.
 */
export const showsService = {
  async getAll(): Promise<Show[]> {
    return Promise.resolve(showStore.getAll());
  },

  async getById(id: string): Promise<Show | undefined> {
    return Promise.resolve(showStore.getById(id));
  },

  async setAll(shows: Show[]): Promise<void> {
    showStore.setAll(shows);
    return Promise.resolve();
  },

  async addShow(s: Show): Promise<void> {
    showStore.addShow(s);
    return Promise.resolve();
  },

  async updateShow(id: string, patch: Partial<Show> & Record<string, unknown>): Promise<void> {
    showStore.updateShow(id, patch);
    return Promise.resolve();
  },

  async removeShow(id: string): Promise<void> {
    showStore.removeShow(id);
    return Promise.resolve();
  }
};

export default showsService;
