import { NextRequest } from 'next/server';

// Rate limiting configuration
interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string; // Error message when limit exceeded
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
}

// Default configurations for different endpoint types
export const RATE_LIMIT_CONFIGS = {
  // Authentication endpoints
  AUTH_LOGIN: {
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again later',
  },
  AUTH_REGISTER: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 registrations per hour per IP
    message: 'Too many registration attempts, please try again later',
  },
  AUTH_PASSWORD_RESET: {
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 3, // 3 password reset requests per hour
    message: 'Too many password reset attempts, please try again later',
  },

  // Guest session endpoints
  GUEST_SESSION_CREATE: {
    windowMs: 10 * 60 * 1000, // 10 minutes
    maxRequests: 10, // 10 guest sessions per 10 minutes per IP
    message: 'Too many guest session requests, please try again later',
  },

  // AI endpoints
  AI_CHAT: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 20, // 20 AI requests per minute
    message: 'AI request rate limit exceeded, please slow down',
  },
  AI_ANALYSIS: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 analysis requests per 5 minutes
    message: 'Analysis request rate limit exceeded, please wait before requesting more',
  },

  // General API endpoints
  API_GENERAL: {
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 100, // 100 requests per minute
    message: 'API rate limit exceeded, please slow down',
  },

  // User profile endpoints
  USER_PROFILE_UPDATE: {
    windowMs: 5 * 60 * 1000, // 5 minutes
    maxRequests: 10, // 10 profile updates per 5 minutes
    message: 'Too many profile update attempts, please wait',
  },

  // Sensitive operations
  SENSITIVE_DATA_UPDATE: {
    windowMs: 30 * 60 * 1000, // 30 minutes
    maxRequests: 3, // 3 sensitive updates per 30 minutes
    message: 'Too many sensitive data update attempts, please try again later',
  },
} as const;

// In-memory store for rate limiting (replace with Redis in production)
class MemoryStore {
  private store = new Map<string, { count: number; resetTime: number }>();

  get(key: string): { totalHits: number; resetTime: Date } | undefined {
    const data = this.store.get(key);
    if (!data) return undefined;

    // Clean up expired entries
    if (Date.now() > data.resetTime) {
      this.store.delete(key);
      return undefined;
    }

    return {
      totalHits: data.count,
      resetTime: new Date(data.resetTime),
    };
  }

  incr(key: string, windowMs: number): { totalHits: number; resetTime: Date } {
    const now = Date.now();
    const resetTime = now + windowMs;
    const existing = this.store.get(key);

    if (!existing || now > existing.resetTime) {
      // Create new entry or reset expired entry
      this.store.set(key, { count: 1, resetTime });
      return { totalHits: 1, resetTime: new Date(resetTime) };
    } else {
      // Increment existing entry
      existing.count++;
      return { totalHits: existing.count, resetTime: new Date(existing.resetTime) };
    }
  }

  // Cleanup expired entries (should be called periodically)
  cleanup(): void {
    const now = Date.now();
    for (const [key, data] of this.store.entries()) {
      if (now > data.resetTime) {
        this.store.delete(key);
      }
    }
  }
}

// Rate limiter class
export class RateLimiter {
  private store: MemoryStore;

  constructor() {
    this.store = new MemoryStore();
    
    // Cleanup expired entries every 5 minutes
    if (typeof setInterval !== 'undefined') {
      setInterval(() => {
        this.store.cleanup();
      }, 5 * 60 * 1000);
    }
  }

  // Check rate limit and update counter
  async checkRateLimit(
    req: NextRequest,
    config: RateLimitConfig
  ): Promise<{
    success: boolean;
    limit: number;
    remaining: number;
    resetTime: Date;
    error?: string;
  }> {
    const key = config.keyGenerator ? config.keyGenerator(req) : this.getDefaultKey(req);
    const result = this.store.incr(key, config.windowMs);

    const success = result.totalHits <= config.maxRequests;
    const remaining = Math.max(0, config.maxRequests - result.totalHits);

    return {
      success,
      limit: config.maxRequests,
      remaining,
      resetTime: result.resetTime,
      error: success ? undefined : config.message || 'Rate limit exceeded',
    };
  }

  // Get current rate limit status without incrementing
  async getRateLimitStatus(
    req: NextRequest,
    config: RateLimitConfig
  ): Promise<{
    limit: number;
    remaining: number;
    resetTime: Date;
    used: number;
  }> {
    const key = config.keyGenerator ? config.keyGenerator(req) : this.getDefaultKey(req);
    const data = this.store.get(key);

    if (!data) {
      return {
        limit: config.maxRequests,
        remaining: config.maxRequests,
        resetTime: new Date(Date.now() + config.windowMs),
        used: 0,
      };
    }

    return {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - data.totalHits),
      resetTime: data.resetTime,
      used: data.totalHits,
    };
  }

  // Default key generator: IP address + user agent hash
  private getDefaultKey(req: NextRequest): string {
    const ip = this.getClientIP(req);
    const userAgent = req.headers.get('user-agent') || '';
    
    // Create a simple hash of user agent to avoid very long keys
    const uaHash = Buffer.from(userAgent).toString('base64').substring(0, 16);
    
    return `${ip}:${uaHash}`;
  }

  // Get client IP address with proper header handling
  private getClientIP(req: NextRequest): string {
    // Check various headers for the real client IP
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const cfConnectingIp = req.headers.get('cf-connecting-ip');
    
    if (forwarded) {
      // x-forwarded-for can contain multiple IPs, take the first one
      return forwarded.split(',')[0].trim();
    }
    
    if (realIp) {
      return realIp;
    }
    
    if (cfConnectingIp) {
      return cfConnectingIp;
    }
    
    // Fallback to connection remote address (may not be available in some deployments)
    return (req as any).ip || '127.0.0.1';
  }
}

// Global rate limiter instance
export const rateLimiter = new RateLimiter();

// Middleware helper for rate limiting
export async function withRateLimit(
  req: NextRequest,
  configKey: keyof typeof RATE_LIMIT_CONFIGS,
  customConfig?: Partial<RateLimitConfig>
) {
  const config = { ...RATE_LIMIT_CONFIGS[configKey], ...customConfig };
  
  const result = await rateLimiter.checkRateLimit(req, config);
  
  return {
    ...result,
    headers: {
      'X-RateLimit-Limit': result.limit.toString(),
      'X-RateLimit-Remaining': result.remaining.toString(),
      'X-RateLimit-Reset': Math.ceil(result.resetTime.getTime() / 1000).toString(),
    },
  };
}

// User-specific rate limiting (for authenticated requests)
export function createUserRateLimitKey(userId: string, action: string): string {
  return `user:${userId}:${action}`;
}

// Guest session rate limiting
export function createGuestRateLimitKey(sessionId: string, action: string): string {
  return `guest:${sessionId}:${action}`;
}

// Helper to create custom rate limit configs
export function createRateLimitConfig(
  maxRequests: number,
  windowMs: number,
  message?: string
): RateLimitConfig {
  return {
    maxRequests,
    windowMs,
    message: message || 'Rate limit exceeded',
  };
}