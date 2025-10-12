/**
 * HTMLTimelineImporter Component
 * Drag-and-drop HTML timeline import with intelligent parsing
 *
 * @author On Tour Dev Team
 */

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, AlertCircle, CheckCircle, X, Loader2, Calendar, MapPin } from 'lucide-react';
import { parseTimelineHTML, convertToAppShow, type ParseResult, type ParsedShow } from '../../lib/importers/htmlTimelineParser';
import { Button } from '../../ui/Button';

interface HTMLTimelineImporterProps {
  orgId: string;
  onImport: (shows: any[]) => void;
  onClose: () => void;
}

export const HTMLTimelineImporter: React.FC<HTMLTimelineImporterProps> = ({
  orgId,
  onImport,
  onClose,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<ParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  // Handle file selection
  const handleFile = useCallback(async (selectedFile: File) => {
    if (!selectedFile) return;

    const fileName = selectedFile.name.toLowerCase();
    const isHTML = fileName.endsWith('.html') || fileName.endsWith('.htm') ||
      selectedFile.type === 'text/html';

    if (!isHTML) {
      alert('Please upload an HTML file (.html or .htm)');
      return;
    }

    setFile(selectedFile);
    setIsProcessing(true);

    try {
      // Read file content
      const content = await selectedFile.text();

      // Parse HTML timeline
      const result = parseTimelineHTML(content, { orgId });

      setParseResult(result);
      console.log('📊 Parse result:', result);
    } catch (error) {
      console.error('Error processing HTML:', error);
      setParseResult({
        shows: [],
        errors: [error instanceof Error ? error.message : 'Unknown error'],
        warnings: [],
        metadata: { totalRows: 0, parsedShows: 0, skippedRows: 0 },
      });
    } finally {
      setIsProcessing(false);
    }
  }, []);

  // Drag and drop handlers
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      handleFile(droppedFile);
    }
  }, [handleFile]);

  // File input handler
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      handleFile(selectedFile);
    }
  }, [handleFile]);

  // Import confirmed shows
  const handleConfirmImport = useCallback(() => {
    if (!parseResult || parseResult.shows.length === 0) return;

    // Convert parsed shows to app format
    const appShows = parseResult.shows.map(show => convertToAppShow(show, orgId));

    onImport(appShows);
    onClose();
  }, [parseResult, orgId, onImport, onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-purple-500" />
            <div>
              <h2 className="text-xl font-semibold text-white">Import HTML Timeline</h2>
              <p className="text-sm text-white/60">Upload your Google Sheets HTML export</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-white/60 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {!file && !parseResult && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Drop zone */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-xl p-12 text-center transition-all
                  ${isDragging
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/20 hover:border-purple-500/50 bg-white/5'
                  }
                `}
              >
                <Upload className={`w-16 h-16 mx-auto mb-4 ${isDragging ? 'text-purple-500' : 'text-white/40'}`} />
                <h3 className="text-lg font-semibold text-white mb-2">
                  Drag & drop your HTML file here
                </h3>
                <p className="text-white/60 mb-4">
                  Supported format: HTML (.html, .htm)
                </p>
                <label className="inline-block">
                  <input
                    type="file"
                    accept=".html,.htm,text/html"
                    onChange={handleFileInput}
                    className="hidden"
                  />
                  <Button variant="primary" className="cursor-pointer">
                    Choose File
                  </Button>
                </label>
              </div>

              {/* Instructions */}
              <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-blue-400 mb-2">📖 How to export from Google Sheets:</h4>
                <ol className="text-sm text-white/70 space-y-1 list-decimal list-inside">
                  <li>Open your timeline in Google Sheets</li>
                  <li>Go to <strong>File → Download → Web Page (.html)</strong></li>
                  <li>Upload the downloaded HTML file here</li>
                  <li>Review and confirm the parsed shows</li>
                </ol>
              </div>
            </motion.div>
          )}

          {isProcessing && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="w-12 h-12 text-purple-500 animate-spin mb-4" />
              <p className="text-white/60">Parsing HTML timeline...</p>
            </div>
          )}

          {parseResult && !isProcessing && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-green-500/10 border border-green-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span className="text-sm font-semibold text-green-400">Parsed</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{parseResult.shows.length}</div>
                  <div className="text-xs text-white/60">shows found</div>
                </div>

                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-5 h-5 text-yellow-500" />
                    <span className="text-sm font-semibold text-yellow-400">Warnings</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{parseResult.warnings.length}</div>
                  <div className="text-xs text-white/60">issues</div>
                </div>

                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertCircle className="w-5 h-5 text-red-500" />
                    <span className="text-sm font-semibold text-red-400">Errors</span>
                  </div>
                  <div className="text-2xl font-bold text-white">{parseResult.errors.length}</div>
                  <div className="text-xs text-white/60">errors</div>
                </div>
              </div>

              {/* Errors */}
              {parseResult.errors.length > 0 && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-red-400 mb-2">❌ Errors:</h4>
                  <ul className="text-sm text-red-300 space-y-1">
                    {parseResult.errors.map((error, idx) => (
                      <li key={idx}>• {error}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Warnings */}
              {parseResult.warnings.length > 0 && (
                <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4">
                  <h4 className="text-sm font-semibold text-yellow-400 mb-2">⚠️ Warnings:</h4>
                  <ul className="text-sm text-yellow-300 space-y-1">
                    {parseResult.warnings.slice(0, 5).map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                    {parseResult.warnings.length > 5 && (
                      <li className="text-white/50">... and {parseResult.warnings.length - 5} more</li>
                    )}
                  </ul>
                </div>
              )}

              {/* Preview shows */}
              {parseResult.shows.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">
                    🎪 Preview ({parseResult.shows.length} shows)
                  </h4>
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {parseResult.shows.slice(0, 20).map((show, idx) => (
                      <div
                        key={idx}
                        className="bg-white/5 hover:bg-white/10 rounded-lg p-3 transition-colors"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Calendar className="w-4 h-4 text-purple-400" />
                              <span className="text-sm font-semibold text-white">{show.date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-white/70">
                              <MapPin className="w-4 h-4" />
                              <span>{show.venue || show.name || 'Unnamed Show'}</span>
                              {show.city && <span>• {show.city}</span>}
                              {show.country && <span>({show.country})</span>}
                            </div>
                            {show.fee && (
                              <div className="text-xs text-green-400 mt-1">
                                {show.feeCurrency} {show.fee.toLocaleString()}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {parseResult.shows.length > 20 && (
                      <div className="text-center text-sm text-white/50 py-2">
                        ... and {parseResult.shows.length - 20} more shows
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-white/10">
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          {parseResult && parseResult.shows.length > 0 && (
            <Button
              variant="primary"
              onClick={handleConfirmImport}
              disabled={parseResult.errors.length > 0}
            >
              Import {parseResult.shows.length} Show{parseResult.shows.length !== 1 ? 's' : ''}
            </Button>
          )}
        </div>
      </motion.div>
    </div>
  );
};
