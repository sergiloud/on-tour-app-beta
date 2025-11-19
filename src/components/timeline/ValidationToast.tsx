/**
 * Validation Toast Component
 * Shows validation warnings and errors with actions
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, AlertCircle, XCircle, X, Undo } from 'lucide-react';
import type { ValidationResult } from '../../lib/timelineValidations';

interface ValidationToastProps {
  validation: ValidationResult | null;
  onDismiss: () => void;
  onUndo?: () => void;
  onForce?: () => void;
}

export default function ValidationToast({ 
  validation, 
  onDismiss, 
  onUndo,
  onForce 
}: ValidationToastProps) {
  if (!validation) return null;
  
  const hasErrors = validation.errors.length > 0;
  const hasWarnings = validation.warnings.length > 0;
  
  if (!hasErrors && !hasWarnings) return null;
  
  // Treat errors as high-severity warnings (informational, not blocking)
  const allIssues = [
    ...validation.errors.map(e => ({ 
      type: 'error' as const, 
      message: e.message, 
      severity: 'high' as const,
      ids: e.blockingEventIds 
    })),
    ...validation.warnings.map(w => ({ 
      type: 'warning' as const, 
      message: w.message, 
      severity: w.severity,
      ids: w.affectedEventIds 
    }))
  ];
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 max-w-2xl w-full mx-4"
      >
        <div className={`rounded-xl shadow-2xl border-2 backdrop-blur-xl ${
          hasErrors 
            ? 'bg-amber-950/95 border-amber-500/50' 
            : 'bg-blue-950/95 border-blue-500/50'
        }`}>
          {/* Header */}
          <div className="flex items-center justify-between p-4 pb-3 border-b border-white/10">
            <div className="flex items-center gap-3">
              <AlertTriangle className={`w-6 h-6 ${hasErrors ? 'text-amber-400' : 'text-blue-400'}`} />
              <h3 className="text-lg font-semibold text-white">
                {hasErrors ? 'Schedule Conflict Detected' : 'Schedule Note'}
              </h3>
            </div>
            <button
              onClick={onDismiss}
              className="p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5 text-white/70" />
            </button>
          </div>
          
          {/* Content */}
          <div className="p-4 space-y-3 max-h-64 overflow-y-auto">
            {allIssues.map((issue, idx) => (
              <div 
                key={`issue-${idx}`} 
                className={`flex gap-3 items-start ${
                  issue.type === 'error' || issue.severity === 'high' ? 'opacity-100' : 
                  issue.severity === 'medium' ? 'opacity-90' : 
                  'opacity-75'
                }`}
              >
                {issue.type === 'error' ? (
                  <AlertCircle className="w-5 h-5 text-amber-300 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertTriangle className={`w-5 h-5 flex-shrink-0 mt-0.5 ${
                    issue.severity === 'high' ? 'text-amber-400' :
                    issue.severity === 'medium' ? 'text-blue-400' :
                    'text-blue-500'
                  }`} />
                )}
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    issue.type === 'error' ? 'text-amber-100' : 'text-blue-100'
                  }`}>
                    {issue.message}
                  </p>
                  {issue.ids && issue.ids.length > 0 && (
                    <p className={`text-xs mt-1 ${
                      issue.type === 'error' ? 'text-amber-300/70' : 'text-blue-300/60'
                    }`}>
                      {issue.type === 'error' ? 'Conflicts with' : 'Affects'}: {issue.ids.join(', ')}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
          
          {/* Actions */}
          <div className="flex gap-2 p-4 pt-3 border-t border-white/10">
            {onUndo && (
              <button
                onClick={onUndo}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  hasErrors 
                    ? 'bg-amber-600 hover:bg-amber-500 text-white' 
                    : 'bg-blue-600 hover:bg-blue-500 text-white'
                }`}
              >
                <Undo className="w-4 h-4" />
                Undo Move
              </button>
            )}
            
            <button
              onClick={onDismiss}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-lg font-medium transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
