'use client';

import { LuckCycleTimeline } from '@/components/qiflow/charts/LuckCycleTimeline';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  AlertCircle,
  Briefcase,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Clock,
  DollarSign,
  Download,
  Heart,
  Info,
  Share2,
  Shield,
  Sparkles,
  Star,
  TrendingUp,
  User,
} from 'lucide-react';
import { useState } from 'react';

// 专业版八字分析数据类型
export interface ProfessionalBaziData {
  chart: {
    pillars: {
      year: { heavenlyStem: string; earthlyBranch: string; nayin?: string };
      month: { heavenlyStem: string; earthlyBranch: string; nayin?: string };
      day: { heavenlyStem: string; earthlyBranch: string; nayin?: string };
      hour: { heavenlyStem: string; earthlyBranch: string; nayin?: string };
    };
  };
  wuxing: {
    dayMasterStrength: number;
    elements: Record<string, number>;
    balance: {
      strongest: string;
      weakest: string;
    };
  };
  yongshen: {
    primary: { element: string };
    secondary?: { element: string };
    avoid: { element: string };
    recommendations: string[];
  };
  pattern: {
    details: Array<{ name: string; description: string }>;
    strength: number;
    subPatterns: string[];
  };
  shensha: {
    jiShen: Array<{ name: string; strength: number; description: string }>;
    xiongShen: Array<{ name: string; strength: number; advice: string }>;
  };
  interpretation: {
    summary: {
      overview: string;
      strengths: string[];
      challenges: string[];
    };
    detailed: {
      personality: string[];
      career: string[];
      wealth: string[];
      relationships: string[];
      health: string[];
    };
  };
  dayun?: {
    cycles: Array<{
      age: number;
      startYear: number;
      endYear: number;
      heavenly: string;
      earthly: string;
      element: string;
      quality: 'excellent' | 'good' | 'neutral' | 'challenging';
      description?: string;
    }>;
    currentAge?: number;
  };
}

interface BaziProfessionalResultProps {
  data: ProfessionalBaziData;
  onBack?: () => void;
  onShare?: () => void;
  onDownload?: () => void;
}

// 五行颜色映射
const elementColors: Record<string, string> = {
  木: 'bg-green-100 text-green-800',
  火: 'bg-red-100 text-red-800',
  土: 'bg-yellow-100 text-yellow-800',
  金: 'bg-gray-100 text-gray-800',
  水: 'bg-blue-100 text-blue-800',
};

// 五行图标
const elementIcons: Record<string, string> = {
  木: '🌳',
  火: '🔥',
  土: '🏔️',
  金: '💎',
  水: '💧',
};

