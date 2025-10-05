/**
 * 校准引导组件
 * 为置信度0.7~0.9的情况提供校准和环境检查引导
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getConfidenceLevel } from '@/config/qiflow-thresholds';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface CalibrationGuideProps {
  algorithm: 'bazi' | 'xuankong' | 'compass';
  confidence: number;
  onCalibrationComplete?: () => void;
  onSkip?: () => void;
  className?: string;
}

export function CalibrationGuide({
  algorithm,
  confidence,
  onCalibrationComplete,
  onSkip,
  className,
}: CalibrationGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);

  const level = getConfidenceLevel(confidence);

  // 只在置信度0.4~0.7时显示校准引导
  if (level !== 'warning') {
    return null;
  }

  const calibrationSteps = getCalibrationSteps(algorithm);

  const handleNextStep = () => {
    if (currentStep < calibrationSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleStartCalibration = () => {
    setIsCalibrating(true);
    setCalibrationProgress(0);

    // 模拟校准过程
    const interval = setInterval(() => {
      setCalibrationProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsCalibrating(false);
          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  const handleComplete = () => {
    onCalibrationComplete?.();
  };

  return (
    <Card className={cn('w-full max-w-2xl mx-auto', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <span className="text-yellow-500">⚠️</span>
          建议进行校准
        </CardTitle>
        <CardDescription>
          当前置信度为 {Math.round(confidence * 100)}
          %，建议进行校准和环境检查以获得更准确的结果
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 置信度提示 */}
        <Alert>
          <AlertDescription>
            <div className="space-y-2">
              <div className="font-medium">为什么需要校准？</div>
              <p className="text-sm">
                当前分析结果置信度处于中等水平（40%-70%），通过以下步骤可以提高结果的准确性：
              </p>
              <ul className="list-disc list-inside text-sm space-y-1">
                <li>检查输入信息的完整性和准确性</li>
                <li>确保测量环境符合要求</li>
                <li>进行设备校准（如需要）</li>
              </ul>
            </div>
          </AlertDescription>
        </Alert>

        {/* 校准步骤 */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">校准步骤</h3>
            <Badge variant="outline">
              步骤 {currentStep + 1} / {calibrationSteps.length}
            </Badge>
          </div>

          <div className="relative">
            {/* 步骤进度条 */}
            <div className="absolute top-6 left-4 right-4 h-0.5 bg-gray-200">
              <div
                className="h-full bg-blue-500 transition-all duration-300"
                style={{
                  width: `${(currentStep / (calibrationSteps.length - 1)) * 100}%`,
                }}
              />
            </div>

            {/* 步骤列表 */}
            <div className="relative space-y-4">
              {calibrationSteps.map((step, index) => (
                <div
                  key={index}
                  className={cn(
                    'p-4 rounded-lg border transition-all',
                    index === currentStep
                      ? 'border-blue-500 bg-blue-50'
                      : index < currentStep
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 bg-gray-50'
                  )}
                >
                  <div className="flex items-start gap-3">
                    {/* 步骤图标 */}
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                        index === currentStep
                          ? 'bg-blue-500 text-white'
                          : index < currentStep
                            ? 'bg-green-500 text-white'
                            : 'bg-gray-300 text-gray-600'
                      )}
                    >
                      {index < currentStep ? '✓' : index + 1}
                    </div>

                    {/* 步骤内容 */}
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600">
                        {step.description}
                      </p>

                      {/* 当前步骤的详细说明 */}
                      {index === currentStep && step.details && (
                        <div className="mt-3 p-3 bg-white rounded border">
                          <div className="text-sm space-y-2">
                            {step.details.map((detail, detailIndex) => (
                              <div
                                key={detailIndex}
                                className="flex items-start gap-2"
                              >
                                <span className="text-blue-500 mt-0.5">•</span>
                                <span>{detail}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* 当前步骤的操作按钮 */}
                      {index === currentStep && step.action && (
                        <div className="mt-3">
                          <Button
                            size="sm"
                            onClick={() => {
                              if (step.action?.type === 'calibrate') {
                                handleStartCalibration();
                              } else {
                                handleNextStep();
                              }
                            }}
                            disabled={isCalibrating}
                          >
                            {step.action.label}
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 校准进度 */}
          {isCalibrating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>校准中...</span>
                <span>{calibrationProgress}%</span>
              </div>
              <Progress value={calibrationProgress} />
            </div>
          )}

          {/* 导航按钮 */}
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handlePrevStep}
              disabled={currentStep === 0 || isCalibrating}
              className="flex-1"
            >
              上一步
            </Button>
            <Button
              onClick={
                currentStep === calibrationSteps.length - 1
                  ? handleComplete
                  : handleNextStep
              }
              disabled={isCalibrating}
              className="flex-1"
            >
              {currentStep === calibrationSteps.length - 1
                ? '完成校准'
                : '下一步'}
            </Button>
          </div>

          {/* 跳过按钮 */}
          <div className="text-center">
            <Button variant="ghost" size="sm" onClick={onSkip}>
              跳过校准，使用当前结果
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 获取算法特定的校准步骤
 */
function getCalibrationSteps(algorithm: 'bazi' | 'xuankong' | 'compass') {
  switch (algorithm) {
    case 'bazi':
      return [
        {
          title: '检查出生信息',
          description: '确认出生日期和时间的准确性',
          details: [
            '确认出生日期是否正确（年月日）',
            '确认出生时间是否准确（精确到小时）',
            '确认时区设置是否正确',
            '如果不确定时间，请选择"时间未知"',
          ],
        },
        {
          title: '确认性别信息',
          description: '性别信息对八字分析很重要',
          details: ['确认性别选择是否正确', '性别会影响大运排盘方向'],
        },
        {
          title: '检查环境因素',
          description: '确保分析环境适宜',
          details: [
            '在安静的环境中进行分析',
            '避免情绪波动较大时进行',
            '建议在清晨或心境平和时分析',
          ],
        },
        {
          title: '重新计算',
          description: '使用校准后的信息重新计算',
          action: {
            type: 'recalculate' as const,
            label: '重新计算八字',
          },
        },
      ];

    case 'xuankong':
      return [
        {
          title: '测量环境检查',
          description: '确保测量环境符合要求',
          details: [
            '确保站在房屋中心位置',
            '远离大型金属物体和电子设备',
            '避免在磁场干扰较大的区域测量',
            '保持手机水平，避免倾斜',
          ],
        },
        {
          title: '朝向确认',
          description: '确认房屋朝向的准确性',
          details: [
            '确认朝向是指向门的方向还是坐向',
            '使用罗盘工具进行精确测量',
            '多次测量取平均值',
            '记录测量时间和天气状况',
          ],
          action: {
            type: 'measure' as const,
            label: '使用罗盘测量',
          },
        },
        {
          title: '数据验证',
          description: '验证输入的朝向数据',
          details: [
            '确认朝向角度在0-359度之间',
            '对比多次测量结果',
            '考虑磁偏角修正',
          ],
        },
        {
          title: '重新分析',
          description: '使用校准后的朝向重新分析',
          action: {
            type: 'recalculate' as const,
            label: '重新分析风水',
          },
        },
      ];

    case 'compass':
      return [
        {
          title: '传感器检查',
          description: '确保设备传感器正常工作',
          details: [
            '检查加速度计是否工作正常',
            '检查磁力计是否工作正常',
            '检查陀螺仪是否工作正常',
            '重启设备如果传感器异常',
          ],
        },
        {
          title: '环境检查',
          description: '确保测量环境符合要求',
          details: [
            '远离强磁场和电磁干扰源',
            '避开金属物体、电器设备',
            '在室外开阔地测量效果最佳',
            '避免在高压线、变电站附近测量',
          ],
        },
        {
          title: '罗盘校准',
          description: '执行8字形校准动作',
          details: [
            '保持手机水平',
            '在空中画8字形，持续10秒',
            '确保动作流畅连续',
            '重复3次直到校准成功',
          ],
          action: {
            type: 'calibrate' as const,
            label: '开始校准',
          },
        },
        {
          title: '验证校准',
          description: '测试校准效果',
          details: [
            '转动设备观察方向变化',
            '与已知方向对比',
            '多次测量验证稳定性',
          ],
        },
        {
          title: '重新测量',
          description: '使用校准后的罗盘重新测量',
          action: {
            type: 'recalculate' as const,
            label: '重新测量方向',
          },
        },
      ];
  }
}
