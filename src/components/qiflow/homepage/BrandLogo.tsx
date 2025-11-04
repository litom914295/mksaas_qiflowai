'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export type BrandLogoProps = {
  href?: string;
  className?: string;
  size?: number;
  asLink?: boolean;
};

export const BrandLogo = ({
  href = '/',
  className = '',
  size = 160,
  asLink = true,
}: BrandLogoProps) => {
  const { theme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // 确定当前主题
  const currentTheme = mounted
    ? theme === 'system'
      ? systemTheme
      : theme
    : 'light';
  const isDark = currentTheme === 'dark';

  const logoSrc = isDark
    ? '/brand/logo-qiflow-dark.png'
    : '/brand/logo-qiflow.png';

  const img = (
    <Image
      src={logoSrc}
      alt="QiFlow AI Logo"
      width={size}
      height={Math.round(size / 4)}
      priority
      className="transition-opacity duration-300"
    />
  );

  return asLink && href && href !== '' ? (
    <Link href={href} aria-label="返回首页" className={className}>
      {img}
    </Link>
  ) : (
    <div className={className}>{img}</div>
  );
};
