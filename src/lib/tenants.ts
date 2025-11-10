// Multi-tenant seed data and helpers (ENCRYPTED with secureStorage)
// User: Danny Avila

import { secureStorage } from './secureStorage';

type OrgType = 'artist' | 'agency' | 'venue';
export type Org = { id: string; type: OrgType; name: string; seatLimit: number; guestLimit: number };
export type User = { id: string; name: string };
export type Membership = { orgId: string; userId: string; role: 'owner' | 'manager' };
export type Team = { id: string; orgId: string; name: string; members: string[] };
export type LinkScopes = { shows: 'read' | 'write'; travel: 'read' | 'book'; finance: 'none' | 'read' | 'export' };
export type Link = { id: string; agencyOrgId: string; artistOrgId: string; status: 'active' | 'inactive'; scopes: LinkScopes };
export type OrgSettings = {
  branding?: { logoUrl?: string; color?: string; socials?: Record<string, string>; pressKitUrl?: string; shortBio?: string };
  api?: { slackWebhook?: string; calendarKey?: string; mapKey?: string };
  defaults?: { currency?: 'EUR' | 'USD' | 'GBP'; timezone?: string };
};

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
  ] as Org[],
  users: [
    { id: 'user_danny', name: 'Danny Avila' },
    { id: 'user_danny_v2', name: 'Danny Avila 2' },
    { id: 'user_prophecy', name: 'Prophecy' },
    { id: 'user_artist', name: 'Artist Demo' },
    { id: 'user_adam', name: 'Adam' },
    { id: 'user_mike', name: 'Mike' },
    { id: 'user_sergio', name: 'Sergio' },
    { id: 'user_aitzol', name: 'Aitzol' },
  ] as User[],
  memberships: [
    { orgId: ORG_ARTIST_DANNY, userId: 'user_danny', role: 'owner' },
    { orgId: ORG_ARTIST_DANNY, userId: 'user_mike', role: 'manager' },
    { orgId: ORG_ARTIST_DANNY, userId: 'user_sergio', role: 'manager' },
    { orgId: ORG_ARTIST_DANNY_V2, userId: 'user_danny_v2', role: 'owner' },
    { orgId: ORG_ARTIST_PROPHECY, userId: 'user_prophecy', role: 'owner' },
    { orgId: ORG_ARTIST_PROPHECY, userId: 'user_aitzol', role: 'manager' },
    { orgId: ORG_AGENCY_SHALIZI, userId: 'user_adam', role: 'manager' },
    { orgId: ORG_AGENCY_A2G, userId: 'user_aitzol', role: 'owner' },
  ] as Membership[],
  teams: [
    { id: 'team_sg_danny', orgId: ORG_AGENCY_SHALIZI, name: 'Danny Avila', members: ['user_adam'] },
    { id: 'team_a2g_prophecy', orgId: ORG_AGENCY_A2G, name: 'Prophecy', members: ['user_aitzol'] },
  ] as Team[],
  links: [
    { id: 'link_shalizi_to_danny', agencyOrgId: ORG_AGENCY_SHALIZI, artistOrgId: ORG_ARTIST_DANNY, status: 'active', scopes: { shows: 'write', travel: 'book', finance: 'read' } },
    { id: 'link_a2g_to_prophecy', agencyOrgId: ORG_AGENCY_A2G, artistOrgId: ORG_ARTIST_PROPHECY, status: 'active', scopes: { shows: 'write', travel: 'book', finance: 'export' } },
  ] as Link[],
  currentOrg: ORG_ARTIST_DANNY,
};

function get<T>(key: string, fallback: T): T {
  try {
    const value = secureStorage.getItem<T>(key);
    return value !== null ? value : fallback;
  } catch {
    return fallback;
  }
}
function set(key: string, value: any) { try { secureStorage.setItem(key, value); } catch { } }

