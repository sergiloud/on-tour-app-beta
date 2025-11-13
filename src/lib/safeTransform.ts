/**
 * Robust data transformation utilities
 * Ensures data integrity during transformations
 */

import { safeParseNumber, safeParseDate, safeString } from './validators';
import { logger } from './logger';

/**
 * Safe array map with error handling
 */
export function safeMap<T, U>(
  array: T[],
  transform: (item: T, index: number) => U,
  fallback: U[] = []
): U[] {
  if (!Array.isArray(array)) {
    logger.error('Input is not an array', new Error('Invalid input'), {
      component: 'safeMap'
    });
    return fallback;
  }

  const results: U[] = [];

  for (let i = 0; i < array.length; i++) {
    try {
      const item = array[i];
      if (item !== undefined) {
        results.push(transform(item, i));
      }
    } catch (error) {
      logger.error(`Error transforming item at index ${i}`, error instanceof Error ? error : new Error(String(error)), {
        component: 'safeMap',
        index: i
      });
      // Continue processing other items
    }
  }

  return results;
}

/**
 * Safe array filter with error handling
 */
export function safeFilter<T>(
  array: T[],
  predicate: (item: T, index: number) => boolean
): T[] {
  if (!Array.isArray(array)) {
    logger.error('Input is not an array', new Error('Invalid input'), {
      component: 'safeFilter'
    });
    return [];
  }

  const results: T[] = [];

  for (let i = 0; i < array.length; i++) {
    try {
      const item = array[i];
      if (item !== undefined && predicate(item, i)) {
        results.push(item);
      }
    } catch (error) {
      logger.error(`Error filtering item at index ${i}`, error instanceof Error ? error : new Error(String(error)), {
        component: 'safeFilter',
        index: i
      });
      // Continue processing other items
    }
  }

  return results;
}

/**
 * Safe array reduce with error handling
 */
export function safeReduce<T, U>(
  array: T[],
  reducer: (acc: U, item: T, index: number) => U,
  initial: U
): U {
  if (!Array.isArray(array)) {
    logger.error('Input is not an array', new Error('Invalid input'), {
      component: 'safeReduce'
    });
    return initial;
  }

  let accumulator = initial;

  for (let i = 0; i < array.length; i++) {
    try {
      const item = array[i];
      if (item !== undefined) {
        accumulator = reducer(accumulator, item, i);
      }
    } catch (error) {
      logger.error(`Error reducing item at index ${i}`, error instanceof Error ? error : new Error(String(error)), {
        component: 'safeReduce',
        index: i
      });
      // Continue with current accumulator
    }
  }

  return accumulator;
}

/**
 * Safe object merge with deep cloning
 */
export function safeMerge<T extends Record<string, any>>(
  target: T,
  ...sources: Partial<T>[]
): T {
  try {
    const result = { ...target };

    for (const source of sources) {
      if (!source || typeof source !== 'object') continue;

      for (const key in source) {
        if (Object.prototype.hasOwnProperty.call(source, key)) {
          const value = source[key];

          // Deep merge for objects
          if (
            value &&
            typeof value === 'object' &&
            !Array.isArray(value) &&
            result[key] &&
            typeof result[key] === 'object'
          ) {
            result[key] = safeMerge(result[key], value);
          } else {
            result[key] = value as any;
          }
        }
      }
    }

    return result;
  } catch (error) {
    logger.error('Error merging objects', error instanceof Error ? error : new Error(String(error)), {
      component: 'safeMerge'
    });
    return target;
  }
}

/**
 * Safe JSON parse with schema validation
 */
export function safeJsonParse<T>(
  json: string,
  validator?: (data: unknown) => data is T,
  fallback?: T
): T | null {
  try {
    const parsed = JSON.parse(json);

    if (validator && !validator(parsed)) {
      logger.warn('Data failed validation', {
        component: 'safeJsonParse'
      });
      return fallback ?? null;
    }

    return parsed as T;
  } catch (error) {
    logger.error('Parse error', error instanceof Error ? error : new Error(String(error)), {
      component: 'safeJsonParse'
    });
    return fallback ?? null;
  }
}

