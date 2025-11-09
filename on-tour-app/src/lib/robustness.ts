/**
 * Robustness utilities index
 * Central export point for all robustness-related utilities
 */

// Validators and type guards
export {
  isValidShow,
  isValidTransaction,
  isValidItinerary,
  safeParseNumber,
  safeParseDate,
  safeString,
  isValidArray,
  safeFilterArray,
  hasRequiredKeys,
  safeJsonParse,
  isValidCurrency,
  isValidISODate,
  isValidEmail,
} from './validators';

// Safe API utilities
export {
  safeFetch,
  safeStorage,
  debounceAsync,
  retryWithBackoff,
  withTimeout,
  safePromiseAll,
} from './safeApi';

export type { FetchOptions, ApiResponse } from './safeApi';

// Safe data transformation
export {
  safeMap,
  safeFilter,
  safeReduce,
  safeMerge,
  safeParallel,
  safeClone,
  chunkArray,
  uniqueBy,
  groupBy,
  getProp,
  getNestedProp,
} from './safeTransform';

// Sanitization (existing file)
export {
  sanitizeHTML,
  sanitizeName,
} from './sanitize';

/**
 * Example usage:
 *
 * ```typescript
 * import { safeFetch, isValidShow, safeMap } from '@/lib/robustness';
 *
 * // Safe API call with retry
 * const { data, error } = await safeFetch('/api/shows', {
 *   retries: 3,
 *   timeout: 5000
 * });
 *
 * // Validate and transform data
 * if (data && isValidArray(data, isValidShow)) {
 *   const transformed = safeMap(data, show => ({
 *     ...show,
 *     displayName: sanitizeName(show.venue)
 *   }));
 * }
 * ```
 */

/**
 * Best practices for robust code:
 *
 * 1. Always validate external data with type guards
 * 2. Use safe transformation functions for array operations
 * 3. Wrap API calls with error handling and retries
 * 4. Sanitize user input before display or storage
 * 5. Provide fallback values for all critical operations
 * 6. Log errors with context for debugging
 * 7. Use ErrorBoundaries for React components
 * 8. Implement loading and error states in UI
 */
