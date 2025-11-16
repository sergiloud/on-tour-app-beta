/**
 * WebAuthn Types
 * 
 * Multi-Factor Authentication with biometric support
 * Supports TouchID, FaceID, Windows Hello, Security Keys
 */

import { Timestamp } from 'firebase/firestore';

/**
 * Authenticator device types
 */
export enum AuthenticatorType {
  PLATFORM = 'platform', // Built-in (TouchID, FaceID, Windows Hello)
  CROSS_PLATFORM = 'cross-platform', // External security keys (YubiKey, etc.)
}

/**
 * Authenticator transport methods
 */
export type AuthenticatorTransport = 'usb' | 'nfc' | 'ble' | 'internal';

/**
 * WebAuthn credential stored in Firestore
 */
export interface WebAuthnCredential {
  /** Credential ID (base64url encoded) */
  id: string;
  
  /** User ID this credential belongs to */
  userId: string;
  
  /** Organization ID (if org-specific MFA) */
  organizationId?: string;
  
  /** Public key (base64url encoded) */
  publicKey: string;
  
  /** Signature counter (prevents replay attacks) */
  counter: number;
  
  /** Credential type (always 'public-key' for WebAuthn) */
  type: 'public-key';
  
  /** Authenticator type */
  authenticatorType: AuthenticatorType;
  
  /** Transport methods supported */
  transports?: AuthenticatorTransport[];
  
  /** Device name (user-friendly) */
  deviceName: string;
  
  /** Device info (browser, OS, etc.) */
  deviceInfo?: {
    browser?: string;
    os?: string;
    platform?: string;
  };
  
  /** AAGUID (Authenticator Attestation GUID) */
  aaguid?: string;
  
  /** Credential creation timestamp */
  createdAt: Date | Timestamp;
  
  /** Last used timestamp */
  lastUsedAt?: Date | Timestamp;
  
  /** Whether this is a backup-eligible credential */
  backupEligible?: boolean;
  
  /** Whether credential is currently backed up */
  backupState?: boolean;
}

/**
 * MFA backup code
 */
export interface BackupCode {
  /** Code ID */
  id: string;
  
  /** User ID */
  userId: string;
  
  /** Organization ID (if org-specific) */
  organizationId?: string;
  
  /** Hashed backup code (never store plain text) */
  codeHash: string;
  
  /** Whether code has been used */
  used: boolean;
  
  /** When code was used */
  usedAt?: Date | Timestamp;
  
  /** Creation timestamp */
  createdAt: Date | Timestamp;
  
  /** Expiration timestamp (optional) */
  expiresAt?: Date | Timestamp;
}

/**
 * MFA settings for user
 */
export interface MFASettings {
  /** User ID */
  userId: string;
  
  /** Organization ID (if org-specific) */
  organizationId?: string;
  
  /** Whether MFA is enabled */
  enabled: boolean;
  
  /** Whether MFA is enforced (cannot be disabled) */
  enforced: boolean;
  
  /** Primary MFA method */
  primaryMethod: 'webauthn' | 'totp' | 'sms' | null;
  
  /** Backup methods available */
  backupMethods: ('webauthn' | 'totp' | 'sms' | 'backup_codes')[];
  
  /** Number of registered WebAuthn credentials */
  webauthnCredentialCount: number;
  
  /** Number of unused backup codes */
  backupCodesRemaining: number;
  
  /** Last MFA verification timestamp */
  lastVerifiedAt?: Date | Timestamp;
  
  /** Settings updated timestamp */
  updatedAt: Date | Timestamp;
}

/**
 * WebAuthn registration options (sent to client)
 */
export interface WebAuthnRegistrationOptions {
  /** Challenge (random bytes, base64url encoded) */
  challenge: string;
  
  /** Relying Party (your app) */
  rp: {
    name: string;
    id: string;
  };
  
  /** User info */
  user: {
    id: string; // base64url encoded user ID
    name: string; // email or username
    displayName: string;
  };
  
  /** Public key credential parameters */
  pubKeyCredParams: Array<{
    type: 'public-key';
    alg: number; // -7 (ES256), -257 (RS256)
  }>;
  
  /** Timeout in milliseconds */
  timeout: number;
  
  /** Authenticator selection criteria */
  authenticatorSelection?: {
    authenticatorAttachment?: 'platform' | 'cross-platform';
    requireResidentKey?: boolean;
    residentKey?: 'discouraged' | 'preferred' | 'required';
    userVerification?: 'discouraged' | 'preferred' | 'required';
  };
  
  /** Attestation preference */
  attestation?: 'none' | 'indirect' | 'direct' | 'enterprise';
  
  /** Exclude credentials (prevent re-registration) */
  excludeCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: AuthenticatorTransport[];
  }>;
}

/**
 * WebAuthn authentication options (sent to client)
 */
export interface WebAuthnAuthenticationOptions {
  /** Challenge (random bytes, base64url encoded) */
  challenge: string;
  
  /** Timeout in milliseconds */
  timeout: number;
  
  /** Relying Party ID */
  rpId: string;
  
  /** Allowed credentials (empty = allow any) */
  allowCredentials?: Array<{
    id: string;
    type: 'public-key';
    transports?: AuthenticatorTransport[];
  }>;
  
  /** User verification requirement */
  userVerification?: 'discouraged' | 'preferred' | 'required';
}

/**
 * WebAuthn verification result
 */
export interface WebAuthnVerificationResult {
  /** Whether verification succeeded */
  verified: boolean;
  
  /** Credential ID used */
  credentialId: string;
  
  /** New counter value */
  newCounter: number;
  
  /** Error message if failed */
  error?: string;
}

/**
 * MFA enrollment status
 */
export interface MFAEnrollmentStatus {
  /** User ID */
  userId: string;
  
  /** Whether any MFA is enrolled */
  enrolled: boolean;
  
  /** Available MFA methods */
  availableMethods: {
    webauthn: boolean;
    totp: boolean;
    sms: boolean;
    backupCodes: boolean;
  };
  
  /** Registered devices */
  devices: Array<{
    id: string;
    name: string;
    type: AuthenticatorType;
    lastUsed?: Date;
  }>;
  
  /** Whether MFA is enforced for this user */
  enforced: boolean;
  
  /** Enforcement reason */
  enforcementReason?: 'admin_role' | 'owner_role' | 'org_policy' | 'security_requirement';
}
