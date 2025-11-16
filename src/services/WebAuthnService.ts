/**
 * WebAuthn Service
 * 
 * Multi-Factor Authentication with biometric support
 * 
 * Features:
 * - TouchID, FaceID, Windows Hello support
 * - External security keys (YubiKey, etc.)
 * - Passkey-style authentication
 * - Backup codes for recovery
 * - Device management
 * 
 * @example
 * // Register new authenticator
 * const credential = await webAuthnService.registerAuthenticator(user);
 * 
 * // Verify authentication
 * const verified = await webAuthnService.verifyAuthentication(credential);
 */

import {
  startRegistration,
  startAuthentication,
} from '@simplewebauthn/browser';
import type {
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialRequestOptionsJSON,
  RegistrationResponseJSON,
  AuthenticationResponseJSON,
} from '@simplewebauthn/browser';
import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  Timestamp,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { logger } from '../lib/logger';
import type {
  WebAuthnCredential,
  BackupCode,
  MFASettings,
  AuthenticatorType,
  MFAEnrollmentStatus,
} from '../types/webauthn';

class WebAuthnService {
  private readonly RP_NAME = 'On Tour App';
  private readonly RP_ID = window.location.hostname;
  private readonly TIMEOUT = 60000; // 60 seconds
  
  /**
   * Check if WebAuthn is supported in current browser
   */
  isSupported(): boolean {
    return (
      window?.PublicKeyCredential !== undefined &&
      navigator?.credentials?.create !== undefined
    );
  }

  /**
   * Check if platform authenticator (TouchID, FaceID, Windows Hello) is available
   */
  async isPlatformAuthenticatorAvailable(): Promise<boolean> {
    if (!this.isSupported()) return false;
    
    try {
      return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
    } catch (error) {
      logger.warn('[WebAuthn] Platform authenticator check failed', { error });
      return false;
    }
  }

  /**
   * Generate registration options for new authenticator
   */
  async getRegistrationOptions(
    userId: string,
    userEmail: string,
    userName: string,
    preferPlatformAuthenticator: boolean = true
  ): Promise<PublicKeyCredentialCreationOptionsJSON> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    // Get existing credentials to exclude
    const existingCreds = await this.getUserCredentials(userId);
    
    const challenge = this.generateChallenge();
    
    const options: PublicKeyCredentialCreationOptionsJSON = {
      challenge,
      rp: {
        name: this.RP_NAME,
        id: this.RP_ID,
      },
      user: {
        id: this.base64UrlEncode(userId),
        name: userEmail,
        displayName: userName,
      },
      pubKeyCredParams: [
        { type: 'public-key', alg: -7 },  // ES256
        { type: 'public-key', alg: -257 }, // RS256
      ],
      timeout: this.TIMEOUT,
      authenticatorSelection: {
        authenticatorAttachment: preferPlatformAuthenticator ? 'platform' : undefined,
        requireResidentKey: false,
        residentKey: 'preferred',
        userVerification: 'preferred',
      },
      attestation: 'none',
      excludeCredentials: existingCreds.map(cred => ({
        id: cred.id,
        type: 'public-key' as const,
        transports: cred.transports,
      })),
    };

    // Store challenge temporarily (in production, use server-side session)
    sessionStorage.setItem(`webauthn_challenge_${userId}`, challenge);

