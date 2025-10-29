/**
 * Input Component
 * Reusable form input with liquid glass styling
 */

import type { InputHTMLAttributes } from 'react';
import { AlertCircle } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'filled';
}

export function Input({
  label,
  error,
  helperText,
  icon,
  variant = 'default',
  className = '',
  ...props
}: InputProps) {
  const variantClasses = {
    default: 'liquid-glass-light border border-[#C7D2E1]/30',
    filled: 'bg-[#F9FBFF] border border-[#C7D2E1]/20',
  };

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-[#0F172A] mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#64748B]">
            {icon}
          </div>
        )}
        <input
          className={`
            w-full px-4 py-2.5 rounded-lg text-sm text-[#0F172A] placeholder-[#94A3B8]
            transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-[#5AA6FF]
            ${icon ? 'pl-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${variantClasses[variant]}
            ${className}
          `}
          {...props}
        />
      </div>
      {error && (
        <div className="flex items-center gap-1.5 mt-2 text-red-600">
          <AlertCircle size={14} />
          <span className="text-xs font-medium">{error}</span>
        </div>
      )}
      {helperText && !error && (
        <p className="text-xs text-[#94A3B8] mt-1.5">{helperText}</p>
      )}
    </div>
  );
}

