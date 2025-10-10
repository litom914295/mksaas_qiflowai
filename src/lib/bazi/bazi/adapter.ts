/**
 * QiFlow AI - 八字计算适配器
 *
 * 统一的新旧八字计算接口
 * 支持渐进式迁移和向后兼容
 */

import type {
  EnhancedBaziResult,
  EnhancedBirthData,
} from './enhanced-calculator';
// import type { BirthData } from './types'; // BirthData类型不存在，使用EnhancedBirthData
import {
  type EnhancedBaziCalculator,
  createEnhancedBaziCalculator,
} from './enhanced-calculator';

// 重新导出类型
export type { EnhancedBaziResult, EnhancedBirthData };

/**
 * 计算模式
 */
export type CalculationMode = 'enhanced' | 'hybrid';

/**
 * 适配器配置
 */
export interface AdapterConfig {
  mode: CalculationMode;
  fallbackToLegacy: boolean;
  enableCache: boolean;
  enableMetrics: boolean;
}

/**
 * 默认配置
 */
const DEFAULT_CONFIG: AdapterConfig = {
  mode: 'enhanced', // 默认使用增强模式
  fallbackToLegacy: false, // 不再支持降级
  enableCache: true,
  enableMetrics: false,
};

/**
 * 八字计算适配器
 *
 * 核心功能：
 * 1. 统一API接口
 * 2. 智能路由选择
 * 3. 错误处理
 * 4. 性能监控
 * 5. 缓存管理
 */
export class BaziCalculationAdapter {
  private config: AdapterConfig;
  private calculators: Map<string, EnhancedBaziCalculator> = new Map();
  private metrics: Map<string, any> = new Map();

