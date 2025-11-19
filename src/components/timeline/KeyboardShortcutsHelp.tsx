/**
 * Keyboard Shortcuts Help Overlay
 * 
 * Shows all available keyboard shortcuts.
 * Triggered by pressing '?' key.
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Keyboard } from 'lucide-react';

interface KeyboardShortcutsHelpProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function KeyboardShortcutsHelp({ isOpen, onClose }: KeyboardShortcutsHelpProps) {
  
  const shortcuts = [
    {
      category: 'View',
      items: [
        { keys: ['V'], description: 'Toggle Horizontal/Vertical view' },
        { keys: ['C'], description: 'Toggle Conflict Radar' },
        { keys: ['T'], description: 'Scroll to Today' },
        { keys: ['cmd', '+'], description: 'Zoom In' },
        { keys: ['cmd', '-'], description: 'Zoom Out' },
        { keys: ['cmd', '0'], description: 'Reset Zoom' },
      ],
    },
    {
      category: 'Timeline',
      items: [
        { keys: ['S'], description: 'Toggle Simulation Mode' },
        { keys: ['cmd', 'Z'], description: 'Undo Drag' },
        { keys: ['cmd', '⇧', 'Z'], description: 'Redo Drag' },
        { keys: ['Esc'], description: 'Close Modal/Cancel' },
        { keys: ['?'], description: 'Show Keyboard Shortcuts' },
      ],
    },
    {
      category: 'Events',
      items: [
        { keys: ['Click'], description: 'Open Event Details' },
        { keys: ['Right Click'], description: 'Quick Actions Menu' },
        { keys: ['Drag'], description: 'Reschedule Event' },
        { keys: ['cmd', 'D'], description: 'Duplicate Event' },
        { keys: ['cmd', 'C'], description: 'Copy Event Link' },
        { keys: ['⌫'], description: 'Delete Event' },
      ],
    },
  ];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />
          
          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="glass rounded-2xl border border-white/20 w-full max-w-2xl pointer-events-auto shadow-2xl"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-accent-500/20 border border-accent-500/30 flex items-center justify-center">
                    <Keyboard className="w-5 h-5 text-accent-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">
                      Keyboard Shortcuts
                    </h2>
                    <p className="text-sm text-white/50">
                      Speed up your workflow
                    </p>
                  </div>
                </div>
                
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg glass border border-white/10 hover:border-white/30 transition-all"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              
              {/* Shortcuts List */}
              <div className="p-6 space-y-6">
                {shortcuts.map((section, sectionIndex) => (
                  <div key={sectionIndex}>
                    <h3 className="text-xs uppercase tracking-wider text-white/40 mb-3 font-medium">
                      {section.category}
                    </h3>
                    <div className="space-y-2">
                      {section.items.map((shortcut, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between py-2 px-3 rounded-lg glass border border-white/5 hover:border-white/10 transition-all"
                        >
                          <span className="text-sm text-white/70">
                            {shortcut.description}
                          </span>
                          <div className="flex items-center gap-1">
                            {shortcut.keys.map((key, keyIndex) => (
                              <React.Fragment key={keyIndex}>
                                {keyIndex > 0 && (
                                  <span className="text-white/30 text-xs mx-0.5">+</span>
                                )}
                                <kbd className="px-2 py-1 rounded bg-white/10 border border-white/20 text-xs font-mono text-white">
                                  {key}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Footer */}
              <div className="p-4 border-t border-white/10 text-center">
                <p className="text-xs text-white/40">
                  Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">?</kbd> anytime to see this help
                </p>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
