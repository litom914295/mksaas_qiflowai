'use client';

import { Card } from '@/components/ui/card';

export interface FlyingStarAnalysisProps {
  result?: any;
  explanation?: any;
  fengshuiResult?: any;
  fengshuiExplanation?: any;
}

export function FlyingStarAnalysis({
  result,
  explanation,
  fengshuiResult,
  fengshuiExplanation,
}: FlyingStarAnalysisProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">飞星分析</h3>
      <div className="space-y-4">
        <p className="text-gray-600">飞星分析结果将显示在这里</p>
      </div>
    </Card>
  );
}
