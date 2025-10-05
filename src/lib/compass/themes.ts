/**
 * 罗盘主题配置
 */

export interface CompassTheme {
  id: string;
  name: string;
  description?: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    foreground: string;
    accent: string;
    ring: string;
    needle: string;
    text: string;
    grid: string;
    marker: string;
  };
  fonts?: {
    primary?: string;
    secondary?: string;
  };
}

/**
 * 传统风格主题
 */
export const traditionalTheme: CompassTheme = {
  id: 'traditional',
  name: '传统经典',
  description: '传统风水罗盘配色，庄重典雅',
  colors: {
    primary: '#8B4513', // 棕色
    secondary: '#FFD700', // 金色
    background: '#F5DEB3', // 麦色
    foreground: '#000000', // 黑色
    accent: '#DC143C', // 深红色
    ring: '#8B4513', // 棕色
    needle: '#DC143C', // 深红色
    text: '#000000', // 黑色
    grid: '#DEB887', // 浅棕色
    marker: '#FFD700', // 金色
  },
  fonts: {
    primary: 'serif',
    secondary: 'serif',
  },
};

/**
 * 现代风格主题
 */
export const modernTheme: CompassTheme = {
  id: 'modern',
  name: '现代简约',
  description: '现代简洁设计，清晰易读',
  colors: {
    primary: '#3B82F6', // 蓝色
    secondary: '#10B981', // 绿色
    background: '#FFFFFF', // 白色
    foreground: '#1F2937', // 深灰色
    accent: '#EF4444', // 红色
    ring: '#E5E7EB', // 浅灰色
    needle: '#EF4444', // 红色
    text: '#1F2937', // 深灰色
    grid: '#F3F4F6', // 极浅灰色
    marker: '#3B82F6', // 蓝色
  },
  fonts: {
    primary: 'system-ui',
    secondary: 'sans-serif',
  },
};

/**
 * 暗黑风格主题
 */
export const darkTheme: CompassTheme = {
  id: 'dark',
  name: '暗夜模式',
  description: '深色背景，护眼设计',
  colors: {
    primary: '#818CF8', // 紫色
    secondary: '#34D399', // 青绿色
    background: '#0F172A', // 深蓝黑色
    foreground: '#F8FAFC', // 浅白色
    accent: '#F59E0B', // 橙色
    ring: '#334155', // 深灰色
    needle: '#EF4444', // 红色
    text: '#E2E8F0', // 浅灰色
    grid: '#1E293B', // 深灰色
    marker: '#818CF8', // 紫色
  },
  fonts: {
    primary: 'system-ui',
    secondary: 'monospace',
  },
};

/**
 * 高对比度主题（辅助功能）
 */
export const highContrastTheme: CompassTheme = {
  id: 'high-contrast',
  name: '高对比度',
  description: '高对比度配色，便于视觉识别',
  colors: {
    primary: '#000000', // 黑色
    secondary: '#FFFFFF', // 白色
    background: '#FFFFFF', // 白色
    foreground: '#000000', // 黑色
    accent: '#FF0000', // 纯红色
    ring: '#000000', // 黑色
    needle: '#FF0000', // 纯红色
    text: '#000000', // 黑色
    grid: '#808080', // 中灰色
    marker: '#0000FF', // 纯蓝色
  },
};

/**
 * 所有可用主题
 */
export const themes: Record<string, CompassTheme> = {
  traditional: traditionalTheme,
  modern: modernTheme,
  dark: darkTheme,
  'high-contrast': highContrastTheme,
};

/**
 * 默认主题
 */
export const defaultTheme = modernTheme;

/**
 * 根据 ID 获取主题
 */
export function getTheme(id: string): CompassTheme {
  return themes[id] || defaultTheme;
}

/**
 * 获取所有主题列表
 */
export function getAllThemes(): CompassTheme[] {
  return Object.values(themes);
}

/**
 * 应用主题到 CSS 变量
 */
export function applyTheme(theme: CompassTheme, element?: HTMLElement): void {
  const target = element || document.documentElement;

  // 设置 CSS 变量
  Object.entries(theme.colors).forEach(([key, value]) => {
    target.style.setProperty(`--compass-${key}`, value);
  });

  // 设置字体
  if (theme.fonts?.primary) {
    target.style.setProperty('--compass-font-primary', theme.fonts.primary);
  }
  if (theme.fonts?.secondary) {
    target.style.setProperty('--compass-font-secondary', theme.fonts.secondary);
  }
}
