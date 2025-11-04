'use client';

import { Button } from '@/components/ui/button';
import { Globe } from 'lucide-react';
import dynamic from 'next/dynamic';

const LocaleSwitcher = dynamic(
  () => import('./language-switcher').then((mod) => ({ default: mod.LanguageSwitcher })),
  {
    loading: () => (
      <Button
        variant="ghost"
        size="sm"
        className="flex items-center gap-2"
        disabled
      >
        <Globe className="h-4 w-4" />
        <span className="hidden sm:inline">Loading...</span>
      </Button>
    ),
  }
);

export { LocaleSwitcher as LocaleSwitcherDynamic };
