'use client';

/**
 * 化解方案选择器组件 (v6.0)
 *
 * 五级方案对比：
 * - 基础方案 (basic)
 * - 标准方案 (standard)
 * - 增强方案 (enhanced)
 * - 专业方案 (professional)
 * - 定制方案 (custom)
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  ArrowRight,
  Calendar,
  Check,
  Clock,
  DollarSign,
  Sparkles,
  Star,
} from 'lucide-react';
import React, { useState } from 'react';

// 方案级别
export type RemedyPlanLevel =
  | 'basic'
  | 'standard'
  | 'enhanced'
  | 'professional'
  | 'custom';

// 实施步骤
export interface ImplementationStep {
  id: string;
  order: number;
  title: string;
  description: string;
  duration: string;
  difficulty: 'easy' | 'medium' | 'hard';
  materials?: string[];
  cost?: string;
  tips?: string[];
}

// 化解物品
export interface RemedyItem {
  id: string;
  name: string;
  category: '摆件' | '植物' | '灯具' | '颜色' | '其他';
  description: string;
  placement: string;
  quantity?: number;
  estimatedCost?: string;
  priority: 'must' | 'recommended' | 'optional';
}

// 化解方案
export interface RemedyPlan {
  id: string;
  level: RemedyPlanLevel;
  name: string;
  description: string;
  targetArea: string; // 目标区域

  // 效果预期
  expectedOutcome: {
    health?: string;
    wealth?: string;
    career?: string;
    relationship?: string;
  };

  // 物品清单
  items: RemedyItem[];

  // 实施步骤
  steps: ImplementationStep[];

  // 时间线
  timeline: {
    preparation: string; // 准备阶段
    implementation: string; // 实施阶段
    maintenance: string; // 维护阶段
  };

  // 成本预估
  cost: {
    min: number;
    max: number;
    currency: string;
  };

  // 难度
  difficulty: 'beginner' | 'intermediate' | 'advanced';

  // 推荐度
  recommended: boolean;

  // 特色标签
  features: string[];
}

// 方案选择器属性
interface RemedyPlanSelectorProps {
  plans: RemedyPlan[];
  onSelectPlan?: (plan: RemedyPlan) => void;
  selectedPlanId?: string;
  className?: string;
}

// 方案级别配置
const LEVEL_CONFIG = {
  basic: {
    label: '基础方案',
    color: 'text-blue-600',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    icon: Check,
  },
  standard: {
    label: '标准方案',
    color: 'text-green-600',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    icon: Star,
  },
  enhanced: {
    label: '增强方案',
    color: 'text-purple-600',
    bgColor: 'bg-purple-50 dark:bg-purple-950/30',
    icon: Sparkles,
  },
  professional: {
    label: '专业方案',
    color: 'text-orange-600',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    icon: Star,
  },
  custom: {
    label: '定制方案',
    color: 'text-pink-600',
    bgColor: 'bg-pink-50 dark:bg-pink-950/30',
    icon: Sparkles,
  },
};

// 难度配置
const DIFFICULTY_CONFIG = {
  beginner: { label: '入门级', color: 'text-green-600' },
  intermediate: { label: '中级', color: 'text-yellow-600' },
  advanced: { label: '高级', color: 'text-red-600' },
};

// 优先级配置
const PRIORITY_CONFIG = {
  must: { label: '必备', variant: 'destructive' as const },
  recommended: { label: '推荐', variant: 'secondary' as const },
  optional: { label: '可选', variant: 'outline' as const },
};

/**
 * 化解方案选择器
 */
