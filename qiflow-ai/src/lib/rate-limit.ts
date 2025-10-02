import { NextRequest } from 'next/server';

// 速率限制配置
type RateLimitConfig = {
  windowMs: number;    // 时间窗口(毫秒)
  maxRequests: number; // 最大请求数
  keyGenerator?: (req: NextRequest) => string; // 键生成器
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
  message?: string;
};

// 内存存储的速率限制实现
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  increment(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const existing = this.store.get(key);
    
    if (!existing || now > existing.resetTime) {
      // 新窗口或过期，重置计数
      const record = { count: 1, resetTime: now + windowMs };
      this.store.set(key, record);
      return record;
    }
    
    // 在当前窗口内，增加计数
    existing.count++;
    this.store.set(key, existing);
    return existing;
  }

  // 清理过期记录
  cleanup() {
    const now = Date.now();
    for (const [key, record] of this.store.entries()) {
      if (now > record.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

const globalStore = new MemoryStore();

// 定期清理过期记录
if (typeof setInterval !== 'undefined') {
  setInterval(() => globalStore.cleanup(), 60000); // 每分钟清理一次
}

// 默认键生成器：IP + 用户代理
function defaultKeyGenerator(req: NextRequest): string {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0] || 
           req.headers.get('x-real-ip') || 
           'unknown-ip';
  const userAgent = req.headers.get('user-agent')?.substring(0, 50) || 'unknown-ua';
  return `${ip}:${userAgent}`;
}

// 速率限制中间件
export function createRateLimit(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    keyGenerator = defaultKeyGenerator,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
    message = 'Too many requests, please try again later.'
  } = config;

  return {
    check: async (req: NextRequest): Promise<{
      allowed: boolean;
      remaining: number;
      resetTime: number;
      error?: string;
    }> => {
      try {
        const key = keyGenerator(req);
        const { count, resetTime } = globalStore.increment(key, windowMs);
        
        const allowed = count <= maxRequests;
        const remaining = Math.max(0, maxRequests - count);
        
        return {
          allowed,
          remaining,
          resetTime,
          error: allowed ? undefined : message
        };
      } catch (error) {
        console.error('Rate limit check failed:', error);
        // 出错时允许请求通过，避免阻塞正常访问
        return {
          allowed: true,
          remaining: maxRequests,
          resetTime: Date.now() + windowMs
        };
      }
    }
  };
}

// 预定义的速率限制配置
export const rateLimitConfigs = {
  // 游客会话创建 - 每小时20次
  guestSession: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 20,
    message: 'Too many guest session requests. Please try again later.'
  }),

  // 用户认证 - 每15分钟5次
  auth: createRateLimit({
    windowMs: 15 * 60 * 1000, // 15分钟
    maxRequests: 5,
    message: 'Too many authentication attempts. Please try again in 15 minutes.'
  }),

  // AI聊天 - 每分钟10次
  aiChat: createRateLimit({
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 10,
    message: 'Too many AI chat requests. Please slow down.'
  }),

  // 一般API - 每分钟60次
  general: createRateLimit({
    windowMs: 60 * 1000, // 1分钟
    maxRequests: 60,
    message: 'Rate limit exceeded. Please try again later.'
  }),

  // 文件上传 - 每小时10次
  upload: createRateLimit({
    windowMs: 60 * 60 * 1000, // 1小时
    maxRequests: 10,
    message: 'Too many upload requests. Please try again later.'
  })
};

// 速率限制装饰器 - 用于包装API处理函数
export function withRateLimit(
  rateLimit: ReturnType<typeof createRateLimit>,
  handler: (req: NextRequest, ...args: any[]) => Promise<Response>
) {
  return async (req: NextRequest, ...args: any[]): Promise<Response> => {
    const result = await rateLimit.check(req);
    
    if (!result.allowed) {
      return new Response(
        JSON.stringify({
          error: result.error,
          retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'X-RateLimit-Limit': String(rateLimit),
            'X-RateLimit-Remaining': String(result.remaining),
            'X-RateLimit-Reset': String(Math.ceil(result.resetTime / 1000)),
            'Retry-After': String(Math.ceil((result.resetTime - Date.now()) / 1000))
          }
        }
      );
    }
    
    const response = await handler(req, ...args);
    
    // 添加速率限制头部信息
    response.headers.set('X-RateLimit-Remaining', String(result.remaining));
    response.headers.set('X-RateLimit-Reset', String(Math.ceil(result.resetTime / 1000)));
    
    return response;
  };
}