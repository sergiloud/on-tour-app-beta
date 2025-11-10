// Demo auth: secureStorage-backed current user, profiles, and preferences (ENCRYPTED)
// Keys: demo:currentUser, demo:usersProfiles, demo:usersPrefs, demo:authed
// Emits: profile:updated, prefs:updated
import { secureStorage } from './secureStorage';
const K_CURRENT = 'demo:currentUser';
const K_PROFILES = 'demo:usersProfiles';
const K_PREFS = 'demo:usersPrefs';
const K_AUTHED = 'demo:authed';
function get(key, fallback) {
    try {
        const value = secureStorage.getItem(key);
        return value !== null ? value : fallback;
    }
    catch {
        return fallback;
    }
}
function set(key, value) {
    try {
        secureStorage.setItem(key, value);
    }
    catch { }
}
const DEFAULT_USER = 'default_user';
export const PROPHECY_USER = 'user_prophecy_booking';
import { ORG_ARTIST_DANNY, ORG_ARTIST_PROPHECY } from './tenants';
const DEFAULT_PROFILE = { id: DEFAULT_USER, name: 'Demo User', email: 'user@example.com', notifyEmail: true, notifySlack: false, defaultOrgId: ORG_ARTIST_DANNY };
const PROPHECY_PROFILE = { id: PROPHECY_USER, name: 'Prophecy Booking', email: 'booking@prophecyofficial.com', notifyEmail: true, notifySlack: false, defaultOrgId: ORG_ARTIST_PROPHECY };
const DEFAULT_PREFS = {
    lang: 'en', theme: 'auto', highContrast: false, currency: 'EUR', unit: 'km', presentationMode: false,
    comparePrev: false, defaultRegion: 'all', defaultStatuses: ['confirmed', 'pending', 'offer']
};
export function ensureDemoAuth() {
    try {
        const cur = get(K_CURRENT, undefined);
        if (!cur)
            set(K_CURRENT, DEFAULT_USER);
        const profiles = get(K_PROFILES, {});
        if (!profiles[DEFAULT_USER]) {
            profiles[DEFAULT_USER] = DEFAULT_PROFILE;
            set(K_PROFILES, profiles);
        }
        if (!profiles[PROPHECY_USER]) {
            profiles[PROPHECY_USER] = PROPHECY_PROFILE;
            set(K_PROFILES, profiles);
        }
        const prefs = get(K_PREFS, {});
        if (!prefs[DEFAULT_USER]) {
            prefs[DEFAULT_USER] = DEFAULT_PREFS;
            set(K_PREFS, prefs);
        }
        if (!prefs[PROPHECY_USER]) {
            prefs[PROPHECY_USER] = DEFAULT_PREFS;
            set(K_PREFS, prefs);
        }
    }
    catch { }
}
export function getCurrentUserId() { return get(K_CURRENT, DEFAULT_USER); }
export function setCurrentUserId(id) { set(K_CURRENT, id); }
export function getUserProfile(id) {
    const map = get(K_PROFILES, {});
    return map[id];
}
export function upsertUserProfile(p) {
    const map = get(K_PROFILES, {});
    // migrate missing notification flags to safe defaults
    const next = { notifyEmail: true, notifySlack: false, defaultOrgId: p.defaultOrgId ?? DEFAULT_PROFILE.defaultOrgId, ...p };
    map[p.id] = next;
    set(K_PROFILES, map);
    try {
        window.dispatchEvent(new CustomEvent('profile:updated', { detail: { id: p.id } }));
    }
    catch { }
}
export function getUserPrefs(id) {
    const map = get(K_PREFS, {});
    return map[id];
}
export function upsertUserPrefs(id, patch) {
    const map = get(K_PREFS, {});
    const cur = map[id] ?? DEFAULT_PREFS;
    const next = { ...cur, ...patch };
    map[id] = next;
    set(K_PREFS, map);
    try {
        window.dispatchEvent(new CustomEvent('prefs:updated', { detail: { id } }));
    }
    catch { }
    return next;
}
export function readAllPrefs(id) {
    return getUserPrefs(id) ?? DEFAULT_PREFS;
}
// Demo login function for Prophecy user
export function loginProphecy(email, password) {
    if (email === 'booking@prophecyofficial.com' && password === 'Casillas123') {
        setCurrentUserId(PROPHECY_USER);
        setAuthed(true);
        // Load Prophecy data when this user logs in (frontend fallback)
        try {
            const { loadProphecyData } = require('./prophecyDataset');
            loadProphecyData();
        }
        catch (e) {
            console.warn('Could not load frontend Prophecy data:', e);
        }
        // Initialize backend data asynchronously
        try {
            import('../services/prophecyBackendService').then(({ ProphecyBackendService }) => {
                ProphecyBackendService.initializeProphecyUser('org_artist_prophecy');
            });
        }
        catch (e) {
            console.warn('Could not initialize backend Prophecy data:', e);
        }
        return true;
    }
    return false;
}
// Get available users for demo purposes
export function getAvailableUsers() {
    const profiles = get(K_PROFILES, {});
    return Object.values(profiles).map(p => ({
        id: p.id,
        email: p.email,
        name: p.name
    }));
}
// Auth guard helpers
export function isAuthed() {
    try {
        return !!get(K_AUTHED, false);
    }
    catch {
        return false;
    }
}
export function setAuthed(v) {
    try {
        set(K_AUTHED, !!v);
    }
    catch { }
}
// Data & privacy (demo): clear all demo auth data and reseed defaults
export function clearAndReseedAuth() {
    try {
        secureStorage.removeItem(K_CURRENT);
        secureStorage.removeItem(K_PROFILES);
        secureStorage.removeItem(K_PREFS);
        secureStorage.removeItem(K_AUTHED);
    }
    catch { }
    ensureDemoAuth();
}
