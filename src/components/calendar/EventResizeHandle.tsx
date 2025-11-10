import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

type Props = {
  id?: string;
  direction: 'start' | 'end';
  onDragStart: (e: React.DragEvent) => void;
  isActive?: boolean;
  aria?: string;
  title?: string;
};

/**
 * Professional resize handle with sophisticated visual feedback
 * States:
 * - idle: Sutil, casi invisible (width: 3px, opacity: 0.3)
 * - hover: Más visible (width: 6px, opacity: 0.8, cyan glow)
 * - dragging: Muy prominente (width: 8px, opacity: 1, bright cyan, pulsing)
 *
 * Features:
 * - Spring physics for natural animations
 * - Pulsing indicator dot during drag
 * - Glow ring effect
 * - Color state transitions (white → cyan → cyan-bright)
 * - ARIA accessibility labels
 * - Native HTML5 drag support
 */
const EventResizeHandle = React.forwardRef<HTMLDivElement, Props>(({
  id,
  direction,
  onDragStart,
  isActive = false,
  aria,
  title,
}, ref) => {
  const [isDragging, setIsDragging] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);

  const isStart = direction === 'start';

  // State-based dimensions and colors
  const getStateStyles = () => {
    if (isDragging) {
      return {
        width: '0.625rem',
        opacity: 1,
        glowColor: 'rgba(34, 211, 238, 1)',
        glowBlur: '12px',
        bgGradient: 'from-cyan-200 via-cyan-300 to-cyan-400',
        shadowSize: 'xl',
        brightness: 1.4,
      };
    }
    if (isHovering) {
      return {
        width: '0.375rem',
        opacity: 0.9,
        glowColor: 'rgba(34, 211, 238, 0.7)',
        glowBlur: '8px',
        bgGradient: 'from-cyan-300/90 to-cyan-200/80',
        shadowSize: 'md',
        brightness: 1.2,
      };
    }
    // idle
    return {
      width: '0.1875rem',
      opacity: 0.35,
      glowColor: 'rgba(255, 255, 255, 0.25)',
      glowBlur: '4px',
      bgGradient: 'from-white/50 to-white/30',
      shadowSize: 'sm',
      brightness: 1,
    };
  };

  const stateStyles = getStateStyles();

  // Native div for drag support (Framer Motion interferes with native drag events)
  return (
    <div
      ref={ref}
      draggable
      onDragStart={(e: React.DragEvent) => {
        console.log('🎯 DRAG START on handle', direction, 'for event', id);
        e.stopPropagation();

        // Set data FIRST before calling onDragStart
        e.dataTransfer!.effectAllowed = 'move';
        e.dataTransfer!.setData('text/plain', `resize:${id}:${direction}`);
        console.log('📤 Set drag data:', `resize:${id}:${direction}`);

        setIsDragging(true);

        // Call the onDragStart callback (which may set additional data from EventChip)
        onDragStart(e);
      }}
      onDragEnd={() => {
        console.log('🏁 DRAG END on handle', direction);
        setIsDragging(false);
      }}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={`
        absolute top-0 bottom-0
        ${isStart ? 'left-0' : 'right-0'}
        cursor-col-resize
        z-20
        group
        flex items-center justify-center
      `}
      title={title}
      role="button"
      tabIndex={0}
      aria-label={aria}
      aria-pressed={isDragging}
      aria-describedby={title ? `resize-hint-${id}-${direction}` : undefined}
    >
      {/* Animated container for visual effects */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center"
        animate={{
          width: stateStyles.width,
          opacity: stateStyles.opacity,
          transition: {
            type: 'spring',
            stiffness: 700,
            damping: 40,
            mass: 0.7,
          },
        }}
        initial={{ opacity: 0.3 }}
      >
        {/* Main handle bar - gradient background */}
        <motion.div
          className={`
            absolute inset-0
            bg-gradient-to-r ${stateStyles.bgGradient}
            ${isStart ? 'rounded-l-md' : 'rounded-r-md'}
          `}
          animate={{
            boxShadow: isDragging
              ? `0 0 ${stateStyles.glowBlur} ${stateStyles.glowColor}, inset 0 0 8px rgba(34, 211, 238, 0.4)`
              : isHovering
              ? `0 0 ${stateStyles.glowBlur} ${stateStyles.glowColor}`
              : `0 0 ${stateStyles.glowBlur} ${stateStyles.glowColor}`,
            filter: `brightness(${stateStyles.brightness})`,
            transition: {
              duration: 0.25,
              ease: 'easeOut',
            },
          }}
        />

        {/* Pulsing indicator dot when dragging */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              layoutId={`resize-indicator-${id}-${direction}`}
              className="absolute w-2 h-2 rounded-full bg-cyan-200 z-10"
              initial={{ scale: 0, opacity: 0 }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.9, 1, 0.9],
                boxShadow: [
                  '0 0 8px rgba(34, 211, 238, 0.8)',
                  '0 0 16px rgba(34, 211, 238, 1)',
                  '0 0 8px rgba(34, 211, 238, 0.8)',
                ],
                transition: {
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              exit={{ scale: 0, opacity: 0, transition: { duration: 0.2 } }}
            />
          )}
        </AnimatePresence>

        {/* Expanding glow ring during drag */}
        <AnimatePresence>
          {isDragging && (
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-cyan-300/50 bg-cyan-300/5"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{
                scale: [1, 1.4, 1],
                opacity: [0.3, 0.5, 0.3],
                borderColor: ['rgba(34, 211, 238, 0.3)', 'rgba(34, 211, 238, 0.6)', 'rgba(34, 211, 238, 0.3)'],
                transition: {
                  duration: 0.8,
                  repeat: Infinity,
                  ease: 'easeInOut',
                },
              }}
              exit={{ scale: 0.8, opacity: 0, transition: { duration: 0.2 } }}
            />
          )}
        </AnimatePresence>

        {/* Subtle hover indicator line */}
        <AnimatePresence>
          {isHovering && !isDragging && (
            <motion.div
              className="absolute w-0.5 h-4 bg-cyan-300/60 rounded-full"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1, transition: { duration: 0.2 } }}
              exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
              style={{
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
});

EventResizeHandle.displayName = 'EventResizeHandle';

export default EventResizeHandle;
