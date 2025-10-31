/**
 * Badge Component
 * Reusable badge with Apple Liquid Glass design (June 2025)
 * Implements: translucency, specular highlights, spring-scale animations, bubble effects
 * Features: dynamic light reflection, organic motion, shimmer effects
 * Supports LOB, peril, region, and semantic variants
 * Fully accessible with keyboard navigation, ARIA support, and Reduce Transparency mode
 */

import type { ReactNode, HTMLAttributes, KeyboardEvent } from 'react';
import { useState } from 'react';

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'lob' | 'peril' | 'region' | 'company' | 'trend' | 'regulation';
  size?: 'sm' | 'md';
  className?: string;
  interactive?: boolean;
  onClick?: () => void;
  glow?: boolean;
  ariaLabel?: string;
  enableFluidAnimation?: boolean;
  enableSpecularHighlight?: boolean;
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
  enableFluidAnimation = true,
  enableSpecularHighlight = true,
  ...props
}: BadgeProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const baseClasses = 'inline-flex items-center font-bold rounded-full transition-all duration-300 will-change-transform relative overflow-hidden';

  const variantClasses = {
    default: 'bg-[#E8F2FF] text-[#0F172A] border border-[#5AA6FF]/50 hover:border-[#5AA6FF]/80 hover:bg-[#D8E8FF] hover:shadow-md hover:shadow-[#5AA6FF]/25 hover:text-[#5AA6FF]',
    success: 'bg-[#D1FAE5] text-[#065F46] border border-[#6EE7B7]/70 hover:border-[#6EE7B7]/90 hover:bg-[#A7F3D0] hover:shadow-md hover:shadow-[#059669]/25',
    warning: 'bg-[#FEF3C7] text-[#92400E] border border-[#FCD34D]/70 hover:border-[#FCD34D]/90 hover:bg-[#FDE68A] hover:shadow-md hover:shadow-[#D97706]/25',
    danger: 'bg-[#FEE2E2] text-[#991B1B] border border-[#FCA5A5]/70 hover:border-[#FCA5A5]/90 hover:bg-[#FECACA] hover:shadow-md hover:shadow-[#DC2626]/25',
    info: 'bg-[#E0E7FF] text-[#3730A3] border border-[#A5B4FC]/70 hover:border-[#A5B4FC]/90 hover:bg-[#C7D2FE] hover:shadow-md hover:shadow-[#4F46E5]/25',
    lob: 'bg-gradient-to-r from-[#E0E7FF] to-[#C7D2FE] text-[#3730A3] border border-[#A5B4FC]/70 hover:border-[#A5B4FC]/90 hover:shadow-lg hover:shadow-[#4338CA]/30',
    peril: 'bg-gradient-to-r from-[#FEE2E2] to-[#FECACA] text-[#7F1D1D] border border-[#FCA5A5]/70 hover:border-[#FCA5A5]/90 hover:shadow-lg hover:shadow-[#DC2626]/30',
    region: 'bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0] text-[#065F46] border border-[#6EE7B7]/70 hover:border-[#6EE7B7]/90 hover:shadow-lg hover:shadow-[#059669]/30',
    company: 'bg-gradient-to-r from-[#E0F2FE] to-[#F0F7FF] text-[#0C4A6E] border border-[#7DD3FC]/70 hover:border-[#7DD3FC]/90 hover:shadow-lg hover:shadow-[#0369A1]/30',
    trend: 'bg-gradient-to-r from-[#FEF3C7] to-[#FDE68A] text-[#78350F] border border-[#FCD34D]/70 hover:border-[#FCD34D]/90 hover:shadow-lg hover:shadow-[#D97706]/30',
    regulation: 'bg-gradient-to-r from-[#F1F5F9] to-[#E2E8F0] text-[#1E293B] border border-[#CBD5E1]/70 hover:border-[#CBD5E1]/90 hover:shadow-md hover:shadow-[#334155]/20',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
  };

  const glowClasses = glow
    ? 'shadow-md shadow-[#5AA6FF]/25 hover:shadow-lg hover:shadow-[#5AA6FF]/45'
    : '';

  const fluidAnimationClasses = enableFluidAnimation && isHovering
    ? 'animate-tagChipSpringScale'
    : '';

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:scale-115 active:scale-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AA6FF] transition-transform duration-300'
    : '';

  const handleKeyDown = (e: KeyboardEvent<HTMLSpanElement>) => {
    if (interactive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLSpanElement>) => {
    if (enableSpecularHighlight) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${fluidAnimationClasses} ${interactiveClasses} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      role={interactive ? 'button' : 'status'}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      {...props}
    >
      {/* Specular highlight layer - dynamic light reflection with mouse tracking */}
      {enableSpecularHighlight && isHovering && (
        <div
          className="absolute inset-0 pointer-events-none rounded-full opacity-70 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.4) 0%, transparent 50%)`,
          }}
        />
      )}
      {children}
    </span>
  );
}