  constructor(config: Partial<AdapterConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  /**
   * 计算八字（统一接口）
   */
  async calculate(
    birthData: EnhancedBirthData
  ): Promise<EnhancedBaziResult | null> {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey(birthData);

    try {
      // 检查缓存
      if (this.config.enableCache && this.config.mode !== 'hybrid') {
        const cached = this.getCachedResult(cacheKey);
        if (cached) {
          this.recordMetric('cache_hit', Date.now() - startTime);
          return cached;
        }
      }

      let result: EnhancedBaziResult | null = null;

      // 根据模式选择计算方式
      switch (this.config.mode) {
        default:
          result = await this.calculateHybrid(birthData);
          break;
      }

      // 缓存结果
      if (this.config.enableCache && result) {
        this.setCachedResult(cacheKey, result);
      }

      this.recordMetric('calculation_success', Date.now() - startTime);
      return result;
    } catch (error) {
      console.error('[BaziCalculationAdapter] 计算失败:', error);
      this.recordMetric('calculation_error', Date.now() - startTime);
      return null;
    }
  }

  /**
   * 传统计算模式（已移除）
   */
  private calculateLegacy(birthData: any): any {
    // 传统计算已移除，直接返回null表示失败
    return null;
  }

  /**
   * 增强计算模式
   */
  private async calculateEnhanced(
    birthData: EnhancedBirthData
  ): Promise<EnhancedBaziResult | null> {
    const calculator = this.getOrCreateCalculator(birthData);
    return await calculator.getCompleteAnalysis();
  }

  /**
   * 混合计算模式
   */
  private async calculateHybrid(
    birthData: EnhancedBirthData
  ): Promise<EnhancedBaziResult | null> {
    // 直接使用增强计算
    const enhancedData = this.convertToEnhancedData(birthData);
    return await this.calculateEnhanced(enhancedData);
  }

  /**
   * 获取或创建计算器实例
   */
  private getOrCreateCalculator(
    birthData: EnhancedBirthData
  ): EnhancedBaziCalculator {
    const key = this.generateCalculatorKey(birthData);

    if (!this.calculators.has(key)) {
      const calculator = createEnhancedBaziCalculator(birthData);
      this.calculators.set(key, calculator);
    }

    return this.calculators.get(key)!;
  }

  /**
   * 转换为增强数据格式
   */
  private convertToEnhancedData(data: EnhancedBirthData): EnhancedBirthData {
    // 数据已经是增强格式
    return data;
  }

  /**
   * 将传统结果转换为增强格式
   */
  private convertLegacyToEnhanced(
    legacyResult: any
  ): EnhancedBaziResult | null {
    if (!legacyResult) return null;

    return {
      ...legacyResult,
      // 添加增强功能的占位符
      luckPillars: [],
      dailyAnalysis: undefined,
      tenGodsAnalysis: undefined,
      interactions: [],
      dayMasterStrength: {
        strength: 'balanced',
        score: 0,
        factors: [],
        recommendations: [],
      },
      favorableElements: {
        primary: legacyResult.favorableElements || [],
        secondary: [],
        unfavorable: legacyResult.unfavorableElements || [],
        explanation: '',
      },
    };
  }

  /**
   * 生成缓存键
   */
  private generateCacheKey(birthData: EnhancedBirthData): string {
    return `${birthData.datetime}_${birthData.gender}_${birthData.timezone}_${birthData.isTimeKnown}`;
  }

  /**
   * 生成计算器键
   */
  private generateCalculatorKey(birthData: EnhancedBirthData): string {
    return `${birthData.datetime}_${birthData.gender}_${birthData.timezone}`;
  }

  /**
   * 获取缓存结果
   */
  private getCachedResult(key: string): any {
    // 这里可以实现更复杂的缓存策略
    return null; // 暂时不实现缓存
  }

  /**
   * 设置缓存结果
   */
  private setCachedResult(key: string, result: any): void {
    // 这里可以实现缓存存储
  }

  /**
   * 记录性能指标
   */
  private recordMetric(name: string, duration: number): void {
    if (!this.config.enableMetrics) {
      return;
    }

    const metrics = this.metrics.get(name) || [];
    metrics.push({ timestamp: Date.now(), duration });

    // 只保留最近100条记录
    if (metrics.length > 100) {
      metrics.shift();
    }

    this.metrics.set(name, metrics);
  }

  /**
   * 获取性能指标
   */
  getMetrics(): Record<string, any[]> {
    return Object.fromEntries(this.metrics);
  }

  /**
   * 获取指标统计
   */
  getMetricsSummary(): Record<string, any> {
    const summary: Record<string, any> = {};

    for (const [name, metrics] of this.metrics) {
      if (metrics.length === 0) continue;

      const durations = metrics.map((m: any) => m.duration);
      summary[name] = {
        count: metrics.length,
        avgDuration:
          durations.reduce((a: number, b: number) => a + b, 0) /
          durations.length,
        minDuration: Math.min(...durations),
        maxDuration: Math.max(...durations),
        lastDuration: durations[durations.length - 1],
      };
    }

    return summary;
  }

  /**
   * 清除缓存
   */
  clearCache(): void {
    this.calculators.clear();
    // 清除其他缓存
  }

  /**
   * 更新配置
   */
  updateConfig(config: Partial<AdapterConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * 获取当前配置
   */
  getConfig(): AdapterConfig {
    return { ...this.config };
  }
}

/**
 * 全局适配器实例
 */
let globalAdapter: BaziCalculationAdapter | null = null;

/**
 * 获取全局适配器实例
 */
export function getGlobalAdapter(): BaziCalculationAdapter {
  if (!globalAdapter) {
    globalAdapter = new BaziCalculationAdapter({
      mode: 'enhanced',
      fallbackToLegacy: false,
      enableCache: true,
      enableMetrics: process.env.NODE_ENV === 'development',
    });
  }

  return globalAdapter;
}

/**
 * 设置全局适配器配置
 */
export function configureAdapter(config: Partial<AdapterConfig>): void {
  if (globalAdapter) {
    globalAdapter.updateConfig(config);
  } else {
    globalAdapter = new BaziCalculationAdapter(config);
  }
}

/**
 * 便捷计算函数（使用全局适配器）
 */
export async function calculateBaziUnified(
  birthData: EnhancedBirthData
): Promise<EnhancedBaziResult | null> {
  const adapter = getGlobalAdapter();
  return await adapter.calculate(birthData);
}

/**
 * 批量计算八字
 */
export async function calculateBaziBatch(
  birthDataList: EnhancedBirthData[]
): Promise<(EnhancedBaziResult | null)[]> {
  const adapter = getGlobalAdapter();
  const results = await Promise.allSettled(
    birthDataList.map((data) => adapter.calculate(data))
  );

  return results.map((result) =>
    result.status === 'fulfilled' ? result.value : null
  );
}

/**
 * 健康检查
 */
export async function healthCheck(): Promise<{
  status: 'healthy' | 'degraded' | 'unhealthy';
  details: Record<string, any>;
}> {
  const adapter = getGlobalAdapter();
  const metrics = adapter.getMetricsSummary();

  try {
    // 测试基本功能
    const testResult = await adapter.calculate({
      datetime: '1990-05-10T12:30:00',
      gender: 'male',
      timezone: 'Asia/Shanghai',
      isTimeKnown: true,
    });

    const status = testResult ? 'healthy' : 'degraded';

    return {
      status,
      details: {
        adapter_config: adapter.getConfig(),
        metrics,
        test_calculation: !!testResult,
        cache_size: 0, // 可以扩展
      },
    };
  } catch (error) {
    return {
      status: 'unhealthy',
      details: {
        error: error instanceof Error ? error.message : '未知错误',
        metrics,
      },
    };
  }
}
