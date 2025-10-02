'use client';

import { CheckCircle, Circle } from 'lucide-react';
import { useMemo } from 'react';

export type ProgressStep = {
  id: string;
  label: string;
  completed: boolean;
  current?: boolean;
  optional?: boolean;
};

export type ProgressBarProps = {
  steps: ProgressStep[];
  className?: string;
  showLabels?: boolean;
  orientation?: 'horizontal' | 'vertical';
};

export function ProgressBar(props: ProgressBarProps) {
  const { steps, className = '', showLabels = true, orientation = 'horizontal' } = props;

  const progressPercentage = useMemo(() => {
    const completedSteps = steps.filter(step => step.completed).length;
    return (completedSteps / steps.length) * 100;
  }, [steps]);

  // const currentStepIndex = useMemo(() => {
  //   return steps.findIndex(step => step.current);
  // }, [steps]);

  if (orientation === 'vertical') {
    return (
      <div className={`space-y-4 ${className}`}>
        {steps.map((step, index) => (
          <div key={step.id} className="flex items-start gap-3">
            <div className="flex flex-col items-center">
              <div className={`
                w-8 h-8 rounded-full flex items-center justify-center border-2
                ${step.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : step.current 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }
              `}>
                {step.completed ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <Circle className="w-5 h-5" />
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`
                  w-0.5 h-8 mt-2
                  ${step.completed ? 'bg-green-500' : 'bg-gray-300'}
                `} />
              )}
            </div>
            <div className="flex-1 pt-1">
              {showLabels && (
                <div className={`
                  text-sm font-medium
                  ${step.completed ? 'text-green-600' : step.current ? 'text-blue-600' : 'text-gray-500'}
                `}>
                  {step.label}
                  {step.optional && <span className="text-gray-400 ml-1">(可选)</span>}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className={`w-full ${className}`}>
      {/* 进度条 */}
      <div className="relative">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-500 h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        
        {/* 步骤指示器 */}
        <div className="flex justify-between mt-2">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`
                w-6 h-6 rounded-full flex items-center justify-center border-2 -mt-4
                ${step.completed 
                  ? 'bg-green-500 border-green-500 text-white' 
                  : step.current 
                    ? 'bg-blue-500 border-blue-500 text-white'
                    : 'bg-white border-gray-300 text-gray-400'
                }
              `}>
                {step.completed ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  <span className="text-xs font-medium">{index + 1}</span>
                )}
              </div>
              {showLabels && (
                <div className={`
                  text-xs mt-1 text-center max-w-20
                  ${step.completed ? 'text-green-600' : step.current ? 'text-blue-600' : 'text-gray-500'}
                `}>
                  {step.label}
                  {step.optional && <span className="block text-gray-400">(可选)</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 进度信息 */}
      <div className="mt-3 flex justify-between items-center text-sm text-gray-600">
        <span>
          完成 {steps.filter(step => step.completed).length} / {steps.length} 项
        </span>
        <span>
          {Math.round(progressPercentage)}% 完成
        </span>
      </div>
    </div>
  );
}
