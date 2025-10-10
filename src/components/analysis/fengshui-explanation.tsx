'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import type { FlyingStarExplanation } from '@/lib/fengshui';
import {
  BarChart3,
  BookOpen,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  Info,
  Lightbulb,
  XCircle,
} from 'lucide-react';
import React, { useState } from 'react';

interface FengshuiExplanationProps {
  explanation: FlyingStarExplanation;
}

// 飞星含义解释
const STAR_MEANINGS = {
  1: {
    name: '一白贪狼星',
    element: '水',
    nature: '吉',
    meaning: '智慧、学业、官运',
  },
  2: {
    name: '二黑巨门星',
    element: '土',
    nature: '凶',
    meaning: '疾病、是非、破财',
  },
  3: {
    name: '三碧禄存星',
    element: '木',
    nature: '凶',
    meaning: '是非、口舌、争斗',
  },
  4: {
    name: '四绿文曲星',
    element: '木',
    nature: '吉',
    meaning: '文昌、学业、智慧',
  },
  5: {
    name: '五黄廉贞星',
    element: '土',
    nature: '凶',
    meaning: '灾祸、意外、破财',
  },
  6: {
    name: '六白武曲星',
    element: '金',
    nature: '吉',
    meaning: '权力、地位、偏财',
  },
  7: {
    name: '七赤破军星',
    element: '金',
    nature: '凶',
    meaning: '破财、盗贼、口舌',
  },
  8: {
    name: '八白左辅星',
    element: '土',
    nature: '吉',
    meaning: '财运、事业、健康',
  },
  9: {
    name: '九紫右弼星',
    element: '火',
    nature: '吉',
    meaning: '喜庆、桃花、名声',
  },
};

// 格局解释
const GEJU_EXPLANATIONS = {
  旺山旺水: {
    description: '山星和向星都飞到当旺的宫位，是最吉利的格局',
    meaning: '主财运亨通，事业顺利，家庭和睦，身体健康',
    suggestions: ['保持房屋整洁', '在旺位放置招财物品', '避免在旺位放置杂物'],
  },
  上山下水: {
    description: '山星飞到向方，向星飞到坐方，是凶险的格局',
    meaning: '主破财、疾病、是非，需要化解',
    suggestions: ['在凶位放置化解物品', '调整家具布局', '避免在凶位居住'],
  },
  双星会向: {
    description: '山星和向星都飞到向方，形成双星会向的格局',
    meaning: '主财运较好，但需要注意健康问题',
    suggestions: ['在向方放置招财物品', '注意身体健康', '避免过度劳累'],
  },
  伏吟: {
    description: '山星和向星相同，形成伏吟格局',
    meaning: '主运势反复，需要耐心应对',
    suggestions: ['保持心态平和', '避免冲动决策', '寻求专业指导'],
  },
  反吟: {
    description: '山星和向星相对，形成反吟格局',
    meaning: '主变化较大，需要灵活应对',
    suggestions: ['保持灵活性', '及时调整策略', '避免固执己见'],
  },
  合十: {
    description: '山星和向星相加等于十，形成合十格局',
    meaning: '主和谐稳定，运势平稳',
    suggestions: ['保持现状', '稳步发展', '避免大起大落'],
  },
  三般: {
    description: '三盘星数形成特殊组合',
    meaning: '主特殊运势，需要具体分析',
    suggestions: ['详细分析组合', '寻求专业指导', '谨慎决策'],
  },
  打劫: {
    description: '特殊的三元九运组合',
    meaning: '主特殊机遇，需要把握时机',
    suggestions: ['把握机遇', '积极行动', '寻求合作'],
  },
};

// 飞星解释组件
function StarExplanation({ star }: { star: number }) {
  const starInfo = STAR_MEANINGS[star as keyof typeof STAR_MEANINGS];
  if (!starInfo) return null;

  const isAuspicious = starInfo.nature === '吉';
  const colorClass = isAuspicious
    ? 'text-green-800 bg-green-100'
    : 'text-red-800 bg-red-100';
  const icon = isAuspicious ? CheckCircle : XCircle;

  return (
    <div className="flex items-center gap-3 p-3 bg-white rounded-lg border">
      <div
        className={`
        w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
        ${colorClass}
      `}
      >
        {star}
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-semibold text-gray-900">{starInfo.name}</span>
          <Badge
            variant={isAuspicious ? 'default' : 'destructive'}
            className="text-xs"
          >
            {starInfo.nature}
          </Badge>
        </div>
        <div className="text-sm text-gray-600">
          <span className="font-medium">五行：</span>
          {starInfo.element} |<span className="font-medium ml-2">含义：</span>
          {starInfo.meaning}
        </div>
      </div>
      {React.createElement(icon, { className: 'w-5 h-5 text-gray-400' })}
    </div>
  );
}

