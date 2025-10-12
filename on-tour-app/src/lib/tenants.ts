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
export const ORG_AGENCY_SHALIZI = 'org_agency_shalizi_group';

const SEED = {
  orgs: [
    { id: ORG_ARTIST_DANNY, type: 'artist', name: 'Danny Avila', seatLimit: 5, guestLimit: 5 },
    { id: ORG_ARTIST_DANNY_V2, type: 'artist', name: 'Danny Avila 2', seatLimit: 5, guestLimit: 5 },
    { id: ORG_AGENCY_SHALIZI, type: 'agency', name: 'Shalizi Group', seatLimit: 5, guestLimit: 5 },
  ] as Org[],
  users: [
    { id: 'user_danny', name: 'Danny Avila' },
    { id: 'user_danny_v2', name: 'Danny Avila 2' },
    { id: 'user_adam', name: 'Adam' },
    { id: 'user_mike', name: 'Mike' },
    { id: 'user_sergio', name: 'Sergio' },
  ] as User[],
  memberships: [
    { orgId: ORG_ARTIST_DANNY, userId: 'user_danny', role: 'owner' },
    { orgId: ORG_ARTIST_DANNY, userId: 'user_mike', role: 'manager' },
    { orgId: ORG_ARTIST_DANNY, userId: 'user_sergio', role: 'manager' },
    { orgId: ORG_ARTIST_DANNY_V2, userId: 'user_danny_v2', role: 'owner' },
    { orgId: ORG_AGENCY_SHALIZI, userId: 'user_adam', role: 'manager' },
  ] as Membership[],
  teams: [
    { id: 'team_sg_danny', orgId: ORG_AGENCY_SHALIZI, name: 'Danny Avila', members: ['user_adam'] },
  ] as Team[],
  links: [
    { id: 'link_shalizi_to_danny', agencyOrgId: ORG_AGENCY_SHALIZI, artistOrgId: ORG_ARTIST_DANNY, status: 'active', scopes: { shows: 'write', travel: 'book', finance: 'read' } },
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

// Convenience: identify if the current org is the agency link
export function isAgencyCurrent(): boolean {
  try { return getCurrentOrgId() === ORG_AGENCY_SHALIZI; } catch { return false; }
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

// Permission: for the demo, agency has finance read-only; artist has full (including export)
export function canExportFinance(): boolean {
  try {
    const cur = getCurrentOrgId();
    if (cur === ORG_ARTIST_DANNY) return true; // full control in artist org
    if (cur === ORG_AGENCY_SHALIZI) {
      const link = getLinkAgencyToArtist();
      // Even with finance: 'read', exporting is disabled in demo
      return false;
    }
    return true;
  } catch { return true; }
}

// Permission facade for demo scopes
export function can(permission: 'finance:export' | 'shows:write' | 'travel:book'): boolean {
  try {
    const cur = getCurrentOrgId();
    const org = getOrgById(cur);
    if (!org) return false;
    const viewAs = getViewAs();
    if (viewAs) {
      // Agency viewing artist: restrict by link scopes between prevOrg (agency) and artist
      const link = findLink(viewAs.prevOrgId, viewAs.artistOrgId);
      if (!link || link.status !== 'active') return false;
      if (permission === 'finance:export') return false; // never export in demo from agency
      if (permission === 'shows:write') return link.scopes.shows === 'write';
      if (permission === 'travel:book') return link.scopes.travel === 'book';
      return true;
    }
    if (org.type === 'artist') {
      if (permission === 'finance:export') return true;
      if (permission === 'shows:write') return true;
      if (permission === 'travel:book') return true;
      return true;
    }
    // agency (not viewing-as): fall back to primary demo link policy
    const link = getLinkAgencyToArtist();
    if (!link || link.status !== 'active') return false;
    if (permission === 'finance:export') return false; // no export in demo
    if (permission === 'shows:write') return link.scopes.shows === 'write';
    if (permission === 'travel:book') return link.scopes.travel === 'book';
    return true;
  } catch { return false; }
}

// Consumers can listen to: window.addEventListener('tenant:changed', (e) => ...)
