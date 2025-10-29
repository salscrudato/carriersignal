/**
 * Badge Component
 * Reusable badge for tags, labels, and status indicators
 */

import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
  size?: 'sm' | 'md';
  className?: string;
}

export function Badge({
  children,
  variant = 'default',
  size = 'sm',
  className = '',
}: BadgeProps) {
  const baseClasses = 'inline-flex items-center font-medium rounded-full';

  const variantClasses = {
    default: 'bg-[#E8F2FF] text-[#5AA6FF]',
    success: 'bg-[#D1FAE5] text-[#059669]',
    warning: 'bg-[#FEF3C7] text-[#D97706]',
    danger: 'bg-[#FEE2E2] text-[#DC2626]',
    info: 'bg-[#E0E7FF] text-[#4F46E5]',
  };

  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
  };

  return (
    <span
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </span>
  );
}

