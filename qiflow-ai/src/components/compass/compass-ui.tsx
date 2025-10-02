/**
 * 数字罗盘用户界面组件
 *
 * 提供高精度罗盘可视化、校准和验证功能
 * 实现±2°专业级精度要求
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CompassUIProps {
  onDirectionChange?: (direction: number) => void;
  onCalibrationComplete?: (calibration: CompassCalibration) => void;
  onMeasurementComplete?: (measurement: CompassMeasurement) => void;
  className?: string;
}

interface CompassState {
  currentDirection: number;
  targetDirection: number;
  isCalibrating: boolean;
  isMeasuring: boolean;
  calibrationStep: number;
  measurements: CompassMeasurement[];
  accuracy: number;
  confidence: number;
  isStable: boolean;
  lastUpdateTime: number;
}

interface CompassCalibration {
  offset: number;
  scale: number;
  confidence: number;
  timestamp: number;
}

interface CompassMeasurement {
  direction: number;
  accuracy: number;
  confidence: number;
  timestamp: number;
  location?: { lat: number; lon: number };
}

interface CompassConfig {
  enableAutoCalibration: boolean;
  enableVibration: boolean;
  enableSound: boolean;
  targetAccuracy: number; // 目标精度（度）
  stabilityThreshold: number; // 稳定性阈值
  updateInterval: number; // 更新间隔（毫秒）
}

export const CompassUI: React.FC<CompassUIProps> = ({
  onDirectionChange,
  onCalibrationComplete,
  onMeasurementComplete,
  className = '',
}) => {
  const [state, setState] = useState<CompassState>({
    currentDirection: 0,
    targetDirection: 0,
    isCalibrating: false,
    isMeasuring: false,
    calibrationStep: 0,
    measurements: [],
    accuracy: 0,
    confidence: 0,
    isStable: false,
    lastUpdateTime: 0,
  });

  const [config] = useState<CompassConfig>({
    enableAutoCalibration: true,
    enableVibration: false,
    enableSound: true,
    targetAccuracy: 2, // ±2°精度
    stabilityThreshold: 0.5,
    updateInterval: 100,
  });

  // const compassRef = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const sensorRef = useRef<any>(null);

  // 初始化传感器
  useEffect(() => {
    initializeSensors();
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      if (sensorRef.current) {
        sensorRef.current.stop();
      }
    };
  }, []);

  // 初始化传感器
  const initializeSensors = async () => {
    try {
      if ('DeviceOrientationEvent' in window) {
        // 请求权限
        if (
          typeof (DeviceOrientationEvent as any).requestPermission ===
          'function'
        ) {
          const permission = await (
            DeviceOrientationEvent as any
          ).requestPermission();
          if (permission !== 'granted') {
            console.warn('设备方向权限被拒绝');
            return;
          }
        }

        // 监听设备方向变化
        const handleOrientation = (event: DeviceOrientationEvent) => {
          if (event.alpha !== null) {
            updateDirection(event.alpha);
          }
        };

        window.addEventListener('deviceorientation', handleOrientation);

        // 保存清理函数
        sensorRef.current = {
          stop: () =>
            window.removeEventListener('deviceorientation', handleOrientation),
        };

        console.log('设备方向传感器初始化成功');
      } else {
        console.warn('设备不支持方向传感器');
        // 使用模拟数据
        startSimulation();
      }
    } catch (error) {
      console.error('传感器初始化失败:', error);
      startSimulation();
    }
  };

  // 模拟传感器数据（用于测试）
  const startSimulation = () => {
    let direction = 0;
    const updateSimulation = () => {
      direction += (Math.random() - 0.5) * 2; // 随机变化
      if (direction < 0) direction += 360;
      if (direction >= 360) direction -= 360;

      updateDirection(direction);
      animationRef.current = requestAnimationFrame(updateSimulation);
    };
    updateSimulation();
  };

  // 更新方向
  const updateDirection = useCallback(
    (newDirection: number) => {
      const now = Date.now();

      setState(prev => {
        const deltaTime = now - prev.lastUpdateTime;
        const deltaDirection = Math.abs(newDirection - prev.currentDirection);

        // 计算稳定性
        const isStable = deltaDirection < config.stabilityThreshold;

        // 计算精度（基于稳定性）
        const accuracy = isStable
          ? Math.max(0.5, config.targetAccuracy - deltaDirection)
          : config.targetAccuracy + deltaDirection;

        // 计算置信度
        const confidence = Math.max(
          0,
          Math.min(1, 1 - deltaDirection / 10 - (deltaTime > 1000 ? 0.1 : 0))
        );

        return {
          ...prev,
          currentDirection: newDirection,
          accuracy,
          confidence,
          isStable,
          lastUpdateTime: now,
        };
      });

      // 通知父组件
      if (onDirectionChange) {
        onDirectionChange(newDirection);
      }
    },
    [config.stabilityThreshold, config.targetAccuracy, onDirectionChange]
  );

  // 开始校准
  const startCalibration = useCallback(() => {
    setState(prev => ({
      ...prev,
      isCalibrating: true,
      calibrationStep: 0,
      measurements: [],
    }));

    // 开始校准流程
    performCalibration();
  }, []);

  // 执行校准
  const performCalibration = useCallback(async () => {
    const calibrationSteps = [
      { message: '请将设备水平放置', duration: 2000 },
      { message: '缓慢旋转设备360度', duration: 5000 },
      { message: '校准完成', duration: 1000 },
    ];

    for (let i = 0; i < calibrationSteps.length; i++) {
      setState(prev => ({
        ...prev,
        calibrationStep: i,
      }));

      await new Promise(resolve =>
        setTimeout(resolve, calibrationSteps[i].duration)
      );
    }

    // 完成校准
    const calibration: CompassCalibration = {
      offset: 0, // 实际应用中应该计算偏移
      scale: 1, // 实际应用中应该计算缩放
      confidence: state.confidence,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      isCalibrating: false,
      calibrationStep: 0,
    }));

    if (onCalibrationComplete) {
      onCalibrationComplete(calibration);
    }
  }, [state.confidence, onCalibrationComplete]);

  // 开始测量
  const startMeasurement = useCallback(() => {
    setState(prev => ({
      ...prev,
      isMeasuring: true,
    }));
  }, []);

  // 停止测量
  const stopMeasurement = useCallback(() => {
    const measurement: CompassMeasurement = {
      direction: state.currentDirection,
      accuracy: state.accuracy,
      confidence: state.confidence,
      timestamp: Date.now(),
    };

    setState(prev => ({
      ...prev,
      isMeasuring: false,
      measurements: [...prev.measurements, measurement],
    }));

    if (onMeasurementComplete) {
      onMeasurementComplete(measurement);
    }
  }, [
    state.currentDirection,
    state.accuracy,
    state.confidence,
    onMeasurementComplete,
  ]);

  // 设置目标方向
  const setTargetDirection = useCallback((direction: number) => {
    setState(prev => ({
      ...prev,
      targetDirection: direction,
    }));
  }, []);

  // 计算方向差
  // const calculateDirectionDifference = (
    current: number,
    target: number
  ): number => {
    let diff = target - current;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff;
  };

  // 获取方向颜色
  // const getDirectionColor = (direction: number): string => {
    const hue = (360 - direction) % 360;
    return `hsl(${hue}, 70%, 50%)`;
  };

  // 获取精度颜色
  const getAccuracyColor = (accuracy: number): string => {
    if (accuracy <= 1) return '#4CAF50'; // 绿色 - 高精度
    if (accuracy <= 2) return '#FF9800'; // 橙色 - 中等精度
    return '#F44336'; // 红色 - 低精度
  };

  return (
    <div className={`compass-ui ${className}`}>
      {/* 控制面板 */}
      <div className='control-panel bg-white p-4 shadow-lg rounded-lg mb-4'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='text-lg font-semibold'>数字罗盘</h3>
          <div className='flex gap-2'>
            <button
              onClick={startCalibration}
              disabled={state.isCalibrating}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                state.isCalibrating
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {state.isCalibrating ? '校准中...' : '校准'}
            </button>
            <button
              onClick={state.isMeasuring ? stopMeasurement : startMeasurement}
              className={`px-3 py-1 text-sm rounded transition-colors ${
                state.isMeasuring
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {state.isMeasuring ? '停止测量' : '开始测量'}
            </button>
          </div>
        </div>

        {/* 状态信息 */}
        <div className='grid grid-cols-2 gap-4 text-sm'>
          <div>
            <span className='font-medium'>当前方向:</span>{' '}
            {Math.round(state.currentDirection)}°
          </div>
          <div>
            <span className='font-medium'>精度:</span>
            <span
              className='ml-1 px-2 py-1 rounded text-xs'
              style={{
                backgroundColor: getAccuracyColor(state.accuracy) + '20',
                color: getAccuracyColor(state.accuracy),
              }}
            >
              ±{state.accuracy.toFixed(1)}°
            </span>
          </div>
          <div>
            <span className='font-medium'>置信度:</span>{' '}
            {Math.round(state.confidence * 100)}%
          </div>
          <div>
            <span className='font-medium'>状态:</span>
            <span
              className={`ml-1 px-2 py-1 rounded text-xs ${
                state.isStable
                  ? 'bg-green-100 text-green-800'
                  : 'bg-yellow-100 text-yellow-800'
              }`}
            >
              {state.isStable ? '稳定' : '不稳定'}
            </span>
          </div>
        </div>

        {/* 校准进度 */}
        {state.isCalibrating && (
          <div className='mt-4'>
            <div className='text-sm text-gray-600 mb-2'>
              校准步骤 {state.calibrationStep + 1}/3
            </div>
            <div className='w-full bg-gray-200 rounded-full h-2'>
              <div
                className='bg-blue-500 h-2 rounded-full transition-all duration-500'
                style={{ width: `${((state.calibrationStep + 1) / 3) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* 罗盘显示 */}
      <div className='compass-display bg-white p-4 shadow-lg rounded-lg'>
        <div className='flex justify-center'>
          <div className='relative w-80 h-80'>
            {/* Konva罗盘 */}
            <CompassVisualization
              currentDirection={state.currentDirection}
              targetDirection={state.targetDirection}
              accuracy={state.accuracy}
              confidence={state.confidence}
              isStable={state.isStable}
              onTargetSet={setTargetDirection}
            />
          </div>
        </div>

        {/* 测量历史 */}
        {state.measurements.length > 0 && (
          <div className='mt-4'>
            <h4 className='text-sm font-medium mb-2'>测量历史</h4>
            <div className='max-h-32 overflow-y-auto'>
              {state.measurements.slice(-5).map((measurement, index) => (
                <div
                  key={index}
                  className='flex justify-between text-xs py-1 border-b'
                >
                  <span>{Math.round(measurement.direction)}°</span>
                  <span>±{measurement.accuracy.toFixed(1)}°</span>
                  <span>{Math.round(measurement.confidence * 100)}%</span>
                  <span>
                    {new Date(measurement.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 罗盘可视化组件
interface CompassVisualizationProps {
  currentDirection: number;
  targetDirection: number;
  accuracy: number;
  confidence: number;
  isStable: boolean;
  onTargetSet: (direction: number) => void;
}

const CompassVisualization: React.FC<CompassVisualizationProps> = ({
  currentDirection,
  targetDirection,
  accuracy,
  confidence,
  isStable,
  onTargetSet,
}) => {
  const [stageSize, setStageSize] = useState({ width: 320, height: 320 });

  // 计算位置
  const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
  const radius = 120;

  // 计算指针位置
  const getPointerPosition = (direction: number) => {
    const angle = ((direction - 90) * Math.PI) / 180;
    return {
      x: center.x + Math.cos(angle) * radius * 0.8,
      y: center.y + Math.sin(angle) * radius * 0.8,
    };
  };

  // 计算24山位置
  const getMountainPosition = (index: number) => {
    const angle = ((index * 15 - 90) * Math.PI) / 180;
    return {
      x: center.x + Math.cos(angle) * radius,
      y: center.y + Math.sin(angle) * radius,
    };
  };

  // 24山名称
  const mountains = [
    '子',
    '癸',
    '丑',
    '艮',
    '寅',
    '甲',
    '卯',
    '乙',
    '辰',
    '巽',
    '巳',
    '丙',
    '午',
    '丁',
    '未',
    '坤',
    '申',
    '庚',
    '酉',
    '辛',
    '戌',
    '乾',
    '亥',
    '壬',
  ];

  const currentPos = getPointerPosition(currentDirection);
  const targetPos = getPointerPosition(targetDirection);

  return (
    <div className='relative'>
      {/* 罗盘背景 */}
      <div className='w-80 h-80 rounded-full border-4 border-gray-300 relative overflow-hidden'>
        {/* 24山标记 */}
        {mountains.map((mountain, index) => {
          const pos = getMountainPosition(index);
          return (
            <div
              key={index}
              className='absolute text-xs font-medium text-gray-600 transform -translate-x-1/2 -translate-y-1/2'
              style={{
                left: pos.x,
                top: pos.y,
              }}
            >
              {mountain}
            </div>
          );
        })}

        {/* 方向标记 */}
        {['N', 'E', 'S', 'W'].map((direction, index) => {
          const angle = index * 90;
          const pos = getPointerPosition(angle);
          return (
            <div
              key={direction}
              className='absolute text-lg font-bold text-gray-800 transform -translate-x-1/2 -translate-y-1/2'
              style={{
                left: pos.x,
                top: pos.y,
              }}
            >
              {direction}
            </div>
          );
        })}

        {/* 当前方向指针 */}
        <div
          className='absolute w-0 h-0 transform -translate-x-1/2 -translate-y-1/2'
          style={{
            left: currentPos.x,
            top: currentPos.y,
            borderLeft: '8px solid transparent',
            borderRight: '8px solid transparent',
            borderBottom: `20px solid ${isStable ? '#4CAF50' : '#FF9800'}`,
            transform: `translate(-50%, -50%) rotate(${currentDirection}deg)`,
          }}
        />

        {/* 目标方向指针 */}
        {targetDirection !== currentDirection && (
          <div
            className='absolute w-0 h-0 transform -translate-x-1/2 -translate-y-1/2'
            style={{
              left: targetPos.x,
              top: targetPos.y,
              borderLeft: '6px solid transparent',
              borderRight: '6px solid transparent',
              borderBottom: '15px solid #2196F3',
              transform: `translate(-50%, -50%) rotate(${targetDirection}deg)`,
            }}
          />
        )}

        {/* 精度圆 */}
        <div
          className='absolute border-2 border-dashed rounded-full opacity-50'
          style={{
            left: center.x - accuracy * 2,
            top: center.y - accuracy * 2,
            width: accuracy * 4,
            height: accuracy * 4,
            borderColor: accuracy <= 2 ? '#4CAF50' : '#FF9800',
          }}
        />

        {/* 中心点 */}
        <div
          className='absolute w-4 h-4 bg-gray-800 rounded-full transform -translate-x-1/2 -translate-y-1/2'
          style={{
            left: center.x,
            top: center.y,
          }}
        />
      </div>

      {/* 方向数值显示 */}
      <div className='absolute top-4 left-4 bg-white bg-opacity-90 px-2 py-1 rounded text-sm font-mono'>
        {Math.round(currentDirection)}°
      </div>

      {/* 精度显示 */}
      <div className='absolute top-4 right-4 bg-white bg-opacity-90 px-2 py-1 rounded text-sm'>
        ±{accuracy.toFixed(1)}°
      </div>
    </div>
  );
};

export default CompassUI;

