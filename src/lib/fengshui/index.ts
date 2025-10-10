/**
 * Fengshui 风水库 - 别名导出
 *
 * 这个文件作为别名，重定向到 qiflow/xuankong 和 qiflow/fengshui 实际实现
 */

// 从 xuankong 导出核心功能
export {
  buildStackedPlates,
  computeLayeredEvaluation,
} from '@/lib/qiflow/xuankong';

// 导出宫位配置（如果存在）
export { PALACE_PROFILES } from '@/lib/qiflow/xuankong';

// 重新导出所有 xuankong 模块内容
export * from '@/lib/qiflow/xuankong';

// 重新导出 fengshui 引擎（如果需要）
export * from '@/lib/qiflow/fengshui/engine';
