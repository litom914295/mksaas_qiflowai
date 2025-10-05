/**
 * QiFlow AI - 八字计算缓存系统
 *
 * 提供高性能的缓存功能
 * 支持内存缓存和持久化缓存
 */

import type { EnhancedBaziResult } from './enhanced-calculator';

export interface CacheEntry<T = any> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
  accessCount: number;
  lastAccessed: number;
  size: number; // Estimated size in bytes
}

export interface CacheStats {
  hits: number;
  misses: number;
  evictions: number;
  size: number;
  entries: number;
  hitRate: number;
}

/**
 * LRU缓存实现
 */
export class LRUCache<T = any> {
  private cache = new Map<string, CacheEntry<T>>();
  private maxSize: number;
  private maxEntries: number;
  private stats: CacheStats = {
    hits: 0,
    misses: 0,
    evictions: 0,
    size: 0,
    entries: 0,
    hitRate: 0,
  };

  constructor(maxSize: number = 50 * 1024 * 1024, maxEntries = 1000) {
    // 默认50MB内存限制，1000个条目限制
    this.maxSize = maxSize;
    this.maxEntries = maxEntries;
  }

  /**
   * 获取缓存项
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      return null;
    }

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.stats.misses++;
      this.updateStats();
      return null;
    }

    // 更新访问统计
    entry.accessCount++;
    entry.lastAccessed = Date.now();

    this.stats.hits++;
    this.updateStats();

    return entry.data;
  }

  /**
   * 设置缓存项
   */
  set(key: string, value: T, ttl: number = 30 * 60 * 1000): boolean {
    const size = this.estimateSize(value);

    // 检查是否超过大小限制
    if (size > this.maxSize) {
      return false; // 太大，无法缓存
    }

    const entry: CacheEntry<T> = {
      data: value,
      timestamp: Date.now(),
      ttl,
      accessCount: 0,
      lastAccessed: Date.now(),
      size,
    };

    // 如果键已存在，先删除旧的
    if (this.cache.has(key)) {
      const oldEntry = this.cache.get(key)!;
      this.stats.size -= oldEntry.size;
    }

    this.cache.set(key, entry);
    this.stats.size += size;
    this.stats.entries = this.cache.size;

    // 执行清理策略
    this.evictIfNeeded();

    this.updateStats();
    return true;
  }

  /**
   * 删除缓存项
   */
  delete(key: string): boolean {
    const entry = this.cache.get(key);
    if (entry) {
      this.stats.size -= entry.size;
      this.cache.delete(key);
      this.stats.entries = this.cache.size;
      this.updateStats();
      return true;
    }
    return false;
  }

  /**
   * 清空缓存
   */
  clear(): void {
    this.cache.clear();
    this.stats.size = 0;
    this.stats.entries = 0;
    this.updateStats();
  }

  /**
   * 检查键是否存在
   */
  has(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;

    // 检查是否过期
    if (Date.now() - entry.timestamp > entry.ttl) {
      this.cache.delete(key);
      this.stats.evictions++;
      this.updateStats();
      return false;
    }

    return true;
  }

  /**
   * 获取缓存统计信息
   */
  getStats(): CacheStats {
    return { ...this.stats };
  }

  /**
   * 获取所有键
   */
  keys(): string[] {
    return Array.from(this.cache.keys());
  }

  /**
   * 获取缓存大小
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * 估算对象大小
   */
  private estimateSize(obj: any): number {
    const str = JSON.stringify(obj);
    return str ? str.length * 2 : 0; // UTF-16每个字符2字节
  }

  /**
   * LRU清理策略
   */
  private evictIfNeeded(): void {
    // 首先检查条目数量
    while (this.cache.size > this.maxEntries) {
      this.evictLRU();
    }

    // 然后检查内存大小
    while (this.stats.size > this.maxSize && this.cache.size > 0) {
      this.evictLRU();
    }
  }

