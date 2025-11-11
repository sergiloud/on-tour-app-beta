// Multi-tenant seed data and helpers (ENCRYPTED with secureStorage)
// User: Danny Avila
import { secureStorage } from './secureStorage';
const K_ORGS = 'demo:orgs';
const K_USERS = 'demo:users';
const K_MEMBERS = 'demo:memberships';
const K_TEAMS = 'demo:teams';
const K_LINKS = 'demo:links';
const K_CURRENT = 'demo:currentOrg';
const K_ORG_SETTINGS = 'demo:orgSettings';
const K_VIEW_AS = 'demo:viewAs'; // { prevOrgId, artistOrgId } when agency is viewing as artist
export const ORG_ARTIST_DANNY = 'org_artist_danny_avila';
export const ORG_ARTIST_DANNY_V2 = 'org_artist_danny_avila_v2';
export const ORG_ARTIST_PROPHECY = 'org_artist_prophecy';
export const ORG_AGENCY_SHALIZI = 'org_agency_shalizi_group';
export const ORG_AGENCY_A2G = 'org_agency_a2g_management';
const SEED = {
    orgs: [
        { id: ORG_ARTIST_DANNY, type: 'artist', name: 'Danny Avila', seatLimit: 5, guestLimit: 5 },
        { id: ORG_ARTIST_DANNY_V2, type: 'artist', name: 'Danny Avila 2', seatLimit: 5, guestLimit: 5 },
        { id: ORG_ARTIST_PROPHECY, type: 'artist', name: 'Prophecy', seatLimit: 5, guestLimit: 5 },
        { id: ORG_AGENCY_SHALIZI, type: 'agency', name: 'Shalizi Group', seatLimit: 5, guestLimit: 5 },
        { id: ORG_AGENCY_A2G, type: 'agency', name: 'A2G Management', seatLimit: 5, guestLimit: 5 },
    ],
    users: [
        { id: 'user_danny', name: 'Danny Avila' },
        { id: 'user_danny_v2', name: 'Danny Avila 2' },
        { id: 'user_prophecy', name: 'Prophecy' },
        { id: 'user_artist', name: 'Artist Demo' },
        { id: 'user_adam', name: 'Adam' },
        { id: 'user_mike', name: 'Mike' },
        { id: 'user_sergio', name: 'Sergio' },
        { id: 'user_aitzol', name: 'Aitzol' },
    ],
    memberships: [
        { orgId: ORG_ARTIST_DANNY, userId: 'user_danny', role: 'owner' },
        { orgId: ORG_ARTIST_DANNY, userId: 'user_mike', role: 'manager' },
        { orgId: ORG_ARTIST_DANNY, userId: 'user_sergio', role: 'manager' },
        { orgId: ORG_ARTIST_DANNY_V2, userId: 'user_danny_v2', role: 'owner' },
        { orgId: ORG_ARTIST_PROPHECY, userId: 'user_prophecy', role: 'owner' },
        { orgId: ORG_ARTIST_PROPHECY, userId: 'user_aitzol', role: 'manager' },
        { orgId: ORG_AGENCY_SHALIZI, userId: 'user_adam', role: 'manager' },
        { orgId: ORG_AGENCY_A2G, userId: 'user_aitzol', role: 'owner' },
    ],
    teams: [
        { id: 'team_sg_danny', orgId: ORG_AGENCY_SHALIZI, name: 'Danny Avila', members: ['user_adam'] },
        { id: 'team_a2g_prophecy', orgId: ORG_AGENCY_A2G, name: 'Prophecy', members: ['user_aitzol'] },
    ],
    links: [
        { id: 'link_shalizi_to_danny', agencyOrgId: ORG_AGENCY_SHALIZI, artistOrgId: ORG_ARTIST_DANNY, status: 'active', scopes: { shows: 'write', travel: 'book', finance: 'read' } },
        { id: 'link_a2g_to_prophecy', agencyOrgId: ORG_AGENCY_A2G, artistOrgId: ORG_ARTIST_PROPHECY, status: 'active', scopes: { shows: 'write', travel: 'book', finance: 'export' } },
    ],
    currentOrg: ORG_ARTIST_DANNY,
};
function get(key, fallback) {
    try {
        const value = secureStorage.getItem(key);
        return value !== null ? value : fallback;
    }
    catch {
        return fallback;
    }
}
function set(key, value) { try {
    secureStorage.setItem(key, value);
}
catch { } }
// Idempotent seed: merges by id without duplicating. Only runs client-side.
export function ensureDemoTenants() {
    try {
        const orgs = mergeById(get(K_ORGS, []), SEED.orgs);
        const users = mergeById(get(K_USERS, []), SEED.users);
        const mems = mergeMemberships(get(K_MEMBERS, []), SEED.memberships);
        const teams = mergeById(get(K_TEAMS, []), SEED.teams);
        const links = mergeById(get(K_LINKS, []), SEED.links);
        set(K_ORGS, orgs);
        set(K_USERS, users);
        set(K_MEMBERS, mems);
        set(K_TEAMS, teams);
        set(K_LINKS, links);
        const cur = get(K_CURRENT, undefined);
        if (!cur)
            set(K_CURRENT, SEED.currentOrg);
    }
    catch { /* ignore SSR / private mode */ }
}
function mergeById(existing, add) {
    const map = new Map(existing.map(x => [x.id, x]));
    for (const item of add)
        if (!map.has(item.id))
            map.set(item.id, item);
    return Array.from(map.values());
}
function mergeMemberships(existing, add) {
    const key = (m) => `${m.orgId}:${m.userId}`;
    const map = new Map(existing.map(m => [key(m), m]));
    for (const m of add)
        if (!map.has(key(m)))
            map.set(key(m), m);
    return Array.from(map.values());
}
export function getCurrentOrgId() {
    return get(K_CURRENT, SEED.currentOrg);
}
export function setCurrentOrgId(id) {
    set(K_CURRENT, id);
    try {
        window.dispatchEvent(new CustomEvent('tenant:changed', { detail: { id } }));
    }
    catch { }
}
export function getOrgName(id) {
    const org = get(K_ORGS, []).find(o => o.id === id);
    return org?.name || 'Demo';
}
export function getOrgs() {
    return get(K_ORGS, []);
}
export function getUserMemberships(userId) {
    const orgs = get(K_ORGS, []);
    const mems = get(K_MEMBERS, []);
    const list = mems.filter(m => m.userId === userId).map(m => {
        const org = orgs.find(o => o.id === m.orgId);
        return { org: org || { id: m.orgId, type: 'artist', name: 'Demo', seatLimit: 0, guestLimit: 0 }, role: m.role };
    });
    return list;
}
// New getters for organization-centric data
export function getOrgById(id) {
    return get(K_ORGS, []).find(o => o.id === id);
}
export function listMembers(orgId) {
    const users = get(K_USERS, []);
    const mems = get(K_MEMBERS, []);
    return mems.filter(m => m.orgId === orgId).map(m => ({ user: users.find(u => u.id === m.userId) || { id: m.userId, name: 'User' }, role: m.role }));
}
export function listTeams(orgId) {
    return get(K_TEAMS, []).filter(t => t.orgId === orgId);
}
export function listLinks(orgId) {
    const links = get(K_LINKS, []);
    return links.filter(l => l.agencyOrgId === orgId || l.artistOrgId === orgId);
}
// --- Mutators to support inline Welcome actions (demo) ---
/**
 * Create organization for a new real user (not demo)
 * This ensures real users have their own org without polluting demo data
 */
