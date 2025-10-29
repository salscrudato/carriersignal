/**
 * Spinner Component
 * Loading indicator with Aurora gradient animation
 * Supports multiple sizes and variants
 * Respects prefers-reduced-motion for accessibility
 */

import type { CSSProperties } from 'react';

export interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'gradient' | 'pulse' | 'dots';
  className?: string;
  label?: string;
}

export function Spinner({
  size = 'md',
  variant = 'gradient',
  className = '',
  label,
}: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const gradientStyle: CSSProperties = {
    background: 'conic-gradient(from 0deg, #5AA6FF, #8B7CFF, #B08CFF, #5AA6FF)',
    WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
    maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
    animation: 'spin 1s linear infinite',
  };

  const pulseStyle: CSSProperties = {
    background: 'linear-gradient(135deg, #5AA6FF 0%, #8B7CFF 50%, #B08CFF 100%)',
    animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
  };

  if (variant === 'dots') {
    return (
      <div
        className={`flex items-center gap-1 ${className}`}
        role="status"
        aria-label={label || 'Loading'}
        aria-live="polite"
      >
        <div
          className={`${sizeClasses[size]} rounded-full bg-[#5AA6FF] animate-bounce`}
          style={{ animationDelay: '0s' }}
          aria-hidden="true"
        />
        <div
          className={`${sizeClasses[size]} rounded-full bg-[#8B7CFF] animate-bounce`}
          style={{ animationDelay: '0.2s' }}
          aria-hidden="true"
        />
        <div
          className={`${sizeClasses[size]} rounded-full bg-[#B08CFF] animate-bounce`}
          style={{ animationDelay: '0.4s' }}
          aria-hidden="true"
        />
      </div>
    );
  }

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${className}`}
      style={variant === 'gradient' ? gradientStyle : pulseStyle}
      role="status"
      aria-label={label || 'Loading'}
      aria-live="polite"
    />
  );
}

