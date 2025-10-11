/**
 * 八字计算缓存适配器
 * 为八字核心计算提供缓存支持
 */

import { MemoryCache, baziCache } from './memory-cache';
import type { 
  BaziDate, 
  BaziResult,
  WuXingAnalysis,
  YongShenResult,
  PatternResult,
  ShenshaResult,
  DayunPeriod
} from '../types';

/**
 * 八字计算缓存适配器
 */
export class BaziCacheAdapter {
  private cache: MemoryCache;
  private enableCache: boolean = true;
  
  constructor(cache?: MemoryCache) {
    this.cache = cache || baziCache;
  }
  
  /**
   * 启用/禁用缓存
   */
  setEnabled(enabled: boolean): void {
    this.enableCache = enabled;
  }
  
  /**
   * 获取四柱计算缓存
   */
  async getFourPillars(
    date: BaziDate,
    calculator: (date: BaziDate) => Promise<BaziResult>
  ): Promise<BaziResult> {
    if (!this.enableCache) {
      return calculator(date);
    }
    
    const key = this.generateDateKey('fourPillars', date);
    return this.cache.getOrSet(key, () => calculator(date));
  }
  
  /**
   * 获取五行分析缓存
   */
  async getWuXingAnalysis(
    baziResult: BaziResult,
    analyzer: (result: BaziResult) => Promise<WuXingAnalysis>
  ): Promise<WuXingAnalysis> {
    if (!this.enableCache) {
      return analyzer(baziResult);
    }
    
    const key = this.generateBaziKey('wuxing', baziResult);
    return this.cache.getOrSet(key, () => analyzer(baziResult));
  }
  
  /**
   * 获取用神判定缓存
   */
  async getYongShen(
    baziResult: BaziResult,
    wuxing: WuXingAnalysis,
    analyzer: (result: BaziResult, wuxing: WuXingAnalysis) => Promise<YongShenResult>
  ): Promise<YongShenResult> {
    if (!this.enableCache) {
      return analyzer(baziResult, wuxing);
    }
    
    const key = this.generateBaziKey('yongshen', baziResult);
    return this.cache.getOrSet(key, () => analyzer(baziResult, wuxing));
  }
  
  /**
   * 获取格局识别缓存
   */
  async getPattern(
    baziResult: BaziResult,
    wuxing: WuXingAnalysis,
    detector: (result: BaziResult, wuxing: WuXingAnalysis) => Promise<PatternResult>
  ): Promise<PatternResult> {
    if (!this.enableCache) {
      return detector(baziResult, wuxing);
    }
    
    const key = this.generateBaziKey('pattern', baziResult);
    return this.cache.getOrSet(key, () => detector(baziResult, wuxing));
  }
  
  /**
   * 获取神煞计算缓存
   */
  async getShensha(
    baziResult: BaziResult,
    calculator: (result: BaziResult) => Promise<ShenshaResult>
  ): Promise<ShenshaResult> {
    if (!this.enableCache) {
      return calculator(baziResult);
    }
    
    const key = this.generateBaziKey('shensha', baziResult);
    return this.cache.getOrSet(key, () => calculator(baziResult));
  }
  
  /**
   * 获取大运流年缓存
   */
  async getDayunLiunian(
    baziResult: BaziResult,
    calculator: (result: BaziResult) => Promise<DayunPeriod[]>
  ): Promise<DayunPeriod[]> {
    if (!this.enableCache) {
      return calculator(baziResult);
    }
    
    const key = this.generateBaziKey('dayun', baziResult);
    return this.cache.getOrSet(key, () => calculator(baziResult));
  }
  
  /**
   * 批量预热缓存
   */
  async warmupCache(dates: BaziDate[]): Promise<void> {
    const keys = dates.map(date => 
      this.generateDateKey('fourPillars', date)
    );
    
    // 这里可以批量加载常用日期的计算结果
    console.log(`预热缓存: ${keys.length} 个日期`);
  }
  
  /**
   * 清理特定类型的缓存
   */
  clearCacheByType(type: 'fourPillars' | 'wuxing' | 'yongshen' | 'pattern' | 'shensha' | 'dayun'): void {
    // 由于没有按前缀清理的功能，这里暂时清空全部
    // 实际应用中可以维护一个键值索引
    this.cache.clear();
  }
  
  /**
   * 获取缓存统计信息
   */
  getCacheStats() {
    return this.cache.getStats();
  }
  
