/**
 * i18next Configuration
 *
 * Initializes i18next with:
 * - Namespace separation (common, profile, finance, travel)
 * - Browser language detection
 * - Lazy loading of language bundles
 * - Fallback to English
 * - secureStorage for language preference persistence
 *
 * @module lib/i18n/config
 */

import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import { secureStorage } from '../secureStorage';
import { logger } from '../logger';

// Language type
export type Language = 'en' | 'es' | 'fr' | 'de' | 'it' | 'pt';

// Supported languages
export const SUPPORTED_LANGUAGES: Record<Language, string> = {
  en: 'English',
  es: 'Español',
  fr: 'Français',
  de: 'Deutsch',
  it: 'Italiano',
  pt: 'Português',
};

/**
 * Dynamic import for language resources
 * This allows lazy-loading of translation files
 */
const loadLanguageResources = async (
  lng: Language,
  namespace: string
): Promise<any> => {
  try {
    const module = await import(`../../locales/${lng}/${namespace}.json`);
    return module.default || module;
  } catch (err) {
    logger.warn(`Failed to load ${lng}/${namespace}`, {
      component: 'i18n',
      language: lng,
      namespace
    });
    // Fallback to English
    if (lng !== 'en') {
      const fallback = await import(`../../locales/en/${namespace}.json`);
      return fallback.default || fallback;
    }
    return {};
  }
};

/**
 * Custom backend for i18next with lazy loading
 */
const lazyLoadBackend = {
  type: 'backend',
  init: function init() {},
  read: async function read(
    language: string,
    namespace: string,
    callback: any
  ) {
    try {
      const resources = await loadLanguageResources(
        language as Language,
        namespace
      );
      callback(null, resources);
    } catch (error) {
      logger.error(`Error loading ${language}/${namespace}`, error instanceof Error ? error : new Error(String(error)), {
        component: 'i18n',
        language,
        namespace
      });
      callback(error, null);
    }
  },
};

/**
 * Initialize i18next
 */
export async function initializeI18n() {
  // Detect saved language from secure storage, then browser preference
  const savedLang = secureStorage.getItem<Language>('app.language');
  const detectedLang = savedLang || detectBrowserLanguage();

  return i18next
    .use(lazyLoadBackend as any)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init(
      {
        lng: detectedLang,
        fallbackLng: 'en',
        defaultNS: 'common',
        ns: ['common', 'profile', 'finance', 'travel'],
        load: 'languageOnly',

        // Disable auto detection during init since we handle it manually
        detection: {
          order: [],
          caches: [],
        },

        // Interpolation configuration
        interpolation: {
          escapeValue: false, // React handles XSS
          formatSeparator: ',',
        },

        // React i18next options
        react: {
          useSuspense: false, // Don't suspend on initial load
          bindI18n: 'languageChanged loaded',
          bindI18nStore: 'added removed',
          transEmptyNodeValue: '',
          transSupportBasicHtmlNodes: true,
          transKeepBasicHtmlNodesFor: ['br', 'strong', 'i', 'em'],
        },

        // Disable warnings for development
        saveMissing: false,
        missingKeyHandler: (lngs: readonly string[], ns: string, key: string) => {
          logger.warn(`Missing translation: ${ns}:${key}`, {
            component: 'i18n',
            namespace: ns,
            key
          });
        },
      },
      (err) => {
        if (err) {
          logger.error('Initialization error', err instanceof Error ? err : new Error(String(err)), {
            component: 'i18n'
          });
        }
      }
    );
}

/**
 * Detect browser language, filter to supported languages
 */
export function detectBrowserLanguage(): Language {
  // Try navigator.language first
  const browserLang = navigator.language?.split('-')[0] as Language;

  // Check if browser language is supported
  if (browserLang && browserLang in SUPPORTED_LANGUAGES) {
    return browserLang;
  }

  // Try from navigator.languages array
  for (const lang of navigator.languages || []) {
    const shortLang = lang.split('-')[0] as Language;
    if (shortLang in SUPPORTED_LANGUAGES) {
      return shortLang;
    }
  }

  // Fallback to English
  return 'en';
}

/**
 * Change language and persist to storage
 */
export async function changeLanguage(lang: Language) {
  try {
    await i18next.changeLanguage(lang);
    secureStorage.setItem('app.language', lang);
    return lang;
  } catch (err) {
    logger.error('Error changing language', err instanceof Error ? err : new Error(String(err)), {
      component: 'i18n',
      language: lang
    });
    throw err;
  }
}

/**
 * Get current language
 */
export function getCurrentLanguage(): Language {
  return (i18next.language || 'en') as Language;
}

/**
 * Get all available languages
 */
export function getAvailableLanguages(): Language[] {
  return Object.keys(SUPPORTED_LANGUAGES) as Language[];
}

export default i18next;
