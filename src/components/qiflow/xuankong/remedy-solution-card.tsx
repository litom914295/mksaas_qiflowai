'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { 
  DollarSign, 
  ShoppingCart, 
  CheckCircle2, 
  Star, 
  AlertCircle,
  Package,
  Clock,
  Target,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 方案级别类型
export type SolutionLevel = 'basic' | 'standard' | 'professional' | 'ultimate';

// 化解方案接口
export interface RemedySolution {
  id: string;
  level: SolutionLevel;
  title: string;
  description: string;
  priceRange: {
    min: number;
    max: number;
    currency: string;
  };
  effectiveness: number; // 0-100
  timeRequired: string; // e.g. "1-3天", "1周", "1个月"
  difficulty: 'easy' | 'medium' | 'hard' | 'expert';
  items: RemedyItem[];
  steps: ImplementationStep[];
  benefits: string[];
  warnings?: string[];
  successRate: number; // 0-100
}

// 化解物品接口
export interface RemedyItem {
  name: string;
  quantity: number;
  price: number;
  description: string;
  shopLinks?: ShopLink[];
  image?: string;
  required: boolean;
}

// 购物链接接口
export interface ShopLink {
  platform: 'taobao' | 'jd' | 'amazon' | 'other';
  url: string;
  price: number;
  inStock: boolean;
}

// 实施步骤接口
export interface ImplementationStep {
  order: number;
  title: string;
  description: string;
  duration: string;
  tips?: string;
  image?: string;
}

// 级别配置
const LEVEL_CONFIG = {
  basic: {
    label: '基础方案',
    icon: Package,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    priceLabel: '预算 < ¥500',
    badge: 'default' as const,
  },
  standard: {
    label: '标准方案',
    icon: Star,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    priceLabel: '预算 ¥500-2000',
    badge: 'secondary' as const,
  },
  professional: {
    label: '专业方案',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-200',
    priceLabel: '预算 ¥2000-10000',
    badge: 'default' as const,
  },
  ultimate: {
    label: '终极方案',
    icon: Sparkles,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    priceLabel: '预算 > ¥10000',
    badge: 'destructive' as const,
  },
};

interface RemedySolutionCardProps {
  solution: RemedySolution;
  onSelectSolution?: (solution: RemedySolution) => void;
  isRecommended?: boolean;
  className?: string;
}

export function RemedySolutionCard({
  solution,
  onSelectSolution,
  isRecommended = false,
  className,
}: RemedySolutionCardProps) {
  const config = LEVEL_CONFIG[solution.level];
  const Icon = config.icon;

  // 计算总价格
  const totalPrice = solution.items
    .filter(item => item.required)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  // 难度标签
  const difficultyLabel = {
    easy: '简单',
    medium: '中等',
    hard: '困难',
    expert: '专家',
  }[solution.difficulty];

  const difficultyColor = {
    easy: 'text-green-600',
    medium: 'text-yellow-600',
    hard: 'text-orange-600',
    expert: 'text-red-600',
  }[solution.difficulty];

  return (
    <Card 
      className={cn(
        'relative overflow-hidden transition-all duration-300 hover:shadow-lg',
        config.borderColor,
        isRecommended && 'ring-2 ring-primary',
        className
      )}
    >
      {/* 推荐标签 */}
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-primary text-primary-foreground px-3 py-1 rounded-bl-lg text-sm font-semibold">
          推荐方案
        </div>
      )}

      {/* 级别标识条 */}
      <div className={cn('h-1 w-full', config.bgColor)} />

      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('h-6 w-6', config.color)} />
            </div>
            <div>
              <CardTitle className="text-xl">{solution.title}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant={config.badge}>{config.label}</Badge>
                <Badge variant="outline">{config.priceLabel}</Badge>
                <Badge variant="outline" className={difficultyColor}>
                  难度: {difficultyLabel}
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <CardDescription className="mt-3">
          {solution.description}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">概览</TabsTrigger>
            <TabsTrigger value="items">物品清单</TabsTrigger>
            <TabsTrigger value="steps">实施步骤</TabsTrigger>
            <TabsTrigger value="benefits">预期效果</TabsTrigger>
          </TabsList>

          {/* 概览 Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">有效性</span>
                  <span className="text-sm font-medium">{solution.effectiveness}%</span>
                </div>
                <Progress value={solution.effectiveness} className="h-2" />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">成功率</span>
                  <span className="text-sm font-medium">{solution.successRate}%</span>
                </div>
                <Progress value={solution.successRate} className="h-2" />
              </div>
            </div>

            <div className="flex items-center justify-between py-3 border-t">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">所需时间: {solution.timeRequired}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  预估费用: ¥{totalPrice.toFixed(0)}
                </span>
              </div>
            </div>

            {solution.warnings && solution.warnings.length > 0 && (
              <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-yellow-600 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                      注意事项
                    </p>
                    <ul className="text-xs text-yellow-700 dark:text-yellow-300 space-y-1">
                      {solution.warnings.map((warning, index) => (
                        <li key={index}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>

          {/* 物品清单 Tab */}
          <TabsContent value="items" className="space-y-3">
            {solution.items.map((item, index) => (
              <div 
                key={index} 
                className="flex items-center justify-between p-3 rounded-lg border"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.name}</span>
                    {item.required && (
                      <Badge variant="secondary" className="text-xs">必需</Badge>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {item.description}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">¥{item.price}</p>
                  <p className="text-xs text-muted-foreground">x{item.quantity}</p>
                </div>
              </div>
            ))}

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <span className="font-medium">总计</span>
                <span className="text-lg font-bold text-primary">
                  ¥{totalPrice.toFixed(0)}
                </span>
              </div>
            </div>
          </TabsContent>

          {/* 实施步骤 Tab */}
          <TabsContent value="steps" className="space-y-3">
            {solution.steps.map((step, index) => (
              <div key={index} className="relative pl-8">
                <div className="absolute left-0 top-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">
                  {step.order}
                </div>
                {index < solution.steps.length - 1 && (
                  <div className="absolute left-3 top-7 bottom-0 w-0.5 bg-border" />
                )}
                <div className="pb-4">
                  <h4 className="font-medium">{step.title}</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    {step.description}
                  </p>
                  {step.tips && (
                    <p className="text-xs text-blue-600 mt-2">
                      💡 提示: {step.tips}
                    </p>
                  )}
                  <Badge variant="outline" className="mt-2 text-xs">
                    预计用时: {step.duration}
                  </Badge>
                </div>
              </div>
            ))}
          </TabsContent>

          {/* 预期效果 Tab */}
          <TabsContent value="benefits" className="space-y-3">
            <div className="space-y-2">
              {solution.benefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600 mt-0.5" />
                  <span className="text-sm">{benefit}</span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <p className="text-sm font-medium">整体效果评分</p>
                  <p className="text-xs text-muted-foreground">
                    基于{solution.successRate}%的用户反馈
                  </p>
                </div>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star
                      key={star}
                      className={cn(
                        'h-4 w-4',
                        star <= Math.round(solution.effectiveness / 20)
                          ? 'text-yellow-500 fill-yellow-500'
                          : 'text-gray-300'
                      )}
                    />
                  ))}
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {/* 操作按钮 */}
        <div className="flex gap-2 mt-4">
          <Button 
            className="flex-1"
            onClick={() => onSelectSolution?.(solution)}
          >
            <ShoppingCart className="h-4 w-4 mr-2" />
            选择此方案
          </Button>
          <Button variant="outline">
            查看详情
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}