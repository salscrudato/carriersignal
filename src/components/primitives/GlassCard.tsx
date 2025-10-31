/**
 * GlassCard Component
 * Reusable liquid glass card primitive with Apple Liquid Glass design (June 2025)
 * Implements: translucency (40-70% opacity), refraction, light scattering, specular highlights, fluid morphing
 * Supports three glass effect intensities: default, premium, ultra
 * Features: physics-based animations, dynamic light responses, organic motion
 * Fully accessible with keyboard navigation, ARIA support, and Reduce Transparency mode
 */

import type { ReactNode, HTMLAttributes, KeyboardEvent } from 'react';
import { useState } from 'react';

export interface GlassCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  className?: string;
  variant?: 'default' | 'premium' | 'ultra';
  interactive?: boolean;
  onClick?: () => void;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  enableFluidAnimation?: boolean;
  enableSpecularHighlight?: boolean;
}

export function GlassCard({
  children,
  className = '',
  variant = 'default',
  interactive = false,
  onClick,
  ariaLabel,
  ariaDescribedBy,
  enableFluidAnimation = false,
  enableSpecularHighlight = true,
  ...props
}: GlassCardProps) {
  const [isHovering, setIsHovering] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const baseClasses = 'rounded-xl p-4 transition-all duration-300 will-change-transform relative overflow-hidden';

  const variantClasses = {
    default: 'liquid-glass',
    premium: 'liquid-glass-premium',
    ultra: 'liquid-glass-ultra',
  };

  const interactiveClasses = interactive
    ? 'cursor-pointer hover:shadow-lg hover:shadow-[#5AA6FF]/20 hover:scale-[1.02] active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AA6FF] transition-all duration-300'
    : '';

  const fluidAnimationClasses = enableFluidAnimation && isHovering
    ? 'animate-fluidMorph'
    : '';

  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (interactive && (e.key === 'Enter' || e.key === ' ')) {
      e.preventDefault();
      onClick?.();
    }
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (enableSpecularHighlight) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${interactiveClasses} ${fluidAnimationClasses} ${className}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      onMouseMove={handleMouseMove}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      {...props}
    >
      {/* Specular highlight layer - dynamic light reflection */}
      {enableSpecularHighlight && isHovering && (
        <div
          className="absolute inset-0 pointer-events-none rounded-xl opacity-60 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.4) 0%, transparent 50%)`,
          }}
        />
      )}
      {children}
    </div>
  );
}

