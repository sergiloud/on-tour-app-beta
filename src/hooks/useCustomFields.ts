import { useState, useCallback, useEffect } from 'react';
import type { CustomEventTypeConfig } from '../components/calendar/CustomFieldsModal';
import { trackEvent } from '../lib/telemetry';
import { useAuth } from '../context/AuthContext';
import FirestoreUserPreferencesService, { type CustomFieldConfig } from '../services/firestoreUserPreferencesService';

const STORAGE_KEY = 'calendar:custom-fields';

export function useCustomFields() {
  const [configurations, setConfigurations] = useState<Map<string, CustomEventTypeConfig>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const { userId } = useAuth();

  // Load from Firebase on mount (priority over localStorage)
  useEffect(() => {
    if (userId) {
      FirestoreUserPreferencesService.getUserPreferences(userId)
        .then(prefs => {
          if (prefs?.customFields) {
            const map = new Map(prefs.customFields.map((c: CustomFieldConfig) => [c.typeId, c as any]));
            setConfigurations(map);
            // Sync to localStorage for backwards compat
            localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs.customFields));
          }
        })
        .catch(err => console.error('Failed to load custom fields from Firebase:', err))
        .finally(() => setIsLoading(false));
    } else {
      // Fallback to localStorage if not logged in
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const configs = JSON.parse(stored) as CustomEventTypeConfig[];
          const map = new Map(configs.map((c) => [c.typeId, c]));
          setConfigurations(map);
        }
      } catch (err) {
        console.error('Failed to load custom field configurations:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [userId]);

  // Save to localStorage + Firebase whenever configurations change
  useEffect(() => {
    if (!isLoading) {
      const configs = Array.from(configurations.values());
      
      // Save to localStorage
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      } catch (err) {
        console.error('Failed to save custom field configurations to localStorage:', err);
      }

      // Sync to Firebase (cast to CustomFieldConfig which is compatible)
      if (userId) {
        FirestoreUserPreferencesService.saveCustomFields(userId, configs as any as CustomFieldConfig[])
          .catch(err => console.error('Failed to sync custom fields to Firebase:', err));
      }
    }
  }, [configurations, isLoading, userId]);

  const saveConfiguration = useCallback((config: CustomEventTypeConfig) => {
    setConfigurations((prev) => {
      const next = new Map(prev);
      next.set(config.typeId, config);
      return next;
    });
    trackEvent('calendar.custom-fields.save', { typeId: config.typeId, fieldCount: config.fields.length });
  }, []);

  const getConfiguration = useCallback(
    (typeId: string) => {
      return configurations.get(typeId);
    },
    [configurations]
  );

  const deleteConfiguration = useCallback((typeId: string) => {
    setConfigurations((prev) => {
      const next = new Map(prev);
      next.delete(typeId);
      return next;
    });
    trackEvent('calendar.custom-fields.delete', { typeId });
  }, []);

  const getAllConfigurations = useCallback(() => {
    return Array.from(configurations.values());
  }, [configurations]);

  const validateEventData = useCallback(
    (typeId: string, data: Record<string, any>) => {
      const config = configurations.get(typeId);
      if (!config) return { valid: true, errors: [] };

      const errors: string[] = [];

      for (const field of config.fields) {
        if (field.required && !data[field.id]) {
          errors.push(`${field.name} is required`);
        }

        if (data[field.id]) {
          // Type validation
          switch (field.type) {
            case 'number':
              if (typeof data[field.id] !== 'number' && isNaN(Number(data[field.id]))) {
                errors.push(`${field.name} must be a number`);
              }
              break;
            case 'date':
              if (!isValidDate(data[field.id])) {
                errors.push(`${field.name} must be a valid date`);
              }
              break;
            case 'select':
              if (field.options && !field.options.includes(String(data[field.id]))) {
                errors.push(`${field.name} must be one of: ${field.options.join(', ')}`);
              }
              break;
          }
        }
      }

      return {
        valid: errors.length === 0,
        errors,
      };
    },
    [configurations]
  );

  return {
    configurations,
    isLoading,
    saveConfiguration,
    getConfiguration,
    deleteConfiguration,
    getAllConfigurations,
    validateEventData,
  };
}

function isValidDate(value: any): boolean {
  if (typeof value === 'string') {
    return !isNaN(Date.parse(value));
  }
  if (value instanceof Date) {
    return !isNaN(value.getTime());
  }
  return false;
}
