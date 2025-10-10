/**
 * 优化版风水罗盘主题配置
 *
 * 现代化设计风格的主题系统：
 * 1. 协调的配色方案
 * 2. 现代化视觉效果
 * 3. 增强的可读性
 */

import type { CompassTheme } from './feng-shui-types';

// 扩展的主题接口
export interface OptimizedCompassTheme extends CompassTheme {
  gradients: {
    background: string[];
    tianchi: string[];
    layers: string[][];
  };
  shadows: {
    enabled: boolean;
    color: string;
    blur: number;
    offset: { x: number; y: number };
  };
  animations: {
    enabled: boolean;
    duration: number;
    easing: string;
  };
  typography: {
    primaryFont: string;
    secondaryFont: string;
    weights: {
      normal: string;
      bold: string;
    };
  };
}

// 优化后的主题配置
export const OPTIMIZED_COMPASS_THEMES = {
  classic: {
    name: '经典雅致',
    backgroundColor: '#1a1a2e',
    borderColor: '#00d4ff',
    textColor: '#ffffff',
    scaleColor: '#ff6b6b',
    tianxinCrossColor: '#ff6b6b',
    layerColors: ['#16213e', '#1a2332', '#1e2a47'],
    gradients: {
      background: ['#1a1a2e', '#16213e', '#0f1419'],
      tianchi: ['#2a2a4e', '#1a1a2e'],
      layers: [
        ['#16213e', '#1a2332'],
        ['#1a2332', '#1e2a47'],
        ['#1e2a47', '#22305c'],
      ],
    },
    shadows: {
      enabled: true,
      color: 'rgba(0, 0, 0, 0.8)',
      blur: 8,
      offset: { x: 2, y: 2 },
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
    typography: {
      primaryFont: 'PingFang SC, Microsoft YaHei, sans-serif',
      secondaryFont: '楷书, KaiTi, serif',
      weights: {
        normal: '400',
        bold: '600',
      },
    },
  } as OptimizedCompassTheme,

  modern: {
    name: '现代简约',
    backgroundColor: '#0f172a',
    borderColor: '#3b82f6',
    textColor: '#f1f5f9',
    scaleColor: '#ef4444',
    tianxinCrossColor: '#ef4444',
    layerColors: ['#1e293b', '#334155', '#475569'],
    gradients: {
      background: ['#0f172a', '#1e293b', '#020617'],
      tianchi: ['#334155', '#1e293b'],
      layers: [
        ['#1e293b', '#334155'],
        ['#334155', '#475569'],
        ['#475569', '#64748b'],
      ],
    },
    shadows: {
      enabled: true,
      color: 'rgba(0, 0, 0, 0.6)',
      blur: 12,
      offset: { x: 0, y: 4 },
    },
    animations: {
      enabled: true,
      duration: 250,
      easing: 'ease-out',
    },
    typography: {
      primaryFont: 'Inter, system-ui, sans-serif',
      secondaryFont: 'SF Pro Display, Helvetica Neue, sans-serif',
      weights: {
        normal: '500',
        bold: '700',
      },
    },
  } as OptimizedCompassTheme,

  elegant: {
    name: '优雅紫韵',
    backgroundColor: '#1e1b4b',
    borderColor: '#8b5cf6',
    textColor: '#e0e7ff',
    scaleColor: '#f59e0b',
    tianxinCrossColor: '#f59e0b',
    layerColors: ['#312e81', '#3730a3', '#4338ca'],
    gradients: {
      background: ['#1e1b4b', '#312e81', '#0f0a19'],
      tianchi: ['#4338ca', '#312e81'],
      layers: [
        ['#312e81', '#3730a3'],
        ['#3730a3', '#4338ca'],
        ['#4338ca', '#4f46e5'],
      ],
    },
    shadows: {
      enabled: true,
      color: 'rgba(139, 92, 246, 0.3)',
      blur: 16,
      offset: { x: 0, y: 8 },
    },
    animations: {
      enabled: true,
      duration: 400,
      easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
    typography: {
      primaryFont: 'Noto Serif SC, serif',
      secondaryFont: 'Source Han Sans SC, sans-serif',
      weights: {
        normal: '400',
        bold: '600',
      },
    },
  } as OptimizedCompassTheme,

  nature: {
    name: '自然翠绿',
    backgroundColor: '#064e3b',
    borderColor: '#10b981',
    textColor: '#ecfdf5',
    scaleColor: '#f59e0b',
    tianxinCrossColor: '#f59e0b',
    layerColors: ['#065f46', '#047857', '#059669'],
    gradients: {
      background: ['#064e3b', '#065f46', '#022c22'],
      tianchi: ['#059669', '#047857'],
      layers: [
        ['#065f46', '#047857'],
        ['#047857', '#059669'],
        ['#059669', '#10b981'],
      ],
    },
    shadows: {
      enabled: true,
      color: 'rgba(16, 185, 129, 0.2)',
      blur: 10,
      offset: { x: 0, y: 6 },
    },
    animations: {
      enabled: true,
      duration: 350,
      easing: 'ease-in-out',
    },
    typography: {
      primaryFont: 'Source Han Sans SC, sans-serif',
      secondaryFont: 'Roboto, sans-serif',
      weights: {
        normal: '400',
        bold: '500',
      },
    },
  } as OptimizedCompassTheme,

  golden: {
    name: '金辉典雅',
    backgroundColor: '#7c2d12',
    borderColor: '#fbbf24',
    textColor: '#fef3c7',
    scaleColor: '#dc2626',
    tianxinCrossColor: '#dc2626',
    layerColors: ['#92400e', '#a16207', '#ca8a04'],
    gradients: {
      background: ['#7c2d12', '#92400e', '#451a03'],
      tianchi: ['#ca8a04', '#a16207'],
      layers: [
        ['#92400e', '#a16207'],
        ['#a16207', '#ca8a04'],
        ['#ca8a04', '#eab308'],
      ],
    },
    shadows: {
      enabled: true,
      color: 'rgba(251, 191, 36, 0.4)',
      blur: 14,
      offset: { x: 0, y: 6 },
    },
    animations: {
      enabled: true,
      duration: 300,
      easing: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
    typography: {
      primaryFont: '楷书, KaiTi, serif',
      secondaryFont: '宋体, SimSun, serif',
      weights: {
        normal: '400',
        bold: '600',
      },
    },
  } as OptimizedCompassTheme,

  ocean: {
    name: '深海蓝韵',
    backgroundColor: '#0c4a6e',
    borderColor: '#0ea5e9',
    textColor: '#e0f2fe',
    scaleColor: '#f97316',
    tianxinCrossColor: '#f97316',
    layerColors: ['#075985', '#0369a1', '#0284c7'],
    gradients: {
      background: ['#0c4a6e', '#075985', '#082f49'],
      tianchi: ['#0284c7', '#0369a1'],
      layers: [
        ['#075985', '#0369a1'],
        ['#0369a1', '#0284c7'],
        ['#0284c7', '#0ea5e9'],
      ],
    },
    shadows: {
      enabled: true,
      color: 'rgba(14, 165, 233, 0.3)',
      blur: 12,
      offset: { x: 0, y: 4 },
    },
    animations: {
      enabled: true,
      duration: 280,
      easing: 'ease-out',
    },
    typography: {
      primaryFont: 'SF Pro Display, Helvetica Neue, sans-serif',
      secondaryFont: 'Inter, system-ui, sans-serif',
      weights: {
        normal: '500',
        bold: '700',
      },
    },
  } as OptimizedCompassTheme,
} as const;

// 主题工具函数
export class ThemeUtils {
  static getTheme(
    themeName: keyof typeof OPTIMIZED_COMPASS_THEMES
  ): OptimizedCompassTheme {
    return OPTIMIZED_COMPASS_THEMES[themeName];
  }

  static getAllThemeNames(): string[] {
    return Object.keys(OPTIMIZED_COMPASS_THEMES);
  }

  static createCustomTheme(
    baseTheme: keyof typeof OPTIMIZED_COMPASS_THEMES,
    overrides: Partial<OptimizedCompassTheme>
  ): OptimizedCompassTheme {
    const base = OPTIMIZED_COMPASS_THEMES[baseTheme];
    return {
      ...base,
      ...overrides,
      gradients: {
        ...base.gradients,
        ...overrides.gradients,
      },
      shadows: {
        ...base.shadows,
        ...overrides.shadows,
      },
      animations: {
        ...base.animations,
        ...overrides.animations,
      },
      typography: {
        ...base.typography,
        ...overrides.typography,
      },
    };
  }

  static lightenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.min(
      255,
      Number.parseInt(hex.substr(0, 2), 16) + Math.round(255 * amount)
    );
    const g = Math.min(
      255,
      Number.parseInt(hex.substr(2, 2), 16) + Math.round(255 * amount)
    );
    const b = Math.min(
      255,
      Number.parseInt(hex.substr(4, 2), 16) + Math.round(255 * amount)
    );
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  static darkenColor(color: string, amount: number): string {
    const hex = color.replace('#', '');
    const r = Math.max(
      0,
      Number.parseInt(hex.substr(0, 2), 16) - Math.round(255 * amount)
    );
    const g = Math.max(
      0,
      Number.parseInt(hex.substr(2, 2), 16) - Math.round(255 * amount)
    );
    const b = Math.max(
      0,
      Number.parseInt(hex.substr(4, 2), 16) - Math.round(255 * amount)
    );
    return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
  }

  static hexToRgba(hex: string, alpha: number): string {
    const r = Number.parseInt(hex.slice(1, 3), 16);
    const g = Number.parseInt(hex.slice(3, 5), 16);
    const b = Number.parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
}
