/**
 * Focus Management Utilities and Components
 * 
 * Provides focus trap functionality and proper focus management for modals and dialogs
 * WCAG 2.4.3 - Focus Order compliance
 */

import React, { useEffect, useRef, useCallback } from 'react';

// Utility function for combining class names
const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ');
};

/**
 * Get all focusable elements within a container
 */
const getFocusableElements = (container: HTMLElement): HTMLElement[] => {
  const focusableSelectors = [
    'button:not([disabled])',
    'input:not([disabled]):not([type="hidden"])',
    'textarea:not([disabled])',
    'select:not([disabled])',
    'a[href]',
    '[tabindex]:not([tabindex="-1"])',
    '[contenteditable="true"]',
    'audio[controls]',
    'video[controls]',
    'summary',
    'iframe'
  ].join(', ');

  return Array.from(container.querySelectorAll(focusableSelectors))
    .filter(el => {
      // Filter out elements that are not visible
      const element = el as HTMLElement;
      const style = window.getComputedStyle(element);
      return style.display !== 'none' && 
             style.visibility !== 'hidden' && 
             element.offsetWidth > 0 && 
             element.offsetHeight > 0;
    }) as HTMLElement[];
};

/**
 * Focus Trap Hook
 */
interface UseFocusTrapOptions {
  isActive: boolean;
  initialFocus?: HTMLElement | null;
  restoreFocus?: boolean;
  allowOutsideClick?: boolean;
}

export const useFocusTrap = ({
  isActive,
  initialFocus,
  restoreFocus = true,
  allowOutsideClick = false
}: UseFocusTrapOptions) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (!isActive || !containerRef.current) return;

    if (event.key === 'Tab') {
      const focusableElements = getFocusableElements(containerRef.current);
      
      if (focusableElements.length === 0) {
        event.preventDefault();
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab - move to previous element
        if (activeElement === firstElement || !focusableElements.includes(activeElement)) {
          event.preventDefault();
          lastElement?.focus();
        }
      } else {
        // Tab - move to next element
        if (activeElement === lastElement || !focusableElements.includes(activeElement)) {
          event.preventDefault();
          firstElement?.focus();
        }
      }
    }

    // Escape key to close
    if (event.key === 'Escape' && allowOutsideClick) {
      const escapeEvent = new CustomEvent('focustrap-escape');
      containerRef.current?.dispatchEvent(escapeEvent);
    }
  }, [isActive, allowOutsideClick]);

  const handleClick = useCallback((event: MouseEvent) => {
    if (!isActive || !containerRef.current || allowOutsideClick) return;

    const target = event.target as HTMLElement;
    if (!containerRef.current.contains(target)) {
      event.preventDefault();
      event.stopPropagation();
      
      // Return focus to the container if clicked outside
      const focusableElements = getFocusableElements(containerRef.current);
      if (focusableElements.length > 0) {
        focusableElements[0]?.focus();
      }
    }
  }, [isActive, allowOutsideClick]);

  useEffect(() => {
    if (!isActive) return;

    // Store the currently focused element
    previousActiveElement.current = document.activeElement as HTMLElement;

    // Set initial focus
    const setInitialFocus = () => {
      if (!containerRef.current) return;

      let elementToFocus: HTMLElement | null = null;

      if (initialFocus) {
        elementToFocus = initialFocus;
      } else {
        // Find the first focusable element
        const focusableElements = getFocusableElements(containerRef.current);
        elementToFocus = focusableElements[0] || containerRef.current;
      }

      if (elementToFocus) {
        elementToFocus.focus();
      }
    };

    // Delay to ensure DOM is ready
    setTimeout(setInitialFocus, 0);

    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClick, true);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClick, true);

      // Restore focus when trap is deactivated
      if (restoreFocus && previousActiveElement.current) {
        previousActiveElement.current.focus();
      }
    };
  }, [isActive, handleKeyDown, handleClick, initialFocus, restoreFocus]);

  return containerRef;
};

/**
 * Focus Trap Component
 */
