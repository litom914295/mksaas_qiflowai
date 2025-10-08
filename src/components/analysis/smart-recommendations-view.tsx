'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import type { ComprehensiveAnalysisResult } from '@/lib/qiflow/xuankong/comprehensive-engine';
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock,
  Filter,
  Lightbulb,
  Sparkles,
} from 'lucide-react';
import React, { useState } from 'react';

interface SmartRecommendationsViewProps {
  analysisResult: ComprehensiveAnalysisResult;
  className?: string;
}

/**
 * 智能推荐视图组件
 * 展示AI生成的优先建议和行动计划
 */
export function SmartRecommendationsView({
  analysisResult,
  className = '',
}: SmartRecommendationsViewProps) {
  const { smartRecommendations } = analysisResult;
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedPriority, setSelectedPriority] = useState<string>('all');

  if (!smartRecommendations) {
    return (
      <div className="flex items-center justify-center p-12 text-muted-foreground">
        <p>智能推荐数据不可用</p>
      </div>
    );
  }

  // 从smartRecommendations中提取数据
  const prioritizedActions = smartRecommendations.all || [];
  const quickWins = smartRecommendations.urgent || [];
  // 创建模拟的长期计划数据
  const longTermPlan = {
    phases: [
      { title: '第一阶段', description: '基础调整' },
      { title: '第二阶段', description: '深度优化' },
      { title: '第三阶段', description: '长期维护' },
    ],
  };
  const actionTimeline: any[] = [];

  // 获取优先级图标
  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'low':
        return <Clock className="w-4 h-4 text-gray-500" />;
      default:
        return <Lightbulb className="w-4 h-4" />;
    }
  };

  // 获取优先级徽章
  const getPriorityBadge = (priority: string) => {
    const variants: Record<string, any> = {
      urgent: { variant: 'destructive', label: '紧急' },
      high: { variant: 'destructive', label: '高' },
      medium: { variant: 'default', label: '中' },
      low: { variant: 'secondary', label: '低' },
    };
    return variants[priority] || { variant: 'outline', label: '一般' };
  };

  // 筛选推荐
  const filteredActions = prioritizedActions.filter((action: any) => {
    const categoryMatch =
      selectedCategory === 'all' || action.category === selectedCategory;
    const priorityMatch =
      selectedPriority === 'all' || action.priority === selectedPriority;
    return categoryMatch && priorityMatch;
  });

  // 获取分类统计
  const categoryStats = prioritizedActions.reduce(
    (acc: Record<string, number>, action: any) => {
      acc[action.category] = (acc[action.category] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 智能概览 */}
      <Card className="bg-gradient-to-br from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <CardTitle>AI智能分析概览</CardTitle>
          </div>
          <CardDescription>
            基于深度学习算法生成的个性化建议方案
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-red-600">
                {
                  prioritizedActions.filter((a: any) => a.priority === 'urgent')
                    .length
                }
              </p>
              <p className="text-sm text-muted-foreground mt-1">紧急事项</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-orange-600">
                {prioritizedActions.filter((a: any) => a.priority === 'high').length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">高优先级</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-blue-600">
                {quickWins.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">快速见效</p>
            </div>
            <div className="bg-white rounded-lg p-4 text-center">
              <p className="text-3xl font-bold text-green-600">
                {longTermPlan.phases.length}
              </p>
              <p className="text-sm text-muted-foreground mt-1">实施阶段</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 快速见效方案 */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="w-5 h-5 text-green-500" />
            <CardTitle>快速见效方案</CardTitle>
          </div>
          <CardDescription>这些措施可以在短时间内产生明显效果</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {quickWins.map((win: any, idx: number) => (
              <div
                key={idx}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-start space-x-3 flex-1">
                    <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-green-600">
                        {idx + 1}
                      </span>
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium mb-1">{win.title || win.type || '快速建议'}</h4>
                      <p className="text-sm text-muted-foreground mb-2">
                        {win.description || win.content || '暂无详细描述'}
                      </p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>⏱️ 耗时: {win.estimatedTime || '待评估'}</span>
                        <span>💰 成本: {win.estimatedCost || '待评估'}</span>
                        <span>📈 预期效果: {win.expectedImpact || win.priority || '中等'}</span>
                      </div>
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    查看详情
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
                {win.steps && (
                  <div className="mt-3 pl-11">
                    <p className="text-xs font-medium mb-2">实施步骤:</p>
                    <ol className="space-y-1">
                      {win.steps.map((step: any, i: number) => (
                        <li key={i} className="text-xs text-muted-foreground">
                          {i + 1}. {step}
                        </li>
                      ))}
                    </ol>
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 筛选器和行动清单 */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lightbulb className="w-5 h-5 text-primary" />
              <CardTitle>优先行动清单</CardTitle>
            </div>
            <div className="flex items-center space-x-2">
              <Filter className="w-4 h-4 text-muted-foreground" />
              <select
                className="text-sm border rounded px-2 py-1"
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <option value="all">全部分类</option>
                <option value="layout">布局调整</option>
                <option value="decoration">装饰优化</option>
                <option value="color">色彩搭配</option>
                <option value="furniture">家具摆放</option>
              </select>
              <select
                className="text-sm border rounded px-2 py-1"
                value={selectedPriority}
                onChange={(e) => setSelectedPriority(e.target.value)}
              >
                <option value="all">全部优先级</option>
                <option value="urgent">紧急</option>
                <option value="high">高</option>
                <option value="medium">中</option>
                <option value="low">低</option>
              </select>
            </div>
          </div>
          <CardDescription>
            共 {filteredActions.length} 项建议，按优先级排序
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {filteredActions.map((action: any, idx: number) => {
              const badge = getPriorityBadge(action.priority);
              return (
                <div key={idx} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-start space-x-2 flex-1">
                      {getPriorityIcon(action.priority)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-medium">{action.title}</h4>
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          <Badge variant="outline">{action.category}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {action.description}
                        </p>
                        <div className="text-xs text-muted-foreground">
                          原因: {action.reason}
                        </div>
                      </div>
                    </div>
                  </div>
                  {action.specificSteps && action.specificSteps.length > 0 && (
                    <div className="mt-3 pl-6 border-l-2 border-gray-200">
                      <p className="text-xs font-medium mb-2">具体措施:</p>
                      <ul className="space-y-1">
                        {action.specificSteps.map((step: any, i: number) => (
                          <li key={i} className="text-xs text-muted-foreground">
                            • {step}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 长期规划 */}
      <Card>
        <CardHeader>
          <CardTitle>长期改善计划</CardTitle>
          <CardDescription>分阶段实施，持续优化您的居住环境</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {longTermPlan.phases.map((phase: any, idx: number) => (
              <div key={idx} className="relative">
                {idx < longTermPlan.phases.length - 1 && (
                  <div className="absolute left-4 top-12 bottom-0 w-0.5 bg-gray-200" />
                )}
                <div className="flex items-start space-x-4">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0 relative z-10">
                    {idx + 1}
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-muted/50 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{phase.name || phase.title || `第${idx + 1}阶段`}</h4>
                        <Badge variant="outline">{phase.duration || '持续进行'}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        {phase.description}
                      </p>
                      <div className="space-y-2">
                        <p className="text-xs font-medium">主要任务:</p>
                        <ul className="space-y-1">
                          {(phase.tasks || []).map((task: any, i: number) => (
                            <li
                              key={i}
                              className="text-xs text-muted-foreground flex items-start"
                            >
                              <ChevronRight className="w-3 h-3 mr-1 mt-0.5 flex-shrink-0" />
                              <span>{task}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      {phase.milestones && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-xs font-medium">
                            里程碑: {phase.milestones}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 行动时间轴 */}
      <Card>
        <CardHeader>
          <CardTitle>行动时间轴</CardTitle>
          <CardDescription>建议的实施时间安排</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {actionTimeline.map((period: any, idx: number) => (
              <div key={idx} className="border-l-4 border-primary pl-4 py-2">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium">{period.timeframe}</h4>
                  <Badge>{period.focus}</Badge>
                </div>
                <ul className="space-y-1">
                  {(period.actions || []).map((action: any, i: number) => (
                    <li key={i} className="text-sm text-muted-foreground">
                      • {action}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 底部说明 */}
      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="text-sm text-muted-foreground space-y-2">
            <p className="font-medium">🤖 AI推荐说明：</p>
            <ul className="space-y-1 ml-4">
              <li>• 智能推荐基于深度学习算法和风水专家经验库生成</li>
              <li>• 建议优先处理紧急和高优先级事项，循序渐进实施</li>
              <li>• 快速见效方案可以立即开始，长期计划需要耐心执行</li>
              <li>• 所有建议仅供参考，请根据实际情况灵活调整</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default SmartRecommendationsView;
