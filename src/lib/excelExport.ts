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

import ExcelJS from 'exceljs';

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
export async function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Sheet1',
  options?: Partial<ExcelExportOptions>
): Promise<void> {
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
  const columnHeaders = options?.columnHeaders || {};
  const headers = Object.keys(processedData[0] || {});
  const displayHeaders = headers.map(key => columnHeaders[key] || key);

  // Create workbook and worksheet
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Add headers
  worksheet.columns = headers.map((key, index) => ({
    header: displayHeaders[index],
    key: key,
    width: 15, // Default width
  }));

  // Add data rows
  processedData.forEach(row => {
    worksheet.addRow(row);
  });

  // Auto-size columns based on content
  worksheet.columns.forEach(column => {
    if (!column.eachCell) return;
    let maxLength = 0;
    column.eachCell({ includeEmpty: false }, (cell) => {
      const cellValue = cell.value ? String(cell.value) : '';
      maxLength = Math.max(maxLength, cellValue.length);
    });
    column.width = Math.min(maxLength + 2, 50); // Max width 50
  });

  // Style header row
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE0E0E0' },
  };

  // Write to buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Export multiple sheets to single Excel file
 */
export async function exportMultiSheetExcel(
  sheets: Record<string, any[]>,
  filename: string
): Promise<void> {
  const workbook = new ExcelJS.Workbook();

  Object.entries(sheets).forEach(([sheetName, data]) => {
    if (data && data.length > 0) {
      const worksheet = workbook.addWorksheet(sheetName.slice(0, 31)); // Excel limit 31 chars
      
      // Get headers from first row
      const headers = Object.keys(data[0]);
      
      // Add columns
      worksheet.columns = headers.map(key => ({
        header: key,
        key: key,
        width: 15,
      }));

      // Add data rows
      data.forEach(row => {
        worksheet.addRow(row);
      });

      // Auto-size columns
      worksheet.columns.forEach(column => {
        if (!column.eachCell) return;
        let maxLength = 0;
        column.eachCell({ includeEmpty: false }, (cell) => {
          const cellValue = cell.value ? String(cell.value) : '';
          maxLength = Math.max(maxLength, cellValue.length);
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // Style header row
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };
    }
  });

  // Write to buffer and download
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}.xlsx`;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Convert data to CSV string
 */
export function convertToCSV<T extends Record<string, any>>(
  data: T[],
  delimiter: string = ','
): string {
  if (!data || data.length === 0) return '';

  const headers = Object.keys(data[0] || {});
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
