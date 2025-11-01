/**
 * Accessibility Utilities
 * WCAG 2.1 AA compliance helpers
 */

/**
 * Check color contrast ratio (WCAG 2.1)
 * Returns true if contrast ratio meets AA standard (4.5:1 for normal text, 3:1 for large text)
 */
export function checkContrast(foreground: string, background: string, isLargeText: boolean = false): boolean {
  const fgLum = getRelativeLuminance(foreground);
  const bgLum = getRelativeLuminance(background);

  const lighter = Math.max(fgLum, bgLum);
  const darker = Math.min(fgLum, bgLum);

  const contrastRatio = (lighter + 0.05) / (darker + 0.05);
  const minRatio = isLargeText ? 3 : 4.5;

  return contrastRatio >= minRatio;
}

/**
 * Calculate relative luminance (WCAG 2.1)
 */
function getRelativeLuminance(color: string): number {
  const rgb = hexToRgb(color);
  if (!rgb) return 0;

  const [r, g, b] = rgb.map(val => {
    const v = val / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Convert hex color to RGB
 */
function hexToRgb(hex: string): [number, number, number] | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? [parseInt(result[1], 16), parseInt(result[2], 16), parseInt(result[3], 16)]
    : null;
}

/**
 * Generate accessible focus styles
 */
export const focusStyles = {
  outline: 'outline-2 outline-offset-2 outline-blue-600',
  ring: 'ring-2 ring-offset-2 ring-blue-600',
};

/**
 * Skip to main content link (for keyboard navigation)
 */
export const skipToMainContent = () => {
  const main = document.querySelector('main');
  if (main) {
    main.focus();
    main.scrollIntoView();
  }
};

/**
 * Announce message to screen readers
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite') {
  const announcement = document.createElement('div');
  announcement.setAttribute('role', 'status');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;

  document.body.appendChild(announcement);

  // Remove after announcement
  setTimeout(() => announcement.remove(), 1000);
}

/**
 * Create accessible button with keyboard support
 */
export const createAccessibleButton = (
  element: HTMLElement,
  onClick: () => void,
  label?: string
) => {
  element.setAttribute('role', 'button');
  element.setAttribute('tabindex', '0');
  if (label) {
    element.setAttribute('aria-label', label);
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  element.addEventListener('click', onClick);
  element.addEventListener('keydown', handleKeyDown);

  return () => {
    element.removeEventListener('click', onClick);
    element.removeEventListener('keydown', handleKeyDown);
  };
};

/**
 * Trap focus within modal (for accessibility)
 */
export function trapFocus(element: HTMLElement) {
  const focusableElements = element.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  );

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  element.addEventListener('keydown', handleKeyDown);

  return () => element.removeEventListener('keydown', handleKeyDown);
}

/**
 * Utility classes for screen reader only content
 */
export const srOnly = 'sr-only';

/**
 * Create accessible tooltip
 */
export function createAccessibleTooltip(
  trigger: HTMLElement,
  content: string,
  position: 'top' | 'bottom' | 'left' | 'right' = 'top'
) {
  const id = `tooltip-${Math.random().toString(36).substr(2, 9)}`;

  trigger.setAttribute('aria-describedby', id);
  trigger.setAttribute('role', 'button');

  const tooltip = document.createElement('div');
  tooltip.id = id;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.textContent = content;
  tooltip.className = `absolute bg-gray-900 text-white px-2 py-1 rounded text-sm whitespace-nowrap pointer-events-none`;

  // Position tooltip
  const positionMap = {
    top: 'bottom-full mb-2',
    bottom: 'top-full mt-2',
    left: 'right-full mr-2',
    right: 'left-full ml-2',
  };

  tooltip.className += ` ${positionMap[position]}`;

  trigger.addEventListener('mouseenter', () => {
    trigger.parentElement?.appendChild(tooltip);
  });

  trigger.addEventListener('mouseleave', () => {
    tooltip.remove();
  });

  return () => {
    trigger.removeAttribute('aria-describedby');
    tooltip.remove();
  };
}

