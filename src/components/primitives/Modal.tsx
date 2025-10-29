/**
 * Modal Component
 * Accessible modal dialog with liquid glass styling
 */

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  closeButton?: boolean;
}

export function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  closeButton = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="presentation"
    >
      <div
        className={`w-full ${sizeClasses[size]} liquid-glass-ultra rounded-2xl shadow-2xl border border-[#C7D2E1]/30 animate-scaleIn max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || closeButton) && (
          <div className="flex items-center justify-between p-6 border-b border-[#C7D2E1]/20">
            {title && <h2 className="text-xl font-semibold text-[#0F172A]">{title}</h2>}
            {closeButton && (
              <button
                onClick={onClose}
                className="ml-auto p-1 hover:bg-[#E8F2FF] rounded-lg transition-colors"
                aria-label="Close modal"
              >
                <X size={20} className="text-[#64748B]" />
              </button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

