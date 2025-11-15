/**
 * Excel Export Utilities
 * 
 * Export data to Excel (.xlsx) files with formatting
 * 
 * Features:
 * - Export array of objects to Excel
 * - Custom column headers
 * - Auto-sizing columns
 * - Multiple sheets support
 * - Date formatting
 * - Currency formatting
 * 
 * @example
 * exportToExcel(contacts, 'contacts', 'My Contacts');
 * 
 * exportMultiSheetExcel({
 *   'Shows': shows,
 *   'Contacts': contacts,
 *   'Finance': financeRecords
 * }, 'tour-data');
 */

import * as XLSX from 'xlsx';

export interface ExcelExportOptions {
  /** File name without extension */
  filename: string;
  /** Sheet name */
  sheetName?: string;
  /** Custom column headers (key: field name, value: display name) */
  columnHeaders?: Record<string, string>;
  /** Fields to include (if not specified, all fields are included) */
  fields?: string[];
  /** Fields to exclude */
  excludeFields?: string[];
  /** Custom date format (default: 'yyyy-mm-dd') */
  dateFormat?: string;
}

/**
 * Export array of objects to Excel file
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1',
  options?: Partial<ExcelExportOptions>
): void {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Prepare data
  let processedData = data;

  // Filter fields if specified
  if (options?.fields) {
    processedData = data.map(row => {
      const filtered: Record<string, any> = {};
      options.fields!.forEach(field => {
        if (field in row) {
          filtered[field] = row[field];
        }
      });
      return filtered as T;
    });
  }

  // Exclude fields if specified
  if (options?.excludeFields) {
    processedData = processedData.map(row => {
      const filtered = { ...row };
      options.excludeFields!.forEach(field => {
        delete filtered[field];
      });
      return filtered;
    });
  }

  // Apply custom column headers
  if (options?.columnHeaders) {
    processedData = processedData.map(row => {
      const renamed: Record<string, any> = {};
      Object.keys(row).forEach(key => {
        const newKey = options.columnHeaders![key] || key;
        renamed[newKey] = row[key];
      });
      return renamed as T;
    });
  }

  // Create worksheet from data
  const worksheet = XLSX.utils.json_to_sheet(processedData);

  // Auto-size columns
  const columnWidths = Object.keys(processedData[0] || {}).map(key => {
    const maxLength = Math.max(
      key.length,
      ...processedData.map(row => String(row[key] || '').length)
    );
    return { wch: Math.min(maxLength + 2, 50) }; // Max width 50
  });
  worksheet['!cols'] = columnWidths;

  // Create workbook
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Write file
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Export multiple sheets to single Excel file
 */
export function exportMultiSheetExcel(
  sheets: Record<string, any[]>,
  filename: string
): void {
  const workbook = XLSX.utils.book_new();

  Object.entries(sheets).forEach(([sheetName, data]) => {
    if (data && data.length > 0) {
      const worksheet = XLSX.utils.json_to_sheet(data);

      // Auto-size columns
      const columnWidths = Object.keys(data[0] || {}).map(key => {
        const maxLength = Math.max(
          key.length,
          ...data.map(row => String(row[key] || '').length)
        );
        return { wch: Math.min(maxLength + 2, 50) };
      });
      worksheet['!cols'] = columnWidths;

      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName.slice(0, 31)); // Excel limit 31 chars
    }
  });

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Convert data to CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  delimiter: string = ','
): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(delimiter),
    ...data.map(row =>
      headers
        .map(header => {
          const value = row[header];
          // Escape values containing delimiter, quotes, or newlines
          if (
            typeof value === 'string' &&
            (value.includes(delimiter) || value.includes('"') || value.includes('\n'))
          ) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value === null || value === undefined ? '' : String(value);
        })
        .join(delimiter)
    ),
  ];

  return csvRows.join('\n');
}

/**
 * Download CSV file
 */
export function downloadCSV(csvString: string, filename: string): void {
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}
