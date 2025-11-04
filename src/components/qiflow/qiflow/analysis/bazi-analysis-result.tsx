'use client';

import { BaziAnalysisResult as BaziResultDisplay } from '@/components/bazi-analysis-result';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface BirthData {
  datetime: string;
  gender: 'male' | 'female';
  timezone: string;
  isTimeKnown: boolean;
}

interface BaziAnalysisResultProps {
  birthData: BirthData;
  onAnalysisComplete?: (result: any) => void;
}

/**
 * 八字分析结果组件（适配器）
 * 连接报告页面和实际的八字分析结果显示组件
 */
export function BaziAnalysisResult({
  birthData,
  onAnalysisComplete,
}: BaziAnalysisResultProps) {
  const [analysisData, setAnalysisData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!birthData) {
      setError('缺少出生数据');
      setLoading(false);
      return;
    }

    const fetchAnalysis = async () => {
      try {
        setLoading(true);
        setError(null);

        // 调用八字分析 API
        const response = await fetch('/api/bazi/analyze', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            datetime: birthData.datetime,
            gender: birthData.gender,
            timezone: birthData.timezone || 'Asia/Shanghai',
            isTimeKnown: birthData.isTimeKnown ?? true,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || '分析失败');
        }

        const result = await response.json();
        setAnalysisData(result.data);

        // 通知父组件分析完成
        if (onAnalysisComplete) {
          onAnalysisComplete(result.data);
        }
      } catch (err: any) {
        console.error('八字分析失败:', err);
        setError(err.message || '分析过程中出现错误，请稍后重试');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalysis();
  }, [birthData, onAnalysisComplete]);

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="w-12 h-12 animate-spin mx-auto text-purple-600" />
            <div>
              <p className="text-lg font-medium">正在进行八字分析...</p>
              <p className="text-sm text-gray-500 mt-2">
                正在计算真太阳时、排四柱、分析五行...
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!analysisData) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>暂无分析数据</AlertDescription>
      </Alert>
    );
  }

  return <BaziResultDisplay data={analysisData} />;
}
