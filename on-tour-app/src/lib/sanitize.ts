/**
 * HTML Sanitization Utilities
 *
 * SECURITY: Protects against XSS attacks by sanitizing user-generated content
 * before rendering it in the DOM.
 *
 * Uses DOMPurify with strict configuration to remove malicious code while
 * preserving safe HTML elements.
 */

import DOMPurify, { Config } from 'dompurify';

/**
 * Sanitize HTML string to prevent XSS attacks
 *
 * @param dirty - Potentially unsafe HTML string
 * @param options - DOMPurify configuration options
 * @returns Clean HTML string safe for rendering
 *
 * @example
 * ```typescript
 * const userInput = '<script>alert("XSS")</script>Hello';
 * const safe = sanitizeHTML(userInput);
 * // Returns: "Hello" (script tag removed)
 * ```
 */
export function sanitizeHTML(
    dirty: string,
    options?: Config
): string {
    if (!dirty || typeof dirty !== 'string') {
        return '';
    }

    const defaultConfig: Config = {
        // Allow only safe HTML tags
        ALLOWED_TAGS: [
            'b', 'i', 'em', 'strong', 'u', 's', 'strike',
            'p', 'br', 'span', 'div',
            'a', 'ul', 'ol', 'li',
            'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
            'blockquote', 'code', 'pre'
        ],
        // Allow only safe attributes
        ALLOWED_ATTR: [
            'href', 'title', 'target', 'rel', 'class', 'id'
        ],
        // Allow only safe URI schemes
        ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        // Keep all safe HTML
        KEEP_CONTENT: true,
        // Return string (not DOM node)
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        // Prevent mXSS attacks
        SANITIZE_DOM: true,
        // Prevent data URIs in links
        ALLOW_DATA_ATTR: false,
        // Additional security
        FORCE_BODY: true,
        ...options,
    };

    return DOMPurify.sanitize(dirty, defaultConfig) as string;
}

/**
 * Sanitize plain text by escaping HTML entities
 * Use this for text-only fields where NO HTML should be allowed
 *
 * @param text - Plain text that may contain HTML characters
 * @returns Escaped text safe for rendering
 *
 * @example
 * ```typescript
 * const userInput = 'Show <name> & "title"';
 * const safe = sanitizeText(userInput);
 * // Returns: "Show &lt;name&gt; &amp; &quot;title&quot;"
 * ```
 */
export function sanitizeText(text: string): string {
    if (!text || typeof text !== 'string') {
        return '';
    }

    return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitize URL to prevent javascript: and data: URIs
 *
 * @param url - URL string to validate
 * @returns Safe URL or empty string if invalid
 *
 * @example
 * ```typescript
 * sanitizeURL('javascript:alert(1)') // Returns: ''
 * sanitizeURL('https://example.com') // Returns: 'https://example.com'
 * ```
 */
export function sanitizeURL(url: string): string {
    if (!url || typeof url !== 'string') {
        return '';
    }

    const trimmed = url.trim().toLowerCase();

    // Block dangerous protocols
    if (
        trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('vbscript:') ||
        trimmed.startsWith('file:')
    ) {
        console.warn('[Security] Blocked dangerous URL:', url);
        return '';
    }

    // Allow safe protocols
    const safeProtocols = ['http:', 'https:', 'mailto:', 'tel:', 'sms:'];
    const hasProtocol = safeProtocols.some(protocol => trimmed.startsWith(protocol));

    if (hasProtocol || trimmed.startsWith('/') || trimmed.startsWith('#')) {
        return url; // Safe URL
    }

    // Relative URLs without protocol - assume https
    return url;
}

/**
 * Sanitize show/venue/promoter name for safe rendering
 * Removes HTML but allows basic text formatting
 *
 * @param name - User-provided name
 * @returns Sanitized name
 */
export function sanitizeName(name: string): string {
    if (!name) return '';

    // For names, we want plain text only (no HTML)
    return sanitizeText(name);
}

/**
 * Sanitize notes/description field
 * Allows basic HTML formatting but removes dangerous content
 *
 * @param notes - User-provided notes/description
 * @returns Sanitized notes with safe HTML
 */
export function sanitizeNotes(notes: string): string {
    if (!notes) return '';

    // Allow basic formatting in notes
    return sanitizeHTML(notes, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'u', 'br', 'p'],
        ALLOWED_ATTR: [],
    });
}

/**
 * React component wrapper for sanitized HTML
 * Use with dangerouslySetInnerHTML
 *
 * @example
 * ```tsx
 * <div dangerouslySetInnerHTML={createSafeHTML(userContent)} />
 * ```
 */
export function createSafeHTML(content: string): { __html: string } {
    return { __html: sanitizeHTML(content) };
}

/**
 * Batch sanitize an array of strings
 *
 * @param items - Array of strings to sanitize
 * @param sanitizer - Sanitization function to use (default: sanitizeText)
 * @returns Array of sanitized strings
 */
export function sanitizeArray(
    items: string[],
    sanitizer: (str: string) => string = sanitizeText
): string[] {
    return items.map(item => sanitizer(item));
}

// Export DOMPurify instance for advanced usage
export { DOMPurify };
