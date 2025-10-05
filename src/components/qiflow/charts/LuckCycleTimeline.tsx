'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';

export type LuckCycle = {
  age: number;
  startYear: number;
  endYear: number;
  heavenly: string;
  earthly: string;
  element: string;
  quality: 'excellent' | 'good' | 'neutral' | 'challenging';
  description?: string;
};

const QUALITY_COLORS = {
  excellent: 'bg-green-500 border-green-600',
  good: 'bg-blue-500 border-blue-600',
  neutral: 'bg-gray-400 border-gray-500',
  challenging: 'bg-orange-500 border-orange-600',
};

const QUALITY_LABELS = {
  excellent: '大吉',
  good: '较吉',
  neutral: '平',
  challenging: '需谨慎',
};

export function LuckCycleTimeline({
  cycles,
  currentAge,
  className = '',
}: {
  cycles: LuckCycle[];
  currentAge?: number;
  className?: string;
}) {
  if (!cycles || cycles.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        暂无大运数据
      </div>
    );
  }

  return (
    <div
      className={cn('relative space-y-6', className)}
      data-testid="luck-cycle-timeline"
    >
      {/* 时间线主轴 */}
      <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border" />

      {cycles.map((cycle, index) => {
        const isCurrent =
          currentAge &&
          currentAge >= cycle.age &&
          currentAge < (cycles[index + 1]?.age || cycle.age + 10);

        return (
          <div key={index} className="relative pl-20">
            {/* 时间节点 */}
            <div
              className={cn(
                'absolute left-5 top-2 h-6 w-6 rounded-full border-4 bg-background',
                isCurrent
                  ? 'border-primary ring-4 ring-primary/20'
                  : 'border-muted-foreground/30'
              )}
            >
              {isCurrent && (
                <div className="absolute inset-0 animate-ping rounded-full bg-primary opacity-75" />
              )}
            </div>

            {/* 年龄标记 */}
            <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center">
              <span
                className={cn(
                  'text-xs font-medium',
                  isCurrent ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {cycle.age}岁
              </span>
            </div>

            {/* 大运信息卡片 */}
            <div
              className={cn(
                'rounded-lg border bg-card p-4 transition-all',
                isCurrent && 'ring-2 ring-primary shadow-lg'
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 space-y-2">
                  {/* 干支和时间 */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">
                        {cycle.heavenly}
                      </span>
                      <span className="text-2xl font-bold">
                        {cycle.earthly}
                      </span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {cycle.element}
                    </Badge>
                    {isCurrent && <Badge className="animate-pulse">当前</Badge>}
                  </div>

                  {/* 年份范围 */}
                  <div className="text-sm text-muted-foreground">
                    {cycle.startYear} - {cycle.endYear}年
                    <span className="mx-2">·</span>
                    <span>{cycle.endYear - cycle.startYear + 1}年</span>
                  </div>

                  {/* 描述 */}
                  {cycle.description && (
                    <p className="text-sm text-muted-foreground">
                      {cycle.description}
                    </p>
                  )}
                </div>

                {/* 品质标记 */}
                <div className="flex flex-col items-end gap-2">
                  <div
                    className={cn(
                      'h-12 w-12 rounded-full border-4 flex items-center justify-center text-white font-bold text-xs',
                      QUALITY_COLORS[cycle.quality]
                    )}
                  >
                    {QUALITY_LABELS[cycle.quality]}
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

/**
 * 简化版大运时间线 - 水平显示
 */
export function LuckCycleTimelineHorizontal({
  cycles,
  currentAge,
  className = '',
}: {
  cycles: LuckCycle[];
  currentAge?: number;
  className?: string;
}) {
  if (!cycles || cycles.length === 0) return null;

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="flex gap-4 pb-4 min-w-max">
        {cycles.map((cycle, index) => {
          const isCurrent =
            currentAge &&
            currentAge >= cycle.age &&
            currentAge < (cycles[index + 1]?.age || cycle.age + 10);

          return (
            <div
              key={index}
              className={cn(
                'flex flex-col items-center gap-2 rounded-lg border bg-card p-3 w-32 transition-all',
                isCurrent && 'ring-2 ring-primary shadow-lg'
              )}
            >
              <div className="text-xs text-muted-foreground">{cycle.age}岁</div>
              <div className="text-lg font-bold">
                {cycle.heavenly}
                {cycle.earthly}
              </div>
              <Badge variant="outline" className="text-xs">
                {cycle.element}
              </Badge>
              <div
                className={cn(
                  'mt-1 h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold',
                  QUALITY_COLORS[cycle.quality]
                )}
              >
                {QUALITY_LABELS[cycle.quality]}
              </div>
              {isCurrent && (
                <Badge className="text-xs animate-pulse">当前</Badge>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
