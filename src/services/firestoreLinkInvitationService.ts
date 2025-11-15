/**
 * Firestore Link Invitation Service
 * 
 * Handles invitations for agency-artist links.
 * When an agency wants to link with an artist, they send an invitation
 * using the artist's User ID. The artist can then accept or reject.
 * 
 * Data model:
 * - users/{artistUserId}/linkInvitations/{invitationId} - Artist receives invitations
 * - users/{agencyUserId}/sentLinkInvitations/{invitationId} - Agency tracks sent invitations
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
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../lib/logger';
import { FirestoreLinkService, type LinkScopes } from './firestoreLinkService';

export interface LinkInvitation {
  id: string;
  
  // Agency info (sender)
  agencyUserId: string;
  agencyOrgId: string;
  agencyOrgName: string;
  agencyUserName: string;
  agencyUserEmail: string;
  
  // Artist info (recipient)
  artistUserId: string;
  artistOrgId?: string; // May not be known yet
  artistOrgName?: string;
  
  // Invitation details
  message?: string;
  proposedScopes: LinkScopes;
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled';
  
  // Timestamps
  createdAt: Date | Timestamp;
  respondedAt?: Date | Timestamp;
  expiresAt: Date | Timestamp;
}

export class FirestoreLinkInvitationService {
  /**
   * Send a link invitation from agency to artist
   */
  static async sendInvitation(
    agencyUserId: string,
    agencyOrgId: string,
    agencyOrgName: string,
    agencyUserName: string,
    agencyUserEmail: string,
    artistUserId: string,
    message?: string
  ): Promise<LinkInvitation> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Check if invitation already exists
    const existingInvitation = await this.findPendingInvitation(agencyUserId, artistUserId);
    if (existingInvitation) {
      throw new Error('Invitation already sent to this artist');
    }

    const invitationId = `linkinv_${agencyOrgId}_${artistUserId}_${Date.now()}`;
    
    // Expiration: 30 days from now
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const invitation: LinkInvitation = {
      id: invitationId,
      agencyUserId,
      agencyOrgId,
      agencyOrgName,
      agencyUserName,
      agencyUserEmail,
      artistUserId,
      message,
      proposedScopes: {
        shows: 'write',
        travel: 'book',
        finance: 'read',
        calendar: 'write',
        contacts: 'write',
        contracts: 'read',
      },
      status: 'pending',
      createdAt: serverTimestamp() as Timestamp,
      expiresAt: Timestamp.fromDate(expiresAt),
    };

    // Save to artist's inbox
    const artistInvitationRef = doc(db, `users/${artistUserId}/linkInvitations/${invitationId}`);
    await setDoc(artistInvitationRef, invitation);

    // Save to agency's sent invitations
    const agencySentRef = doc(db, `users/${agencyUserId}/sentLinkInvitations/${invitationId}`);
    await setDoc(agencySentRef, invitation);

    logger.info('[LinkInvitationService] Invitation sent', {
      invitationId,
      agencyOrgId,
      artistUserId,
    });

    return invitation;
  }

  /**
   * Get all invitations received by an artist
   */
  static async getReceivedInvitations(artistUserId: string): Promise<LinkInvitation[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const invitationsRef = collection(db, `users/${artistUserId}/linkInvitations`);
    const snapshot = await getDocs(invitationsRef);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        respondedAt: data.respondedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate() || new Date(),
      } as LinkInvitation;
    });
  }

  /**
   * Get all invitations sent by an agency
   */
  static async getSentInvitations(agencyUserId: string): Promise<LinkInvitation[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const invitationsRef = collection(db, `users/${agencyUserId}/sentLinkInvitations`);
    const snapshot = await getDocs(invitationsRef);

    return snapshot.docs.map((docSnap) => {
      const data = docSnap.data();
      return {
        ...data,
        id: docSnap.id,
        createdAt: data.createdAt?.toDate() || new Date(),
        respondedAt: data.respondedAt?.toDate(),
        expiresAt: data.expiresAt?.toDate() || new Date(),
      } as LinkInvitation;
    });
  }

  /**
   * Find pending invitation between agency and artist
   */
  static async findPendingInvitation(
    agencyUserId: string,
    artistUserId: string
  ): Promise<LinkInvitation | null> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const invitationsRef = collection(db, `users/${artistUserId}/linkInvitations`);
    const q = query(
      invitationsRef,
      where('agencyUserId', '==', agencyUserId),
      where('status', '==', 'pending')
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const doc = snapshot.docs[0];
    if (!doc) return null;

    const data = doc.data();
    return {
      ...data,
      id: doc.id,
      createdAt: data.createdAt?.toDate() || new Date(),
      respondedAt: data.respondedAt?.toDate(),
      expiresAt: data.expiresAt?.toDate() || new Date(),
    } as LinkInvitation;
  }

  /**
   * Accept a link invitation (artist accepts)
   */
  static async acceptInvitation(
    artistUserId: string,
    invitationId: string,
    artistOrgId: string,
    artistOrgName: string
  ): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Get the invitation
    const invitationRef = doc(db, `users/${artistUserId}/linkInvitations/${invitationId}`);
    const invitationSnap = await getDoc(invitationRef);

    if (!invitationSnap.exists()) {
      throw new Error('Invitation not found');
    }

    const invitation = invitationSnap.data() as LinkInvitation;

    // Check if expired
    const expiresAt = invitation.expiresAt instanceof Timestamp 
      ? invitation.expiresAt.toDate() 
      : new Date(invitation.expiresAt);

    if (expiresAt < new Date()) {
      throw new Error('Invitation has expired');
    }

    // Create the actual link
    await FirestoreLinkService.createLink(artistUserId, {
      agencyOrgId: invitation.agencyOrgId,
      agencyOrgName: invitation.agencyOrgName,
      artistOrgId,
      artistOrgName,
      status: 'active',
      scopes: invitation.proposedScopes,
    });

    // Update invitation status
    const updatedInvitation = {
      status: 'accepted',
      respondedAt: serverTimestamp(),
      artistOrgId,
      artistOrgName,
    };

    await setDoc(invitationRef, updatedInvitation, { merge: true });

    // Update in agency's sent invitations
    const agencySentRef = doc(db, `users/${invitation.agencyUserId}/sentLinkInvitations/${invitationId}`);
    await setDoc(agencySentRef, updatedInvitation, { merge: true });

    logger.info('[LinkInvitationService] Invitation accepted', {
      invitationId,
      artistOrgId,
      artistOrgName,
    });
  }

  /**
   * Reject a link invitation (artist rejects)
   */
  static async rejectInvitation(artistUserId: string, invitationId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const invitationRef = doc(db, `users/${artistUserId}/linkInvitations/${invitationId}`);
    const invitationSnap = await getDoc(invitationRef);

    if (!invitationSnap.exists()) {
      throw new Error('Invitation not found');
    }

    const invitation = invitationSnap.data() as LinkInvitation;

    // Update invitation status
    const updatedInvitation = {
      status: 'rejected',
      respondedAt: serverTimestamp(),
    };

    await setDoc(invitationRef, updatedInvitation, { merge: true });

    // Update in agency's sent invitations
    const agencySentRef = doc(db, `users/${invitation.agencyUserId}/sentLinkInvitations/${invitationId}`);
    await setDoc(agencySentRef, updatedInvitation, { merge: true });

    logger.info('[LinkInvitationService] Invitation rejected', { invitationId });
  }

  /**
   * Cancel a sent invitation (agency cancels)
   */
  static async cancelInvitation(agencyUserId: string, invitationId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const agencySentRef = doc(db, `users/${agencyUserId}/sentLinkInvitations/${invitationId}`);
    const invitationSnap = await getDoc(agencySentRef);

    if (!invitationSnap.exists()) {
      throw new Error('Invitation not found');
    }

    const invitation = invitationSnap.data() as LinkInvitation;

    // Update status to cancelled
    const updatedInvitation = {
      status: 'cancelled',
      respondedAt: serverTimestamp(),
    };

    await setDoc(agencySentRef, updatedInvitation, { merge: true });

    // Update in artist's inbox
    const artistInvitationRef = doc(db, `users/${invitation.artistUserId}/linkInvitations/${invitationId}`);
    await setDoc(artistInvitationRef, updatedInvitation, { merge: true });

    logger.info('[LinkInvitationService] Invitation cancelled', { invitationId });
  }

  /**
   * Subscribe to received invitations (artist)
   */
  static subscribeToReceivedInvitations(
    artistUserId: string,
    callback: (invitations: LinkInvitation[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const invitationsRef = collection(db, `users/${artistUserId}/linkInvitations`);

    return onSnapshot(
      invitationsRef,
      (snapshot: any) => {
        const invitations = snapshot.docs.map((docSnap: any) => {
          const data = docSnap.data();
          return {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            respondedAt: data.respondedAt?.toDate(),
            expiresAt: data.expiresAt?.toDate() || new Date(),
          } as LinkInvitation;
        });
        callback(invitations);
      },
      (error: Error) => {
        logger.error('[LinkInvitationService] Error subscribing to received invitations', error);
      }
    );
  }

  /**
   * Subscribe to sent invitations (agency)
   */
  static subscribeToSentInvitations(
    agencyUserId: string,
    callback: (invitations: LinkInvitation[]) => void
  ): Unsubscribe {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const invitationsRef = collection(db, `users/${agencyUserId}/sentLinkInvitations`);

    return onSnapshot(
      invitationsRef,
      (snapshot: any) => {
        const invitations = snapshot.docs.map((docSnap: any) => {
          const data = docSnap.data();
          return {
            ...data,
            id: docSnap.id,
            createdAt: data.createdAt?.toDate() || new Date(),
            respondedAt: data.respondedAt?.toDate(),
            expiresAt: data.expiresAt?.toDate() || new Date(),
          } as LinkInvitation;
        });
        callback(invitations);
      },
      (error: Error) => {
        logger.error('[LinkInvitationService] Error subscribing to sent invitations', error);
      }
    );
  }

  /**
   * Delete an invitation (cleanup after acceptance/rejection)
   */
  static async deleteInvitation(userId: string, invitationId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Try both paths (artist and agency)
    const artistRef = doc(db, `users/${userId}/linkInvitations/${invitationId}`);
    const agencyRef = doc(db, `users/${userId}/sentLinkInvitations/${invitationId}`);

    try {
      await deleteDoc(artistRef);
    } catch {
      // May not exist in this path
    }

    try {
      await deleteDoc(agencyRef);
    } catch {
      // May not exist in this path
    }

    logger.info('[LinkInvitationService] Invitation deleted', { invitationId });
  }
}
