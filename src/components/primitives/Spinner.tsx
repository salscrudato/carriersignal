/**
 * Spinner Component
 * Loading indicator with Aurora gradient animation
 */

import type { CSSProperties } from 'react';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  const style: CSSProperties = {
    background: 'conic-gradient(from 0deg, #5AA6FF, #8B7CFF, #B08CFF, #5AA6FF)',
    WebkitMaskImage: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
    maskImage: 'radial-gradient(farthest-side, transparent calc(100% - 2px), #000 calc(100% - 1px))',
    animation: 'spin 1s linear infinite',
  };

  return (
    <div
      className={`${sizeClasses[size]} rounded-full ${className}`}
      style={style}
    />
  );
}

