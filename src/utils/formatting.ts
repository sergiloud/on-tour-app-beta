/**
 * src/utils/formatting.ts
 *
 * Centralized formatting utilities for consistent data presentation
 *
 * Exports:
 * - formatCurrency: Format numbers as currency
 * - formatDate: Format dates to readable strings
 * - formatNumber: Format numbers with thousands separator
 * - formatPercent: Format numbers as percentages
 * - formatTime: Format durations
 */

/**
 * Format a number as currency with symbol and decimals
 *
 * @example
 * formatCurrency(1234.56, 'USD') // "$1,234.56"
 * formatCurrency(1234.56, 'EUR') // "€1,234.56"
 * formatCurrency(1234.56, 'GBP', 'en-GB') // "£1,234.56"
 */
export function formatCurrency(
  value: number | string,
  currency: string = 'USD',
  locale: string = 'en-US',
  options?: {
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  }
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '$0.00';

  try {
    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
      minimumFractionDigits: options?.minimumFractionDigits ?? 2,
      maximumFractionDigits: options?.maximumFractionDigits ?? 2
    }).format(num);
  } catch {
    // Fallback for unsupported currencies
    return `${currency} ${num.toFixed(2)}`;
  }
}

/**
 * Format a number with thousands separator
 *
 * @example
 * formatNumber(1234567) // "1,234,567"
 * formatNumber(1234.56, 2) // "1,234.56"
 */
export function formatNumber(
  value: number | string,
  decimals?: number,
  locale: string = 'en-US'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0';

  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

/**
 * Format a number as percentage
 *
 * @example
 * formatPercent(0.1234) // "12.34%"
 * formatPercent(0.1234, 0) // "12%"
 */
export function formatPercent(
  value: number | string,
  decimals: number = 2,
  locale: string = 'en-US'
): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) return '0%';

  return new Intl.NumberFormat(locale, {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(num);
}

/**
 * Format a date to a readable string
 *
 * @example
 * formatDate(new Date('2024-11-03')) // "Nov 3, 2024"
 * formatDate(new Date('2024-11-03'), 'short') // "11/3/24"
 * formatDate(new Date('2024-11-03'), 'long', 'es-ES') // "3 de noviembre de 2024"
 */
export function formatDate(
  date: Date | string | null | undefined,
  format: 'short' | 'medium' | 'long' | 'full' = 'medium',
  locale: string = 'en-US'
): string {
  if (!date) return '';

  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) return '';

  const optionsMap: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: 'numeric', day: 'numeric', year: '2-digit' },
    medium: { month: 'short', day: 'numeric', year: 'numeric' },
    long: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' },
    full: { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }
  };

  const options = optionsMap[format] || optionsMap.medium;
  return new Intl.DateTimeFormat(locale, options).format(d);
}

/**
 * Format a time duration in seconds to a readable string
 *
 * @example
 * formatTime(3661) // "1h 1m 1s"
 * formatTime(65) // "1m 5s"
 * formatTime(45) // "45s"
 */
export function formatTime(seconds: number): string {
  if (seconds < 0) return '';

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

/**
 * Format file size to human readable string
 *
 * @example
 * formatFileSize(1024) // "1 KB"
 * formatFileSize(1048576) // "1 MB"
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exponent = Math.floor(Math.log(bytes) / Math.log(1024));

  if (exponent >= units.length) return `${(bytes / Math.pow(1024, units.length - 1)).toFixed(2)} ${units[units.length - 1]}`;

  return `${(bytes / Math.pow(1024, exponent)).toFixed(2)} ${units[exponent]}`;
}

/**
 * Truncate a string to a maximum length with ellipsis
 *
 * @example
 * truncateString('Hello World', 8) // "Hello..."
 */
export function truncateString(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Capitalize first letter of string
 *
 * @example
 * capitalize('hello') // "Hello"
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format phone number
 *
 * @example
 * formatPhoneNumber('5551234567') // "(555) 123-4567"
 */
export function formatPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}
