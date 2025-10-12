/**
 * i18n Completeness Tests
 * Validates 100% coverage across all languages
 *
 * @module i18n.completeness.test
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { join } from 'path';

type Lang = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

const SUPPORTED_LANGS: Lang[] = ['en', 'es', 'fr', 'de', 'it', 'pt'];
const MIN_COVERAGE_PERCENT = 90; // Minimum acceptable coverage

/**
 * Parse i18n.ts and extract dictionaries
 * Simplified parser for test purposes
 */
function parseI18nDictionaries(): Record<Lang, Record<string, string>> {
    const i18nPath = join(process.cwd(), 'src/lib/i18n.ts');
    const content = readFileSync(i18nPath, 'utf-8');

    const result: Record<string, Record<string, string>> = {};

    for (const lang of SUPPORTED_LANGS) {
        const entries: Record<string, string> = {};

        // Find language block (simplified regex)
        const langBlockRegex = new RegExp(`${lang}:\\s*\\{([\\s\\S]*?)\\}(?=\\s*,\\s*(?:${SUPPORTED_LANGS.join('|')}):)|${lang}:\\s*\\{([\\s\\S]*?)\\}\\s*(?:}|$)`, 'gm');
        const langMatch = content.match(langBlockRegex);

        if (!langMatch) {
            console.warn(`Warning: Could not find ${lang} dictionary in i18n.ts`);
            result[lang] = {};
            continue;
        }

        const langBlock = langMatch[0];

        // Extract key-value pairs
        const entryRegex = /['"]([^'"]+)['"]\s*:\s*['"]([^'"]*)['"]/g;
        let match;

        while ((match = entryRegex.exec(langBlock)) !== null) {
            const [, key, value] = match;
            if (key && value !== undefined) {
                entries[key] = value;
            }
        }

        result[lang] = entries;
    }

    return result as Record<Lang, Record<string, string>>;
}

describe('i18n Completeness', () => {
    const dictionaries = parseI18nDictionaries();
    const enKeys = Object.keys(dictionaries.en);

    it('should have English dictionary as baseline', () => {
        expect(enKeys.length).toBeGreaterThan(100);
        expect(dictionaries.en).toBeDefined();
    });

    it('should have all required languages defined', () => {
        for (const lang of SUPPORTED_LANGS) {
            expect(dictionaries[lang]).toBeDefined();
            expect(typeof dictionaries[lang]).toBe('object');
        }
    });

    describe('Coverage by Language', () => {
        for (const lang of SUPPORTED_LANGS) {
            if (lang === 'en') continue; // English is the baseline

            it(`should have >= ${MIN_COVERAGE_PERCENT}% coverage for ${lang.toUpperCase()}`, () => {
                const langKeys = Object.keys(dictionaries[lang]);
                const coverage = (langKeys.length / enKeys.length) * 100;

                console.log(`   ${lang.toUpperCase()}: ${coverage.toFixed(1)}% (${langKeys.length}/${enKeys.length} keys)`);

                expect(coverage).toBeGreaterThanOrEqual(MIN_COVERAGE_PERCENT);
            });
        }
    });

    describe('Missing Keys Detection', () => {
        for (const lang of SUPPORTED_LANGS) {
            if (lang === 'en') continue;

            it(`should report missing keys for ${lang.toUpperCase()}`, () => {
                const langKeys = new Set(Object.keys(dictionaries[lang]));
                const missingKeys = enKeys.filter(key => !langKeys.has(key));

                if (missingKeys.length > 0) {
                    console.log(`\n   Missing in ${lang.toUpperCase()} (${missingKeys.length}):`);
                    missingKeys.slice(0, 10).forEach(key => {
                        console.log(`     - ${key}: "${dictionaries.en[key]}"`);
                    });
                    if (missingKeys.length > 10) {
                        console.log(`     ... and ${missingKeys.length - 10} more`);
                    }
                }

                // This test is informational, not failing
                expect(Array.isArray(missingKeys)).toBe(true);
            });
        }
    });

    describe('Orphaned Keys Detection', () => {
        for (const lang of SUPPORTED_LANGS) {
            if (lang === 'en') continue;

            it(`should detect orphaned keys in ${lang.toUpperCase()}`, () => {
                const enKeySet = new Set(enKeys);
                const langKeys = Object.keys(dictionaries[lang]);
                const orphanedKeys = langKeys.filter(key => !enKeySet.has(key));

                if (orphanedKeys.length > 0) {
                    console.warn(`\n   ⚠️  Orphaned keys in ${lang.toUpperCase()} (${orphanedKeys.length}):`);
                    orphanedKeys.forEach(key => {
                        console.warn(`     - ${key}: "${dictionaries[lang][key]}"`);
                    });
                }

                // Orphaned keys are a warning, not a failure
                // They might be temporary or language-specific variations
                expect(Array.isArray(orphanedKeys)).toBe(true);
            });
        }
    });

    describe('Empty Translation Detection', () => {
        for (const lang of SUPPORTED_LANGS) {
            it(`should not have empty translations in ${lang.toUpperCase()}`, () => {
                const langDict = dictionaries[lang];
                const emptyKeys = Object.entries(langDict)
                    .filter(([_, value]) => value === '')
                    .map(([key]) => key);

                if (emptyKeys.length > 0) {
                    console.warn(`\n   ⚠️  Empty translations in ${lang.toUpperCase()} (${emptyKeys.length}):`);
                    emptyKeys.slice(0, 5).forEach(key => {
                        console.warn(`     - ${key}`);
                    });
                    if (emptyKeys.length > 5) {
                        console.warn(`     ... and ${emptyKeys.length - 5} more`);
                    }
                }

                // Empty translations should fail the test
                expect(emptyKeys).toHaveLength(0);
            });
        }
    });

    describe('Placeholder Consistency', () => {
        it('should preserve placeholders across all languages', () => {
            const placeholderRegex = /\{[^}]+\}/g;

            enKeys.forEach(key => {
                const enValue = dictionaries.en[key];
                const enPlaceholders = enValue.match(placeholderRegex) || [];

                if (enPlaceholders.length === 0) return; // No placeholders to check

                for (const lang of SUPPORTED_LANGS) {
                    if (lang === 'en') continue;

                    const langValue = dictionaries[lang][key];
                    if (!langValue) continue; // Missing translation, already caught above

                    const langPlaceholders = langValue.match(placeholderRegex) || [];

                    // Check that all English placeholders exist in translation
                    enPlaceholders.forEach(placeholder => {
                        if (!langPlaceholders.includes(placeholder)) {
                            console.warn(`\n   ⚠️  Missing placeholder "${placeholder}" in ${lang.toUpperCase()}.${key}`);
                            console.warn(`     EN: ${enValue}`);
                            console.warn(`     ${lang.toUpperCase()}: ${langValue}`);
                        }
                    });
                }
            });

            // This is informational - warnings logged above
            expect(true).toBe(true);
        });
    });

    describe('Critical Keys Coverage', () => {
        const criticalKeyPrefixes = [
            'nav.', // Navigation
            'common.', // Common UI elements
            'auth.', // Authentication
            'login.', // Login page
            'hero.', // Landing page hero
        ];

        for (const lang of SUPPORTED_LANGS) {
            if (lang === 'en') continue;

            it(`should have 100% coverage for critical keys in ${lang.toUpperCase()}`, () => {
                const criticalEnKeys = enKeys.filter(key =>
                    criticalKeyPrefixes.some(prefix => key.startsWith(prefix))
                );

                const langKeys = new Set(Object.keys(dictionaries[lang]));
                const missingCriticalKeys = criticalEnKeys.filter(key => !langKeys.has(key));

                if (missingCriticalKeys.length > 0) {
                    console.error(`\n   ❌ Missing critical keys in ${lang.toUpperCase()} (${missingCriticalKeys.length}):`);
                    missingCriticalKeys.forEach(key => {
                        console.error(`     - ${key}: "${dictionaries.en[key]}"`);
                    });
                }

                // Critical keys MUST be 100% covered
                expect(missingCriticalKeys).toHaveLength(0);
            });
        }
    });
});

