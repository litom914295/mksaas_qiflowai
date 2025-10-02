'use client';

import React from 'react';

interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorId?: string;
  retryCount: number;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>;
  maxRetries?: number;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

// Known recoverable error patterns
const RECOVERABLE_ERROR_PATTERNS = [
  'Hydration',
  'hydration',
  'Minified React error #321',
  'extension'
] as const;

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeoutId?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { 
      hasError: false, 
      retryCount: 0 
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { 
      hasError: true, 
      error,
      errorId: `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
  }

  private isRecoverableError(error: Error): boolean {
    return RECOVERABLE_ERROR_PATTERNS.some(pattern => 
      error.message.includes(pattern)
    );
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    const { maxRetries = 3, onError } = this.props;
    const { retryCount } = this.state;

    // Call custom error handler if provided
    onError?.(error, errorInfo);

    // Handle recoverable errors (hydration, extensions)
    if (this.isRecoverableError(error) && retryCount < maxRetries) {
      console.warn(`Recoverable error caught (attempt ${retryCount + 1}/${maxRetries}):`, error.message);
      
      // Auto-retry with exponential backoff
      this.retryTimeoutId = setTimeout(() => {
        this.setState(prevState => ({ 
          hasError: false, 
          error: undefined,
          errorId: undefined,
          retryCount: prevState.retryCount + 1
        }));
      }, Math.pow(2, retryCount) * 1000);
      
      return;
    }
    
    // Log non-recoverable errors
    console.error('Error caught by boundary:', error, errorInfo);
    
    // Report to error tracking service in production
    if (process.env.NODE_ENV === 'production') {
      // TODO: Integrate with error tracking service (Sentry, etc.)
      // reportError(error, errorInfo);
    }
  }

  componentWillUnmount() {
    if (this.retryTimeoutId) {
      clearTimeout(this.retryTimeoutId);
    }
  }

  private handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: undefined, 
      errorId: undefined,
      retryCount: 0 
    });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback;
      
      if (FallbackComponent) {
        return (
          <FallbackComponent
            error={this.state.error}
            reset={this.handleReset}
          />
        );
      }

      return (
        <div className="flex flex-col items-center justify-center min-h-[200px] p-4">
          <h2 className="text-lg font-semibold mb-2">Something went wrong</h2>
          <p className="text-gray-600 mb-4">An error occurred while loading this component.</p>
          {process.env.NODE_ENV === 'development' && (
            <details className="mb-4 p-2 bg-gray-100 rounded text-sm max-w-md">
              <summary className="cursor-pointer font-medium">Error Details</summary>
              <pre className="mt-2 whitespace-pre-wrap text-xs">
                {this.state.error.message}
                {'\n'}
                {this.state.error.stack}
              </pre>
            </details>
          )}
          <button
            onClick={this.handleReset}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; reset: () => void }>
) {
  return function WrappedComponent(props: P) {
    return (
      <ErrorBoundary fallback={fallback}>
        <Component {...props} />
      </ErrorBoundary>
    );
  };
}