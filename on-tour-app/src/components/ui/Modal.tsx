import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
  overlay?: boolean;
  animated?: boolean;
  className?: string;
}

const sizeStyles = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-xl',
};

/**
 * Modal Component - Dialog overlay for displaying content
 *
 * @example
 * ```tsx
 * const [isOpen, setIsOpen] = useState(false);
 *
 * <Modal
 *   isOpen={isOpen}
 *   onClose={() => setIsOpen(false)}
 *   title="Confirm Action"
 *   size="md"
 * >
 *   <p>Are you sure you want to proceed?</p>
 * </Modal>
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeButton = true,
  overlay = true,
  animated = true,
  className,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay */}
          {overlay && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
          )}

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
            <motion.div
              initial={
                animated
                  ? { opacity: 0, scale: 0.95, y: 20 }
                  : { opacity: 1, scale: 1, y: 0 }
              }
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={animated ? { opacity: 0, scale: 0.95, y: 20 } : { opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className={`
                bg-white dark:bg-slate-900
                rounded-lg shadow-2xl
                max-h-[90vh] overflow-y-auto
                w-full mx-4
                ${sizeStyles[size]}
                pointer-events-auto
                ${className}
              `}
            >
              {/* Header */}
              {title && (
                <div className="sticky top-0 z-10 flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900">
                  <h2 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h2>
                  {closeButton && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={onClose}
                      className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </motion.button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="px-6 py-4 text-slate-700 dark:text-slate-300">{children}</div>

              {/* Footer */}
              {footer && (
                <div className="sticky bottom-0 z-10 flex items-center justify-end gap-3 px-6 py-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800">
                  {footer}
                </div>
              )}
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

Modal.displayName = 'Modal';
