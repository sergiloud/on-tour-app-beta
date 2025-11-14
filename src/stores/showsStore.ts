/**
 * Zustand Store: Shows Management
 * 
 * Replaces legacy showStore.ts with modern Zustand implementation
 * 
 * Benefits over Context:
 * - No Provider Hell
 * - Granular subscriptions (components only re-render when their slice changes)
 * - Cleaner API
 * - Built-in devtools support
 * - Middleware support (persist, immer, etc.)
 */

import { create } from 'zustand';
import { devtools, persist, subscribeWithSelector } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { Show } from '../lib/shows';
import { normalizeShow } from '../lib/shows';
import { multiTabSync } from '../lib/multiTabSync';
import { logger } from '../lib/logger';

interface ShowsState {
  // State
  shows: Show[];
  isLoading: boolean;
  error: Error | null;
  lastSync: Date | null;
  
  // Actions
  addShow: (show: Show) => void;
  updateShow: (id: string, updates: Partial<Show>) => void;
  deleteShow: (id: string) => void;
  setShows: (shows: Show[]) => void;
  clearShows: () => void;
  
  // Helpers
  getShowById: (id: string) => Show | undefined;
  getShowsByStatus: (status: Show['status']) => Show[];
  getShowsByDateRange: (startDate: Date, endDate: Date) => Show[];
}

export const useShowsStore = create<ShowsState>()(
  devtools(
    persist(
      subscribeWithSelector(
        immer((set, get) => ({
          // Initial state
          shows: [],
          isLoading: false,
          error: null,
          lastSync: null,

          // Add show
          addShow: (show) => {
            set((state) => {
              const normalized = normalizeShow(show);
              state.shows.push(normalized);
              state.lastSync = new Date();
            });
            
            // Broadcast to other tabs
            multiTabSync.broadcast({
              type: 'show-created',
              payload: show
            });
            
            logger.info('[ShowsStore] Show added', { showId: show.id });
          },

          // Update show
          updateShow: (id, updates) => {
            set((state) => {
              const index = state.shows.findIndex(s => s.id === id);
              if (index !== -1) {
                state.shows[index] = { ...state.shows[index], ...updates } as Show;
                state.lastSync = new Date();
              }
            });
            
            multiTabSync.broadcast({
              type: 'shows-updated',
              payload: { id, updates }
            });
            
            logger.info('[ShowsStore] Show updated', { showId: id });
          },

          // Delete show
          deleteShow: (id) => {
            set((state) => {
              state.shows = state.shows.filter(s => s.id !== id);
              state.lastSync = new Date();
            });
            
            multiTabSync.broadcast({
              type: 'show-deleted',
              payload: { id }
            });
            
            logger.info('[ShowsStore] Show deleted', { showId: id });
          },

          // Set shows (bulk replace)
          setShows: (shows) => {
            set((state) => {
              state.shows = shows.map(normalizeShow);
              state.lastSync = new Date();
              state.error = null;
            });
          },

          // Clear all shows
          clearShows: () => {
            set((state) => {
              state.shows = [];
              state.lastSync = new Date();
            });
            
            logger.info('[ShowsStore] All shows cleared');
          },

          // Get show by ID
          getShowById: (id) => {
            return get().shows.find(s => s.id === id);
          },

          // Get shows by status
          getShowsByStatus: (status) => {
            return get().shows.filter(s => s.status === status);
          },

          // Get shows by date range
          getShowsByDateRange: (startDate, endDate) => {
            return get().shows.filter(s => {
              const showDate = new Date(s.date);
              return showDate >= startDate && showDate <= endDate;
            });
          },
        }))
      ),
      {
        name: 'shows-store-v4', // localStorage key
        version: 1,
      }
    ),
    {
      name: 'ShowsStore',
      enabled: process.env.NODE_ENV === 'development',
    }
  )
);

// Selectors for granular subscriptions
export const selectShows = (state: ShowsState) => state.shows;
export const selectConfirmedShows = (state: ShowsState) => 
  state.shows.filter(s => s.status === 'confirmed');
export const selectPendingShows = (state: ShowsState) => 
  state.shows.filter(s => s.status === 'pending');
export const selectShowCount = (state: ShowsState) => state.shows.length;
export const selectIsLoading = (state: ShowsState) => state.isLoading;

// Computed selectors
export const useConfirmedShows = () => useShowsStore(selectConfirmedShows);
export const usePendingShows = () => useShowsStore(selectPendingShows);
export const useShowCount = () => useShowsStore(selectShowCount);

/**
 * Example usage:
 * 
 * // In a component - subscribe to specific slice
 * const shows = useShowsStore(state => state.shows);
 * const addShow = useShowsStore(state => state.addShow);
 * 
 * // Or use selectors for optimized re-renders
 * const confirmedShows = useConfirmedShows();
 * 
 * // Actions
 * addShow({ id: '1', name: 'Test Show', ... });
 * updateShow('1', { name: 'Updated Show' });
 * deleteShow('1');
 */