export function RemedyPlanSelector({
  plans,
  onSelectPlan,
  selectedPlanId,
  className,
}: RemedyPlanSelectorProps) {
  const [selectedTab, setSelectedTab] = useState<'comparison' | 'details'>(
    'comparison'
  );

  return (
    <div className={className}>
      <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as any)}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="comparison">方案对比</TabsTrigger>
          <TabsTrigger value="details">详细信息</TabsTrigger>
        </TabsList>

        <TabsContent value="comparison" className="space-y-4 mt-4">
          <PlanComparisonTable
            plans={plans}
            onSelectPlan={onSelectPlan}
            selectedPlanId={selectedPlanId}
          />
        </TabsContent>

        <TabsContent value="details" className="space-y-4 mt-4">
          {plans.map((plan) => (
            <PlanDetailCard
              key={plan.id}
              plan={plan}
              isSelected={plan.id === selectedPlanId}
              onSelect={() => onSelectPlan?.(plan)}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

/**
 * 方案对比表
 */
function PlanComparisonTable({
  plans,
  onSelectPlan,
  selectedPlanId,
}: {
  plans: RemedyPlan[];
  onSelectPlan?: (plan: RemedyPlan) => void;
  selectedPlanId?: string;
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {plans.map((plan) => {
        const config = LEVEL_CONFIG[plan.level];
        const Icon = config.icon;
        const isSelected = plan.id === selectedPlanId;

        return (
          <Card
            key={plan.id}
            className={cn(
              'transition-all cursor-pointer hover:shadow-lg',
              isSelected && 'ring-2 ring-primary',
              plan.recommended && 'border-primary'
            )}
            onClick={() => onSelectPlan?.(plan)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Icon className={cn('h-5 w-5', config.color)} />
                    <CardTitle className="text-lg">{plan.name}</CardTitle>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {config.label}
                  </Badge>
                </div>
                {plan.recommended && (
                  <Badge variant="default" className="text-xs">
                    推荐
                  </Badge>
                )}
              </div>
              <CardDescription className="text-sm mt-2">
                {plan.description}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* 成本 */}
              <div className="flex items-center gap-2 text-sm">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold">
                  {plan.cost.currency} {plan.cost.min} - {plan.cost.max}
                </span>
              </div>

              {/* 时间 */}
              <div className="flex items-center gap-2 text-sm">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  {plan.timeline.implementation}
                </span>
              </div>

              {/* 难度 */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">难度：</span>
                <span className={DIFFICULTY_CONFIG[plan.difficulty].color}>
                  {DIFFICULTY_CONFIG[plan.difficulty].label}
                </span>
              </div>

              {/* 特色 */}
              {plan.features.length > 0 && (
                <div className="space-y-1">
                  {plan.features.slice(0, 3).map((feature, idx) => (
                    <div
                      key={idx}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <Check className="h-3 w-3 mt-0.5 text-green-600" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button
                variant={isSelected ? 'default' : 'outline'}
                className="w-full"
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectPlan?.(plan);
                }}
              >
                {isSelected ? '已选择' : '选择方案'}
                {!isSelected && <ArrowRight className="ml-2 h-4 w-4" />}
              </Button>
            </CardFooter>
          </Card>
        );
      })}
    </div>
  );
}

/**
 * 方案详细卡片
 */
function PlanDetailCard({
  plan,
  isSelected,
  onSelect,
}: {
  plan: RemedyPlan;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const config = LEVEL_CONFIG[plan.level];

  return (
    <Card className={cn(isSelected && 'ring-2 ring-primary')}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              {plan.name}
              {plan.recommended && (
                <Badge variant="default" className="text-xs">
                  推荐
                </Badge>
              )}
            </CardTitle>
            <CardDescription className="mt-1">
              {plan.description}
            </CardDescription>
          </div>
          <Badge variant="secondary">{config.label}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* 预期效果 */}
        {Object.keys(plan.expectedOutcome).length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-semibold">预期效果</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {Object.entries(plan.expectedOutcome).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-start gap-2 p-2 rounded-md bg-muted/50"
                >
                  <span className="text-xs font-medium text-muted-foreground capitalize">
                    {key === 'health'
                      ? '健康'
                      : key === 'wealth'
                        ? '财运'
                        : key === 'career'
                          ? '事业'
                          : '感情'}
                    :
                  </span>
                  <span className="text-xs flex-1">{value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />

        {/* 物品清单 */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            物品清单 ({plan.items.length}项)
          </h4>
          <ItemList items={plan.items} />
        </div>

        <Separator />

        {/* 实施步骤 */}
        <div className="space-y-3">
          <h4 className="text-sm font-semibold">
            实施步骤 ({plan.steps.length}步)
          </h4>
          <StepTimeline steps={plan.steps} />
        </div>

        <Separator />

        {/* 时间安排 */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            时间安排
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <TimelinePhase
              label="准备阶段"
              duration={plan.timeline.preparation}
            />
            <TimelinePhase
              label="实施阶段"
              duration={plan.timeline.implementation}
            />
            <TimelinePhase
              label="维护阶段"
              duration={plan.timeline.maintenance}
            />
          </div>
        </div>
      </CardContent>

      <CardFooter className="flex items-center justify-between">
        <div className="text-sm">
          <span className="text-muted-foreground">预估成本：</span>
          <span className="font-semibold ml-2">
            {plan.cost.currency} {plan.cost.min} - {plan.cost.max}
          </span>
        </div>
        <Button variant={isSelected ? 'default' : 'outline'} onClick={onSelect}>
          {isSelected ? '已选择' : '选择方案'}
        </Button>
      </CardFooter>
    </Card>
  );
}

/**
 * 物品列表
 */
function ItemList({ items }: { items: RemedyItem[] }) {
  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
        >
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{item.name}</span>
              <Badge
                variant={PRIORITY_CONFIG[item.priority].variant}
                className="text-xs"
              >
                {PRIORITY_CONFIG[item.priority].label}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">{item.description}</p>
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <span>放置：{item.placement}</span>
              {item.quantity && <span>数量：{item.quantity}</span>}
              {item.estimatedCost && <span>约 {item.estimatedCost}</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 步骤时间线
 */
function StepTimeline({ steps }: { steps: ImplementationStep[] }) {
  return (
    <div className="space-y-3">
      {steps.map((step, index) => (
        <div key={step.id} className="flex gap-3">
          {/* 时间线左侧 */}
          <div className="flex flex-col items-center">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-semibold">
              {step.order}
            </div>
            {index < steps.length - 1 && (
              <div className="w-0.5 flex-1 bg-border mt-2 mb-2" />
            )}
          </div>

          {/* 步骤内容 */}
          <div className="flex-1 pb-6">
            <div className="rounded-lg border bg-card p-4 space-y-2">
              <div className="flex items-start justify-between gap-2">
                <h5 className="text-sm font-semibold">{step.title}</h5>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {step.duration}
                  </Badge>
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      step.difficulty === 'easy' &&
                        'bg-green-100 text-green-700',
                      step.difficulty === 'medium' &&
                        'bg-yellow-100 text-yellow-700',
                      step.difficulty === 'hard' && 'bg-red-100 text-red-700'
                    )}
                  >
                    {step.difficulty === 'easy'
                      ? '简单'
                      : step.difficulty === 'medium'
                        ? '中等'
                        : '困难'}
                  </Badge>
                </div>
              </div>

              <p className="text-xs text-muted-foreground">
                {step.description}
              </p>

              {step.materials && step.materials.length > 0 && (
                <div className="text-xs">
                  <span className="font-medium">所需材料：</span>
                  <span className="text-muted-foreground">
                    {step.materials.join('、')}
                  </span>
                </div>
              )}

              {step.cost && (
                <div className="text-xs">
                  <span className="font-medium">费用：</span>
                  <span className="text-muted-foreground">{step.cost}</span>
                </div>
              )}

              {step.tips && step.tips.length > 0 && (
                <div className="space-y-1 mt-2">
                  <span className="text-xs font-medium">💡 小贴士：</span>
                  {step.tips.map((tip, idx) => (
                    <p key={idx} className="text-xs text-muted-foreground pl-4">
                      • {tip}
                    </p>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * 时间线阶段
 */
function TimelinePhase({
  label,
  duration,
}: { label: string; duration: string }) {
  return (
    <div className="p-3 rounded-lg border bg-card space-y-1">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="text-sm font-semibold">{duration}</p>
    </div>
  );
}
