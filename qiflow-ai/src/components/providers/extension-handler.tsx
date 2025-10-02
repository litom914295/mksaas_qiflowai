'use client';

import { useEffect } from 'react';

// Known extension attributes and classes to clean up
const EXTENSION_ATTRIBUTES = [
  'data-cjcrx',
  'data-new-gr-c-s-check-loaded',
  'data-extension-installed',
  'cz-shortcut-listen',
  'data-grammarly-shadow-root',
  'data-lastpass-icon-root'
] as const;

const EXTENSION_CLASSES = [
  'extension-installed',
  'grammarly-desktop-integration',
  'cjcrx-extension',
  'lastpass-icon-root'
] as const;

export function ExtensionHandler() {
  useEffect(() => {
    const handleExtensionInterference = () => {
      try {
        const body = document.body;
        if (!body) return;

        // Batch DOM operations for better performance
        const attributesToRemove: string[] = [];
        const classesToRemove: string[] = [];

        // Check which attributes need to be removed
        EXTENSION_ATTRIBUTES.forEach(attr => {
          if (body.hasAttribute(attr)) {
            attributesToRemove.push(attr);
          }
        });

        // Check which classes need to be removed
        EXTENSION_CLASSES.forEach(className => {
          if (body.classList.contains(className)) {
            classesToRemove.push(className);
          }
        });

        // Batch remove attributes
        attributesToRemove.forEach(attr => {
          body.removeAttribute(attr);
        });

        // Batch remove classes
        if (classesToRemove.length > 0) {
          body.classList.remove(...classesToRemove);
        }

      } catch (error) {
        // Silent error handling to avoid affecting main application
        if (process.env.NODE_ENV === 'development') {
          console.debug('Extension handler error:', error);
        }
      }
    };

    // Initial cleanup
    handleExtensionInterference();

    // Throttled mutation observer for better performance
    let timeoutId: NodeJS.Timeout;
    const observer = new MutationObserver((mutations) => {
      let shouldClean = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'attributes' && 
            mutation.target === document.body &&
            mutation.attributeName?.startsWith('data-')) {
          shouldClean = true;
          break;
        }
      }

      if (shouldClean) {
        // Throttle cleanup calls
        clearTimeout(timeoutId);
        timeoutId = setTimeout(handleExtensionInterference, 100);
      }
    });

    // Start observing with optimized configuration
    observer.observe(document.body, {
      attributes: true,
      attributeFilter: [...EXTENSION_ATTRIBUTES, 'class'],
      subtree: false // Only observe body element
    });

    // Cleanup function
    return () => {
      clearTimeout(timeoutId);
      observer.disconnect();
    };
  }, []);

  return null;
}