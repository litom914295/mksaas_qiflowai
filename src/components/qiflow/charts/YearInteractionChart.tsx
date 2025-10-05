'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import React from 'react';

export type YearInteraction = {
  year: number;
  heavenly: string;
  earthly: string;
  interactions: {
    with: string; // 与哪个柱互动
    type: '生' | '克' | '冲' | '合' | '刑' | '害';
    effect: 'positive' | 'negative' | 'neutral';
    description: string;
  }[];
};

const INTERACTION_COLORS = {
  生: 'bg-green-100 text-green-800 border-green-300',
  克: 'bg-red-100 text-red-800 border-red-300',
  冲: 'bg-orange-100 text-orange-800 border-orange-300',
  合: 'bg-blue-100 text-blue-800 border-blue-300',
  刑: 'bg-purple-100 text-purple-800 border-purple-300',
  害: 'bg-gray-100 text-gray-800 border-gray-300',
};

export function YearInteractionChart({
  interactions,
  className = '',
}: {
  interactions: YearInteraction[];
  className?: string;
}) {
  if (!interactions || interactions.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        暂无流年数据
      </div>
    );
  }

  return (
    <div
      className={cn('space-y-4', className)}
      data-testid="year-interaction-chart"
    >
      {interactions.map((year, index) => (
        <div key={index} className="rounded-lg border bg-card p-4">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-baseline gap-2">
              <span className="text-xl font-bold">{year.year}年</span>
              <span className="text-lg font-medium">
                {year.heavenly}
                {year.earthly}
              </span>
            </div>
          </div>

          <div className="grid gap-2 sm:grid-cols-2">
            {year.interactions.map((interaction, idx) => (
              <div key={idx} className="rounded border bg-muted/30 p-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge
                    className={cn(
                      'text-xs',
                      INTERACTION_COLORS[interaction.type]
                    )}
                  >
                    {interaction.type}
                  </Badge>
                  <span className="text-sm font-medium">
                    {interaction.with}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {interaction.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 神煞分布图
 */
export type GodEvil = {
  name: string;
  type: 'god' | 'evil'; // 神或煞
  location: '年' | '月' | '日' | '时';
  effect: 'positive' | 'negative' | 'neutral';
  description: string;
};

const GOD_EVIL_COLORS = {
  god: 'bg-blue-500 text-white',
  evil: 'bg-red-500 text-white',
};

export function GodEvilDistribution({
  items,
  className = '',
}: {
  items: GodEvil[];
  className?: string;
}) {
  if (!items || items.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        暂无神煞数据
      </div>
    );
  }

  const gods = items.filter((i) => i.type === 'god');
  const evils = items.filter((i) => i.type === 'evil');

  return (
    <div
      className={cn('space-y-4', className)}
      data-testid="god-evil-distribution"
    >
      {gods.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-blue-500" />
            吉神 ({gods.length})
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {gods.map((item, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-blue-500 text-xs">{item.name}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.location}柱
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {evils.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-semibold flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-red-500" />
            凶煞 ({evils.length})
          </h4>
          <div className="grid gap-2 sm:grid-cols-2">
            {evils.map((item, idx) => (
              <div key={idx} className="rounded-lg border bg-card p-3">
                <div className="flex items-center gap-2 mb-1">
                  <Badge className="bg-red-500 text-xs">{item.name}</Badge>
                  <span className="text-xs text-muted-foreground">
                    {item.location}柱
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
