/**
 * Key Derivation Module
 *
 * SECURITY: Implements PBKDF2 key derivation using Web Crypto API (crypto.subtle)
 * This is Phase 2 of security improvements after HttpOnly cookies.
 *
 * Usage:
 * 1. Server sends salt after login
 * 2. Client derives encryption key from password+salt
 * 3. Key used for AES-GCM encryption (not AES-CBC)
 * 4. Derived key never stored, regenerated on demand
 *
 * Benefits over static key:
 * - Unique per user (salt-based)
 * - Computationally expensive to brute-force (100,000 iterations)
 * - Industry standard (PBKDF2)
 * - Uses native Web Crypto API (hardware-accelerated)
 */

/**
 * Configuration for PBKDF2 key derivation
 */
const PBKDF2_CONFIG = {
  iterations: 100_000,        // NIST recommends 100,000+ (2024)
  hash: 'SHA-256' as const,   // Secure hash algorithm
  saltLength: 32,              // 32 bytes = 256 bits
  keyLength: 32,               // 32 bytes = 256 bits for AES-256
} as const;

/**
 * Generate a cryptographically secure random salt
 * @returns Base64-encoded salt
 */
export async function generateSalt(): Promise<string> {
  const saltBuffer = crypto.getRandomValues(new Uint8Array(PBKDF2_CONFIG.saltLength));
  return bufferToBase64(saltBuffer);
}

/**
 * Derive an encryption key from a password using PBKDF2
 *
 * @param password - User password or master key
 * @param salt - Base64-encoded salt (from server)
 * @returns Derived CryptoKey for AES-GCM encryption
 *
 * @example
 * ```typescript
 * const salt = await generateSalt(); // Server generates
 * const key = await deriveKey('userPassword', salt);
 * // key can now be used for AES-GCM encryption
 * ```
 */