  /**
   * 生成日期缓存键
   */
  private generateDateKey(prefix: string, date: BaziDate): string {
    return MemoryCache.generateKey({
      type: prefix,
      year: date.year,
      month: date.month,
      day: date.day,
      hour: date.hour,
      minute: date.minute || 0,
      isLunar: date.isLunar
    });
  }
  
  /**
   * 生成八字结果缓存键
   */
  private generateBaziKey(prefix: string, result: BaziResult): string {
    return MemoryCache.generateKey({
      type: prefix,
      yearPillar: result.yearPillar,
      monthPillar: result.monthPillar,
      dayPillar: result.dayPillar,
      hourPillar: result.hourPillar
    });
  }
}

// 创建全局单例
export const baziCacheAdapter = new BaziCacheAdapter();

/**
 * 缓存中间件
 * 用于API路由
 */
export function withCache<T extends (...args: any[]) => any>(
  fn: T,
  options?: {
    ttl?: number;
    keyGenerator?: (...args: Parameters<T>) => string;
  }
): T {
  return (async (...args: Parameters<T>) => {
    const key = options?.keyGenerator 
      ? options.keyGenerator(...args)
      : MemoryCache.generateKey({ fn: fn.name, args });
    
    return baziCache.getOrSet(key, () => fn(...args));
  }) as T;
}

/**
 * 性能监控装饰器
 */
export function Monitor(name?: string) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const method = descriptor.value;
    const methodName = name || propertyName;
    
    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      
      try {
        const result = await method.apply(this, args);
        const duration = performance.now() - start;
        
        // 记录性能数据
        console.log(`[Performance] ${methodName}: ${duration.toFixed(2)}ms`);
        
        // 如果执行时间超过阈值，记录警告
        if (duration > 100) {
          console.warn(`[Performance Warning] ${methodName} took ${duration.toFixed(2)}ms`);
        }
        
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        console.error(`[Performance Error] ${methodName}: ${duration.toFixed(2)}ms`, error);
        throw error;
      }
    };
    
    return descriptor;
  };
}

/**
 * 结果验证器
 * 确保缓存的数据完整性
 */
export class CacheValidator {
  /**
   * 验证八字结果
   */
  static validateBaziResult(result: any): result is BaziResult {
    return result &&
      typeof result === 'object' &&
      'yearPillar' in result &&
      'monthPillar' in result &&
      'dayPillar' in result &&
      'hourPillar' in result;
  }
  
  /**
   * 验证五行分析结果
   */
  static validateWuXingAnalysis(result: any): result is WuXingAnalysis {
    return result &&
      typeof result === 'object' &&
      'elements' in result &&
      'dayMaster' in result;
  }
  
  /**
   * 验证缓存数据
   */
  static validateCacheData<T>(
    data: any,
    validator: (data: any) => data is T
  ): T | null {
    if (validator(data)) {
      return data;
    }
    
    console.warn('[Cache] Invalid data detected, returning null');
    return null;
  }
}

/**
 * 性能优化建议
 */
export class PerformanceOptimizer {
  private metrics: Map<string, number[]> = new Map();
  
  /**
   * 记录性能指标
   */
  record(operation: string, duration: number): void {
    if (!this.metrics.has(operation)) {
      this.metrics.set(operation, []);
    }
    
    const durations = this.metrics.get(operation)!;
    durations.push(duration);
    
    // 只保留最近100次记录
    if (durations.length > 100) {
      durations.shift();
    }
  }
  
  /**
   * 获取性能报告
   */
  getReport() {
    const report: Record<string, any> = {};
    
    for (const [operation, durations] of this.metrics.entries()) {
      const avg = durations.reduce((a, b) => a + b, 0) / durations.length;
      const max = Math.max(...durations);
      const min = Math.min(...durations);
      
      report[operation] = {
        avg: avg.toFixed(2),
        max: max.toFixed(2),
        min: min.toFixed(2),
        count: durations.length,
        recommendation: this.getRecommendation(avg, max)
      };
    }
    
    return report;
  }
  
  /**
   * 获取优化建议
   */
  private getRecommendation(avg: number, max: number): string {
    if (avg > 200) {
      return '建议增加缓存或优化算法';
    } else if (max > 500) {
      return '存在性能尖峰，建议检查边界情况';
    } else if (avg > 100) {
      return '性能尚可，可考虑预计算优化';
    }
    
    return '性能良好';
  }
}

// 创建全局性能优化器
export const performanceOptimizer = new PerformanceOptimizer();