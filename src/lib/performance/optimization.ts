/**
 * 性能优化工具集
 *
 * 功能：
 * 1. 请求缓存管理
 * 2. 结果记忆化
 * 3. 并行处理优化
 * 4. 性能监控和指标收集
 */

import { type NextRequest, NextResponse } from 'next/server';

// ===== 1. 缓存管理 =====

interface CacheOptions {
  ttl?: number; // 存活时间（毫秒）
  maxSize?: number; // 最大缓存条目数
  keyGenerator?: (req: NextRequest) => string;
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
  hits: number;
}

class LRUCache<T> {
  private cache: Map<string, CacheEntry<T>>;
  private maxSize: number;
  private ttl: number;
  private stats: {
    hits: number;
    misses: number;
    evictions: number;
  };

  constructor(maxSize = 100, ttl: number = 5 * 60 * 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
    this.ttl = ttl;
    this.stats = { hits: 0, misses: 0, evictions: 0 };
  }

  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      return null;
    }

    // 更新命中次数
    entry.hits++;
    this.stats.hits++;

    // 更新访问顺序（移到末尾）
    this.cache.delete(key);
    this.cache.set(key, entry);

    return entry.data;
  }

  set(key: string, data: T): void {
    // 如果已存在，先删除
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }

    // 如果超过最大容量，删除最久未使用的
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
        this.stats.evictions++;
      }
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      hits: 0,
    });
  }

  clear(): void {
    this.cache.clear();
  }

  getStats() {
    const hitRate =
      this.stats.hits / (this.stats.hits + this.stats.misses) || 0;
    return {
      ...this.stats,
      size: this.cache.size,
      hitRate: (hitRate * 100).toFixed(2) + '%',
    };
  }
}

// 全局缓存实例
const responseCache = new LRUCache<any>(200, 5 * 60 * 1000); // 5分钟TTL

/**
 * 生成缓存键
 */
export function generateCacheKey(req: NextRequest, bodyHash?: string): string {
  const url = req.url;
  const method = req.method;
  return `${method}:${url}:${bodyHash || ''}`;
}

/**
 * 计算请求体哈希（简单版）
 */
export function hashRequestBody(body: any): string {
  return JSON.stringify(body)
    .split('')
    .reduce((hash, char) => {
      const chr = char.charCodeAt(0);
      hash = (hash << 5) - hash + chr;
      return hash & hash;
    }, 0)
    .toString(36);
}

/**
 * 带缓存的API包装器
 */
export function withCache<T>(
  handler: (req: NextRequest, body: any) => Promise<T>,
  options: CacheOptions = {}
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    try {
      const body = await req.json();
      const bodyHash = hashRequestBody(body);
      const cacheKey = generateCacheKey(req, bodyHash);

      // 尝试从缓存获取
      const cached = responseCache.get(cacheKey);
      if (cached) {
        return NextResponse.json({
          ...cached,
          meta: {
            ...cached.meta,
            cached: true,
            cacheStats: responseCache.getStats(),
          },
        });
      }

      // 执行处理器
      const result = await handler(req, body);

      // 存入缓存
      responseCache.set(cacheKey, result);

      return NextResponse.json({
        ...result,
        meta: {
          ...(result as any).meta,
          cached: false,
        },
      });
    } catch (error) {
      console.error('Cache wrapper error:', error);
      throw error;
    }
  };
}

/**
 * 清除缓存
 */
export function clearCache(): void {
  responseCache.clear();
}

/**
 * 获取缓存统计
 */
export function getCacheStats() {
  return responseCache.getStats();
}

// ===== 2. 函数记忆化 =====

interface MemoOptions {
  maxAge?: number;
  maxSize?: number;
}

/**
 * 函数记忆化装饰器
 */
