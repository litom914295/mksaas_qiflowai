/**
 * QiFlow AI Design System
 * 统一的设计代币和样式规范
 */

// ==================== 色彩系统 ====================

export const colors = {
  // 主品牌色 - 体现传统与现代的融合
  primary: {
    50: '#eff6ff',   // 最浅
    100: '#dbeafe',
    200: '#bfdbfe',
    300: '#93c5fd',
    400: '#60a5fa',
    500: '#3b82f6',  // 主色
    600: '#2563eb',
    700: '#1d4ed8',
    800: '#1e40af',
    900: '#1e3a8a'   // 最深
  },

  // 传统文化色彩 - 结合风水五行
  cultural: {
    // 金色系 - 尊贵、成功
    gold: {
      50: '#fffbeb',
      100: '#fef3c7',
      200: '#fde68a',
      300: '#fcd34d',
      400: '#fbbf24',
      500: '#f59e0b',  // 主金色
      600: '#d97706',
      700: '#b45309',
      800: '#92400e',
      900: '#78350f'
    },
    
    // 翠绿系 - 和谐、生长
    jade: {
      50: '#ecfdf5',
      100: '#d1fae5',
      200: '#a7f3d0',
      300: '#6ee7b7',
      400: '#34d399',
      500: '#10b981',  // 主翠绿色
      600: '#059669',
      700: '#047857',
      800: '#065f46',
      900: '#064e3b'
    },
    
    // 朱红系 - 吉祥、热情
    vermillion: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',  // 主朱红色
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    
    // 墨色系 - 沉稳、智慧
    ink: {
      50: '#f9fafb',
      100: '#f3f4f6',
      200: '#e5e7eb',
      300: '#d1d5db',
      400: '#9ca3af',
      500: '#6b7280',
      600: '#4b5563',
      700: '#374151',  // 主墨色
      800: '#1f2937',
      900: '#111827'
    }
  },

  // 五行元素色彩
  elements: {
    wood: {
      primary: '#059669',    // 木 - 绿色
      light: '#a7f3d0',
      dark: '#064e3b',
      bg: '#ecfdf5'
    },
    fire: {
      primary: '#dc2626',    // 火 - 红色
      light: '#fecaca',
      dark: '#7f1d1d',
      bg: '#fef2f2'
    },
    earth: {
      primary: '#d97706',    // 土 - 黄色
      light: '#fde68a',
      dark: '#78350f',
      bg: '#fffbeb'
    },
    metal: {
      primary: '#6b7280',    // 金 - 银灰
      light: '#d1d5db',
      dark: '#1f2937',
      bg: '#f9fafb'
    },
    water: {
      primary: '#2563eb',    // 水 - 蓝色
      light: '#bfdbfe',
      dark: '#1e3a8a',
      bg: '#eff6ff'
    }
  },

  // 飞星吉凶色彩
  stars: {
    auspicious: {
      primary: '#10b981',    // 吉星 - 绿色
      light: '#d1fae5',
      dark: '#065f46',
      bg: '#ecfdf5'
    },
    neutral: {
      primary: '#f59e0b',    // 中性 - 黄色
      light: '#fef3c7',
      dark: '#78350f',
      bg: '#fffbeb'
    },
    inauspicious: {
      primary: '#ef4444',    // 凶星 - 红色
      light: '#fee2e2',
      dark: '#7f1d1d',
      bg: '#fef2f2'
    }
  },

  // 语义化色彩
  semantic: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6'
  }
} as const;

// ==================== 字体系统 ====================

export const typography = {
  // 字体族
  fontFamily: {
    sans: [
      'system-ui',
      '-apple-system', 
      'BlinkMacSystemFont',
      '"Segoe UI"',
      'Roboto',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif'
    ],
    chinese: [
      '"PingFang SC"',
      '"Hiragino Sans GB"', 
      '"Microsoft YaHei"',
      '"Source Han Sans SC"',
      '"Noto Sans CJK SC"',
      'sans-serif'
    ],
    mono: [
      'Menlo',
      'Monaco', 
      'Consolas',
      '"Liberation Mono"',
      '"Courier New"',
      'monospace'
    ]
  },

  // 字体大小
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],      // 12px
    sm: ['0.875rem', { lineHeight: '1.25rem' }],  // 14px  
    base: ['1rem', { lineHeight: '1.5rem' }],     // 16px
    lg: ['1.125rem', { lineHeight: '1.75rem' }],  // 18px
    xl: ['1.25rem', { lineHeight: '1.75rem' }],   // 20px
    '2xl': ['1.5rem', { lineHeight: '2rem' }],    // 24px
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }], // 30px
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],   // 36px
    '5xl': ['3rem', { lineHeight: '1' }],           // 48px
    '6xl': ['3.75rem', { lineHeight: '1' }]         // 60px
  },

  // 字体粗细
  fontWeight: {
    thin: '100',
    extralight: '200', 
    light: '300',
    normal: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
    black: '900'
  }
} as const;

