/**
 * Lazy Export Service
 * 
 * Ultra-lazy loading for Excel exports to minimize bundle impact.
 * Only loads ExcelJS when user actually triggers an export.
 * 
 * Performance Benefits:
 * - 937KB ExcelJS library loaded only on-demand
 * - Faster initial page load
 * - Better Core Web Vitals (LCP, CLS)
 * - Reduced memory usage for users who don't export
 */

import { toast } from 'sonner';
import { t } from './i18n';

interface ExportOptions {
  filename?: string;
  worksheetName?: string;
  includeHeaders?: boolean;
  dateFormat?: string;
}

interface ExportData {
  headers: string[];
  rows: (string | number | Date | null)[][];
  title?: string;
  metadata?: Record<string, any>;
}

class LazyExportService {
  private excelJSModule: any = null;
  private loading = false;

  /**
   * Load ExcelJS module lazily with user feedback
   */
  private async loadExcelJS() {
    if (this.excelJSModule) {
      return this.excelJSModule;
    }

    if (this.loading) {
      // Wait for existing load
      while (this.loading) {
        await new Promise(resolve => setTimeout(resolve, 50));
      }
      return this.excelJSModule;
    }

    try {
      this.loading = true;
      
      // Show loading toast
      const loadingToast = toast.loading(t('export.loading_library'), {
        description: t('export.loading_library_desc')
      });

      console.log('📊 Loading ExcelJS library for export...');
      const startTime = Date.now();
      
      // Dynamic import with network timeout
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('ExcelJS load timeout')), 10000);
      });
      
      const loadPromise = import('exceljs');
      this.excelJSModule = await Promise.race([loadPromise, timeoutPromise]);
      
      const loadTime = Date.now() - startTime;
      console.log(`✅ ExcelJS loaded in ${loadTime}ms`);
      
      toast.dismiss(loadingToast);
      
      return this.excelJSModule;
    } catch (error) {
      console.error('❌ Failed to load ExcelJS:', error);
      toast.error(t('export.load_error'), {
        description: t('export.load_error_desc')
      });
      throw error;
    } finally {
      this.loading = false;
    }
  }

  /**
   * Export data to Excel file
   */
  async exportToExcel(
    data: ExportData,
    options: ExportOptions = {}
  ): Promise<void> {
    const {
      filename = 'export.xlsx',
      worksheetName = 'Sheet1',
      includeHeaders = true,
      dateFormat = 'dd/mm/yyyy'
    } = options;

    try {
      const ExcelJS = await this.loadExcelJS();
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet(worksheetName);

      // Add metadata
      if (data.metadata) {
        workbook.creator = data.metadata.creator || 'On Tour App';
        workbook.created = new Date();
        workbook.modified = new Date();
      }

      // Add title row if provided
      let rowIndex = 1;
      if (data.title) {
        const titleRow = worksheet.getRow(rowIndex);
        titleRow.getCell(1).value = data.title;
        titleRow.getCell(1).font = { bold: true, size: 16 };
        worksheet.mergeCells(`A${rowIndex}:${String.fromCharCode(65 + data.headers.length - 1)}${rowIndex}`);
        rowIndex += 2;
      }

      // Add headers
      if (includeHeaders) {
        const headerRow = worksheet.getRow(rowIndex);
        data.headers.forEach((header, index) => {
          const cell = headerRow.getCell(index + 1);
          cell.value = header;
          cell.font = { bold: true };
          cell.fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFE0E0E0' }
          };
        });
        rowIndex++;
      }

      // Add data rows
      data.rows.forEach(row => {
        const dataRow = worksheet.getRow(rowIndex);
        row.forEach((value, index) => {
          const cell = dataRow.getCell(index + 1);
          cell.value = value;
          
          // Format dates
          if (value instanceof Date) {
            cell.numFmt = dateFormat;
          }
        });
        rowIndex++;
      });

      // Auto-size columns
      worksheet.columns.forEach((column: any) => {
        let maxLength = 0;
        column.eachCell?.({ includeEmpty: false }, (cell: any) => {
          const columnLength = cell.value ? String(cell.value).length : 10;
          maxLength = Math.max(maxLength, columnLength);
        });
        column.width = Math.min(maxLength + 2, 50);
      });

      // Generate and download file
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      });

      // Create download link
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
      
      // Trigger download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success(t('export.success'), {
        description: t('export.success_desc', { filename })
      });

    } catch (error) {
      console.error('Export failed:', error);
      toast.error(t('export.error'), {
        description: error instanceof Error ? error.message : t('export.error_desc')
      });
      throw error;
    }
  }

  /**
   * Export shows data to Excel
   */
  async exportShows(shows: any[], options: ExportOptions = {}) {
    const data: ExportData = {
      headers: [
        'Date',
        'Artist',
        'Venue',
        'City',
        'Country',
        'Capacity',
        'Tickets Sold',
        'Revenue',
        'Status'
      ],
      rows: shows.map(show => [
        show.date ? new Date(show.date) : null,
        show.artist || '',
        show.venue || '',
        show.city || '',
        show.country || '',
        show.capacity || 0,
        show.ticketsSold || 0,
        show.revenue || 0,
        show.status || ''
      ]),
      title: 'Shows Export',
      metadata: {
        creator: 'On Tour App',
        exportDate: new Date().toISOString()
      }
    };

    return this.exportToExcel(data, {
      filename: 'shows-export.xlsx',
      worksheetName: 'Shows',
      ...options
    });
  }

  /**
   * Export finance data to Excel
   */
  async exportFinance(transactions: any[], options: ExportOptions = {}) {
    const data: ExportData = {
      headers: [
        'Date',
        'Description',
        'Category',
        'Amount',
        'Type',
        'Currency',
        'Status'
      ],
      rows: transactions.map(tx => [
        tx.date ? new Date(tx.date) : null,
        tx.description || '',
        tx.category || '',
        tx.amount || 0,
        tx.type || '',
        tx.currency || 'EUR',
        tx.status || ''
      ]),
      title: 'Financial Report',
      metadata: {
        creator: 'On Tour App',
        exportDate: new Date().toISOString()
      }
    };

    return this.exportToExcel(data, {
      filename: 'finance-export.xlsx',
      worksheetName: 'Transactions',
      ...options
    });
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      loaded: !!this.excelJSModule,
      loading: this.loading
    };
  }

  /**
   * Preload ExcelJS (optional, for power users)
   */
  async preload() {
    if (!this.excelJSModule && !this.loading) {
      console.log('📊 Preloading ExcelJS for faster exports...');
      await this.loadExcelJS();
    }
  }
}

// Singleton instance
export const lazyExportService = new LazyExportService();

/**
 * React hook for export functionality
 */
export function useExport() {
  const exportShows = async (shows: any[], filename?: string) => {
    return lazyExportService.exportShows(shows, { filename });
  };

  const exportFinance = async (transactions: any[], filename?: string) => {
    return lazyExportService.exportFinance(transactions, { filename });
  };

  const exportCustom = async (data: ExportData, options?: ExportOptions) => {
    return lazyExportService.exportToExcel(data, options);
  };

  const preloadExcel = async () => {
    return lazyExportService.preload();
  };

  const status = lazyExportService.getStatus();

  return {
    exportShows,
    exportFinance,
    exportCustom,
    preloadExcel,
    status
  };
}

console.log('📊 Lazy Export Service initialized');