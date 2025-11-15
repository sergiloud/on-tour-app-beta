/**
 * Organization Management Hooks
 * 
 * Provides hooks for multi-tenancy organization management:
 * - Create, read, update, delete organizations
 * - Member management (invite, remove, change roles)
 * - Invitation system (send, accept, reject)
 * - Organization switching and context
 * 
 * Implements role-based access control (RBAC) with:
 * - owner: Full control, cannot be removed
 * - admin: Manage members, all data access
 * - member: Edit shows/finance, no member management
 * - viewer: Read-only access
 */

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  writeBatch,
  Timestamp,
  type Firestore,
  type DocumentData,
} from 'firebase/firestore';
import { db, auth } from '../lib/firebase';
import { createAuditLog } from './useAuditLogs';

// ========================================
// Types
// ========================================

export type OrganizationType = 'tour' | 'band' | 'venue' | 'agency';
export type MemberRole = 'owner' | 'admin' | 'finance' | 'member' | 'viewer';
export type InvitationStatus = 'pending' | 'accepted' | 'rejected' | 'expired';

// Granular permissions by module
export type Permission =
  // Finance module
  | 'finance.read' | 'finance.write' | 'finance.delete' | 'finance.export'
  // Shows module
  | 'shows.read' | 'shows.write' | 'shows.delete'
  // Calendar module
  | 'calendar.read' | 'calendar.write' | 'calendar.delete'
  // Travel module
  | 'travel.read' | 'travel.write' | 'travel.delete'
  // CRM/Contacts module
  | 'contacts.read' | 'contacts.write' | 'contacts.delete'
  // Contracts module
  | 'contracts.read' | 'contracts.write' | 'contracts.delete'
  // Members module
  | 'members.read' | 'members.invite' | 'members.remove' | 'members.manage_roles'
  // Settings module
  | 'settings.read' | 'settings.write'
  // Organization management
  | 'org.delete';

// Module access shortcuts for UI
export type ModuleAccess = {
  finance: 'none' | 'read' | 'write' | 'full';
  shows: 'none' | 'read' | 'write' | 'full';
  calendar: 'none' | 'read' | 'write' | 'full';
  travel: 'none' | 'read' | 'write' | 'full';
  contacts: 'none' | 'read' | 'write' | 'full';
  contracts: 'none' | 'read' | 'write' | 'full';
  members: 'none' | 'read' | 'manage';
  settings: 'none' | 'read' | 'write';
};

export interface Organization {
  id: string;
  name: string;
  type: OrganizationType;
  createdAt: Date;
  createdBy: string;
  settings: OrganizationSettings;
  metadata: OrganizationMetadata;
}

export interface OrganizationSettings {
  currency: string;
  timezone: string;
  defaultRole: MemberRole;
  locale: string;
  features: {
    finance: boolean;
    calendar: boolean;
    travel: boolean;
    crm: boolean;
  };
}

export interface OrganizationMetadata {
  startDate?: Date;
  endDate?: Date;
  description?: string;
  website?: string;
  avatar?: string;
  coverImage?: string;
}

export interface OrganizationMember {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: MemberRole;
  permissions: Permission[];
  joinedAt: Date;
  invitedBy: string;
  lastActive?: Date;
}

export interface Invitation {
  id: string;
  organizationId: string;
  organizationName: string;
  email: string;
  role: MemberRole;
  status: InvitationStatus;
  invitedBy: string;
  invitedByName: string;
  createdAt: Date;
  expiresAt: Date;
  acceptedAt?: Date;
  rejectedAt?: Date;
}

export interface OrganizationMembership {
  organizationId: string;
  organizationName: string;
  organizationType: OrganizationType;
  role: MemberRole;
  lastAccessed: Date;
  isFavorite: boolean;
}

// ========================================
// Permission Constants
// ========================================

