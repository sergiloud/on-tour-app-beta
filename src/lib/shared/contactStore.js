/**
 * Contact Store - Gestión de estado para el CRM
 * Patrón similar a showStore para consistencia
 */
class ContactStore {
    constructor() {
        this.contacts = new Map();
        this.listeners = new Set();
        this.cachedContacts = [];
        this.cachedStats = null;
        this.loadFromLocalStorage();
        this.updateCache();
    }
    // Suscripción para React hooks
    subscribe(listener) {
        this.listeners.add(listener);
        return () => {
            this.listeners.delete(listener);
        };
    }
    notify() {
        this.saveToLocalStorage();
        this.updateCache();
        this.listeners.forEach((listener) => listener());
    }
    updateCache() {
        this.cachedContacts = Array.from(this.contacts.values());
        this.cachedStats = null; // Invalidate stats cache
    }
    // Persistencia
    loadFromLocalStorage() {
        try {
            const stored = localStorage.getItem('on-tour-contacts');
            if (stored) {
                const data = JSON.parse(stored);
                this.contacts = new Map(data.map((contact) => [contact.id, contact]));
                this.updateCache();
            }
        }
        catch (error) {
            console.error('[ContactStore] Error loading from localStorage:', error);
        }
    }
    // Método público para recargar desde localStorage (útil después de cargar datos demo)
    reload() {
        this.loadFromLocalStorage();
        // Notificar a todos los listeners (React Query, componentes, etc.)
        this.listeners.forEach((listener) => listener());
        console.log(`[ContactStore] Reloaded ${this.contacts.size} contacts from localStorage`);
    }
    saveToLocalStorage() {
        try {
            const data = Array.from(this.contacts.values());
            localStorage.setItem('on-tour-contacts', JSON.stringify(data));
        }
        catch (error) {
            console.error('[ContactStore] Error saving to localStorage:', error);
        }
    }
    // CRUD Operations
    getAll() {
        return this.cachedContacts;
    }
    getById(id) {
        return this.contacts.get(id);
    }
    add(contact) {
        this.contacts.set(contact.id, contact);
        this.notify();
    }
    update(id, updates) {
        const contact = this.contacts.get(id);
        if (contact) {
            const updated = {
                ...contact,
                ...updates,
                updatedAt: new Date().toISOString(),
            };
            this.contacts.set(id, updated);
            this.notify();
        }
    }
    delete(id) {
        this.contacts.delete(id);
        this.notify();
    }
    // Búsqueda y filtrado
    search(filters) {
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
            results = results.filter((contact) => filters.tags.some((tag) => contact.tags.includes(tag)));
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
    getStats() {
        if (this.cachedStats) {
            return this.cachedStats;
        }
        const contacts = this.cachedContacts;
        const now = new Date();
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        const stats = {
            total: contacts.length,
            byType: {},
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
    addNote(contactId, note) {
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
    addInteraction(contactId, interaction) {
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
    export() {
        return JSON.stringify(Array.from(this.contacts.values()), null, 2);
    }
    import(data) {
        try {
            const contacts = JSON.parse(data);
            contacts.forEach((contact) => {
                this.contacts.set(contact.id, contact);
            });
            this.notify();
        }
        catch (error) {
            console.error('[ContactStore] Error importing contacts:', error);
            throw new Error('Invalid contact data format');
        }
    }
    // Limpiar todos los contactos (con confirmación)
    clear() {
        this.contacts.clear();
        this.notify();
    }
}
// Singleton instance
export const contactStore = new ContactStore();
// React hook para usar el store
import { useSyncExternalStore } from 'react';
export function useContacts() {
    return useSyncExternalStore((callback) => contactStore.subscribe(callback), () => contactStore.getAll(), () => []);
}
export function useContact(id) {
    return useSyncExternalStore((callback) => contactStore.subscribe(callback), () => (id ? contactStore.getById(id) : undefined), () => undefined);
}
export function useContactStats() {
    return useSyncExternalStore((callback) => contactStore.subscribe(callback), () => contactStore.getStats(), () => ({
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
    }));
}
