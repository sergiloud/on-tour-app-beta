import React, { useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, PanInfo } from 'framer-motion';
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
  const [isDragging, setIsDragging] = useState(false);
  const y = useMotionValue(0);
  const opacity = useTransform(y, [0, 300], [1, 0.3]);
  const scale = useTransform(y, [0, 300], [1, 0.95]);

  if (!app) return null;

  const AppComponent = app.component;

  const handleDragEnd = (_: any, info: PanInfo) => {
    setIsDragging(false);
    
    // Close if dragged down more than 150px or with sufficient velocity
    if (info.offset.y > 150 || info.velocity.y > 500) {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 bg-ink-900"
          drag="y"
          dragConstraints={{ top: 0, bottom: 0 }}
          dragElastic={{ top: 0, bottom: 0.5 }}
          onDragStart={() => setIsDragging(true)}
          onDragEnd={handleDragEnd}
          style={{ y, opacity, scale }}
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ 
            type: 'spring', 
            stiffness: 400, 
            damping: 35,
            mass: 0.5
          }}
        >
          {/* Drag Indicator */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 z-20">
            <motion.div 
              className="w-10 h-1 rounded-full bg-white/30"
              animate={{
                width: isDragging ? 48 : 40,
                backgroundColor: isDragging ? 'rgba(191, 255, 0, 0.5)' : 'rgba(255, 255, 255, 0.3)'
              }}
              transition={{ duration: 0.2 }}
            />
          </div>

          {/* Header matching desktop glass style */}
          <div 
            className="sticky top-0 z-10 border-b border-white/5 bg-ink-900/35 backdrop-blur-xl glass"
          >
            <div className="flex items-center justify-between px-4 py-3 pt-4">
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
          <div className="h-full overflow-y-auto" style={{ paddingBottom: 'max(env(safe-area-inset-bottom), 2rem)' }}>
            <AppComponent onClose={onClose} isActive={isOpen} />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
