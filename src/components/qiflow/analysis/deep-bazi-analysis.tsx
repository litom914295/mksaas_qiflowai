'use client';

import type { ProfessionalBaziData } from '@/components/qiflow/analysis/bazi-professional-result';
import { LuckCycleTimeline } from '@/components/qiflow/charts/LuckCycleTimeline';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Info, Shield, Sparkles, Star } from 'lucide-react';

interface DeepBaziAnalysisProps {
  data: ProfessionalBaziData;
}

export function DeepBaziAnalysis({ data }: DeepBaziAnalysisProps) {
  if (!data) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>暂无分析数据</AlertDescription>
      </Alert>
    );
  }

  const { chart, wuxing, yongshen, pattern, shensha, interpretation, dayun } =
    data;

  return (
    <div className="space-y-6">
      {/* 顶部标题区 */}
      <div className="px-2">
        <h1 className="text-3xl md:text-4xl font-extrabold">
          深度八字命理分析 / Deep Bazi Analysis
        </h1>
        <p className="text-muted-foreground mt-1">
          基于专业算法的个性化命理洞察 / Personalized insights based on
          professional algorithms
        </p>
      </div>

      {/* 标签页导航 */}
      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid grid-cols-4 md:grid-cols-8 w-full">
          <TabsTrigger value="overview">总览</TabsTrigger>
          <TabsTrigger value="pillars">四柱</TabsTrigger>
          <TabsTrigger value="patterns">格局</TabsTrigger>
          <TabsTrigger value="wuxing">五行</TabsTrigger>
          <TabsTrigger value="shensha">神煞</TabsTrigger>
          <TabsTrigger value="dayun">大运</TabsTrigger>
          <TabsTrigger value="fortune">今日运势</TabsTrigger>
          <TabsTrigger value="insights">洞察</TabsTrigger>
        </TabsList>

        {/* 总览 */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-4 h-4 text-rose-600" />
                  日主强度
                </CardTitle>
                <CardDescription>命局整体强度</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">强度等级</div>
                  <div className="text-rose-600 font-semibold">
                    {wuxing.dayMasterStrength > 50 ? '强' : '弱'}
                  </div>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">强度分数</div>
                  <div className="font-medium">
                    {wuxing.dayMasterStrength}/100
                  </div>
                </div>
                <Progress
                  value={wuxing.dayMasterStrength}
                  className="h-2 mt-3"
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  有利五行
                </CardTitle>
                <CardDescription>增强运势的元素</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="secondary">{yongshen.primary.element}</Badge>
                  {yongshen.secondary && (
                    <Badge variant="outline">
                      {yongshen.secondary.element}
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-3">
                  {yongshen.recommendations[0]}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600" />
                  不利五行
                </CardTitle>
                <CardDescription>需要避免的元素</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="destructive">{yongshen.avoid.element}</Badge>
              </CardContent>
            </Card>
          </div>

          {/* 五行分布 */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Star className="w-4 h-4 text-indigo-600" />
                五行分布
              </CardTitle>
              <CardDescription>各五行元素的强度对比</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-5">
              {Object.entries(wuxing.elements).map(([k, v]) => (
                <div key={k} className="space-y-1">
                  <div className="text-sm text-muted-foreground">{k}</div>
                  <div className="text-2xl font-bold">{v}</div>
                  <Progress value={v} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 四柱 */}
        <TabsContent value="pillars">
          <Card>
            <CardHeader>
              <CardTitle>八字命盘</CardTitle>
              <CardDescription>四柱天干地支与纳音</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {(['year', 'month', 'day', 'hour'] as const).map((p, idx) => (
                  <div
                    key={p}
                    className="p-4 rounded-lg border bg-white space-y-1 text-center"
                  >
                    <div className="text-xs text-muted-foreground">
                      {['年柱', '月柱', '日柱', '时柱'][idx]}
                    </div>
                    <div className="text-2xl font-bold">
                      {chart.pillars[p].heavenlyStem}
                      {chart.pillars[p].earthlyBranch}
                    </div>
                    {chart.pillars[p].nayin && (
                      <div className="text-xs text-muted-foreground">
                        {chart.pillars[p].nayin}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 格局 */}
        <TabsContent value="patterns">
          <Card>
            <CardHeader>
              <CardTitle>命格格局</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
                <div className="text-lg font-semibold">
                  {pattern.details[0]?.name || '普通格局'}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {pattern.details[0]?.description}
                </p>
                <div className="flex items-center gap-2 mt-3">
                  <span className="text-sm text-muted-foreground">
                    格局纯度：
                  </span>
                  <Progress value={pattern.strength} className="h-2 flex-1" />
                  <span className="text-sm font-medium">
                    {pattern.strength}%
                  </span>
                </div>
              </div>
              {pattern.subPatterns?.length ? (
                <div className="flex flex-wrap gap-2">
                  {pattern.subPatterns.map((s) => (
                    <Badge key={s} variant="outline">
                      {s}
                    </Badge>
                  ))}
                </div>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 五行 */}
        <TabsContent value="wuxing">
          <Card>
            <CardHeader>
              <CardTitle>五行力量分析</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(wuxing.elements).map(([k, v]) => (
                <div key={k} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <div className="font-medium">{k}</div>
                    <Badge variant="secondary">{v}%</Badge>
                  </div>
                  <Progress value={v} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        {/* 神煞 */}
        <TabsContent value="shensha" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>神煞分析</CardTitle>
              <CardDescription>
                吉神 {shensha.jiShen.length} 个，凶神 {shensha.xiongShen.length}{' '}
                个
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <div className="font-medium text-emerald-700">吉神</div>
                {shensha.jiShen.slice(0, 3).map((js) => (
                  <div
                    key={js.name}
                    className="p-3 rounded-lg border bg-emerald-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{js.name}</div>
                      <Badge variant="outline" className="text-xs">
                        力量 {js.strength}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {js.description}
                    </div>
                  </div>
                ))}
              </div>
              <div className="space-y-2">
                <div className="font-medium text-rose-700">凶神</div>
                {shensha.xiongShen.slice(0, 3).map((xs) => (
                  <div
                    key={xs.name}
                    className="p-3 rounded-lg border bg-rose-50"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-medium text-sm">{xs.name}</div>
                      <Badge variant="outline" className="text-xs">
                        力量 {xs.strength}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {xs.advice}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 大运 */}
        <TabsContent value="dayun">
          {dayun?.cycles?.length ? (
            <Card>
              <CardHeader>
                <CardTitle>大运流年</CardTitle>
                <CardDescription>
                  一生运势变化规律，每十年一个大运周期
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LuckCycleTimeline
                  cycles={dayun.cycles}
                  currentAge={dayun.currentAge}
                />
              </CardContent>
            </Card>
          ) : (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>暂无大运数据</AlertDescription>
            </Alert>
          )}
        </TabsContent>

        {/* 今日运势（占位） */}
        <TabsContent value="fortune">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>今日运势模块尚未接入数据源。</AlertDescription>
          </Alert>
        </TabsContent>

        {/* 洞察 */}
        <TabsContent value="insights">
          <Card>
            <CardHeader>
              <CardTitle>关键洞察</CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                {(interpretation?.summary?.strengths || []).map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