export const ROLE_PERMISSIONS: Record<MemberRole, Permission[]> = {
  owner: [
    'finance.read', 'finance.write', 'finance.delete', 'finance.export',
    'shows.read', 'shows.write', 'shows.delete',
    'calendar.read', 'calendar.write', 'calendar.delete',
    'travel.read', 'travel.write', 'travel.delete',
    'contacts.read', 'contacts.write', 'contacts.delete',
    'contracts.read', 'contracts.write', 'contracts.delete',
    'members.read', 'members.invite', 'members.remove', 'members.manage_roles',
    'settings.read', 'settings.write',
    'org.delete',
  ],
  admin: [
    'finance.read', 'finance.write', 'finance.delete', 'finance.export',
    'shows.read', 'shows.write', 'shows.delete',
    'calendar.read', 'calendar.write', 'calendar.delete',
    'travel.read', 'travel.write', 'travel.delete',
    'contacts.read', 'contacts.write', 'contacts.delete',
    'contracts.read', 'contracts.write', 'contracts.delete',
    'members.read', 'members.invite', 'members.remove', 'members.manage_roles',
    'settings.read',
  ],
  finance: [
    // Finance manager: full finance access, read-only for other modules
    'finance.read', 'finance.write', 'finance.delete', 'finance.export',
    'shows.read',
    'calendar.read',
    'travel.read',
    'contacts.read',
    'contracts.read',
    'members.read',
    'settings.read',
  ],
  member: [
    // Regular member: can edit shows/calendar/travel, limited finance
    'finance.read',
    'shows.read', 'shows.write', 'shows.delete',
    'calendar.read', 'calendar.write', 'calendar.delete',
    'travel.read', 'travel.write', 'travel.delete',
    'contacts.read', 'contacts.write',
    'contracts.read', 'contracts.write',
    'members.read',
  ],
  viewer: [
    // Viewer: read-only access to all modules
    'finance.read',
    'shows.read',
    'calendar.read',
    'travel.read',
    'contacts.read',
    'contracts.read',
    'members.read',
  ],
};

// Role descriptions for UI
export const ROLE_DESCRIPTIONS: Record<MemberRole, { label: string; description: string; modules: string }> = {
  owner: {
    label: 'Owner',
    description: 'Full control, cannot be removed. Can delete organization.',
    modules: 'All modules (full access)',
  },
  admin: {
    label: 'Admin',
    description: 'Manage members, all data access. Cannot delete organization.',
    modules: 'All modules (full access)',
  },
  finance: {
    label: 'Finance Manager',
    description: 'Full finance access, read-only for other modules.',
    modules: 'Finance (full), Shows/Calendar/Travel (read)',
  },
  member: {
    label: 'Member',
    description: 'Can edit shows, calendar, travel. Read-only finance.',
    modules: 'Shows/Calendar/Travel (edit), Finance (read)',
  },
  viewer: {
    label: 'Viewer',
    description: 'Read-only access to all data.',
    modules: 'All modules (read-only)',
  },
};

// Helper function to check permissions
export function hasPermission(role: MemberRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}

// Helper function to get module access level
export function getModuleAccess(role: MemberRole): ModuleAccess {
  const permissions = ROLE_PERMISSIONS[role];
  
  const checkAccess = (module: string): 'none' | 'read' | 'write' | 'full' => {
    const hasRead = permissions.some(p => p.startsWith(`${module}.read`));
    const hasWrite = permissions.some(p => p.startsWith(`${module}.write`));
    const hasDelete = permissions.some(p => p.startsWith(`${module}.delete`));
    
    if (hasDelete && hasWrite && hasRead) return 'full';
    if (hasWrite && hasRead) return 'write';
    if (hasRead) return 'read';
    return 'none';
  };
  
  return {
    finance: checkAccess('finance'),
    shows: checkAccess('shows'),
    calendar: checkAccess('calendar'),
    travel: checkAccess('travel'),
    contacts: checkAccess('contacts'),
    contracts: checkAccess('contracts'),
    members: permissions.includes('members.manage_roles') ? 'manage' : 
             permissions.includes('members.read') ? 'read' : 'none',
    settings: permissions.includes('settings.write') ? 'write' :
              permissions.includes('settings.read') ? 'read' : 'none',
  };
}

// ========================================
// Helper Functions
// ========================================

function convertTimestampToDate(timestamp: any): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp?.toDate) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  return new Date(timestamp);
}

// ========================================
// useOrganizations Hook
// ========================================

