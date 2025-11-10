/**
 * XSS Protection Tests
 * Verifies that sanitization functions correctly block malicious code
 */

import { describe, it, expect } from 'vitest';
import {
    sanitizeHTML,
    sanitizeText,
    sanitizeURL,
    sanitizeName,
    sanitizeNotes,
    createSafeHTML
} from '../lib/sanitize';

describe('XSS Protection - sanitizeHTML', () => {
    it('debe remover script tags', () => {
        const dirty = '<script>alert("XSS")</script>Hello';
        const clean = sanitizeHTML(dirty);

        expect(clean).not.toContain('<script>');
        expect(clean).not.toContain('alert');
        expect(clean).toContain('Hello');
    });

    it('debe remover event handlers', () => {
        const dirty = '<div onclick="alert(1)">Click me</div>';
        const clean = sanitizeHTML(dirty);

        expect(clean).not.toContain('onclick');
        expect(clean).not.toContain('alert');
        expect(clean).toContain('Click me');
    });

    it('debe remover javascript: URIs', () => {
        const dirty = '<a href="javascript:alert(1)">Link</a>';
        const clean = sanitizeHTML(dirty);

        expect(clean).not.toContain('javascript:');
        expect(clean).toContain('Link');
    });

    it('debe permitir HTML seguro básico', () => {
        const safe = '<p>Hello <strong>world</strong></p>';
        const clean = sanitizeHTML(safe);

        expect(clean).toContain('<p>');
        expect(clean).toContain('<strong>');
        expect(clean).toContain('Hello');
        expect(clean).toContain('world');
    });

    it('debe remover iframes', () => {
        const dirty = '<iframe src="evil.com"></iframe>Normal text';
        const clean = sanitizeHTML(dirty);

        expect(clean).not.toContain('<iframe');
        expect(clean).toContain('Normal text');
    });

    it('debe manejar strings vacíos', () => {
        expect(sanitizeHTML('')).toBe('');
        expect(sanitizeHTML(null as any)).toBe('');
        expect(sanitizeHTML(undefined as any)).toBe('');
    });
});

describe('XSS Protection - sanitizeText', () => {
    it('debe escapar HTML entities', () => {
        const text = 'Show <name> & "title"';
        const escaped = sanitizeText(text);

        expect(escaped).toContain('&lt;');
        expect(escaped).toContain('&gt;');
        expect(escaped).toContain('&amp;');
        expect(escaped).toContain('&quot;');
    });

    it('debe convertir script tags en texto plano', () => {
        const malicious = '<script>alert("XSS")</script>';
        const escaped = sanitizeText(malicious);

        expect(escaped).toBe('&lt;script&gt;alert(&quot;XSS&quot;)&lt;&#x2F;script&gt;');
        expect(escaped).not.toContain('<script>');
    });

    it('debe escapar quotes simples y dobles', () => {
        const text = `It's a "test"`;
        const escaped = sanitizeText(text);

        expect(escaped).toContain('&#x27;'); // Single quote
        expect(escaped).toContain('&quot;'); // Double quote
    });

    it('debe manejar strings vacíos', () => {
        expect(sanitizeText('')).toBe('');
        expect(sanitizeText(null as any)).toBe('');
    });
});

describe('XSS Protection - sanitizeURL', () => {
    it('debe bloquear javascript: URIs', () => {
        expect(sanitizeURL('javascript:alert(1)')).toBe('');
        expect(sanitizeURL('JAVASCRIPT:alert(1)')).toBe('');
    });

    it('debe bloquear data: URIs', () => {
        expect(sanitizeURL('data:text/html,<script>alert(1)</script>')).toBe('');
        expect(sanitizeURL('DATA:text/html,evil')).toBe('');
    });

    it('debe bloquear vbscript: URIs', () => {
        expect(sanitizeURL('vbscript:alert(1)')).toBe('');
    });

    it('debe bloquear file: URIs', () => {
        expect(sanitizeURL('file:///etc/passwd')).toBe('');
    });

    it('debe permitir URLs HTTP(S) seguras', () => {
        expect(sanitizeURL('https://example.com')).toBe('https://example.com');
        expect(sanitizeURL('http://example.com')).toBe('http://example.com');
    });

    it('debe permitir mailto: y tel:', () => {
        expect(sanitizeURL('mailto:test@example.com')).toBe('mailto:test@example.com');
        expect(sanitizeURL('tel:+1234567890')).toBe('tel:+1234567890');
    });

    it('debe permitir relative URLs', () => {
        expect(sanitizeURL('/dashboard/shows')).toBe('/dashboard/shows');
        expect(sanitizeURL('#section')).toBe('#section');
    });

    it('debe manejar strings vacíos', () => {
        expect(sanitizeURL('')).toBe('');
        expect(sanitizeURL(null as any)).toBe('');
    });
});

