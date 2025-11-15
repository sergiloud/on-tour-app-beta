/**
 * Firestore Link Service - Agency-Artist relationship management
 * 
 * Handles the linking of agencies with artists, allowing:
 * - Agency to link with artist organizations
 * - Assign specific managers to manage each linked artist
 * - Define scopes/permissions for each link
 * - Real-time sync of link data
 * 
 * Data model:
 * - users/{userId}/links/{linkId} - Store links for each user
 * - Indexed by agencyOrgId and artistOrgId for efficient queries
 */

import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  onSnapshot,
  Timestamp,
  type Unsubscribe,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../lib/logger';

export interface LinkScopes {
  shows: 'read' | 'write';
  travel: 'read' | 'book';
  finance: 'none' | 'read' | 'export';
  calendar: 'read' | 'write';
  contacts: 'read' | 'write';
  contracts: 'read' | 'write';
}

export interface AgencyArtistLink {
  id: string;
  agencyOrgId: string;
  agencyOrgName: string;
  artistOrgId: string;
  artistOrgName: string;
  status: 'active' | 'inactive' | 'pending';
  scopes: LinkScopes;
  
  // Manager assignment
  assignedManagerId?: string;
  assignedManagerEmail?: string;
  assignedManagerName?: string;
  
  // Metadata
  createdAt: Date | Timestamp;
  createdBy: string;
  updatedAt: Date | Timestamp;
  updatedBy?: string;
}

export class FirestoreLinkService {
  /**
   * Create a new agency-artist link
   */
  static async createLink(
    userId: string,
    linkData: Omit<AgencyArtistLink, 'id' | 'createdAt' | 'updatedAt' | 'createdBy'>
  ): Promise<AgencyArtistLink> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linkId = `link_${linkData.agencyOrgId}_${linkData.artistOrgId}_${Date.now()}`;
    const linkRef = doc(db, `users/${userId}/links/${linkId}`);

    const link: AgencyArtistLink = {
      ...linkData,
      id: linkId,
      createdAt: serverTimestamp() as Timestamp,
      createdBy: userId,
      updatedAt: serverTimestamp() as Timestamp,
    };

    await setDoc(linkRef, link);
    
    logger.info('[FirestoreLinkService] Link created', { 
      linkId, 
      agencyOrgId: linkData.agencyOrgId, 
      artistOrgId: linkData.artistOrgId 
    });

