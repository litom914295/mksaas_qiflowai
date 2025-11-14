/**
 * QiFlow AI - 八字计算主入口
 *
 * 基于增强型八字计算引擎的专业级八字分析服务
 * 提供高精度、专业级的八字命理分析能力
 */

import {
  type EnhancedBaziResult,
  type EnhancedBirthData,
  calculateBaziUnified,
  getGlobalAdapter,
} from './adapter';
import { createEnhancedBaziCalculator } from './enhanced-calculator';

const isBaziDebugEnabled =
  process.env.NODE_ENV === 'development' || process.env.BAZI_DEBUG === 'true';

const debugLog = (...args: any[]) => {
  if (isBaziDebugEnabled) {
    console.log(...args);
  }
};

const debugWarn = (...args: any[]) => {
  if (isBaziDebugEnabled) {
    console.warn(...args);
  }
};

/**
 * 智能八字计算函数（默认走极速路径，保证首屏秒开）
 *
 * 历史上为追求精度，优先调用专业版计算器（integrate-pro），
 * 但在开发/低配环境或网络不稳定时会显著拖慢首屏。
 *
 * 现在策略调整为：默认使用统一标准版（本地极速）以确保即时渲染；
 * 如需启用专业版，可在后续流程中另行触发升级计算。
 */
export async function computeBaziSmart(
  input: EnhancedBirthData
): Promise<EnhancedBaziResult | null> {
  // 极速路径：本地统一计算，稳定且快速
  return await calculateBaziUnified(input);
}

/**
 * 增强版八字计算函数
 */
export async function computeBaziEnhanced(
  input: EnhancedBirthData
): Promise<EnhancedBaziResult | null> {
  return await calculateBaziUnified(input);
}

/**
 * 创建增强型计算器实例
 */
export function createBaziCalculator(input: EnhancedBirthData) {
  return createEnhancedBaziCalculator(input);
}

/**
 * 获取全局适配器实例
 */
export function getBaziAdapter() {
  return getGlobalAdapter();
}

/**
 * 配置八字计算系统
 */
export function configureBaziSystem(config: {
  mode?: 'enhanced' | 'hybrid';
  fallbackToLegacy?: boolean;
  enableCache?: boolean;
  enableMetrics?: boolean;
}) {
  const adapter = getGlobalAdapter();
  adapter.updateConfig(config as any);
}

/**
 * 八字计算系统健康检查
 */
export async function checkBaziSystemHealth() {
  const adapter = getGlobalAdapter();

  try {
    // 测试增强算法
    const enhancedResult = await computeBaziSmart({
      datetime: '1990-05-10T12:30:00',
      gender: 'male',
      timezone: 'Asia/Shanghai',
      isTimeKnown: true,
    });

    return {
      status: enhancedResult ? 'healthy' : 'error',
      enhanced: !!enhancedResult,
      config: adapter.getConfig(),
      metrics: adapter.getMetricsSummary(),
    };
  } catch (error) {
    return {
      status: 'error',
      error: error instanceof Error ? error.message : '未知错误',
      config: adapter.getConfig(),
    };
  }
}

// 导出所有类型和功能
export * from './adapter';
export * from './cache';
export * from './enhanced-calculator';
export * from './luck-pillars';
export * from './timezone';
export * from './yongshen';

// 导出优化版计算器
export {
  OptimizedBaziCalculator,
  calculateOptimizedBazi,
  validateBaziCalculation,
} from './optimized-calculator';
export type {
  OptimizedBaziInput,
  OptimizedBaziResult,
} from './optimized-calculator';
