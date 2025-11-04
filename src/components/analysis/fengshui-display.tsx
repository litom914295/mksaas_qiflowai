'use client';

import { Card } from '@/components/ui/card';

export interface FengshuiDisplayProps {
  result?: any;
  explanation?: any;
}

export function FengshuiDisplay({ result, explanation }: FengshuiDisplayProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">风水分析</h3>
      <div className="space-y-4">
        <p className="text-gray-600">风水分析结果将显示在这里</p>
      </div>
    </Card>
  );
}
