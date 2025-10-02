import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    Target,
    // ArrowRight,
    X,
} from 'lucide-react';
import React, { useEffect, useRef, useState } from 'react';

interface GuideStep {
  target: string;
  title: string;
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right' | 'center';
  action?: 'click' | 'input' | 'next' | 'complete';
  optional?: boolean;
  delay?: number;
}

interface OnboardingGuideProps {
  steps: GuideStep[];
  isActive: boolean;
  onComplete: () => void;
  onSkip: () => void;
  autoStart?: boolean;
  showProgress?: boolean;
  theme?: 'light' | 'dark';
}

export function OnboardingGuide({
  steps,
  isActive,
  onComplete,
  onSkip,
  autoStart = true,
  showProgress = true,
  theme = 'light'
}: OnboardingGuideProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const [highlightStyle, setHighlightStyle] = useState<React.CSSProperties>({});
  const overlayRef = useRef<HTMLDivElement>(null);

  // 启动引导
  useEffect(() => {
    if (isActive && autoStart) {
      const timer = setTimeout(() => {
        setIsVisible(true);
        updateTargetPosition();
      }, 500);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [isActive, autoStart]);

  // 更新目标元素位置
  const updateTargetPosition = () => {
    const currentStepData = steps[currentStep];
    if (!currentStepData) return;

    const targetElement = document.querySelector(currentStepData.target);
    if (targetElement) {
      const rect = targetElement.getBoundingClientRect();
      setTargetRect(rect);
      
      // 设置高亮样式
      setHighlightStyle({
        position: 'fixed',
        top: rect.top - 4,
        left: rect.left - 4,
        width: rect.width + 8,
        height: rect.height + 8,
        zIndex: 9999,
        pointerEvents: 'none',
        borderRadius: '8px',
        boxShadow: '0 0 0 4px rgba(59, 130, 246, 0.3), 0 0 20px rgba(59, 130, 246, 0.2)',
        border: '2px solid #3b82f6',
        animation: 'pulse 2s infinite'
      });
    }
  };

  // 监听窗口大小变化
  useEffect(() => {
    const handleResize = () => {
      if (isVisible) updateTargetPosition();
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize);
    };
  }, [isVisible, currentStep]);

  // 步骤变化时更新位置
  useEffect(() => {
    if (isVisible) {
      const timer = setTimeout(updateTargetPosition, 100);
      return () => clearTimeout(timer);
    }
    return undefined;
  }, [currentStep, isVisible]);

  // 下一步
  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleComplete();
    }
  };

  // 上一步
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  // 完成引导
  const handleComplete = () => {
    setIsVisible(false);
    onComplete();
  };

  // 跳过引导
  const handleSkip = () => {
    setIsVisible(false);
    onSkip();
  };

  // 跳到指定步骤
  const goToStep = (stepIndex: number) => {
    if (stepIndex >= 0 && stepIndex < steps.length) {
      setCurrentStep(stepIndex);
    }
  };

  // 计算提示框位置
  const getTooltipPosition = (): React.CSSProperties => {
    if (!targetRect) return {};

    const currentStepData = steps[currentStep];
    const position = currentStepData?.position || 'bottom';
    const tooltipWidth = 320;
    const tooltipHeight = 200;
    const offset = 16;

    let top = 0;
    let left = 0;

    switch (position) {
      case 'top':
        top = targetRect.top - tooltipHeight - offset;
        left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
        break;
      case 'bottom':
        top = targetRect.bottom + offset;
        left = targetRect.left + (targetRect.width - tooltipWidth) / 2;
        break;
      case 'left':
        top = targetRect.top + (targetRect.height - tooltipHeight) / 2;
        left = targetRect.left - tooltipWidth - offset;
        break;
      case 'right':
        top = targetRect.top + (targetRect.height - tooltipHeight) / 2;
        left = targetRect.right + offset;
        break;
      case 'center':
        top = window.innerHeight / 2 - tooltipHeight / 2;
        left = window.innerWidth / 2 - tooltipWidth / 2;
        break;
    }

    // 确保提示框在可视区域内
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    return {
      position: 'fixed',
      top,
      left,
      width: tooltipWidth,
      zIndex: 10000
    };
  };

  if (!isVisible || !steps.length) return null;

  const currentStepData = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const completedSteps = currentStep;
  const progressPercentage = ((completedSteps + 1) / steps.length) * 100;

  return (
    <>
      {/* CSS 动画样式 */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .guide-tooltip {
          animation: fadeIn 0.3s ease-out;
        }
      `}</style>

      {/* 遮罩层 */}
      <div
        ref={overlayRef}
        className="fixed inset-0 bg-black bg-opacity-50 z-[9998]"
        onClick={(e) => {
          // 点击遮罩层以外的区域不关闭
          e.stopPropagation();
        }}
      >
        {/* 目标元素高亮 */}
        {targetRect && (
          <div style={highlightStyle} />
        )}

        {/* 引导提示框 */}
        <Card 
          className={cn(
            "guide-tooltip shadow-2xl border-0",
            theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white'
          )}
          style={getTooltipPosition()}
        >
          <div className="p-6">
            {/* 头部 */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Target className="w-5 h-5 text-blue-500" />
                <span className="font-semibold text-lg">
                  {currentStepData.title}
                </span>
                {currentStepData.optional && (
                  <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                    可选
                  </span>
                )}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSkip}
                className="h-6 w-6 p-0"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* 进度条 */}
            {showProgress && (
              <div className="mb-4">
                <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
                  <span>第 {currentStep + 1} 步，共 {steps.length} 步</span>
                  <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            )}

            {/* 内容 */}
            <div className="mb-6">
              <p className="text-gray-700 leading-relaxed">
                {currentStepData.content}
              </p>
            </div>

            {/* 步骤操作提示 */}
            {currentStepData.action && (
              <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="flex items-center space-x-2 text-blue-800">
                  <CheckCircle className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {currentStepData.action === 'click' && '点击高亮的元素继续'}
                    {currentStepData.action === 'input' && '在高亮的输入框中输入内容'}
                    {currentStepData.action === 'next' && '点击"下一步"继续'}
                    {currentStepData.action === 'complete' && '点击"完成"结束引导'}
                  </span>
                </div>
              </div>
            )}

            {/* 底部按钮 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevious}
                  disabled={currentStep === 0}
                  className="flex items-center space-x-1"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>上一步</span>
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleSkip}
                  className="text-gray-500"
                >
                  跳过引导
                </Button>
              </div>

              <div className="flex items-center space-x-2">
                {!isLastStep ? (
                  <Button
                    onClick={handleNext}
                    size="sm"
                    className="flex items-center space-x-1"
                  >
                    <span>下一步</span>
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={handleComplete}
                    size="sm"
                    className="flex items-center space-x-1 bg-green-600 hover:bg-green-700"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>完成</span>
                  </Button>
                )}
              </div>
            </div>

            {/* 步骤指示器 */}
            {showProgress && steps.length > 1 && (
              <div className="flex items-center justify-center space-x-2 mt-4 pt-4 border-t border-gray-200">
                {steps.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => goToStep(index)}
                    className={cn(
                      "w-3 h-3 rounded-full transition-all duration-200",
                      index === currentStep
                        ? "bg-blue-500 ring-2 ring-blue-200"
                        : index < currentStep
                        ? "bg-green-500"
                        : "bg-gray-300 hover:bg-gray-400"
                    )}
                    title={`步骤 ${index + 1}: ${steps[index].title}`}
                  />
                ))}
              </div>
            )}
          </div>
        </Card>
      </div>
    </>
  );
}

// 引导步骤配置
export const BAZI_ANALYSIS_GUIDE: GuideStep[] = [
  {
    target: '#display-name',
    title: '输入显示名称',
    content: '请输入您希望在平台上显示的名称。这个名称可以随时修改，其他用户将看到此名称。',
    position: 'bottom',
    action: 'input'
  },
  {
    target: '#gender',
    title: '选择性别',
    content: '性别信息对八字分析很重要。传统命理学中，性别会影响某些推算方式和解释角度。',
    position: 'bottom',
    action: 'click'
  },
  {
    target: '#birth-date',
    title: '设置出生日期',
    content: '准确的出生日期是八字计算的基础。请确保选择正确的日期，这将直接影响分析结果的准确性。',
    position: 'bottom',
    action: 'click'
  },
  {
    target: '#birth-time',
    title: '设置出生时间 (可选)',
    content: '如果知道确切的出生时间，请填写。精确的时间能让八字分析更加准确，但如果不确定可以留空。',
    position: 'bottom',
    action: 'input',
    optional: true
  },
  {
    target: '#address',
    title: '输入出生地点',
    content: '出生地点用于计算真太阳时，提高八字分析的精确度。支持地址搜索和地图选择。',
    position: 'top',
    action: 'input'
  },
  {
    target: 'button[type="submit"]',
    title: '开始分析',
    content: '点击这里开始您的专属八字分析！系统将基于您提供的信息生成详细的命理报告。',
    position: 'top',
    action: 'complete'
  }
];

// 使用示例 Hook
export function useOnboardingGuide(guideKey: string) {
  const [isActive, setIsActive] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);

  useEffect(() => {
    // 检查用户是否已完成此引导
    const completed = localStorage.getItem(`onboarding_${guideKey}`);
    if (!completed) {
      setIsActive(true);
    } else {
      setHasCompleted(true);
    }
  }, [guideKey]);

  const startGuide = () => {
    setIsActive(true);
  };

  const completeGuide = () => {
    setIsActive(false);
    setHasCompleted(true);
    localStorage.setItem(`onboarding_${guideKey}`, 'completed');
  };

  const skipGuide = () => {
    setIsActive(false);
    setHasCompleted(true);
    localStorage.setItem(`onboarding_${guideKey}`, 'skipped');
  };

  const resetGuide = () => {
    setIsActive(true);
    setHasCompleted(false);
    localStorage.removeItem(`onboarding_${guideKey}`);
  };

  return {
    isActive,
    hasCompleted,
    startGuide,
    completeGuide,
    skipGuide,
    resetGuide
  };
}