/**
 * useI18nWithNext
 * Compatibility wrapper for gradual migration from custom i18n to i18next
 * 
 * This hook provides both:
 * 1. i18next-based translations (new way)
 * 2. Fallback to custom i18n system (legacy way)
 * 
 * Allows components to work during migration without breaking existing functionality.
 * 
 * @module hooks/useI18nWithNext
 */

import { useTranslation as useI18nextTranslation } from 'react-i18next';
import { useI18n, setLang as customSetLang, getLang } from '../lib/i18n';
import { getCurrentLanguage, changeLanguage } from '../lib/i18n/config';
import type { Language } from '../lib/i18n/config';

/**
 * Unified translation hook that works with both systems
 * 
 * Usage:
 * ```tsx
 * const { t, i18n } = useI18nWithNext();
 * 
 * // Use with namespace (i18next way)
 * t('profile:profile.title')
 * 
 * // Or use key directly (legacy way - falls back to custom i18n)
 * t('cmd.go.profile')
 * ```
 */
export function useI18nWithNext() {
  // Get i18next translation function
  const i18nextResult = useI18nextTranslation();
  const { t: i18nNext, i18n, ready } = i18nextResult;

  // Get custom i18n translation function for fallback
  const { t: customT } = useI18n();

  /**
   * Unified translation function
   * 1. First tries i18next (namespace:key format)
   * 2. Falls back to custom i18n system
   */
  const t = (key: string, options?: any): string => {
    // If key contains namespace separator, use i18next
    if (key.includes(':')) {
      try {
        const result = i18nNext(key, options);
        // Check if we got a valid translation
        if (typeof result === 'string' && result !== key) {
          return result;
        }
      } catch {
        // Fall through to custom i18n
      }
    }

    // Fall back to custom i18n system
    try {
      const customResult = customT(key);
      if (customResult && customResult !== key) {
        return customResult;
      }
    } catch {
      // Last resort: return the key itself
    }

    return key;
  };

  /**
   * Unified language change function
   * Updates both i18next and custom i18n
   */
  const setLang = async (lang: Language) => {
    try {
      // Update i18next
      await i18n.changeLanguage(lang);
      // Update custom i18n (for backward compatibility)
      customSetLang(lang as any);
      return lang;
    } catch (err) {
      console.error('[useI18nWithNext] Error changing language:', err);
      throw err;
    }
  };

  /**
   * Get current language from i18next
   */
  const getCurrentLang = (): Language => {
    return (i18n.language || 'en') as Language;
  };

  return {
    // Translation function
    t,
    // i18n instance for advanced use
    i18n,
    // Language operations
    language: getCurrentLang(),
    setLang,
    getCurrentLanguage: getCurrentLang,
    // Readiness flag
    ready,
    // Custom i18n for advanced fallback
    customT,
  };
}

/**
 * Utility: Get all supported languages
 */
export function getSupportedLanguages() {
  return ['en', 'es', 'fr', 'de', 'it', 'pt'] as const;
}

/**
 * Utility: Check if a language is supported
 */
export function isSupportedLanguage(lang: any): lang is Language {
  return ['en', 'es', 'fr', 'de', 'it', 'pt'].includes(lang);
}
