'use client';

import { useEffect } from 'react';

export type AbPersistProps = {
  variant: 'A' | 'B';
  persist?: boolean;
  cleanUrl?: boolean;
};

export const AbPersist = ({
  variant,
  persist = true,
  cleanUrl = true,
}: AbPersistProps) => {
  useEffect(() => {
    try {
      if (!persist) return;
      // Persist to cookie (30 days)
      document.cookie = `ab_variant=${variant}; path=/; max-age=${60 * 60 * 24 * 30}`;
      // Also persist to localStorage
      try {
        window.localStorage.setItem('ab_variant', variant);
      } catch {}
      // Optionally clean the URL by removing ?ab=*
      if (cleanUrl && typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        if (url.searchParams.has('ab')) {
          url.searchParams.delete('ab');
          window.history.replaceState({}, '', url.toString());
        }
      }
    } catch {}
  }, [variant, persist, cleanUrl]);
  return null;
};
