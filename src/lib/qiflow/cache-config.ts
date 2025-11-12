/**
 * 缓存配置管理
 * 实现三级缓存策略：
 * 1. 浏览器缓存（客户端）
 * 2. CDN缓存（边缘）
 * 3. 服务端缓存（源站）
 */

import { unstable_cache } from 'next/cache';

// 缓存时间配置（秒）
export const CACHE_TIMES = {
  // 静态内容
  STATIC: 31536000, // 1年
  IMAGES: 86400 * 30, // 30天

  // API响应
  BAZI_RESULT: 3600, // 1小时
  XUANKONG_RESULT: 3600, // 1小时
  AI_CHAT: 300, // 5分钟

  // 页面内容
  HOMEPAGE: 3600, // 1小时
  ANALYSIS_PAGE: 1800, // 30分钟

  // 用户相关
  USER_PROFILE: 300, // 5分钟
  CREDITS: 60, // 1分钟
} as const;

// 缓存标签（用于按需重新验证）
export const CACHE_TAGS = {
  BAZI: 'bazi-analysis',
  XUANKONG: 'xuankong-analysis',
  AI_CHAT: 'ai-chat',
  USER: 'user-data',
  CREDITS: 'user-credits',
} as const;

// 缓存键生成器
export const getCacheKey = (
  type: keyof typeof CACHE_TAGS,
  ...params: string[]
) => {
  return `${CACHE_TAGS[type]}:${params.join(':')}`;
};

// 八字分析缓存
export const cachedBaziAnalysis = unstable_cache(
  async (birthData: string, gender: string) => {
    // 这里调用实际的八字分析函数
    const mod: any = await import('@/lib/bazi');
    return mod.computeBaziSmart({
      datetime: birthData,
      gender,
      timezone: 'Asia/Shanghai',
      isTimeKnown: true,
      preferredLocale: 'zh-CN',
    });
  },
  ['bazi-analysis'],
  {
    revalidate: CACHE_TIMES.BAZI_RESULT,
    tags: [CACHE_TAGS.BAZI],
  }
);

// 玄空分析缓存
export const cachedXuankongAnalysis = unstable_cache(
  async (address: string, facing: number) => {
    // 这里调用实际的玄空分析函数
    const mod: any = await import('@/lib/qiflow/xuankong');
    return mod.calculateXuankong({ address, facing });
  },
  ['xuankong-analysis'],
  {
    revalidate: CACHE_TIMES.XUANKONG_RESULT,
    tags: [CACHE_TAGS.XUANKONG],
  }
);

// 响应头缓存控制
export const setCacheHeaders = (
  headers: Headers,
  type: keyof typeof CACHE_TIMES
) => {
  const maxAge = CACHE_TIMES[type];

  // 设置 Cache-Control
  headers.set(
    'Cache-Control',
    `public, max-age=${maxAge}, s-maxage=${maxAge}, stale-while-revalidate=${maxAge / 2}`
  );

  // 设置 CDN 缓存标签
  headers.set(
    'CDN-Cache-Tag',
    CACHE_TAGS[type as keyof typeof CACHE_TAGS] || 'default'
  );

  return headers;
};

// 缓存降级策略
export interface CacheLevel {
  level: 'full' | 'medium' | 'lite';
  ttl: number;
  features: string[];
}

export const getCacheLevel = (credits: number): CacheLevel => {
  if (credits >= 100) {
    return {
      level: 'full',
      ttl: CACHE_TIMES.BAZI_RESULT,
      features: ['full-analysis', 'charts', 'interpretation', 'export'],
    };
  }
  if (credits >= 50) {
    return {
      level: 'medium',
      ttl: CACHE_TIMES.BAZI_RESULT / 2,
      features: ['basic-analysis', 'charts'],
    };
  }
  return {
    level: 'lite',
    ttl: CACHE_TIMES.BAZI_RESULT / 4,
    features: ['basic-analysis'],
  };
};

// 缓存清理
export const invalidateCache = async (tags: string[]) => {
  if (typeof window === 'undefined') {
    const { revalidateTag } = await import('next/cache');
    tags.forEach((tag) => revalidateTag(tag));
  }
};

// 浏览器端缓存（localStorage）
export const browserCache = {
  set: (key: string, data: any, ttl?: number) => {
    if (typeof window === 'undefined') return;

    const item = {
      data,
      timestamp: Date.now(),
      ttl: ttl || CACHE_TIMES.USER_PROFILE * 1000, // 转换为毫秒
    };

    try {
      localStorage.setItem(key, JSON.stringify(item));
    } catch (e) {
      console.warn('Failed to save to localStorage:', e);
    }
  },

  get: <T>(key: string): T | null => {
    if (typeof window === 'undefined') return null;

    try {
      const item = localStorage.getItem(key);
      if (!item) return null;

      const parsed = JSON.parse(item);
      const now = Date.now();

      // 检查是否过期
      if (now - parsed.timestamp > parsed.ttl) {
        localStorage.removeItem(key);
        return null;
      }

      return parsed.data;
    } catch (e) {
      console.warn('Failed to read from localStorage:', e);
      return null;
    }
  },

  clear: (pattern?: string) => {
    if (typeof window === 'undefined') return;

    if (pattern) {
      // 清理匹配模式的键
      Object.keys(localStorage)
        .filter((key) => key.includes(pattern))
        .forEach((key) => localStorage.removeItem(key));
    } else {
      // 清理所有缓存
      localStorage.clear();
    }
  },
};

