/**
 * GlowButton Component
 * Reusable button with glow effects and Aurora color support
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';

interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
}

export function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  glow = true,
  loading = false,
  className = '',
  disabled,
  ...props
}: GlowButtonProps) {
  const baseClasses = 'font-medium rounded-lg transition-all duration-300 flex items-center justify-center gap-2';

  const variantClasses = {
    primary: 'bg-[#5AA6FF] text-white hover:bg-[#4A96EF] active:bg-[#3A86DF]',
    secondary: 'bg-[#E8F2FF] text-[#5AA6FF] hover:bg-[#D8E8FF] active:bg-[#C8DEFF]',
    ghost: 'text-[#5AA6FF] hover:bg-[#E8F2FF]/50 active:bg-[#D8E8FF]',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  const glowClasses = glow && variant === 'primary'
    ? 'shadow-lg shadow-[#5AA6FF]/30 hover:shadow-xl hover:shadow-[#5AA6FF]/40'
    : '';

  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed'
    : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
      )}
      {children}
    </button>
  );
}

