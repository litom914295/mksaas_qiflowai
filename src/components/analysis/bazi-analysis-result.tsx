'use client';

import { Card } from '@/components/ui/card';

export interface BaziAnalysisResultProps {
  result?: any;
  birthData?: {
    datetime: string;
    gender: 'male' | 'female';
    timezone: string;
    isTimeKnown: boolean;
  };
  onComplete?: (result: any) => void;
  onAnalysisComplete?: (result: any) => void;
}

export function BaziAnalysisResult({
  result,
  birthData,
  onComplete,
  onAnalysisComplete,
}: BaziAnalysisResultProps) {
  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">八字分析结果</h3>
      <div className="space-y-4">
        <p className="text-gray-600">八字分析结果将显示在这里</p>
        {birthData && (
          <div className="text-sm text-gray-500">
            <p>出生日期: {birthData.datetime}</p>
            <p>性别: {birthData.gender === 'male' ? '男' : '女'}</p>
          </div>
        )}
      </div>
    </Card>
  );
}
