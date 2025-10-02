/**
 * QiFlow AI - 罗盘算法主入口
 *
 * 基于传感器融合和AI分析的专业级罗盘服务
 * 提供高精度、智能化的罗盘测量和分析能力
 */

import { CompassEngine } from './compass-engine';
import { SensorFusion } from './sensor-fusion';
import { TrueNorthCalculator } from './true-north';
import { CompassConfidenceAnalyzer } from './confidence';
import type { 
  CompassReading, 
  CompassConfig, 
  CompassResult,
  SensorData,
  ConfidenceLevel 
} from './types';

/**
 * 创建罗盘引擎实例
 */
export function createCompassEngine(config?: Partial<CompassConfig>): CompassEngine {
  return new CompassEngine(config);
}

/**
 * 创建传感器融合实例
 */
export function createSensorFusion(): SensorFusion {
  return new SensorFusion();
}

/**
 * 创建真北计算器
 */
export function createTrueNorthCalculator(): TrueNorthCalculator {
  return new TrueNorthCalculator();
}

/**
 * 创建置信度分析器
 */
export function createConfidenceAnalyzer(): CompassConfidenceAnalyzer {
  return new CompassConfidenceAnalyzer();
}

/**
 * 智能罗盘读取（推荐使用）
 */
export async function readCompassSmart(
  sensorData: SensorData,
  config?: Partial<CompassConfig>
): Promise<CompassResult> {
  const engine = createCompassEngine(config);
  return await engine.readCompass(sensorData);
}

/**
 * 罗盘系统健康检查
 */
export async function checkCompassSystemHealth(): Promise<{
  status: 'healthy' | 'warning' | 'error';
  confidence: ConfidenceLevel;
  sensors: {
    accelerometer: boolean;
    magnetometer: boolean;
    gyroscope: boolean;
  };
  calibration: {
    magnetic: boolean;
    trueNorth: boolean;
  };
}> {
  try {
    const engine = createCompassEngine();
    const health = await engine.checkHealth();
    
    return {
      status: health.isHealthy ? 'healthy' : 'warning',
      confidence: health.confidence,
      sensors: health.sensors,
      calibration: health.calibration,
    };
  } catch (error) {
    return {
      status: 'error',
      confidence: 'low',
      sensors: {
        accelerometer: false,
        magnetometer: false,
        gyroscope: false,
      },
      calibration: {
        magnetic: false,
        trueNorth: false,
      },
    };
  }
}

// 导出所有类型和功能
export * from './types';
export * from './confidence';
export * from './compass-engine';
export * from './sensor-fusion';
export * from './true-north';
export * from './declination';
export * from './ekf';
