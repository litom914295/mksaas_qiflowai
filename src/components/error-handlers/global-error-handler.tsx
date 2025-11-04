'use client';

import { useEffect } from 'react';

/**
 * Global error handler component to catch unhandled promise rejections
 * and other uncaught errors that escape component error boundaries
 */
export function GlobalErrorHandler() {
  useEffect(() => {
    // Handle unhandled promise rejections
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      console.error('未处理的 Promise 拒绝:', event.reason);
      
      // Prevent the default browser behavior (which logs to console)
      event.preventDefault();
      
      // You can add additional error reporting here (e.g., to Sentry)
      // For now, we just log it
    };

    // Handle uncaught errors
    const handleError = (event: ErrorEvent) => {
      console.error('未捕获的错误:', event.error);
      
      // Prevent the default browser behavior
      event.preventDefault();
    };

    // Add event listeners
    window.addEventListener('unhandledrejection', handleUnhandledRejection);
    window.addEventListener('error', handleError);

    // Cleanup on unmount
    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
      window.removeEventListener('error', handleError);
    };
  }, []);

  // This component doesn't render anything
  return null;
}
