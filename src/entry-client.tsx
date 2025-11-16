/**
 * Client Entry Point for SSR
 *
 * Handles client-side hydration with React 18.
 */

import React from 'react';
import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import { KPIDataProvider } from './context/KPIDataContext';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './hooks/useTheme';
import { HighContrastProvider } from './context/HighContrastContext';
import { SettingsProvider } from './context/SettingsContext';
import { queryClient, QueryClientProvider } from './lib/react-query-advanced';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { logger } from './lib/logger';
import './styles/index.css';
import './styles/performance.css';

/**
 * Hydrate the app
 */
function hydrate() {
    const el = document.getElementById('root');

    if (!el) {
        logger.error('[Hydration] Root element not found');
        return;
    }

    logger.info('[Hydration] Starting React 18 hydration');

    hydrateRoot(
        el,
        <React.StrictMode>
            <ErrorBoundary>
                <QueryClientProvider client={queryClient}>
                    <ThemeProvider>
                        <HighContrastProvider>
                            <SettingsProvider>
                                <FinanceProvider>
                                    <KPIDataProvider>
                                        <App />
                                    </KPIDataProvider>
                                </FinanceProvider>
                            </SettingsProvider>
                        </HighContrastProvider>
                    </ThemeProvider>
                </QueryClientProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );

    logger.info('[Hydration] React 18 hydration complete');
}

// Start hydration when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', hydrate);
} else {
    hydrate();
}
