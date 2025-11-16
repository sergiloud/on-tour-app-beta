/**
 * Skip Navigation Component
 * 
 * Provides keyboard users with ability to skip repetitive navigation content.
 * WCAG 2.4.1 - Bypass Blocks compliance
 */

import React from 'react';
import { cn } from '../../lib/utils';

interface SkipLinkProps {
  href: string;
  children: React.ReactNode;
  className?: string;
}

export const SkipLink: React.FC<SkipLinkProps> = ({ 
  href, 
  children, 
  className 
}) => {
  return (
    <a
      href={href}
      className={cn(
        // Hidden by default but visible when focused
        'sr-only focus:not-sr-only',
        // Positioning and appearance when focused
        'focus:absolute focus:top-4 focus:left-4 focus:z-50',
        // Styling for visibility and interaction
        'bg-blue-600 text-white px-4 py-2 rounded-md shadow-lg',
        'text-sm font-medium',
        'hover:bg-blue-700 focus:bg-blue-700',
        // Focus ring for accessibility
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        // Smooth transitions
        'transition-colors duration-200',
        className
      )}
      tabIndex={0}
    >
      {children}
    </a>
  );
};

/**
 * Complete Skip Navigation System
 * 
 * Provides multiple skip options for complex applications
 */
export const SkipNavigation: React.FC = () => {
  return (
    <div className="skip-navigation" role="navigation" aria-label="Skip links">
      <SkipLink href="#main-content">
        Skip to main content
      </SkipLink>
      
      <SkipLink href="#primary-navigation">
        Skip to navigation
      </SkipLink>
      
      <SkipLink href="#search">
        Skip to search
      </SkipLink>
      
      <SkipLink href="#footer">
        Skip to footer
      </SkipLink>
    </div>
  );
};

/**
 * Landmark component for semantic page structure
 */
interface LandmarkProps {
  children: React.ReactNode;
  role?: string;
  ariaLabel?: string;
  ariaLabelledBy?: string;
  id?: string;
  className?: string;
}

export const Landmark: React.FC<LandmarkProps> = ({
  children,
  role,
  ariaLabel,
  ariaLabelledBy,
  id,
  className
}) => {
  const props: any = {
    className,
    id
  };

  if (role) props.role = role;
  if (ariaLabel) props['aria-label'] = ariaLabel;
  if (ariaLabelledBy) props['aria-labelledby'] = ariaLabelledBy;

  // Use semantic HTML elements when possible
  if (role === 'main') {
    return <main {...props}>{children}</main>;
  }
  
  if (role === 'navigation') {
    return <nav {...props}>{children}</nav>;
  }
  
  if (role === 'banner') {
    return <header {...props}>{children}</header>;
  }
  
  if (role === 'contentinfo') {
    return <footer {...props}>{children}</footer>;
  }
  
  if (role === 'complementary') {
    return <aside {...props}>{children}</aside>;
  }
  
  if (role === 'search') {
    return <div {...props}>{children}</div>;
  }

  return <div {...props}>{children}</div>;
};

/**
 * Enhanced Main Content wrapper with proper landmarks
 */
interface MainContentProps {
  children: React.ReactNode;
  className?: string;
  skipToId?: string;
}

export const MainContent: React.FC<MainContentProps> = ({
  children,
  className,
  skipToId = "main-content"
}) => {
  return (
    <Landmark
      role="main"
      id={skipToId}
      ariaLabel="Main content"
      className={cn(
        // Ensure focus is visible when navigated to via skip link
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset',
        'focus:ring-offset-2',
        className
      )}
      tabIndex={-1} // Allow programmatic focus but not tab navigation
    >
      {children}
    </Landmark>
  );
};

/**
 * Screen Reader Only text component
 */
interface ScreenReaderOnlyProps {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

export const ScreenReaderOnly: React.FC<ScreenReaderOnlyProps> = ({
  children,
  as: Component = 'span',
  className
}) => {
  return (
    <Component 
      className={cn('sr-only', className)}
      aria-hidden={false}
    >
      {children}
    </Component>
  );
};

/**
 * Live Region for dynamic content announcements
 */
interface LiveRegionProps {
  children: React.ReactNode;
  politeness?: 'polite' | 'assertive' | 'off';
  atomic?: boolean;
  relevant?: 'additions' | 'removals' | 'text' | 'all';
  className?: string;
}

export const LiveRegion: React.FC<LiveRegionProps> = ({
  children,
  politeness = 'polite',
  atomic = false,
  relevant = 'all',
  className
}) => {
  return (
    <div
      className={cn('sr-only', className)}
      aria-live={politeness}
      aria-atomic={atomic}
      aria-relevant={relevant}
      role={politeness === 'assertive' ? 'alert' : 'status'}
    >
      {children}
    </div>
  );
};

// Export utils for other components
export const accessibilityUtils = {
  /**
   * Generate unique IDs for form controls
   */
  generateId: (prefix: string) => `${prefix}-${Math.random().toString(36).substr(2, 9)}`,
  
  /**
   * Check if element meets minimum touch target size
   */
  meetsMinTouchTarget: (element: HTMLElement) => {
    const rect = element.getBoundingClientRect();
    return rect.width >= 44 && rect.height >= 44;
  },
  
  /**
   * Announce text to screen readers
   */
  announce: (message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', priority);
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = message;
    
    document.body.appendChild(announcement);
    
    // Remove after announcement is made
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }
};

export default SkipNavigation;