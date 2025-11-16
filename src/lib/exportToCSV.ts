/**
 * CSV Export Utilities
 * 
 * Lightweight CSV export using papaparse for optimal performance
 * Use this for simple data exports where Excel formatting is not needed
 * 
 * Features:
 * - Fast CSV generation with papaparse
 * - Custom delimiters
 * - Proper escaping of special characters
 * - UTF-8 BOM support for Excel compatibility
 * - Column selection and filtering
 * 
 * @example
 * exportToCSV(contacts, 'contacts');
 * exportToCSV(shows, 'shows', { fields: ['name', 'date', 'venue'] });
 */

import Papa from 'papaparse';

export interface CSVExportOptions {
  /** Fields to include (if not specified, all fields are included) */
  fields?: string[];
  /** Fields to exclude */
  excludeFields?: string[];
  /** Custom column headers (key: field name, value: display name) */
  columnHeaders?: Record<string, string>;
  /** Delimiter character (default: ',') */
  delimiter?: string;
  /** Include UTF-8 BOM for Excel compatibility (default: true) */
  includeBOM?: boolean;
}

/**
 * Export array of objects to CSV file
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  options: CSVExportOptions = {}
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  const {
    fields,
    excludeFields = [],
    columnHeaders = {},
    delimiter = ',',
    includeBOM = true,
  } = options;

  // Prepare data
  let processedData = [...data];

  // Filter fields if specified
  if (fields) {
    processedData = processedData.map(row => {
      const filtered: Record<string, any> = {};
      fields.forEach(field => {
        if (field in row) {
          filtered[field] = row[field];
        }
      });
      return filtered as T;
    });
  }

  // Exclude fields if specified
  if (excludeFields.length > 0) {
    processedData = processedData.map(row => {
      const filtered = { ...row };
      excludeFields.forEach(field => {
        delete filtered[field];
      });
      return filtered;
    });
  }

  // Get final headers
  const headers = Object.keys(processedData[0] || {});
  const displayHeaders = headers.map(key => columnHeaders[key] || key);

  // Convert to CSV using papaparse
  const csv = Papa.unparse({
    fields: displayHeaders,
    data: processedData.map(row => {
      return headers.map(key => {
        const value = row[key];
        // Handle dates
        if (value instanceof Date) {
          return value.toISOString();
        }
        // Handle null/undefined
        if (value === null || value === undefined) {
          return '';
        }
        return value;
      });
    }),
  }, {
    delimiter,
    newline: '\n',
    quotes: true, // Quote all fields for safety
  });

  // Add UTF-8 BOM for Excel compatibility
  const csvWithBOM = includeBOM ? '\uFEFF' + csv : csv;

  // Create blob and download
  const blob = new Blob([csvWithBOM], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.csv`;
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Convert data to CSV string
 * Useful when you need the CSV content without triggering download
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  options: Omit<CSVExportOptions, 'includeBOM'> = {}
): string {
  if (!data || data.length === 0) return '';

  const {
    fields,
    excludeFields = [],
    columnHeaders = {},
    delimiter = ',',
  } = options;

  // Prepare data (same logic as exportToCSV)
  let processedData = [...data];

  if (fields) {
    processedData = processedData.map(row => {
      const filtered: Record<string, any> = {};
      fields.forEach(field => {
        if (field in row) {
          filtered[field] = row[field];
        }
      });
      return filtered as T;
    });
  }

  if (excludeFields.length > 0) {
    processedData = processedData.map(row => {
      const filtered = { ...row };
      excludeFields.forEach(field => {
        delete filtered[field];
      });
      return filtered;
    });
  }

  const headers = Object.keys(processedData[0] || {});
  const displayHeaders = headers.map(key => columnHeaders[key] || key);

  return Papa.unparse({
    fields: displayHeaders,
    data: processedData.map(row => {
      return headers.map(key => {
        const value = row[key];
        if (value instanceof Date) {
          return value.toISOString();
        }
        if (value === null || value === undefined) {
          return '';
        }
        return value;
      });
    }),
  }, {
    delimiter,
    newline: '\n',
    quotes: true,
  });
}
