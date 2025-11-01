/**
 * I18nProvider
 * Initializes and provides i18next to the application
 * 
 * This component should wrap the entire app in main.tsx
 * It ensures i18next is properly initialized before rendering components.
 * 
 * @module components/I18nProvider
 */

import React, { useEffect, useState } from 'react';
import { I18nextProvider } from 'react-i18next';
import i18next, { initializeI18n } from '../lib/i18n/config';

export interface I18nProviderProps {
  children: React.ReactNode;
}

/**
 * Provider component that initializes i18next
 * 
 * Usage in main.tsx:
 * ```tsx
 * import { I18nProvider } from './components/I18nProvider';
 * 
 * root.render(
 *   <I18nProvider>
 *     <App />
 *   </I18nProvider>
 * );
 * ```
 */
export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize i18next on mount
    const init = async () => {
      try {
        await initializeI18n();
        setIsReady(true);
      } catch (err) {
        console.error('[I18nProvider] Error initializing i18next:', err);
        // Set ready anyway to prevent infinite loading
        setIsReady(true);
      }
    };

    init();
  }, []);

  // Show loading until i18next is ready
  if (!isReady) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <div className="mb-4 animate-spin">
            <div className="h-12 w-12 border-4 border-blue-500 border-t-transparent rounded-full mx-auto" />
          </div>
          <p className="text-gray-600 dark:text-gray-400">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <I18nextProvider i18n={i18next}>
      {children}
    </I18nextProvider>
  );
};

export default I18nProvider;
