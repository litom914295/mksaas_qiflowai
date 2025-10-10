'use client';

/**
 * 主题提供者
 * 任务11: 深色模式支持
 */

import { ThemeProvider as NextThemesProvider } from 'next-themes';
import type * as React from 'react';

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}

/**
 * 主题切换Hook
 */
export { useTheme } from 'next-themes';
