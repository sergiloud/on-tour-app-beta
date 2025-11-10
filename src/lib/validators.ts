/**
 * Runtime type guards and validators
 * Provides type-safe validation for data coming from external sources
 */

import type { Show } from '../lib/shows';
import type { TransactionV3 } from '../types/financeV3';
import type { Itinerary } from '../services/travelApi';

/**
 * Type guard for Show objects
 */
export function isValidShow(data: unknown): data is Show {
  if (!data || typeof data !== 'object') return false;

  const show = data as Partial<Show>;

  return (
    typeof show.id === 'string' &&
    typeof show.date === 'string' &&
    typeof show.venue === 'string' &&
    typeof show.city === 'string' &&
    (show.status === undefined ||
      ['confirmed', 'pending', 'offer', 'canceled', 'archived', 'postponed'].includes(show.status))
  );
}

/**
 * Type guard for Transaction objects
 */
export function isValidTransaction(data: unknown): data is TransactionV3 {
  if (!data || typeof data !== 'object') return false;

  const tx = data as Partial<TransactionV3>;

  return (
    typeof tx.id === 'string' &&
    typeof tx.date === 'string' &&
    typeof tx.amount === 'number' &&
    !isNaN(tx.amount) &&
    typeof tx.category === 'string' &&
    (tx.type === 'income' || tx.type === 'expense')
  );
}

/**
 * Type guard for Itinerary objects
 */
export function isValidItinerary(data: unknown): data is Itinerary {
  if (!data || typeof data !== 'object') return false;

  const itinerary = data as Partial<Itinerary>;

  return (
    typeof itinerary.id === 'string' &&
    typeof itinerary.date === 'string' &&
    typeof itinerary.title === 'string' &&
    (itinerary.team === 'A' || itinerary.team === 'B')
  );
}

/**
 * Safe number parser with fallback
 */
export function safeParseNumber(value: unknown, fallback: number = 0): number {
  if (typeof value === 'number' && !isNaN(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = parseFloat(value);
    return isNaN(parsed) ? fallback : parsed;
  }

  return fallback;
}

/**
 * Safe date parser with fallback
 */
export function safeParseDate(value: unknown, fallback?: Date): Date {
  if (value instanceof Date && !isNaN(value.getTime())) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  if (typeof value === 'number') {
    const parsed = new Date(value);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }
  }

  return fallback || new Date();
}

/**
 * Safe string sanitizer
 */
export function safeString(value: unknown, fallback: string = ''): string {
  if (typeof value === 'string') {
    return value.trim();
  }

  if (value === null || value === undefined) {
    return fallback;
  }

  try {
    return String(value).trim();
  } catch {
    return fallback;
  }
}

/**
 * Array validator with type guard
 */
export function isValidArray<T>(
  data: unknown,
  validator: (item: unknown) => item is T
): data is T[] {
  if (!Array.isArray(data)) return false;
  return data.every(validator);
}

/**
 * Safe array filter with type guard
 */
export function safeFilterArray<T>(
  data: unknown,
  validator: (item: unknown) => item is T
): T[] {
  if (!Array.isArray(data)) return [];
  return data.filter(validator);
}

/**
 * Object key validator
 */
export function hasRequiredKeys<T extends Record<string, unknown>>(
  obj: unknown,
  requiredKeys: (keyof T)[]
): obj is T {
  if (!obj || typeof obj !== 'object') return false;

  return requiredKeys.every(key =>
    key in obj && (obj as Record<string, unknown>)[key as string] !== undefined
  );
}

/**
 * Safe JSON parse with fallback
 */
export function safeJsonParse<T>(json: string, fallback: T): T {
  try {
    const parsed = JSON.parse(json);
    return parsed as T;
  } catch {
    return fallback;
  }
}

/**
 * Currency code validator
 */
export function isValidCurrency(code: unknown): code is 'EUR' | 'USD' | 'GBP' {
  return typeof code === 'string' && ['EUR', 'USD', 'GBP'].includes(code);
}

/**
 * ISO date string validator (YYYY-MM-DD)
 */
export function isValidISODate(date: unknown): date is string {
  if (typeof date !== 'string') return false;

  const isoRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!isoRegex.test(date)) return false;

  const parsed = new Date(date);
  return !isNaN(parsed.getTime());
}

/**
 * Email validator
 */
export function isValidEmail(email: unknown): email is string {
  if (typeof email !== 'string') return false;

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}
