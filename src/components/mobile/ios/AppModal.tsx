import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import type { AppDefinition } from '../../../types/mobileOS';

interface AppModalProps {
  app: AppDefinition | null;
  isOpen: boolean;
  onClose: () => void;
}

export const AppModal: React.FC<AppModalProps> = ({
  app,
  isOpen,
  onClose,
}) => {
  if (!app) return null;

  const AppComponent = app.component;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-ink-900"
          initial={{ y: '100%', scale: 0.95 }}
          animate={{ y: 0, scale: 1 }}
          exit={{ y: '100%', scale: 0.95 }}
          transition={{ 
            type: 'spring', 
            stiffness: 350, 
            damping: 30,
            mass: 0.8
          }}
        >
          {/* Header matching desktop glass style */}
          <div 
            className="sticky top-0 z-10 border-b border-white/5 bg-ink-900/35 backdrop-blur-xl glass"
            style={{
              paddingTop: 'env(safe-area-inset-top)',
            }}
          >
            <div className="flex items-center justify-between px-4 py-3">
              {/* Back Button */}
              <motion.button
                onClick={onClose}
                className="flex items-center gap-2 px-3 py-2 -ml-3 text-accent-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              >
                <ChevronLeft className="w-5 h-5" strokeWidth={2.5} />
                <span className="font-medium">Inicio</span>
              </motion.button>

              {/* App Title with Icon */}
              <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                <app.icon className="w-5 h-5 text-accent-500" strokeWidth={2} />
                <h1 className="text-lg font-semibold text-white tracking-tight">
                  {app.name}
                </h1>
              </div>

              {/* Spacer for centering */}
              <div className="w-20" />
            </div>
          </div>

          {/* App Content */}
          <div className="h-full overflow-y-auto pb-safe-bottom">
            <AppComponent onClose={onClose} isActive={isOpen} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
