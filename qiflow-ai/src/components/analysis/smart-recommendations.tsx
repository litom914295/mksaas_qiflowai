'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
    type FlyingStarExplanation,
    type GenerateFlyingStarOutput,
} from '@/lib/fengshui';
import { filterRecommendationsByCategory, generateSmartRecommendations } from '@/lib/fengshui/smart-recommendations';
import {
    AlertTriangle,
    BookOpen,
    CheckCircle,
    Clock,
    Filter,
    Heart,
    Lightbulb,
    Star,
    Target,
    TrendingUp,
    Users,
    Zap
} from 'lucide-react';
import { useMemo, useState } from 'react';

interface SmartRecommendationsProps {
  fengshuiResult: GenerateFlyingStarOutput;
  fengshuiExplanation: FlyingStarExplanation;
}

// 建议类型图标映射
const typeIcons = {
  urgent: AlertTriangle,
  important: Star,
  suggestion: Lightbulb,
  enhancement: TrendingUp
};

// 建议分类图标映射
const categoryIcons = {
  health: Heart,
  wealth: Target,
  career: TrendingUp,
  relationship: Users,
  study: BookOpen,
  general: Zap
};

// 建议类型颜色映射
const typeColors = {
  urgent: 'text-red-800 bg-red-100 border-red-200',
  important: 'text-orange-800 bg-orange-100 border-orange-200',
  suggestion: 'text-blue-800 bg-blue-100 border-blue-200',
  enhancement: 'text-green-800 bg-green-100 border-green-200'
};

// 建议分类颜色映射
const categoryColors = {
  health: 'text-pink-600',
  wealth: 'text-yellow-600',
  career: 'text-blue-600',
  relationship: 'text-purple-600',
  study: 'text-green-600',
  general: 'text-gray-600'
};

