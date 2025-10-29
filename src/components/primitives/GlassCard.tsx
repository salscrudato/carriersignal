/**
 * GlassCard Component
 * Reusable liquid glass card primitive with consistent styling
 * Supports three glass effect intensities: default, premium, ultra
 * Fully accessible with keyboard navigation and ARIA support
 */

import type { ReactNode, HTMLAttributes, KeyboardEvent } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'ultra';
  interactive?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
}

export function GlassCard({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  ...props
}: GlassCardProps) {
  const baseClasses = 'rounded-xl p-4 transition-all duration-250 will-change-transform';

  const variantClasses = {
    default: 'liquid-glass',
    premium: 'liquid-glass-premium',
    ultra: 'liquid-glass-ultra',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:shadow-md hover:scale-[1.01] active:scale-[0.99] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AA6FF]'
    : '';

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (interactive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {children}
    </div>
  );
}