// Idempotent seed: merges by id without duplicating. Only runs client-side.
export function ensureDemoTenants() {
  try {
    const orgs = mergeById(get<Org[]>(K_ORGS, []), SEED.orgs);
    const users = mergeById(get<User[]>(K_USERS, []), SEED.users);
    const mems = mergeMemberships(get<Membership[]>(K_MEMBERS, []), SEED.memberships);
    const teams = mergeById(get<Team[]>(K_TEAMS, []), SEED.teams);
    const links = mergeById(get<Link[]>(K_LINKS, []), SEED.links);
    set(K_ORGS, orgs); set(K_USERS, users); set(K_MEMBERS, mems); set(K_TEAMS, teams); set(K_LINKS, links);
    const cur = get<string | undefined>(K_CURRENT, undefined as any);
    if (!cur) set(K_CURRENT, SEED.currentOrg);
  } catch { /* ignore SSR / private mode */ }
}

function mergeById<T extends { id: string }>(existing: T[], add: T[]): T[] {
  const map = new Map(existing.map(x => [x.id, x] as const));
  for (const item of add) if (!map.has(item.id)) map.set(item.id, item);
  return Array.from(map.values());
}

function mergeMemberships(existing: Membership[], add: Membership[]): Membership[] {
  const key = (m: Membership) => `${m.orgId}:${m.userId}`;
  const map = new Map(existing.map(m => [key(m), m] as const));
  for (const m of add) if (!map.has(key(m))) map.set(key(m), m);
  return Array.from(map.values());
}

export function getCurrentOrgId(): string {
  return get<string>(K_CURRENT, SEED.currentOrg);
}
export function setCurrentOrgId(id: string) {
  set(K_CURRENT, id);
  try { window.dispatchEvent(new CustomEvent('tenant:changed', { detail: { id } } as any)); } catch { }
}

export function getOrgName(id: string): string {
  const org = get<Org[]>(K_ORGS, []).find(o => o.id === id);
  return org?.name || 'Demo';
}

export function getOrgs(): Org[] {
  return get<Org[]>(K_ORGS, []);
}

export function getUserMemberships(userId: string): Array<{ org: Org; role: Membership['role'] }> {
  const orgs = get<Org[]>(K_ORGS, []);
  const mems = get<Membership[]>(K_MEMBERS, []);
  const list = mems.filter(m => m.userId === userId).map(m => {
    const org = orgs.find(o => o.id === m.orgId)!;
    return { org: org || { id: m.orgId, type: 'artist', name: 'Demo', seatLimit: 0, guestLimit: 0 }, role: m.role };
  });
  return list;
}

// New getters for organization-centric data
export function getOrgById(id: string): Org | undefined {
  return get<Org[]>(K_ORGS, []).find(o => o.id === id);
}

export function listMembers(orgId: string): Array<{ user: User; role: Membership['role'] }> {
  const users = get<User[]>(K_USERS, []);
  const mems = get<Membership[]>(K_MEMBERS, []);
  return mems.filter(m => m.orgId === orgId).map(m => ({ user: users.find(u => u.id === m.userId) || { id: m.userId, name: 'User' }, role: m.role }));
}

export function listTeams(orgId: string): Team[] {
  return get<Team[]>(K_TEAMS, []).filter(t => t.orgId === orgId);
}

export function listLinks(orgId: string): Link[] {
  const links = get<Link[]>(K_LINKS, []);
  return links.filter(l => l.agencyOrgId === orgId || l.artistOrgId === orgId);
}

// --- Mutators to support inline Welcome actions (demo) ---

/**
 * Create organization for a new real user (not demo)
 * This ensures real users have their own org without polluting demo data
 */
export function createUserOrganization(
  userId: string, 
  orgData: { type: OrgType; name: string; seatLimit?: number; guestLimit?: number }
): string {
  try {
    const orgId = `org_${orgData.type}_${userId}_${Date.now()}`;
    const newOrg: Org = {
      id: orgId,
      type: orgData.type,
      name: orgData.name,
      seatLimit: orgData.seatLimit || 10,
      guestLimit: orgData.guestLimit || 5
    };

    // Add to orgs list
    const orgs = get<Org[]>(K_ORGS, []);
    orgs.push(newOrg);
    set(K_ORGS, orgs);

    // Create owner membership
    const mems = get<Membership[]>(K_MEMBERS, []);
    mems.push({ orgId, userId, role: 'owner' });
    set(K_MEMBERS, mems);

    // Add user if doesn't exist
    const users = get<User[]>(K_USERS, []);
    if (!users.find(u => u.id === userId)) {
      users.push({ id: userId, name: orgData.name });
      set(K_USERS, users);
    }

    // Set as current org
    set(K_CURRENT, orgId);
    
    try { 
      window.dispatchEvent(new CustomEvent('tenant:changed', { detail: { id: orgId } } as any));
      window.dispatchEvent(new CustomEvent('org:membersUpdated', { detail: { orgId } } as any));
    } catch { }

    return orgId;
  } catch (error) {
    console.error('Failed to create user organization:', error);
    // Fallback to temporary org ID
    return `org_${orgData.type}_temp_${Date.now()}`;
  }
}