export function BaziProfessionalResult({
  data,
  onBack,
  onShare,
  onDownload,
}: BaziProfessionalResultProps) {
  const [activeTab, setActiveTab] = useState('overview');

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
      {/* 顶部操作栏 */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>
          <ChevronRight className="mr-2 h-4 w-4 rotate-180" />
          返回
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onShare}>
            <Share2 className="mr-2 h-4 w-4" />
            分享
          </Button>
          <Button variant="outline" size="sm" onClick={onDownload}>
            <Download className="mr-2 h-4 w-4" />
            下载报告
          </Button>
        </div>
      </div>

      {/* 八字基本信息卡片 */}
      <Card className="border-2 border-purple-200">
        <CardHeader className="bg-gradient-to-r from-purple-50 to-pink-50">
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600" />
            八字命盘
          </CardTitle>
          <CardDescription>您的四柱八字与五行分析</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-4 gap-4">
            {['year', 'month', 'day', 'hour'].map((pillar, index) => (
              <div
                key={pillar}
                className="text-center space-y-2 p-4 rounded-lg bg-gradient-to-b from-gray-50 to-white border"
              >
                <div className="text-xs text-gray-500">
                  {['年柱', '月柱', '日柱', '时柱'][index]}
                </div>
                <div className="text-2xl font-bold">
                  {
                    chart.pillars[pillar as keyof typeof chart.pillars]
                      .heavenlyStem
                  }
                  {
                    chart.pillars[pillar as keyof typeof chart.pillars]
                      .earthlyBranch
                  }
                </div>
                {chart.pillars[pillar as keyof typeof chart.pillars].nayin && (
                  <div className="text-xs text-gray-400">
                    {chart.pillars[pillar as keyof typeof chart.pillars].nayin}
                  </div>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 五行力量分析 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            五行力量分析
          </CardTitle>
          <CardDescription>
            日主强度：
            <span className="font-semibold ml-1">
              {wuxing.dayMasterStrength}分
            </span>
            {wuxing.dayMasterStrength > 50 ? ' (偏强)' : ' (偏弱)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {Object.entries(wuxing.elements).map(([element, value]) => (
            <div key={element} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-lg">{elementIcons[element]}</span>
                  <span className="font-medium">{element}</span>
                  <Badge variant="secondary" className={elementColors[element]}>
                    {value}%
                  </Badge>
                </div>
                {element === wuxing.balance.strongest && (
                  <Badge variant="default">最强</Badge>
                )}
                {element === wuxing.balance.weakest && (
                  <Badge variant="outline">最弱</Badge>
                )}
              </div>
              <Progress value={value} className="h-2" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 格局与用神 */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* 格局分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-yellow-600" />
              命格格局
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-gradient-to-br from-yellow-50 to-orange-50 border border-yellow-200">
              <div className="font-semibold text-lg mb-2">
                {pattern.details[0]?.name || '普通格局'}
              </div>
              <div className="text-sm text-gray-600 mb-3">
                {pattern.details[0]?.description}
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-500">格局纯度：</span>
                <Progress value={pattern.strength} className="flex-1 h-2" />
                <span className="text-sm font-medium">{pattern.strength}%</span>
              </div>
            </div>

            {pattern.subPatterns.length > 0 && (
              <div className="space-y-2">
                <div className="text-sm font-medium text-gray-500">
                  辅助格局
                </div>
                <div className="flex flex-wrap gap-2">
                  {pattern.subPatterns.map((sub) => (
                    <Badge key={sub} variant="outline">
                      {sub}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 用神分析 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              用神忌神
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-50 border border-green-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <span className="font-medium">用神</span>
                </div>
                <Badge className={elementColors[yongshen.primary.element]}>
                  {elementIcons[yongshen.primary.element]}{' '}
                  {yongshen.primary.element}
                </Badge>
              </div>

              {yongshen.secondary && (
                <div className="flex items-center justify-between p-3 rounded-lg bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-blue-600" />
                    <span className="font-medium">喜神</span>
                  </div>
                  <Badge className={elementColors[yongshen.secondary.element]}>
                    {elementIcons[yongshen.secondary.element]}{' '}
                    {yongshen.secondary.element}
                  </Badge>
                </div>
              )}

              <div className="flex items-center justify-between p-3 rounded-lg bg-red-50 border border-red-200">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <span className="font-medium">忌神</span>
                </div>
                <Badge className={elementColors[yongshen.avoid.element]}>
                  {elementIcons[yongshen.avoid.element]}{' '}
                  {yongshen.avoid.element}
                </Badge>
              </div>
            </div>

            <Alert>
              <Info className="h-4 w-4" />
              <AlertDescription className="text-xs">
                {yongshen.recommendations[0]}
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* 神煞分析 */}
      <Card>
        <CardHeader>
          <CardTitle>神煞分析</CardTitle>
          <CardDescription>
            吉神 {shensha.jiShen.length} 个，凶神 {shensha.xiongShen.length} 个
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {/* 吉神 */}
            <div className="space-y-3">
              <div className="font-medium text-green-600">吉神</div>
              {shensha.jiShen.slice(0, 3).map((js) => (
                <div
                  key={js.name}
                  className="p-3 rounded-lg bg-green-50 border border-green-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{js.name}</span>
                    <Badge variant="outline" className="text-xs">
                      力量 {js.strength}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">{js.description}</div>
                </div>
              ))}
            </div>

            {/* 凶神 */}
            <div className="space-y-3">
              <div className="font-medium text-red-600">凶神</div>
              {shensha.xiongShen.slice(0, 3).map((xs) => (
                <div
                  key={xs.name}
                  className="p-3 rounded-lg bg-red-50 border border-red-100"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">{xs.name}</span>
                    <Badge variant="outline" className="text-xs">
                      力量 {xs.strength}
                    </Badge>
                  </div>
                  <div className="text-xs text-gray-600">{xs.advice}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 大运流年时间线 */}
      {dayun?.cycles && dayun.cycles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-purple-600" />
              大运流年
            </CardTitle>
            <CardDescription>
              一生运势变化规律，每十年一个大运周期
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <LuckCycleTimeline
              cycles={dayun.cycles}
              currentAge={dayun.currentAge}
            />
          </CardContent>
        </Card>
      )}

      {/* 详细解读标签页 */}
      <Card>
        <CardHeader>
          <CardTitle>详细解读</CardTitle>
          <CardDescription>基于AI智能分析的个性化命理解读</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-6 w-full">
              <TabsTrigger value="overview">总览</TabsTrigger>
              <TabsTrigger value="personality">性格</TabsTrigger>
              <TabsTrigger value="career">事业</TabsTrigger>
              <TabsTrigger value="wealth">财运</TabsTrigger>
              <TabsTrigger value="relationship">感情</TabsTrigger>
              <TabsTrigger value="health">健康</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
              <div className="prose prose-sm max-w-none">
                <p className="text-gray-700">
                  {interpretation.summary.overview}
                </p>

                <div className="grid gap-4 md:grid-cols-2 mt-4">
                  <div className="p-4 rounded-lg bg-green-50">
                    <div className="font-medium text-green-800 mb-2">
                      优势特点
                    </div>
                    <ul className="space-y-1">
                      {interpretation.summary.strengths.map((s, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 flex items-start"
                        >
                          <CheckCircle2 className="h-3 w-3 mt-0.5 mr-2 text-green-600 flex-shrink-0" />
                          {s}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 rounded-lg bg-orange-50">
                    <div className="font-medium text-orange-800 mb-2">
                      改善建议
                    </div>
                    <ul className="space-y-1">
                      {interpretation.summary.challenges.map((c, i) => (
                        <li
                          key={i}
                          className="text-sm text-gray-700 flex items-start"
                        >
                          <Info className="h-3 w-3 mt-0.5 mr-2 text-orange-600 flex-shrink-0" />
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="personality">
              <Accordion type="single" collapsible defaultValue="item-1">
                {interpretation.detailed.personality.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index + 1}`}>
                    <AccordionTrigger className="text-sm">
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        {item.split('：')[0]}
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <p className="text-sm text-gray-600">
                        {item.split('：')[1] || item}
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </TabsContent>

            <TabsContent value="career">
              <div className="space-y-3">
                {interpretation.detailed.career.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-blue-50 border border-blue-100"
                  >
                    <div className="flex items-start gap-2">
                      <Briefcase className="h-4 w-4 text-blue-600 mt-0.5" />
                      <p className="text-sm">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="wealth">
              <div className="space-y-3">
                {interpretation.detailed.wealth.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-yellow-50 border border-yellow-100"
                  >
                    <div className="flex items-start gap-2">
                      <DollarSign className="h-4 w-4 text-yellow-600 mt-0.5" />
                      <p className="text-sm">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="relationship">
              <div className="space-y-3">
                {interpretation.detailed.relationships.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-pink-50 border border-pink-100"
                  >
                    <div className="flex items-start gap-2">
                      <Heart className="h-4 w-4 text-pink-600 mt-0.5" />
                      <p className="text-sm">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="health">
              <div className="space-y-3">
                {interpretation.detailed.health.map((item, index) => (
                  <div
                    key={index}
                    className="p-3 rounded-lg bg-purple-50 border border-purple-100"
                  >
                    <div className="flex items-start gap-2">
                      <Shield className="h-4 w-4 text-purple-600 mt-0.5" />
                      <p className="text-sm">{item}</p>
                    </div>
                  </div>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* 底部提示 */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          以上分析基于传统命理学与AI智能算法，仅供参考。人生发展受多种因素影响，请理性对待。
        </AlertDescription>
      </Alert>
    </div>
  );
}