describe('XSS Protection - sanitizeName', () => {
    it('debe escapar HTML en nombres de shows', () => {
        const name = 'Show<script>alert(1)</script>';
        const clean = sanitizeName(name);

        expect(clean).not.toContain('<script>');
        expect(clean).toContain('&lt;script&gt;');
    });

    it('debe permitir caracteres especiales normales', () => {
        const name = "Danny Avila's Show & More";
        const clean = sanitizeName(name);

        expect(clean).toContain('Danny Avila');
        expect(clean).toContain('&#x27;s');
        expect(clean).toContain('&amp;');
    });

    it('debe manejar nombres con comillas', () => {
        const name = 'The "Amazing" Show';
        const clean = sanitizeName(name);

        expect(clean).toContain('&quot;');
    });
});

describe('XSS Protection - sanitizeNotes', () => {
    it('debe permitir formateo básico en notas', () => {
        const notes = '<p>This is <strong>important</strong></p>';
        const clean = sanitizeNotes(notes);

        expect(clean).toContain('<p>');
        expect(clean).toContain('<strong>');
    });

    it('debe remover scripts de notas', () => {
        const notes = '<p>Note</p><script>alert(1)</script>';
        const clean = sanitizeNotes(notes);

        expect(clean).toContain('Note');
        expect(clean).not.toContain('<script>');
    });

    it('debe remover links de notas (solo texto)', () => {
        const notes = '<p>Check <a href="evil.com">this</a></p>';
        const clean = sanitizeNotes(notes);

        // Links no están en ALLOWED_TAGS para notes
        expect(clean).toContain('Check');
        expect(clean).toContain('this');
        expect(clean).not.toContain('<a ');
    });
});

describe('XSS Protection - createSafeHTML', () => {
    it('debe retornar objeto con __html property', () => {
        const result = createSafeHTML('<p>Test</p>');

        expect(result).toHaveProperty('__html');
        expect(result.__html).toContain('<p>');
        expect(result.__html).toContain('Test');
    });

    it('debe sanitizar contenido peligroso', () => {
        const result = createSafeHTML('<script>alert(1)</script>Text');

        expect(result.__html).not.toContain('<script>');
        expect(result.__html).toContain('Text');
    });
});

describe('XSS Protection - Casos Reales', () => {
    it('debe proteger nombres de venues contra XSS', () => {
        const venueInput = 'O2 Arena<img src=x onerror=alert(1)>';
        const safe = sanitizeName(venueInput);

        // HTML tags deben estar escapados (no ejecutables)
        expect(safe).not.toContain('<img');
        expect(safe).toContain('&lt;img'); // Escapado
        expect(safe).toContain('O2 Arena');
    });

    it('debe proteger promoter names contra XSS', () => {
        const promoterInput = 'Live Nation<svg/onload=alert(1)>';
        const safe = sanitizeName(promoterInput);

        // HTML tags deben estar escapados (no ejecutables)
        expect(safe).not.toContain('<svg');
        expect(safe).toContain('&lt;svg'); // Escapado
        expect(safe).toContain('Live Nation');
    });

    it('debe proteger show descriptions contra XSS', () => {
        const description = 'Amazing show!<iframe src=evil.com>';
        const safe = sanitizeNotes(description);

        expect(safe).not.toContain('<iframe');
        expect(safe).toContain('Amazing show');
    });

    it('debe proteger contra mXSS (mutation XSS)', () => {
        const mxss = '<noscript><p title="</noscript><img src=x onerror=alert(1)>">';
        const safe = sanitizeHTML(mxss);

        expect(safe).not.toContain('onerror');
        expect(safe).not.toContain('alert');
    });

    it('debe proteger contra DOM clobbering', () => {
        const clobbering = '<form name="getElementById"><input name="getElementById"></form>';
        const safe = sanitizeHTML(clobbering);

        // Forms no están permitidos
        expect(safe).not.toContain('<form');
        expect(safe).not.toContain('name="getElementById"');
    });
});
