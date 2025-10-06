/**
 * API限流模块
 * 使用内存存储实现简单的限流功能
 * 生产环境建议使用Redis或其他持久化存储
 */

interface RateLimitConfig {
  // 时间窗口（毫秒）
  windowMs: number;
  // 时间窗口内最大请求数
  maxRequests: number;
  // 错误消息
  message?: string;
}

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// 内存存储（注意：仅适用于单实例部署）
const store = new Map<string, RateLimitStore>();

// 定期清理过期的限流记录
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of store.entries()) {
    if (value.resetTime < now) {
      store.delete(key);
    }
  }
}, 60000); // 每分钟清理一次

/**
 * 创建限流器
 * @param config 限流配置
 * @returns 限流函数
 */
export function createRateLimiter(config: RateLimitConfig) {
  const {
    windowMs = 60000, // 默认1分钟
    maxRequests = 10, // 默认10请求
    message = 'Too many requests, please try again later.',
  } = config;

  return async function rateLimit(identifier: string): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    reset: Date;
    message?: string;
  }> {
    const now = Date.now();
    const resetTime = now + windowMs;

    // 获取或创建记录
    let record = store.get(identifier);

    if (!record || record.resetTime < now) {
      // 创建新记录或重置过期记录
      record = {
        count: 0,
        resetTime: resetTime,
      };
      store.set(identifier, record);
    }

    // 增加计数
    record.count++;

    // 检查是否超过限制
    const remaining = Math.max(0, maxRequests - record.count);
    const success = record.count <= maxRequests;

    return {
      success,
      limit: maxRequests,
      remaining,
      reset: new Date(record.resetTime),
      message: success ? undefined : message,
    };
  };
}

/**
 * 默认限流器配置
 */
export const defaultRateLimiters = {
  // AI聊天API限流：每分钟5次
  aiChat: createRateLimiter({
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 5,
    message: 'AI聊天请求过于频繁，请稍后再试',
  }),

  // 八字计算API限流：每分钟10次
  baziCalculation: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: '八字计算请求过于频繁，请稍后再试',
  }),

  // 风水分析API限流：每分钟10次
  fengshuiAnalysis: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 10,
    message: '风水分析请求过于频繁，请稍后再试',
  }),

  // 通用API限流：每分钟20次
  general: createRateLimiter({
    windowMs: 60 * 1000,
    maxRequests: 20,
    message: 'API请求过于频繁，请稍后再试',
  }),

  // 严格限流（用于敏感操作）：每小时3次
  strict: createRateLimiter({
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 3,
    message: '操作过于频繁，请一小时后再试',
  }),
};

/**
 * 获取客户端IP地址
 * @param request 请求对象
 * @returns IP地址字符串
 */
export function getClientIp(request: Request): string {
  // 尝试从各种头部获取真实IP
  const headers = request.headers;
  const forwardedFor = headers.get('x-forwarded-for');
  const realIp = headers.get('x-real-ip');
  const cloudflareIp = headers.get('cf-connecting-ip');
  
  if (cloudflareIp) return cloudflareIp;
  if (forwardedFor) return forwardedFor.split(',')[0].trim();
  if (realIp) return realIp;
  
  // 如果无法获取IP，使用默认值
  return 'unknown';
}

/**
 * Express/Next.js中间件包装器
 * @param limiter 限流器实例
 * @returns 中间件函数
 */
export function rateLimitMiddleware(
  limiter: ReturnType<typeof createRateLimiter> = defaultRateLimiters.general
) {
  return async function middleware(request: Request): Promise<Response | null> {
    const identifier = getClientIp(request);
    const result = await limiter(identifier);

    // 设置限流相关响应头
    const headers = new Headers();
    headers.set('X-RateLimit-Limit', result.limit.toString());
    headers.set('X-RateLimit-Remaining', result.remaining.toString());
    headers.set('X-RateLimit-Reset', result.reset.toISOString());

    if (!result.success) {
      // 返回429状态码
      return new Response(
        JSON.stringify({
          error: result.message,
          retryAfter: result.reset,
        }),
        {
          status: 429,
          headers: {
            ...Object.fromEntries(headers),
            'Content-Type': 'application/json',
            'Retry-After': Math.ceil((result.reset.getTime() - Date.now()) / 1000).toString(),
          },
        }
      );
    }

    // 限流通过，继续处理
    return null;
  };
}

/**
 * 重置特定标识符的限流计数
 * @param identifier 标识符
 */
export function resetRateLimit(identifier: string) {
  store.delete(identifier);
}

/**
 * 清空所有限流记录
 * 仅用于测试或紧急情况
 */
export function clearAllRateLimits() {
  store.clear();
}