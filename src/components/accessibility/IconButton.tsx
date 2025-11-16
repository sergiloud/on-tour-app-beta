/**
 * Accessible Icon Button Component
 * 
 * Provides proper ARIA labels, focus management, and touch target sizing
 * WCAG 4.1.2 - Name, Role, Value compliance
 */

import React, { forwardRef } from 'react';

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

interface IconButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Icon component or element to display */
  icon: React.ReactNode;
  /** Action description for accessibility */
  action: string;
  /** Additional context for screen readers */
  description?: string;
  /** Button variant */
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  /** Button size */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
  /** Tooltip text (will be used as aria-label if no action provided) */
  tooltip?: string;
  /** Whether the button is in a pressed/active state (for toggle buttons) */
  pressed?: boolean;
  /** Custom aria-label (overrides generated label) */
  ariaLabel?: string;
  /** ID for aria-describedby */
  describedBy?: string;
}

const sizeClasses = {
  sm: 'p-1.5 text-sm min-w-[32px] min-h-[32px]', // Smaller than ideal but common
  md: 'p-2.5 text-base min-w-[44px] min-h-[44px]', // WCAG compliant touch target
  lg: 'p-3.5 text-lg min-w-[48px] min-h-[48px]'   // Generous touch target
};

const variantClasses = {
  primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 active:bg-blue-800',
  secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500 active:bg-gray-400',
  ghost: 'bg-transparent text-gray-600 hover:bg-gray-100 focus:ring-gray-500 active:bg-gray-200',
  danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 active:bg-red-800'
};

export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  ({
    icon,
    action,
    description,
    variant = 'ghost',
    size = 'md',
    loading = false,
    tooltip,
    pressed,
    ariaLabel,
    describedBy,
    className,
    disabled,
    ...props
  }, ref) => {
    // Generate unique ID for description
    const descriptionId = React.useMemo(() => 
      description ? `btn-desc-${Math.random().toString(36).substr(2, 9)}` : undefined,
      [description]
    );

    // Generate accessible label
    const accessibleLabel = ariaLabel || `${action}${tooltip ? ` - ${tooltip}` : ''}`;

    return (
      <>
        <button
          ref={ref}
          aria-label={accessibleLabel}
          aria-describedby={describedBy || descriptionId}
          aria-pressed={pressed !== undefined ? pressed : undefined}
          title={tooltip}
          disabled={disabled || loading}
          className={cn(
            // Base styles
            'inline-flex items-center justify-center rounded-lg font-medium',
            'transition-all duration-200 ease-in-out',
            
            // Focus styles for accessibility
            'focus:outline-none focus:ring-2 focus:ring-offset-2',
            'focus:ring-opacity-50',
            
            // Size classes
            sizeClasses[size],
            
            // Variant classes
            variantClasses[variant],
            
            // Disabled state
            disabled || loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
            
            // Pressed state for toggle buttons
            pressed && 'ring-2 ring-current ring-opacity-30',
            
            className
          )}
          {...props}
        >
          {loading ? (
            <>
              {/* Loading spinner */}
              <svg 
                className="animate-spin -ml-1 mr-2 h-4 w-4" 
                xmlns="http://www.w3.org/2000/svg" 
                fill="none" 
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <circle 
                  className="opacity-25" 
                  cx="12" 
                  cy="12" 
                  r="10" 
                  stroke="currentColor" 
                  strokeWidth="4"
                />
                <path 
                  className="opacity-75" 
                  fill="currentColor" 
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              <span className="sr-only">Loading...</span>
            </>
          ) : (
            icon
          )}
        </button>
        
        {/* Hidden description for screen readers */}
        {description && descriptionId && (
          <span id={descriptionId} className="sr-only">
            {description}
          </span>
        )}
      </>
    );
  }
);

IconButton.displayName = 'IconButton';

/**
 * Icon Button with text label (for better accessibility)
 */
interface IconTextButtonProps extends Omit<IconButtonProps, 'action' | 'icon'> {
  children: React.ReactNode;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

export const IconTextButton = forwardRef<HTMLButtonElement, IconTextButtonProps>(
  ({
    icon,
    iconPosition = 'left',
    children,
    variant = 'ghost',
    size = 'md',
    loading = false,
    className,
    ...props
  }, ref) => {
    return (
      <button
        ref={ref}
        disabled={loading}
        className={cn(
          // Base styles
          'inline-flex items-center justify-center rounded-lg font-medium',
          'transition-all duration-200 ease-in-out gap-2',
          
          // Focus styles for accessibility
          'focus:outline-none focus:ring-2 focus:ring-offset-2',
          'focus:ring-opacity-50',
          
          // Size classes with text padding
          {
            sm: 'px-3 py-1.5 text-sm min-h-[32px]',
            md: 'px-4 py-2.5 text-base min-h-[44px]',
            lg: 'px-6 py-3.5 text-lg min-h-[48px]'
          }[size],
          
          // Variant classes
          variantClasses[variant],
          
          // Disabled state
          loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          
          className
        )}
        {...props}
      >
        {loading && (
          <svg 
            className="animate-spin h-4 w-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
        )}
        
        {!loading && icon && iconPosition === 'left' && (
          <span aria-hidden="true">{icon}</span>
        )}
        
        <span>{children}</span>
        
        {!loading && icon && iconPosition === 'right' && (
          <span aria-hidden="true">{icon}</span>
        )}
        
        {loading && <span className="sr-only">Loading...</span>}
      </button>
    );
  }
);

IconTextButton.displayName = 'IconTextButton';

/**
 * Toggle Icon Button for on/off states
 */
interface ToggleIconButtonProps extends Omit<IconButtonProps, 'pressed'> {
  /** Whether the toggle is currently active/pressed */
  active: boolean;
  /** Callback when toggle state changes */
  onToggle: (active: boolean) => void;
  /** Label when active */
  activeLabel?: string;
  /** Label when inactive */
  inactiveLabel?: string;
  /** Icon when active */
  activeIcon?: React.ReactNode;
  /** Icon when inactive */
  inactiveIcon?: React.ReactNode;
}

export const ToggleIconButton = forwardRef<HTMLButtonElement, ToggleIconButtonProps>(
  ({
    active,
    onToggle,
    activeLabel,
    inactiveLabel,
    activeIcon,
    inactiveIcon,
    action,
    icon,
    ...props
  }, ref) => {
    const currentIcon = active ? (activeIcon || icon) : (inactiveIcon || icon);
    const currentLabel = active ? activeLabel : inactiveLabel;
    const fullAction = currentLabel || `${active ? 'Deactivate' : 'Activate'} ${action}`;
    
    return (
      <IconButton
        ref={ref}
        icon={currentIcon}
        action={fullAction}
        pressed={active}
        onClick={() => onToggle(!active)}
        variant={active ? 'primary' : 'ghost'}
        {...props}
      />
    );
  }
);

ToggleIconButton.displayName = 'ToggleIconButton';

/**
 * Close button with consistent styling and accessibility
 */
interface CloseButtonProps extends Omit<IconButtonProps, 'icon' | 'action'> {
  /** What is being closed (for accessibility) */
  closes?: string;
}

export const CloseButton = forwardRef<HTMLButtonElement, CloseButtonProps>(
  ({ closes = 'dialog', ...props }, ref) => {
    return (
      <IconButton
        ref={ref}
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        }
        action={`Close ${closes}`}
        variant="ghost"
        size="md"
        {...props}
      />
    );
  }
);

CloseButton.displayName = 'CloseButton';

export default IconButton;