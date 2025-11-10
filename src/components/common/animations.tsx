import React from 'react';
import { motion, AnimatePresence, HTMLMotionProps } from 'framer-motion';

// Reusable animation variants
export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

export const slideInBottom = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

// Animated container components
export const AnimatedContainer: React.FC<{
  children: React.ReactNode;
  variant?: 'fadeInUp' | 'scaleIn' | 'slideInRight' | 'slideInLeft' | 'slideInBottom';
  delay?: number;
  duration?: number;
} & HTMLMotionProps<'div'>> = ({
  children,
  variant = 'fadeInUp',
  delay = 0,
  duration = 0.3,
  ...props
}) => {
  const variants = {
    fadeInUp,
    scaleIn,
    slideInRight,
    slideInLeft,
    slideInBottom
  };

  return (
    <motion.div
      initial="initial"
      animate="animate"
      exit="exit"
      variants={variants[variant]}
      transition={{ duration, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Modal/Drawer animation wrapper
export const ModalContainer: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  onClose?: () => void;
} & HTMLMotionProps<'div'>> = ({
  children,
  isOpen,
  onClose,
  ...props
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={onClose}
          {...props}
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: 'easeOut' }}
            className="relative z-10"
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// Drawer animation wrapper
export const DrawerContainer: React.FC<{
  children: React.ReactNode;
  isOpen: boolean;
  position?: 'left' | 'right' | 'top' | 'bottom';
} & HTMLMotionProps<'div'>> = ({
  children,
  isOpen,
  position = 'right',
  ...props
}) => {
  const getVariants = () => {
    switch (position) {
      case 'left':
        return {
          initial: { x: '-100%' },
          animate: { x: 0 },
          exit: { x: '-100%' }
        };
      case 'right':
        return {
          initial: { x: '100%' },
          animate: { x: 0 },
          exit: { x: '100%' }
        };
      case 'top':
        return {
          initial: { y: '-100%' },
          animate: { y: 0 },
          exit: { y: '-100%' }
        };
      case 'bottom':
        return {
          initial: { y: '100%' },
          animate: { y: 0 },
          exit: { y: '100%' }
        };
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          {...getVariants()}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-50"
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// List item animation for reordering
export const AnimatedListItem: React.FC<{
  children: React.ReactNode;
  index: number;
  delay?: number;
} & HTMLMotionProps<'div'>> = ({
  children,
  index,
  delay = 0.05,
  ...props
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{
        duration: 0.3,
        delay: index * delay,
        ease: 'easeOut'
      }}
      layout
      {...props}
    >
      {children}
    </motion.div>
  );
};

// Button press animation
export const AnimatedButton: React.FC<{
  children: React.ReactNode;
  onClick?: () => void;
} & HTMLMotionProps<'button'>> = ({
  children,
  onClick,
  ...props
}) => {
  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      transition={{ duration: 0.1 }}
      onClick={onClick}
      {...props}
    >
      {children}
    </motion.button>
  );
};

// Hover elevation effect
export const HoverElevate: React.FC<{
  children: React.ReactNode;
  elevation?: 1 | 2 | 3;
} & HTMLMotionProps<'div'>> = ({
  children,
  elevation = 1,
  ...props
}) => {
  const getShadow = () => {
    switch (elevation) {
      case 1: return 'shadow-elevate-1';
      case 2: return 'shadow-elevate-2';
      case 3: return 'shadow-elevate-3';
      default: return 'shadow-elevate-1';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.2 }}
      className={getShadow()}
      {...props}
    >
      {children}
    </motion.div>
  );
};