interface FocusTrapProps {
  children: React.ReactNode;
  isActive: boolean;
  initialFocus?: React.RefObject<HTMLElement>;
  restoreFocus?: boolean;
  allowOutsideClick?: boolean;
  className?: string;
  onEscape?: () => void;
}

export const FocusTrap: React.FC<FocusTrapProps> = ({
  children,
  isActive,
  initialFocus,
  restoreFocus = true,
  allowOutsideClick = false,
  className,
  onEscape
}) => {
  const containerRef = useFocusTrap({
    isActive,
    initialFocus: initialFocus?.current || null,
    restoreFocus,
    allowOutsideClick
  });

  useEffect(() => {
    if (!onEscape) return;

    const handleEscape = () => onEscape();
    containerRef.current?.addEventListener('focustrap-escape', handleEscape);

    return () => {
      containerRef.current?.removeEventListener('focustrap-escape', handleEscape);
    };
  }, [onEscape]);

  return (
    <div
      ref={containerRef}
      className={className}
      tabIndex={-1}
    >
      {children}
    </div>
  );
};

/**
 * Modal with proper focus management
 */
interface AccessibleModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  initialFocus?: React.RefObject<HTMLElement>;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AccessibleModal: React.FC<AccessibleModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  initialFocus,
  size = 'md',
  className
}) => {
  const titleId = React.useMemo(() => 
    `modal-title-${Math.random().toString(36).substr(2, 9)}`,
    []
  );
  
  const descId = React.useMemo(() => 
    `modal-desc-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl'
  };

  useEffect(() => {
    if (isOpen) {
      // Disable body scroll
      document.body.style.overflow = 'hidden';
      
      // Announce modal opening to screen readers
      const announcement = document.createElement('div');
      announcement.setAttribute('aria-live', 'assertive');
      announcement.setAttribute('aria-atomic', 'true');
      announcement.className = 'sr-only';
      announcement.textContent = `Dialog opened: ${title}`;
      document.body.appendChild(announcement);
      
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    } else {
      // Re-enable body scroll
      document.body.style.overflow = '';
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, title]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
      aria-describedby={description ? descId : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Content */}
      <FocusTrap
        isActive={isOpen}
        initialFocus={initialFocus}
        restoreFocus={true}
        allowOutsideClick={true}
        onEscape={onClose}
        className={cn(
          'relative bg-white rounded-lg shadow-xl max-h-full overflow-auto',
          'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          sizeClasses[size],
          'w-full',
          className
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 id={titleId} className="text-xl font-semibold text-gray-900">
            {title}
          </h2>
          
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
            aria-label="Close dialog"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Description */}
        {description && (
          <div className="px-6 pb-4">
            <p id={descId} className="text-sm text-gray-600">
              {description}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="px-6 pb-6">
          {children}
        </div>
      </FocusTrap>
    </div>
  );
};

/**
 * Focus management utilities
 */
export const focusUtils = {
  /**
   * Move focus to the next focusable element
   */
  focusNext: (currentElement?: HTMLElement) => {
    const focusableElements = getFocusableElements(document.body);
    const currentIndex = currentElement ? focusableElements.indexOf(currentElement) : -1;
    const nextIndex = currentIndex + 1;
    
    if (nextIndex < focusableElements.length) {
      focusableElements[nextIndex]?.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0]?.focus(); // Wrap to first
    }
  },

  /**
   * Move focus to the previous focusable element
   */
  focusPrevious: (currentElement?: HTMLElement) => {
    const focusableElements = getFocusableElements(document.body);
    const currentIndex = currentElement ? focusableElements.indexOf(currentElement) : -1;
    const prevIndex = currentIndex - 1;
    
    if (prevIndex >= 0) {
      focusableElements[prevIndex]?.focus();
    } else if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1]?.focus(); // Wrap to last
    }
  },

  /**
   * Check if an element is currently visible and focusable
   */
  isFocusable: (element: HTMLElement): boolean => {
    return getFocusableElements(document.body).includes(element);
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
    
    setTimeout(() => {
      if (document.body.contains(announcement)) {
        document.body.removeChild(announcement);
      }
    }, 1000);
  }
};

export default {
  FocusTrap,
  AccessibleModal,
  useFocusTrap,
  focusUtils
};