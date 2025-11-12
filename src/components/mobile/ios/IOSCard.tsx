import { ReactNode } from 'react';
import { motion, HTMLMotionProps } from 'framer-motion';
import { cardTransitions } from '../../../lib/transitions';

interface IOSCardProps extends Omit<HTMLMotionProps<'div'>, 'children'> {
  children: ReactNode;
  /** Enable depth shadow (default: true) */
  elevated?: boolean;
  /** Enable hover lift effect (default: true) */
  interactive?: boolean;
  /** Enable parallax scroll effect (default: false) */
  parallax?: boolean;
  /** Background opacity (0-100, default: 10) */
  backgroundOpacity?: number;
  /** Blur amount (default: 'md') */
  blur?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

/**
 * iOS-style card with depth, elevation, and parallax effects
 * 
 * @example
 * ```tsx
 * <IOSCard elevated interactive>
 *   <h3>Show Details</h3>
 *   <p>Content here</p>
 * </IOSCard>
 * ```
 */
export const IOSCard = ({
  children,
  elevated = true,
  interactive = true,
  parallax = false,
  backgroundOpacity = 10,
  blur = 'md',
  className = '',
  ...props
}: IOSCardProps) => {
  const blurClasses = {
    none: '',
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
    xl: 'backdrop-blur-xl',
  };

  const shadowClass = elevated
    ? 'shadow-[0_8px_30px_rgb(0,0,0,0.4)]'
    : 'shadow-sm';

  return (
    <motion.div
      variants={cardTransitions}
      initial="initial"
      animate="animate"
      exit="exit"
      whileHover={interactive ? "hover" : undefined}
      whileTap={interactive ? "tap" : undefined}
      className={`
        relative rounded-2xl
        bg-white/[0.${backgroundOpacity}]
        ${blurClasses[blur]}
        border border-white/20
        ${shadowClass}
        overflow-hidden
        ${className}
      `}
      style={{
        transformStyle: parallax ? 'preserve-3d' : undefined,
      }}
      {...props}
    >
      {/* Gradient overlay for depth */}
      {elevated && (
        <div 
          className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/5 pointer-events-none"
          style={{ mixBlendMode: 'overlay' }}
        />
      )}
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
};

/**
 * Card header with iOS-style separator
 */
export const IOSCardHeader = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <div className={`px-4 py-3 border-b border-white/10 ${className}`}>
    {children}
  </div>
);

/**
 * Card body with proper padding
 */
export const IOSCardBody = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <div className={`p-4 ${className}`}>
    {children}
  </div>
);

/**
 * Card footer with iOS-style separator
 */
export const IOSCardFooter = ({ 
  children, 
  className = '' 
}: { 
  children: ReactNode; 
  className?: string;
}) => (
  <div className={`px-4 py-3 border-t border-white/10 ${className}`}>
    {children}
  </div>
);
