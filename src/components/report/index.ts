/**
 * 报告组件索引
 *
 * 导出所有 v2.2 报告组件（VIP 包装 + 图表）
 */

// VIP 包装组件
export { default as ReportCover } from './ReportCover';
export { default as VIPBadge, VIPBadgeGroup } from './VIPBadge';
export { default as ReportAppendix } from './ReportAppendix';

// 图表组件
export {
  TimelineChart,
  RadarChart,
  HeatmapChart,
  WaveChart,
  GanttChart,
} from './charts';

// 类型导出
export type { default as ReportCoverProps } from './ReportCover';
export type { default as ReportAppendixProps } from './ReportAppendix';
