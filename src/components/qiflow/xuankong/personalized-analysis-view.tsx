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
import { PALACE_TO_BAGUA } from '@/lib/qiflow/xuankong/luoshu';
import {
  AlertCircle,
  Briefcase,
  DollarSign,
  Heart,
  Home,
  User,
} from 'lucide-react';
import React from 'react';

interface PersonalizedAnalysisViewProps {
  analysisResult: ComprehensiveAnalysisResult;
  className?: string;
}

/**
 * 个性化分析视图组件
 * 根据用户八字信息提供定制化的风水布局建议
 */
export function PersonalizedAnalysisView({
  analysisResult,
  className = '',
}: PersonalizedAnalysisViewProps) {
  const { personalizedAnalysis } = analysisResult;

  if (!personalizedAnalysis) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center space-y-4">
        <AlertCircle className="w-12 h-12 text-muted-foreground" />
        <div>
          <p className="text-lg font-medium">个性化分析未启用</p>
          <p className="text-sm text-muted-foreground mt-1">
            请提供您的八字信息以获取个性化风水建议
          </p>
        </div>
      </div>
    );
  }

  // 解析真实的个性化数据
  const {
    compatibility,
    roomRecommendations,
    careerEnhancement,
    healthAndWellness,
    relationshipHarmony,
    wealthAndProsperity,
  } = personalizedAnalysis;

  // 构建八字集成信息
  // 从 compatibility 和其他个性化数据中提取信息
  const baziIntegration = {
    // 生肖可从兼容性数据或其他来源获取
    zodiac: compatibility?.zodiac || '未知',
    // 主元素（命卦对应的五行）
    mainElement: compatibility?.element || compatibility?.mainElement || '未知',
    // 喜用神（有利元素）- 从多个可能的字段提取
    favorableElements:
      compatibility?.favorableElements ||
      compatibility?.favorable ||
      (compatibility?.element ? [compatibility.element] : []),
    // 忌讳元素（不利元素）
    unfavorableElements:
      compatibility?.unfavorableElements || compatibility?.unfavorable || [],
    // 幸运方位（从命卦信息获取）
    luckyDirections:
      compatibility?.luckyDirections ||
      compatibility?.favorableDirections ||
      [],
  };

  // 整合所有个性化建议
  const personalizedRecommendations = [
    // 健康建议
    ...(healthAndWellness?.healthWarnings
      ? healthAndWellness.healthWarnings.map((warning: string, i: number) => ({
          title: `健康注意 ${i + 1}`,
          description: warning,
          priority: 1,
          actions: ['保持该区域清洁', '避免长时间停留', '可放置化解物品'],
          category: 'health',
        }))
      : []),
    // 事业建议
    ...(careerEnhancement?.tips
      ? careerEnhancement.tips.map((tip: string, i: number) => ({
          title: `事业提升 ${i + 1}`,
          description: tip,
          priority: 2,
          actions: [
            `工作区域：${PALACE_TO_BAGUA[careerEnhancement.bestWorkArea] || '未知'}`,
            `学习区域：${PALACE_TO_BAGUA[careerEnhancement.studyArea] || '未知'}`,
          ],
          category: 'career',
        }))
      : []),
    // 家居建议
    ...(roomRecommendations || []).map((r: any) => ({
      title: `${r.bagua}宫布局建议`,
      description: r.personalizedTips?.[0] || '基于您的八字分析',
      priority: r.priority === 'high' ? 1 : r.priority === 'medium' ? 2 : 3,
      actions: [
        ...(r.suitableFor || []).map((s: string) => `适合：${s}`),
        ...(r.avoidFor || []).map((a: string) => `避免：${a}`),
      ],
      category: 'home',
    })),
    // 财运建议
    ...(wealthAndProsperity?.financialAdvice
      ? wealthAndProsperity.financialAdvice.map(
          (advice: string, i: number) => ({
            title: `财运提升 ${i + 1}`,
            description: advice,
            priority: 2,
            actions: [
              `财位：${PALACE_TO_BAGUA[wealthAndProsperity.wealthCorner] || '未知'}`,
              `投资区：${PALACE_TO_BAGUA[wealthAndProsperity.investmentArea] || '未知'}`,
            ],
            category: 'wealth',
          })
        )
      : []),
  ];

  // 获取生肖图标（可以扩展）
  const getZodiacEmoji = (zodiac: string): string => {
    const zodiacMap: Record<string, string> = {
      鼠: '🐭',
      牛: '🐮',
      虎: '🐯',
      兔: '🐰',
      龙: '🐲',
      蛇: '🐍',
      马: '🐴',
      羊: '🐏',
      猴: '🐵',
      鸡: '🐔',
      狗: '🐕',
      猪: '🐖',
    };
    return zodiacMap[zodiac] || '🌟';
  };

  // 获取元素颜色
  const getElementColor = (element: string): string => {
    switch (element) {
      case '金':
        return 'text-yellow-600';
      case '木':
        return 'text-green-600';
      case '水':
        return 'text-blue-600';
      case '火':
        return 'text-red-600';
      case '土':
        return 'text-amber-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 用户信息卡片 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <User className="w-5 h-5 text-primary" />
            <CardTitle>您的命理档案</CardTitle>
          </div>
          <CardDescription>基于您的生辰八字进行个性化分析</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 基本信息 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">基本信息</p>
              <div className="space-y-1">
                <p className="text-sm">
                  <span className="font-medium">生肖:</span>{' '}
                  {getZodiacEmoji(baziIntegration.zodiac)}{' '}
                  {baziIntegration.zodiac}
                </p>
                <p className="text-sm">
                  <span className="font-medium">本命元素:</span>
                  <span
                    className={getElementColor(baziIntegration.mainElement)}
                  >
                    {' '}
                    {baziIntegration.mainElement}
                  </span>
                </p>
              </div>
            </div>

            {/* 喜用神 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">喜用神</p>
              <div className="flex flex-wrap gap-1">
                {baziIntegration.favorableElements.map((elem: any) => (
                  <Badge key={elem} className={getElementColor(elem)}>
                    {elem}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 忌讳元素 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">忌讳元素</p>
              <div className="flex flex-wrap gap-1">
                {baziIntegration.unfavorableElements.map((elem: any) => (
                  <Badge key={elem} variant="destructive">
                    {elem}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 幸运方位 */}
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground">幸运方位</p>
              <div className="flex flex-wrap gap-1">
                {baziIntegration.luckyDirections.map((dir: any) => (
                  <Badge key={dir} variant="outline">
                    {dir}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 个性化建议分类 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 健康建议 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-red-500" />
              <CardTitle>健康建议</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {personalizedRecommendations
              .filter((rec) => rec.category === 'health')
              .map((rec, idx) => (
                <div key={idx} className="border-l-4 border-red-300 pl-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{rec.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      优先级: {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="space-y-1">
                    {rec.actions.map((action: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {action}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* 事业建议 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5 text-blue-500" />
              <CardTitle>事业建议</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {personalizedRecommendations
              .filter((rec) => rec.category === 'career')
              .map((rec, idx) => (
                <div key={idx} className="border-l-4 border-blue-300 pl-3 py-2">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{rec.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      优先级: {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="space-y-1">
                    {rec.actions.map((action: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {action}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* 家居建议 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Home className="w-5 h-5 text-green-500" />
              <CardTitle>家居建议</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {personalizedRecommendations
              .filter((rec) => rec.category === 'home')
              .map((rec, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-green-300 pl-3 py-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{rec.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      优先级: {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="space-y-1">
                    {rec.actions.map((action: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {action}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>

        {/* 财运提升 */}
        <Card>
          <CardHeader>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-5 h-5 text-yellow-600" />
              <CardTitle>财运提升</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {personalizedRecommendations
              .filter((rec) => rec.category === 'wealth')
              .map((rec, idx) => (
                <div
                  key={idx}
                  className="border-l-4 border-yellow-300 pl-3 py-2"
                >
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="text-sm font-medium">{rec.title}</h4>
                    <Badge variant="outline" className="text-xs">
                      优先级: {rec.priority}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {rec.description}
                  </p>
                  <div className="space-y-1">
                    {rec.actions.map((action: any, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">
                        • {action}
                      </p>
                    ))}
                  </div>
                </div>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* 命理与风水融合分析 */}
      <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
        <CardHeader>
          <CardTitle>命理与风水融合分析</CardTitle>
          <CardDescription>您的八字与当前宅运的协调性分析</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 相生相克分析 */}
          <div>
            <h4 className="text-sm font-medium mb-2">五行相生相克</h4>
            <div className="bg-white rounded-lg p-4 space-y-2">
              <p className="text-sm">
                <strong className="text-green-600">有利组合:</strong>{' '}
                {baziIntegration.compatibility?.beneficial || '暂无数据'}
              </p>
              <p className="text-sm">
                <strong className="text-orange-600">需要化解:</strong>{' '}
                {baziIntegration.compatibility?.conflicting || '暂无数据'}
              </p>
            </div>
          </div>

          {/* 最佳布局方位 */}
          <div>
            <h4 className="text-sm font-medium mb-2">最佳布局方位</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {baziIntegration.luckyDirections.map((dir: any) => (
                <div key={dir} className="bg-white rounded-lg p-3 text-center">
                  <p className="text-lg font-medium">{dir}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {dir === '东'
                      ? '事业运'
                      : dir === '南'
                        ? '名声运'
                        : dir === '西'
                          ? '人际运'
                          : dir === '北'
                            ? '财运'
                            : '综合运'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 底部说明 */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">🌟 个性化分析说明：</p>
            <ul className="space-y-1 ml-4">
              <li>• 分析基于您的生辰八字与当前宅运的综合考量</li>
              <li>• 建议优先处理高优先级项目，循序渐进调整布局</li>
              <li>• 五行调和需要时间，建议分阶段实施改善方案</li>
              <li>• 个人命理仅供参考，最终决策请结合实际情况</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default PersonalizedAnalysisView;
