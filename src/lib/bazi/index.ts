/**
 * Bazi 八字计算库 - 别名导出
 * 
 * 这个文件作为别名，重定向到 qiflow/bazi 实际实现
 */

// 导出核心函数
export {
  computeBaziSmart,
  computeBaziEnhanced,
  createBaziCalculator,
  getBaziAdapter,
  configureBaziSystem,
  checkBaziSystemHealth,
} from '@/lib/qiflow/bazi';

// 导出所有类型
export type {
  EnhancedBaziResult,
  EnhancedBirthData,
  OptimizedBaziInput,
  OptimizedBaziResult,
} from '@/lib/qiflow/bazi';

// 导出优化版计算器
export {
  OptimizedBaziCalculator,
  calculateOptimizedBazi,
  validateBaziCalculation,
} from '@/lib/qiflow/bazi';

// 导出其他模块
export * from '@/lib/qiflow/bazi/adapter';
export * from '@/lib/qiflow/bazi/cache';
export * from '@/lib/qiflow/bazi/enhanced-calculator';
export * from '@/lib/qiflow/bazi/luck-pillars';
export * from '@/lib/qiflow/bazi/timezone';
export * from '@/lib/qiflow/bazi/yongshen';
