/**
 * Multi-Factor Authentication (MFA) Service
 * 
 * Implements MFA using Firebase Auth:
 * - Phone SMS verification
 * - TOTP (Time-based One-Time Password) authenticator apps
 * - Backup codes
 * - Enrollment management
 * - Verification flows
 * 
 * @see https://firebase.google.com/docs/auth/web/multi-factor
 */

import {
  multiFactor,
  PhoneAuthProvider,
  PhoneMultiFactorGenerator,
  TotpMultiFactorGenerator,
  TotpSecret,
  MultiFactorResolver,
  MultiFactorInfo,
  MultiFactorSession,
  RecaptchaVerifier,
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import type { User } from 'firebase/auth';

export type MFAMethod = 'sms' | 'totp';

export interface MFAEnrollmentResult {
  success: boolean;
  method: MFAMethod;
  displayName?: string;
  error?: string;
}

export interface MFAVerificationResult {
  success: boolean;
  error?: string;
}

export interface BackupCode {
  code: string;
  used: boolean;
  usedAt?: Date;
}

// ==========================================
// MFA Enrollment
// ==========================================

/**
 * Start phone MFA enrollment
 * 
 * @param user - Firebase user
 * @param phoneNumber - Phone number in E.164 format (+1234567890)
 * @param recaptchaContainer - ID of reCAPTCHA container element
 * @returns Verification ID for code verification
 */
export async function enrollPhoneMFA(
  user: User,
  phoneNumber: string,
  recaptchaContainer: string
): Promise<{ verificationId: string; session: MultiFactorSession }> {
  try {
    // Get MFA session
    const multiFactorUser = multiFactor(user);
    const session = await multiFactorUser.getSession();

    // Set up reCAPTCHA
    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
      size: 'invisible',
    });

    // Send verification code
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      {
        phoneNumber,
        session,
      },
      recaptchaVerifier
    );

    return { verificationId, session };
  } catch (error: any) {
    console.error('Error enrolling phone MFA:', error);
    throw new Error(error.message || 'Failed to enroll phone MFA');
  }
}

/**
 * Complete phone MFA enrollment with verification code
 * 
 * @param verificationId - ID from enrollPhoneMFA
 * @param verificationCode - 6-digit code from SMS
 * @param session - MFA session from enrollPhoneMFA
 * @param displayName - Display name for this MFA method
 */
export async function completePhoneMFAEnrollment(
  verificationId: string,
  verificationCode: string,
  session: MultiFactorSession,
  displayName: string = 'Phone'
): Promise<MFAEnrollmentResult> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Create credential
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

    // Enroll
    const multiFactorUser = multiFactor(user);
    await multiFactorUser.enroll(multiFactorAssertion, displayName);

    return {
      success: true,
      method: 'sms',
      displayName,
    };
  } catch (error: any) {
    console.error('Error completing phone MFA enrollment:', error);
    return {
      success: false,
      method: 'sms',
      error: error.message || 'Failed to complete phone MFA enrollment',
    };
  }
}

/**
 * Start TOTP (Authenticator App) MFA enrollment
 * 
 * @param user - Firebase user
 * @returns TOTP secret with QR code URL
 */
export async function enrollTOTPMFA(
  user: User
): Promise<{ secret: TotpSecret; qrCodeUrl: string; session: MultiFactorSession }> {
  try {
    const multiFactorUser = multiFactor(user);
    const session = await multiFactorUser.getSession();

    // Generate TOTP secret
    const totpSecret = await TotpMultiFactorGenerator.generateSecret(session);

    // Create QR code URL for authenticator apps
    const qrCodeUrl = totpSecret.generateQrCodeUrl(
      user.email || 'user@ontourapp.com',
      'On Tour App'
    );

    return { secret: totpSecret, qrCodeUrl, session };
  } catch (error: any) {
    console.error('Error enrolling TOTP MFA:', error);
    throw new Error(error.message || 'Failed to enroll TOTP MFA');
  }
}

/**
 * Complete TOTP MFA enrollment with verification code
 * 
 * @param totpSecret - Secret from enrollTOTPMFA
 * @param verificationCode - 6-digit code from authenticator app
 * @param displayName - Display name for this MFA method
 */
export async function completeTOTPMFAEnrollment(
  totpSecret: TotpSecret,
  verificationCode: string,
  displayName: string = 'Authenticator App'
): Promise<MFAEnrollmentResult> {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error('No user logged in');

    // Create assertion
    const multiFactorAssertion = TotpMultiFactorGenerator.assertionForEnrollment(
      totpSecret,
      verificationCode
    );

    // Enroll
    const multiFactorUser = multiFactor(user);
    await multiFactorUser.enroll(multiFactorAssertion, displayName);

    return {
      success: true,
      method: 'totp',
      displayName,
    };
  } catch (error: any) {
    console.error('Error completing TOTP MFA enrollment:', error);
    return {
      success: false,
      method: 'totp',
      error: error.message || 'Failed to complete TOTP MFA enrollment',
    };
  }
}

// ==========================================
// MFA Verification (Sign-in)
// ==========================================

/**
 * Verify phone MFA during sign-in
 * 
 * @param resolver - Multi-factor resolver from sign-in error
 * @param phoneInfoIndex - Index of phone factor in enrolledFactors
 * @param recaptchaContainer - ID of reCAPTCHA container element
 * @returns Verification ID for code entry
 */