export function useOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // auth already imported
  // db already imported
  const userId = auth?.currentUser?.uid;

  useEffect(() => {
    if (!db || !userId) {
      setIsLoading(false);
      return;
    }

    const fetchOrganizations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Get user's organization memberships (denormalized cache)
        const membershipsRef = collection(db, `users/${userId}/organization_memberships`);
        const membershipsSnap = await getDocs(membershipsRef);

        const orgIds = membershipsSnap.docs.map(doc => doc.id);

        if (orgIds.length === 0) {
          setOrganizations([]);
          setIsLoading(false);
          return;
        }

        // Fetch full organization data
        const orgPromises = orgIds.map(async (orgId) => {
          const orgRef = doc(db, `organizations/${orgId}`);
          const orgSnap = await getDoc(orgRef);

          if (!orgSnap.exists()) return null;

          const data = orgSnap.data() as DocumentData;
          return {
            id: orgSnap.id,
            name: data.name,
            type: data.type,
            createdAt: convertTimestampToDate(data.createdAt),
            createdBy: data.createdBy,
            settings: data.settings,
            metadata: data.metadata || {},
          } as Organization;
        });

        const orgs = (await Promise.all(orgPromises)).filter(Boolean) as Organization[];
        setOrganizations(orgs);
      } catch (err) {
        console.error('Error fetching organizations:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganizations();
  }, [db, userId]);

  return { organizations, isLoading, error };
}

// ========================================
// useOrganization Hook (single)
// ========================================

export function useOrganization(orgId: string | null) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // db already imported

  useEffect(() => {
    if (!db || !orgId) {
      setIsLoading(false);
      return;
    }

    const fetchOrganization = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const orgRef = doc(db, `organizations/${orgId}`);
        const orgSnap = await getDoc(orgRef);

        if (!orgSnap.exists()) {
          setOrganization(null);
          setIsLoading(false);
          return;
        }

        const data = orgSnap.data() as DocumentData;
        setOrganization({
          id: orgSnap.id,
          name: data.name,
          type: data.type,
          createdAt: convertTimestampToDate(data.createdAt),
          createdBy: data.createdBy,
          settings: data.settings,
          metadata: data.metadata || {},
        });
      } catch (err) {
        console.error('Error fetching organization:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrganization();
  }, [db, orgId]);

  return { organization, isLoading, error };
}

// ========================================
// useOrganizationMembers Hook
// ========================================

export function useOrganizationMembers(orgId: string | null) {
  const [members, setMembers] = useState<OrganizationMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // db already imported

  useEffect(() => {
    if (!db || !orgId) {
      setIsLoading(false);
      return;
    }

    const fetchMembers = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const membersRef = collection(db, `organizations/${orgId}/members`);
        const q = query(membersRef, orderBy('joinedAt', 'desc'));
        const membersSnap = await getDocs(q);

        const membersList = membersSnap.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            email: data.email,
            displayName: data.displayName,
            photoURL: data.photoURL,
            role: data.role,
            permissions: data.permissions || ROLE_PERMISSIONS[data.role as MemberRole],
            joinedAt: convertTimestampToDate(data.joinedAt),
            invitedBy: data.invitedBy,
            lastActive: data.lastActive ? convertTimestampToDate(data.lastActive) : undefined,
          } as OrganizationMember;
        });

        setMembers(membersList);
      } catch (err) {
        console.error('Error fetching members:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMembers();
  }, [db, orgId]);

  const updateMemberRole = useCallback(
    async (memberId: string, newRole: MemberRole) => {
      if (!db || !orgId) return;

      try {
        const memberRef = doc(db, `organizations/${orgId}/members/${memberId}`);
        const memberSnap = await getDoc(memberRef);
        const oldRole = memberSnap.data()?.role;
        
        await updateDoc(memberRef, {
          role: newRole,
          permissions: ROLE_PERMISSIONS[newRole],
          updatedAt: serverTimestamp(),
        });

        // Create audit log
        await createAuditLog(orgId, 'member.role_changed', {
          memberId,
          memberEmail: memberSnap.data()?.email,
          oldRole,
          newRole,
        });

        // Update local state
        setMembers((prev) =>
          prev.map((m) =>
            m.id === memberId
              ? { ...m, role: newRole, permissions: ROLE_PERMISSIONS[newRole] }
              : m
          )
        );
      } catch (err) {
        console.error('Error updating member role:', err);
        throw err;
      }
    },
    [db, orgId]
  );

  const removeMember = useCallback(
    async (memberId: string) => {
      if (!db || !orgId) return;

      try {
        const memberRef = doc(db, `organizations/${orgId}/members/${memberId}`);
        const memberSnap = await getDoc(memberRef);
        const memberData = memberSnap.data();
        
        await deleteDoc(memberRef);

        // Create audit log
        await createAuditLog(orgId, 'member.removed', {
          memberId,
          memberEmail: memberData?.email,
          memberRole: memberData?.role,
        });

        // Update local state
        setMembers((prev) => prev.filter((m) => m.id !== memberId));
      } catch (err) {
        console.error('Error removing member:', err);
        throw err;
      }
    },
    [db, orgId]
  );

  return { members, isLoading, error, updateMemberRole, removeMember };
}