    return link;
  }

  /**
   * Get a specific link by ID
   */
  static async getLink(userId: string, linkId: string): Promise<AgencyArtistLink | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linkRef = doc(db, `users/${userId}/links/${linkId}`);
    const linkSnap = await getDoc(linkRef);

    if (!linkSnap.exists()) {
      return null;
    }

    const data = linkSnap.data();
    return {
      ...data,
      id: linkSnap.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AgencyArtistLink;
  }

  /**
   * Get all links for a specific agency
   */
  static async getLinksByAgency(userId: string, agencyOrgId: string): Promise<AgencyArtistLink[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linksRef = collection(db, `users/${userId}/links`);
    const q = query(linksRef, where('agencyOrgId', '==', agencyOrgId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AgencyArtistLink;
    });
  }

  /**
   * Get all links for a specific artist
   */
  static async getLinksByArtist(userId: string, artistOrgId: string): Promise<AgencyArtistLink[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linksRef = collection(db, `users/${userId}/links`);
    const q = query(linksRef, where('artistOrgId', '==', artistOrgId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AgencyArtistLink;
    });
  }

  /**
   * Get all links assigned to a specific manager
   */
  static async getLinksByManager(userId: string, managerId: string): Promise<AgencyArtistLink[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linksRef = collection(db, `users/${userId}/links`);
    const q = query(linksRef, where('assignedManagerId', '==', managerId));
    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        updatedAt: data.updatedAt?.toDate() || new Date(),
      } as AgencyArtistLink;
    });
  }

  /**
   * Update link (assign manager, change scopes, etc)
   */
  static async updateLink(
    userId: string,
    linkId: string,
    updates: Partial<Omit<AgencyArtistLink, 'id' | 'createdAt' | 'createdBy'>>
  ): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linkRef = doc(db, `users/${userId}/links/${linkId}`);
    
    await setDoc(linkRef, {
      ...updates,
      updatedAt: serverTimestamp(),
      updatedBy: userId,
    }, { merge: true });

    logger.info('[FirestoreLinkService] Link updated', { linkId, updates });
  }

  /**
   * Assign manager to a link
   */
  static async assignManager(
    userId: string,
    linkId: string,
    managerId: string,
    managerEmail: string,
    managerName: string
  ): Promise<void> {
    await this.updateLink(userId, linkId, {
      assignedManagerId: managerId,
      assignedManagerEmail: managerEmail,
      assignedManagerName: managerName,
    });

    logger.info('[FirestoreLinkService] Manager assigned to link', { 
      linkId, 
      managerId, 
      managerName 
    });
  }

  /**
   * Remove manager from a link
   */
  static async unassignManager(userId: string, linkId: string): Promise<void> {
    await this.updateLink(userId, linkId, {
      assignedManagerId: undefined,
      assignedManagerEmail: undefined,
      assignedManagerName: undefined,
    });

    logger.info('[FirestoreLinkService] Manager unassigned from link', { linkId });
  }

  /**
   * Update link scopes/permissions
   */
  static async updateScopes(
    userId: string,
    linkId: string,
    scopes: Partial<LinkScopes>
  ): Promise<void> {
    const currentLink = await this.getLink(userId, linkId);
    if (!currentLink) {
      throw new Error('Link not found');
    }

    await this.updateLink(userId, linkId, {
      scopes: { ...currentLink.scopes, ...scopes },
    });

    logger.info('[FirestoreLinkService] Link scopes updated', { linkId, scopes });
  }

  /**
   * Delete a link
   */
  static async deleteLink(userId: string, linkId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linkRef = doc(db, `users/${userId}/links/${linkId}`);
    await deleteDoc(linkRef);

    logger.info('[FirestoreLinkService] Link deleted', { linkId });
  }

  /**
   * Subscribe to links for an agency (real-time)
   */
  static subscribeToAgencyLinks(
    userId: string,
    agencyOrgId: string,
    callback: (links: AgencyArtistLink[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linksRef = collection(db, `users/${userId}/links`);
    const q = query(linksRef, where('agencyOrgId', '==', agencyOrgId));

    return onSnapshot(
      q,
      (snapshot) => {
        const links = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as AgencyArtistLink;
        });
        callback(links);
      },
      (error) => {
        logger.error('[FirestoreLinkService] Error subscribing to agency links', error, { agencyOrgId });
      }
    );
  }

  /**
   * Subscribe to links for a manager (real-time)
   */
  static subscribeToManagerLinks(
    userId: string,
    managerId: string,
    callback: (links: AgencyArtistLink[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linksRef = collection(db, `users/${userId}/links`);
    const q = query(linksRef, where('assignedManagerId', '==', managerId));

    return onSnapshot(
      q,
      (snapshot) => {
        const links = snapshot.docs.map(doc => {
          const data = doc.data();
          return {
            ...data,
            id: doc.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            updatedAt: data.updatedAt?.toDate() || new Date(),
          } as AgencyArtistLink;
        });
        callback(links);
      },
      (error) => {
        logger.error('[FirestoreLinkService] Error subscribing to manager links', error, { managerId });
      }
    );
  }

  /**
   * Find a link between specific agency and artist
   */
  static async findLink(
    userId: string,
    agencyOrgId: string,
    artistOrgId: string
  ): Promise<AgencyArtistLink | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const linksRef = collection(db, `users/${userId}/links`);
    const q = query(
      linksRef,
      where('agencyOrgId', '==', agencyOrgId),
      where('artistOrgId', '==', artistOrgId)
    );
    
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const firstDoc = snapshot.docs[0];
    if (!firstDoc) {
      return null;
    }

    const data = firstDoc.data();
    
    return {
      ...data,
      id: firstDoc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      updatedAt: data.updatedAt?.toDate() || new Date(),
    } as AgencyArtistLink;
  }
}