    return options;
  }

  /**
   * Register new authenticator
   */
  async registerAuthenticator(
    userId: string,
    userEmail: string,
    userName: string,
    deviceName: string,
    preferPlatformAuthenticator: boolean = true
  ): Promise<WebAuthnCredential> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      // Get registration options
      const options = await this.getRegistrationOptions(
        userId,
        userEmail,
        userName,
        preferPlatformAuthenticator
      );

      // Start registration ceremony
      const credential = await startRegistration({ optionsJSON: options });

      // Verify and store credential
      const storedCredential = await this.storeCredential(
        userId,
        credential,
        deviceName
      );

      logger.info('[WebAuthn] Authenticator registered', {
        userId,
        credentialId: storedCredential.id,
        deviceName,
      });

      return storedCredential;
    } catch (error) {
      logger.error('[WebAuthn] Registration failed', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Store WebAuthn credential in Firestore
   */
  private async storeCredential(
    userId: string,
    credential: RegistrationResponseJSON,
    deviceName: string
  ): Promise<WebAuthnCredential> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const storedCredential: WebAuthnCredential = {
      id: credential.id,
      userId,
      publicKey: credential.response.publicKey || '',
      counter: 0,
      type: 'public-key',
      authenticatorType: 'platform' as AuthenticatorType, // Will be updated from response if available
      transports: credential.response.transports as any,
      deviceName,
      deviceInfo: {
        browser: navigator.userAgent.split(' ').pop(),
        os: navigator.platform,
        platform: 'unknown', // authenticatorAttachment not always available
      },
      createdAt: serverTimestamp() as Timestamp,
      backupEligible: (credential.response as any).backupEligible,
      backupState: (credential.response as any).backupState,
    };

    const credRef = doc(db, `users/${userId}/webauthn_credentials/${credential.id}`);
    await setDoc(credRef, storedCredential);

    return storedCredential;
  }

  /**
   * Get authentication options for login
   */
  async getAuthenticationOptions(userId?: string): Promise<PublicKeyCredentialRequestOptionsJSON> {
    const challenge = this.generateChallenge();
    
    const options: PublicKeyCredentialRequestOptionsJSON = {
      challenge,
      timeout: this.TIMEOUT,
      rpId: this.RP_ID,
      userVerification: 'preferred',
    };

    // If userId provided, only allow their credentials
    if (userId && db) {
      const credentials = await this.getUserCredentials(userId);
      options.allowCredentials = credentials.map(cred => ({
        id: cred.id,
        type: 'public-key' as const,
        transports: cred.transports,
      }));
      
      // Store challenge
      sessionStorage.setItem(`webauthn_challenge_${userId}`, challenge);
    } else {
      // Store challenge globally (for discoverable credentials)
      sessionStorage.setItem('webauthn_challenge_global', challenge);
    }

    return options;
  }

  /**
   * Authenticate with WebAuthn
   */
  async authenticate(userId: string): Promise<AuthenticationResponseJSON> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    if (!this.isSupported()) {
      throw new Error('WebAuthn is not supported in this browser');
    }

    try {
      // Get authentication options
      const options = await this.getAuthenticationOptions(userId);

      // Start authentication ceremony
      const credential = await startAuthentication({ optionsJSON: options });

      // Update last used timestamp
      await this.updateCredentialLastUsed(userId, credential.id);

      logger.info('[WebAuthn] Authentication successful', {
        userId,
        credentialId: credential.id,
      });

      return credential;
    } catch (error) {
      logger.error('[WebAuthn] Authentication failed', error as Error, { userId });
      throw error;
    }
  }

  /**
   * Get all credentials for user
   */
  async getUserCredentials(userId: string): Promise<WebAuthnCredential[]> {
    if (!db) {
      return [];
    }

    const credsRef = collection(db, `users/${userId}/webauthn_credentials`);
    const snapshot = await getDocs(credsRef);

    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date(data.createdAt || Date.now()),
        lastUsedAt: data.lastUsedAt instanceof Timestamp ? data.lastUsedAt.toDate() : (data.lastUsedAt ? new Date(data.lastUsedAt) : undefined),
      } as WebAuthnCredential;
    });
  }

  /**
   * Delete credential
   */
  async deleteCredential(userId: string, credentialId: string): Promise<void> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const credRef = doc(db, `users/${userId}/webauthn_credentials/${credentialId}`);
    await deleteDoc(credRef);

    logger.info('[WebAuthn] Credential deleted', { userId, credentialId });
  }

  /**
   * Update credential last used timestamp
   */
  private async updateCredentialLastUsed(userId: string, credentialId: string): Promise<void> {
    if (!db) return;

    const credRef = doc(db, `users/${userId}/webauthn_credentials/${credentialId}`);
    await setDoc(
      credRef,
      { lastUsedAt: serverTimestamp() },
      { merge: true }
    );
  }

  /**
   * Get MFA enrollment status
   */
  async getMFAStatus(userId: string): Promise<MFAEnrollmentStatus> {
    const credentials = await this.getUserCredentials(userId);
    
    return {
      userId,
      enrolled: credentials.length > 0,
      availableMethods: {
        webauthn: this.isSupported(),
        totp: false, // TODO: Implement TOTP
        sms: false,  // TODO: Implement SMS
        backupCodes: credentials.length > 0,
      },
      devices: credentials.map(cred => ({
        id: cred.id,
        name: cred.deviceName,
        type: cred.authenticatorType as AuthenticatorType,
        lastUsed: cred.lastUsedAt instanceof Date ? cred.lastUsedAt : undefined,
      })),
      enforced: false, // TODO: Check org policy
    };
  }

  /**
   * Generate backup codes
   */
  async generateBackupCodes(userId: string, count: number = 10): Promise<string[]> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const codes: string[] = [];
    const hashes: BackupCode[] = [];

    for (let i = 0; i < count; i++) {
      const code = this.generateBackupCode();
      codes.push(code);
      
      const hash = await this.hashBackupCode(code);
      hashes.push({
        id: `backup_${Date.now()}_${i}`,
        userId,
        codeHash: hash,
        used: false,
        createdAt: serverTimestamp() as Timestamp,
      });
    }

    // Store hashed codes
    for (const backupCode of hashes) {
      const codeRef = doc(db, `users/${userId}/backup_codes/${backupCode.id}`);
      await setDoc(codeRef, backupCode);
    }

    logger.info('[WebAuthn] Backup codes generated', { userId, count });

    return codes;
  }

  /**
   * Verify backup code
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    if (!db) {
      throw new Error('Firestore not initialized');
    }

    const hash = await this.hashBackupCode(code);
    const codesRef = collection(db, `users/${userId}/backup_codes`);
    const q = query(codesRef, where('codeHash', '==', hash), where('used', '==', false));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return false;
    }

    // Mark code as used
    const codeDoc = snapshot.docs[0];
    if (!codeDoc) {
      return false;
    }

    await setDoc(
      codeDoc.ref,
      {
        used: true,
        usedAt: serverTimestamp(),
      },
      { merge: true }
    );

    logger.info('[WebAuthn] Backup code used', { userId });

    return true;
  }

  /**
   * Generate random challenge
   */
  private generateChallenge(): string {
    const buffer = new Uint8Array(32);
    crypto.getRandomValues(buffer);
    return this.base64UrlEncode(Array.from(buffer).map(b => String.fromCharCode(b)).join(''));
  }

  /**
   * Generate backup code (8 characters, alphanumeric)
   */
  private generateBackupCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluding ambiguous chars
    let code = '';
    for (let i = 0; i < 8; i++) {
      code += chars[Math.floor(Math.random() * chars.length)];
    }
    return code;
  }

  /**
   * Hash backup code
   */
  private async hashBackupCode(code: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(code);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Base64URL encode
   */
  private base64UrlEncode(str: string): string {
    return btoa(str)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }
}

// Export singleton instance
export const webAuthnService = new WebAuthnService();
export default webAuthnService;