// ========================================
// useInvitations Hook
// ========================================

export function useInvitations(orgId: string | null) {
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // db already imported
  // auth already imported

  useEffect(() => {
    if (!db || !orgId) {
      setIsLoading(false);
      return;
    }

    const fetchInvitations = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const invitesRef = collection(db, `organizations/${orgId}/invitations`);
        const q = query(
          invitesRef,
          where('status', '==', 'pending'),
          orderBy('createdAt', 'desc')
        );
        const invitesSnap = await getDocs(q);

        const invitesList = invitesSnap.docs.map((doc) => {
          const data = doc.data() as DocumentData;
          return {
            id: doc.id,
            organizationId: orgId,
            organizationName: data.organizationName,
            email: data.email,
            role: data.role,
            status: data.status,
            invitedBy: data.invitedBy,
            invitedByName: data.invitedByName,
            createdAt: convertTimestampToDate(data.createdAt),
            expiresAt: convertTimestampToDate(data.expiresAt),
            acceptedAt: data.acceptedAt ? convertTimestampToDate(data.acceptedAt) : undefined,
            rejectedAt: data.rejectedAt ? convertTimestampToDate(data.rejectedAt) : undefined,
          } as Invitation;
        });

        setInvitations(invitesList);
      } catch (err) {
        console.error('Error fetching invitations:', err);
        setError(err as Error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvitations();
  }, [db, orgId]);

  const inviteMember = useCallback(
    async (email: string, role: MemberRole, organizationName: string) => {
      if (!db || !orgId || !auth?.currentUser) return;

      try {
        const inviteRef = doc(collection(db, `organizations/${orgId}/invitations`));
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7 days expiration

        await setDoc(inviteRef, {
          organizationName,
          email,
          role,
          status: 'pending',
          invitedBy: auth.currentUser.uid,
          invitedByName: auth.currentUser.displayName || auth.currentUser.email,
          createdAt: serverTimestamp(),
          expiresAt: Timestamp.fromDate(expiresAt),
        });

        // Create audit log
        await createAuditLog(orgId, 'member.invited', {
          inviteId: inviteRef.id,
          email,
          role,
        });

        // TODO: Send invitation email via Cloud Function
        console.log(`Invitation sent to ${email} for ${organizationName}`);

        // Refresh invitations
        setInvitations((prev) => [
          {
            id: inviteRef.id,
            organizationId: orgId,
            organizationName,
            email,
            role,
            status: 'pending',
            invitedBy: auth.currentUser.uid,
            invitedByName: auth.currentUser.displayName || auth.currentUser.email || '',
            createdAt: new Date(),
            expiresAt,
          },
          ...prev,
        ]);
      } catch (err) {
        console.error('Error inviting member:', err);
        throw err;
      }
    },
    [db, orgId, auth]
  );

  const cancelInvitation = useCallback(
    async (inviteId: string) => {
      if (!db || !orgId) return;

      try {
        const inviteRef = doc(db, `organizations/${orgId}/invitations/${inviteId}`);
        await deleteDoc(inviteRef);

        // Update local state
        setInvitations((prev) => prev.filter((inv) => inv.id !== inviteId));
      } catch (err) {
        console.error('Error cancelling invitation:', err);
        throw err;
      }
    },
    [db, orgId]
  );

  return { invitations, isLoading, error, inviteMember, cancelInvitation };
}

// ========================================
// Organization CRUD Operations
// ========================================

export async function createOrganization(
  name: string,
  type: OrganizationType,
  settings?: Partial<OrganizationSettings>
): Promise<string> {
  // db already imported
  // auth already imported

  if (!db || !auth?.currentUser) {
    throw new Error('Not authenticated');
  }

  const batch = writeBatch(db);
  const orgRef = doc(collection(db, 'organizations'));
  const orgId = orgRef.id;

  // Create organization
  batch.set(orgRef, {
    name,
    type,
    createdAt: serverTimestamp(),
    createdBy: auth.currentUser.uid,
    settings: {
      currency: settings?.currency || 'USD',
      timezone: settings?.timezone || 'America/New_York',
      defaultRole: settings?.defaultRole || 'viewer',
      locale: settings?.locale || 'en',
      features: settings?.features || {
        finance: true,
        calendar: true,
        travel: true,
        crm: true,
      },
    },
    metadata: {},
  });

  // Add creator as owner
  const memberRef = doc(db, `organizations/${orgId}/members/${auth.currentUser.uid}`);
  batch.set(memberRef, {
    email: auth.currentUser.email,
    displayName: auth.currentUser.displayName || auth.currentUser.email,
    photoURL: auth.currentUser.photoURL,
    role: 'owner',
    permissions: ROLE_PERMISSIONS.owner,
    joinedAt: serverTimestamp(),
    invitedBy: auth.currentUser.uid,
  });

  // Create denormalized membership cache
  const membershipRef = doc(db, `users/${auth.currentUser.uid}/organization_memberships/${orgId}`);
  batch.set(membershipRef, {
    organizationName: name,
    organizationType: type,
    role: 'owner',
    lastAccessed: serverTimestamp(),
    isFavorite: true,
  });

  await batch.commit();

  console.log(`✅ Created organization ${orgId}: ${name}`);
  return orgId;
}

export async function updateOrganization(
  orgId: string,
  updates: Partial<Pick<Organization, 'name' | 'settings' | 'metadata'>>
): Promise<void> {
  // db already imported

  if (!db) {
    throw new Error('Database not initialized');
  }

  const orgRef = doc(db, `organizations/${orgId}`);
  await updateDoc(orgRef, {
    ...updates,
    updatedAt: serverTimestamp(),
  });

  console.log(`✅ Updated organization ${orgId}`);
}

export async function deleteOrganization(orgId: string): Promise<void> {
  // db already imported

  if (!db) {
    throw new Error('Database not initialized');
  }

  // TODO: Implement cascade delete for all sub-collections
  // This should be done via Cloud Function for safety
  const orgRef = doc(db, `organizations/${orgId}`);
  await deleteDoc(orgRef);

  console.log(`✅ Deleted organization ${orgId}`);
}

export async function acceptInvitation(inviteId: string, orgId: string): Promise<void> {
  // db already imported
  // auth already imported

  if (!db || !auth?.currentUser) {
    throw new Error('Not authenticated');
  }

  const batch = writeBatch(db);

  // Get invitation data
  const inviteRef = doc(db, `organizations/${orgId}/invitations/${inviteId}`);
  const inviteSnap = await getDoc(inviteRef);

  if (!inviteSnap.exists()) {
    throw new Error('Invitation not found');
  }

  const inviteData = inviteSnap.data();

  // Add user as member
  const memberRef = doc(db, `organizations/${orgId}/members/${auth.currentUser.uid}`);
  batch.set(memberRef, {
    email: auth.currentUser.email,
    displayName: auth.currentUser.displayName || auth.currentUser.email,
    photoURL: auth.currentUser.photoURL,
    role: inviteData.role,
    permissions: ROLE_PERMISSIONS[inviteData.role as MemberRole],
    joinedAt: serverTimestamp(),
    invitedBy: inviteData.invitedBy,
  });

  // Create denormalized membership cache
  const membershipRef = doc(db, `users/${auth.currentUser.uid}/organization_memberships/${orgId}`);
  batch.set(membershipRef, {
    organizationName: inviteData.organizationName,
    organizationType: 'tour', // TODO: Get from organization
    role: inviteData.role,
    lastAccessed: serverTimestamp(),
    isFavorite: false,
  });

  // Update invitation status
  batch.update(inviteRef, {
    status: 'accepted',
    acceptedAt: serverTimestamp(),
  });

  await batch.commit();

  console.log(`✅ Accepted invitation to organization ${orgId}`);
}

export async function rejectInvitation(inviteId: string, orgId: string): Promise<void> {
  // db already imported

  if (!db) {
    throw new Error('Database not initialized');
  }

  const inviteRef = doc(db, `organizations/${orgId}/invitations/${inviteId}`);
  await updateDoc(inviteRef, {
    status: 'rejected',
    rejectedAt: serverTimestamp(),
  });

  console.log(`✅ Rejected invitation ${inviteId}`);
}
