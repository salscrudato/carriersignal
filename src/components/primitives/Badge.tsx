/**
 * Badge Component
 * Reusable badge for tags, labels, and status indicators
 * Supports LOB, peril, region, and semantic variants
 * Features glow effects, micro-animations, and accessibility
 */

import type { ReactNode, HTMLAttributes, KeyboardEvent } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'lob' | 'peril' | 'region' | 'company' | 'trend' | 'regulation';
  size?: 'sm' | 'md';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  glow?: boolean;
  ariaLabel?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
  interactive = false,
  onClick,
  glow = false,
  ariaLabel,
  ...props
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-semibold rounded-full transition-all duration-200 will-change-transform';

  const variantClasses = {
    default: 'bg-[#E8F2FF] text-[#5AA6FF] border border-[#5AA6FF]/25 hover:border-[#5AA6FF]/40 hover:bg-[#D8E8FF] hover:shadow-sm hover:shadow-[#5AA6FF]/10',
    success: 'bg-[#D1FAE5] text-[#059669] border border-[#6EE7B7]/60 hover:border-[#6EE7B7]/80 hover:bg-[#A7F3D0] hover:shadow-sm hover:shadow-[#059669]/10',
    warning: 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]/60 hover:border-[#FCD34D]/80 hover:bg-[#FDE68A] hover:shadow-sm hover:shadow-[#D97706]/10',
    danger: 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]/60 hover:border-[#FCA5A5]/80 hover:bg-[#FECACA] hover:shadow-sm hover:shadow-[#DC2626]/10',
    info: 'bg-[#E0E7FF] text-[#4F46E5] border border-[#A5B4FC]/60 hover:border-[#A5B4FC]/80 hover:bg-[#C7D2FE] hover:shadow-sm hover:shadow-[#4F46E5]/10',
    lob: 'bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] text-[#4338CA] border border-[#A5B4FC]/60 hover:border-[#A5B4FC]/80 hover:shadow-md hover:shadow-[#4338CA]/15',
    peril: 'bg-gradient-to-r from-[#FEE2E2] to-[#FECACA] text-[#991B1B] border border-[#FCA5A5] hover:border-[#FCA5A5]/80 hover:shadow-md hover:shadow-[#DC2626]/20',
    region: 'bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0] text-[#065F46] border border-[#6EE7B7] hover:border-[#6EE7B7]/80 hover:shadow-md hover:shadow-[#059669]/20',
    company: 'bg-gradient-to-r from-[#E0F2FE] to-[#F0F7FF] text-[#0369A1] border border-[#7DD3FC] hover:border-[#7DD3FC]/80 hover:shadow-md hover:shadow-[#0369A1]/20',
    trend: 'bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] text-[#92400E] border border-[#FCD34D] hover:border-[#FCD34D]/80 hover:shadow-md hover:shadow-[#D97706]/20',
    regulation: 'bg-gradient-to-r from-[#F1F5F9] to-[#E2E8F0] text-[#334155] border border-[#CBD5E1] hover:border-[#CBD5E1]/80 hover:bg-[#CBD5E1]/20',
  };

  const sizeClasses = {
    sm: 'px-2.5 py-1 text-xs',
    md: 'px-3.5 py-1.5 text-sm',
  };

  const glowClasses = glow
    ? 'shadow-md shadow-[#5AA6FF]/20 hover:shadow-lg hover:shadow-[#5AA6FF]/40'
    : '';

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:scale-110 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AA6FF]'
    : '';

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (interactive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : 'status'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {children}
    </span>
  );
}

