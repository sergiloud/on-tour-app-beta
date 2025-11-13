/**
 * Encryption utilities for calendar sync credentials
 * Uses AES-256-GCM for secure encryption
 */

import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;
const SALT_LENGTH = 64;

/**
 * Get encryption key from environment variable
 * In production, this should be a 32-byte hex string
 */
function getEncryptionKey(): Buffer {
  const key = process.env.CALENDAR_ENCRYPTION_KEY;
  
  if (!key) {
    throw new Error('CALENDAR_ENCRYPTION_KEY environment variable not set');
  }
  
  // Convert hex string to buffer (expects 64 hex chars = 32 bytes)
  if (key.length !== 64) {
    throw new Error('CALENDAR_ENCRYPTION_KEY must be 64 hex characters (32 bytes)');
  }
  
  return Buffer.from(key, 'hex');
}

/**
 * Encrypt a string using AES-256-GCM
 * Returns base64 encoded string with format: iv:authTag:encryptedData
 */
export function encrypt(text: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  
  const cipher = createCipheriv(ALGORITHM, key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  // Combine iv, authTag, and encrypted data
  const combined = `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  
  return Buffer.from(combined).toString('base64');
}

/**
 * Decrypt a string encrypted with AES-256-GCM
 * Expects base64 encoded string with format: iv:authTag:encryptedData
 */
export function decrypt(encryptedText: string): string {
  const key = getEncryptionKey();
  
  // Decode from base64
  const combined = Buffer.from(encryptedText, 'base64').toString('utf8');
  const parts = combined.split(':');
  
  if (parts.length !== 3) {
    throw new Error('Invalid encrypted data format');
  }
  
  const iv = Buffer.from(parts[0], 'hex');
  const authTag = Buffer.from(parts[1], 'hex');
  const encrypted = parts[2];
  
  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);
  
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

/**
 * Generate a new random encryption key
 * Use this to generate CALENDAR_ENCRYPTION_KEY for .env
 */
export function generateEncryptionKey(): string {
  return randomBytes(32).toString('hex');
}
