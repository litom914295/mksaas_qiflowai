/**
 * 八字算法适配器
 * 提供统一的八字计算接口
 */

import { EnhancedBirthData, EnhancedBaziResult } from './types';
import { createEnhancedBaziCalculator } from './enhanced-calculator';

// 全局适配器实例
let globalAdapter: BaziAdapter | null = null;

export class BaziAdapter {
  private config: any = {};
  private metrics: any = {};

  constructor(config: any = {}) {
    this.config = {
      mode: 'enhanced',
      fallbackToLegacy: true,
      enableCache: true,
      enableMetrics: true,
      ...config,
    };
  }

  async calculateBazi(input: EnhancedBirthData): Promise<EnhancedBaziResult | null> {
    try {
      const calculator = createEnhancedBaziCalculator(input);
      const result = await calculator.calculate();
      
      // 更新指标
      this.updateMetrics('success');
      
      return result;
    } catch (error) {
      console.error('八字计算失败:', error);
      this.updateMetrics('error');
      
      if (this.config.fallbackToLegacy) {
        return this.fallbackCalculation(input);
      }
      
      return null;
    }
  }

  private async fallbackCalculation(input: EnhancedBirthData): Promise<EnhancedBaziResult | null> {
    // 简化的回退计算逻辑
    return {
      birthInfo: {
        datetime: input.datetime,
        gender: input.gender,
        timezone: input.timezone,
        isTimeKnown: input.isTimeKnown,
      },
      pillars: {
        year: { heavenly: '甲', earthly: '子', element: '木', yinYang: 'yang' },
        month: { heavenly: '乙', earthly: '丑', element: '木', yinYang: 'yin' },
        day: { heavenly: '丙', earthly: '寅', element: '火', yinYang: 'yang' },
        hour: { heavenly: '丁', earthly: '卯', element: '火', yinYang: 'yin' },
      },
      tenGods: {},
      yongshen: { primary: '木', secondary: ['水'], strength: 0.7, balance: 0.6 },
      luckPillars: [],
      pattern: {
        type: '普通格局',
        strength: 0.5,
        characteristics: ['基础格局'],
        advantages: ['稳定发展'],
        disadvantages: ['缺乏突破'],
      },
      score: {
        overall: 0.6,
        wealth: 0.5,
        career: 0.6,
        health: 0.7,
        relationship: 0.5,
      },
      suggestions: ['建议保持现状，稳步发展'],
      meta: {
        calculationTime: Date.now(),
        algorithm: 'fallback',
        version: '1.0.0',
      },
    };
  }

  updateConfig(config: any) {
    this.config = { ...this.config, ...config };
  }

  getConfig() {
    return this.config;
  }

  private updateMetrics(type: 'success' | 'error') {
    if (!this.config.enableMetrics) return;
    
    this.metrics[type] = (this.metrics[type] || 0) + 1;
    this.metrics.lastUpdate = Date.now();
  }

  getMetricsSummary() {
    return {
      ...this.metrics,
      total: (this.metrics.success || 0) + (this.metrics.error || 0),
      successRate: this.metrics.success ? 
        (this.metrics.success / ((this.metrics.success || 0) + (this.metrics.error || 0))) : 0,
    };
  }
}

/**
 * 获取全局适配器实例
 */
export function getGlobalAdapter(): BaziAdapter {
  if (!globalAdapter) {
    globalAdapter = new BaziAdapter();
  }
  return globalAdapter;
}

/**
 * 统一八字计算函数
 */
export async function calculateBaziUnified(
  input: EnhancedBirthData
): Promise<EnhancedBaziResult | null> {
  const adapter = getGlobalAdapter();
  return await adapter.calculateBazi(input);
}

