/**
 * 风水罗盘组件导出
 */

// 原版组件
export { default as FengShuiCompass } from './feng-shui-compass';



// 其他相关组件
export { default as CompassCalibration } from './compass-calibration';
export { default as CompassErrorBoundary } from './compass-error-boundary';
export { default as CompassMeasurement } from './compass-measurement';
export { default as CompassUI } from './compass-ui';

// 类型导出
export type {
    AIAnalysisResult, CompassEvent, FengShuiCompassProps, SensorData
} from '@/lib/compass/feng-shui-types';