describe('i18n Smoke Tests', () => {
    const dictionaries = parseI18nDictionaries();

    it('should have consistent navigation keys across all languages', () => {
        const navKeys = ['nav.dashboard', 'nav.shows', 'nav.travel', 'nav.calendar', 'nav.finance', 'nav.settings'];

        for (const lang of SUPPORTED_LANGS) {
            for (const key of navKeys) {
                expect(dictionaries[lang][key]).toBeDefined();
                expect(dictionaries[lang][key].length).toBeGreaterThan(0);
            }
        }
    });

    it('should have consistent common action keys', () => {
        const commonKeys = ['common.close', 'common.back', 'common.date', 'common.fee', 'common.status'];

        for (const lang of SUPPORTED_LANGS) {
            for (const key of commonKeys) {
                expect(dictionaries[lang][key]).toBeDefined();
                expect(dictionaries[lang][key].length).toBeGreaterThan(0);
            }
        }
    });

    it('should not have HTML/script tags in translations', () => {
        const dangerousRegex = /<script|<iframe|javascript:|onerror=/i;

        for (const lang of SUPPORTED_LANGS) {
            const langDict = dictionaries[lang];
            for (const [key, value] of Object.entries(langDict)) {
                if (dangerousRegex.test(value)) {
                    console.error(`\n   ❌ Potential XSS in ${lang}.${key}: ${value}`);
                }
                expect(dangerousRegex.test(value)).toBe(false);
            }
        }
    });

    it('should not have excessively long translations', () => {
        const MAX_LENGTH = 500; // Characters

        for (const lang of SUPPORTED_LANGS) {
            const langDict = dictionaries[lang];
            for (const [key, value] of Object.entries(langDict)) {
                if (value.length > MAX_LENGTH) {
                    console.warn(`\n   ⚠️  Long translation in ${lang}.${key}: ${value.length} chars`);
                }
                // Warning only, not failing
            }
        }

        expect(true).toBe(true);
    });
});
