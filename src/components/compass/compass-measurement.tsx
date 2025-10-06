/**
 * 罗盘测量组件
 *
 * 提供方向测量结果保存、历史记录查看
 * 支持测量数据导出和游客模式临时存储
 */

'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';

interface CompassMeasurementProps {
  onMeasurementSave?: (measurement: MeasurementData) => void;
  onMeasurementExport?: (measurements: MeasurementData[]) => void;
  className?: string;
}

interface MeasurementData {
  id: string;
  direction: number;
  accuracy: number;
  confidence: number;
  timestamp: number;
  location?: {
    lat: number;
    lon: number;
    address?: string;
  };
  notes?: string;
  tags?: string[];
}

interface MeasurementState {
  measurements: MeasurementData[];
  currentMeasurement: MeasurementData | null;
  isRecording: boolean;
  recordingStartTime: number;
  selectedMeasurements: string[];
  filter: {
    dateRange: { start: Date | null; end: Date | null };
    accuracyRange: { min: number; max: number };
    tags: string[];
  };
  viewMode: 'list' | 'grid' | 'timeline';
}

interface MeasurementStats {
  total: number;
  averageAccuracy: number;
  averageConfidence: number;
  bestAccuracy: number;
  worstAccuracy: number;
  dateRange: { start: Date; end: Date };
}

