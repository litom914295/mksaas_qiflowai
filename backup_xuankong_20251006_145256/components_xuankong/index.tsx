// 玄空飞星React组件库 - 统一导出

// 主面板组件
export { ComprehensiveAnalysisPanel } from './comprehensive-analysis-panel';

// 视图组件
export { OverallAssessmentView } from './overall-assessment-view';
export { InteractiveFlyingStarGrid } from './interactive-flying-star-grid';

// 导出占位组件(待实现)
export { BasicAnalysisView } from './basic-analysis-view';
export { LiunianAnalysisView } from './liunian-analysis-view';
export { PersonalizedAnalysisView } from './personalized-analysis-view';
export { SmartRecommendationsView } from './smart-recommendations-view';
export { TiguaAnalysisView } from './tigua-analysis-view';
export { LingzhengAnalysisView } from './lingzheng-analysis-view';
export { ChengmenjueAnalysisView } from './chengmenjue-analysis-view';

// 类型定义
export type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
export type {
  EnhancedPlateCell,
  EnhancedPlate,
} from '@/lib/qiflow/xuankong/types';
