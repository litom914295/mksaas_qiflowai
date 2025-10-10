/**
 * AI增强分析结果展示组件
 * 用于展示AI生成的深度命理分析
 */

'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AIEnhancedAnalysis } from '@/lib/services/ai-enhanced-analysis';
import {
  Activity,
  Briefcase,
  DollarSign,
  Heart,
  Sparkles,
  User,
} from 'lucide-react';

interface AIEnhancedResultsProps {
  analysis: AIEnhancedAnalysis;
  isQuickAnalysis?: boolean;
  locale?: string;
}

/**
 * AI增强分析结果展示组件
 */
export function AIEnhancedResults({
  analysis,
  isQuickAnalysis = false,
  locale = 'zh-CN',
}: AIEnhancedResultsProps) {
  if (isQuickAnalysis) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            <CardTitle>AI快速分析</CardTitle>
          </div>
          <CardDescription>基于AI的初步命理解读</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription className="text-base leading-relaxed">
              {analysis.summary}
            </AlertDescription>
          </Alert>
          <p className="text-sm text-muted-foreground mt-4">
            生成时间: {new Date(analysis.generatedAt).toLocaleString(locale)}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* 标题卡片 */}
      <Card className="w-full bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950 dark:to-blue-950">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-yellow-500" />
              <CardTitle className="text-2xl">AI深度分析</CardTitle>
            </div>
            <Badge variant="secondary" className="text-xs">
              AI增强
            </Badge>
          </div>
          <CardDescription className="text-base">
            结合传统命理与现代AI技术的专业解读
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription className="text-base leading-relaxed">
              {analysis.summary}
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* 详细分析标签页 */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle>详细分析</CardTitle>
          <CardDescription>深入了解您的命理特点</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="personality" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="personality" className="text-xs sm:text-sm">
                <User className="h-4 w-4 mr-1" />
                性格
              </TabsTrigger>
              <TabsTrigger value="career" className="text-xs sm:text-sm">
                <Briefcase className="h-4 w-4 mr-1" />
                事业
              </TabsTrigger>
              <TabsTrigger value="wealth" className="text-xs sm:text-sm">
                <DollarSign className="h-4 w-4 mr-1" />
                财运
              </TabsTrigger>
              <TabsTrigger value="relationship" className="text-xs sm:text-sm">
                <Heart className="h-4 w-4 mr-1" />
                感情
              </TabsTrigger>
              <TabsTrigger value="health" className="text-xs sm:text-sm">
                <Activity className="h-4 w-4 mr-1" />
                健康
              </TabsTrigger>
            </TabsList>

            <TabsContent value="personality" className="space-y-4 mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-2">性格特点分析</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {analysis.personality}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="career" className="space-y-4 mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-2">事业发展指引</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {analysis.career}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="wealth" className="space-y-4 mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-2">财运状况分析</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {analysis.wealth}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="relationship" className="space-y-4 mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-2">感情婚姻指引</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {analysis.relationship}
                </p>
              </div>
            </TabsContent>

            <TabsContent value="health" className="space-y-4 mt-4">
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <h3 className="text-lg font-semibold mb-2">健康养生建议</h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap">
                  {analysis.health}
                </p>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 生成信息 */}
      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          AI分析生成于: {new Date(analysis.generatedAt).toLocaleString(locale)}
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          此分析仅供参考，实际情况请结合个人实际综合判断
        </p>
      </div>
    </div>
  );
}

/**
 * 加载骨架屏
 */
export function AIEnhancedResultsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <Card className="w-full">
        <CardHeader>
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full">
        <CardHeader>
          <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