// ==================== 间距系统 ====================

export const spacing = {
  px: '1px',
  0: '0',
  0.5: '0.125rem',   // 2px
  1: '0.25rem',      // 4px
  1.5: '0.375rem',   // 6px
  2: '0.5rem',       // 8px
  2.5: '0.625rem',   // 10px
  3: '0.75rem',      // 12px
  3.5: '0.875rem',   // 14px
  4: '1rem',         // 16px
  5: '1.25rem',      // 20px
  6: '1.5rem',       // 24px
  7: '1.75rem',      // 28px
  8: '2rem',         // 32px
  9: '2.25rem',      // 36px
  10: '2.5rem',      // 40px
  11: '2.75rem',     // 44px
  12: '3rem',        // 48px
  14: '3.5rem',      // 56px
  16: '4rem',        // 64px
  20: '5rem',        // 80px
  24: '6rem',        // 96px
  28: '7rem',        // 112px
  32: '8rem',        // 128px
  36: '9rem',        // 144px
  40: '10rem',       // 160px
  44: '11rem',       // 176px
  48: '12rem',       // 192px
  52: '13rem',       // 208px
  56: '14rem',       // 224px
  60: '15rem',       // 240px
  64: '16rem',       // 256px
  72: '18rem',       // 288px
  80: '20rem',       // 320px
  96: '24rem'        // 384px
} as const;

// ==================== 阴影系统 ====================

export const shadows = {
  none: 'none',
  sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
  base: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
  md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
  lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
  xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
  '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
  inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
  
  // 特殊阴影
  glow: '0 0 20px rgb(59 130 246 / 0.3)',
  cultural: '0 8px 32px rgb(245 158 11 / 0.2)'
} as const;

// ==================== 圆角系统 ====================

export const borderRadius = {
  none: '0',
  sm: '0.125rem',     // 2px
  base: '0.25rem',    // 4px
  md: '0.375rem',     // 6px
  lg: '0.5rem',       // 8px
  xl: '0.75rem',      // 12px
  '2xl': '1rem',      // 16px
  '3xl': '1.5rem',    // 24px
  full: '9999px'
} as const;

// ==================== 断点系统 ====================

export const breakpoints = {
  sm: '640px',      // 手机横屏/小平板
  md: '768px',      // 平板
  lg: '1024px',     // 小桌面
  xl: '1280px',     // 桌面
  '2xl': '1536px'   // 大桌面
} as const;

// ==================== 动画系统 ====================

export const animations = {
  // 持续时间
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms'
  },

  // 缓动函数
  timing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    'in-out': 'cubic-bezier(0.4, 0, 0.2, 1)'
  },

  // 关键帧动画
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0' },
      '100%': { opacity: '1' }
    },
    slideUp: {
      '0%': { transform: 'translateY(100%)' },
      '100%': { transform: 'translateY(0)' }
    },
    compassSpin: {
      '0%': { transform: 'rotate(0deg)' },
      '100%': { transform: 'rotate(360deg)' }
    },
    starPulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' }
    },
    glow: {
      '0%, 100%': { boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
      '50%': { boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)' }
    }
  }
} as const;

// ==================== 组件变体系统 ====================

export const variants = {
  // 卡片变体
  card: {
    default: 'rounded-lg border bg-white shadow-sm',
    elevated: 'rounded-xl border-0 bg-white shadow-lg',
    outlined: 'rounded-lg border-2 bg-transparent',
    cultural: 'rounded-xl border bg-gradient-to-br from-white to-amber-50 shadow-cultural'
  },

  // 按钮变体  
  button: {
    default: 'rounded-md bg-primary-600 text-white hover:bg-primary-700',
    outline: 'rounded-md border-2 border-primary-600 text-primary-600 hover:bg-primary-50',
    ghost: 'rounded-md text-primary-600 hover:bg-primary-50',
    cultural: 'rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 text-white shadow-cultural'
  },

  // 标签变体
  badge: {
    default: 'rounded-full px-2 py-1 text-xs font-medium',
    success: 'bg-jade-100 text-jade-800',
    warning: 'bg-gold-100 text-gold-800', 
    error: 'bg-vermillion-100 text-vermillion-800',
    neutral: 'bg-ink-100 text-ink-800'
  }
} as const;

// ==================== 导出类型 ====================

export type DesignTokens = {
  colors: typeof colors;
  typography: typeof typography;
  spacing: typeof spacing;
  shadows: typeof shadows;
  borderRadius: typeof borderRadius;
  breakpoints: typeof breakpoints;
  animations: typeof animations;
  variants: typeof variants;
};

// 默认导出
export const designTokens: DesignTokens = {
  colors,
  typography,
  spacing,
  shadows,
  borderRadius,
  breakpoints,
  animations,
  variants
};