// 单个建议卡片组件
function RecommendationCard({ 
  recommendation, 
  isExpanded, 
  onToggle 
}: { 
  recommendation: any;
  isExpanded: boolean;
  onToggle: () => void;
}) {
  const TypeIcon = typeIcons[recommendation.type as keyof typeof typeIcons];
  const CategoryIcon = categoryIcons[recommendation.category as keyof typeof categoryIcons];
  
  return (
    <Card className={`p-4 border-2 ${typeColors[recommendation.type as keyof typeof typeColors]}`}>
      <Collapsible open={isExpanded} onOpenChange={onToggle}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full justify-between p-0 h-auto">
            <div className="flex items-center gap-3">
              <TypeIcon className="w-5 h-5" />
              <div className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900">{recommendation.title}</h4>
                  <Badge variant="outline" className="text-xs">
                    优先级 {recommendation.priority}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600">{recommendation.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <CategoryIcon className={`w-4 h-4 ${categoryColors[recommendation.category as keyof typeof categoryColors]}`} />
                  <span className="text-xs text-gray-500">{recommendation.category}</span>
                  {recommendation.palace && (
                    <Badge variant="outline" className="text-xs">
                      {recommendation.palace}宫
                    </Badge>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {recommendation.timing && (
                <div className="flex items-center gap-1 text-xs text-gray-500">
                  <Clock className="w-3 h-3" />
                  {recommendation.timing}
                </div>
              )}
              <span className="text-gray-400">
                {isExpanded ? '收起' : '展开'}
              </span>
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent className="mt-4 space-y-4">
          {/* 具体行动 */}
          <div>
            <h5 className="font-medium text-gray-900 mb-2">具体行动</h5>
            <ul className="space-y-1">
              {recommendation.actions.map((action: any, index: number) => (
                <li key={index} className="flex items-start gap-2 text-sm text-gray-700">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                  {action}
                </li>
              ))}
            </ul>
          </div>
          
          {/* 所需材料 */}
          {recommendation.materials && recommendation.materials.length > 0 && (
            <div>
              <h5 className="font-medium text-gray-900 mb-2">所需材料</h5>
              <div className="flex flex-wrap gap-2">
                {recommendation.materials.map((material: any, index: number) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {material}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
}

// 建议统计组件
function RecommendationStats({ recommendations }: { recommendations: any[] }) {
  const stats = useMemo(() => {
    const typeCounts = recommendations.reduce((acc, rec) => {
      acc[rec.type] = (acc[rec.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const categoryCounts = recommendations.reduce((acc, rec) => {
      acc[rec.category] = (acc[rec.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    
    const urgentCount = recommendations.filter(r => r.type === 'urgent').length;
    const highPriorityCount = recommendations.filter(r => r.priority >= 8).length;
    
    return { typeCounts, categoryCounts, urgentCount, highPriorityCount };
  }, [recommendations]);
  
  return (
    <Card className="p-4 bg-gradient-to-r from-blue-50 to-purple-50">
      <h3 className="font-semibold text-gray-900 mb-3">建议统计</h3>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-red-600">{stats.urgentCount}</div>
          <div className="text-xs text-gray-600">紧急</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-orange-600">{stats.highPriorityCount}</div>
          <div className="text-xs text-gray-600">高优先级</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{stats.typeCounts.suggestion || 0}</div>
          <div className="text-xs text-gray-600">建议</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{stats.typeCounts.enhancement || 0}</div>
          <div className="text-xs text-gray-600">增强</div>
        </div>
      </div>
    </Card>
  );
}

export function SmartRecommendations({ fengshuiResult, fengshuiExplanation }: SmartRecommendationsProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());
  
  // 生成智能建议
  const allRecommendations = useMemo(() => {
    return generateSmartRecommendations(
      fengshuiResult.plates.period,
      fengshuiResult.period,
      fengshuiExplanation.wenchangwei,
      fengshuiExplanation.caiwei
    );
  }, [fengshuiResult, fengshuiExplanation]);
  
  // 筛选建议
  const filteredRecommendations = useMemo(() => {
    if (selectedCategory === 'all') {
      return allRecommendations;
    }
    return filterRecommendationsByCategory(allRecommendations, selectedCategory as any);
  }, [allRecommendations, selectedCategory]);
  
  const categories = [
    { key: 'all', label: '全部', icon: Filter },
    { key: 'health', label: '健康', icon: Heart },
    { key: 'wealth', label: '财运', icon: Target },
    { key: 'career', label: '事业', icon: TrendingUp },
    { key: 'relationship', label: '感情', icon: Users },
    { key: 'study', label: '学业', icon: BookOpen },
    { key: 'general', label: '综合', icon: Zap }
  ];
  
  const toggleCard = (id: string) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedCards(newExpanded);
  };
  
  return (
    <div className="space-y-6">
      {/* 标题和统计 */}
      <div className="flex items-center gap-3 mb-4">
        <Lightbulb className="w-6 h-6 text-blue-600" />
        <div>
          <h2 className="text-xl font-bold text-gray-900">智能风水建议</h2>
          <p className="text-gray-600">基于您的飞星分析，为您提供个性化建议</p>
        </div>
      </div>
      
      {/* 统计信息 */}
      <RecommendationStats recommendations={allRecommendations} />
      
      {/* 分类筛选 */}
      <Card className="p-4">
        <h3 className="font-semibold text-gray-900 mb-3">筛选建议</h3>
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => {
            const Icon = category.icon;
            const isActive = selectedCategory === category.key;
            
            return (
              <Button
                key={category.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category.key)}
                className="flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {category.label}
              </Button>
            );
          })}
        </div>
      </Card>
      
      {/* 建议列表 */}
      <div className="space-y-4">
        {filteredRecommendations.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-gray-500">
              <Lightbulb className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>暂无相关建议</p>
            </div>
          </Card>
        ) : (
          filteredRecommendations.map((recommendation) => (
            <RecommendationCard
              key={recommendation.id}
              recommendation={recommendation}
              isExpanded={expandedCards.has(recommendation.id)}
              onToggle={() => toggleCard(recommendation.id)}
            />
          ))
        )}
      </div>
    </div>
  );
}
