import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap } from 'lucide-react';

interface AppSwitcherProps {
  isOpen: boolean;
  onClose: () => void;
  recentApps: Array<{
    id: string;
    name: string;
    icon: React.ComponentType<any>;
    component: React.ComponentType<any>;
  }>;
  onAppSelect: (appId: string) => void;
}

export const AppSwitcher: React.FC<AppSwitcherProps> = ({
  isOpen,
  onClose,
  recentApps,
  onAppSelect,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowLeft':
          setSelectedIndex((prev) => Math.max(0, prev - 1));
          if (navigator.vibrate) navigator.vibrate(5);
          break;
        case 'ArrowRight':
          setSelectedIndex((prev) => Math.min(recentApps.length - 1, prev + 1));
          if (navigator.vibrate) navigator.vibrate(5);
          break;
        case 'Enter':
          if (recentApps[selectedIndex]) {
            onAppSelect(recentApps[selectedIndex].id);
          }
          break;
        case 'Escape':
          onClose();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, recentApps, onAppSelect, onClose]);

  if (recentApps.length === 0) return null;

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
            className="fixed inset-0 z-[180] bg-black/70 backdrop-blur-md"
          />

          {/* App Cards Carousel */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[190] flex items-center justify-center p-6"
          >
            <div className="max-w-4xl w-full">
              {/* Header */}
              <motion.div
                initial={{ y: -20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.1 }}
                className="text-center mb-8"
              >
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Zap className="w-5 h-5 text-accent-500" />
                  <h2 className="text-xl font-semibold text-white">Apps Recientes</h2>
                </div>
                <p className="text-white/50 text-sm">
                  Desliza o usa las flechas para navegar
                </p>
              </motion.div>

              {/* Cards Container */}
              <div className="relative h-96 flex items-center justify-center gpu-accelerate">
                {recentApps.map((app, index) => {
                  const offset = index - selectedIndex;
                  const isSelected = index === selectedIndex;
                  
                  return (
                    <motion.div
                      key={app.id}
                      className="absolute w-72 h-full cursor-pointer app-switcher-card"
                      style={{
                        zIndex: recentApps.length - Math.abs(offset),
                      }}
                      initial={false}
                      animate={{
                        x: offset * 100,
                        scale: isSelected ? 1 : 0.85,
                        opacity: Math.abs(offset) > 2 ? 0 : 1 - Math.abs(offset) * 0.3,
                        rotateY: offset * -5,
                      }}
                      transition={{
                        duration: 0.3,
                        ease: 'easeOut'
                      }}
                      onClick={() => {
                        if (isSelected) {
                          onAppSelect(app.id);
                        } else {
                          setSelectedIndex(index);
                          if (navigator.vibrate) navigator.vibrate(10);
                        }
                      }}
                      whileHover={{ scale: isSelected ? 1.02 : 0.88 }}
                    >
                      {/* App Card */}
                      <div 
                        className={`
                          h-full rounded-3xl overflow-hidden
                          bg-gradient-to-br from-white/10 to-white/5
                          backdrop-blur-xl border
                          ${isSelected ? 'border-accent-500/50' : 'border-white/10'}
                          shadow-2xl
                        `}
                      >
                        {/* Card Header */}
                        <div className="p-6 border-b border-white/10 bg-gradient-to-br from-accent-500/10 to-transparent">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-accent-500 to-accent-600 flex items-center justify-center">
                              <app.icon className="w-6 h-6 text-white" strokeWidth={2} />
                            </div>
                            <div>
                              <h3 className="text-white font-semibold text-lg">{app.name}</h3>
                              <p className="text-white/50 text-xs">Toca para abrir</p>
                            </div>
                          </div>
                        </div>

                        {/* App Preview/Snapshot */}
                        <div className="p-6 h-64 bg-ink-950/50 flex items-center justify-center">
                          <div className="text-center">
                            <app.icon className="w-16 h-16 text-white/30 mx-auto mb-3" strokeWidth={1.5} />
                            <p className="text-white/40 text-sm">Vista previa de {app.name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Selection indicator */}
                      {isSelected && (
                        <motion.div
                          layoutId="selector"
                          className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-12 h-1 bg-accent-500 rounded-full gpu-accelerate"
                          transition={{ duration: 0.25, ease: 'easeOut' }}
                        />
                      )}
                    </motion.div>
                  );
                })}
              </div>

              {/* Navigation Hints */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="flex justify-center gap-4 mt-12"
              >
                <div className="text-white/40 text-sm">
                  ← → Navegar
                </div>
                <div className="text-white/40 text-sm">
                  ⏎ Abrir
                </div>
                <div className="text-white/40 text-sm">
                  Esc Cerrar
                </div>
              </motion.div>

              {/* Close hint */}
              <div className="text-center mt-6">
                <button
                  onClick={onClose}
                  className="text-white/50 text-sm hover:text-white transition-colors"
                >
                  Toca fuera para cerrar
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};