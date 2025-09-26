import React from 'react';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement> & { label?: string };

export const Input = React.forwardRef<HTMLInputElement, InputProps>(function Input({ label, className = '', ...props }, ref) {
  return (
    <label className="flex flex-col gap-1">
      {label && <span className="text-xs opacity-70">{label}</span>}
      <input ref={ref} className={`bg-white/5 rounded px-2 py-1 ${className}`} {...props} />
    </label>
  );
});

export default Input;
