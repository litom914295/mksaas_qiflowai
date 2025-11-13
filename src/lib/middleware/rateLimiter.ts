import { type NextRequest, NextResponse } from 'next/server';

/**
 * API限流中间件
 * 使用内存存储实现简单的滑动窗口限流算法
 * 生产环境建议使用Redis替换内存存储
 */

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

// 内存存储 (生产环境应使用Redis)
const store: RateLimitStore = {};

// 清理过期记录 (每分钟)
setInterval(() => {
  const now = Date.now();
  Object.keys(store).forEach((key) => {
    if (store[key].resetTime < now) {
      delete store[key];
    }
  });
}, 60000);

interface RateLimitOptions {
  /**
   * 时间窗口内允许的最大请求数
   */
  maxRequests: number;
  /**
   * 时间窗口大小(毫秒)
   */
  windowMs: number;
  /**
   * 是否跳过限流(用于特定IP白名单等)
   */
  skip?: (request: NextRequest) => boolean;
  /**
   * 自定义密钥生成函数(默认使用IP)
   */
  keyGenerator?: (request: NextRequest) => string;
}

/**
 * 生成限流密钥(默认使用IP地址)
 */
function defaultKeyGenerator(request: NextRequest): string {
  // 尝试获取真实IP(考虑代理)
  const forwarded = request.headers.get('x-forwarded-for');
  const realIp = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0]?.trim() || realIp || 'unknown';

  // 组合IP和路径作为key
  const path = request.nextUrl.pathname;
  return `${ip}:${path}`;
}

/**
 * 创建限流中间件
 */
export function createRateLimiter(options: RateLimitOptions) {
  const {
    maxRequests,
    windowMs,
    skip,
    keyGenerator = defaultKeyGenerator,
  } = options;

  return async function rateLimiter(
    request: NextRequest
  ): Promise<NextResponse | null> {
    // 检查是否跳过限流
    if (skip && skip(request)) {
      return null;
    }

    // 生成限流密钥
    const key = keyGenerator(request);
    const now = Date.now();

    // 获取或初始化限流记录
    if (!store[key] || store[key].resetTime < now) {
      store[key] = {
        count: 1,
        resetTime: now + windowMs,
      };
      return null;
    }

    // 检查是否超过限制
    if (store[key].count >= maxRequests) {
      const retryAfter = Math.ceil((store[key].resetTime - now) / 1000);

      return NextResponse.json(
        {
          success: false,
          error: '请求过于频繁,请稍后再试',
          retryAfter,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfter.toString(),
            'X-RateLimit-Limit': maxRequests.toString(),
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': store[key].resetTime.toString(),
          },
        }
      );
    }

    // 增加计数
    store[key].count += 1;

    // 添加限流响应头(可选)
    return null;
  };
}

/**
 * 预设限流策略
 */
export const RateLimitPresets = {
  /**
   * 严格限流: 每分钟10次
   */
  strict: {
    maxRequests: 10,
    windowMs: 60 * 1000,
  },
  /**
   * 标准限流: 每分钟60次
   */
  standard: {
    maxRequests: 60,
    windowMs: 60 * 1000,
  },
  /**
   * 宽松限流: 每分钟120次
   */
  loose: {
    maxRequests: 120,
    windowMs: 60 * 1000,
  },
  /**
   * 管理员API: 每分钟30次
   */
  admin: {
    maxRequests: 30,
    windowMs: 60 * 1000,
  },
  /**
   * 登录API: 每5分钟5次
   */
  auth: {
    maxRequests: 5,
    windowMs: 5 * 60 * 1000,
  },
};

/**
 * 用于Next.js API路由的快速限流装饰器
 */
export function withRateLimit(
  handler: (req: NextRequest) => Promise<NextResponse>,
  options: RateLimitOptions
) {
  const limiter = createRateLimiter(options);

  return async function rateLimitedHandler(
    req: NextRequest
  ): Promise<NextResponse> {
    const limitResponse = await limiter(req);
    if (limitResponse) {
      return limitResponse;
    }
    return handler(req);
  };
}

/**
 * 获取当前限流状态(用于调试)
 */
export function getRateLimitStatus(key: string) {
  return store[key] || null;
}

/**
 * 清除特定key的限流记录(用于测试/重置)
 */
export function clearRateLimit(key: string) {
  delete store[key];
}

/**
 * 清除所有限流记录
 */
export function clearAllRateLimits() {
  Object.keys(store).forEach((key) => {
    delete store[key];
  });
}
