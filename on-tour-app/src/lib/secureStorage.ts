/**
 * Secure Storage Utilities
 *
 * SECURITY: Encrypts sensitive data before storing in localStorage
 * to protect against XSS and local storage inspection.
 *
 * Uses AES-256 encryption with crypto-js library.
 */

import CryptoJS from 'crypto-js';

/**
 * Generate or retrieve encryption key
 *
 * SECURITY NOTE: In production, this should be:
 * 1. Generated per-user with server-side key derivation
 * 2. Stored in memory only (not localStorage)
 * 3. Re-generated on each session
 *
 * For now, we use a browser-specific key stored in sessionStorage
 */
function getEncryptionKey(): string {
    // Check if key exists in current session
    let key = sessionStorage.getItem('__enc_key');

    if (!key) {
        // Generate new key for this session
        // In production: fetch from server after authentication
        key = CryptoJS.lib.WordArray.random(256 / 8).toString();
        sessionStorage.setItem('__enc_key', key);
    }

    return key;
}

/**
 * Encrypt data using AES-256
 *
 * @param data - Plain text data to encrypt
 * @returns Encrypted string
 *
 * @example
 * ```typescript
 * const encrypted = encrypt(JSON.stringify({ token: 'secret' }));
 * localStorage.setItem('userData', encrypted);
 * ```
 */
export function encrypt(data: string): string {
    if (!data) return '';

    try {
        const key = getEncryptionKey();
        const encrypted = CryptoJS.AES.encrypt(data, key);
        return encrypted.toString();
    } catch (error) {
        console.error('Encryption failed:', error);
        // In case of encryption failure, return empty string
        // Better to lose data than store it unencrypted
        return '';
    }
}

/**
 * Decrypt data encrypted with encrypt()
 *
 * @param encryptedData - Encrypted string
 * @returns Decrypted plain text
 *
 * @example
 * ```typescript
 * const encrypted = localStorage.getItem('userData');
 * if (encrypted) {
 *   const data = decrypt(encrypted);
 *   const parsed = JSON.parse(data);
 * }
 * ```
 */
export function decrypt(encryptedData: string): string {
    if (!encryptedData) return '';

    try {
        const key = getEncryptionKey();
        const decrypted = CryptoJS.AES.decrypt(encryptedData, key);
        return decrypted.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption failed:', error);
        return '';
    }
}

/**
 * Securely store data in localStorage with encryption
 *
 * @param key - Storage key
 * @param value - Value to store (will be JSON stringified)
 *
 * @example
 * ```typescript
 * secureStorage.setItem('user', { id: 123, email: 'user@example.com' });
 * ```
 */
export function setItem<T>(key: string, value: T): void {
    try {
        const serialized = JSON.stringify(value);
        const encrypted = encrypt(serialized);

        if (encrypted) {
            localStorage.setItem(key, encrypted);
        }
    } catch (error) {
        console.error(`Failed to store ${key}:`, error);
    }
}

/**
 * Retrieve and decrypt data from localStorage
 *
 * @param key - Storage key
 * @returns Decrypted and parsed value, or null if not found
 *
 * @example
 * ```typescript
 * const user = secureStorage.getItem<User>('user');
 * if (user) {
 *   console.log(user.email);
 * }
 * ```
 */
export function getItem<T>(key: string): T | null {
    try {
        const encrypted = localStorage.getItem(key);
        if (!encrypted) return null;

        const decrypted = decrypt(encrypted);
        if (!decrypted) return null;

        return JSON.parse(decrypted) as T;
    } catch (error) {
        console.error(`Failed to retrieve ${key}:`, error);
        return null;
    }
}

/**
 * Remove item from localStorage
 *
 * @param key - Storage key
 */
export function removeItem(key: string): void {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Failed to remove ${key}:`, error);
    }
}

/**
 * Clear all items from localStorage
 *
 * WARNING: This removes ALL localStorage data, not just encrypted items
 */
export function clear(): void {
    try {
        localStorage.clear();
    } catch (error) {
        console.error('Failed to clear storage:', error);
    }
}

/**
 * Check if a key exists in localStorage
 *
 * @param key - Storage key
 * @returns true if key exists, false otherwise
 */
export function hasItem(key: string): boolean {
    try {
        return localStorage.getItem(key) !== null;
    } catch (error) {
        console.error(`Failed to check ${key}:`, error);
        return false;
    }
}

/**
 * Secure storage API (same interface as localStorage)
 */
export const secureStorage = {
    setItem,
    getItem,
    removeItem,
    clear,
    hasItem
};

/**
 * Migrate existing localStorage data to encrypted format
 *
 * USAGE: Call once after implementing secure storage
 *
 * @param keys - Array of keys to migrate
 *
 * @example
 * ```typescript
 * // Run once on app load
 * migrateToSecureStorage(['user', 'settings', 'auth']);
 * ```
 */
export function migrateToSecureStorage(keys: string[]): void {
    keys.forEach(key => {
        try {
            const value = localStorage.getItem(key);
            if (!value) return;

            // Check if already encrypted (starts with 'U2FsdGVk' which is base64 for 'Salted')
            if (value.startsWith('U2FsdGVk')) {
                console.log(`${key} is already encrypted, skipping`);
                return;
            }

            // Try to parse as JSON to validate it's unencrypted
            const parsed = JSON.parse(value);

            // Re-store with encryption
            setItem(key, parsed);
            console.log(`Migrated ${key} to secure storage`);
        } catch (error) {
            console.error(`Failed to migrate ${key}:`, error);
        }
    });
}

export default secureStorage;
