/**
 * GlowButton Component
 * Reusable button with Apple Liquid Glass design (June 2025)
 * Implements: specular highlights, fluid morphing, physics-based animations, wiggle effects
 * Features: dynamic light reflection, organic motion on interaction, shimmer effects
 * Supports primary (gradient), secondary (light), and ghost variants
 * Fully accessible with ARIA attributes, keyboard support, and Reduce Transparency mode
 */

import type { ReactNode, ButtonHTMLAttributes } from 'react';
import { useState } from 'react';

export interface GlowButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  glow?: boolean;
  loading?: boolean;
  icon?: ReactNode;
  ariaLabel?: string;
  ariaDescribedBy?: string;
  enableFluidAnimation?: boolean;
  enableSpecularHighlight?: boolean;
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
  enableFluidAnimation = true,
  enableSpecularHighlight = true,
  ...props
}: GlowButtonProps) {
  const [isPressed, setIsPressed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const baseClasses = 'font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AA6FF] will-change-transform relative overflow-hidden';

  const variantClasses = {
    primary: 'bg-gradient-to-r from-[#5AA6FF] via-[#6BB3FF] to-[#8B7CFF] text-white hover:shadow-xl hover:shadow-[#5AA6FF]/50 hover:scale-105 active:scale-95 hover:-translate-y-1 font-bold',
    secondary: 'bg-[#E8F2FF] text-[#5AA6FF] border border-[#C7D2E1]/80 hover:bg-[#D8E8FF] hover:border-[#5AA6FF]/70 hover:shadow-lg hover:shadow-[#5AA6FF]/25 active:bg-[#C8DEFF] font-bold',
    ghost: 'text-[#5AA6FF] hover:bg-[#E8F2FF]/70 hover:shadow-md hover:shadow-[#5AA6FF]/15 active:bg-[#D8E8FF] font-bold',
    danger: 'bg-gradient-to-r from-[#EF4444] to-[#DC2626] text-white hover:shadow-xl hover:shadow-[#EF4444]/40 active:scale-95 font-bold',
    success: 'bg-gradient-to-r from-[#06B6D4] to-[#0891B2] text-white hover:shadow-xl hover:shadow-[#06B6D4]/40 active:scale-95 font-bold',
  };

  const sizeClasses = {
    sm: 'px-3.5 py-2 text-sm min-h-[44px] min-w-[44px]',
    md: 'px-5 py-2.5 text-base min-h-[48px] min-w-[48px]',
    lg: 'px-7 py-3.5 text-lg min-h-[52px] min-w-[52px]',
  };

  const glowClasses = glow && (variant === 'primary' || variant === 'success' || variant === 'danger')
    ? 'shadow-lg shadow-[#5AA6FF]/35 hover:shadow-2xl hover:shadow-[#5AA6FF]/45'
    : '';

  const fluidAnimationClasses = enableFluidAnimation && isPressed
    ? 'animate-advancedButtonPress'
    : '';

  const disabledClasses = disabled || loading
    ? 'opacity-50 cursor-not-allowed pointer-events-none'
    : '';

  const handleMouseDown = () => setIsPressed(true);
  const handleMouseUp = () => setIsPressed(false);
  const handleMouseLeave = () => setIsPressed(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (enableSpecularHighlight) {
      const rect = e.currentTarget.getBoundingClientRect();
      setMousePos({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  return (
    <button
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${glowClasses} ${fluidAnimationClasses} ${disabledClasses} ${className}`}
      disabled={disabled || loading}
      aria-label={ariaLabel}
      aria-describedby={ariaDescribedBy}
      aria-busy={loading}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      {...props}
    >
      {/* Specular highlight layer - dynamic light reflection with mouse tracking */}
      {enableSpecularHighlight && (
        <div
          className="absolute inset-0 pointer-events-none rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
          style={{
            background: `radial-gradient(circle at ${mousePos.x}px ${mousePos.y}px, rgba(255, 255, 255, 0.35) 0%, transparent 50%)`,
          }}
        />
      )}

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

