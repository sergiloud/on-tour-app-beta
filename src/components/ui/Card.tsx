/**
 * Card Component - Contenedor reutilizable
 */

import React from 'react';
import { motion } from 'framer-motion';
import { cardVariants, animationPresets } from '@/lib/designSystem/tokens';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'elevated' | 'filled' | 'outlined' | 'gradient' | 'compact' | 'interactive';
  animated?: boolean;
  hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({
  variant = 'elevated',
  animated = true,
  hover = false,
  children,
  className,
  ...props
}, ref) => {
  const baseClasses = cardVariants[variant];
  const finalClass = `${baseClasses} ${className || ''}`;

  if (!animated) {
    return (
      <div
        ref={ref}
        className={finalClass}
        {...props}
      >
        {children}
      </div>
    );
  }

  return (
    <motion.div
      ref={ref}
      className={finalClass}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { y: -4 } : undefined}
      {...(props as any)}
    >
      {children}
    </motion.div>
  );
});

Card.displayName = 'Card';

export default Card;