export function memoize<T extends (...args: any[]) => any>(
  fn: T,
  options: MemoOptions = {}
): T {
  const cache = new LRUCache<ReturnType<T>>(
    options.maxSize || 100,
    options.maxAge || 60000
  );

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = JSON.stringify(args);
    const cached = cache.get(key);

    if (cached !== null) {
      return cached;
    }

    const result = fn(...args);
    cache.set(key, result);

    return result;
  }) as T;
}

// ===== 3. 并行处理优化 =====

/**
 * 批量并行执行任务，带并发控制
 */
export async function parallelMap<T, R>(
  items: T[],
  fn: (item: T) => Promise<R>,
  concurrency = 5
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const promise = fn(item).then((result) => {
      results.push(result);
    });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
      // 移除已完成的
      executing.splice(
        executing.findIndex((p) => p === promise),
        1
      );
    }
  }

  await Promise.all(executing);
  return results;
}

/**
 * 带超时的Promise
 */
export function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMsg = 'Operation timed out'
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(() => reject(new Error(errorMsg)), timeoutMs)
    ),
  ]);
}

// ===== 4. 性能监控 =====

interface PerformanceMetrics {
  endpoint: string;
  duration: number;
  timestamp: number;
  success: boolean;
  statusCode: number;
  memoryUsage?: NodeJS.MemoryUsage;
}

class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private maxMetrics = 1000;

  record(metric: PerformanceMetrics): void {
    this.metrics.push(metric);

    // 保持固定大小
    if (this.metrics.length > this.maxMetrics) {
      this.metrics.shift();
    }
  }

  getMetrics(endpoint?: string): PerformanceMetrics[] {
    if (endpoint) {
      return this.metrics.filter((m) => m.endpoint === endpoint);
    }
    return this.metrics;
  }

  getAggregated(endpoint: string) {
    const endpointMetrics = this.getMetrics(endpoint);

    if (endpointMetrics.length === 0) {
      return null;
    }

    const durations = endpointMetrics.map((m) => m.duration);
    const successCount = endpointMetrics.filter((m) => m.success).length;

    const sorted = durations.sort((a, b) => a - b);

    return {
      endpoint,
      count: endpointMetrics.length,
      successRate: (successCount / endpointMetrics.length) * 100,
      avgDuration: durations.reduce((a, b) => a + b, 0) / durations.length,
      minDuration: sorted[0],
      maxDuration: sorted[sorted.length - 1],
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
      p99: sorted[Math.floor(sorted.length * 0.99)],
    };
  }

  clear(): void {
    this.metrics = [];
  }
}

const performanceMonitor = new PerformanceMonitor();

/**
 * 性能监控中间件
 */
export function withPerformanceMonitoring<T>(
  handler: (req: NextRequest, body: any) => Promise<T>,
  endpoint: string
): (req: NextRequest) => Promise<NextResponse> {
  return async (req: NextRequest): Promise<NextResponse> => {
    const startTime = Date.now();
    const startMemory = process.memoryUsage();

    try {
      const body = await req.json();
      const result = await handler(req, body);

      const duration = Date.now() - startTime;
      const endMemory = process.memoryUsage();

      performanceMonitor.record({
        endpoint,
        duration,
        timestamp: Date.now(),
        success: true,
        statusCode: 200,
        memoryUsage: {
          rss: endMemory.rss - startMemory.rss,
          heapTotal: endMemory.heapTotal - startMemory.heapTotal,
          heapUsed: endMemory.heapUsed - startMemory.heapUsed,
          external: endMemory.external - startMemory.external,
          arrayBuffers: 0,
        },
      });

      return NextResponse.json({
        ...result,
        meta: {
          ...(result as any).meta,
          performance: {
            duration,
            memoryDelta:
              (endMemory.heapUsed - startMemory.heapUsed) / 1024 / 1024,
          },
        },
      });
    } catch (error) {
      const duration = Date.now() - startTime;

      performanceMonitor.record({
        endpoint,
        duration,
        timestamp: Date.now(),
        success: false,
        statusCode: 500,
      });

      throw error;
    }
  };
}

/**
 * 获取性能统计
 */
