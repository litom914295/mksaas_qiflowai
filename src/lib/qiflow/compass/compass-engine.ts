/**
 * 罗盘引擎核心类
 */

import { CompassConfidenceAnalyzer } from './confidence';
import { SensorFusion } from './sensor-fusion';
import { TrueNorthCalculator } from './true-north';
import type {
  CompassConfig,
  CompassResult,
  HealthStatus,
  SensorData,
} from './types';

export class CompassEngine {
  private config: CompassConfig;
  private sensorFusion: SensorFusion;
  private trueNorthCalculator: TrueNorthCalculator;
  private confidenceAnalyzer: CompassConfidenceAnalyzer;

  constructor(config?: Partial<CompassConfig>) {
    this.config = {
      enableMagneticDeclination: true,
      enableTrueNorth: true,
      confidenceThreshold: 0.7,
      smoothingFactor: 0.8,
      calibrationRequired: true,
      ...config,
    };

    this.sensorFusion = new SensorFusion();
    this.trueNorthCalculator = new TrueNorthCalculator();
    this.confidenceAnalyzer = new CompassConfidenceAnalyzer();
  }

  async readCompass(sensorData: SensorData): Promise<CompassResult> {
    try {
      // 传感器融合处理
      const fusedData = this.sensorFusion.process(sensorData);

      // 计算磁北方向
      const magnetic = this.calculateMagnetic(fusedData);

      // 计算真北方向
      const trueNorth = this.config.enableTrueNorth
        ? this.trueNorthCalculator.calculate(magnetic, sensorData)
        : magnetic;

      // 分析置信度
      const confidenceValue = this.confidenceAnalyzer.analyze(
        sensorData,
        fusedData
      );

      // 计算精度
      const accuracy = this.calculateAccuracy(sensorData, confidenceValue);

      return {
        reading: {
          magnetic,
          true: trueNorth,
          confidence: confidenceValue as any,
          accuracy,
          timestamp: Date.now(),
        },
        calibration: {
          magnetic: this.isMagneticCalibrated(),
          trueNorth: this.isTrueNorthCalibrated(),
        },
        sensors: {
          accelerometer: this.isSensorValid(sensorData.accelerometer),
          magnetometer: this.isSensorValid(sensorData.magnetometer),
          gyroscope: this.isSensorValid(sensorData.gyroscope),
        },
        meta: {
          algorithm: 'enhanced-compass',
          version: '1.0.0',
          processingTime: Date.now() - sensorData.timestamp,
        },
      };
    } catch (error) {
      console.error('罗盘读取失败:', error);
      throw error;
    }
  }

  private calculateMagnetic(fusedData: any): number {
    // 简化的磁北计算
    return (
      (Math.atan2(fusedData.magnetometer.y, fusedData.magnetometer.x) * 180) /
      Math.PI
    );
  }

  private calculateAccuracy(sensorData: SensorData, confidence: any): number {
    // 简化的精度计算
    return confidence === 'high' ? 0.9 : confidence === 'medium' ? 0.7 : 0.5;
  }

  private isMagneticCalibrated(): boolean {
    return true; // 简化实现
  }

  private isTrueNorthCalibrated(): boolean {
    return this.config.enableTrueNorth;
  }

  private isSensorValid(sensor: any): boolean {
    return (
      sensor &&
      typeof sensor.x === 'number' &&
      typeof sensor.y === 'number' &&
      typeof sensor.z === 'number'
    );
  }

  async checkHealth(): Promise<HealthStatus> {
    try {
      // 模拟健康检查
      return {
        isHealthy: true,
        confidence: 'high',
        sensors: {
          accelerometer: true,
          magnetometer: true,
          gyroscope: true,
        },
        calibration: {
          magnetic: true,
          trueNorth: this.config.enableTrueNorth,
        },
        errors: [],
      };
    } catch (error) {
      return {
        isHealthy: false,
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
        errors: [error instanceof Error ? error.message : '未知错误'],
      };
    }
  }
}
