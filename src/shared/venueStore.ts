/**
 * Venue Store - Gestión de estado para venues
 * Similar pattern to contactStore for consistency
 */
import type { Venue } from '../types/venue';

class VenueStore {
  private venues: Map<string, Venue> = new Map();
  private listeners: Set<() => void> = new Set();
  private cachedVenues: Venue[] = [];

  constructor() {
    this.loadFromLocalStorage();
    this.updateCache();
  }

  // Suscripción para React hooks
  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  private notify(): void {
    this.saveToLocalStorage();
    this.updateCache();
    this.listeners.forEach((listener) => listener());
  }

  private updateCache(): void {
    this.cachedVenues = Array.from(this.venues.values());
  }

  // Persistencia
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('on-tour-venues');
      if (stored) {
        const data = JSON.parse(stored) as Venue[];
        this.venues = new Map(data.map((venue) => [venue.id, venue]));
        this.updateCache();
      }
    } catch (error) {
      console.error('[VenueStore] Error loading from localStorage:', error);
    }
  }

  private saveToLocalStorage(): void {
    try {
      const data = Array.from(this.venues.values());
      localStorage.setItem('on-tour-venues', JSON.stringify(data));
    } catch (error) {
      console.error('[VenueStore] Error saving to localStorage:', error);
    }
  }

  // CRUD Operations
  getAll(): Venue[] {
    return this.cachedVenues;
  }

  getById(id: string): Venue | undefined {
    return this.venues.get(id);
  }

  getByName(name: string): Venue | undefined {
    const normalized = name.trim().toLowerCase();
    return this.cachedVenues.find(v => v.name.toLowerCase() === normalized);
  }

  add(venue: Venue): void {
    this.venues.set(venue.id, venue);
    this.notify();
  }

  update(id: string, updates: Partial<Venue>): void {
    const venue = this.venues.get(id);
    if (venue) {
      const updated = {
        ...venue,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      this.venues.set(id, updated);
      this.notify();
    }
  }

  delete(id: string): void {
    this.venues.delete(id);
    this.notify();
  }

  // Search venues by name (case-insensitive)
  search(query: string): Venue[] {
    if (!query.trim()) return this.cachedVenues;
    const normalized = query.toLowerCase();
    return this.cachedVenues.filter(v => 
      v.name.toLowerCase().includes(normalized) ||
      v.city?.toLowerCase().includes(normalized) ||
      v.country?.toLowerCase().includes(normalized)
    );
  }

  // Find or create venue by name
  findOrCreate(name: string, metadata?: Partial<Omit<Venue, 'id' | 'name' | 'createdAt' | 'updatedAt'>>): Venue {
    const existing = this.getByName(name);
    if (existing) return existing;

    const newVenue: Venue = {
      id: crypto.randomUUID(),
      name: name.trim(),
      ...metadata,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.add(newVenue);
    return newVenue;
  }

  // Clear all venues
  clear(): void {
    this.venues.clear();
    this.notify();
  }

  // Reload from localStorage (útil después de importar datos)
  reload(): void {
    this.loadFromLocalStorage();
    this.listeners.forEach((listener) => listener());
  }
}

// Singleton instance
export const venueStore = new VenueStore();

// React hook
import { useSyncExternalStore } from 'react';

export function useVenues() {
  return useSyncExternalStore(
    (listener) => venueStore.subscribe(listener),
    () => venueStore.getAll(),
    () => []
  );
}

export function useVenue(id: string | undefined) {
  return useSyncExternalStore(
    (listener) => venueStore.subscribe(listener),
    () => (id ? venueStore.getById(id) : undefined),
    () => undefined
  );
}