export function createUserOrganization(userId, orgData) {
    try {
        const orgId = `org_${orgData.type}_${userId}_${Date.now()}`;
        const newOrg = {
            id: orgId,
            type: orgData.type,
            name: orgData.name,
            seatLimit: orgData.seatLimit || 10,
            guestLimit: orgData.guestLimit || 5
        };
        // Add to orgs list
        const orgs = get(K_ORGS, []);
        orgs.push(newOrg);
        set(K_ORGS, orgs);
        // Create owner membership
        const mems = get(K_MEMBERS, []);
        mems.push({ orgId, userId, role: 'owner' });
        set(K_MEMBERS, mems);
        // Add user if doesn't exist
        const users = get(K_USERS, []);
        if (!users.find(u => u.id === userId)) {
            users.push({ id: userId, name: orgData.name });
            set(K_USERS, users);
        }
        // Set as current org
        set(K_CURRENT, orgId);
        try {
            window.dispatchEvent(new CustomEvent('tenant:changed', { detail: { id: orgId } }));
            window.dispatchEvent(new CustomEvent('org:membersUpdated', { detail: { orgId } }));
        }
        catch { }
        return orgId;
    }
    catch (error) {
        console.error('Failed to create user organization:', error);
        // Fallback to temporary org ID
        return `org_${orgData.type}_temp_${Date.now()}`;
    }
}
export function inviteMember(orgId, name, role = 'manager') {
    try {
        const users = get(K_USERS, []);
        const mems = get(K_MEMBERS, []);
        const userId = `user_${Math.random().toString(36).slice(2, 8)}`;
        users.push({ id: userId, name });
        mems.push({ orgId, userId, role });
        set(K_USERS, users);
        set(K_MEMBERS, mems);
        try {
            window.dispatchEvent(new CustomEvent('org:membersUpdated', { detail: { orgId } }));
        }
        catch { }
        return { userId };
    }
    catch {
        return undefined;
    }
}
export function addTeam(orgId, name) {
    try {
        const teams = get(K_TEAMS, []);
        const teamId = `team_${Math.random().toString(36).slice(2, 8)}`;
        teams.push({ id: teamId, orgId, name, members: [] });
        set(K_TEAMS, teams);
        try {
            window.dispatchEvent(new CustomEvent('org:teamsUpdated', { detail: { orgId } }));
        }
        catch { }
        return { teamId };
    }
    catch {
        return undefined;
    }
}
export function setTeamMembers(teamId, memberIds) {
    try {
        const teams = get(K_TEAMS, []);
        const idx = teams.findIndex(t => t.id === teamId);
        if (idx === -1)
            return false;
        const team = teams[idx];
        if (!team)
            return false;
        const orgId = team.orgId;
        teams[idx] = { ...team, members: memberIds };
        set(K_TEAMS, teams);
        try {
            window.dispatchEvent(new CustomEvent('org:teamsUpdated', { detail: { orgId } }));
        }
        catch { }
        return true;
    }
    catch {
        return false;
    }
}
export function addOrGetLink(agencyOrgId, artistOrgId) {
    try {
        const links = get(K_LINKS, []);
        let link = links.find(l => l.agencyOrgId === agencyOrgId && l.artistOrgId === artistOrgId);
        if (!link) {
            link = { id: `link_${Math.random().toString(36).slice(2, 8)}`, agencyOrgId, artistOrgId, status: 'active', scopes: { shows: 'write', travel: 'book', finance: 'read' } };
            links.push(link);
            set(K_LINKS, links);
        }
        try {
            window.dispatchEvent(new CustomEvent('org:linksUpdated', { detail: { orgId: agencyOrgId } }));
        }
        catch { }
        return link;
    }
    catch {
        return undefined;
    }
}
// Update a link's scopes (demo only)
export function updateLinkScopes(linkId, patch) {
    try {
        const links = get(K_LINKS, []);
        const idx = links.findIndex(l => l.id === linkId);
        if (idx === -1)
            return undefined;
        const cur = links[idx];
        if (!cur)
            return undefined;
        const next = { ...cur, scopes: { ...cur.scopes, ...patch } };
        links[idx] = next;
        set(K_LINKS, links);
        return next;
    }
    catch {
        return undefined;
    }
}
export function getSeatsUsage(orgId) {
    const org = getOrgById(orgId) || { id: orgId, type: 'artist', name: 'Demo', seatLimit: 5, guestLimit: 5 };
    const internalUsed = listMembers(orgId).length;
    // For demo, treat guests as 0; future: track invited external viewers
    const guestUsed = 0;
    return { internalUsed, internalLimit: org.seatLimit, guestUsed, guestLimit: org.guestLimit };
}
export function getOrgSettings(orgId) {
    const all = get(K_ORG_SETTINGS, {});
    const existing = all[orgId];
    if (existing)
        return existing;
    // Seed defaults
    const def = {
        branding: { color: '#9ae6b4' },
        api: {},
        defaults: { currency: 'EUR', timezone: 'Europe/Madrid' }
    };
    return def;
}
export function upsertOrgSettings(orgId, patch) {
    const all = get(K_ORG_SETTINGS, {});
    const cur = all[orgId] || getOrgSettings(orgId);
    const next = { ...cur, ...patch, branding: { ...cur.branding, ...patch.branding }, api: { ...cur.api, ...patch.api }, defaults: { ...cur.defaults, ...patch.defaults } };
    all[orgId] = next;
    set(K_ORG_SETTINGS, all);
    try {
        window.dispatchEvent(new CustomEvent('org:settingsUpdated', { detail: { orgId } }));
    }
    catch { }
    return next;
}
// Data & privacy helpers (demo only)
export function exportDemoData() {
    try {
        const keys = [K_ORGS, K_USERS, K_MEMBERS, K_TEAMS, K_LINKS, K_CURRENT];
        const out = {};
        for (const k of keys)
            out[k] = get(k, null);
        return out;
    }
    catch {
        return {};
    }
}
export function clearAndReseedDemo() {
    try {
        const keys = [K_ORGS, K_USERS, K_MEMBERS, K_TEAMS, K_LINKS, K_CURRENT];
        for (const k of keys)
            secureStorage.removeItem(k);
    }
    catch { }
    ensureDemoTenants();
}
// Helper for seeding shows/trips with tenantId
export function withTenant(obj, tenantId) {
    return { ...obj, tenantId: tenantId || getCurrentOrgId() };
}
export function getLinkAgencyToArtist() {
    return get(K_LINKS, []).find(l => l.agencyOrgId === ORG_AGENCY_SHALIZI && l.artistOrgId === ORG_ARTIST_DANNY);
}
// Generic link finder between agency and artist
export function findLink(agencyOrgId, artistOrgId) {
    return get(K_LINKS, []).find(l => l.agencyOrgId === agencyOrgId && l.artistOrgId === artistOrgId);
}
// Convenience: identify if the current org is an agency
export function isAgencyCurrent() {
    try {
        const currentOrg = getOrgById(getCurrentOrgId());
        return currentOrg?.type === 'agency';
    }
    catch {
        return false;
    }
}
export function getViewAs() {
    return get(K_VIEW_AS, null);
}
export function isViewingAs() {
    return !!getViewAs();
}
export function startViewAs(artistOrgId) {
    try {
        const cur = getCurrentOrgId();
        const curOrg = getOrgById(cur);
        if (!curOrg || curOrg.type !== 'agency')
            return false; // only from agency
        const state = { prevOrgId: cur, artistOrgId };
        set(K_VIEW_AS, state);
        setCurrentOrgId(artistOrgId);
        return true;
    }
    catch {
        return false;
    }
}
export function endViewAs() {
    try {
        const st = getViewAs();
        if (st && st.prevOrgId) {
            setCurrentOrgId(st.prevOrgId);
        }
        set(K_VIEW_AS, null);
    }
    catch { }
}
// Permission: ALL users have full access to everything (no restrictions)
export function canExportFinance() {
    return true; // Full access for all organizations
}
// Permission facade: ALL permissions granted for all users
export function can(permission) {
    return true; // Full access for all organizations - no restrictions
}
// Consumers can listen to: window.addEventListener('tenant:changed', (e) => ...)
