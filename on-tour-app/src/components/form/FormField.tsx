import React, { ReactNode } from 'react';

interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * FormField Component - Unified form field wrapper
 * Handles layout, labels, hints, and error messages
 * Features:
 * - Consistent spacing and typography
 * - Required indicator
 * - Helper text / hints
 * - Error message display
 * - Accessible ARIA labels
 */
const FormField: React.FC<FormFieldProps> = ({
  label,
  hint,
  error,
  required = false,
  children,
  className = '',
}) => {
  const fieldId = `field-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      {label && (
        <label
          htmlFor={fieldId}
          className="text-sm font-medium text-white flex items-center gap-1"
        >
          {label}
          {required && <span className="text-red-400">*</span>}
        </label>
      )}

      <div>
        {React.isValidElement(children)
          ? React.cloneElement(children as React.ReactElement<any>, { id: fieldId })
          : children}
      </div>

      {error && (
        <p className="text-xs text-red-400 flex items-center gap-1">
          <span>✕</span> {error}
        </p>
      )}

      {hint && !error && (
        <p className="text-xs text-slate-300 dark:text-white/50">{hint}</p>
      )}
    </div>
  );
};

FormField.displayName = 'FormField';

export default FormField;
