'use client';

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import { useEffect, useState } from 'react';

export function MkSaaSLogo({ className }: { className?: string }) {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const logo = mounted && theme === 'dark' ? '/logo-dark.png' : '/logo.png';

  return (
    <Image
      src={logo}
      alt="Logo of QiFlow AI"
      title="Logo of QiFlow AI"
      width={96}
      height={96}
      className={cn('size-8 rounded-md', className)}
    />
  );
}
