/**
 * Firestore Organization Service - Cloud sync for multi-tenant data
 * Handles organizations, memberships, teams
 * Data isolation: users/{userId}/organizations/{orgId}
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  onSnapshot,
  Timestamp,
  type Unsubscribe
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import auditLogService from './AuditLogService';
import { AuditAction, AuditCategory, AuditSeverity } from '../types/auditLog';

export interface OrgMembership {
  userId: string;
  role: 'owner' | 'admin' | 'member' | 'guest';
}

export interface OrgTeam {
  id: string;
  name: string;
  members: string[]; // userIds
}

export interface Organization {
  id: string;
  name: string;
  type: 'artist' | 'agency' | 'venue';
  seatLimit: number;
  guestLimit: number;
  memberships: OrgMembership[];
  teams: OrgTeam[];
  settings?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export class FirestoreOrgService {
  /**
   * Recursively remove undefined values from an object
   */
  private static removeUndefined(obj: any): any {
    if (obj === null || obj === undefined) {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj.map(item => this.removeUndefined(item));
    }
    if (typeof obj === 'object') {
      const cleaned: any = {};
      for (const key in obj) {
        const value = obj[key];
        if (value !== undefined) {
          cleaned[key] = this.removeUndefined(value);
        }
      }
      return cleaned;
    }
    return obj;
  }

  /**
   * Save organization to Firestore
   */
  static async saveOrganization(org: Organization, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const orgRef = doc(db, `users/${userId}/organizations/${org.id}`);
    const orgData = this.removeUndefined({
      ...org,
      updatedAt: Timestamp.now()
    });

    await setDoc(orgRef, orgData, { merge: true });
  }

  /**
   * Get single organization by ID
   */
  static async getOrganization(orgId: string, userId: string): Promise<Organization | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const orgRef = doc(db, `users/${userId}/organizations/${orgId}`);
    const orgSnap = await getDoc(orgRef);

    if (!orgSnap.exists()) {
      return null;
    }

    const data = orgSnap.data();
    return {
      ...data,
      id: orgSnap.id,
      createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
      updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
    } as Organization;
  }

  /**
   * Get all organizations for a user
   */
  static async getUserOrganizations(userId: string): Promise<Organization[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const orgsRef = collection(db, `users/${userId}/organizations`);
    const q = query(orgsRef, orderBy('createdAt', 'desc'));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
        updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
      } as Organization;
    });
  }

  /**
   * Update organization
   */
  static async updateOrganization(
    orgId: string,
    updates: Partial<Organization>,
    userId: string,
    userEmail?: string,
    userName?: string
  ): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const orgRef = doc(db, `users/${userId}/organizations/${orgId}`);
    
    // Get previous data for audit log
    const orgSnap = await getDoc(orgRef);
    const previousData = orgSnap.data();
    
    const orgData = this.removeUndefined({
      ...updates,
      updatedAt: Timestamp.now()
    });

    await setDoc(orgRef, orgData, { merge: true });

    // Audit log
    const changedFields = Object.keys(updates).filter(key => key !== 'updatedAt');
    await auditLogService.log({
      organizationId: orgId,
      category: AuditCategory.ORGANIZATION,
      action: AuditAction.ORG_UPDATED,
      severity: AuditSeverity.INFO,
      userId,
      userEmail: userEmail || '',
      userName: userName || '',
      entity: { type: 'organization', id: orgId, name: updates.name || previousData?.name || orgId },
      description: `Updated organization settings: ${changedFields.join(', ')}`,
      metadata: {
        changedFields,
        previousValue: changedFields.reduce((acc, field) => {
          acc[field] = previousData?.[field];
          return acc;
        }, {} as Record<string, any>),
        newValue: updates,
      },
      success: true,
    });
  }

  /**
   * Delete organization from Firestore
   */
  static async deleteOrganization(orgId: string, userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const orgRef = doc(db, `users/${userId}/organizations/${orgId}`);
    await deleteDoc(orgRef);
  }

  /**
   * Batch save multiple organizations (for migration/import)
   */
  static async saveOrganizations(orgs: Organization[], userId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const promises = orgs.map(org =>
      this.saveOrganization(org, userId)
    );

    await Promise.all(promises);
  }

  /**
   * Subscribe to real-time updates for user's organizations
   */
  static subscribeToUserOrganizations(
    userId: string,
    callback: (orgs: Organization[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const orgsRef = collection(db, `users/${userId}/organizations`);
    const q = query(orgsRef, orderBy('createdAt', 'desc'));

    return onSnapshot(q, (snapshot) => {
      const orgs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          ...data,
          id: doc.id,
          createdAt: data.createdAt?.toDate?.().toISOString() || data.createdAt,
          updatedAt: data.updatedAt?.toDate?.().toISOString() || data.updatedAt
        } as Organization;
      });

      callback(orgs);
    });
  }

  /**
   * Migrate localStorage organizations to Firestore
   * Only runs once per user (idempotent)
   */
  static async migrateFromLocalStorage(userId: string): Promise<number> {
    if (!db) {
      return 0;
    }

    try {
      // Check if user already has organizations in Firestore
      const existing = await this.getUserOrganizations(userId);
      if (existing.length > 0) {
        return 0; // Already migrated
      }

      // Load organizations from secureStorage (tenants.ts)
      const { secureStorage } = await import('../lib/secureStorage');
      const orgsData = secureStorage.getItem<any[]>('tenants:orgs');
      const membershipsData = secureStorage.getItem<any[]>('tenants:memberships');
      const teamsData = secureStorage.getItem<any[]>('tenants:teams');

      if (!orgsData || orgsData.length === 0) {
        return 0;
      }

      // Convert to Organization format
      const organizations: Organization[] = orgsData.map(org => ({
        id: org.id,
        name: org.name,
        type: org.type,
        seatLimit: org.seatLimit || 10,
        guestLimit: org.guestLimit || 5,
        memberships: membershipsData?.filter(m => m.orgId === org.id).map(m => ({
          userId: m.userId,
          role: m.role
        })) || [],
        teams: teamsData?.filter(t => t.orgId === org.id).map(t => ({
          id: t.id,
          name: t.name,
          members: t.members || []
        })) || [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }));

      // Migrate organizations to Firestore
      await this.saveOrganizations(organizations, userId);

      return organizations.length;
    } catch (error) {
      console.error('❌ Failed to migrate organizations:', error);
      return 0;
    }
  }
}
