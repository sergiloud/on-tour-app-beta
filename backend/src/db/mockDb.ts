/**
 * In-Memory Database Mock
 *
 * For development without local PostgreSQL
 * In production, replace with real Kysely client
 */

import { randomUUID } from 'crypto';

// Types
export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  oauth_provider: string;
  oauth_id: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Show {
  id: string;
  organization_id: string;
  name: string;
  venue?: string;
  city?: string;
  country?: string;
  show_date: string;
  door_time?: string;
  show_time?: string;
  end_time?: string;
  notes?: string;
  ticket_url?: string;
  status: 'scheduled' | 'cancelled' | 'completed';
  metadata: Record<string, unknown>;
  created_by?: string;
  created_at: Date;
  updated_at: Date;
}

// In-memory storage
const storage = {
  users: new Map<string, User>(),
  shows: new Map<string, Show>(),
};

// User operations
export const users = {
  create: (data: Omit<User, 'id' | 'created_at' | 'updated_at'>) => {
    const id = randomUUID();
    const user: User = {
      ...data,
      id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    storage.users.set(id, user);
    return user;
  },

  findByEmail: (email: string) => {
    return Array.from(storage.users.values()).find((u) => u.email === email);
  },

  findById: (id: string) => {
    return storage.users.get(id);
  },

  findByOAuthId: (oauth_provider: string, oauth_id: string) => {
    return Array.from(storage.users.values()).find(
      (u) => u.oauth_provider === oauth_provider && u.oauth_id === oauth_id
    );
  },

  update: (id: string, data: Partial<User>) => {
    const user = storage.users.get(id);
    if (!user) throw new Error('User not found');
    const updated = { ...user, ...data, updated_at: new Date() };
    storage.users.set(id, updated);
    return updated;
  },
};

// Show operations
export const shows = {
  create: (data: Omit<Show, 'id' | 'created_at' | 'updated_at'>) => {
    const id = randomUUID();
    const show: Show = {
      ...data,
      id,
      created_at: new Date(),
      updated_at: new Date(),
    };
    storage.shows.set(id, show);
    return show;
  },

  findById: (id: string) => {
    return storage.shows.get(id);
  },

  findByOrganization: (organization_id: string) => {
    return Array.from(storage.shows.values()).filter(
      (s) => s.organization_id === organization_id
    );
  },

  findAll: () => {
    return Array.from(storage.shows.values());
  },

  update: (id: string, data: Partial<Show>) => {
    const show = storage.shows.get(id);
    if (!show) throw new Error('Show not found');
    const updated = { ...show, ...data, updated_at: new Date() };
    storage.shows.set(id, updated);
    return updated;
  },

  delete: (id: string) => {
    return storage.shows.delete(id);
  },
};

export const db = {
  users,
  shows,
  // In production, add real Kysely operations here
};
