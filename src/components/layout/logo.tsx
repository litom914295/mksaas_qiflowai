'use client';

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function Logo({ className }: { className?: string }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Use full logo with text
  const logo = mounted && theme === 'dark' ? '/logo-full-dark.png' : '/logo-full.png';

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <Image
      src={logo}
      alt="QiFlow AI"
      title="QiFlow AI"
      width={800}
      height={267}
      className={cn('h-12 w-auto', className)}
      priority
    />
  );
}