export const CompassMeasurement: React.FC<CompassMeasurementProps> = ({
  onMeasurementSave,
  onMeasurementExport,
  className = '',
}) => {
  const [state, setState] = useState<MeasurementState>({
    measurements: [],
    currentMeasurement: null,
    isRecording: false,
    recordingStartTime: 0,
    selectedMeasurements: [],
    filter: {
      dateRange: { start: null, end: null },
      accuracyRange: { min: 0, max: 10 },
      tags: [],
    },
    viewMode: 'list',
  });

  const recordingRef = useRef<MeasurementData[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 加载历史测量数据
  useEffect(() => {
    loadMeasurements();
  }, []);

  // 加载测量数据
  const loadMeasurements = useCallback(() => {
    try {
      const saved = localStorage.getItem('compass_measurements');
      if (saved) {
        const measurements = JSON.parse(saved).map((m: any) => ({
          ...m,
          timestamp: new Date(m.timestamp),
        }));
        setState(prev => ({ ...prev, measurements }));
      }
    } catch (error) {
      console.error('加载测量数据失败:', error);
    }
  }, []);

  // 保存测量数据
  const saveMeasurements = useCallback((measurements: MeasurementData[]) => {
    try {
      localStorage.setItem(
        'compass_measurements',
        JSON.stringify(measurements)
      );
    } catch (error) {
      console.error('保存测量数据失败:', error);
    }
  }, []);

  // 开始测量
  const startMeasurement = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRecording: true,
      recordingStartTime: Date.now(),
      currentMeasurement: null,
    }));

    recordingRef.current = [];

    // 开始定期记录
    intervalRef.current = setInterval(() => {
      recordMeasurement();
    }, 1000); // 每秒记录一次
  }, []);

  // 停止测量
  const stopMeasurement = useCallback(() => {
    setState(prev => ({
      ...prev,
      isRecording: false,
      recordingStartTime: 0,
    }));

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    // 保存记录的数据
    if (recordingRef.current.length > 0) {
      const newMeasurements = [...state.measurements, ...recordingRef.current];
      setState(prev => ({ ...prev, measurements: newMeasurements }));
      saveMeasurements(newMeasurements);
    }
  }, [state.measurements, saveMeasurements]);

  // 记录测量
  const recordMeasurement = useCallback(() => {
    // 模拟测量数据（实际应用中应该从传感器获取）
    const measurement: MeasurementData = {
      id: `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      direction: Math.random() * 360,
      accuracy: Math.random() * 3 + 0.5, // 0.5-3.5度
      confidence: Math.random() * 0.5 + 0.5, // 0.5-1.0
      timestamp: Date.now(),
      location: getCurrentLocation(),
      notes: '',
      tags: [],
    };

    recordingRef.current.push(measurement);
    setState(prev => ({ ...prev, currentMeasurement: measurement }));

    if (onMeasurementSave) {
      onMeasurementSave(measurement);
    }
  }, [onMeasurementSave]);

  // 获取当前位置
  const getCurrentLocation = (): MeasurementData['location'] => {
    // 简化的位置获取
    return {
      lat: 39.9042 + (Math.random() - 0.5) * 0.01,
      lon: 116.4074 + (Math.random() - 0.5) * 0.01,
      address: '北京市朝阳区',
    };
  };

  // 添加测量
  // const addMeasurement = useCallback(
    (measurement: Omit<MeasurementData, 'id' | 'timestamp'>) => {
      const newMeasurement: MeasurementData = {
        ...measurement,
        id: `measurement_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        timestamp: Date.now(),
      };

      const newMeasurements = [...state.measurements, newMeasurement];
      setState(prev => ({ ...prev, measurements: newMeasurements }));
      saveMeasurements(newMeasurements);

      if (onMeasurementSave) {
        onMeasurementSave(newMeasurement);
      }
    },
    [state.measurements, saveMeasurements, onMeasurementSave]
  );

  // 删除测量
  const deleteMeasurement = useCallback(
    (id: string) => {
      const newMeasurements = state.measurements.filter(m => m.id !== id);
      setState(prev => ({ ...prev, measurements: newMeasurements }));
      saveMeasurements(newMeasurements);
    },
    [state.measurements, saveMeasurements]
  );

  // 批量删除测量
  const deleteSelectedMeasurements = useCallback(() => {
    const newMeasurements = state.measurements.filter(
      m => !state.selectedMeasurements.includes(m.id)
    );
    setState(prev => ({
      ...prev,
      measurements: newMeasurements,
      selectedMeasurements: [],
    }));
    saveMeasurements(newMeasurements);
  }, [state.measurements, state.selectedMeasurements, saveMeasurements]);

  // 选择测量
  const toggleMeasurementSelection = useCallback((id: string) => {
    setState(prev => ({
      ...prev,
      selectedMeasurements: prev.selectedMeasurements.includes(id)
        ? prev.selectedMeasurements.filter(i => i !== id)
        : [...prev.selectedMeasurements, id],
    }));
  }, []);

  // 全选/取消全选
  const toggleAllMeasurements = useCallback(() => {
    setState(prev => ({
      ...prev,
      selectedMeasurements:
        prev.selectedMeasurements.length === filteredMeasurements.length
          ? []
          : filteredMeasurements.map(m => m.id),
    }));
  }, []);

  // 导出测量数据
  const exportMeasurements = useCallback(() => {
    const dataToExport =
      state.selectedMeasurements.length > 0
        ? state.measurements.filter(m =>
            state.selectedMeasurements.includes(m.id)
          )
        : state.measurements;

    const exportData = {
      measurements: dataToExport,
      exportTime: new Date().toISOString(),
      totalCount: dataToExport.length,
      stats: calculateStats(dataToExport),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `compass_measurements_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    if (onMeasurementExport) {
      onMeasurementExport(dataToExport);
    }
  }, [state.measurements, state.selectedMeasurements, onMeasurementExport]);

  // 计算统计信息
  const calculateStats = (
    measurements: MeasurementData[]
  ): MeasurementStats => {
    if (measurements.length === 0) {
      return {
        total: 0,
        averageAccuracy: 0,
        averageConfidence: 0,
        bestAccuracy: 0,
        worstAccuracy: 0,
        dateRange: { start: new Date(), end: new Date() },
      };
    }

    const accuracies = measurements.map(m => m.accuracy);
    const confidences = measurements.map(m => m.confidence);
    const timestamps = measurements.map(m => m.timestamp);

    return {
      total: measurements.length,
      averageAccuracy:
        accuracies.reduce((sum, a) => sum + a, 0) / accuracies.length,
      averageConfidence:
        confidences.reduce((sum, c) => sum + c, 0) / confidences.length,
      bestAccuracy: Math.min(...accuracies),
      worstAccuracy: Math.max(...accuracies),
      dateRange: {
        start: new Date(Math.min(...timestamps)),
        end: new Date(Math.max(...timestamps)),
      },
    };
  };

  // 过滤测量数据
  const filteredMeasurements = state.measurements.filter(measurement => {
    const { dateRange, accuracyRange, tags } = state.filter;
    const measurementDate = new Date(measurement.timestamp);

    // 日期过滤
    if (dateRange.start && measurementDate < dateRange.start) return false;
    if (dateRange.end && measurementDate > dateRange.end) return false;

    // 精度过滤
    if (
      measurement.accuracy < accuracyRange.min ||
      measurement.accuracy > accuracyRange.max
    )
      return false;

    // 标签过滤
    if (
      tags.length > 0 &&
      (!measurement.tags || !tags.some(tag => measurement.tags!.includes(tag)))
    )
      return false;

    return true;
  });

  // 计算统计信息
  const stats = calculateStats(filteredMeasurements);

  return (
    <div className={`compass-measurement ${className}`}>
      <div className='bg-white p-6 rounded-lg shadow-lg'>
        <div className='flex justify-between items-center mb-6'>
          <h3 className='text-xl font-semibold'>测量记录</h3>
          <div className='flex gap-2'>
            <button
              onClick={state.isRecording ? stopMeasurement : startMeasurement}
              className={`px-4 py-2 text-sm rounded transition-colors ${
                state.isRecording
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-green-500 text-white hover:bg-green-600'
              }`}
            >
              {state.isRecording ? '停止测量' : '开始测量'}
            </button>
            <button
              onClick={exportMeasurements}
              className='px-4 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600'
            >
              导出数据
            </button>
          </div>
        </div>

        {/* 统计信息 */}
        <div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
          <div className='bg-blue-50 p-4 rounded-lg'>
            <div className='text-2xl font-bold text-blue-600'>
              {stats.total}
            </div>
            <div className='text-sm text-blue-600'>总测量数</div>
          </div>
          <div className='bg-green-50 p-4 rounded-lg'>
            <div className='text-2xl font-bold text-green-600'>
              ±{stats.averageAccuracy.toFixed(1)}°
            </div>
            <div className='text-sm text-green-600'>平均精度</div>
          </div>
          <div className='bg-yellow-50 p-4 rounded-lg'>
            <div className='text-2xl font-bold text-yellow-600'>
              {Math.round(stats.averageConfidence * 100)}%
            </div>
            <div className='text-sm text-yellow-600'>平均置信度</div>
          </div>
          <div className='bg-purple-50 p-4 rounded-lg'>
            <div className='text-2xl font-bold text-purple-600'>
              ±{stats.bestAccuracy.toFixed(1)}°
            </div>
            <div className='text-sm text-purple-600'>最佳精度</div>
          </div>
        </div>

        {/* 当前测量 */}
        {state.currentMeasurement && (
          <div className='mb-6 p-4 bg-gray-50 rounded-lg'>
            <h4 className='font-medium mb-2'>当前测量</h4>
            <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
              <div>
                <span className='text-gray-600'>方向:</span>{' '}
                {Math.round(state.currentMeasurement.direction)}°
              </div>
              <div>
                <span className='text-gray-600'>精度:</span> ±
                {state.currentMeasurement.accuracy.toFixed(1)}°
              </div>
              <div>
                <span className='text-gray-600'>置信度:</span>{' '}
                {Math.round(state.currentMeasurement.confidence * 100)}%
              </div>
              <div>
                <span className='text-gray-600'>时间:</span>{' '}
                {new Date(
                  state.currentMeasurement.timestamp
                ).toLocaleTimeString()}
              </div>
            </div>
          </div>
        )}

        {/* 测量列表 */}
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <h4 className='font-medium'>测量历史</h4>
            <div className='flex gap-2'>
              <button
                onClick={toggleAllMeasurements}
                className='px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300'
              >
                {state.selectedMeasurements.length ===
                filteredMeasurements.length
                  ? '取消全选'
                  : '全选'}
              </button>
              {state.selectedMeasurements.length > 0 && (
                <button
                  onClick={deleteSelectedMeasurements}
                  className='px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600'
                >
                  删除选中 ({state.selectedMeasurements.length})
                </button>
              )}
            </div>
          </div>

          {filteredMeasurements.length === 0 ? (
            <div className='text-center py-8 text-gray-500'>暂无测量数据</div>
          ) : (
            <div className='space-y-2 max-h-96 overflow-y-auto'>
              {filteredMeasurements.map(measurement => (
                <div
                  key={measurement.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    state.selectedMeasurements.includes(measurement.id)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <input
                        type='checkbox'
                        checked={state.selectedMeasurements.includes(
                          measurement.id
                        )}
                        onChange={() =>
                          toggleMeasurementSelection(measurement.id)
                        }
                        className='w-4 h-4 text-blue-600'
                      />
                      <div className='grid grid-cols-2 md:grid-cols-4 gap-4 text-sm'>
                        <div>
                          <span className='text-gray-600'>方向:</span>{' '}
                          {Math.round(measurement.direction)}°
                        </div>
                        <div>
                          <span className='text-gray-600'>精度:</span> ±
                          {measurement.accuracy.toFixed(1)}°
                        </div>
                        <div>
                          <span className='text-gray-600'>置信度:</span>{' '}
                          {Math.round(measurement.confidence * 100)}%
                        </div>
                        <div>
                          <span className='text-gray-600'>时间:</span>{' '}
                          {new Date(measurement.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteMeasurement(measurement.id)}
                      className='px-2 py-1 text-sm text-red-600 hover:bg-red-50 rounded'
                    >
                      删除
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CompassMeasurement;

