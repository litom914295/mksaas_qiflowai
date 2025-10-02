'use client';

import { type Locale } from '@/lib/i18n/config';
import { useLocale } from 'next-intl';
import { useEffect, useState } from 'react';

export function FontProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as Locale;
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    
    // Apply font class to html element after hydration
    const html = document.documentElement;
    if (html) {
      const currentFontClass = Array.from(html.classList).find(cls => cls.startsWith('font-'));
      const expectedFontClass = `font-${locale}`;
      
      // Only update if different to avoid unnecessary DOM changes
      if (currentFontClass !== expectedFontClass) {
        if (currentFontClass) {
          html.classList.remove(currentFontClass);
        }
        html.classList.add(expectedFontClass);
      }
    }
  }, [locale, isHydrated]);

  return <>{children}</>;
}
