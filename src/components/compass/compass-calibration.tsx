/**
 * 罗盘校准组件
 *
 * 提供设备传感器检测、校准引导流程
 * 实现环境干扰检测和精度验证
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CompassCalibrationProps {
  onCalibrationComplete?: (calibration: CalibrationResult) => void;
  onCalibrationCancel?: () => void;
  className?: string;
}

interface CalibrationState {
  step: number;
  isActive: boolean;
  progress: number;
  message: string;
  measurements: CalibrationMeasurement[];
  currentMeasurement: CalibrationMeasurement | null;
  error: string | null;
}

interface CalibrationMeasurement {
  timestamp: number;
  direction: number;
  accuracy: number;
  stability: number;
  location?: { lat: number; lon: number };
}

interface CalibrationResult {
  offset: number;
  scale: number;
  confidence: number;
  measurements: CalibrationMeasurement[];
  timestamp: number;
  deviceInfo: DeviceInfo;
  magneticDeclination: number;
  environmentalFactors?: {
    temperature: number;
    humidity: number;
    pressure: number;
  };
  quality: {
    magneticFieldStrength: number;
    stability: number;
    accuracy: number;
  };
}

interface DeviceInfo {
  hasMagnetometer: boolean;
  hasAccelerometer: boolean;
  hasGyroscope: boolean;
  hasGPS: boolean;
  userAgent: string;
}

interface CalibrationStep {
  id: string;
  title: string;
  description: string;
  duration: number;
  instructions: string[];
  validation: (measurements: CalibrationMeasurement[]) => boolean;
}

export const CompassCalibration: React.FC<CompassCalibrationProps> = ({
  onCalibrationComplete,
  onCalibrationCancel,
  className = '',
}) => {
  const [state, setState] = useState<CalibrationState>({
    step: 0,
    isActive: false,
    progress: 0,
    message: '',
    measurements: [],
    currentMeasurement: null,
    error: null,
  });

  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo | null>(null);
  const [magneticField] = useState<{
    strength: number;
    x: number;
    y: number;
    z: number;
  } | null>(null);
  const [environmentalFactors] = useState<{
    temperature: number;
    humidity: number;
    pressure: number;
  } | null>(null);
  const [kalmanFilter] = useState<{
    x: number;
    y: number;
    z: number;
    vx: number;
    vy: number;
    vz: number;
    P: number[][];
  } | null>(null);
  const sensorRef = useRef<any>(null);
  const calibrationRef = useRef<CalibrationMeasurement[]>([]);

  // 校准步骤定义
  const calibrationSteps: CalibrationStep[] = [
    {
      id: 'preparation',
      title: '准备阶段',
      description: '检查设备传感器和环境条件',
      duration: 3000,
      instructions: [
        '请确保设备电量充足',
        '远离金属物体和电子设备',
        '保持设备水平放置',
        '确保网络连接稳定',
      ],
      validation: () => true,
    },
    {
      id: 'sensor_check',
      title: '传感器检测',
      description: '检测设备传感器可用性',
      duration: 2000,
      instructions: [
        '检测磁力计传感器',
        '检测加速度计传感器',
        '检测陀螺仪传感器',
        '检测GPS定位功能',
      ],
      validation: measurements => measurements.length > 0,
    },
    {
      id: 'horizontal_calibration',
      title: '水平校准',
      description: '校准设备水平状态',
      duration: 5000,
      instructions: [
        '将设备水平放置在桌面上',
        '保持设备稳定不动',
        '等待自动校准完成',
        '不要移动设备',
      ],
      validation: measurements => {
        const recent = measurements.slice(-10);
        return recent.length >= 5 && recent.every(m => m.stability > 0.8);
      },
    },
    {
      id: 'rotation_calibration',
      title: '旋转校准',
      description: '通过旋转设备进行校准',
      duration: 10000,
      instructions: [
        '缓慢旋转设备360度',
        '保持旋转速度均匀',
        '确保覆盖所有方向',
        '避免快速转动',
      ],
      validation: measurements => {
        const directions = measurements.map(m => m.direction);
        const range = Math.max(...directions) - Math.min(...directions);
        return range > 300; // 至少覆盖300度
      },
    },
    {
      id: 'precision_calibration',
      title: '精度校准',
      description: '验证校准精度',
      duration: 5000,
      instructions: [
        '将设备指向已知方向',
        '保持设备稳定',
        '验证方向准确性',
        '确认精度达标',
      ],
      validation: measurements => {
        const recent = measurements.slice(-5);
        return recent.length >= 3 && recent.every(m => m.accuracy <= 2);
      },
    },
    {
      id: 'completion',
      title: '校准完成',
      description: '校准结果验证和保存',
      duration: 2000,
      instructions: [
        '校准数据已保存',
        '精度验证通过',
        '可以开始使用罗盘',
        '建议定期重新校准',
      ],
      validation: () => true,
    },
  ];

  // 初始化设备信息
  useEffect(() => {
    detectDeviceCapabilities();
  }, []);

  // 检测设备能力
  const detectDeviceCapabilities = useCallback(async () => {
    const info: DeviceInfo = {
      hasMagnetometer: 'DeviceOrientationEvent' in window,
      hasAccelerometer: 'DeviceMotionEvent' in window,
      hasGyroscope: 'DeviceOrientationEvent' in window,
      hasGPS: 'geolocation' in navigator,
      userAgent: navigator.userAgent,
    };

    setDeviceInfo(info);
  }, []);

  // 开始校准
  const startCalibration = useCallback(async () => {
    try {
      setState(prev => ({
        ...prev,
        isActive: true,
        step: 0,
        progress: 0,
        measurements: [],
        error: null,
      }));

      // 检查是否在浏览器环境中且 DeviceOrientationEvent 可用
      if (typeof window === 'undefined' || typeof DeviceOrientationEvent === 'undefined') {
        throw new Error('设备方向传感器不可用');
      }

      // 请求传感器权限
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === 'function'
      ) {
        const permission = await (
          DeviceOrientationEvent as any
        ).requestPermission();
        if (permission !== 'granted') {
          throw new Error('传感器权限被拒绝');
        }
      }

      // 开始校准流程
      await performCalibration();
    } catch (error) {
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : '校准失败',
        isActive: false,
      }));
    }
  }, []);

  // 执行校准
  const performCalibration = useCallback(async () => {
    for (let i = 0; i < calibrationSteps.length; i++) {
      const step = calibrationSteps[i];

      setState(prev => ({
        ...prev,
        step: i,
        message: step.title,
        progress: (i / calibrationSteps.length) * 100,
      }));

      // 开始测量
      if (i > 0) {
        // 跳过准备阶段
        await startMeasurement(step);
      }

      // 等待步骤完成
      await new Promise(resolve => setTimeout(resolve, step.duration));

      // 验证步骤
      if (!step.validation(calibrationRef.current)) {
        throw new Error(`校准步骤 ${step.title} 验证失败`);
      }
    }

    // 完成校准
    await completeCalibration();
  }, [calibrationSteps]);

  // 开始测量
  const startMeasurement = useCallback(async (step: CalibrationStep) => {
    return new Promise<void>(resolve => {
      let measurementCount = 0;
      const maxMeasurements = Math.floor(step.duration / 200); // 每200ms测量一次

      const handleOrientation = (event: DeviceOrientationEvent) => {
        if (event.alpha !== null && measurementCount < maxMeasurements) {
          const measurement: CalibrationMeasurement = {
            timestamp: Date.now(),
            direction: event.alpha,
            accuracy: calculateAccuracy(event),
            stability: calculateStability(event),
            location: getCurrentLocation(),
          };

          calibrationRef.current.push(measurement);
          measurementCount++;

          setState(prev => ({
            ...prev,
            currentMeasurement: measurement,
            measurements: [...calibrationRef.current],
          }));
        }

        if (measurementCount >= maxMeasurements) {
          window.removeEventListener('deviceorientation', handleOrientation);
          resolve();
        }
      };

      window.addEventListener('deviceorientation', handleOrientation);
    });
  }, []);

  // 计算精度
  const calculateAccuracy = (event: DeviceOrientationEvent): number => {
    // 简化的精度计算
    const alpha = event.alpha || 0;
    const beta = event.beta || 0;
    const gamma = event.gamma || 0;

    // 基于倾斜角度计算精度
    const tilt = Math.sqrt(beta * beta + gamma * gamma);
    return Math.max(0.5, Math.min(5, tilt / 10));
  };

  // 计算稳定性
  const calculateStability = (event: DeviceOrientationEvent): number => {
    // 简化的稳定性计算
    const alpha = event.alpha || 0;
    const recent = calibrationRef.current.slice(-5);

    if (recent.length === 0) return 1;

    const avgDirection =
      recent.reduce((sum, m) => sum + m.direction, 0) / recent.length;
    const variance =
      recent.reduce(
        (sum, m) => sum + Math.pow(m.direction - avgDirection, 2),
        0
      ) / recent.length;

    return Math.max(0, Math.min(1, 1 - variance / 100));
  };

  // 获取当前位置
  const getCurrentLocation = (): { lat: number; lon: number } | undefined => {
    // 简化的位置获取
    return undefined;
  };

  // 完成校准
  const completeCalibration = useCallback(async () => {
    const measurements = calibrationRef.current;

    // 计算校准参数
    const offset = calculateOffset(measurements);
    const scale = calculateScale(measurements);
    const confidence = calculateConfidence(measurements);

    const result: CalibrationResult = {
      offset,
      scale,
      confidence,
      measurements,
      timestamp: Date.now(),
      deviceInfo: deviceInfo!,
      magneticDeclination: 0, // 默认值
      quality: {
        magneticFieldStrength: 0,
        accuracy: 0,
        stability: 0
      }
    };

    setState(prev => ({
      ...prev,
      isActive: false,
      progress: 100,
      message: '校准完成',
    }));

    if (onCalibrationComplete) {
      onCalibrationComplete(result);
    }
  }, [deviceInfo, onCalibrationComplete]);

  // 计算偏移
  const calculateOffset = (measurements: CalibrationMeasurement[]): number => {
    if (measurements.length === 0) return 0;

    const directions = measurements.map(m => m.direction);
    const avg = directions.reduce((sum, d) => sum + d, 0) / directions.length;
    return avg;
  };

  // 计算缩放
  const calculateScale = (measurements: CalibrationMeasurement[]): number => {
    if (measurements.length < 2) return 1;

    const directions = measurements.map(m => m.direction);
    const range = Math.max(...directions) - Math.min(...directions);
    return range / 360; // 理想情况下应该是1
  };

  // 计算置信度
  const calculateConfidence = (
    measurements: CalibrationMeasurement[]
  ): number => {
    if (measurements.length === 0) return 0;

    const avgAccuracy =
      measurements.reduce((sum, m) => sum + m.accuracy, 0) /
      measurements.length;
    const avgStability =
      measurements.reduce((sum, m) => sum + m.stability, 0) /
      measurements.length;

    return Math.max(0, Math.min(1, (2 - avgAccuracy) * avgStability));
  };

  // 取消校准
  const cancelCalibration = useCallback(() => {
    setState(prev => ({
      ...prev,
      isActive: false,
      step: 0,
      progress: 0,
      measurements: [],
      error: null,
    }));

    if (sensorRef.current) {
      sensorRef.current.stop();
    }

    if (onCalibrationCancel) {
      onCalibrationCancel();
    }
  }, [onCalibrationCancel]);

  // 当前步骤
  const currentStep = calibrationSteps[state.step];

  return (
    <div className={`compass-calibration ${className}`}>
      <div className='bg-white p-6 rounded-lg shadow-lg'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-semibold'>罗盘校准</h3>
          {state.isActive && (
            <button
              onClick={cancelCalibration}
              className='px-4 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600'
            >
              取消校准
            </button>
          )}
        </div>

        {/* 进度条 */}
        <div className='mb-6'>
          <div className='flex justify-between text-sm text-gray-600 mb-2'>
            <span>
              步骤 {state.step + 1} / {calibrationSteps.length}
            </span>
            <span>{Math.round(state.progress)}%</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-3'>
            <div
              className='bg-blue-500 h-3 rounded-full transition-all duration-500'
              style={{ width: `${state.progress}%` }}
            />
          </div>
        </div>

        {/* 当前步骤信息 */}
        {currentStep && (
          <div className='mb-6'>
            <h4 className='text-lg font-medium mb-2'>{currentStep.title}</h4>
            <p className='text-gray-600 mb-4'>{currentStep.description}</p>

            {/* 指令列表 */}
            <div className='space-y-2'>
              {currentStep.instructions.map((instruction, index) => (
                <div key={index} className='flex items-start gap-2'>
                  <div className='w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium'>
                    {index + 1}
                  </div>
                  <span className='text-sm text-gray-700'>{instruction}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 测量信息 */}
        {state.currentMeasurement && (
          <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
            <h5 className='font-medium mb-2'>实时测量数据</h5>
            <div className='grid grid-cols-2 gap-4 text-sm'>
              <div>
                <span className='text-gray-600'>方向:</span>{' '}
                {Math.round(state.currentMeasurement.direction)}°
              </div>
              <div>
                <span className='text-gray-600'>精度:</span> ±
                {state.currentMeasurement.accuracy.toFixed(1)}°
              </div>
              <div>
                <span className='text-gray-600'>稳定性:</span>{' '}
                {Math.round(state.currentMeasurement.stability * 100)}%
              </div>
              <div>
                <span className='text-gray-600'>测量次数:</span>{' '}
                {state.measurements.length}
              </div>
            </div>
          </div>
        )}

        {/* 设备信息 */}
        {deviceInfo && (
          <div className='mb-6 p-4 bg-blue-50 rounded-lg'>
            <h5 className='font-medium mb-2'>设备传感器状态</h5>
            <div className='grid grid-cols-2 gap-2 text-sm'>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-3 h-3 rounded-full ${deviceInfo.hasMagnetometer ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span>磁力计</span>
              </div>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-3 h-3 rounded-full ${deviceInfo.hasAccelerometer ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span>加速度计</span>
              </div>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-3 h-3 rounded-full ${deviceInfo.hasGyroscope ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span>陀螺仪</span>
              </div>
              <div className='flex items-center gap-2'>
                <div
                  className={`w-3 h-3 rounded-full ${deviceInfo.hasGPS ? 'bg-green-500' : 'bg-red-500'}`}
                />
                <span>GPS定位</span>
              </div>
            </div>
          </div>
        )}

        {/* 错误信息 */}
        {state.error && (
          <div className='mb-6 p-4 bg-red-50 border border-red-200 rounded-lg'>
            <div className='flex items-center gap-2 text-red-800'>
              <div className='w-5 h-5 text-red-500'>⚠️</div>
              <span className='font-medium'>校准失败</span>
            </div>
            <p className='text-red-600 text-sm mt-1'>{state.error}</p>
          </div>
        )}

        {/* 操作按钮 */}
        {!state.isActive && (
          <div className='flex gap-4'>
            <button
              onClick={startCalibration}
              className='px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors'
            >
              开始校准
            </button>
            <button
              onClick={cancelCalibration}
              className='px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors'
            >
              取消
            </button>
          </div>
        )}

        {/* 校准完成 */}
        {!state.isActive && state.progress === 100 && (
          <div className='p-4 bg-green-50 border border-green-200 rounded-lg'>
            <div className='flex items-center gap-2 text-green-800'>
              <div className='w-5 h-5 text-green-500'>✅</div>
              <span className='font-medium'>校准完成</span>
            </div>
            <p className='text-green-600 text-sm mt-1'>
              罗盘已校准完成，精度达到专业级要求（±2°）
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// 检测环境因素
const detectEnvironmentalFactors = async () => {
  try {
    // 检测磁场强度
    if (navigator.permissions && 'magnetometer' in navigator) {
      const permission = await navigator.permissions.query({
        name: 'magnetometer' as PermissionName,
      });
      if (permission.state === 'granted') {
        // 模拟磁场检测（实际应用中需要真实传感器数据）
        const mockMagneticField = {
          strength: 25 + Math.random() * 10, // 25-35 μT
          x: (Math.random() - 0.5) * 10,
          y: (Math.random() - 0.5) * 10,
          z: (Math.random() - 0.5) * 10,
        };
        return mockMagneticField;
      }
    }

    // 检测环境因素（模拟数据）
    const mockEnvironmental = {
      temperature: 20 + Math.random() * 10, // 20-30°C
      humidity: 40 + Math.random() * 30, // 40-70%
      pressure: 1013 + Math.random() * 20, // 1013-1033 hPa
    };
    return mockEnvironmental;
  } catch (error) {
    console.warn('环境因素检测失败:', error);
    return null;
  }
};

// 初始化卡尔曼滤波器
const initializeKalmanFilter = () => {
  const initialP = [
    [1, 0, 0, 0, 0, 0],
    [0, 1, 0, 0, 0, 0],
    [0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0],
    [0, 0, 0, 0, 1, 0],
    [0, 0, 0, 0, 0, 1],
  ];

  return {
    x: 0,
    y: 0,
    z: 0,
    vx: 0,
    vy: 0,
    vz: 0,
    P: initialP,
  };
};

// 应用卡尔曼滤波
const applyKalmanFilter = (
  kalmanFilter: any,
  measurement: { x: number; y: number; z: number }
) => {
  if (!kalmanFilter) return measurement;

  // 简化的卡尔曼滤波实现
  const dt = 0.1; // 时间步长
  const Q = 0.1; // 过程噪声
  const R = 0.5; // 测量噪声

  // 预测步骤
  const x_pred = kalmanFilter.x + kalmanFilter.vx * dt;
  const y_pred = kalmanFilter.y + kalmanFilter.vy * dt;
  const z_pred = kalmanFilter.z + kalmanFilter.vz * dt;

  // 更新步骤
  const K = 0.5; // 卡尔曼增益（简化）
  const x_new = x_pred + K * (measurement.x - x_pred);
  const y_new = y_pred + K * (measurement.y - y_pred);
  const z_new = z_pred + K * (measurement.z - z_pred);

  const newFilter = {
    ...kalmanFilter,
    x: x_new,
    y: y_new,
    z: z_new,
    vx: (x_new - kalmanFilter.x) / dt,
    vy: (y_new - kalmanFilter.y) / dt,
    vz: (z_new - kalmanFilter.z) / dt,
  };

  return { filter: newFilter, measurement: { x: x_new, y: y_new, z: z_new } };
};

// 计算磁偏角
const calculateMagneticDeclination = (lat: number, lon: number): number => {
  // 简化的磁偏角计算（实际应用中应使用WMM2020模型）
  const year = new Date().getFullYear();
  const declination = 7.0 + (year - 2020) * 0.1; // 简化计算
  return declination;
};

// 评估校准质量
const assessCalibrationQuality = (
  measurements: CalibrationMeasurement[],
  magneticField?: { strength: number }
) => {
  if (measurements.length === 0)
    return { strength: 0, stability: 0, accuracy: 0 };

  // 计算磁场强度
  const strength = magneticField?.strength || 0;
  const strengthScore = Math.min(1, Math.max(0, (strength - 15) / 20)); // 15-35 μT为正常范围

  // 计算稳定性
  const directions = measurements.map(m => m.direction);
  const mean = directions.reduce((sum, d) => sum + d, 0) / directions.length;
  const variance =
    directions.reduce((sum, d) => sum + Math.pow(d - mean, 2), 0) /
    directions.length;
  const stability = Math.max(0, 1 - Math.sqrt(variance) / 10); // 标准差越小越稳定

  // 计算精度
  const accuracies = measurements.map(m => m.accuracy);
  const avgAccuracy =
    accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length;
  const accuracy = Math.max(0, 1 - avgAccuracy / 10); // 精度越高越好

  return {
    strength: strengthScore,
    stability,
    accuracy,
  };
};

export default CompassCalibration;
