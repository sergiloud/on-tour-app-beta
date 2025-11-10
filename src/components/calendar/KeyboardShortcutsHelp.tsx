import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { t } from '../../lib/i18n';

type Props = {
  onClose?: () => void;
};

const KeyboardShortcutsHelp: React.FC<Props> = ({ onClose }) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  const shortcuts = [
    { keys: ['T'], desc: t('calendar.shortcut.today') || 'Jump to today' },
    { keys: ['Ctrl/Cmd', 'G'], desc: t('calendar.shortcut.goto') || 'Go to date' },
    { keys: ['PgUp', 'Alt', '←'], desc: t('calendar.shortcut.pgUp') || 'Previous month' },
    { keys: ['PgDn', 'Alt', '→'], desc: t('calendar.shortcut.pgDn') || 'Next month' },
    { keys: ['↑↓←→'], desc: 'Navigate between days (arrow keys)' },
    { keys: ['Home'], desc: 'Go to start of week (Monday)' },
    { keys: ['End'], desc: 'Go to end of week (Sunday)' },
    { keys: ['Ctrl/Cmd', 'Home'], desc: 'Jump to first day of month' },
    { keys: ['Ctrl/Cmd', 'End'], desc: 'Jump to last day of month' },
    { keys: ['Enter', 'Space'], desc: 'Select/open day' },
    { keys: ['D'], desc: 'Start drag-move (then navigate & press M)' },
    { keys: ['M'], desc: 'Complete move (press C to copy instead)' },
    { keys: ['C'], desc: 'Copy event (during drag-move)' },
    { keys: ['?'], desc: 'Show this help (toggle)' },
  ];

  return (
    <>
      <motion.button
        whileHover={{ scale: 1.08, y: -1 }}
        whileTap={{ scale: 0.95 }}
        onClick={handleOpen}
        className="px-2.5 md:px-3 py-1.5 md:py-1.5 rounded-lg bg-white/8 border border-white/15 hover:border-slate-400 dark:hover:border-white/30 hover:bg-white/12 text-slate-500 dark:text-white/70 hover:text-white text-xs font-semibold transition-all flex items-center gap-1.5"
        title={`${t('calendar.shortcuts') || 'Keyboard Shortcuts'} (?) · ${t('calendar.shortcut.help') || 'Press ? to toggle'}`}
        aria-label={t('calendar.shortcuts') || 'Keyboard Shortcuts'}
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m6 2a8 8 0 11-16 0 8 8 0 0116 0zm0 0v2m0 4v2m0 4v2" />
        </svg>
        <span className="hidden sm:inline">{t('calendar.shortcuts') || 'Help'}</span>
        <span className="sm:hidden">?</span>
      </motion.button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
          >
            {/* Backdrop */}
            <motion.div
              className="absolute inset-0 bg-black/60 backdrop-blur-md"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />

            {/* Modal */}
            <motion.div
              onClick={(e) => e.stopPropagation()}
              className="relative glass rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xl backdrop-blur-md w-full max-w-2xl max-h-[80vh] overflow-y-auto bg-gradient-to-br from-slate-100 dark:from-white/8 via-white/4 to-white/2"
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ duration: 0.3, type: 'spring', stiffness: 300 }}
            >
              {/* Header */}
              <div className="sticky top-0 px-5 md:px-6 pt-5 md:pt-6 pb-4 md:pb-5 border-b border-slate-100 dark:border-white/5 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-100 dark:from-white/6 to-transparent z-10">
                <div>
                  <h2 className="text-lg md:text-xl font-bold text-white flex items-center gap-2">
                    <span>⌨️</span>
                    {t('calendar.shortcuts') || 'Keyboard Shortcuts'}
                  </h2>
                  <p className="text-xs text-slate-300 dark:text-white/50 mt-1">
                    {t('calendar.shortcut.hint') || 'Master these shortcuts to navigate faster'}
                  </p>
                </div>
                <motion.button
                  type="button"
                  onClick={handleClose}
                  className="p-1.5 rounded-lg hover:bg-slate-200 dark:bg-white/10 transition-colors flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg className="w-5 h-5 text-slate-400 dark:text-white/60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </motion.button>
              </div>

              {/* Content */}
              <div className="px-5 md:px-6 py-5 md:py-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  {shortcuts.map((shortcut, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="flex items-start gap-3 group"
                    >
                      {/* Keys */}
                      <div className="flex flex-wrap gap-1 flex-shrink-0 min-w-[120px]">
                        {shortcut.keys.map((key, kIdx) => (
                          <kbd
                            key={kIdx}
                            className="px-2 py-1 rounded-lg bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-600 dark:text-white/80 text-[10px] md:text-xs font-semibold group-hover:bg-white/20 group-hover:border-white/40 transition-all"
                          >
                            {key}
                          </kbd>
                        ))}
                      </div>
                      {/* Description */}
                      <p className="text-xs md:text-sm text-slate-500 dark:text-white/70 group-hover:text-slate-700 dark:text-white/90 transition-colors mt-0.5">
                        {shortcut.desc}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Tips Section */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="mt-6 pt-6 border-t border-white/10"
                >
                  <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
                    <span>💡</span>
                    Tips
                  </h3>
                  <ul className="space-y-2 text-xs md:text-sm text-slate-500 dark:text-white/70">
                    <li>
                      <span className="font-medium text-slate-600 dark:text-white/80">Drag & Drop:</span>
                      {' '} Drag events to other dates, or outside the grid to delete
                    </li>
                    <li>
                      <span className="font-medium text-slate-600 dark:text-white/80">Quick Add:</span>
                      {' '} Use the colored buttons below the toolbar to create events
                    </li>
                    <li>
                      <span className="font-medium text-slate-600 dark:text-white/80">Multi-Select:</span>
                      {' '} Hold Ctrl/Cmd while dragging to copy instead of move
                    </li>
                    <li>
                      <span className="font-medium text-slate-600 dark:text-white/80">Mobile:</span>
                      {' '} Try swiping or using touch gestures
                    </li>
                  </ul>
                </motion.div>
              </div>

              {/* Footer */}
              <div className="sticky bottom-0 px-5 md:px-6 py-3 md:py-4 border-t border-slate-100 dark:border-white/5 bg-gradient-to-t from-slate-50 dark:from-white/3 to-transparent flex items-center justify-between gap-2">
                <p className="text-xs text-slate-300 dark:text-white/50">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-white/10 border border-slate-300 dark:border-white/20 text-slate-500 dark:text-white/70">?</kbd> anytime to toggle help
                </p>
                <motion.button
                  type="button"
                  onClick={handleClose}
                  className="px-3 md:px-4 py-1.5 md:py-2 rounded-lg bg-accent-500/20 border border-accent-500/40 hover:border-accent-500/60 text-accent-200 text-xs md:text-sm font-semibold transition-all"
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {t('common.close') || 'Close'}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global keyboard listener for ? key */}
      <GlobalKeyboardListener isOpen={isOpen} onToggle={() => setIsOpen(!isOpen)} />
    </>
  );
};

// Global keyboard listener component
const GlobalKeyboardListener: React.FC<{ isOpen: boolean; onToggle: () => void }> = ({ isOpen, onToggle }) => {
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check if user is not typing in an input/textarea
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA') return;

      if (e.key === '?' || (e.shiftKey && e.key === '/')) {
        e.preventDefault();
        onToggle();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onToggle]);

  return null;
};

export default KeyboardShortcutsHelp;
