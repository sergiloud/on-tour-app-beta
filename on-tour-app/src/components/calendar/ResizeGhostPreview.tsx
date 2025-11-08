import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  isActive: boolean;
  eventId?: string;
  startDate?: string;
  endDate?: string;
  direction?: 'start' | 'end';
  spanDays?: number;
  position?: { top: number; left: number; width: number; height: number };
};

/**
 * Ghost preview showing where an event will be resized to
 * Appears during drag operations to provide visual feedback
 */
const ResizeGhostPreview: React.FC<Props> = ({
  isActive,
  eventId,
  startDate,
  endDate,
  direction,
  spanDays = 1,
  position,
}) => {
  if (!isActive || !position) return null;

  const dateRange = endDate && endDate !== startDate
    ? `${new Date(startDate || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} → ${new Date(endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}`
    : new Date(startDate || '').toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          layoutId={`resize-ghost-${eventId}`}
          className="fixed pointer-events-none z-30"
          style={{
            top: position.top,
            left: position.left,
            width: position.width,
            height: position.height,
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 0.6 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="w-full h-full bg-gradient-to-r from-cyan-400/20 to-blue-400/20 border-2 border-dashed border-cyan-400/60 rounded-lg backdrop-blur-sm"
            animate={{
              borderColor: [
                'rgba(34, 211, 238, 0.6)',
                'rgba(59, 130, 246, 0.6)',
                'rgba(34, 211, 238, 0.6)',
              ],
            }}
            transition={{
              duration: 1.5,
              repeat: Infinity,
            }}
          >
            <div className="flex items-center justify-center h-full">
              <motion.div
                className="text-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
              >
                <span className="text-xs font-semibold text-cyan-200 uppercase tracking-widest block mb-1">
                  {direction === 'start' ? 'Start' : 'End'} Resize
                </span>
                <span className="text-xs text-cyan-100 font-medium">
                  {spanDays} day{spanDays !== 1 ? 's' : ''}
                </span>
              </motion.div>
            </div>
          </motion.div>

          {/* Corner indicators */}
          <motion.div
            className="absolute top-0 left-0 w-2 h-2 bg-cyan-400 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
            }}
          />
          <motion.div
            className="absolute bottom-0 right-0 w-2 h-2 bg-cyan-400 rounded-full"
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              repeat: Infinity,
            }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(ResizeGhostPreview);
