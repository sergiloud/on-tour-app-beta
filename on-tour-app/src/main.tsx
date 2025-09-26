import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import { KPIDataProvider } from './context/KPIDataContext';
import { FinanceProvider } from './context/FinanceContext';
import { ThemeProvider } from './hooks/useTheme';
import { HighContrastProvider } from './context/HighContrastContext';
import { SettingsProvider } from './context/SettingsContext';
import { initTelemetry } from './lib/telemetry';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './styles/index.css';

const el = document.getElementById('root');
if (el) {
  initTelemetry();
  const root = createRoot(el);
  const queryClient = new QueryClient();
  root.render(
    <ThemeProvider>
      <HighContrastProvider>
        <SettingsProvider>
          <QueryClientProvider client={queryClient}>
            <FinanceProvider>
              <KPIDataProvider>
                <App />
              </KPIDataProvider>
            </FinanceProvider>
          </QueryClientProvider>
        </SettingsProvider>
      </HighContrastProvider>
    </ThemeProvider>
  );
}
