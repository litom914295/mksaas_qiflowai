/**
 * 专业报告 v2-2 模块入口（新命名规范）
 * 
 * 用法：
 * ```ts
 * import { renderReportHtmlV22 } from '@/lib/report/v2-2';
 * ```
 */

export { renderReportHtmlV22 } from './html';

// 重新导出类型定义
export type {
  ReportOutputV22,
  StrategyMapping,
  DecisionComparison,
  FengshuiChecklist,
  HopeTimeline,
  ActionItem,
  LifeThemeStage,
  LuckPillar,
  PatternAnalysis,
  UsefulGod,
} from '@/types/report-v2-2';
