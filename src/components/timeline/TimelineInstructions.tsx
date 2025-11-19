/**
 * Timeline Instructions Overlay
 * 
 * Shows quick tips for using the modular timeline canvas
 */

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Move, ZoomIn, MousePointer2, X } from 'lucide-react';

interface TimelineInstructionsProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function TimelineInstructions({ isOpen, onClose }: TimelineInstructionsProps) {
  const instructions = [
    {
      icon: Move,
      title: 'Free 2D Movement',
      description: 'Drag events horizontally to reschedule, vertically to organize in lanes',
      color: 'purple'
    },
    {
      icon: MousePointer2,
      title: 'Smart Connections',
      description: 'Dependency lines automatically connect related events',
      color: 'blue'
    },
    {
      icon: ZoomIn,
      title: 'Intelligent Zoom',
      description: 'Zoom in to see more details: location, metadata, financial info',
      color: 'green'
    },
  ];
  
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-6 right-6 z-50 max-w-md"
        >
          <div className="glass rounded-2xl border border-white/20 p-6 shadow-2xl">
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-lg font-bold text-white">Timeline Controls</h3>
              <button
                onClick={onClose}
                className="p-1 rounded-lg glass border border-white/10 hover:border-white/30 transition-all"
              >
                <X className="w-4 h-4 text-white/60" />
              </button>
            </div>
            
            <div className="space-y-4">
              {instructions.map((instruction, index) => {
                const Icon = instruction.icon;
                const colorClasses = {
                  purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
                  blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
                  green: 'bg-green-500/20 border-green-500/30 text-green-400',
                };
                
                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="flex items-start gap-3"
                  >
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg border flex items-center justify-center ${colorClasses[instruction.color as keyof typeof colorClasses]}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-white text-sm mb-1">
                        {instruction.title}
                      </h4>
                      <p className="text-xs text-white/60">
                        {instruction.description}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <p className="text-xs text-white/40">
                Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 text-white/60">?</kbd> for all keyboard shortcuts
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
