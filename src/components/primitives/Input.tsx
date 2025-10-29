/**
 * Input Component
 * Reusable form input with liquid glass styling
 * Supports error states, helper text, and icons
 * WCAG 2.1 compliant with proper ARIA attributes
 */

import type { InputHTMLAttributes } from 'react';
import { useId } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled';
  success?: boolean;
}

export function Input({
  label,
  error,
  helperText,
  icon,
  variant = 'default',
  success = false,
  className = '',
  id: providedId,
  ...props
}: InputProps) {
  const generatedId = useId();
  const id = providedId || generatedId;
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const variantClasses = {
    default: 'liquid-glass-light border border-[#C7D2E1]/30 focus:border-[#5AA6FF]/50',
    filled: 'bg-[#F9FBFF] border border-[#C7D2E1]/20 focus:border-[#5AA6FF]/50',
  };

  const stateClasses = error
    ? 'border-[#EF4444] focus:ring-[#EF4444]/20'
    : success
      ? 'border-[#06B6D4] focus:ring-[#06B6D4]/20'
      : 'focus:ring-[#5AA6FF]/20';

  const ariaDescribedBy = [
    error ? errorId : null,
    helperText && !error ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ') || undefined;

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={id} className="block text-sm font-semibold text-[#0F172A] mb-2">
          {label}
          {props.required && <span className="text-[#EF4444] ml-1" aria-label="required">*</span>}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B] pointer-events-none" aria-hidden="true">
            {icon}
          </div>
        )}
        <input
          id={id}
          className={`
            w-full px-4 py-2.5 rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8]
            transition-all duration-300 focus:outline-none focus:ring-2 min-h-[44px]
            ${icon ? 'pl-10' : ''}
            ${success && !error ? 'pr-10' : ''}
            ${variantClasses[variant]}
            ${stateClasses}
            ${className}
          `}
          aria-invalid={error ? 'true' : 'false'}
          aria-describedby={ariaDescribedBy}
          {...props}
        />
        {success && !error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#06B6D4] pointer-events-none" aria-hidden="true">
            <CheckCircle size={18} />
          </div>
        )}
        {error && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-[#EF4444] pointer-events-none" aria-hidden="true">
            <AlertCircle size={18} />
          </div>
        )}
      </div>
      {error && (
        <div id={errorId} className="flex items-center gap-1.5 mt-2 text-[#EF4444]" role="alert">
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p id={helperId} className="text-xs text-[#94A3B8] mt-1.5">{helperText}</p>
      )}
    </div>
  );
}

