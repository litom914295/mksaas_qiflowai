/**
 * 罗盘算法类型定义
 */

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export interface CompassConfig {
  enableMagneticDeclination: boolean;
  enableTrueNorth: boolean;
  confidenceThreshold: number;
  smoothingFactor: number;
  calibrationRequired: boolean;
}

export interface SensorData {
  accelerometer: {
    x: number;
    y: number;
    z: number;
  };
  magnetometer: {
    x: number;
    y: number;
    z: number;
  };
  gyroscope: {
    x: number;
    y: number;
    z: number;
  };
  timestamp: number;
}

export interface CompassReading {
  magnetic: number;
  true: number;
  confidence: ConfidenceLevel;
  accuracy: number;
  timestamp: number;
}

export interface CompassResult {
  reading: CompassReading;
  calibration: {
    magnetic: boolean;
    trueNorth: boolean;
  };
  sensors: {
    accelerometer: boolean;
    magnetometer: boolean;
    gyroscope: boolean;
  };
  meta: {
    algorithm: string;
    version: string;
    processingTime: number;
  };
}

export interface CalibrationData {
  magnetic: {
    offset: number;
    scale: number;
    calibrated: boolean;
  };
  trueNorth: {
    declination: number;
    calibrated: boolean;
  };
}

export interface HealthStatus {
  isHealthy: boolean;
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
  errors: string[];
}