export async function deriveKey(
  password: string,
  salt: string
): Promise<CryptoKey> {
  // Validate inputs
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (!salt || salt.length < 12) {
    throw new Error('Invalid salt');
  }

  try {
    // Step 1: Import password as raw key material
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveKey', 'deriveBits']
    );

    // Step 2: Decode salt from base64
    const saltBuffer = base64ToBuffer(salt);

    // Step 3: Derive key using PBKDF2
    const derivedKey = await crypto.subtle.deriveKey(
      {
        name: 'PBKDF2',
        hash: PBKDF2_CONFIG.hash,
        salt: saltBuffer as BufferSource,
        iterations: PBKDF2_CONFIG.iterations,
      },
      passwordKey,
      { name: 'AES-GCM', length: PBKDF2_CONFIG.keyLength * 8 },
      false, // Not extractable (stays in secure enclave)
      ['encrypt', 'decrypt'] as const
    );

    return derivedKey;
  } catch (error) {
    throw new Error(`Key derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Derive bits (raw key material) instead of a CryptoKey
 * Useful for comparing keys or exporting (with caution)
 *
 * @param password - User password
 * @param salt - Base64-encoded salt
 * @returns Base64-encoded derived key material
 */
export async function deriveBits(
  password: string,
  salt: string
): Promise<string> {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters');
  }
  if (!salt) {
    throw new Error('Invalid salt');
  }

  try {
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(password),
      'PBKDF2',
      false,
      ['deriveBits']
    );

    const saltBuffer = base64ToBuffer(salt);

    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        hash: PBKDF2_CONFIG.hash,
        salt: saltBuffer as BufferSource,
        iterations: PBKDF2_CONFIG.iterations,
      },
      passwordKey,
      PBKDF2_CONFIG.keyLength * 8
    );

    return bufferToBase64(new Uint8Array(derivedBits));
  } catch (error) {
    throw new Error(`Bit derivation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Encrypt data using AES-GCM with a derived key
 *
 * @param plaintext - Data to encrypt
 * @param key - CryptoKey from deriveKey()
 * @param iv - Optional IV. If not provided, random 96-bit IV is generated
 * @returns Object with iv and ciphertext (both base64-encoded)
 *
 * @example
 * ```typescript
 * const key = await deriveKey(password, salt);
 * const { iv, ciphertext } = await encryptWithKey('sensitive data', key);
 * localStorage.setItem('encrypted', JSON.stringify({ iv, ciphertext }));
 * ```
 */
export async function encryptWithKey(
  plaintext: string,
  key: CryptoKey,
  iv?: Uint8Array
): Promise<{ iv: string; ciphertext: string }> {
  try {
    // Generate random IV if not provided (96-bit = 12 bytes for GCM)
    const finalIv = iv || crypto.getRandomValues(new Uint8Array(12));

    const ciphertext = await crypto.subtle.encrypt(
      {
        name: 'AES-GCM',
        iv: finalIv as BufferSource,
      },
      key,
      new TextEncoder().encode(plaintext)
    );

    return {
      iv: bufferToBase64(finalIv),
      ciphertext: bufferToBase64(new Uint8Array(ciphertext)),
    };
  } catch (error) {
    throw new Error(`Encryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Decrypt data encrypted with encryptWithKey()
 *
 * @param ciphertext - Base64-encoded ciphertext
 * @param key - CryptoKey from deriveKey()
 * @param iv - Base64-encoded IV
 * @returns Decrypted plaintext
 *
 * @example
 * ```typescript
 * const key = await deriveKey(password, salt);
 * const data = JSON.parse(localStorage.getItem('encrypted'));
 * const plaintext = await decryptWithKey(data.ciphertext, key, data.iv);
 * ```
 */
export async function decryptWithKey(
  ciphertext: string,
  key: CryptoKey,
  iv: string
): Promise<string> {
  try {
    const ciphertextBuffer = base64ToBuffer(ciphertext);
    const ivBuffer = base64ToBuffer(iv);

    const plaintext = await crypto.subtle.decrypt(
      {
        name: 'AES-GCM',
        iv: ivBuffer as BufferSource,
      },
      key,
      ciphertextBuffer as BufferSource
    );

    return new TextDecoder().decode(plaintext);
  } catch (error) {
    throw new Error(`Decryption failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Secure session key management
 * Stores derived key in memory during session
 * Automatically clears when session ends or user logs out
 */
export class SecureSessionKeyManager {
  private static instance: SecureSessionKeyManager;
  private sessionKey: CryptoKey | null = null;
  private salt: string = '';
  private expiresAt: number = 0;

  private constructor() {}

  static getInstance(): SecureSessionKeyManager {
    if (!SecureSessionKeyManager.instance) {
      SecureSessionKeyManager.instance = new SecureSessionKeyManager();
    }
    return SecureSessionKeyManager.instance;
  }

  /**
   * Initialize session key
   * Call after user login with server-provided salt
   */
  async initializeKey(
    password: string,
    serverSalt: string,
    sessionDurationMs: number = 24 * 60 * 60 * 1000 // 24 hours
  ): Promise<void> {
    try {
      this.sessionKey = await deriveKey(password, serverSalt);
      this.salt = serverSalt;
      this.expiresAt = Date.now() + sessionDurationMs;
    } catch (error) {
      console.error('Failed to initialize session key:', error);
      throw error;
    }
  }

  /**
   * Get current session key
   * Returns null if expired or not initialized
   */
  getKey(): CryptoKey | null {
    if (!this.sessionKey || Date.now() > this.expiresAt) {
      return null;
    }
    return this.sessionKey;
  }

  /**
   * Get session salt
   */
  getSalt(): string {
    return this.salt;
  }

  /**
   * Check if session is valid
   */
  isValid(): boolean {
    return this.sessionKey !== null && Date.now() < this.expiresAt;
  }

  /**
   * Clear session (logout)
   */
  clear(): void {
    this.sessionKey = null;
    this.salt = '';
    this.expiresAt = 0;
  }

  /**
   * Extend session expiration
   */
  extendSession(additionalMs: number = 60 * 60 * 1000): void {
    if (this.sessionKey) {
      this.expiresAt = Math.max(this.expiresAt + additionalMs, Date.now() + additionalMs);
    }
  }
}

// ============================================================
// Utility functions
// ============================================================

/**
 * Convert Uint8Array buffer to base64 string
 */
function bufferToBase64(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer));
}

/**
 * Convert base64 string to Uint8Array buffer
 */
function base64ToBuffer(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

/**
 * Feature detection: Check if Web Crypto API is available
 */
export function isWebCryptoAvailable(): boolean {
  return (
    typeof crypto !== 'undefined' &&
    typeof crypto.subtle !== 'undefined' &&
    typeof crypto.getRandomValues === 'function'
  );
}

/**
 * Validate password strength
 * Returns array of messages for any issues found
 */
export function validatePassword(password: string): string[] {
  const issues: string[] = [];

  if (!password || password.length < 8) {
    issues.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    issues.push('Password must contain an uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    issues.push('Password must contain a lowercase letter');
  }
  if (!/[0-9]/.test(password)) {
    issues.push('Password must contain a digit');
  }
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    issues.push('Password must contain a special character');
  }

  return issues;
}
