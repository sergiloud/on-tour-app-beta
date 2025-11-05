import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SelectOption {
  value: string | number;
  label: string;
  icon?: React.ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  label?: string;
  options: SelectOption[];
  onChange: (value: string | number) => void;
  variant?: 'default' | 'compact' | 'filled';
  error?: string;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  value?: string | number;
  defaultValue?: string | number;
  className?: string;
}

/**
 * Select Component - Dropdown selector with multiple variants
 *
 * @example
 * ```tsx
 * <Select
 *   label="Choose an option"
 *   options={[
 *     { value: '1', label: 'Option 1' },
 *     { value: '2', label: 'Option 2' },
 *   ]}
 *   onChange={(value) => console.log(value)}
 *   variant="default"
 * />
 * ```
 */
export const Select = React.forwardRef<HTMLDivElement, SelectProps>(
  (
    {
      label,
      options,
      onChange,
      variant = 'default',
      error,
      icon,
      iconPosition = 'left',
      placeholder = 'Select an option',
      disabled = false,
      searchable = false,
      value: controlledValue,
      defaultValue,
      className,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchValue, setSearchValue] = useState('');
    const [value, setValue] = useState<string | number>(
      (controlledValue as string | number) || (defaultValue as string | number) || ''
    );
    const containerRef = useRef<HTMLDivElement>(null);
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Handle click outside
    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
      }
      return undefined;
    }, [isOpen]);

    // Focus search input when dropdown opens
    useEffect(() => {
      if (isOpen && searchable && searchInputRef.current) {
        searchInputRef.current.focus();
      }
    }, [isOpen, searchable]);

    const selectedOption = options.find((opt) => opt.value === value);
    const filteredOptions = searchable
      ? options.filter((opt) => opt.label.toLowerCase().includes(searchValue.toLowerCase()))
      : options;

    const variantStyles = {
      default: 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700',
      compact: 'bg-slate-50 dark:bg-slate-800 border border-transparent',
      filled: 'bg-slate-100 dark:bg-slate-800 border border-transparent',
    };

    const handleSelect = (optionValue: string | number) => {
      setValue(optionValue);
      onChange(optionValue);
      setIsOpen(false);
      setSearchValue('');
    };

    return (
      <div ref={ref || containerRef} className="w-full">
        {label && (
          <label className={`
            block text-sm font-medium
            ${error ? 'text-red-500' : 'text-slate-700 dark:text-slate-300'}
            mb-2
          `}>
            {label}
          </label>
        )}

        <div ref={containerRef} className="relative">
          {/* Select Button */}
          <motion.button
            type="button"
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              if (!disabled) setIsOpen(!isOpen);
            }}
            disabled={disabled}
            whileHover={{ scale: disabled ? 1 : 1.02 }}
            whileTap={{ scale: disabled ? 1 : 0.98 }}
            className={`
              w-full px-4 py-2.5 text-left rounded-lg
              flex items-center justify-between gap-2
              transition-all duration-200
              font-medium text-slate-900 dark:text-white
              placeholder-slate-500 dark:placeholder-slate-400
              focus:outline-none focus:ring-2 focus:ring-sky-500 dark:focus:ring-sky-400
              ${variantStyles[variant]}
              ${error ? 'border-red-500 ring-1 ring-red-500/50' : ''}
              ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              ${isOpen ? 'ring-2 ring-sky-500 dark:ring-sky-400' : ''}
            `}
          >
            <div className="flex items-center gap-2 flex-1">
              {icon && iconPosition === 'left' && (
                <span className="text-slate-500 dark:text-slate-400">{icon}</span>
              )}
              <span className={selectedOption ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400'}>
                {selectedOption?.label || placeholder}
              </span>
            </div>

            {icon && iconPosition === 'right' && (
              <span className="text-slate-500 dark:text-slate-400">{icon}</span>
            )}

            <motion.svg
              animate={{ rotate: isOpen ? 180 : 0 }}
              transition={{ duration: 0.2 }}
              className="w-4 h-4 text-slate-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </motion.svg>
          </motion.button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className={`
                  absolute top-full left-0 right-0 mt-2 z-50
                  bg-white dark:bg-slate-900
                  border border-slate-200 dark:border-slate-700
                  rounded-lg shadow-lg
                  overflow-hidden
                `}
              >
                {/* Search Input */}
                {searchable && (
                  <div className="p-2 border-b border-slate-200 dark:border-slate-700">
                    <input
                      ref={searchInputRef}
                      type="text"
                      placeholder="Search..."
                      value={searchValue}
                      onChange={(e) => setSearchValue(e.target.value)}
                      className={`
                        w-full px-3 py-2 rounded
                        bg-slate-50 dark:bg-slate-800
                        border border-slate-200 dark:border-slate-700
                        text-slate-900 dark:text-white
                        placeholder-slate-500 dark:placeholder-slate-400
                        focus:outline-none focus:ring-2 focus:ring-sky-500
                      `}
                    />
                  </div>
                )}

                {/* Options List */}
                <div className="max-h-60 overflow-y-auto">
                  {filteredOptions.length === 0 ? (
                    <div className="px-4 py-3 text-center text-slate-500 dark:text-slate-400">
                      No options found
                    </div>
                  ) : (
                    filteredOptions.map((option, index) => (
                      <motion.button
                        key={`${option.value}-${index}`}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.02 }}
                        onClick={() => handleSelect(option.value)}
                        disabled={option.disabled}
                        className={`
                          w-full px-4 py-2.5 text-left
                          flex items-center gap-3
                          transition-colors duration-150
                          hover:bg-sky-50 dark:hover:bg-sky-900/30
                          ${value === option.value ? 'bg-sky-100 dark:bg-sky-900/50' : ''}
                          ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                        `}
                      >
                        {option.icon && <span className="text-slate-600 dark:text-slate-400">{option.icon}</span>}
                        <span className="text-slate-900 dark:text-white font-medium">{option.label}</span>
                        {value === option.value && (
                          <svg className="ml-auto w-4 h-4 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </motion.button>
                    ))
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Error Message */}
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-1.5 text-sm text-red-500"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

Select.displayName = 'Select';
