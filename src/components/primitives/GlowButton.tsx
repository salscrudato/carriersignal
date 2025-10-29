/**
 * GlowButton Component
 * Reusable button with glow effects and Aurora color support
 * Supports primary (gradient), secondary (light), and ghost variants
 * Fully accessible with ARIA attributes and keyboard support
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';

export interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function GlowButton({
  children,
  variant = 'primary',
  size = 'md',
  glow = true,
  loading = false,
  icon,
  className = '',
  disabled,
  ariaLabel,
  ariaDescribedBy,
  ...props
}: GlowButtonProps) {
  const baseClasses = 'font-semibold rounded-lg transition-all duration-250 flex items-center justify-center gap-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AA6FF] will-change-transform';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#5AA6FF] to-[#8B7CFF] text-white hover:shadow-lg hover:shadow-[#5AA6FF]/40 hover:scale-102 active:scale-98 hover:-translate-y-0.5',
    secondary: 'bg-[#E8F2FF] text-[#5AA6FF] border border-[#C7D2E1]/60 hover:bg-[#D8E8FF] hover:border-[#5AA6FF]/50 hover:shadow-md hover:shadow-[#5AA6FF]/15 active:bg-[#C8DEFF]',
    ghost: 'text-[#5AA6FF] hover:bg-[#E8F2FF]/50 hover:shadow-sm hover:shadow-[#5AA6FF]/08 active:bg-[#D8E8FF]',
    danger: 'bg-[#EF4444] text-white hover:bg-[#DC2626] hover:shadow-lg hover:shadow-[#EF4444]/30 active:scale-98',
    success: 'bg-[#06B6D4] text-white hover:bg-[#0891B2] hover:shadow-lg hover:shadow-[#06B6D4]/30 active:scale-98',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-4 py-2 text-base min-h-[44px] min-w-[44px]',
    lg: 'px-6 py-3 text-lg min-h-[48px] min-w-[48px]',
  };

  const glowClasses = glow && (variant === 'primary' || variant === 'success')
    ? 'shadow-lg shadow-[#5AA6FF]/30 hover:shadow-xl hover:shadow-[#5AA6FF]/40'
    : '';

  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed'
    : '';

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      {...props}
    >
      {loading && (
        <div
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          role="status"
          aria-label="Loading"
        />
      )}
      {icon && !loading && <span className="flex items-center" aria-hidden="true">{icon}</span>}
      {children}
    </button>
  );
}