  /**
   * 移除最少使用的条目
   */
  private evictLRU(): void {
    let lruKey: string | null = null;
    let lruTime = Date.now();

    for (const [key, entry] of this.cache) {
      if (entry.lastAccessed < lruTime) {
        lruTime = entry.lastAccessed;
        lruKey = key;
      }
    }

    if (lruKey) {
      const entry = this.cache.get(lruKey)!;
      this.stats.size -= entry.size;
      this.cache.delete(lruKey);
      this.stats.evictions++;
    }
  }

  /**
   * 更新统计信息
   */
  private updateStats(): void {
    const total = this.stats.hits + this.stats.misses;
    this.stats.hitRate = total > 0 ? this.stats.hits / total : 0;
  }
}

/**
 * 八字计算专用缓存
 */
export class BaziCache {
  private cache: LRUCache;
  private static instance: BaziCache | null = null;

  constructor(maxSize: number = 100 * 1024 * 1024, maxEntries = 2000) {
    // 默认100MB，2000个条目
    this.cache = new LRUCache(maxSize, maxEntries);
  }

  static getInstance(): BaziCache {
    if (!BaziCache.instance) {
      BaziCache.instance = new BaziCache();
    }
    return BaziCache.instance;
  }

  /**
   * 生成八字计算缓存键
   */
  generateKey(birthData: any, type = 'analysis'): string {
    const data = {
      datetime: birthData.datetime,
      gender: birthData.gender,
      timezone: birthData.timezone || 'Asia/Shanghai',
      isTimeKnown: birthData.isTimeKnown ?? true,
    };

    return `${type}_${JSON.stringify(data)}`;
  }

  /**
   * 获取缓存的分析结果
   */
  getAnalysis(birthData: any): EnhancedBaziResult | null {
    const key = this.generateKey(birthData, 'analysis');
    return this.cache.get(key);
  }

  /**
   * 缓存分析结果
   */
  setAnalysis(
    birthData: any,
    result: EnhancedBaziResult,
    ttl?: number
  ): boolean {
    const key = this.generateKey(birthData, 'analysis');
    return this.cache.set(key, result, ttl);
  }

  /**
   * 获取缓存的大运分析
   */
  getLuckPillars(birthData: any): any {
    const key = this.generateKey(birthData, 'luck_pillars');
    return this.cache.get(key);
  }

  /**
   * 缓存大运分析
   */
  setLuckPillars(birthData: any, result: any, ttl?: number): boolean {
    const key = this.generateKey(birthData, 'luck_pillars');
    return this.cache.set(key, result, ttl);
  }

  /**
   * 获取缓存的每日分析
   */
  getDailyAnalysis(birthData: any, targetDate: Date): any {
    const key = `${this.generateKey(birthData, 'daily')}_${targetDate.toISOString()}`;
    return this.cache.get(key);
  }

  /**
   * 缓存每日分析
   */
  setDailyAnalysis(
    birthData: any,
    targetDate: Date,
    result: any,
    ttl?: number
  ): boolean {
    const key = `${this.generateKey(birthData, 'daily')}_${targetDate.toISOString()}`;
    return this.cache.set(key, result, ttl);
  }

  /**
   * 清除指定出生数据的缓存
   */
  clearBirthDataCache(birthData: any): void {
    const baseKey = this.generateKey(birthData, '');
    const keysToDelete: string[] = [];

    // 查找所有相关缓存键
    for (const key of this.cache.keys()) {
      if (key.startsWith(baseKey)) {
        keysToDelete.push(key);
      }
    }

    // 删除相关缓存
    keysToDelete.forEach((key) => this.cache.delete(key));
  }

  /**
   * 获取缓存统计
   */
  getStats() {
    return this.cache.getStats();
  }

  /**
   * 清空所有缓存
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * 设置缓存配置
   */
  configure(maxSize?: number, maxEntries?: number): void {
    if (maxSize !== undefined || maxEntries !== undefined) {
      const newMaxSize = maxSize || 100 * 1024 * 1024;
      const newMaxEntries = maxEntries || 2000;
      this.cache = new LRUCache(newMaxSize, newMaxEntries);
    }
  }
}

/**
 * 性能监控器
 */
export class PerformanceMonitor {
  private metrics: Map<
    string,
    {
      count: number;
      totalTime: number;
      minTime: number;
      maxTime: number;
      lastTime: number;
    }
  > = new Map();

