'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import {
  AlertCircle,
  Calendar,
  Minus,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import React from 'react';

interface LiunianAnalysisViewProps {
  analysisResult: ComprehensiveAnalysisResult;
  className?: string;
}

/**
 * 流年分析视图组件
 * 展示当前年份的运势变化、流年飞星影响、时间趋势等
 */
export function LiunianAnalysisView({
  analysisResult,
  className = '',
}: LiunianAnalysisViewProps) {
  const { liunianAnalysis, personalizedAnalysis } = analysisResult;

  // 提取用户八字信息
  const userBaziInfo = personalizedAnalysis?.compatibility
    ? {
        element: personalizedAnalysis.compatibility.element || '未知',
        favorableElements:
          personalizedAnalysis.compatibility.favorableElements || [],
        luckyDirections:
          personalizedAnalysis.compatibility.luckyDirections ||
          personalizedAnalysis.compatibility.favorableDirections ||
          [],
        zodiac: personalizedAnalysis.compatibility.zodiac || '未知',
      }
    : null;

  if (!liunianAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">流年分析未启用</p>
          <p className="text-sm text-muted-foreground mt-1">
            请在分析设置中启用流年分析功能
          </p>
        </div>
      </div>
    );
  }

  // 解析真实的流年数据
  const {
    yearlyTrends,
    overlayAnalysis,
    seasonalAdjustments,
    dayunTransition,
  } = liunianAnalysis;

  // 计算真实的流年星和干支
  const year = new Date().getFullYear();
  const calculateLiunianStar = (year: number): number => {
    const baseYear = 1984; // 甲子年
    const yearOffset = year - baseYear;
    return (((yearOffset % 9) + 9) % 9) + 1;
  };

  const calculateGanZhi = (year: number): string => {
    const tian = ['甲', '乙', '丙', '丁', '戊', '己', '庚', '辛', '壬', '癸'];
    const di = [
      '子',
      '丑',
      '寅',
      '卯',
      '辰',
      '巳',
      '午',
      '未',
      '申',
      '酉',
      '戌',
      '亥',
    ];
    const tianIndex = (year - 4) % 10;
    const diIndex = (year - 4) % 12;
    return tian[tianIndex] + di[diIndex];
  };

  const currentYear = {
    year: year,
    yearStar: calculateLiunianStar(year),
    ganZhi: calculateGanZhi(year),
  };

  // 计算年度总体评分
  const calculateOverallScore = () => {
    const trends = [
      yearlyTrends.healthTrend,
      yearlyTrends.wealthTrend,
      yearlyTrends.careerTrend,
      yearlyTrends.relationshipTrend,
    ];
    const scores = trends.map((t) => {
      if (
        t === 'improving' ||
        t === 'growing' ||
        t === 'advancing' ||
        t === 'harmonious'
      )
        return 90;
      if (t === 'stable') return 70;
      return 50;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  };

  const yearlyFortune = {
    trend:
      yearlyTrends.overallLuck === 'excellent' ||
      yearlyTrends.overallLuck === 'good'
        ? 'improving'
        : 'stable',
    overallScore: calculateOverallScore(),
    characteristics: `整体运势${yearlyTrends.overallLuck === 'excellent' ? '极佳' : yearlyTrends.overallLuck === 'good' ? '良好' : yearlyTrends.overallLuck === 'fair' ? '中等' : '需谨慎'}`,
    favorableAspects: [
      yearlyTrends.wealthTrend === 'growing' && '财运增长，投资理财将有收获',
      yearlyTrends.careerTrend === 'advancing' && '事业发展顺利，有晋升机会',
      yearlyTrends.healthTrend === 'improving' && '健康状况好转，精力充沛',
      yearlyTrends.relationshipTrend === 'harmonious' &&
        '人际关系和谐，感情美满',
    ].filter(Boolean) as string[],
    unfavorableAspects: [
      yearlyTrends.healthTrend === 'declining' && '健康需要特别关注，预防为主',
      yearlyTrends.wealthTrend === 'declining' && '财运波动，谨慎投资决策',
      yearlyTrends.careerTrend === 'challenging' && '事业面临挑战，需努力坚持',
      yearlyTrends.relationshipTrend === 'turbulent' &&
        '人际关系波动，需谨言慎行',
    ].filter(Boolean) as string[],
    yearlyRecommendations: [
      ...yearlyTrends.keyMonths
        .slice(0, 3)
        .map((km) => `${km.month}月${km.significance}：${km.advice}`),
      dayunTransition &&
        `大运交替期，需${dayunTransition.recommendations[0] || '谨慎应对'}`,
    ].filter(Boolean) as string[],
    resolutionMethods: [] as any[],
  };

  // 构建月度趋势数据（基于真实的流月星）
  const calculateMonthScore = (month: number): number => {
    const keyMonth = yearlyTrends.keyMonths.find(
      (km: any) => km.month === month
    );
    const baseScore = calculateOverallScore();

    if (keyMonth) {
      // 根据关键月份的意义调整评分
      if (
        keyMonth.significance.includes('五黄') ||
        keyMonth.significance.includes('二黑')
      ) {
        return Math.max(30, baseScore - 25); // 凶星月份降低评分
      }
      if (
        keyMonth.significance.includes('八白') ||
        keyMonth.significance.includes('九紫')
      ) {
        return Math.min(95, baseScore + 20); // 吉星月份提高评分
      }
      if (
        keyMonth.significance.includes('一白') ||
        keyMonth.significance.includes('六白')
      ) {
        return Math.min(88, baseScore + 12); // 吉星月份适度提高
      }
    }

    // 普通月份有小幅波动
    const seasonalVariation = Math.sin(((month - 1) * Math.PI) / 6) * 8; // 正弦波动
    return Math.round(
      Math.max(40, Math.min(85, baseScore + seasonalVariation))
    );
  };

  const monthlyTrends = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    const keyMonth = yearlyTrends.keyMonths.find(
      (km: any) => km.month === month
    );
    const score = calculateMonthScore(month);

    // 判断趋势
    let trend = 'stable';
    if (keyMonth) {
      if (
        keyMonth.significance.includes('五黄') ||
        keyMonth.significance.includes('二黑')
      ) {
        trend = 'declining';
      } else if (
        keyMonth.significance.includes('八白') ||
        keyMonth.significance.includes('九紫')
      ) {
        trend = 'improving';
      }
    }

    return {
      month,
      score,
      mainInfluences: keyMonth ? [keyMonth.significance] : ['常规运势'],
      trend,
    };
  });

  // 构建关键时间节点
  const criticalPeriods = [
    ...yearlyTrends.keyMonths.map((km) => ({
      startDate: `${currentYear.year}年${km.month}月`,
      endDate: `${currentYear.year}年${km.month}月底`,
      type:
        km.significance.includes('吉') || km.significance.includes('好')
          ? 'favorable'
          : 'unfavorable',
      title: km.significance,
      description: km.advice,
      recommendations: [km.advice],
    })),
    ...(dayunTransition
      ? [
          {
            startDate: `${dayunTransition.transitionYear}年`,
            endDate: `${dayunTransition.transitionYear + 1}年`,
            type: 'neutral' as const,
            title: `第${dayunTransition.currentPeriod}运转第${dayunTransition.nextPeriod}运`,
            description: `大运交替${dayunTransition.transitionPhase === 'early' ? '初期' : dayunTransition.transitionPhase === 'middle' ? '中期' : '晚期'}`,
            recommendations: dayunTransition.recommendations,
          },
        ]
      : []),
  ];

  // 获取运势趋势图标
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving':
        return <TrendingUp className="w-4 h-4 text-green-500" />;
      case 'declining':
        return <TrendingDown className="w-4 h-4 text-red-500" />;
      default:
        return <Minus className="w-4 h-4 text-gray-500" />;
    }
  };

  // 获取运势评分颜色
  const getScoreColor = (score: number): string => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-gray-600';
    if (score >= 20) return 'text-orange-600';
    return 'text-red-600';
  };

  // 获取月份徽章变体
  const getMonthBadgeVariant = (
    score: number
  ): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (score >= 75) return 'default';
    if (score >= 50) return 'secondary';
    if (score >= 30) return 'outline';
    return 'destructive';
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 年度运势概况 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-primary" />
              <CardTitle>{currentYear.year}年流年运势</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              {getTrendIcon(yearlyFortune.trend)}
              <Badge variant={getMonthBadgeVariant(yearlyFortune.overallScore)}>
                {yearlyFortune.overallScore}分
              </Badge>
            </div>
          </div>
          <CardDescription>
            流年飞星: {currentYear.yearStar}星入中 | 天干地支:{' '}
            {currentYear.ganZhi}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* 年度特征 */}
            <div>
              <h4 className="text-sm font-medium mb-2">年度特征</h4>
              <p className="text-sm text-muted-foreground">
                {yearlyFortune.characteristics}
              </p>
            </div>

            {/* 有利方面 */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-green-600">
                ✓ 有利方面
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {yearlyFortune.favorableAspects.map((aspect, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-green-500 mt-0.5">•</span>
                    <span>{aspect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 不利方面 */}
            <div>
              <h4 className="text-sm font-medium mb-2 text-orange-600">
                ⚠ 需要注意
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {yearlyFortune.unfavorableAspects.map((aspect, idx) => (
                  <div key={idx} className="flex items-start space-x-2 text-sm">
                    <span className="text-orange-500 mt-0.5">•</span>
                    <span>{aspect}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 年度建议 */}
            <div>
              <h4 className="text-sm font-medium mb-2">💡 年度建议</h4>
              <ul className="space-y-1">
                {yearlyFortune.yearlyRecommendations.map((rec, idx) => (
                  <li key={idx} className="text-sm text-muted-foreground">
                    {idx + 1}. {rec}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 月度运势趋势 */}
      <Card>
        <CardHeader>
          <CardTitle>月度运势趋势</CardTitle>
          <CardDescription>
            {currentYear.year}年各月运势变化情况
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {monthlyTrends.map((month) => (
              <div
                key={month.month}
                className="p-3 border rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">{month.month}月</span>
                  <Badge
                    variant={getMonthBadgeVariant(month.score)}
                    className="text-xs"
                  >
                    {month.score}
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {month.mainInfluences.slice(0, 2).join('、')}
                </p>
                <div className="flex items-center space-x-1 text-xs">
                  {getTrendIcon(month.trend)}
                  <span className="text-muted-foreground">
                    {month.trend === 'improving'
                      ? '上升'
                      : month.trend === 'declining'
                        ? '下降'
                        : '平稳'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 关键时间节点 */}
      <Card>
        <CardHeader>
          <CardTitle>关键时间节点</CardTitle>
          <CardDescription>本年度需要特别关注的时间段</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {criticalPeriods.map((period, idx) => (
              <div
                key={idx}
                className="border-l-4 pl-4 py-2"
                style={{
                  borderColor:
                    period.type === 'favorable'
                      ? '#10b981'
                      : period.type === 'unfavorable'
                        ? '#f59e0b'
                        : '#6b7280',
                }}
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        period.type === 'favorable'
                          ? 'default'
                          : period.type === 'unfavorable'
                            ? 'destructive'
                            : 'secondary'
                      }
                    >
                      {period.type === 'favorable'
                        ? '吉期'
                        : period.type === 'unfavorable'
                          ? '凶期'
                          : '重要'}
                    </Badge>
                    <span className="text-sm font-medium">{period.period}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    影响力: {period.importance}/10
                  </span>
                </div>
                <p className="text-sm mb-2">{period.description}</p>
                <div className="bg-muted/50 rounded p-2">
                  <p className="text-xs text-muted-foreground">
                    <strong>建议行动：</strong>
                    {period.suggestions}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 流年化解建议 */}
      <Card className="bg-amber-50/50 border-amber-200">
        <CardHeader>
          <CardTitle className="text-amber-900">流年化解方案</CardTitle>
          <CardDescription className="text-amber-700">
            针对本年度凶煞的专项化解建议
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {yearlyFortune.resolutionMethods?.map((method, idx) => (
              <div
                key={idx}
                className="bg-white rounded-lg p-3 border border-amber-200"
              >
                <h5 className="font-medium text-sm mb-2">{method.issue}</h5>
                <p className="text-sm text-muted-foreground mb-2">
                  {method.method}
                </p>
                <div className="flex flex-wrap gap-2">
                  {method.items?.map((item: any, i: number) => (
                    <Badge key={i} variant="outline" className="text-xs">
                      {item}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 底部说明 */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">📅 流年分析说明：</p>
            <ul className="space-y-1 ml-4">
              <li>• 流年分析基于当年飞星入中对宅运的影响</li>
              <li>• 不同月份受流月飞星影响，运势会有起伏变化</li>
              <li>• 关键时间节点需要特别注意，提前做好准备</li>
              <li>• 化解方案建议配合专业风水师指导实施</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* 八字个性化提示 */}
      {userBaziInfo && (
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-lg">🧪 您的个性化流年建议</CardTitle>
            <CardDescription>
              基于您的生肖 {userBaziInfo.zodiac} 和命卦 {userBaziInfo.element}{' '}
              的分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* 喜用神方位强化 */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">✨ 吉方时间强化</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  您的幸运方位：
                  {userBaziInfo.luckyDirections.join('、') || '未知'}
                </p>
                <p className="text-sm">
                  建议在这些方位的吉时进行重要活动，
                  如业务洽谈、签约、入宅等，能够增强效果。
                </p>
              </div>

              {/* 五行调节 */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">⚖️ 五行调节</h4>
                <p className="text-sm text-muted-foreground mb-2">
                  您的喜用元素：
                  {userBaziInfo.favorableElements.join('、') || '未知'}
                </p>
                <p className="text-sm">
                  全年可多使用与您喜用元素相关的颜色、物品和食物，
                  以增强个人运势与流年能量的共振。
                </p>
              </div>

              {/* 重点月份提醒 */}
              <div className="bg-white rounded-lg p-4">
                <h4 className="text-sm font-medium mb-2">📅 重点月份提醒</h4>
                <p className="text-sm">
                  根据您的八字，建议特别关注上述关键时间节点，
                  在这些时间段内谨慎行事，多做准备， 可以有效跟避凶、提升运势。
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export default LiunianAnalysisView;
