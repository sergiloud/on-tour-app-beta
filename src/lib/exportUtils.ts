/**
 * Export Utilities for Finance Analysis
 * Handles CSV and XLSX generation from financial data
 */

import { logger } from './logger';

export type ExportFormat = 'csv' | 'xlsx';

/**
 * Convert array of objects to CSV string
 */
export function arrayToCSV(data: Array<Record<string, any>>, headers?: string[]): string {
  if (data.length === 0) return '';

  // Use provided headers or extract from first object
  const cols = headers || Object.keys(data[0] || {});
  
  // Build CSV rows
  const rows = data.map(row => 
    cols.map(col => {
      const value = row[col];
      // Handle values that need quoting (contains comma, newline, or quote)
      if (value == null) return '';
      const str = String(value);
      if (str.includes(',') || str.includes('\n') || str.includes('"')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );

  // Add header row
  const csvContent = [
    cols.join(','),
    ...rows
  ].join('\n');

  return csvContent;
}

/**
 * Download string content as file
 */
export function downloadFile(content: string, filename: string, mimeType: string): void {
  try {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    logger.info('[ExportUtils] File downloaded successfully', { filename, size: content.length });
  } catch (error) {
    logger.error('[ExportUtils] Failed to download file', error as Error, { filename });
    throw error;
  }
}

/**
 * Export data as CSV file
 */
export function exportToCSV(
  data: Array<Record<string, any>>,
  filename: string,
  headers?: string[]
): void {
  const csv = arrayToCSV(data, headers);
  const finalFilename = filename.endsWith('.csv') ? filename : `${filename}.csv`;
  downloadFile(csv, finalFilename, 'text/csv;charset=utf-8');
}

/**
 * Export data as XLSX file
 * NOTE: This is a simplified implementation. For full XLSX support, install 'xlsx' package:
 * npm install xlsx
 * import * as XLSX from 'xlsx';
 */
export function exportToXLSX(
  data: Array<Record<string, any>>,
  filename: string,
  sheetName: string = 'Sheet1'
): void {
  try {
    // Check if xlsx library is available (optional dependency)
    const XLSX = (window as any).XLSX;
    
    if (XLSX) {
      // Use proper XLSX library if available
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      const finalFilename = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
      XLSX.writeFile(workbook, finalFilename);
      
      logger.info('[ExportUtils] XLSX file downloaded successfully', { filename, rows: data.length });
    } else {
      // Fallback to CSV if XLSX library not available
      logger.warn('[ExportUtils] XLSX library not available, falling back to CSV');
      exportToCSV(data, filename.replace('.xlsx', '.csv'));
    }
  } catch (error) {
    logger.error('[ExportUtils] Failed to export XLSX', error as Error, { filename });
    throw error;
  }
}

/**
 * Format number as currency string for export
 */
export function formatCurrency(value: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

/**
 * Format percentage for export
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date for export
 */
export function formatDate(date: Date | string, format: 'short' | 'long' = 'short'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  
  if (format === 'long') {
    return d.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
  
  // ISO format: YYYY-MM-DD
  const isoDate = d.toISOString().split('T')[0];
  return isoDate || '';
}
