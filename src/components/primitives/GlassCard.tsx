/**
 * GlassCard Component
 * Reusable liquid glass card primitive with consistent styling
 */

import type { ReactNode } from 'react';

interface GlassCardProps {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'ultra';
  interactive?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  onClick,
}: GlassCardProps) {
  const baseClasses = 'liquid-glass rounded-xl p-4 transition-all duration-300';
  
  const variantClasses = {
    default: 'liquid-glass',
    premium: 'liquid-glass-premium',
    ultra: 'liquid-glass-ultra',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:shadow-lg hover:scale-[1.02]'
    : '';

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${className}`}
      onClick={onClick}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
    >
      {children}
    </div>
  );
}

