// @ts-ignore - Redis connection module
import { RedisConnection } from '@/lib/redis/connection';

interface RateLimiterOptions {
  limit?: number;
  windowSeconds?: number;
  prefix?: string;
}

class MemoryBucket {
  private readonly buckets = new Map<
    string,
    { count: number; expiresAt: number }
  >();

  constructor(
    private readonly limit: number,
    private readonly windowMs: number
  ) {}

  consume(key: string): boolean {
    const now = Date.now();
    const bucket = this.buckets.get(key);

    if (!bucket || bucket.expiresAt < now) {
      this.buckets.set(key, { count: 1, expiresAt: now + this.windowMs });
      return true;
    }

    if (bucket.count >= this.limit) {
      return false;
    }

    bucket.count += 1;
    return true;
  }
}

export class RateLimiter {
  private readonly limit: number;
  private readonly windowSeconds: number;
  private readonly prefix: string;
  private memoryBucket: MemoryBucket;

  constructor(options: RateLimiterOptions = {}) {
    this.limit = options.limit ?? 8;
    this.windowSeconds = options.windowSeconds ?? 60;
    this.prefix = options.prefix ?? 'chat-rate:';
    this.memoryBucket = new MemoryBucket(this.limit, this.windowSeconds * 1000);
  }

  async consume(key: string): Promise<boolean> {
    try {
      const redis = RedisConnection.getInstance();
      const redisKey = `${this.prefix}${key}`;
      const count = await redis.incr(redisKey);

      if (count === 1) {
        await redis.expire(redisKey, this.windowSeconds);
      }

      if (count > this.limit) {
        return false;
      }

      return true;
    } catch (error) {
      console.warn(
        '[RateLimiter] redis unavailable, falling back to memory bucket',
        error
      );
      return this.memoryBucket.consume(key);
    }
  }
}