export function inviteMember(orgId: string, name: string, role: 'owner' | 'manager' = 'manager'): { userId: string } | undefined {
  try {
    const users = get<User[]>(K_USERS, []);
    const mems = get<Membership[]>(K_MEMBERS, []);
    const userId = `user_${Math.random().toString(36).slice(2, 8)}`;
    users.push({ id: userId, name });
    mems.push({ orgId, userId, role });
    set(K_USERS, users); set(K_MEMBERS, mems);
    try { window.dispatchEvent(new CustomEvent('org:membersUpdated', { detail: { orgId } } as any)); } catch { }
    return { userId };
  } catch { return undefined; }
}

export function addTeam(orgId: string, name: string): { teamId: string } | undefined {
  try {
    const teams = get<Team[]>(K_TEAMS, []);
    const teamId = `team_${Math.random().toString(36).slice(2, 8)}`;
    teams.push({ id: teamId, orgId, name, members: [] });
    set(K_TEAMS, teams);
    try { window.dispatchEvent(new CustomEvent('org:teamsUpdated', { detail: { orgId } } as any)); } catch { }
    return { teamId };
  } catch { return undefined; }
}

export function setTeamMembers(teamId: string, memberIds: string[]): boolean {
  try {
    const teams = get<Team[]>(K_TEAMS, []);
    const idx = teams.findIndex(t => t.id === teamId);
    if (idx === -1) return false;
    const team = teams[idx];
    if (!team) return false;
    const orgId = team.orgId;
    teams[idx] = { ...team, members: memberIds };
    set(K_TEAMS, teams);
    try { window.dispatchEvent(new CustomEvent('org:teamsUpdated', { detail: { orgId } } as any)); } catch { }
    return true;
  } catch { return false; }
}

export function addOrGetLink(agencyOrgId: string, artistOrgId: string): Link | undefined {
  try {
    const links = get<Link[]>(K_LINKS, []);
    let link = links.find(l => l.agencyOrgId === agencyOrgId && l.artistOrgId === artistOrgId);
    if (!link) {
      link = { id: `link_${Math.random().toString(36).slice(2, 8)}`, agencyOrgId, artistOrgId, status: 'active', scopes: { shows: 'write', travel: 'book', finance: 'read' } };
      links.push(link);
      set(K_LINKS, links);
    }
    try { window.dispatchEvent(new CustomEvent('org:linksUpdated', { detail: { orgId: agencyOrgId } } as any)); } catch { }
    return link;
  } catch { return undefined; }
}

// Update a link's scopes (demo only)
export function updateLinkScopes(linkId: string, patch: Partial<LinkScopes>): Link | undefined {
  try {
    const links = get<Link[]>(K_LINKS, []);
    const idx = links.findIndex(l => l.id === linkId);
    if (idx === -1) return undefined;
    const cur = links[idx];
    if (!cur) return undefined;
    const next: Link = { ...cur, scopes: { ...cur.scopes, ...patch } };
    links[idx] = next;
    set(K_LINKS, links);
    return next;
  } catch {
    return undefined;
  }
}

export function getSeatsUsage(orgId: string): { internalUsed: number; internalLimit: number; guestUsed: number; guestLimit: number } {
  const org = getOrgById(orgId) || { id: orgId, type: 'artist', name: 'Demo', seatLimit: 5, guestLimit: 5 } as Org;
  const internalUsed = listMembers(orgId).length;
  // For demo, treat guests as 0; future: track invited external viewers
  const guestUsed = 0;
  return { internalUsed, internalLimit: org.seatLimit, guestUsed, guestLimit: org.guestLimit };
}

