// 八字缓存模块 - 简化版本

import type { EnhancedBaziResult } from '@/lib/bazi';

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number; // time to live in milliseconds
}

class SimpleCache<T> {
  private cache = new Map<string, CacheEntry<T>>();

  set(key: string, data: T, ttl = 300000): void {
    // 默认5分钟
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl,
    });
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

function extractBirthParts(datetime: string): {
  birthDate: string;
  birthTime: string;
} {
  if (!datetime) {
    return { birthDate: '', birthTime: '' };
  }

  const match = datetime.match(/^(\d{4}-\d{2}-\d{2})[T\s]?(\d{2}:\d{2})?/);
  const birthDate = match?.[1] ?? datetime;
  const birthTime = match?.[2] ?? '00:00';

  return { birthDate, birthTime };
}
// 带缓存的八字计算函数
export async function computeBaziWithCache(
  params: {
    datetime: string;
    gender: string;
    timezone: string;
  },
  computeFn: () => Promise<EnhancedBaziResult>
): Promise<EnhancedBaziResult | null> {
  const cache = BaziCache.getInstance();
  const { birthDate, birthTime } = extractBirthParts(params.datetime);

  if (!birthDate) {
    return await computeFn();
  }

  const cached = await cache.get(birthDate, birthTime, params.gender);
  if (cached) {
    return cached;
  }

  const result = await computeFn();
  if (result) {
    await cache.set(birthDate, birthTime, params.gender, result);
  }

  return result;
}

export class BaziCache {
  private static instance: BaziCache;
  private cache: SimpleCache<EnhancedBaziResult>;

  private constructor() {
    this.cache = new SimpleCache<EnhancedBaziResult>();
  }

  static getInstance(): BaziCache {
    if (!BaziCache.instance) {
      BaziCache.instance = new BaziCache();
    }
    return BaziCache.instance;
  }

  generateKey(birthDate: string, birthTime: string, gender: string): string {
    return `bazi:${birthDate}:${birthTime}:${gender}`;
  }

  async get(
    birthDate: string,
    birthTime: string,
    gender: string
  ): Promise<EnhancedBaziResult | null> {
    const key = this.generateKey(birthDate, birthTime, gender);
    return this.cache.get(key);
  }

  async set(
    birthDate: string,
    birthTime: string,
    gender: string,
    result: EnhancedBaziResult
  ): Promise<void> {
    const key = this.generateKey(birthDate, birthTime, gender);
    this.cache.set(key, result);
  }

  async delete(
    birthDate: string,
    birthTime: string,
    gender: string
  ): Promise<void> {
    const key = this.generateKey(birthDate, birthTime, gender);
    this.cache.delete(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
  }

  getStats(): { size: number } {
    return {
      size: this.cache.size(),
    };
  }
}