export async function verifyPhoneMFA(
  resolver: MultiFactorResolver,
  phoneInfoIndex: number,
  recaptchaContainer: string
): Promise<string> {
  try {
    const phoneInfo = resolver.hints[phoneInfoIndex];
    
    // Set up reCAPTCHA
    const recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaContainer, {
      size: 'invisible',
    });

    // Send verification code
    const phoneAuthProvider = new PhoneAuthProvider(auth);
    const verificationId = await phoneAuthProvider.verifyPhoneNumber(
      {
        multiFactorHint: phoneInfo,
        session: resolver.session,
      },
      recaptchaVerifier
    );

    return verificationId;
  } catch (error: any) {
    console.error('Error verifying phone MFA:', error);
    throw new Error(error.message || 'Failed to send verification code');
  }
}

/**
 * Complete phone MFA verification with code
 * 
 * @param resolver - Multi-factor resolver from sign-in error
 * @param verificationId - ID from verifyPhoneMFA
 * @param verificationCode - 6-digit code from SMS
 */
export async function completePhoneMFAVerification(
  resolver: MultiFactorResolver,
  verificationId: string,
  verificationCode: string
): Promise<MFAVerificationResult> {
  try {
    const credential = PhoneAuthProvider.credential(verificationId, verificationCode);
    const multiFactorAssertion = PhoneMultiFactorGenerator.assertion(credential);

    await resolver.resolveSignIn(multiFactorAssertion);

    return { success: true };
  } catch (error: any) {
    console.error('Error completing phone MFA verification:', error);
    return {
      success: false,
      error: error.message || 'Invalid verification code',
    };
  }
}

/**
 * Complete TOTP MFA verification with code
 * 
 * @param resolver - Multi-factor resolver from sign-in error
 * @param totpInfoIndex - Index of TOTP factor in enrolledFactors
 * @param verificationCode - 6-digit code from authenticator app
 */
export async function completeTOTPMFAVerification(
  resolver: MultiFactorResolver,
  totpInfoIndex: number,
  verificationCode: string
): Promise<MFAVerificationResult> {
  try {
    const totpInfo = resolver.hints[totpInfoIndex];
    if (!totpInfo) throw new Error('TOTP factor not found');
    
    const multiFactorAssertion = TotpMultiFactorGenerator.assertionForSignIn(
      totpInfo.uid,
      verificationCode
    );

    await resolver.resolveSignIn(multiFactorAssertion);

    return { success: true };
  } catch (error: any) {
    console.error('Error completing TOTP MFA verification:', error);
    return {
      success: false,
      error: error.message || 'Invalid verification code',
    };
  }
}

// ==========================================
// MFA Management
// ==========================================

/**
 * Get enrolled MFA factors for user
 */
export function getEnrolledMFAFactors(user: User): MultiFactorInfo[] {
  return multiFactor(user).enrolledFactors;
}

/**
 * Unenroll (remove) an MFA factor
 * 
 * @param user - Firebase user
 * @param factorUid - UID of factor to remove
 */
export async function unenrollMFAFactor(
  user: User,
  factorUid: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const multiFactorUser = multiFactor(user);
    const factor = multiFactorUser.enrolledFactors.find(f => f.uid === factorUid);
    
    if (!factor) {
      throw new Error('MFA factor not found');
    }

    await multiFactorUser.unenroll(factor);

    return { success: true };
  } catch (error: any) {
    console.error('Error unenrolling MFA factor:', error);
    return {
      success: false,
      error: error.message || 'Failed to remove MFA factor',
    };
  }
}

/**
 * Check if user has MFA enabled
 */
export function isMFAEnabled(user: User): boolean {
  return multiFactor(user).enrolledFactors.length > 0;
}

/**
 * Get MFA method type
 */
export function getMFAMethod(factor: MultiFactorInfo): MFAMethod {
  return factor.factorId === 'phone' ? 'sms' : 'totp';
}

// ==========================================
// Backup Codes
// ==========================================

/**
 * Generate backup codes
 * 
 * @param count - Number of codes to generate (default: 10)
 * @returns Array of backup codes
 */
export function generateBackupCodes(count: number = 10): BackupCode[] {
  const codes: BackupCode[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Array.from({ length: 8 }, () => {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Exclude confusing chars
      return chars[Math.floor(Math.random() * chars.length)];
    }).join('');
    
    codes.push({
      code: `${code.slice(0, 4)}-${code.slice(4)}`, // Format: XXXX-XXXX
      used: false,
    });
  }
  
  return codes;
}

/**
 * Validate and mark backup code as used
 * 
 * @param codes - Array of backup codes
 * @param inputCode - Code entered by user
 * @returns Updated codes array or null if invalid
 */
export function validateBackupCode(
  codes: BackupCode[],
  inputCode: string
): BackupCode[] | null {
  const normalizedInput = inputCode.replace(/\s|-/g, '').toUpperCase();
  
  const codeIndex = codes.findIndex(
    c => !c.used && c.code.replace(/-/g, '') === normalizedInput
  );
  
  if (codeIndex === -1) {
    return null; // Invalid or already used
  }
  
  // Mark as used
  const updatedCodes = [...codes];
  const existingCode = updatedCodes[codeIndex];
  updatedCodes[codeIndex] = {
    code: existingCode.code,
    used: true,
    usedAt: new Date(),
  };
  
  return updatedCodes;
}

/**
 * Get remaining backup codes count
 */
export function getRemainingBackupCodes(codes: BackupCode[]): number {
  return codes.filter(c => !c.used).length;
}
