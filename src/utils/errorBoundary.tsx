/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI
 */

import React from 'react';
import type { ReactNode, ReactElement } from 'react';
import { logger } from './logger';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    logger.error('ErrorBoundary', 'React component error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-[#0F172A] mb-2">
                Something went wrong
              </h1>
              <p className="text-[#64748B] mb-4">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-[#5AA6FF] text-white rounded-lg hover:bg-[#4A96EF] transition-colors"
              >
                Reload Page
              </button>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