export function getOrgSettings(orgId: string): OrgSettings {
  const all = get<Record<string, OrgSettings>>(K_ORG_SETTINGS, {});
  const existing = all[orgId];
  if (existing) return existing;
  // Seed defaults
  const def: OrgSettings = {
    branding: { color: '#9ae6b4' },
    api: {},
    defaults: { currency: 'EUR', timezone: 'Europe/Madrid' }
  };
  return def;
}

export function upsertOrgSettings(orgId: string, patch: Partial<OrgSettings>): OrgSettings {
  const all = get<Record<string, OrgSettings>>(K_ORG_SETTINGS, {});
  const cur = all[orgId] || getOrgSettings(orgId);
  const next: OrgSettings = { ...cur, ...patch, branding: { ...cur.branding, ...patch.branding }, api: { ...cur.api, ...patch.api }, defaults: { ...cur.defaults, ...patch.defaults } };
  all[orgId] = next; set(K_ORG_SETTINGS, all);
  try { window.dispatchEvent(new CustomEvent('org:settingsUpdated', { detail: { orgId } } as any)); } catch { }
  return next;
}

// Data & privacy helpers (demo only)
export function exportDemoData(): Record<string, unknown> {
  try {
    const keys = [K_ORGS, K_USERS, K_MEMBERS, K_TEAMS, K_LINKS, K_CURRENT];
    const out: Record<string, unknown> = {};
    for (const k of keys) out[k] = get<any>(k, null);
    return out;
  } catch {
    return {};
  }
}

export function clearAndReseedDemo(): void {
  try {
    const keys = [K_ORGS, K_USERS, K_MEMBERS, K_TEAMS, K_LINKS, K_CURRENT];
    for (const k of keys) secureStorage.removeItem(k);
  } catch { }
  ensureDemoTenants();
}

// Helper for seeding shows/trips with tenantId
export function withTenant<T extends { tenantId?: string }>(obj: T, tenantId?: string): T {
  return { ...obj, tenantId: tenantId || getCurrentOrgId() };
}

export function getLinkAgencyToArtist(): Link | undefined {
  return get<Link[]>(K_LINKS, []).find(l => l.agencyOrgId === ORG_AGENCY_SHALIZI && l.artistOrgId === ORG_ARTIST_DANNY);
}

// Generic link finder between agency and artist
export function findLink(agencyOrgId: string, artistOrgId: string): Link | undefined {
  return get<Link[]>(K_LINKS, []).find(l => l.agencyOrgId === agencyOrgId && l.artistOrgId === artistOrgId);
}

// Convenience: identify if the current org is an agency
export function isAgencyCurrent(): boolean {
  try { 
    const currentOrg = getOrgById(getCurrentOrgId());
    return currentOrg?.type === 'agency';
  } catch { return false; }
}

// --- View-as support (agency viewing an artist dashboard) ---
type ViewAsState = { prevOrgId: string; artistOrgId: string } | null;
export function getViewAs(): ViewAsState {
  return get<ViewAsState>(K_VIEW_AS, null);
}
export function isViewingAs(): boolean {
  return !!getViewAs();
}
export function startViewAs(artistOrgId: string): boolean {
  try {
    const cur = getCurrentOrgId();
    const curOrg = getOrgById(cur);
    if (!curOrg || curOrg.type !== 'agency') return false; // only from agency
    const state: ViewAsState = { prevOrgId: cur, artistOrgId };
    set(K_VIEW_AS, state);
    setCurrentOrgId(artistOrgId);
    return true;
  } catch { return false; }
}
export function endViewAs(): void {
  try {
    const st = getViewAs();
    if (st && st.prevOrgId) {
      setCurrentOrgId(st.prevOrgId);
    }
    set(K_VIEW_AS, null);
  } catch { }
}

// Permission: ALL users have full access to everything (no restrictions)
export function canExportFinance(): boolean {
  return true; // Full access for all organizations
}

// Permission facade: ALL permissions granted for all users
export function can(permission: 'finance:export' | 'shows:write' | 'travel:book'): boolean {
  return true; // Full access for all organizations - no restrictions
}

// Consumers can listen to: window.addEventListener('tenant:changed', (e) => ...)
