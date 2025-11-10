/**
 * src/utils/parsing.ts
 *
 * Centralized parsing utilities for consistent data parsing
 *
 * Exports:
 * - parseDate: Parse strings to Date objects
 * - parseCurrency: Parse currency strings to numbers
 * - parseJSON: Safe JSON parsing
 */

/**
 * Parse date string to Date object
 *
 * Supports multiple formats:
 * - ISO 8601: "2024-11-03"
 * - ISO datetime: "2024-11-03T15:30:00Z"
 * - US format: "11/03/2024"
 * - Text format: "Nov 3, 2024"
 *
 * @example
 * parseDate('2024-11-03') // Date object
 * parseDate('11/03/2024') // Date object
 * parseDate('invalid') // null
 */
export function parseDate(
  dateString: string | null | undefined,
  fallback?: Date
): Date | null {
  if (!dateString) return fallback ?? null;

  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? (fallback ?? null) : d;
  } catch {
    return fallback ?? null;
  }
}

/**
 * Parse date string to ISO string (YYYY-MM-DD)
 *
 * @example
 * parseDateToISO('11/03/2024') // "2024-11-03"
 * parseDateToISO(new Date()) // "2024-11-03"
 */
export function parseDateToISO(date: string | Date | null | undefined): string | null {
  if (!date) return null;

  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return null;

    const isoString = d.toISOString().split('T')[0] ?? null;
    return isoString;
  } catch {
    return null;
  }
}

/**
 * Parse currency string to number
 *
 * Removes currency symbols and formatting
 *
 * @example
 * parseCurrency('$1,234.56') // 1234.56
 * parseCurrency('€1.234,56') // 1234.56 (European format)
 */
export function parseCurrency(
  currencyString: string | number | null | undefined
): number {
  if (currencyString === null || currencyString === undefined) return 0;

  if (typeof currencyString === 'number') return currencyString;

  try {
    // Remove common currency symbols and whitespace
    let cleaned = currencyString
      .replace(/[$€£¥₹₽₩₪₨₱₡₲₴₵]/g, '')
      .trim();

    // Handle different decimal separators
    // If there's both comma and period, figure out which is decimal
    if (cleaned.includes(',') && cleaned.includes('.')) {
      const lastComma = cleaned.lastIndexOf(',');
      const lastPeriod = cleaned.lastIndexOf('.');

      if (lastComma > lastPeriod) {
        // European format: 1.234,56
        cleaned = cleaned.replace(/\./g, '').replace(',', '.');
      } else {
        // US format: 1,234.56
        cleaned = cleaned.replace(/,/g, '');
      }
    } else if (cleaned.includes(',')) {
      // Could be thousands separator or decimal
      const parts = cleaned.split(',');
      if (parts[1] && parts[1].length === 2) {
        // Likely European: use as decimal
        cleaned = cleaned.replace('.', '').replace(',', '.');
      } else {
        // Likely US: remove it
        cleaned = cleaned.replace(/,/g, '');
      }
    }

    const num = parseFloat(cleaned);
    return isNaN(num) ? 0 : num;
  } catch {
    return 0;
  }
}

/**
 * Safe JSON parsing with fallback
 *
 * @example
 * parseJSON('{"key": "value"}') // { key: "value" }
 * parseJSON('invalid', {}) // {}
 */
export function parseJSON<T = any>(
  jsonString: string | null | undefined,
  fallback?: T
): T | null {
  if (!jsonString) return fallback ?? null;

  try {
    return JSON.parse(jsonString) as T;
  } catch {
    return fallback ?? null;
  }
}

/**
 * Parse query string to object
 *
 * @example
 * parseQueryString('?name=John&age=30') // { name: "John", age: "30" }
 */
export function parseQueryString(queryString: string): Record<string, string> {
  const query = queryString.startsWith('?') ? queryString.substring(1) : queryString;
  const params = new URLSearchParams(query);
  const result: Record<string, string> = {};

  params.forEach((value, key) => {
    result[key] = value;
  });

  return result;
}

/**
 * Parse comma-separated values
 *
 * @example
 * parseCSV('value1, value2, value3') // ["value1", "value2", "value3"]
 */
export function parseCSV(csvString: string): string[] {
  if (!csvString) return [];

  return csvString
    .split(',')
    .map(s => s.trim())
    .filter(s => s.length > 0);
}

/**
 * Parse time string (HH:MM) to minutes
 *
 * @example
 * parseTimeToMinutes('1:30') // 90
 * parseTimeToMinutes('00:45') // 45
 */
export function parseTimeToMinutes(timeString: string): number {
  if (!timeString) return 0;

  try {
    const parts = timeString.split(':');
    const hours = parseInt(parts[0] ?? '0', 10);
    const minutes = parseInt(parts[1] ?? '0', 10);

    if (isNaN(hours) || isNaN(minutes)) return 0;
    return hours * 60 + minutes;
  } catch {
    return 0;
  }
}

/**
 * Parse duration string to milliseconds
 *
 * Supports: "1d", "2h", "30m", "45s", "1d 2h 30m"
 *
 * @example
 * parseDuration('1h 30m') // 5400000 (ms)
 * parseDuration('2d') // 172800000 (ms)
 */
export function parseDuration(durationString: string): number {
  if (!durationString) return 0;

  const units: Record<string, number> = {
    d: 24 * 60 * 60 * 1000,
    h: 60 * 60 * 1000,
    m: 60 * 1000,
    s: 1000
  };

  let totalMs = 0;
  const regex = /(\d+)([dhms])/g;
  let match;

  while ((match = regex.exec(durationString)) !== null) {
    const valueStr = match[1];
    const unit = match[2];

    if (valueStr && unit) {
      const value = parseInt(valueStr, 10);
      if (!isNaN(value) && units[unit] !== undefined) {
        totalMs += value * units[unit];
      }
    }
  }

  return totalMs;
}
