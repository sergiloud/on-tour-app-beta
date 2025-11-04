/**
 * Secure Storage Tests
 * Verifies that encryption/decryption works correctly and protects sensitive data
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    encrypt,
    decrypt,
    setItem,
    getItem,
    removeItem,
    clear,
    hasItem,
    secureStorage,
    migrateToSecureStorage
} from '../lib/secureStorage';

describe('SecureStorage - Encryption/Decryption', () => {
    beforeEach(() => {
        // Clear storage before each test
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('debe encriptar texto plano', () => {
        const plainText = 'Hello, World!';
        const encrypted = encrypt(plainText);

        expect(encrypted).toBeTruthy();
        expect(encrypted).not.toBe(plainText);
        expect(encrypted.length).toBeGreaterThan(plainText.length);
    });

    it('debe desencriptar texto encriptado correctamente', () => {
        const plainText = 'Sensitive data here';
        const encrypted = encrypt(plainText);
        const decrypted = decrypt(encrypted);

        expect(decrypted).toBe(plainText);
    });

    it('debe encriptar objetos JSON', () => {
        const data = { userId: 123, email: 'user@example.com', token: 'secret-token' };
        const plainText = JSON.stringify(data);
        const encrypted = encrypt(plainText);
        const decrypted = decrypt(encrypted);

        expect(JSON.parse(decrypted)).toEqual(data);
    });

    it('debe manejar strings vacíos', () => {
        const encrypted = encrypt('');
        expect(encrypted).toBe('');

        const decrypted = decrypt('');
        expect(decrypted).toBe('');
    });

    it('debe producir diferentes cifrados para el mismo texto', () => {
        const plainText = 'Same text';
        const encrypted1 = encrypt(plainText);

        // Clear session to generate new key
        sessionStorage.clear();

        const encrypted2 = encrypt(plainText);

        // With different keys, ciphertexts should differ
        expect(encrypted1).not.toBe(encrypted2);
    });
});

describe('SecureStorage - setItem/getItem', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('debe almacenar y recuperar strings', () => {
        setItem('test', 'Hello World');
        const retrieved = getItem<string>('test');

        expect(retrieved).toBe('Hello World');
    });

    it('debe almacenar y recuperar números', () => {
        setItem('count', 42);
        const retrieved = getItem<number>('count');

        expect(retrieved).toBe(42);
    });

    it('debe almacenar y recuperar objetos', () => {
        const user = { id: 123, name: 'John Doe', email: 'john@example.com' };
        setItem('user', user);
        const retrieved = getItem<typeof user>('user');

        expect(retrieved).toEqual(user);
    });

    it('debe almacenar y recuperar arrays', () => {
        const items = ['item1', 'item2', 'item3'];
        setItem('items', items);
        const retrieved = getItem<string[]>('items');

        expect(retrieved).toEqual(items);
    });

    it('debe retornar null para keys inexistentes', () => {
        const retrieved = getItem<string>('nonexistent');
        expect(retrieved).toBeNull();
    });

    it('debe verificar que los datos están encriptados en localStorage', () => {
        const sensitiveData = { password: 'super-secret-123' };
        setItem('credentials', sensitiveData);

        const rawValue = localStorage.getItem('credentials');

        // Verify data is NOT stored as plain JSON
        expect(rawValue).not.toContain('super-secret-123');
        expect(rawValue).not.toContain('password');

        // Verify it looks like encrypted data
        expect(rawValue).toBeTruthy();
        expect(rawValue!.length).toBeGreaterThan(20);
    });
});

describe('SecureStorage - removeItem/clear', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('debe remover items específicos', () => {
        setItem('item1', 'value1');
        setItem('item2', 'value2');

        expect(hasItem('item1')).toBe(true);

        removeItem('item1');

        expect(hasItem('item1')).toBe(false);
        expect(hasItem('item2')).toBe(true);
    });

    it('debe limpiar todo el storage', () => {
        setItem('item1', 'value1');
        setItem('item2', 'value2');
        setItem('item3', 'value3');

        clear();

        expect(hasItem('item1')).toBe(false);
        expect(hasItem('item2')).toBe(false);
        expect(hasItem('item3')).toBe(false);
    });
});

describe('SecureStorage - hasItem', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('debe retornar true para keys existentes', () => {
        setItem('existing', 'value');
        expect(hasItem('existing')).toBe(true);
    });

    it('debe retornar false para keys inexistentes', () => {
        expect(hasItem('nonexistent')).toBe(false);
    });
});

describe('SecureStorage - API Interface', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('debe exponer la misma interfaz que localStorage', () => {
        expect(typeof secureStorage.setItem).toBe('function');
        expect(typeof secureStorage.getItem).toBe('function');
        expect(typeof secureStorage.removeItem).toBe('function');
        expect(typeof secureStorage.clear).toBe('function');
        expect(typeof secureStorage.hasItem).toBe('function');
    });

    it('debe funcionar a través del objeto secureStorage', () => {
        secureStorage.setItem('test', { value: 123 });
        const retrieved = secureStorage.getItem<{ value: number }>('test');

        expect(retrieved).toEqual({ value: 123 });
        expect(secureStorage.hasItem('test')).toBe(true);

        secureStorage.removeItem('test');
        expect(secureStorage.hasItem('test')).toBe(false);
    });
});

describe('SecureStorage - Error Handling', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
        vi.restoreAllMocks();
    });

    it('debe manejar errores de encriptación sin lanzar excepciones', () => {
        // Test that null/undefined are handled gracefully
        const encrypted1 = encrypt(null as any);
        const encrypted2 = encrypt(undefined as any);

        expect(encrypted1).toBe('');
        expect(encrypted2).toBe('');

        // No exception should be thrown
        expect(() => encrypt(null as any)).not.toThrow();
    });

    it('debe manejar datos corruptos en desencriptación', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

        const decrypted = decrypt('invalid-encrypted-data');

        // Should not throw, should return empty string
        expect(decrypted).toBe('');
    });

    it('debe manejar JSON inválido en getItem', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

        // Store invalid JSON (manually encrypted garbage)
        localStorage.setItem('corrupt', encrypt('{invalid json}'));

        const retrieved = getItem<any>('corrupt');

        expect(retrieved).toBeNull();
        expect(consoleError).toHaveBeenCalled();
    });
});

describe('SecureStorage - Migration', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('debe migrar datos no encriptados a formato encriptado', () => {
        // Store unencrypted data (simulating old format)
        const userData = { id: 123, name: 'Test User' };
        localStorage.setItem('user', JSON.stringify(userData));

        // Migrate
        migrateToSecureStorage(['user']);

        // Verify data is now encrypted
        const rawValue = localStorage.getItem('user');
        expect(rawValue).not.toContain('Test User');

        // But can still be retrieved
        const retrieved = getItem<typeof userData>('user');
        expect(retrieved).toEqual(userData);
    });

    it('debe saltar keys ya encriptados', () => {
        // Store already encrypted data
        const encryptedData = encrypt(JSON.stringify({ value: 'test' }));
        localStorage.setItem('alreadyEncrypted', encryptedData);

        const consoleLog = vi.spyOn(console, 'log').mockImplementation(() => { });

        migrateToSecureStorage(['alreadyEncrypted']);

        expect(consoleLog).toHaveBeenCalledWith(
            expect.stringContaining('already encrypted')
        );
    });

    it('debe manejar keys inexistentes durante migración', () => {
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

        migrateToSecureStorage(['nonexistent']);

        // Should not error, just skip
        expect(consoleError).not.toHaveBeenCalled();
    });
});

describe('SecureStorage - Real-World Scenarios', () => {
    beforeEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    afterEach(() => {
        localStorage.clear();
        sessionStorage.clear();
    });

    it('debe proteger tokens de autenticación', () => {
        const authData = {
            accessToken: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            refreshToken: 'refresh-token-secret',
            userId: 123
        };

        setItem('auth', authData);

        // Verify tokens are NOT visible in raw localStorage
        const rawValue = localStorage.getItem('auth');
        expect(rawValue).not.toContain('eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9');
        expect(rawValue).not.toContain('refresh-token-secret');

        // But can be retrieved correctly
        const retrieved = getItem<typeof authData>('auth');
        expect(retrieved).toEqual(authData);
    });

    it('debe proteger datos sensibles de usuario', () => {
        const sensitiveData = {
            email: 'user@example.com',
            phone: '+1234567890',
            ssn: '123-45-6789',
            creditCard: '4111-1111-1111-1111'
        };

        setItem('sensitive', sensitiveData);

        const rawValue = localStorage.getItem('sensitive');

        // Verify PII is not visible
        expect(rawValue).not.toContain('user@example.com');
        expect(rawValue).not.toContain('123-45-6789');
        expect(rawValue).not.toContain('4111-1111-1111-1111');
    });

    it('debe permitir múltiples sesiones con diferentes keys', () => {
        setItem('data', 'Session 1');
        const session1 = getItem<string>('data');

        // Simulate new session (new encryption key)
        sessionStorage.clear();

        setItem('data', 'Session 2');
        const session2 = getItem<string>('data');

        // Both sessions should work independently
        expect(session2).toBe('Session 2');

        // Note: session1 data would be unreadable in session2 with different key
    });
});
