import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, X } from 'lucide-react';
import { hapticSelection } from '../../../lib/haptics';

interface IOSTextFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'url';
  placeholder?: string;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  maxLength?: number;
  pattern?: string;
  clearable?: boolean;
  className?: string;
}

/**
 * iOS-style text field with floating label
 * Matches native iOS form design
 */
export const IOSTextField: React.FC<IOSTextFieldProps> = ({
  label,
  value,
  onChange,
  type = 'text',
  placeholder,
  error,
  helperText,
  disabled = false,
  required = false,
  autoComplete,
  maxLength,
  pattern,
  clearable = true,
  className = '',
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const hasValue = value.length > 0;
  const isFloating = isFocused || hasValue;

  // Get correct inputMode for mobile keyboards
  const getInputMode = (): React.HTMLAttributes<HTMLInputElement>['inputMode'] => {
    switch (type) {
      case 'email':
        return 'email';
      case 'tel':
        return 'tel';
      case 'number':
        return 'numeric';
      case 'url':
        return 'url';
      default:
        return 'text';
    }
  };

  const handleClear = () => {
    onChange('');
    hapticSelection();
    inputRef.current?.focus();
  };

  const togglePassword = () => {
    setShowPassword(!showPassword);
    hapticSelection();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Input container */}
      <div
        className={`relative bg-white/5 rounded-xl border transition-all duration-200 ${
          error
            ? 'border-red-500/50 bg-red-500/5'
            : isFocused
            ? 'border-accent-500 bg-white/8'
            : 'border-white/10 hover:border-white/20'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {/* Floating label */}
        <motion.label
          htmlFor={label}
          className={`absolute left-4 pointer-events-none transition-all duration-200 ${
            error
              ? 'text-red-400'
              : isFocused
              ? 'text-accent-500'
              : 'text-white/50'
          }`}
          animate={{
            y: isFloating ? -8 : 12,
            scale: isFloating ? 0.85 : 1,
            x: isFloating ? -4 : 0,
          }}
          transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
        >
          {label}
          {required && <span className="text-red-400 ml-0.5">*</span>}
        </motion.label>

        {/* Input */}
        <input
          ref={inputRef}
          id={label}
          type={type === 'password' && showPassword ? 'text' : type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          placeholder={isFocused ? placeholder : ''}
          disabled={disabled}
          autoComplete={autoComplete}
          maxLength={maxLength}
          pattern={pattern}
          inputMode={getInputMode()}
          className={`w-full bg-transparent border-none outline-none text-white font-sf-text text-ios-body px-4 pt-6 pb-2 ${
            disabled ? 'cursor-not-allowed' : ''
          }`}
        />

        {/* Action buttons */}
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {/* Clear button */}
          {clearable && hasValue && !disabled && (
            <motion.button
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0, opacity: 0 }}
              onClick={handleClear}
              type="button"
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4 text-white/70" strokeWidth={2} />
            </motion.button>
          )}

          {/* Password visibility toggle */}
          {type === 'password' && (
            <button
              onClick={togglePassword}
              type="button"
              className="w-7 h-7 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors"
            >
              {showPassword ? (
                <EyeOff className="w-4 h-4 text-white/70" strokeWidth={2} />
              ) : (
                <Eye className="w-4 h-4 text-white/70" strokeWidth={2} />
              )}
            </button>
          )}
        </div>
      </div>

      {/* Helper text or error */}
      <AnimatePresence mode="wait">
        {(error || helperText) && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
            className={`mt-1.5 px-4 font-sf-text text-ios-caption1 ${
              error ? 'text-red-400' : 'text-white/50'
            }`}
          >
            {error || helperText}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
};
