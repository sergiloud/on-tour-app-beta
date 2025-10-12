// Demo auth: secureStorage-backed current user, profiles, and preferences (ENCRYPTED)
// Keys: demo:currentUser, demo:usersProfiles, demo:usersPrefs, demo:authed
// Emits: profile:updated, prefs:updated

import { secureStorage } from './secureStorage';

export type UserProfile = {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  bio?: string;
  // demo notification toggles
  notifyEmail?: boolean;
  notifySlack?: boolean;
  // preferred default organization for multi-tenant demo
  defaultOrgId?: string;
};

export type UserPrefs = {
  lang: 'en' | 'es';
  theme: 'dark' | 'light' | 'auto';
  highContrast: boolean;
  currency: 'EUR' | 'USD' | 'GBP';
  unit: 'km' | 'mi';
  presentationMode: boolean;
  comparePrev: boolean;
  defaultRegion: 'all' | 'AMER' | 'EMEA' | 'APAC';
  defaultStatuses: Array<'confirmed' | 'pending' | 'offer' | 'canceled' | 'archived' | 'postponed'>;
};

const K_CURRENT = 'demo:currentUser';
const K_PROFILES = 'demo:usersProfiles';
const K_PREFS = 'demo:usersPrefs';
const K_AUTHED = 'demo:authed';

function get<T>(key: string, fallback: T): T {
  try {
    const value = secureStorage.getItem<T>(key);
    return value !== null ? value : fallback;
  } catch {
    return fallback;
  }
}
function set<T>(key: string, value: T) {
  try { secureStorage.setItem(key, value); } catch { }
}

const DEFAULT_USER = 'dannyavila';
import { ORG_ARTIST_DANNY } from './tenants';
const DEFAULT_PROFILE: UserProfile = { id: DEFAULT_USER, name: 'Danny Avila', email: 'danny@example.com', notifyEmail: true, notifySlack: false, defaultOrgId: ORG_ARTIST_DANNY };
const DEFAULT_PREFS: UserPrefs = {
  lang: 'en', theme: 'auto', highContrast: false, currency: 'EUR', unit: 'km', presentationMode: false,
  comparePrev: false, defaultRegion: 'all', defaultStatuses: ['confirmed', 'pending', 'offer']
};

export function ensureDemoAuth() {
  try {
    const cur = get<string | undefined>(K_CURRENT, undefined as any);
    if (!cur) set(K_CURRENT, DEFAULT_USER);
    const profiles = get<Record<string, UserProfile>>(K_PROFILES, {});
    if (!profiles[DEFAULT_USER]) { profiles[DEFAULT_USER] = DEFAULT_PROFILE; set(K_PROFILES, profiles); }
    const prefs = get<Record<string, UserPrefs>>(K_PREFS, {});
    if (!prefs[DEFAULT_USER]) { prefs[DEFAULT_USER] = DEFAULT_PREFS; set(K_PREFS, prefs); }
  } catch { }
}

export function getCurrentUserId(): string { return get<string>(K_CURRENT, DEFAULT_USER); }
export function setCurrentUserId(id: string) { set(K_CURRENT, id); }

export function getUserProfile(id: string): UserProfile | undefined {
  const map = get<Record<string, UserProfile>>(K_PROFILES, {});
  return map[id];
}
export function upsertUserProfile(p: UserProfile) {
  const map = get<Record<string, UserProfile>>(K_PROFILES, {});
  // migrate missing notification flags to safe defaults
  const next: UserProfile = { notifyEmail: true, notifySlack: false, defaultOrgId: p.defaultOrgId ?? DEFAULT_PROFILE.defaultOrgId, ...p };
  map[p.id] = next; set(K_PROFILES, map);
  try { window.dispatchEvent(new CustomEvent('profile:updated', { detail: { id: p.id } } as any)); } catch { }
}

export function getUserPrefs(id: string): UserPrefs | undefined {
  const map = get<Record<string, UserPrefs>>(K_PREFS, {});
  return map[id];
}
export function upsertUserPrefs(id: string, patch: Partial<UserPrefs>) {
  const map = get<Record<string, UserPrefs>>(K_PREFS, {});
  const cur = map[id] ?? DEFAULT_PREFS;
  const next: UserPrefs = { ...cur, ...patch } as UserPrefs;
  map[id] = next; set(K_PREFS, map);
  try { window.dispatchEvent(new CustomEvent('prefs:updated', { detail: { id } } as any)); } catch { }
  return next;
}

export function readAllPrefs(id: string): UserPrefs {
  return getUserPrefs(id) ?? DEFAULT_PREFS;
}

// Auth guard helpers
export function isAuthed(): boolean {
  try { return !!get<boolean>(K_AUTHED, false); } catch { return false; }
}
export function setAuthed(v: boolean) {
  try { set<boolean>(K_AUTHED, !!v); } catch { }
}

// Data & privacy (demo): clear all demo auth data and reseed defaults
export function clearAndReseedAuth() {
  try {
    secureStorage.removeItem(K_CURRENT);
    secureStorage.removeItem(K_PROFILES);
    secureStorage.removeItem(K_PREFS);
    secureStorage.removeItem(K_AUTHED);
  } catch { }
  ensureDemoAuth();
}