  private startTimes: Map<string, number> = new Map();

  /**
   * 开始计时
   */
  start(operation: string): void {
    this.startTimes.set(operation, Date.now());
  }

  /**
   * 结束计时
   */
  end(operation: string): number {
    const startTime = this.startTimes.get(operation);
    if (!startTime) {
      console.warn(`[PerformanceMonitor] 未找到操作开始时间: ${operation}`);
      return 0;
    }

    const duration = Date.now() - startTime;
    this.startTimes.delete(operation);

    this.recordMetric(operation, duration);
    return duration;
  }

  /**
   * 记录指标
   */
  recordMetric(operation: string, duration: number): void {
    const existing = this.metrics.get(operation);

    if (existing) {
      existing.count++;
      existing.totalTime += duration;
      existing.minTime = Math.min(existing.minTime, duration);
      existing.maxTime = Math.max(existing.maxTime, duration);
      existing.lastTime = duration;
    } else {
      this.metrics.set(operation, {
        count: 1,
        totalTime: duration,
        minTime: duration,
        maxTime: duration,
        lastTime: duration,
      });
    }
  }

  /**
   * 获取操作统计
   */
  getOperationStats(operation: string): {
    count: number;
    averageTime: number;
    minTime: number;
    maxTime: number;
    lastTime: number;
  } | null {
    const metric = this.metrics.get(operation);
    if (!metric) return null;

    return {
      count: metric.count,
      averageTime: metric.totalTime / metric.count,
      minTime: metric.minTime,
      maxTime: metric.maxTime,
      lastTime: metric.lastTime,
    };
  }

  /**
   * 获取所有统计
   */
  getAllStats(): Record<string, any> {
    const stats: Record<string, any> = {};

    for (const [operation, metric] of this.metrics) {
      stats[operation] = {
        count: metric.count,
        averageTime: Math.round(metric.totalTime / metric.count),
        minTime: metric.minTime,
        maxTime: metric.maxTime,
        lastTime: metric.lastTime,
      };
    }

    return stats;
  }

  /**
   * 清除统计
   */
  clear(): void {
    this.metrics.clear();
    this.startTimes.clear();
  }

  /**
   * 导出性能报告
   */
  generateReport(): {
    summary: {
      totalOperations: number;
      totalTime: number;
      averageTime: number;
    };
    operations: Record<string, any>;
  } {
    const operations = this.getAllStats();
    const operationNames = Object.keys(operations);

    const totalOperations = operationNames.reduce(
      (sum, op) => sum + operations[op].count,
      0
    );
    const totalTime = operationNames.reduce(
      (sum, op) => sum + operations[op].averageTime * operations[op].count,
      0
    );
    const averageTime = totalOperations > 0 ? totalTime / totalOperations : 0;

    return {
      summary: {
        totalOperations,
        totalTime: Math.round(totalTime),
        averageTime: Math.round(averageTime),
      },
      operations,
    };
  }
}

/**
 * 全局缓存实例
 */
export const globalBaziCache = BaziCache.getInstance();

/**
 * 全局性能监控器
 */
export const globalPerformanceMonitor = new PerformanceMonitor();

/**
 * 便捷的缓存操作函数
 */
export const baziCache = {
  get: (birthData: any) => globalBaziCache.getAnalysis(birthData),
  set: (birthData: any, result: EnhancedBaziResult, ttl?: number) =>
    globalBaziCache.setAnalysis(birthData, result, ttl),
  clear: () => globalBaziCache.clear(),
  stats: () => globalBaziCache.getStats(),
};

/**
 * 便捷的性能监控函数
 */
export const performanceMonitor = {
  start: (operation: string) => globalPerformanceMonitor.start(operation),
  end: (operation: string) => globalPerformanceMonitor.end(operation),
  stats: (operation?: string) =>
    operation
      ? globalPerformanceMonitor.getOperationStats(operation)
      : globalPerformanceMonitor.getAllStats(),
  report: () => globalPerformanceMonitor.generateReport(),
  clear: () => globalPerformanceMonitor.clear(),
};
