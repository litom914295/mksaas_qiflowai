/**
 * 校准状态指示器组件
 * 实时显示校准状态和质量
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { useEffect, useState } from 'react';

interface CalibrationStatusProps {
  algorithm: 'bazi' | 'xuankong' | 'compass';
  confidence: number;
  isCalibrated?: boolean;
  lastCalibrationTime?: Date;
  className?: string;
}

export function CalibrationStatus({
  algorithm,
  confidence,
  isCalibrated = false,
  lastCalibrationTime,
  className,
}: CalibrationStatusProps) {
  const [qualityScore, setQualityScore] = useState(0);

  useEffect(() => {
    // 计算校准质量分数
    let score = confidence * 100;

    if (isCalibrated) {
      score += 10;
    }

    if (lastCalibrationTime) {
      const hoursSinceCalibration =
        (Date.now() - lastCalibrationTime.getTime()) / (1000 * 60 * 60);

      if (hoursSinceCalibration < 1) {
        score += 5;
      } else if (hoursSinceCalibration < 24) {
        score += 2;
      }
    }

    setQualityScore(Math.min(100, score));
  }, [confidence, isCalibrated, lastCalibrationTime]);

  const getQualityLevel = (): 'excellent' | 'good' | 'fair' | 'poor' => {
    if (qualityScore >= 90) return 'excellent';
    if (qualityScore >= 75) return 'good';
    if (qualityScore >= 60) return 'fair';
    return 'poor';
  };

  const getQualityConfig = () => {
    const level = getQualityLevel();

    switch (level) {
      case 'excellent':
        return {
          label: '优秀',
          color: 'bg-green-500',
          textColor: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '🌟',
          message: '校准状态极佳，可以获得高质量的分析结果',
        };
      case 'good':
        return {
          label: '良好',
          color: 'bg-blue-500',
          textColor: 'text-blue-700',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          icon: '✨',
          message: '校准状态良好，分析结果可信',
        };
      case 'fair':
        return {
          label: '一般',
          color: 'bg-yellow-500',
          textColor: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '⚡',
          message: '建议进行校准以提高结果准确性',
        };
      case 'poor':
        return {
          label: '较差',
          color: 'bg-red-500',
          textColor: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '⚠️',
          message: '强烈建议进行校准',
        };
    }
  };

  const config = getQualityConfig();

  return (
    <Card className={cn('w-full', className)}>
      <CardContent className="pt-6">
        <div className="space-y-4">
          {/* 质量分数 */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{config.icon}</span>
              <div>
                <div className="font-medium">校准质量</div>
                <div className={cn('text-sm', config.textColor)}>
                  {config.label}
                </div>
              </div>
            </div>

            <div className="text-right">
              <div className="text-2xl font-bold">
                {Math.round(qualityScore)}
              </div>
              <div className="text-xs text-gray-500">/ 100</div>
            </div>
          </div>

          {/* 进度条 */}
          <div className="space-y-2">
            <Progress value={qualityScore} className="h-2" />
            <p className={cn('text-xs', config.textColor)}>{config.message}</p>
          </div>

          {/* 详细状态 */}
          <div
            className={cn(
              'p-3 rounded-lg border',
              config.bgColor,
              config.borderColor
            )}
          >
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-gray-600 mb-1">校准状态</div>
                <Badge variant={isCalibrated ? 'default' : 'secondary'}>
                  {isCalibrated ? '已校准' : '未校准'}
                </Badge>
              </div>

              <div>
                <div className="text-gray-600 mb-1">置信度</div>
                <Badge variant="outline">{Math.round(confidence * 100)}%</Badge>
              </div>

              {lastCalibrationTime && (
                <div className="col-span-2">
                  <div className="text-gray-600 mb-1">上次校准</div>
                  <div className="text-xs">
                    {formatCalibrationTime(lastCalibrationTime)}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* 算法特定信息 */}
          <AlgorithmSpecificInfo
            algorithm={algorithm}
            confidence={confidence}
          />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 算法特定信息组件
 */
function AlgorithmSpecificInfo({
  algorithm,
  confidence,
}: {
  algorithm: 'bazi' | 'xuankong' | 'compass';
  confidence: number;
}) {
  const getAlgorithmInfo = () => {
    switch (algorithm) {
      case 'bazi':
        return {
          name: '八字分析',
          factors: [
            { name: '时间准确性', value: confidence },
            { name: '信息完整性', value: confidence * 0.9 },
            { name: '时区正确性', value: confidence * 1.1 },
          ],
        };
      case 'xuankong':
        return {
          name: '玄空风水',
          factors: [
            { name: '朝向准确性', value: confidence },
            { name: '测量位置', value: confidence * 0.95 },
            { name: '环境条件', value: confidence * 1.05 },
          ],
        };
      case 'compass':
        return {
          name: '罗盘测量',
          factors: [
            { name: '传感器状态', value: confidence },
            { name: '磁场环境', value: confidence * 0.9 },
            { name: '校准状态', value: confidence * 1.1 },
            { name: '设备姿态', value: confidence * 0.95 },
          ],
        };
    }
  };

  const info = getAlgorithmInfo();

  return (
    <div className="space-y-2">
      <div className="text-sm font-medium text-gray-700">
        {info.name} - 影响因素
      </div>
      <div className="space-y-1">
        {info.factors.map((factor) => (
          <div key={factor.name} className="flex items-center gap-2">
            <div className="text-xs text-gray-600 w-24">{factor.name}</div>
            <div className="flex-1">
              <div className="h-1.5 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={cn(
                    'h-full transition-all duration-300',
                    factor.value >= 0.7
                      ? 'bg-green-500'
                      : factor.value >= 0.4
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                  )}
                  style={{ width: `${Math.min(100, factor.value * 100)}%` }}
                />
              </div>
            </div>
            <div className="text-xs text-gray-500 w-12 text-right">
              {Math.round(Math.min(100, factor.value * 100))}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * 格式化校准时间
 */
function formatCalibrationTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) {
    return '刚刚';
  }
  if (diffMins < 60) {
    return `${diffMins}分钟前`;
  }
  if (diffHours < 24) {
    return `${diffHours}小时前`;
  }
  if (diffDays < 7) {
    return `${diffDays}天前`;
  }
  return date.toLocaleDateString('zh-CN');
}
