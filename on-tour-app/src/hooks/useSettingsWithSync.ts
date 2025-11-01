/**
 * useSettingsWithSync
 * Hook that ensures SettingsContext is backed by useSettingsSync
 * 
 * The SettingsContext already handles persistence via saveSettings/upsertUserPrefs.
 * This hook ensures those changes are also synced via useSettingsSync for
 * multi-tab coordination and versioning.
 * 
 * @module useSettingsWithSync
 */

import { useCallback, useEffect, useRef } from 'react';
import { useSettings } from '../context/SettingsContext';
import { useSettingsSync } from './useSettingsSync';
import { getCurrentUserId } from '../lib/demoAuth';

export interface UseSettingsWithSyncOptions {
  debounceMs?: number;
}

/**
 * Hook that integrates SettingsContext with multi-tab sync
 * 
 * This ensures that all settings changes are:
 * 1. Persisted to localStorage via SettingsContext
 * 2. Broadcasted to other tabs via CustomEvent
 * 3. Tracked with version and timestamp
 * 
 * Usage:
 * ```tsx
 * const context = useSettingsWithSync({ debounceMs: 300 });
 * // Use context methods normally (setCurrency, setLang, etc.)
 * context.setCurrency('USD');
 * ```
 */
export function useSettingsWithSync(
  options: UseSettingsWithSyncOptions = {}
) {
  const settingsContext = useSettings();
  const userId = getCurrentUserId();

  // Snapshot current settings
  const currentSettings = {
    currency: settingsContext.currency,
    unit: settingsContext.unit,
    lang: settingsContext.lang,
    presentationMode: settingsContext.presentationMode,
    region: settingsContext.region,
    dateRange: settingsContext.dateRange,
    periodPreset: settingsContext.periodPreset,
    comparePrev: settingsContext.comparePrev,
    selectedStatuses: settingsContext.selectedStatuses,
    dashboardView: settingsContext.dashboardView,
    kpiTickerHidden: settingsContext.kpiTickerHidden,
    bookingAgencies: settingsContext.bookingAgencies,
    managementAgencies: settingsContext.managementAgencies,
  };

  // Initialize sync hook with current settings as initial data
  const sync = useSettingsSync(currentSettings, {
    debounceMs: options.debounceMs,
    userId,
  });

  // Track previous settings to detect changes
  const prevSettingsRef = useRef(currentSettings);

  // Whenever context settings change, queue a sync write
  useEffect(() => {
    const hasChanged = Object.entries(currentSettings).some(
      ([key, value]) => {
        const prev = prevSettingsRef.current[key as keyof typeof currentSettings];
        // Deep equality for arrays and objects
        if (Array.isArray(value) && Array.isArray(prev)) {
          return JSON.stringify(value) !== JSON.stringify(prev);
        }
        if (typeof value === 'object' && value !== null) {
          return JSON.stringify(value) !== JSON.stringify(prev);
        }
        return value !== prev;
      }
    );

    if (hasChanged) {
      prevSettingsRef.current = currentSettings;
      sync.save(currentSettings).catch((err) => {
        console.error('[useSettingsWithSync] Failed to sync:', err);
      });
    }
  }, [currentSettings, sync]);

  return {
    ...settingsContext,
    isDirty: sync.isDirty,
    isSyncing: sync.isSyncing,
    reload: sync.reload,
    clear: sync.clear,
  };
}
