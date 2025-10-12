/**
 * ShowsImporter Component
 * CSV/Excel Upload with drag-drop, preview, and validation
 * Supports: .csv, .xlsx, .xls
 *
 * @module ShowsImporter
 * @author On Tour Dev Team
 */

import React, { useState, useCallback, useRef } from 'react';
import { Upload, FileText, CheckCircle, AlertCircle, Download, X } from 'lucide-react';
import { parseShowsFile, parseShowsCSV, generateCSVTemplate, type ParseResult, type ShowRow, type ParseError } from '../../lib/importers/csvParser';

type ImportMode = 'append' | 'replace';

interface ShowsImporterProps {
    onImport: (shows: ShowRow[], mode: ImportMode) => void;
    onCancel?: () => void;
    existingShowCount?: number;
}

export function ShowsImporter({ onImport, onCancel, existingShowCount = 0 }: ShowsImporterProps) {
    const [dragActive, setDragActive] = useState(false);
    const [parseResult, setParseResult] = useState<ParseResult<ShowRow> | null>(null);
    const [importMode, setImportMode] = useState<ImportMode>('append');
    const [isProcessing, setIsProcessing] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // =========================================================================
    // FILE HANDLING
    // =========================================================================

    const handleFile = useCallback((file: File) => {
        const fileName = file.name.toLowerCase();
        const isCSV = fileName.endsWith('.csv') || file.type === 'text/csv';
        const isExcel = fileName.endsWith('.xlsx') || fileName.endsWith('.xls') ||
            file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.type === 'application/vnd.ms-excel';

        if (!isCSV && !isExcel) {
            alert('Please upload a CSV or Excel file (.csv, .xlsx, .xls)');
            return;
        }

        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result;
            if (!content) {
                alert('Error reading file: empty content');
                setIsProcessing(false);
                return;
            }

            try {
                let result: ParseResult<ShowRow>;

                if (isExcel) {
                    // Excel files: read as ArrayBuffer
                    result = parseShowsFile(content as ArrayBuffer, 'xlsx');
                } else {
                    // CSV files: read as text
                    result = parseShowsFile(content as string, 'csv');
                }

                setParseResult(result);
            } catch (error) {
                alert(`Error parsing file: ${error instanceof Error ? error.message : 'Unknown error'}`);
            } finally {
                setIsProcessing(false);
            }
        };
        reader.onerror = () => {
            alert('Error reading file');
            setIsProcessing(false);
        };

        // Read Excel as ArrayBuffer, CSV as text
        if (isExcel) {
            reader.readAsArrayBuffer(file);
        } else {
            reader.readAsText(file);
        }
    }, []);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(
        (e: React.DragEvent) => {
            e.preventDefault();
            e.stopPropagation();
            setDragActive(false);

            const files = e.dataTransfer?.files;
            if (files && files[0]) {
                handleFile(files[0]);
            }
        },
        [handleFile]
    );

    const handleFileInput = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const files = e.target.files;
            if (files && files[0]) {
                handleFile(files[0]);
            }
        },
        [handleFile]
    );

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    // =========================================================================
    // IMPORT ACTIONS
    // =========================================================================

    const handleConfirmImport = () => {
        if (parseResult && parseResult.success && parseResult.data.length > 0) {
            onImport(parseResult.data, importMode);
        }
    };

    const handleReset = () => {
        setParseResult(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleDownloadTemplate = () => {
        const csv = generateCSVTemplate();
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'on-tour-shows-template.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };

    // =========================================================================
    // RENDER: UPLOAD ZONE
    // =========================================================================

    if (!parseResult) {
        return (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-3xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Upload className="w-6 h-6" />
                        Import Shows from CSV/Excel
                    </h2>
                    {onCancel && (
                        <button
                            onClick={onCancel}
                            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                            aria-label="Close"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    )}
                </div>

                {/* Download Template */}
                <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-2">
                        Need a template? Download a sample CSV with example shows.
                    </p>
                    <button
                        onClick={handleDownloadTemplate}
                        className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                    >
                        <Download className="w-4 h-4" />
                        Download CSV Template
                    </button>
                </div>

                {/* Drag-Drop Zone */}
                <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`
            relative border-2 border-dashed rounded-lg p-12 text-center
            transition-colors duration-200
            ${dragActive
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
                        }
            ${isProcessing ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}
          `}
                    onClick={handleBrowseClick}
                >
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv"
                        onChange={handleFileInput}
                        className="hidden"
                    />

                    <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-500" />

                    {isProcessing ? (
                        <p className="text-lg font-medium text-gray-600 dark:text-gray-300">
                            Processing file...
                        </p>
                    ) : (
                        <>
                            <p className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Drag & drop your CSV or Excel file here
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                                or click to browse files
                            </p>
                            <p className="text-xs text-gray-400 dark:text-gray-500">
                                Supported formats: CSV (.csv), Excel (.xlsx, .xls)
                            </p>
                        </>
                    )}
                </div>

                {/* Expected Shows Count */}
                {existingShowCount > 0 && (
                    <div className="mt-4 text-sm text-gray-600 dark:text-gray-400 text-center">
                        Current shows: <strong>{existingShowCount}</strong>
                    </div>
                )}
            </div>
        );
    }

    // =========================================================================
    // RENDER: PREVIEW & VALIDATION
    // =========================================================================

    const { success, data, errors, warnings, stats } = parseResult;

    return (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                    {success ? (
                        <CheckCircle className="w-6 h-6 text-green-500" />
                    ) : (
                        <AlertCircle className="w-6 h-6 text-red-500" />
                    )}
                    File Preview
                </h2>
                <button
                    onClick={handleReset}
                    className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    aria-label="Upload different file"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-4 gap-4 mb-6">
                <StatCard label="Total Rows" value={stats.total} color="blue" />
                <StatCard label="Valid" value={stats.valid} color="green" />
                <StatCard label="Errors" value={stats.invalid} color="red" />
                <StatCard label="Skipped" value={stats.skipped} color="gray" />
            </div>

            {/* Errors */}
            {errors.length > 0 && (
                <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 rounded-lg max-h-64 overflow-y-auto">
                    <h3 className="text-sm font-semibold text-red-800 dark:text-red-200 mb-2 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Validation Errors ({errors.length})
                    </h3>
                    <ul className="space-y-1 text-xs text-red-700 dark:text-red-300">
                        {errors.slice(0, 20).map((err, idx) => (
                            <li key={idx}>
                                <strong>Row {err.row}</strong>
                                {err.field && <span className="text-red-600 dark:text-red-400"> [{err.field}]</span>}
                                : {err.message}
                                {err.value !== undefined && (
                                    <span className="text-red-500 dark:text-red-400"> (value: {String(err.value)})</span>
                                )}
                            </li>
                        ))}
                        {errors.length > 20 && (
                            <li className="italic text-red-600 dark:text-red-400">
                                ... and {errors.length - 20} more errors
                            </li>
                        )}
                    </ul>
                </div>
            )}

            {/* Warnings */}
            {warnings.length > 0 && (
                <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h3 className="text-sm font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                        Warnings
                    </h3>
                    <ul className="space-y-1 text-xs text-yellow-700 dark:text-yellow-300">
                        {warnings.map((warning, idx) => (
                            <li key={idx}>• {warning}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Preview Table */}
            {data.length > 0 && (
                <div className="mb-6 overflow-x-auto max-h-96 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <table className="w-full text-sm">
                        <thead className="bg-gray-50 dark:bg-gray-900 sticky top-0">
                            <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    ID
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    City
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Country
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Fee
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Coords
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                            {data.slice(0, 50).map((show, idx) => (
                                <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-700/50">
                                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100 font-mono truncate max-w-xs">
                                        {show.id}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                                        {show.date}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-900 dark:text-gray-100">
                                        {show.city}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-gray-700 dark:text-gray-300">
                                        {show.country}
                                    </td>
                                    <td className="px-3 py-2 text-xs text-right text-gray-900 dark:text-gray-100">
                                        {show.fee.toLocaleString()} {show.feeCurrency}
                                    </td>
                                    <td className="px-3 py-2">
                                        <StatusBadge status={show.status} />
                                    </td>
                                    <td className="px-3 py-2 text-center">
                                        {show.lat && show.lng ? (
                                            <CheckCircle className="w-4 h-4 text-green-500 mx-auto" />
                                        ) : (
                                            <AlertCircle className="w-4 h-4 text-yellow-500 mx-auto" />
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {data.length > 50 && (
                        <div className="p-3 bg-gray-50 dark:bg-gray-900 text-center text-xs text-gray-500 dark:text-gray-400">
                            Showing first 50 of {data.length} valid shows
                        </div>
                    )}
                </div>
            )}

            {/* Import Mode Selection */}
            {success && data.length > 0 && (
                <>
                    <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                            Import Mode
                        </label>
                        <div className="flex gap-4">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="append"
                                    checked={importMode === 'append'}
                                    onChange={() => setImportMode('append')}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                    <strong>Append</strong> - Add to existing shows ({existingShowCount} current)
                                </span>
                            </label>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="radio"
                                    name="importMode"
                                    value="replace"
                                    checked={importMode === 'replace'}
                                    onChange={() => setImportMode('replace')}
                                    className="text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-900 dark:text-gray-100">
                                    <strong>Replace</strong> - Remove all existing shows
                                </span>
                            </label>
                        </div>
                        {importMode === 'replace' && (
                            <p className="mt-2 text-xs text-red-600 dark:text-red-400">
                                ⚠️ Warning: This will permanently delete {existingShowCount} existing show(s)
                            </p>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-4">
                        <button
                            onClick={handleReset}
                            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
                        >
                            Upload Different File
                        </button>
                        <div className="flex gap-3">
                            {onCancel && (
                                <button
                                    onClick={onCancel}
                                    className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                                >
                                    Cancel
                                </button>
                            )}
                            <button
                                onClick={handleConfirmImport}
                                disabled={!success || data.length === 0}
                                className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Import {data.length} Show{data.length !== 1 ? 's' : ''}
                            </button>
                        </div>
                    </div>
                </>
            )}

            {/* Error State Actions */}
            {!success && (
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleReset}
                        className="px-6 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                        Upload Different File
                    </button>
                    <p className="text-sm text-red-600 dark:text-red-400">
                        Please fix errors before importing
                    </p>
                </div>
            )}
        </div>
    );
}

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

function StatCard({
    label,
    value,
    color,
}: {
    label: string;
    value: number;
    color: 'blue' | 'green' | 'red' | 'gray';
}) {
    const colorClasses = {
        blue: 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300',
        green: 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300',
        red: 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300',
        gray: 'bg-gray-50 dark:bg-gray-900/20 text-gray-700 dark:text-gray-300',
    };

    return (
        <div className={`p-4 rounded-lg ${colorClasses[color]}`}>
            <div className="text-2xl font-bold">{value}</div>
            <div className="text-xs uppercase tracking-wider mt-1">{label}</div>
        </div>
    );
}

function StatusBadge({ status }: { status: string }) {
    const statusColors: Record<string, string> = {
        confirmed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
        pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
        offer: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
        canceled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
        archived: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300',
        postponed: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300',
    };

    return (
        <span
            className={`inline-block px-2 py-1 text-xs font-medium rounded ${statusColors[status] || statusColors.pending
                }`}
        >
            {status}
        </span>
    );
}
