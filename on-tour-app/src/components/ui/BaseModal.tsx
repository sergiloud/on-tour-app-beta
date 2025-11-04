import React, { ReactNode, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { announce } from '../../lib/announcer';

/**
 * BaseModal - Centralized modal component
 *
 * Provides:
 * - Focus management (focus trap, focus restoration)
 * - Accessibility (WCAG 2.1 AA)
 * - Animation (Framer Motion)
 * - Consistent styling
 * - Click-outside to close
 * - Keyboard escape support
 *
 * Usage:
 * <BaseModal
 *   isOpen={isOpen}
 *   title="Modal Title"
 *   onClose={handleClose}
 *   size="md"
 * >
 *   <ModalContent />
 * </BaseModal>
 */

export type ModalSize = 'sm' | 'md' | 'lg' | 'xl' | 'full';

interface BaseModalProps {
  /** Whether the modal is open */
  isOpen: boolean;

  /** Title for accessibility and display */
  title: string;

  /** Callback when modal should close */
  onClose: () => void;

  /** Modal content */
  children: ReactNode;

  /** Modal size */
  size?: ModalSize;

  /** Show close button */
  showClose?: boolean;

  /** Additional CSS classes */
  className?: string;

  /** Custom header content (replaces title if provided) */
  header?: ReactNode;

  /** Custom footer content */
  footer?: ReactNode;

  /** Modal description for accessibility */
  description?: string;

  /** Prevent closing when clicking outside */
  closeOnClickOutside?: boolean;

  /** Prevent closing when pressing Escape */
  closeOnEscape?: boolean;

  /** z-index value */
  zIndex?: number;
}

const sizeClasses: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  full: 'max-w-full mx-4'
};

/**
 * Get all focusable elements within a container
 */
function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector = [
    'button:not([disabled])',
    '[href]',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])'
  ].join(',');

  return Array.from(container.querySelectorAll(selector));
}

/**
 * Focus trap - keep focus within modal
 */
function useFocusTrap(isOpen: boolean, modalRef: React.RefObject<HTMLDivElement>) {
  useEffect(() => {
    if (!isOpen || !modalRef.current) return;

    const focusableElements = getFocusableElements(modalRef.current);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    // Focus first element
    if (firstElement instanceof HTMLElement) {
      firstElement.focus();
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === firstElement) {
          e.preventDefault();
          if (lastElement instanceof HTMLElement) {
            lastElement.focus();
          }
        }
      } else {
        // Tab
        if (document.activeElement === lastElement) {
          e.preventDefault();
          if (firstElement instanceof HTMLElement) {
            firstElement.focus();
          }
        }
      }
    };

    modalRef.current.addEventListener('keydown', handleKeyDown);
    return () => {
      modalRef.current?.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);
}

/**
 * Store and restore focus
 */
function useFocusRestore(isOpen: boolean) {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (isOpen) {
      // Store current focus
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Prevent scroll jump
      document.body.style.overflow = 'hidden';
    } else {
      // Restore focus
      if (previousFocusRef.current && previousFocusRef.current.focus) {
        previousFocusRef.current.focus();
      }
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);
}

export const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
  size = 'md',
  showClose = true,
  className = '',
  header,
  footer,
  description,
  closeOnClickOutside = true,
  closeOnEscape = true,
  zIndex = 50
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // Focus management
  useFocusTrap(isOpen, modalRef);
  useFocusRestore(isOpen);

  // Handle escape key
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Escape' && closeOnEscape) {
        onClose();
        announce('Modal closed');
      }
    },
    [closeOnEscape, onClose]
  );

  // Handle backdrop click
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (closeOnClickOutside && e.target === e.currentTarget) {
      onClose();
      announce('Modal closed');
    }
  };

  // Announce modal open
  useEffect(() => {
    if (isOpen) {
      announce(`${title} modal opened`);
    }
  }, [isOpen, title]);

  return (
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleBackdropClick}
            className="fixed inset-0 bg-black/50 z-[49]"
            style={{ zIndex: zIndex - 1 }}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            key="modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none"
            style={{ zIndex }}
            onKeyDown={handleKeyDown}
            role="presentation"
          >
            {/* Modal Content */}
            <div
              ref={modalRef}
              className={`
                pointer-events-auto
                ${sizeClasses[size]}
                w-full
                max-h-[90vh]
                overflow-y-auto
                rounded-lg
                bg-white
                dark:bg-gray-900
                shadow-xl
                flex
                flex-col
                ${className}
              `}
              role="dialog"
              aria-modal="true"
              aria-labelledby="modal-title"
              aria-describedby={description ? 'modal-description' : undefined}
            >
              {/* Header */}
              <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900">
                {header ? (
                  <div className="flex-1">{header}</div>
                ) : (
                  <h2
                    id="modal-title"
                    className="text-xl font-semibold text-gray-900 dark:text-white"
                  >
                    {title}
                  </h2>
                )}

                {showClose && (
                  <button
                    onClick={onClose}
                    className="ml-4 inline-flex items-center justify-center w-8 h-8 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    aria-label={`Close ${title}`}
                    type="button"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Description (for accessibility) */}
              {description && (
                <div id="modal-description" className="sr-only">
                  {description}
                </div>
              )}

              {/* Body */}
              <div
                ref={contentRef}
                className="flex-1 overflow-y-auto p-6"
              >
                {children}
              </div>

              {/* Footer */}
              {footer && (
                <div className="sticky bottom-0 border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-800">
                  {footer}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default BaseModal;
