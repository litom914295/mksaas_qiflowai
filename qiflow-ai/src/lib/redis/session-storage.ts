import { Redis } from 'ioredis';
import { RedisConnection } from './connection';

type SessionPayload = Record<string, unknown>;

class SessionStorageService {
  private readonly redis: Redis;

  private readonly ttlSeconds: number;

  constructor(ttlSeconds: number = 24 * 60 * 60) {
    this.redis = RedisConnection.getInstance();
    this.ttlSeconds = ttlSeconds;
  }

  async saveSession(sessionId: string, context: SessionPayload): Promise<void> {
    const key = this.buildKey(sessionId);
    const serialized = JSON.stringify({
      ...context,
      lastUpdated: new Date().toISOString(),
    });

    await this.redis.setex(key, this.ttlSeconds, serialized);
  }

  async getSession<T extends SessionPayload = SessionPayload>(
    sessionId: string
  ): Promise<T | null> {
    const key = this.buildKey(sessionId);
    const data = await this.redis.get(key);

    if (!data) {
      return null;
    }

    try {
      return JSON.parse(data) as T;
    } catch (error) {
      console.error('[SessionStorage] parse error', error);
      await this.redis.del(key);
      return null;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    const key = this.buildKey(sessionId);
    await this.redis.del(key);
  }

  async extendSession(sessionId: string): Promise<void> {
    const key = this.buildKey(sessionId);
    await this.redis.expire(key, this.ttlSeconds);
  }

  private buildKey(sessionId: string): string {
    return `session:${sessionId}`;
  }
}

export { SessionStorageService };
export type { SessionPayload };