/**
 * Safe async parallel execution with error isolation
 */
export async function safeParallel<T>(
  tasks: Array<() => Promise<T>>,
  options: {
    continueOnError?: boolean;
    maxConcurrency?: number;
  } = {}
): Promise<Array<{ success: boolean; data?: T; error?: Error }>> {
  const { continueOnError = true, maxConcurrency = Infinity } = options;
  const results: Array<{ success: boolean; data?: T; error?: Error }> = [];

  // Execute in batches if maxConcurrency is set
  if (maxConcurrency < Infinity) {
    for (let i = 0; i < tasks.length; i += maxConcurrency) {
      const batch = tasks.slice(i, i + maxConcurrency);
      const batchResults = await Promise.allSettled(
        batch.map(task => task())
      );

      for (const result of batchResults) {
        if (result.status === 'fulfilled') {
          results.push({ success: true, data: result.value });
        } else {
          results.push({
            success: false,
            error: result.reason instanceof Error
              ? result.reason
              : new Error(String(result.reason))
          });

          if (!continueOnError) {
            throw result.reason;
          }
        }
      }
    }
  } else {
    // Execute all at once
    const allResults = await Promise.allSettled(
      tasks.map(task => task())
    );

    for (const result of allResults) {
      if (result.status === 'fulfilled') {
        results.push({ success: true, data: result.value });
      } else {
        results.push({
          success: false,
          error: result.reason instanceof Error
            ? result.reason
            : new Error(String(result.reason))
        });

        if (!continueOnError) {
          throw result.reason;
        }
      }
    }
  }

  return results;
}

/**
 * Safe deep clone
 */
export function safeClone<T>(obj: T): T {
  try {
    // Use structured clone if available (modern browsers)
    if (typeof structuredClone === 'function') {
      return structuredClone(obj);
    }

    // Fallback to JSON parse/stringify
    return JSON.parse(JSON.stringify(obj));
  } catch (error) {
    logger.error('Clone error', error instanceof Error ? error : new Error(String(error)), {
      component: 'safeClone'
    });
    return obj;
  }
}

/**
 * Chunk array into smaller pieces
 */
export function chunkArray<T>(array: T[], size: number): T[][] {
  if (!Array.isArray(array) || size <= 0) {
    return [];
  }

  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }

  return chunks;
}

/**
 * Remove duplicates from array with custom key
 */
export function uniqueBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): T[] {
  const seen = new Set<string | number>();
  const result: T[] = [];

  for (const item of array) {
    try {
      const key = keyFn(item);
      if (!seen.has(key)) {
        seen.add(key);
        result.push(item);
      }
    } catch (error) {
      logger.error('Error getting key', error instanceof Error ? error : new Error(String(error)), {
        component: 'uniqueBy'
      });
    }
  }

  return result;
}

/**
 * Group array by key
 */
export function groupBy<T>(
  array: T[],
  keyFn: (item: T) => string | number
): Map<string | number, T[]> {
  const groups = new Map<string | number, T[]>();

  for (const item of array) {
    try {
      const key = keyFn(item);
      const group = groups.get(key) || [];
      group.push(item);
      groups.set(key, group);
    } catch (error) {
      logger.error('Error grouping item', error instanceof Error ? error : new Error(String(error)), {
        component: 'groupBy'
      });
    }
  }

  return groups;
}

/**
 * Safe property access with default
 */
export function getProp<T, K extends keyof T>(
  obj: T,
  key: K,
  fallback: T[K]
): T[K] {
  try {
    const value = obj?.[key];
    return value !== undefined ? value : fallback;
  } catch {
    return fallback;
  }
}

/**
 * Safe nested property access
 */
export function getNestedProp<T>(
  obj: any,
  path: string,
  fallback: T
): T {
  try {
    const keys = path.split('.');
    let result = obj;

    for (const key of keys) {
      if (result === null || result === undefined) {
        return fallback;
      }
      result = result[key];
    }

    return result !== undefined ? result : fallback;
  } catch {
    return fallback;
  }
}
