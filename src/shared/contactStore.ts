/**
 * Contact Store - Gestión de estado para el CRM
 * Patrón similar a showStore para consistencia
 */

import type { Contact, ContactFilters, ContactStats } from '../types/crm';
import { logger } from '../lib/logger';

class ContactStore {
  private contacts: Map<string, Contact> = new Map();
  private listeners: Set<() => void> = new Set();
  private cachedContacts: Contact[] = [];
  private cachedStats: ContactStats | null = null;

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
    this.cachedContacts = Array.from(this.contacts.values());
    this.cachedStats = null; // Invalidate stats cache
  }

  // Persistencia
  private loadFromLocalStorage(): void {
    try {
      const stored = localStorage.getItem('on-tour-contacts');
      if (stored) {
        const data = JSON.parse(stored) as Contact[];
        this.contacts = new Map(data.map((contact) => [contact.id, contact]));
        this.updateCache();
      }
    } catch (error) {
      logger.error('[ContactStore] Error loading from localStorage', error as Error);
    }
  }

  // Método público para recargar desde localStorage (útil después de cargar datos demo)
  reload(): void {
    this.loadFromLocalStorage();
    // Notificar a todos los listeners (React Query, componentes, etc.)
    this.listeners.forEach((listener) => listener());
    logger.info('[ContactStore] Reloaded contacts from localStorage', { count: this.contacts.size });
  }

  private saveToLocalStorage(): void {
    try {
      const data = Array.from(this.contacts.values());
      localStorage.setItem('on-tour-contacts', JSON.stringify(data));
    } catch (error) {
      logger.error('[ContactStore] Error saving to localStorage', error as Error, { count: this.contacts.size });
    }
  }

  // CRUD Operations
  getAll(): Contact[] {
    return this.cachedContacts;
  }

  getById(id: string): Contact | undefined {
    return this.contacts.get(id);
  }

  add(contact: Contact): void {
    this.contacts.set(contact.id, contact);
    this.notify();
  }

  // Batch add - para sincronización masiva sin múltiples notificaciones
  setAll(contacts: Contact[]): void {
    this.contacts.clear();
    contacts.forEach(contact => {
      this.contacts.set(contact.id, contact);
    });
    this.notify();
  }

  // Batch update - para actualizar múltiples contactos a la vez
  updateMany(contacts: Contact[]): void {
    contacts.forEach(contact => {
      this.contacts.set(contact.id, contact);
    });
    this.notify();
  }

  update(id: string, updates: Partial<Contact>): void {
    const contact = this.contacts.get(id);
    if (contact) {
      const updated = {
        ...contact,
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      logger.info('[ContactStore] Updating contact', {
        id,
        hasNotes: !!updated.notes,
        notesCount: updated.notes?.length || 0
      });
      this.contacts.set(id, updated);
      this.notify();
    }
  }

  delete(id: string): void {
    this.contacts.delete(id);
    this.notify();
  }

  // Búsqueda y filtrado
  search(filters: Partial<ContactFilters>): Contact[] {
    let results = this.getAll();

    // Búsqueda por texto
    if (filters.search) {
      const query = filters.search.toLowerCase();
      results = results.filter((contact) => {
        const searchText = [
          contact.firstName,
          contact.lastName,
          contact.company,
          contact.email,
          contact.city,
          contact.country,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase();
        return searchText.includes(query);
      });
    }

    // Filtro por tipo
    if (filters.type && filters.type !== 'all') {
      results = results.filter((contact) => contact.type === filters.type);
    }

    // Filtro por prioridad
    if (filters.priority && filters.priority !== 'all') {
      results = results.filter((contact) => contact.priority === filters.priority);
    }

    // Filtro por estado
    if (filters.status && filters.status !== 'all') {
      results = results.filter((contact) => contact.status === filters.status);
    }

    // Filtro por tags
    if (filters.tags && filters.tags.length > 0) {
      results = results.filter((contact) =>
        filters.tags!.some((tag) => contact.tags.includes(tag))
      );
    }

    // Filtro por ciudad
    if (filters.city) {
      results = results.filter((contact) => contact.city === filters.city);
    }

    // Filtro por país
    if (filters.country) {
      results = results.filter((contact) => contact.country === filters.country);
    }

    return results;
  }

  // Estadísticas
  getStats(): ContactStats {
    if (this.cachedStats) {
      return this.cachedStats;
    }

    const contacts = this.cachedContacts;
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const stats: ContactStats = {
      total: contacts.length,
      byType: {} as Record<string, number>,
      byPriority: { high: 0, medium: 0, low: 0 },
      byStatus: { active: 0, inactive: 0, pending: 0 },
      recentInteractions: 0,
    };

    contacts.forEach((contact) => {
      // Por tipo
      stats.byType[contact.type] = (stats.byType[contact.type] || 0) + 1;

      // Por prioridad
      stats.byPriority[contact.priority]++;

      // Por estado
      stats.byStatus[contact.status]++;

      // Interacciones recientes (últimos 30 días)
      const recentInteractions = contact.interactions.filter((interaction) => {
        const interactionDate = new Date(interaction.date);
        return interactionDate >= thirtyDaysAgo;
      });
      stats.recentInteractions += recentInteractions.length;
    });

    this.cachedStats = stats;
    return stats;
  }

  // Utilidades
  addNote(contactId: string, note: string): void {
    const contact = this.contacts.get(contactId);
    if (contact) {
      const newNote = {
        id: crypto.randomUUID(),
        content: note,
        createdAt: new Date().toISOString(),
      };
      contact.notes.push(newNote);
      contact.updatedAt = new Date().toISOString();
      this.contacts.set(contactId, contact);
      this.notify();
    }
  }

  addInteraction(
    contactId: string,
    interaction: Omit<Contact['interactions'][0], 'id' | 'createdAt'>
  ): void {
    const contact = this.contacts.get(contactId);
    if (contact) {
      const newInteraction = {
        ...interaction,
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      };
      contact.interactions.push(newInteraction);
      contact.lastContactedAt = interaction.date;
      contact.updatedAt = new Date().toISOString();
      this.contacts.set(contactId, contact);
      this.notify();
    }
  }

  // Exportar/Importar (para futuras integraciones)
  export(): string {
    return JSON.stringify(Array.from(this.contacts.values()), null, 2);
  }

  import(data: string): void {
    try {
      const contacts = JSON.parse(data) as Contact[];
      contacts.forEach((contact) => {
        this.contacts.set(contact.id, contact);
      });
      this.notify();
    } catch (error) {
      logger.error('[ContactStore] Error importing contacts', error as Error);
      throw new Error('Invalid contact data format');
    }
  }

  // Limpiar todos los contactos (con confirmación)
  clear(): void {
    this.contacts.clear();
    this.notify();
  }
}

// Singleton instance
export const contactStore = new ContactStore();

// React hook para usar el store
import { useSyncExternalStore } from 'react';

export function useContacts(): Contact[] {
  return useSyncExternalStore(
    (callback) => contactStore.subscribe(callback),
    () => contactStore.getAll(),
    () => []
  );
}

export function useContact(id: string | undefined): Contact | undefined {
  return useSyncExternalStore(
    (callback) => contactStore.subscribe(callback),
    () => (id ? contactStore.getById(id) : undefined),
    () => undefined
  );
}

export function useContactStats(): ContactStats {
  return useSyncExternalStore(
    (callback) => contactStore.subscribe(callback),
    () => contactStore.getStats(),
    () => ({
      total: 0,
      byType: {
        promoter: 0,
        venue_manager: 0,
        press_agent: 0,
        booking_agent: 0,
        label_rep: 0,
        festival_org: 0,
        radio_dj: 0,
        journalist: 0,
        photographer: 0,
        videographer: 0,
        sound_tech: 0,
        other: 0,
      },
      byPriority: { high: 0, medium: 0, low: 0 },
      byStatus: { active: 0, inactive: 0, pending: 0 },
      recentInteractions: 0,
    })
  );
}
