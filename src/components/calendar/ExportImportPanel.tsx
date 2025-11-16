import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Upload, Copy, Check, FileText } from 'lucide-react';
import { CalEvent } from './types';
import { t } from '../../lib/i18n';

type ExportFormat = 'ics' | 'csv' | 'json' | 'pdf';

interface ExportImportPanelProps {
  events: CalEvent[];
  onImport?: (events: CalEvent[]) => void;
}

/**
 * Component for exporting calendar events in multiple formats
 * and importing events from ICS/CSV files
 *
 * Supported Export Formats:
 * - ICS: Standard calendar format (compatible with Google Calendar, Outlook, Apple Calendar)
 * - CSV: Spreadsheet format for Excel/Google Sheets
 * - JSON: Raw data backup
 * - PDF: Professional printable itinerary document
 */
export const ExportImportPanel = React.memo<ExportImportPanelProps>(({
  events,
  onImport,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState<ExportFormat | null>(null);
  const [exporting, setExporting] = useState(false);

  // Export to ICS format
  const exportToICS = (eventsToExport: CalEvent[]): string => {
    let ics = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//On Tour App//Calendar//EN\r\nCALSCALE:GREGORIAN\r\n';

    for (const event of eventsToExport) {
      const startDate = event.start || `${event.date}T000000Z`;
      const endDate = event.end || event.endDate || event.date;

      ics += 'BEGIN:VEVENT\r\n';
      ics += `UID:${event.id}\r\n`;
      ics += `DTSTAMP:${new Date().toISOString().replace(/[:-]/g, '').split('.')[0]}Z\r\n`;
      ics += `DTSTART:${startDate.replace(/[:-]/g, '').split('.')[0]}Z\r\n`;
      ics += `DTEND:${endDate.replace(/[:-]/g, '').split('.')[0]}Z\r\n`;
      ics += `SUMMARY:${event.title}\r\n`;
      if (event.notes) ics += `DESCRIPTION:${event.notes}\r\n`;
      ics += `CATEGORIES:${event.kind}\r\n`;
      ics += `STATUS:${event.status === 'cancelled' ? 'CANCELLED' : 'CONFIRMED'}\r\n`;
      ics += 'END:VEVENT\r\n';
    }

    ics += 'END:VCALENDAR\r\n';
    return ics;
  };

  // Export to CSV format
  const exportToCSV = (eventsToExport: CalEvent[]): string => {
    const headers = ['ID', 'Title', 'Type', 'Date', 'End Date', 'Status', 'Notes'];
    const rows = eventsToExport.map((event) => [
      event.id,
      `"${event.title}"`,
      event.kind,
      event.date,
      event.endDate || '',
      event.status || 'scheduled',
      `"${event.notes || ''}"`,
    ]);

    return [headers, ...rows].map((row) => row.join(',')).join('\n');
  };

  // Export to PDF format (generate HTML table that can be printed)
  const exportToPDF = async (eventsToExport: CalEvent[]): Promise<string> => {
    // Create styled HTML content for PDF
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Tour Itinerary - ${new Date().toLocaleDateString()}</title>
        <style>
          * { margin: 0; padding: 0; }
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #1f2937;
            padding: 40px;
            background: white;
          }
          .header {
            text-align: center;
            margin-bottom: 30px;
            border-bottom: 3px solid #3b82f6;
            padding-bottom: 20px;
          }
          .header h1 {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 5px;
            color: #1f2937;
          }
          .header p {
            font-size: 14px;
            color: #6b7280;
          }
          .summary {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
          }
          .summary-box {
            background: #f3f4f6;
            padding: 15px;
            border-radius: 8px;
            text-align: center;
            border-left: 4px solid #3b82f6;
          }
          .summary-box .number {
            font-size: 24px;
            font-weight: 700;
            color: #3b82f6;
          }
          .summary-box .label {
            font-size: 12px;
            color: #6b7280;
            text-transform: uppercase;
            margin-top: 5px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 30px;
          }
          th {
            background: #1f2937;
            color: white;
            padding: 12px;
            text-align: left;
            font-weight: 600;
            font-size: 13px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
          }
          td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
          }
          tr:last-child td {
            border-bottom: none;
          }
          tr:nth-child(even) {
            background: #f9fafb;
          }
          .type-show {
            background: #d1fae5;
            color: #065f46;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
          }
          .type-travel {
            background: #bfdbfe;
            color: #1e40af;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
          }
          .type-meeting {
            background: #fcd34d;
            color: #78350f;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: 600;
            display: inline-block;
          }
          .status-cancelled {
            text-decoration: line-through;
            color: #9ca3af;
          }
          .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            font-size: 12px;
            color: #9ca3af;
          }
          @media print {
            body { padding: 20px; }
            .header { page-break-after: avoid; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>Tour Itinerary</h1>
          <p>Generated on ${new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}</p>
        </div>

        <div class="summary">
          <div class="summary-box">
            <div class="number">${eventsToExport.length}</div>
            <div class="label">Total Events</div>
          </div>
          <div class="summary-box">
            <div class="number">${eventsToExport.filter(e => e.kind === 'show').length}</div>
            <div class="label">Shows</div>
          </div>
          <div class="summary-box">
            <div class="number">${eventsToExport.filter(e => e.kind === 'travel').length}</div>
            <div class="label">Travel</div>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Event</th>
              <th>Type</th>
              <th>Status</th>
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            ${eventsToExport.map(event => `
              <tr>
                <td><strong>${new Date(event.date).toLocaleDateString()}</strong></td>
                <td>${event.title}</td>
                <td><span class="type-${event.kind}">${event.kind}</span></td>
                <td class="${event.status === 'cancelled' ? 'status-cancelled' : ''}">${event.status || 'scheduled'}</td>
                <td>${event.notes || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <p>This document was generated by On Tour App. For more information, visit ontour.app</p>
        </div>
      </body>
      </html>
    `;

    return htmlContent;
  };

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);
    try {
      let content = '';
      let filename = `itinerary-${new Date().toISOString().slice(0, 10)}`;
      let mimeType = 'text/plain';

      if (format === 'ics') {
        content = exportToICS(events);
        filename += '.ics';
        mimeType = 'text/calendar';
      } else if (format === 'csv') {
        content = exportToCSV(events);
        filename += '.csv';
        mimeType = 'text/csv';
      } else if (format === 'json') {
        content = JSON.stringify(events, null, 2);
        filename += '.json';
        mimeType = 'application/json';
      } else if (format === 'pdf') {
        content = await exportToPDF(events);
        filename += '.html'; // Browser will offer to print as PDF
        mimeType = 'text/html';

        // Open in new window for printing
        const newWindow = window.open('', '', 'width=1200,height=800');
        if (newWindow) {
          newWindow.document.write(content);
          newWindow.document.close();
          newWindow.print();
        }
        setExporting(false);
        return;
      }

      // Download file
      const blob = new Blob([content], { type: mimeType });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setExporting(false);
    }
  };

  const handleCopy = (format: ExportFormat) => {
    let content = '';

    if (format === 'ics') {
      content = exportToICS(events);
    } else if (format === 'csv') {
      content = exportToCSV(events);
    } else if (format === 'json') {
      content = JSON.stringify(events, null, 2);
    }

    navigator.clipboard.writeText(content).then(() => {
      setCopied(format);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleImportFile = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file || !onImport) return;

    try {
      const text = await file.text();

      if (file.name.endsWith('.json')) {
        const imported = JSON.parse(text) as CalEvent[];
        onImport(imported);
      } else if (file.name.endsWith('.csv')) {
        // CSV parsing
        const lines = text.split('\n');
        const imported: CalEvent[] = [];

        for (let i = 1; i < lines.length; i++) {
          if (!lines[i]?.trim()) continue;
          const values = lines[i]?.split(',') || [];
          imported.push({
            id: values[0] || `import-${i}`,
            title: values[1]?.replace(/"/g, '') || 'Untitled',
            kind: (values[2] as any) || 'show',
            date: values[3] || new Date().toISOString().slice(0, 10),
            endDate: values[4] || undefined,
            status: values[5] || undefined,
            notes: values[6]?.replace(/"/g, '') || undefined,
          });
        }

        onImport(imported);
      } else if (file.name.endsWith('.ics')) {
        // Basic ICS parsing
        const imported: CalEvent[] = [];
        let currentEvent: Partial<CalEvent> = {};
        const lines = text.split('\n');

        for (const line of lines) {
          if (line.startsWith('BEGIN:VEVENT')) {
            currentEvent = {};
          } else if (line.startsWith('END:VEVENT')) {
            if (currentEvent.id && currentEvent.title && currentEvent.date) {
              imported.push(currentEvent as CalEvent);
            }
          } else if (line.startsWith('UID:')) {
            currentEvent.id = line.substring(4).trim();
          } else if (line.startsWith('SUMMARY:')) {
            currentEvent.title = line.substring(8).trim();
          } else if (line.startsWith('DTSTART')) {
            const dateStr = line.split(':')[1];
            currentEvent.date = dateStr?.substring(0, 8).replace(/(\d{4})(\d{2})(\d{2})/, '$1-$2-$3') || '';
          }
        }

        onImport(imported);
      }
    } catch (error) {
      console.error('Import failed:', error);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-lg bg-gradient-to-br from-slate-900/30 to-slate-800/20 border border-slate-200 dark:border-white/10 p-4"
    >
      {/* Header */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between text-slate-600 dark:text-white/80 hover:text-white transition"
      >
        <div className="flex items-center gap-2">
          <Download size={18} />
          <span className="font-semibold">{t('calendar.export.title') || 'Export & Import'}</span>
        </div>
        <motion.div
          animate={{ rotate: expanded ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          ▼
        </motion.div>
      </motion.button>

      {/* Expanded Content */}
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="mt-4 space-y-4"
          >
            {/* Export Section */}
            <div>
              <p className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase mb-3">
                {t('calendar.export.section') || 'Export Events'}
              </p>
              <div className="space-y-2">
                {[
                  {
                    format: 'pdf' as ExportFormat,
                    label: '📄 PDF (Itinerary)',
                    desc: 'Professional printable document',
                    icon: FileText,
                  },
                  {
                    format: 'ics' as ExportFormat,
                    label: '📅 ICS (Calendar)',
                    desc: 'Import into any calendar app',
                  },
                  {
                    format: 'csv' as ExportFormat,
                    label: '📊 CSV (Spreadsheet)',
                    desc: 'Open in Excel, Google Sheets',
                  },
                  {
                    format: 'json' as ExportFormat,
                    label: '💾 JSON (Data)',
                    desc: 'Raw data backup',
                  },
                ].map((option) => (
                  <div
                    key={option.format}
                    className="flex items-center justify-between p-3 rounded-lg bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-slate-300 dark:hover:border-white/20 transition"
                  >
                    <div>
                      <p className="text-sm font-medium text-slate-900 dark:text-white">
                        {option.label}
                      </p>
                      <p className="text-xs text-slate-300 dark:text-white/40">{option.desc}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {option.format !== 'pdf' && (
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => handleCopy(option.format)}
                          title="Copy to clipboard"
                          disabled={exporting}
                          className="p-2 rounded-lg bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 transition disabled:opacity-50"
                        >
                          {copied === option.format ? (
                            <Check size={16} />
                          ) : (
                            <Copy size={16} />
                          )}
                        </motion.button>
                      )}
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleExport(option.format)}
                        disabled={exporting}
                        title={`Download ${option.format}`}
                        className="p-2 rounded-lg bg-green-500/10 hover:bg-green-500/20 text-green-300 transition disabled:opacity-50"
                      >
                        <Download size={16} />
                      </motion.button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Import Section */}
            {onImport && (
              <div className="pt-4 border-t border-white/10">
                <p className="text-xs font-semibold text-slate-500 dark:text-white/70 uppercase mb-3">
                  {t('calendar.import.section') || 'Import Events'}
                </p>
                <label className="block">
                  <div
                    className="relative p-3 rounded-lg border-2 border-dashed border-slate-300 dark:border-white/20 hover:border-accent-500/40 hover:bg-accent-500/5 transition cursor-pointer"
                  >
                    <input
                      type="file"
                      accept=".ics,.csv,.json"
                      onChange={handleImportFile}
                      className="hidden"
                    />
                    <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-white/60">
                      <Upload size={18} />
                      <span className="text-sm font-medium">
                        {t('calendar.import.dropFile') || 'Drop file or click to import'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 dark:text-white/40 text-center mt-1">
                      {t('calendar.import.formats') || 'Supports .ics, .csv, .json'}
                    </p>
                  </div>
                </label>
              </div>
            )}

            {/* Info */}
            <div className="pt-4 border-t border-white/10">
              <p className="text-xs text-slate-300 dark:text-white/50">
                <strong>💡 {t('calendar.export.tip') || 'Tip'}:</strong> {t('calendar.export.tipText') || 'Export regularly to backup your events. Use PDF for sharing with managers/promoters, ICS for calendar integrations, CSV for spreadsheets.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
});

ExportImportPanel.displayName = 'ExportImportPanel';
