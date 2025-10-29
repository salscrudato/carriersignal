/**
 * Modal Component
 * Accessible modal dialog with liquid glass styling
 * Supports multiple sizes and keyboard navigation (Escape to close)
 * WCAG 2.1 Level AA compliant with focus management
 */

import { useEffect, useRef, useId } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
  closeOnEscape?: boolean;
  closeOnBackdropClick?: boolean;
  description?: string;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeButton = true,
  closeOnEscape = true,
  closeOnBackdropClick = true,
  description,
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);
  const descriptionId = useId();

  useEffect(() => {
    if (isOpen) {
      // Store the previously focused element
      previousActiveElement.current = document.activeElement as HTMLElement;

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Focus the modal or close button
      setTimeout(() => {
        if (closeButton && modalRef.current) {
          const closeBtn = modalRef.current.querySelector('button[aria-label="Close modal"]') as HTMLButtonElement;
          closeBtn?.focus();
        } else if (modalRef.current) {
          modalRef.current.focus();
        }
      }, 0);

      const handleEscape = (e: KeyboardEvent) => {
        if (closeOnEscape && e.key === 'Escape') {
          e.preventDefault();
          onClose();
        }
      };

      document.addEventListener('keydown', handleEscape);
      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = 'unset';

        // Restore focus to the previously focused element
        if (previousActiveElement.current) {
          previousActiveElement.current.focus();
        }
      };
    }
  }, [isOpen, closeOnEscape, onClose, closeButton]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn overflow-hidden"
      onClick={closeOnBackdropClick ? onClose : undefined}
      role="presentation"
      aria-hidden={!isOpen}
    >
      <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size]} liquid-glass-ultra rounded-2xl shadow-2xl border border-[#C7D2E1]/30 animate-scaleIn max-h-[90vh] flex flex-col focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AA6FF] relative`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? 'modal-title' : undefined}
        aria-describedby={description ? descriptionId : undefined}
        tabIndex={-1}
      >
        {/* Close Button - Top Right Corner */}
        {closeButton && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-[#E8F2FF] rounded-lg transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#5AA6FF] min-h-[44px] min-w-[44px] flex items-center justify-center z-10"
            aria-label="Close modal"
          >
            <X size={20} className="text-[#64748B] hover:text-[#0F172A]" />
          </button>
        )}

        {title && (
          <div className="flex items-center justify-between p-6 border-b border-[#C7D2E1]/20 flex-shrink-0 pr-16">
            <h2 id="modal-title" className="text-xl font-semibold text-[#0F172A]">
              {title}
            </h2>
          </div>
        )}
        {description && (
          <div id={descriptionId} className="sr-only">
            {description}
          </div>
        )}
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

