/**
 * Tooltip Component
 * Accessible tooltip with Apple Liquid Glass design
 * Features: translucency, frosted blur, specular highlights, smooth animations
 * Supports multiple positions and keyboard accessibility
 * WCAG 2.1 compliant with proper ARIA attributes
 */

import { useState, useRef, useId } from 'react';
import type { ReactNode } from 'react';

export interface TooltipProps {
  content: string;
  children: ReactNode;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  variant?: 'light';
  disabled?: boolean;
}

export function Tooltip({
  content,
  children,
  position = 'top',
  delay = 200,
  variant = 'light',
  disabled = false,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout> | null>(null);
  const triggerRef = useRef<HTMLDivElement>(null);
  const tooltipId = useId();

  const handleMouseEnter = () => {
    if (disabled) return;
    const id = setTimeout(() => setIsVisible(true), delay);
    setTimeoutId(id);
  };

  const handleMouseLeave = () => {
    if (timeoutId) clearTimeout(timeoutId);
    setIsVisible(false);
  };

  const handleFocus = () => {
    if (disabled) return;
    setIsVisible(true);
  };

  const handleBlur = () => {
    setIsVisible(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape' && isVisible) {
      setIsVisible(false);
    }
  };

  const positionClasses = {
    top: 'bottom-full mb-2 left-1/2 -translate-x-1/2',
    bottom: 'top-full mt-2 left-1/2 -translate-x-1/2',
    left: 'right-full mr-2 top-1/2 -translate-y-1/2',
    right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  };

  /* Liquid Glass styling with translucency and frosted blur */
  const variantClasses = {
    light: 'bg-gradient-to-br from-[#F9FBFF]/95 to-[#F0F7FF]/90 backdrop-blur-md -webkit-backdrop-filter-blur-md text-[#0F172A] border border-[#C7D2E1]/40 shadow-lg shadow-[#5AA6FF]/15',
  };

  const arrowClasses = {
    light: 'bg-gradient-to-br from-[#F9FBFF]/95 to-[#F0F7FF]/90 border border-[#C7D2E1]/40',
  };

  return (
    <div
      ref={triggerRef}
      className="relative inline-block"
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
    >
      {children}
      {isVisible && !disabled && (
        <div
          id={tooltipId}
          className={`absolute ${positionClasses[position]} px-3 py-2 ${variantClasses[variant]} text-sm rounded-lg whitespace-nowrap z-50 animate-citationTooltipFadeIn pointer-events-none relative overflow-hidden`}
          role="tooltip"
          aria-hidden={!isVisible}
        >
          {/* Specular highlight layer */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none rounded-lg" />

          {content}

          <div
            className={`absolute w-2 h-2 ${arrowClasses[variant]} transform rotate-45 ${
              position === 'top'
                ? 'top-full -mt-1 left-1/2 -translate-x-1/2'
                : position === 'bottom'
                  ? 'bottom-full mt-1 left-1/2 -translate-x-1/2'
                  : position === 'left'
                    ? 'left-full -ml-1 top-1/2 -translate-y-1/2'
                    : 'right-full ml-1 top-1/2 -translate-y-1/2'
            }`}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}

