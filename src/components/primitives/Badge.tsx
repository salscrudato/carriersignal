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
  const baseClasses = 'inline-flex items-center font-medium rounded-full transition-all duration-200 will-change-transform';

  const variantClasses = {
    default: 'bg-[#E8F2FF] text-[#5AA6FF] border border-[#C7D2E1]',
    success: 'bg-[#D1FAE5] text-[#059669] border border-[#6EE7B7]',
    warning: 'bg-[#FEF3C7] text-[#D97706] border border-[#FCD34D]',
    danger: 'bg-[#FEE2E2] text-[#DC2626] border border-[#FCA5A5]',
    info: 'bg-[#E0E7FF] text-[#4F46E5] border border-[#A5B4FC]',
    lob: 'bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] text-[#4338CA] border border-[#A5B4FC]',
    peril: 'bg-gradient-to-r from-[#FEE2E2] to-[#FECACA] text-[#991B1B] border border-[#FCA5A5]',
    region: 'bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0] text-[#065F46] border border-[#6EE7B7]',
    company: 'bg-gradient-to-r from-[#E0F2FE] to-[#F0F7FF] text-[#0369A1] border border-[#7DD3FC]',
    trend: 'bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] text-[#92400E] border border-[#FCD34D]',
    regulation: 'bg-gradient-to-r from-[#F1F5F9] to-[#E2E8F0] text-[#334155] border border-[#CBD5E1]',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  const glowClasses = glow
    ? 'shadow-md shadow-[#5AA6FF]/20 hover:shadow-lg hover:shadow-[#5AA6FF]/30'
    : '';

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:scale-105 active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AA6FF]'
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

