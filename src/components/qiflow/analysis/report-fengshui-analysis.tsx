'use client';

import { ComprehensiveAnalysisPanel } from '@/components/qiflow/xuankong/comprehensive-analysis-panel';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { UnifiedFengshuiEngine } from '@/lib/qiflow/unified';
import type { UnifiedAnalysisOutput } from '@/lib/qiflow/unified';
import { adaptToFrontend } from '@/lib/qiflow/unified/adapters/frontend-adapter';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface ReportFengshuiAnalysisProps {
  houseInfo: {
    sittingDirection: string;
    facingDirection: string;
    period?: number;
    buildingYear?: number;
  };
}

// 方位转角度
const directionToDegrees: Record<string, number> = {
  北: 0,
  东北: 45,
  东: 90,
  东南: 135,
  南: 180,
  西南: 225,
  西: 270,
  西北: 315,
};

export function ReportFengshuiAnalysis({
  houseInfo,
}: ReportFengshuiAnalysisProps) {
  const [analysisResult, setAnalysisResult] =
    useState<ComprehensiveAnalysisResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function performAnalysis() {
      try {
        setIsLoading(true);
        setError(null);

        // 获取朝向角度
        const facingDegrees =
          directionToDegrees[houseInfo.facingDirection] || 180;

        console.log('[风水分析] 开始分析:', {
          facing: houseInfo.facingDirection,
          degrees: facingDegrees,
          sitting: houseInfo.sittingDirection,
        });

        // 调用统一分析引擎
        const engine = new UnifiedFengshuiEngine();
        const currentDate = new Date();

        const unifiedResult = await engine.analyze({
          house: {
            facing: facingDegrees, // 注意：直接传入度数值
            buildYear: houseInfo.buildingYear || currentDate.getFullYear(),
            period: houseInfo.period || 9,
          },
          bazi: {
            // 如果没有八字信息，使用示例默认值
            birthYear: 1990, // 示例出生年份
            birthMonth: 5, // 示例出生月份
            birthDay: 15, // 示例出生日
            birthHour: 10, // 示例出生时辰
            gender: 'male' as const,
            // 添加更多信息以支持个性化分析
            occupation: '办公室白领',
            healthConcerns: ['腐椎病', '睡眠质量'],
            careerGoals: ['职业发展', '财富增长'],
            familyStatus: 'married' as const,
            financialGoals: 'growth' as const,
          },
          time: {
            currentYear: currentDate.getFullYear(),
            currentMonth: currentDate.getMonth() + 1,
            currentDay: currentDate.getDate(),
          },
          options: {
            includeLiunian: true,
            includePersonalization: true, // 启用个性化分析
            includeTigua: true,
            includeLingzheng: true,
            includeChengmenjue: true,
            depth: 'comprehensive',
          },
        });

        // 使用适配器转换为前端格式
        const result = adaptToFrontend(unifiedResult);

        console.log('[风水分析] 分析完成:', result);
        setAnalysisResult(result);
      } catch (err) {
        console.error('[风水分析] 分析失败:', err);
        setError(err instanceof Error ? err.message : '分析失败');
      } finally {
        setIsLoading(false);
      }
    }

    performAnalysis();
  }, [houseInfo.facingDirection, houseInfo.sittingDirection]);

  // 错误状态
  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <AlertCircle className="h-12 w-12 text-red-600" />
          <p className="mt-4 text-red-900 font-semibold">分析失败</p>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => window.location.reload()}
          >
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <ComprehensiveAnalysisPanel
        analysisResult={analysisResult}
        isLoading={isLoading}
        onRefresh={() => window.location.reload()}
      />
    </div>
  );
}
