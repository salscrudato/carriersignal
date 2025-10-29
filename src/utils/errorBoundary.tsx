/**
 * Error Boundary Component
 * Catches React errors and displays fallback UI with recovery options
 * Implements error logging, recovery strategies, and user-friendly messaging
 */

import React from 'react';
import type { ReactNode, ReactElement } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { logger } from './logger';

interface Props {
  children: ReactNode;
  fallback?: ReactElement;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorCount: number;
  showDetails: boolean;
}

export class ErrorBoundary extends React.Component<Props, State> {
  private resetTimeout: ReturnType<typeof setTimeout> | null = null;

  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null, errorCount: 0, showDetails: false };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const errorCount = this.state.errorCount + 1;
    this.setState({ errorCount });

    // Log error with context
    logger.error('ErrorBoundary', 'React component error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorCount,
      timestamp: new Date().toISOString(),
    });

    // Call custom error handler if provided
    this.props.onError?.(error, errorInfo);

    // Auto-reset after 30 seconds if error count is low
    if (errorCount < 3) {
      this.resetTimeout = setTimeout(() => {
        this.resetError();
      }, 30000);
    }
  }

  componentWillUnmount() {
    if (this.resetTimeout) {
      clearTimeout(this.resetTimeout);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, showDetails: false });
  };

  goHome = () => {
    window.location.href = '/';
  };

  toggleDetails = () => {
    this.setState(prev => ({ showDetails: !prev.showDetails }));
  };

  render() {
    if (this.state.hasError) {
      return (
        this.props.fallback || (
          <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-white via-[#F9FBFF]/30 to-[#E8F2FF]/20 p-4">
            <div className="max-w-md w-full">
              {/* Error Icon */}
              <div className="flex justify-center mb-6">
                <div className="p-4 rounded-full bg-[#FEE2E2] border border-[#EF4444]/30">
                  <AlertTriangle size={32} className="text-[#EF4444]" />
                </div>
              </div>

              {/* Error Message */}
              <h1 className="text-2xl font-bold text-[#0F172A] mb-2 text-center">
                Something went wrong
              </h1>
              <p className="text-[#64748B] mb-6 text-center text-sm">
                {this.state.error?.message || 'An unexpected error occurred'}
              </p>

              {/* Error Details (if enabled) */}
              {this.state.showDetails && this.state.error && (
                <div className="mb-6 p-4 bg-[#F9FBFF] rounded-lg border border-[#C7D2E1]/30 max-h-40 overflow-y-auto">
                  <p className="text-xs font-mono text-[#64748B] whitespace-pre-wrap break-words">
                    {this.state.error.stack}
                  </p>
                </div>
              )}

              {/* Error Count Warning */}
              {this.state.errorCount >= 3 && (
                <div className="mb-6 p-3 bg-[#FEF3C7] rounded-lg border border-[#F59E0B]/30">
                  <p className="text-xs text-[#92400E]">
                    Multiple errors detected. Please clear your browser cache or try a different browser.
                  </p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={this.resetError}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#5AA6FF] text-white rounded-lg hover:bg-[#4A96EF] transition-colors font-medium"
                  aria-label="Try again"
                >
                  <RefreshCw size={18} />
                  Try Again
                </button>
                <button
                  onClick={this.goHome}
                  className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#E8F2FF] text-[#5AA6FF] rounded-lg hover:bg-[#D4E5FF] transition-colors font-medium"
                  aria-label="Go to home page"
                >
                  <Home size={18} />
                  Go Home
                </button>
                <button
                  onClick={this.toggleDetails}
                  className="w-full text-xs text-[#64748B] hover:text-[#5AA6FF] transition-colors py-2"
                  aria-label={this.state.showDetails ? 'Hide error details' : 'Show error details'}
                >
                  {this.state.showDetails ? 'Hide' : 'Show'} Error Details
                </button>
              </div>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}

