import { useState, useCallback, useEffect } from 'react';
import type { CustomEventTypeConfig } from '../components/calendar/CustomFieldsModal';
import { trackEvent } from '../lib/telemetry';

const STORAGE_KEY = 'calendar:custom-fields';

export function useCustomFields() {
  const [configurations, setConfigurations] = useState<Map<string, CustomEventTypeConfig>>(new Map());
  const [isLoading, setIsLoading] = useState(true);

  // Load from localStorage
  useEffect(() => {
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
  }, []);

  // Save to localStorage whenever configurations change
  useEffect(() => {
    if (!isLoading) {
      try {
        const configs = Array.from(configurations.values());
        localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      } catch (err) {
        console.error('Failed to save custom field configurations:', err);
      }
    }
  }, [configurations, isLoading]);

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