export function getPerformanceStats(endpoint?: string) {
  if (endpoint) {
    return performanceMonitor.getAggregated(endpoint);
  }

  const endpoints = [
    '/api/xuankong/diagnose',
    '/api/xuankong/remedy-plans',
    '/api/xuankong/comprehensive-analysis',
  ];

  return endpoints
    .map((ep) => performanceMonitor.getAggregated(ep))
    .filter(Boolean);
}

// ===== 5. 智能预加载 =====

/**
 * 预测并预加载常用参数组合
 */
export class PreloadManager {
  private commonPatterns: Map<string, number> = new Map();

  recordPattern(pattern: string): void {
    const count = this.commonPatterns.get(pattern) || 0;
    this.commonPatterns.set(pattern, count + 1);
  }

  getTopPatterns(limit = 5): string[] {
    return Array.from(this.commonPatterns.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([pattern]) => pattern);
  }

  shouldPreload(pattern: string, threshold = 3): boolean {
    return (this.commonPatterns.get(pattern) || 0) >= threshold;
  }
}

// ===== 6. 资源池管理 =====

/**
 * 通用资源池
 */
export class ResourcePool<T> {
  private available: T[] = [];
  private inUse: Set<T> = new Set();
  private factory: () => Promise<T>;
  private maxSize: number;

  constructor(factory: () => Promise<T>, maxSize = 10) {
    this.factory = factory;
    this.maxSize = maxSize;
  }

  async acquire(): Promise<T> {
    // 如果有可用资源，直接返回
    if (this.available.length > 0) {
      const resource = this.available.pop()!;
      this.inUse.add(resource);
      return resource;
    }

    // 如果未达到最大容量，创建新资源
    if (this.inUse.size < this.maxSize) {
      const resource = await this.factory();
      this.inUse.add(resource);
      return resource;
    }

    // 等待资源释放
    return new Promise((resolve) => {
      const interval = setInterval(() => {
        if (this.available.length > 0) {
          clearInterval(interval);
          const resource = this.available.pop()!;
          this.inUse.add(resource);
          resolve(resource);
        }
      }, 100);
    });
  }

  release(resource: T): void {
    this.inUse.delete(resource);
    this.available.push(resource);
  }

  getStats() {
    return {
      available: this.available.length,
      inUse: this.inUse.size,
      total: this.available.length + this.inUse.size,
    };
  }
}

// ===== 导出组合优化函数 =====

/**
 * 组合所有优化策略
 */
export function withOptimizations<T>(
  handler: (req: NextRequest, body: any) => Promise<T>,
  endpoint: string,
  options: {
    enableCache?: boolean;
    enableMonitoring?: boolean;
    timeout?: number;
  } = {}
): (req: NextRequest) => Promise<NextResponse> {
  let optimizedHandler = handler;

  // 添加超时
  if (options.timeout) {
    const originalHandler = optimizedHandler;
    optimizedHandler = async (req, body) =>
      withTimeout(
        originalHandler(req, body),
        options.timeout!,
        `${endpoint} 超时`
      );
  }

  // 添加监控
  if (options.enableMonitoring !== false) {
    const currentHandler = optimizedHandler;
    optimizedHandler = async (req, body) => {
      const wrapped = withPerformanceMonitoring(
        currentHandler as any,
        endpoint
      );
      return (wrapped as any)(req);
    };
  }

  // 添加缓存
  if (options.enableCache !== false) {
    const currentHandler = optimizedHandler;
    optimizedHandler = async (req, body) => {
      const wrapped = withCache(currentHandler as any);
      return (wrapped as any)(req);
    };
  }

  return async (req: NextRequest) => {
    try {
      const body = await req.json();
      const result = await optimizedHandler(req, body);
      return NextResponse.json(result);
    } catch (error) {
      console.error(`${endpoint} error:`, error);
      return NextResponse.json(
        {
          success: false,
          error: error instanceof Error ? error.message : '未知错误',
        },
        { status: 500 }
      );
    }
  };
}
