/**
 * Badge Component - Etiquetas y estados
 */

import React from 'react';
import { badgeVariants } from '../lib/designSystem/tokens';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral';
  icon?: React.ReactNode;
  dot?: boolean;
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(({
  variant = 'primary',
  icon,
  dot = false,
  children,
  className,
  ...props
}, ref) => {
  const baseClasses = badgeVariants[variant];
  const finalClass = `${baseClasses} ${className || ''}`;

  return (
    <span
      ref={ref}
      className={finalClass}
      {...props}
    >
      {dot && <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5" />}
      {icon && <span className="mr-1">{icon}</span>}
      {children}
    </span>
  );
});

Badge.displayName = 'Badge';

export default Badge;
