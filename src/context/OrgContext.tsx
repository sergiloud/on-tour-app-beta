import React, { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
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
  setCurrentOrgId,
  type Org,
  type OrgSettings,
  type Link,
  type Team,
} from '../lib/tenants';
import { secureStorage } from '../lib/secureStorage';
import { useAuth } from './AuthContext';

// ============================================================================
// PROFESSIONAL PERMISSION SYSTEM
// ============================================================================

export type Permission = 
  | 'read:org' 
  | 'write:org' 
  | 'admin:org'
  | 'read:members' 
  | 'write:members'
  | 'read:settings'
  | 'write:settings'
  | 'read:teams'
  | 'write:teams'
  | 'read:links'
  | 'write:links';

type MemberRole = 'owner' | 'manager';

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
  // Professional permission system
  currentRole: MemberRole | null;
  hasPermission: (permission: Permission) => boolean;
  rolePermissions: Record<MemberRole, Permission[]>;
}

const OrgContext = createContext<OrgCtx | null>(null);

export const OrgProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { userId } = useAuth();
  const [orgId, setOrgId] = useState<string>(() => { try { ensureDemoTenants(); return getCurrentOrgId(); } catch { return ''; } });
  const [version, setVersion] = useState(0);
  const [firestoreLoaded, setFirestoreLoaded] = useState(false);

  // Load orgs from Firestore if localStorage is empty
  useEffect(() => {
    if (!userId || firestoreLoaded) return;
    
    const currentOrg = getOrgById(orgId);
    
    // If we have an orgId but no org data, try loading from Firestore
    if (orgId && !currentOrg) {
      console.log('[OrgContext] No org found in localStorage, loading from Firestore...');
      
      import('../services/firestoreOrgService').then(async ({ FirestoreOrgService }) => {
        try {
          const orgs = await FirestoreOrgService.getUserOrganizations(userId);
          
          if (orgs.length > 0) {
            console.log(`[OrgContext] Loaded ${orgs.length} organizations from Firestore`);
            
            // Sync to localStorage
            const K_ORGS = 'demo:orgs';
            const existingOrgs = secureStorage.getItem<Org[]>(K_ORGS) || [];
            const mergedOrgs = [...existingOrgs];
            
            orgs.forEach(fsOrg => {
              const localOrg: Org = {
                id: fsOrg.id,
                type: fsOrg.type,
                name: fsOrg.name,
                seatLimit: fsOrg.seatLimit,
                guestLimit: fsOrg.guestLimit
              };
              
              const existingIndex = mergedOrgs.findIndex(o => o.id === fsOrg.id);
              if (existingIndex >= 0) {
                mergedOrgs[existingIndex] = localOrg;
              } else {
                mergedOrgs.push(localOrg);
              }
            });
            
            secureStorage.setItem(K_ORGS, mergedOrgs);
            
            // Set current org if not set OR if current org doesn't exist in loaded orgs
            const firstOrg = orgs[0];
            const currentOrgExists = mergedOrgs.some(o => o.id === orgId);
            
            if (firstOrg && (!orgId || !currentOrgExists)) {
              console.log(`[OrgContext] Setting current org to ${firstOrg.id} (previous: ${orgId})`);
              setCurrentOrgId(firstOrg.id);
              setOrgId(firstOrg.id);
            }
            
            setVersion(v => v + 1);
            setFirestoreLoaded(true);
          } else {
            console.log('[OrgContext] No organizations found in Firestore');
            setFirestoreLoaded(true);
          }
        } catch (err) {
          console.error('[OrgContext] Failed to load from Firestore:', err);
          setFirestoreLoaded(true);
        }
      });
    } else {
      setFirestoreLoaded(true);
    }
  }, [userId, orgId, firestoreLoaded]);

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

  // Professional memoization: compute data only when dependencies change
  const members = useMemo(() => listMembers(orgId), [orgId, version]);
  const teams = useMemo(() => listTeams(orgId), [orgId, version]);
  const links = useMemo(() => listLinks(orgId), [orgId, version]);
  const seats = useMemo(() => getSeatsUsage(orgId), [orgId, version]);
  const settings = useMemo(() => getOrgSettings(orgId), [orgId, version]);

  // ============================================================================
  // PROFESSIONAL PERMISSION SYSTEM IMPLEMENTATION
  // ============================================================================

  // Memoized role permissions to prevent recreation on every render
  const rolePermissions = useMemo((): Record<MemberRole, Permission[]> => ({
    owner: [
      'read:org', 'write:org', 'admin:org',
      'read:members', 'write:members',
      'read:settings', 'write:settings',
      'read:teams', 'write:teams',
      'read:links', 'write:links'
    ],
    manager: [
      'read:org', 'write:org',
      'read:members',
      'read:settings',
      'read:teams', 'write:teams',
      'read:links', 'write:links'
    ]
  }), []);

  // Get current user's role in this organization
  const currentRole = useMemo((): MemberRole | null => {
    if (!userId || !orgId) return null;
    const member = members.find(m => m.user?.id === userId);
    return member?.role || null;
  }, [userId, orgId, members]);

  // Professional permission check with memoized lookup
  const hasPermission = useCallback((permission: Permission): boolean => {
    if (!currentRole) return false;
    return rolePermissions[currentRole]?.includes(permission) || false;
  }, [currentRole, rolePermissions]);

  // Optimized callback functions to prevent unnecessary re-renders
  const refresh = useCallback(() => setVersion(v => v + 1), []);
  const updateSettings = useCallback((patch: Partial<OrgSettings>) => { 
    try { 
      upsertOrgSettings(orgId, patch); 
      setVersion(v => v + 1); 
    } catch (error) { 
      console.error('Failed to update org settings:', error);
    } 
  }, [orgId]);

  // Comprehensive value object with all optimizations
  const value = useMemo(() => ({ 
    orgId, 
    org, 
    members, 
    teams, 
    links, 
    seats, 
    settings, 
    refresh, 
    updateSettings,
    currentRole,
    hasPermission,
    rolePermissions
  }), [
    orgId, 
    org, 
    members, 
    teams, 
    links, 
    seats, 
    settings, 
    refresh, 
    updateSettings, 
    currentRole, 
    hasPermission, 
    rolePermissions
  ]);
  return <OrgContext.Provider value={value}>{children}</OrgContext.Provider>;
};

export function useOrg() {
  const ctx = useContext(OrgContext);
  if (!ctx) throw new Error('useOrg must be used within OrgProvider');
  return ctx;
}
