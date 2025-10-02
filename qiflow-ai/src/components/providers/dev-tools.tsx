'use client';

import { useEffect } from 'react';

// Known extension-related error patterns to filter
const EXTENSION_ERROR_PATTERNS = [
  'Minified React error #321',
  'chrome-extension:',
  'moz-extension:',
  'Content Security Policy',
  'AI Assistant Pro',
  'extension',
  'grammarly',
  'lastpass'
] as const;

const EXTENSION_WARNING_PATTERNS = [
  'extension',
  'chrome-extension:',
  'moz-extension:',
  'grammarly',
  'lastpass'
] as const;

function shouldFilterMessage(message: string, patterns: readonly string[]): boolean {
  return patterns.some(pattern => message.toLowerCase().includes(pattern.toLowerCase()));
}

export function DevTools() {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'development') return;

    // Store original console methods
    const originalError = console.error;
    const originalWarn = console.warn;

    // Enhanced error filtering with better pattern matching
    console.error = (...args: unknown[]) => {
      try {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : String(arg)
        ).join(' ');
        
        if (shouldFilterMessage(message, EXTENSION_ERROR_PATTERNS)) {
          return; // Filter out extension-related errors
        }
        
        originalError.apply(console, args);
      } catch (error) {
        // Fallback to original error if filtering fails
        originalError.apply(console, args);
      }
    };

    console.warn = (...args: unknown[]) => {
      try {
        const message = args.map(arg => 
          typeof arg === 'string' ? arg : String(arg)
        ).join(' ');
        
        if (shouldFilterMessage(message, EXTENSION_WARNING_PATTERNS)) {
          return; // Filter out extension-related warnings
        }
        
        originalWarn.apply(console, args);
      } catch (error) {
        // Fallback to original warn if filtering fails
        originalWarn.apply(console, args);
      }
    };

    // Cleanup function
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  return null;
}