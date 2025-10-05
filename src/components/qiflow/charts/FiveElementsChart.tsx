'use client';

import { cn } from '@/lib/utils';
import React from 'react';

export type FiveElementsData = {
  wood?: number;
  fire?: number;
  earth?: number;
  metal?: number;
  water?: number;
};

const ELEMENTS = [
  {
    key: 'wood',
    label: '木',
    color: 'bg-green-500',
    textColor: 'text-green-700',
  },
  { key: 'fire', label: '火', color: 'bg-red-500', textColor: 'text-red-700' },
  {
    key: 'earth',
    label: '土',
    color: 'bg-yellow-500',
    textColor: 'text-yellow-700',
  },
  {
    key: 'metal',
    label: '金',
    color: 'bg-gray-400',
    textColor: 'text-gray-700',
  },
  {
    key: 'water',
    label: '水',
    color: 'bg-blue-500',
    textColor: 'text-blue-700',
  },
] as const;

export function FiveElementsChart({
  elements,
  className = '',
  variant = 'bar',
}: {
  elements?: FiveElementsData;
  className?: string;
  variant?: 'bar' | 'radial';
}) {
  // 计算总和用于百分比
  const total =
    (elements?.wood ?? 0) +
    (elements?.fire ?? 0) +
    (elements?.earth ?? 0) +
    (elements?.metal ?? 0) +
    (elements?.water ?? 0);

  if (variant === 'radial') {
    return (
      <div
        className={cn('flex items-center justify-center', className)}
        data-testid="five-elements-radial"
      >
        <div className="relative h-48 w-48">
          {ELEMENTS.map((elem, idx) => {
            const value = elements?.[elem.key as keyof FiveElementsData] ?? 0;
            const percentage = total > 0 ? (value / total) * 100 : 0;
            const angle = idx * 72 - 90; // 每个元素占72度
            const radius = 60;
            const x = 96 + radius * Math.cos((angle * Math.PI) / 180);
            const y = 96 + radius * Math.sin((angle * Math.PI) / 180);

            return (
              <div
                key={elem.key}
                className="absolute flex flex-col items-center"
                style={{
                  left: `${x}px`,
                  top: `${y}px`,
                  transform: 'translate(-50%, -50%)',
                }}
              >
                <div
                  className={cn(
                    'flex h-12 w-12 items-center justify-center rounded-full text-white font-bold',
                    elem.color
                  )}
                  style={{
                    opacity:
                      percentage > 0 ? 0.3 + (percentage / 100) * 0.7 : 0.2,
                  }}
                >
                  {elem.label}
                </div>
                <span className="mt-1 text-xs font-medium">{value}</span>
              </div>
            );
          })}
          <div className="absolute left-1/2 top-1/2 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-muted bg-background">
            <span className="text-xs text-muted-foreground">五行</span>
          </div>
        </div>
      </div>
    );
  }

  // Bar chart variant (default)
  return (
    <div className={cn('space-y-3', className)} data-testid="five-elements-bar">
      {ELEMENTS.map((elem) => {
        const value = elements?.[elem.key as keyof FiveElementsData] ?? 0;
        const percentage = total > 0 ? (value / total) * 100 : 0;

        return (
          <div key={elem.key} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className={cn('font-medium', elem.textColor)}>
                {elem.label}
              </span>
              <span className="text-muted-foreground">
                {value} ({percentage.toFixed(0)}%)
              </span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div
                className={cn('h-full transition-all', elem.color)}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
