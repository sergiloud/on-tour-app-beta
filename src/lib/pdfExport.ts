/**
 * PDF Export Utilities
 * 
 * Export data to PDF files with formatting
 * 
 * Features:
 * - Export tables to PDF
 * - Custom headers and footers
 * - Logo support
 * - Multiple page support
 * - Auto-page breaks
 * - Custom styling
 * 
 * @example
 * exportTableToPDF({
 *   title: 'Financial Report',
 *   headers: ['Date', 'Description', 'Amount'],
 *   data: financeRecords.map(r => [r.date, r.description, r.amount]),
 *   filename: 'finance-report'
 * });
 */

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface PDFExportOptions {
  /** Document title */
  title: string;
  /** Column headers */
  headers: string[];
  /** Table data (array of arrays) */
  data: (string | number)[][];
  /** File name without extension */
  filename: string;
  /** Subtitle or description */
  subtitle?: string;
  /** Footer text */
  footer?: string;
  /** Logo URL or base64 */
  logo?: string;
  /** Orientation: portrait or landscape */
  orientation?: 'portrait' | 'landscape';
  /** Include date in header */
  includeDate?: boolean;
  /** Custom styles */
  styles?: {
    headerColor?: string;
    headerTextColor?: string;
    fontSize?: number;
  };
}

/**
 * Export table data to PDF
 */
export function exportTableToPDF(options: PDFExportOptions): void {
  const {
    title,
    headers,
    data,
    filename,
    subtitle,
    footer,
    logo,
    orientation = 'portrait',
    includeDate = true,
    styles = {},
  } = options;

  // Create PDF document
  const doc = new jsPDF({
    orientation,
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let yPosition = 20;

  // Add logo if provided
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 15, 10, 30, 30);
      yPosition = 45;
    } catch (error) {
      console.warn('Failed to add logo to PDF:', error);
    }
  }

  // Add title
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 8;

  // Add subtitle if provided
  if (subtitle) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text(subtitle, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 6;
  }

  // Add date if requested
  if (includeDate) {
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    const dateStr = new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.text(dateStr, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
  } else {
    yPosition += 5;
  }

  // Reset text color
  doc.setTextColor(0, 0, 0);

  // Add table
  autoTable(doc, {
    head: [headers],
    body: data,
    startY: yPosition,
    theme: 'striped',
    headStyles: {
      fillColor: styles.headerColor || [74, 144, 226], // Accent color
      textColor: styles.headerTextColor || [255, 255, 255],
      fontStyle: 'bold',
      fontSize: styles.fontSize || 10,
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    alternateRowStyles: {
      fillColor: [245, 245, 245],
    },
    margin: { left: 15, right: 15 },
  });

  // Add footer if provided
  if (footer) {
    const finalY = (doc as any).lastAutoTable.finalY || yPosition + 20;
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(footer, pageWidth / 2, finalY + 10, { align: 'center' });
  }

  // Add page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  // Save file
  doc.save(`${filename}.pdf`);
}

/**
 * Export financial report to PDF
 */
export function exportFinanceReportToPDF(options: {
  title: string;
  period: string;
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
  };
  transactions: {
    date: string;
    description: string;
    category: string;
    amount: number;
    type: 'income' | 'expense';
  }[];
  filename: string;
  currency?: string;
}): void {
  const {
    title,
    period,
    summary,
    transactions,
    filename,
    currency = 'EUR',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 20;

  // Title
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title, pageWidth / 2, y, { align: 'center' });
  y += 10;

  // Period
  doc.setFontSize(12);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text(period, pageWidth / 2, y, { align: 'center' });
  y += 15;

  // Summary Box
  doc.setFillColor(245, 245, 245);
  doc.rect(15, y, pageWidth - 30, 35, 'F');

  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.setFont('helvetica', 'bold');

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);

  doc.text('Total Income:', 20, y + 8);
  doc.text(formatCurrency(summary.totalIncome), pageWidth - 20, y + 8, { align: 'right' });

  doc.text('Total Expenses:', 20, y + 16);
  doc.setTextColor(200, 50, 50);
  doc.text(formatCurrency(summary.totalExpenses), pageWidth - 20, y + 16, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  doc.text('Net Profit:', 20, y + 28);
  if (summary.netProfit >= 0) {
    doc.setTextColor(50, 150, 50);
  } else {
    doc.setTextColor(200, 50, 50);
  }
  doc.text(formatCurrency(summary.netProfit), pageWidth - 20, y + 28, { align: 'right' });

  doc.setTextColor(0, 0, 0);
  y += 45;

  // Transactions Table
  const tableData = transactions.map(t => [
    t.date,
    t.description,
    t.category,
    formatCurrency(t.amount),
  ]);

  autoTable(doc, {
    head: [['Date', 'Description', 'Category', 'Amount']],
    body: tableData,
    startY: y,
    theme: 'striped',
    headStyles: {
      fillColor: [74, 144, 226],
      textColor: [255, 255, 255],
      fontStyle: 'bold',
    },
    styles: {
      fontSize: 9,
      cellPadding: 3,
    },
    columnStyles: {
      3: { halign: 'right', fontStyle: 'bold' },
    },
    didParseCell: (data) => {
      // Color code amounts
      if (data.column.index === 3 && data.section === 'body') {
        const rowIndex = data.row.index;
        if (rowIndex < transactions.length) {
          const transaction = transactions[rowIndex];
          if (transaction && transaction.type === 'expense') {
            data.cell.styles.textColor = [200, 50, 50];
          } else if (transaction) {
            data.cell.styles.textColor = [50, 150, 50];
          }
        }
      }
    },
  });

  // Footer
  const finalY = (doc as any).lastAutoTable.finalY || y + 20;
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text(
    `Generated on ${new Date().toLocaleDateString()}`,
    pageWidth / 2,
    finalY + 10,
    { align: 'center' }
  );

  // Page numbers
  const pageCount = doc.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text(
      `Page ${i} of ${pageCount}`,
      pageWidth - 20,
      doc.internal.pageSize.getHeight() - 10,
      { align: 'right' }
    );
  }

  doc.save(`${filename}.pdf`);
}

/**
 * Export shows list to PDF
 */
export function exportShowsListToPDF(options: {
  title: string;
  shows: {
    date: string;
    venue: string;
    city: string;
    country: string;
    status: string;
    guarantee?: number;
  }[];
  filename: string;
}): void {
  const { title, shows, filename } = options;

  const data = shows.map(show => [
    show.date,
    show.venue,
    `${show.city}, ${show.country}`,
    show.status,
    show.guarantee ? `€${show.guarantee.toLocaleString()}` : '-',
  ]);

  exportTableToPDF({
    title,
    subtitle: `${shows.length} shows`,
    headers: ['Date', 'Venue', 'Location', 'Status', 'Guarantee'],
    data,
    filename,
    includeDate: true,
  });
}
