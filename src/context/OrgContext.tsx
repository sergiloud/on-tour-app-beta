import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  ensureDemoTenants,
  getCurrentOrgId,
  getOrgById,
  listMembers,
  listTeams,
  listLinks,
  getSeatsUsage,
  getOrgSettings,
  upsertOrgSettings,
  type Org,
  type OrgSettings,
  type Link,
  type Team,
} from '../lib/tenants';
import { secureStorage } from '../lib/secureStorage';

interface OrgCtx {
  orgId: string;
  org?: Org;
  members: ReturnType<typeof listMembers>;
  teams: Team[];
  links: Link[];
  seats: ReturnType<typeof getSeatsUsage>;
  settings: OrgSettings;
  refresh: () => void;
  updateSettings: (patch: Partial<OrgSettings>) => void;
}

const OrgContext = createContext<OrgCtx | null>(null);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [orgId, setOrgId] = useState<string>(() => { try { ensureDemoTenants(); return getCurrentOrgId(); } catch { return ''; } });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    const onTenant = (e: any) => { try { setOrgId(e?.detail?.id); setVersion(v => v + 1); } catch { } };
    const onSettings = () => setVersion(v => v + 1);
    const onMembers = () => setVersion(v => v + 1);
    const onTeams = () => setVersion(v => v + 1);
    const onLinks = () => setVersion(v => v + 1);
    window.addEventListener('tenant:changed' as any, onTenant);
    window.addEventListener('org:settingsUpdated' as any, onSettings);
    window.addEventListener('org:membersUpdated' as any, onMembers);
    window.addEventListener('org:teamsUpdated' as any, onTeams);
    window.addEventListener('org:linksUpdated' as any, onLinks);
    return () => {
      window.removeEventListener('tenant:changed' as any, onTenant);
      window.removeEventListener('org:settingsUpdated' as any, onSettings);
      window.removeEventListener('org:membersUpdated' as any, onMembers);
      window.removeEventListener('org:teamsUpdated' as any, onTeams);
      window.removeEventListener('org:linksUpdated' as any, onLinks);
    };
  }, []);

  const org = useMemo(() => {
    const foundOrg = getOrgById(orgId);
    if (foundOrg) return foundOrg;

    // For new users, create a temporary org based on onboarding data (ENCRYPTED)
    const isNewUser = secureStorage.getItem<string>('user:isNew') === 'true';
    if (isNewUser && orgId) {
      const businessType = secureStorage.getItem<string>('user:businessType') as 'artist' | 'agency' | 'venue' || 'artist';
      const companyName = secureStorage.getItem<string>('user:companyName') || secureStorage.getItem<string>('user:name') || 'My Organization';
      return {
        id: orgId,
        type: businessType,
        name: companyName,
        seatLimit: 10,
        guestLimit: 5
      };
    }

    return undefined;
  }, [orgId, version]);

  const members = useMemo(() => listMembers(orgId), [orgId, version]);
  const teams = useMemo(() => listTeams(orgId), [orgId, version]);
  const links = useMemo(() => listLinks(orgId), [orgId, version]);
  const seats = useMemo(() => getSeatsUsage(orgId), [orgId, version]);
  const settings = useMemo(() => getOrgSettings(orgId), [orgId, version]);

  const refresh = () => setVersion(v => v + 1);
  const updateSettings = (patch: Partial<OrgSettings>) => { try { upsertOrgSettings(orgId, patch); setVersion(v => v + 1); } catch { } };

  const value = useMemo(() => ({ orgId, org, members, teams, links, seats, settings, refresh, updateSettings }), [orgId, org, members, teams, links, seats, settings]);
  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within OrgProvider');
  return ctx;
}
