'use client';

import type { LucideIcon } from 'lucide-react';
import { memo } from 'react';

interface Step {
  id: number;
  title: string;
  icon: LucideIcon;
  description: string;
}

interface StepIndicatorProps {
  steps: Step[];
  currentStep: number;
}

export const StepIndicator = memo(function StepIndicator({
  steps,
  currentStep
}: StepIndicatorProps) {
  return (
    <nav className='flex items-center justify-center space-x-4 mb-8' aria-label='进度指示器'>
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isActive = currentStep === step.id;
        const isCompleted = currentStep > step.id;

        return (
          <div key={step.id} className='flex items-center'>
            <div
              className={`flex items-center justify-center w-12 h-12 rounded-full border-2 transition-all duration-300 ${
                isActive
                  ? 'border-blue-500 bg-blue-500 text-white shadow-lg'
                  : isCompleted
                    ? 'border-green-500 bg-green-500 text-white'
                    : 'border-gray-300 bg-white text-gray-400'
              }`}
              role='img'
              aria-label={`${step.title} - ${isCompleted ? '已完成' : isActive ? '进行中' : '未开始'}`}
            >
              <Icon className='w-6 h-6' aria-hidden='true' />
            </div>
            {index < steps.length - 1 && (
              <div
                className={`w-16 h-0.5 mx-2 transition-all duration-300 ${
                  isCompleted ? 'bg-green-500' : 'bg-gray-300'
                }`}
                aria-hidden='true'
              />
            )}
          </div>
        );
      })}
    </nav>
  );
});
