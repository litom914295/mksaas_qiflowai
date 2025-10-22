'use client';

/**
 * Comprehensive Score Component
 * 综合评分组件 - 显示分析的总体评分
 */

import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface ComprehensiveScoreProps {
  score?: number;
  baziScore?: number;
  fengshuiScore?: number;
  overallScore?: number;
  rating?: 'excellent' | 'good' | 'fair' | 'poor';
  maxScore?: number;
  label?: string;
  description?: string;
  suggestions?: string[];
}

export function ComprehensiveScore({
  score,
  baziScore,
  fengshuiScore,
  overallScore,
  rating,
  maxScore = 100,
  label = '综合评分',
  description,
  suggestions = [],
}: ComprehensiveScoreProps) {
  const displayScore = overallScore ?? score ?? 0;
  const percentage = (displayScore / maxScore) * 100;

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{label}</h3>
          <span className="text-3xl font-bold text-primary">
            {displayScore.toFixed(1)}
          </span>
        </div>
        <Progress value={percentage} className="h-2" />
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
    </Card>
  );
}