// 格局解释组件
function GejuExplanation({ geju }: { geju: FlyingStarExplanation['geju'] }) {
  const [expandedGeju, setExpandedGeju] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">格局详细解释</h3>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {geju.types.map((gejuType, index) => {
          const explanation =
            GEJU_EXPLANATIONS[gejuType as keyof typeof GEJU_EXPLANATIONS];
          if (!explanation) return null;

          const isExpanded = expandedGeju === gejuType;
          const isFavorable = geju.isFavorable;

          return (
            <Card key={index} className="p-4">
              <Collapsible
                open={isExpanded}
                onOpenChange={(open) => setExpandedGeju(open ? gejuType : null)}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    variant="ghost"
                    className="w-full justify-between p-0 h-auto"
                  >
                    <div className="flex items-center gap-2">
                      <Badge variant={isFavorable ? 'default' : 'destructive'}>
                        {gejuType}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {explanation.description}
                      </span>
                    </div>
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                  </Button>
                </CollapsibleTrigger>

                <CollapsibleContent className="mt-3 space-y-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">格局含义</h4>
                    <p className="text-sm text-gray-700">
                      {explanation.meaning}
                    </p>
                  </div>

                  <div className="p-3 bg-blue-50 rounded-lg">
                    <h4 className="font-medium text-gray-900 mb-2">建议措施</h4>
                    <ul className="space-y-1">
                      {explanation.suggestions.map((suggestion, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 text-sm text-gray-700"
                        >
                          <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 flex-shrink-0" />
                          {suggestion}
                        </li>
                      ))}
                    </ul>
                  </div>
                </CollapsibleContent>
              </Collapsible>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// 建议解释组件
function RecommendationExplanation({
  summary,
}: { summary: FlyingStarExplanation['summary'] }) {
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  const sections = [
    {
      key: 'keyPoints',
      title: '关键要点',
      icon: Info,
      color: 'blue',
      items: summary.keyPoints,
    },
    {
      key: 'recommendations',
      title: '具体建议',
      icon: Lightbulb,
      color: 'green',
      items: summary.recommendations,
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">详细建议解释</h3>
      </div>

      {sections.map((section) => {
        const isExpanded = expandedSection === section.key;
        const Icon = section.icon;
        const colorClass = `text-${section.color}-600 bg-${section.color}-50`;

        return (
          <Card key={section.key} className="p-4">
            <Collapsible
              open={isExpanded}
              onOpenChange={(open) =>
                setExpandedSection(open ? section.key : null)
              }
            >
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-between p-0 h-auto"
                >
                  <div className="flex items-center gap-2">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center ${colorClass}`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="font-semibold text-gray-900">
                      {section.title}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {section.items.length} 项
                    </Badge>
                  </div>
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>

              <CollapsibleContent className="mt-3">
                <div className="space-y-2">
                  {section.items.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div
                        className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 bg-${section.color}-500`}
                      />
                      <p className="text-sm text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}

// 飞星知识库组件
function StarKnowledgeBase() {
  const [selectedStar, setSelectedStar] = useState<number | null>(null);

  return (
    <Card className="p-6">
      <div className="flex items-center gap-2 mb-4">
        <BookOpen className="w-5 h-5 text-blue-600" />
        <h3 className="text-lg font-semibold">飞星知识库</h3>
      </div>

      <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mb-4">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((star) => (
          <Button
            key={star}
            variant={selectedStar === star ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedStar(selectedStar === star ? null : star)}
            className="w-full"
          >
            {star}
          </Button>
        ))}
      </div>

      {selectedStar && <StarExplanation star={selectedStar} />}

      <div className="mt-4 p-4 bg-blue-50 rounded-lg">
        <h4 className="font-medium text-gray-900 mb-2">使用说明</h4>
        <p className="text-sm text-gray-700">
          点击上方数字查看对应飞星的详细含义。飞星是玄空风水的核心概念，
          每个数字代表不同的能量和含义，了解这些有助于更好地理解风水分析结果。
        </p>
      </div>
    </Card>
  );
}

export function FengshuiExplanation({ explanation }: FengshuiExplanationProps) {
  return (
    <div className="space-y-6">
      {/* 飞星知识库 */}
      <StarKnowledgeBase />

      {/* 格局解释 */}
      <GejuExplanation geju={explanation.geju} />

      {/* 建议解释 */}
      <RecommendationExplanation summary={explanation.summary} />

      {/* 使用指南 */}
      <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
        <div className="flex items-center gap-2 mb-4">
          <Info className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-semibold">使用指南</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium text-gray-900 mb-2">如何理解分析结果</h4>
            <ul className="space-y-1">
              <li>• 吉星代表有利的能量，凶星需要化解</li>
              <li>• 格局分析显示整体运势状况</li>
              <li>• 建议措施需要结合实际情况执行</li>
            </ul>
          </div>

          <div>
            <h4 className="font-medium text-gray-900 mb-2">注意事项</h4>
            <ul className="space-y-1">
              <li>• 风水分析仅供参考，不能替代专业咨询</li>
              <li>• 建议措施需要结合个人实际情况</li>
              <li>• 如有重要决策，请咨询专业人士</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
