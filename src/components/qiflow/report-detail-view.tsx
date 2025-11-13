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
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  MapPin,
  Share2,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

type ReportOutput = {
  bazi: {
    yearPillar: { heavenlyStem: string; earthlyBranch: string };
    monthPillar: { heavenlyStem: string; earthlyBranch: string };
    dayPillar: { heavenlyStem: string; earthlyBranch: string };
    hourPillar: { heavenlyStem: string; earthlyBranch: string };
    elements: {
      wood: number;
      fire: number;
      earth: number;
      metal: number;
      water: number;
    };
  };
  flyingStar?: {
    sector: string;
    star: number;
    fortuneLevel: string;
  };
  themes: Array<{
    themeId: string;
    themeName: string;
    story: string;
    synthesis: string;
    recommendations: string[];
  }>;
  metadata: {
    aiCostUSD: number;
    generationTimeMs: number;
    qualityScore: number;
  };
};

type Report = {
  id: string;
  userId: string;
  reportType: 'basic' | 'essential';
  status: 'generating' | 'completed' | 'failed';
  input: Record<string, unknown>;
  output: ReportOutput | null;
  creditsUsed: number;
  generatedAt: Date | null;
  expiresAt: Date | null;
  metadata: {
    aiModel: string;
    generationTimeMs: number;
    aiCostUSD: number;
    purchaseMethod: 'credits' | 'stripe';
    stripePaymentId?: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
};

type Props = {
  report: Report;
  userId: string;
};

const THEME_LABELS: Record<string, string> = {
  career: '事业财运',
  relationship: '感情姻缘',
  health: '健康养生',
  education: '学业智慧',
  family: '家庭子女',
};

const THEME_ICONS: Record<string, string> = {
  career: '💼',
  relationship: '💖',
  health: '🌿',
  education: '📚',
  family: '🏡',
};

export function ReportDetailView({ report, userId }: Props) {
  const { toast } = useToast();
  const [activeTheme, setActiveTheme] = useState(
    report.output?.themes[0]?.themeId || ''
  );

  if (!report.output) {
    return (
      <div className="container max-w-4xl py-12">
        <p className="text-center text-muted-foreground">报告数据为空</p>
      </div>
    );
  }

  const { bazi, flyingStar, themes } = report.output;
  const metadata = report.metadata;
  const input = report.input as {
    birthDate: string;
    birthHour: string;
    gender: 'male' | 'female';
    location: string;
  };

  // 分享功能
  function handleShare() {
    const shareUrl = `${window.location.origin}/reports/${report.id}`;
    navigator.clipboard.writeText(shareUrl);
    toast({
      title: '链接已复制',
      description: '报告链接已复制到剪贴板',
    });
  }

  // PDF 导出 (TODO: 实际实现需要后端 API)
  function handleExport() {
    toast({
      title: '导出功能开发中',
      description: 'PDF 导出功能即将上线，敬请期待',
    });
  }

  const currentTheme = themes.find((t) => t.themeId === activeTheme);

  return (
    <div className="container max-w-6xl py-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6"
      >
        {/* 页面头部 */}
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                精华报告
              </h1>
              <Badge className="bg-green-600">
                <CheckCircle2 className="w-3 h-3 mr-1" />
                已完成
              </Badge>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <div className="flex items-center gap-1">
                <Calendar className="w-4 h-4" />
                {new Date(report.createdAt).toLocaleDateString('zh-CN')}
              </div>
              <div className="flex items-center gap-1">
                <Clock className="w-4 h-4" />
                生成用时: {metadata ? (metadata.generationTimeMs / 1000).toFixed(1) : '0.0'}s
              </div>
            </div>
          </div>

          {/* 操作按钮 */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share2 className="w-4 h-4 mr-2" />
              分享
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出 PDF
            </Button>
          </div>
        </div>

        {/* 基础信息卡片 */}
        <Card className="border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50">
          <CardHeader>
            <CardTitle className="text-lg">基础信息</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-muted-foreground mb-1">出生日期</p>
              <p className="font-medium">{input.birthDate}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">出生时辰</p>
              <p className="font-medium">{input.birthHour}时</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">性别</p>
              <p className="font-medium">
                {input.gender === 'male' ? '男' : '女'}
              </p>
            </div>
            <div className="flex items-start gap-1">
              <MapPin className="w-4 h-4 mt-1 text-muted-foreground" />
              <div>
                <p className="text-sm text-muted-foreground mb-1">出生地</p>
                <p className="font-medium">{input.location}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 八字命盘 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              八字命盘
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              {[
                { label: '年柱', pillar: bazi.yearPillar },
                { label: '月柱', pillar: bazi.monthPillar },
                { label: '日柱', pillar: bazi.dayPillar },
                { label: '时柱', pillar: bazi.hourPillar },
              ].map((item, index) => (
                <div
                  key={index}
                  className="text-center p-4 rounded-lg bg-gradient-to-br from-purple-100 to-pink-100"
                >
                  <p className="text-xs text-muted-foreground mb-2">
                    {item.label}
                  </p>
                  <div className="space-y-1">
                    <p className="text-2xl font-bold text-purple-900">
                      {item.pillar.heavenlyStem}
                    </p>
                    <p className="text-xl font-semibold text-purple-700">
                      {item.pillar.earthlyBranch}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* 五行分布 */}
            <Separator className="my-6" />
            <div>
              <p className="text-sm font-medium mb-3">五行分布</p>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(bazi.elements).map(([element, value]) => (
                  <div key={element} className="text-center">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-full bg-gradient-to-r from-purple-600 to-pink-600"
                        style={{ width: `${(value / 5) * 100}%` }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {element === 'wood'
                        ? '木'
                        : element === 'fire'
                          ? '火'
                          : element === 'earth'
                            ? '土'
                            : element === 'metal'
                              ? '金'
                              : '水'}
                      : {value}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 玄空飞星 (如果有) */}
        {flyingStar && (
          <Card>
            <CardHeader>
              <CardTitle>玄空飞星</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-6">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">方位</p>
                  <p className="text-xl font-bold">{flyingStar.sector}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">星数</p>
                  <p className="text-xl font-bold">{flyingStar.star} 星</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">吉凶</p>
                  <Badge
                    className={
                      flyingStar.fortuneLevel === '吉'
                        ? 'bg-green-600'
                        : flyingStar.fortuneLevel === '凶'
                          ? 'bg-red-600'
                          : 'bg-yellow-600'
                    }
                  >
                    {flyingStar.fortuneLevel}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* 主题切换 + 内容展示 */}
        <Card>
          <CardHeader>
            <CardTitle>深度解析</CardTitle>
            <CardDescription>
              选择不同主题，查看 AI 为您生成的个性化解读
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTheme} onValueChange={setActiveTheme}>
              <TabsList className="grid w-full grid-cols-3 mb-6">
                {themes.map((theme) => (
                  <TabsTrigger key={theme.themeId} value={theme.themeId}>
                    <span className="mr-1">{THEME_ICONS[theme.themeId]}</span>
                    {THEME_LABELS[theme.themeId] || theme.themeName}
                  </TabsTrigger>
                ))}
              </TabsList>

              <AnimatePresence mode="wait">
                {currentTheme && (
                  <motion.div
                    key={currentTheme.themeId}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TabsContent value={currentTheme.themeId}>
                      <div className="space-y-6">
                        {/* 故事化解读 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-purple-600" />
                            命理解读
                          </h3>
                          <div className="prose prose-purple max-w-none">
                            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                              {currentTheme.story}
                            </p>
                          </div>
                        </div>

                        <Separator />

                        {/* 综合分析 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            综合分析
                          </h3>
                          <div className="bg-purple-50 rounded-lg p-4">
                            <p className="text-sm leading-relaxed">
                              {currentTheme.synthesis}
                            </p>
                          </div>
                        </div>

                        {/* 个性化建议 */}
                        <div>
                          <h3 className="text-lg font-semibold mb-3">
                            个性化建议
                          </h3>
                          <ul className="space-y-2">
                            {currentTheme.recommendations.map((rec, index) => (
                              <motion.li
                                key={index}
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="flex items-start gap-2 p-3 rounded-lg bg-gradient-to-r from-purple-100 to-pink-100"
                              >
                                <CheckCircle2 className="w-5 h-5 text-purple-600 mt-0.5 flex-shrink-0" />
                                <span className="text-sm">{rec}</span>
                              </motion.li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </TabsContent>
                  </motion.div>
                )}
              </AnimatePresence>
            </Tabs>
          </CardContent>
        </Card>

        {/* 质量评分 */}
        <Card className="border-dashed">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">
                  报告质量评分
                </p>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-purple-900">
                    {metadata.qualityScore}
                  </span>
                  <span className="text-sm text-muted-foreground">/ 100</span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground space-y-1">
                <p>生成成本: ${metadata.aiCostUSD.toFixed(4)}</p>
                <p>购买积分: {report.creditsUsed} 积分</p>
                <p>报告永久有效</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 免责声明 */}
        <Card className="bg-yellow-50 border-yellow-200">
          <CardContent className="pt-6">
            <p className="text-xs text-yellow-800 leading-relaxed">
              <strong>免责声明：</strong>
              本报告由 AI
              根据传统命理学知识生成，仅供参考和娱乐。请理性看待，不应作为重大决策的唯一依据。
              命运掌握在自己手中，积极努力才是成功的关键。本平台不对报告内容的准确性或由此产生的任何后果承担责任。
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
