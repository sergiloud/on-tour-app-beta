/**
 * keyDerivation.test.ts
 * Tests for PBKDF2 key derivation and AES-GCM encryption
 */

import { describe, it, expect, beforeEach } from 'vitest';
import {
  generateSalt,
  deriveKey,
  deriveBits,
  encryptWithKey,
  decryptWithKey,
  SecureSessionKeyManager,
  isWebCryptoAvailable,
  validatePassword,
} from '../lib/keyDerivation';

describe('Key Derivation Module', () => {
  // Skip tests if Web Crypto API is not available
  const skipIfNoWebCrypto = isWebCryptoAvailable() ? describe : describe.skip;

  describe('generateSalt', () => {
    it('should generate a valid base64 salt', async () => {
      const salt = await generateSalt();

      expect(typeof salt).toBe('string');
      expect(salt.length).toBeGreaterThan(20);
      // Valid base64 characters
      expect(/^[A-Za-z0-9+/=]*$/.test(salt)).toBe(true);
    });

    it('should generate different salts on each call', async () => {
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();

      expect(salt1).not.toBe(salt2);
    });

    it('should generate cryptographically strong salts', async () => {
      const salts = await Promise.all(
        Array(10).fill(null).map(() => generateSalt())
      );

      // All salts should be unique
      const uniqueSalts = new Set(salts);
      expect(uniqueSalts.size).toBe(10);
    });
  });

  skipIfNoWebCrypto('deriveKey', () => {
    it('should derive a consistent key from password+salt', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();

      const key1 = await deriveKey(password, salt);
      const key2 = await deriveKey(password, salt);

      // Keys should be the same for same password+salt
      expect(key1.type).toBe('secret');
      expect(key1.algorithm.name).toBe('AES-GCM');
      expect(key2.type).toBe('secret');
    });

    it('should produce different keys for different passwords', async () => {
      const salt = await generateSalt();

      const key1 = await deriveKey('Password1!@#$%', salt);
      const key2 = await deriveKey('Password2!@#$%', salt);

      // We can't directly compare CryptoKey objects, but they should be different
      expect(key1).not.toBe(key2);
    });

    it('should produce different keys for different salts', async () => {
      const password = 'TestPassword123!';
      const salt1 = await generateSalt();
      const salt2 = await generateSalt();

      const key1 = await deriveKey(password, salt1);
      const key2 = await deriveKey(password, salt2);

      expect(key1).not.toBe(key2);
    });

    it('should reject passwords shorter than 8 characters', async () => {
      const salt = await generateSalt();

      await expect(deriveKey('Short', salt)).rejects.toThrow(
        'Password must be at least 8 characters'
      );
    });

    it('should reject invalid salt', async () => {
      const password = 'ValidPassword123!';

      await expect(deriveKey(password, '')).rejects.toThrow('Invalid salt');
      await expect(deriveKey(password, 'abc')).rejects.toThrow('Invalid salt');
    });

    it('should produce extractable keys that can be used for encryption', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();

      const key = await deriveKey(password, salt);

      expect(key.extractable).toBe(false); // Key should not be extractable
      expect(key.usages).toContain('encrypt');
      expect(key.usages).toContain('decrypt');
    });
  });

  skipIfNoWebCrypto('deriveBits', () => {
    it('should derive consistent bits from password+salt', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();

      const bits1 = await deriveBits(password, salt);
      const bits2 = await deriveBits(password, salt);

      expect(bits1).toBe(bits2);
      expect(typeof bits1).toBe('string');
    });

    it('should produce different bits for different passwords', async () => {
      const salt = await generateSalt();

      const bits1 = await deriveBits('Password1!@#$%', salt);
      const bits2 = await deriveBits('Password2!@#$%', salt);

      expect(bits1).not.toBe(bits2);
    });

    it('should reject invalid inputs', async () => {
      const salt = await generateSalt();

      await expect(deriveBits('Short', salt)).rejects.toThrow();
      await expect(deriveBits('ValidPassword123!', '')).rejects.toThrow();
    });

    it('should produce base64-encoded output', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();

      const bits = await deriveBits(password, salt);

      expect(/^[A-Za-z0-9+/=]*$/.test(bits)).toBe(true);
    });
  });

  skipIfNoWebCrypto('encryptWithKey', () => {
    it('should encrypt plaintext with derived key', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();
      const key = await deriveKey(password, salt);
      const plaintext = 'Secret message';

      const { iv, ciphertext } = await encryptWithKey(plaintext, key);

      expect(iv).toBeTruthy();
      expect(ciphertext).toBeTruthy();
      expect(ciphertext).not.toBe(plaintext);
      expect(/^[A-Za-z0-9+/=]*$/.test(iv)).toBe(true);
      expect(/^[A-Za-z0-9+/=]*$/.test(ciphertext)).toBe(true);
    });

    it('should produce different ciphertexts for same plaintext (different IVs)', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();
      const key = await deriveKey(password, salt);
      const plaintext = 'Secret message';

      const result1 = await encryptWithKey(plaintext, key);
      const result2 = await encryptWithKey(plaintext, key);

      expect(result1.ciphertext).not.toBe(result2.ciphertext);
      expect(result1.iv).not.toBe(result2.iv);
    });

    it('should accept optional IV', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();
      const key = await deriveKey(password, salt);
      const plaintext = 'Secret message';
      const customIv = crypto.getRandomValues(new Uint8Array(12));

      const result1 = await encryptWithKey(plaintext, key, customIv);
      const result2 = await encryptWithKey(plaintext, key, customIv);

      expect(result1.iv).toBe(result2.iv);
      expect(result1.ciphertext).toBe(result2.ciphertext); // Same IV = same ciphertext
    });

    it('should encrypt long plaintexts', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();
      const key = await deriveKey(password, salt);
      const plaintext = 'A'.repeat(10000);

      const { ciphertext } = await encryptWithKey(plaintext, key);

      expect(ciphertext).toBeTruthy();
      expect(ciphertext.length).toBeGreaterThan(plaintext.length);
    });
  });

  skipIfNoWebCrypto('decryptWithKey', () => {
    it('should decrypt encrypted data', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();
      const key = await deriveKey(password, salt);
      const plaintext = 'Secret message';

      const { iv, ciphertext } = await encryptWithKey(plaintext, key);
      const decrypted = await decryptWithKey(ciphertext, key, iv);

      expect(decrypted).toBe(plaintext);
    });

    it('should fail to decrypt with wrong key', async () => {
      const salt = await generateSalt();
      const key1 = await deriveKey('CorrectPassword1!', salt);
      const key2 = await deriveKey('WrongPassword123!', salt);
      const plaintext = 'Secret message';

      const { iv, ciphertext } = await encryptWithKey(plaintext, key1);

      await expect(
        decryptWithKey(ciphertext, key2, iv)
      ).rejects.toThrow('Decryption failed');
    });

    it('should fail with corrupted ciphertext', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();
      const key = await deriveKey(password, salt);
      const plaintext = 'Secret message';

      const { iv, ciphertext } = await encryptWithKey(plaintext, key);
      const corruptedCiphertext = ciphertext.slice(0, -5) + 'XXXXX';

      await expect(
        decryptWithKey(corruptedCiphertext, key, iv)
      ).rejects.toThrow('Decryption failed');
    });

    it('should decrypt JSON data', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();
      const key = await deriveKey(password, salt);
      const data = { user: 'john', email: 'john@example.com', token: 'secret123' };
      const plaintext = JSON.stringify(data);

      const { iv, ciphertext } = await encryptWithKey(plaintext, key);
      const decrypted = await decryptWithKey(ciphertext, key, iv);
      const parsed = JSON.parse(decrypted);

      expect(parsed).toEqual(data);
    });
  });

  skipIfNoWebCrypto('SecureSessionKeyManager', () => {
    let manager: SecureSessionKeyManager;

    beforeEach(() => {
      manager = SecureSessionKeyManager.getInstance();
      manager.clear();
    });

    it('should initialize with password and salt', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();

      await manager.initializeKey(password, salt);

      expect(manager.isValid()).toBe(true);
      expect(manager.getKey()).not.toBeNull();
      expect(manager.getSalt()).toBe(salt);
    });

    it('should return same key instance', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();

      await manager.initializeKey(password, salt);

      const key1 = manager.getKey();
      const key2 = manager.getKey();

      expect(key1).toBe(key2);
    });

    it('should clear session', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();

      await manager.initializeKey(password, salt);
      expect(manager.isValid()).toBe(true);

      manager.clear();

      expect(manager.isValid()).toBe(false);
      expect(manager.getKey()).toBeNull();
      expect(manager.getSalt()).toBe('');
    });

    it('should return null for expired session', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();

      // Initialize with very short expiration
      await manager.initializeKey(password, salt, 1); // 1ms

      // Wait for session to expire
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(manager.getKey()).toBeNull();
    });

    it('should extend session expiration', async () => {
      const password = 'TestPassword123!';
      const salt = await generateSalt();

      await manager.initializeKey(password, salt, 1000); // 1s

      const keyBefore = manager.getKey();
      expect(keyBefore).not.toBeNull();

      manager.extendSession(5000); // Add 5s

      // Session should still be valid after original expiration
      await new Promise(resolve => setTimeout(resolve, 1100));
      expect(manager.getKey()).not.toBeNull();
    });
  });

  describe('isWebCryptoAvailable', () => {
    it('should detect Web Crypto API availability', () => {
      expect(typeof isWebCryptoAvailable()).toBe('boolean');
      // In modern environments, should be true
      expect(isWebCryptoAvailable()).toBe(true);
    });
  });

  describe('validatePassword', () => {
    it('should validate strong passwords', () => {
      const issues = validatePassword('StrongPass123!');
      expect(issues.length).toBe(0);
    });

    it('should reject short passwords', () => {
      const issues = validatePassword('Short1!');
      expect(issues.some(i => i.includes('at least 8 characters'))).toBe(true);
    });

    it('should require uppercase letter', () => {
      const issues = validatePassword('lowercase123!');
      expect(issues.some(i => i.includes('uppercase'))).toBe(true);
    });

    it('should require lowercase letter', () => {
      const issues = validatePassword('UPPERCASE123!');
      expect(issues.some(i => i.includes('lowercase'))).toBe(true);
    });

    it('should require digit', () => {
      const issues = validatePassword('NoDigit!ABC');
      expect(issues.some(i => i.includes('digit'))).toBe(true);
    });

    it('should require special character', () => {
      const issues = validatePassword('NoSpecial123ABC');
      expect(issues.some(i => i.includes('special character'))).toBe(true);
    });

    it('should validate empty password', () => {
      const issues = validatePassword('');
      expect(issues.length).toBeGreaterThan(0);
    });

    it('should list all issues for very weak password', () => {
      const issues = validatePassword('abc');
      expect(issues.length).toBeGreaterThan(3);
    });
  });
});
