import React, { useState, useRef, useEffect, useCallback } from 'react';
import { t } from '../../../lib/i18n';

export interface NotesEditorProps {
  value: string | undefined;
  onChange: (notes: string) => void;
  onAutoSave?: (notes: string) => void;
  label?: string;
  help?: string;
  placeholder?: string;
  autoSaveDelay?: number; // ms before auto-save (default 2000)
}

/**
 * Enhanced Notes Editor with:
 * - Rich text support (bold, italic, lists)
 * - Auto-save after inactivity
 * - Keyboard shortcuts (Ctrl+B for bold, etc)
 * - Character counter
 * - Save indicator
 */
export const NotesEditor: React.FC<NotesEditorProps> = ({
  value,
  onChange,
  onAutoSave,
  label,
  help,
  placeholder,
  autoSaveDelay = 2000,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Auto-save with debounce
  const handleAutoSave = useCallback(
    (content: string) => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      if (content !== value) {
        setHasUnsavedChanges(true);
        autoSaveTimerRef.current = setTimeout(() => {
          setIsSaving(true);
          if (onAutoSave) {
            onAutoSave(content);
          }
          setIsSaving(false);
          setHasUnsavedChanges(false);
          setLastSaved(new Date());
        }, autoSaveDelay);
      }
    },
    [value, autoSaveDelay, onAutoSave]
  );

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    onChange(newValue);
    handleAutoSave(newValue);
  };

  // Keyboard shortcuts for rich text
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const isMac = /Mac|iPhone|iPad|iPod/.test(navigator.platform);
    const modifier = isMac ? e.metaKey : e.ctrlKey;

    // Ctrl/Cmd + B → Bold
    if (modifier && e.key === 'b') {
      e.preventDefault();
      insertMarkdown('**', '**', 'bold text');
    }

    // Ctrl/Cmd + I → Italic
    if (modifier && e.key === 'i') {
      e.preventDefault();
      insertMarkdown('_', '_', 'italic text');
    }

    // Ctrl/Cmd + L → List
    if (modifier && e.key === 'l') {
      e.preventDefault();
      insertList();
    }

    // Ctrl/Cmd + . → Code
    if (modifier && e.key === '.') {
      e.preventDefault();
      insertMarkdown('`', '`', 'code');
    }
  };

  // Insert markdown formatted text
  const insertMarkdown = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value?.substring(start, end) || placeholder;
    const newValue =
      (value?.substring(0, start) || '') +
      before +
      selectedText +
      after +
      (value?.substring(end) || '');

    onChange(newValue);
    handleAutoSave(newValue);

    // Restore cursor position after state update
    setTimeout(() => {
      if (textarea) {
        const newPos = start + before.length + selectedText.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }
    }, 0);
  };

  // Insert bullet list
  const insertList = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value?.substring(start, end) || 'item 1';
    const listItem = `\n• ${selectedText}\n• item 2\n• item 3`;
    const newValue = (value?.substring(0, start) || '') + listItem + (value?.substring(end) || '');

    onChange(newValue);
    handleAutoSave(newValue);

    setTimeout(() => {
      if (textarea) {
        const newPos = start + listItem.length;
        textarea.setSelectionRange(newPos, newPos);
        textarea.focus();
      }
    }, 0);
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, []);

  const charCount = value?.length || 0;
  const maxChars = 1000;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <div className="flex items-center justify-between">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-white/70">
            {label}
          </label>
          <div className="flex items-center gap-1.5">
            {hasUnsavedChanges && (
              <span className="text-[9px] text-amber-300 font-medium animate-pulse">
                ⚫ Saving...
              </span>
            )}
            {lastSaved && !hasUnsavedChanges && (
              <span className="text-[9px] text-green-300/70 font-medium">
                ✓ Saved
              </span>
            )}
          </div>
        </div>
      )}

      {help && (
        <p className="text-[9px] text-slate-400 dark:text-white/60">
          {help}
        </p>
      )}

      {/* Keyboard shortcuts hints */}
      <div className="text-[8px] text-slate-400 dark:text-white/40 space-y-0.5 leading-tight">
        <p>
          <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded text-slate-400 dark:text-white/60">Cmd/Ctrl+B</kbd>
          {' '}Bold •{' '}
          <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded text-slate-400 dark:text-white/60">Cmd/Ctrl+I</kbd>
          {' '}Italic •{' '}
          <kbd className="px-1 py-0.5 bg-slate-200 dark:bg-slate-200 dark:bg-white/10 rounded text-slate-400 dark:text-white/60">Cmd/Ctrl+L</kbd>
          {' '}List
        </p>
      </div>

      {/* Editor textarea */}
      <textarea
        ref={textareaRef}
        value={value || ''}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder={placeholder || t('shows.editor.placeholder.notes') || 'Add notes...'}
        maxLength={maxChars}
        rows={4}
        className="px-3 py-1.5 rounded-md bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:border-white/15 focus:border-accent-500 focus:bg-slate-300 dark:bg-white/15 focus:shadow-lg focus:shadow-accent-500/10 focus:ring-1 focus:ring-accent-500/20 transition-all text-white placeholder:text-slate-400 dark:placeholder:text-slate-300 dark:text-white/30 resize-none text-sm leading-relaxed"
      />

      {/* Character counter */}
      <div className="flex items-center justify-between text-[9px]">
        <p className="text-slate-300 dark:text-white/50">
          {t('common.characters') || 'Characters'}: {charCount}/{maxChars}
        </p>
        {isSaving && (
          <div className="flex items-center gap-1 text-slate-300 dark:text-white/50">
            <svg className="w-3 h-3 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Auto-saving...</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotesEditor;
