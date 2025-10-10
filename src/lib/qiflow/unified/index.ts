/**
 * 统一风水系统入口
 *
 * 整合 xuankong 和 fengshui 两套系统，提供统一接口
 *
 * @author QiFlow AI Team
 * @version 1.0.0
 */

// 核心引擎
export { UnifiedFengshuiEngine } from './engine';

// 类型定义
export type {
  // 输入类型
  UnifiedBaziInfo,
  UnifiedHouseInfo,
  UnifiedRoomLayout,
  UnifiedTimeInfo,
  UnifiedAnalysisOptions,
  UnifiedAnalysisInput,
  // 输出类型
  UnifiedAnalysisOutput,
  UnifiedScoringResult,
  UnifiedWarningResult,
  UnifiedWarning,
  UnifiedKeyPosition,
  UnifiedRoomAdvice,
  UnifiedMonthlyForecast,
  UnifiedActionItem,
  // 基础类型
  UnifiedElement,
  RoomType,
  KeyPositionType,
  WarningSeverity,
  ScoreDimension,
  // 从原系统导出的类型
  Mountain,
  Yun,
  PalaceIndex,
  FlyingStar,
} from './types';

// 适配器工具
export {
  toXuankongUserProfile,
  toFengshuiBaziInfo,
  toFengshuiHouseInfo,
  toXuankongAnalysisOptions,
  toFengshuiInput,
  calculatePeriod,
  degreesToMountain,
  mountainToDegrees,
  palaceToMountain,
  getPalaceName,
} from './adapters';

// 常量
export { ELEMENT_MAPPING } from './types';

// 缓存系统
export {
  AnalysisCache,
  getGlobalCache,
  resetGlobalCache,
  withCache,
} from './cache';

// 前端适配器
export {
  adaptToFrontend,
  adaptScoringToDisplay,
  adaptWarningsToDisplay,
} from './adapters/frontend-adapter';
