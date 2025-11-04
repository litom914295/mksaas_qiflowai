/**
 * 字体优化配置
 * 使用 Next.js font optimization 自动优化字体加载
 */

import { Inter, Noto_Sans_SC, Noto_Serif_SC } from 'next/font/google';
import localFont from 'next/font/local';

// 英文字体 - Inter
export const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

// 中文字体 - 思源黑体 (Noto Sans SC)
export const notoSansSC = Noto_Sans_SC({
  weight: ['300', '400', '500', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-sans-sc',
  preload: true,
  fallback: ['Microsoft YaHei', '微软雅黑', 'SimSun', '宋体'],
  adjustFontFallback: true,
});

// 中文衬线字体 - 思源宋体 (Noto Serif SC)
export const notoSerifSC = Noto_Serif_SC({
  weight: ['400', '700'],
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-noto-serif-sc',
  preload: false, // 非关键字体延迟加载
  fallback: ['SimSun', '宋体', 'serif'],
});

// 本地字体示例 (如果需要自定义字体)
export const customFont = localFont({
  src: [
    {
      path: '../fonts/custom-regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../fonts/custom-bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-custom',
  display: 'swap',
  fallback: ['system-ui'],
  preload: false,
});

/**
 * 组合字体类名
 * 用于应用于 <html> 或 <body> 元素
 */
export const fontVariables = `${inter.variable} ${notoSansSC.variable} ${notoSerifSC.variable}`;

/**
 * 默认字体类名
 */
export const defaultFontClass = inter.className;
