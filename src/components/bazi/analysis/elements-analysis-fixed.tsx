/**
 * 八字分析 - 五行分析组件
 * 详细展示五行力量、藏干、月令旺相休囚死等分析
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  BarChart3,
  CheckCircle,
  Info,
  Sparkles,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface ElementsAnalysisProps {
  data: BaziAnalysisModel;
}

// 五行颜色映射
const elementColors: Record<
  string,
  { bg: string; text: string; border: string }
> = {
  wood: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300',
  },
  fire: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  earth: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300',
  },
  metal: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300',
  },
  water: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300',
  },
};

// 五行中文映射
const elementNames: Record<string, string> = {
  wood: '木',
  fire: '火',
  earth: '土',
  metal: '金',
  water: '水',
};

// 五行图标
const elementIcons: Record<string, string> = {
  wood: '🌳',
  fire: '🔥',
  earth: '🏔️',
  metal: '💎',
  water: '💧',
};

// 五行生克关系
const elementRelations = {
  generates: {
    wood: 'fire',
    fire: 'earth',
    earth: 'metal',
    metal: 'water',
    water: 'wood',
  },
  controls: {
    wood: 'earth',
    fire: 'metal',
    earth: 'water',
    metal: 'wood',
    water: 'fire',
  },
};

// 地支藏干
const hiddenStems: Record<string, string[]> = {
  子: ['癸'],
  丑: ['己', '癸', '辛'],
  寅: ['甲', '丙', '戊'],
  卯: ['乙'],
  辰: ['戊', '乙', '癸'],
  巳: ['丙', '庚', '戊'],
  午: ['丁', '己'],
  未: ['己', '丁', '乙'],
  申: ['庚', '壬', '戊'],
  酉: ['辛'],
  戌: ['戊', '辛', '丁'],
  亥: ['壬', '甲'],
};

// 月令旺相休囚死
const monthlyStates = {
  春: { wang: '木', xiang: '火', xiu: '水', qiu: '金', si: '土' },
  夏: { wang: '火', xiang: '土', xiu: '木', qiu: '水', si: '金' },
  秋: { wang: '金', xiang: '水', xiu: '土', qiu: '火', si: '木' },
  冬: { wang: '水', xiang: '木', xiu: '金', qiu: '土', si: '火' },
};

export function ElementsAnalysis({ data }: ElementsAnalysisProps) {
  const { base, metrics } = data;

  // 获取季节
  const getSeason = (month: string): '春' | '夏' | '秋' | '冬' => {
    const springMonths = ['寅', '卯', '辰'];
    const summerMonths = ['巳', '午', '未'];
    const autumnMonths = ['申', '酉', '戌'];
    const winterMonths = ['亥', '子', '丑'];

    if (springMonths.includes(month)) return '春';
    if (summerMonths.includes(month)) return '夏';
    if (autumnMonths.includes(month)) return '秋';
    return '冬';
  };

  const season = getSeason(base.pillars.month.earthlyBranch);
  const seasonalState = monthlyStates[season];

  // 计算五行相对强度
  const getStrengthLevel = (
    score: number
  ): { label: string; color: string; icon: any } => {
    if (score >= 30)
      return { label: '极旺', color: 'text-green-600', icon: TrendingUp };
    if (score >= 20)
      return { label: '偏旺', color: 'text-blue-600', icon: ArrowUp };
    if (score >= 15)
      return { label: '平和', color: 'text-gray-600', icon: ArrowRight };
    if (score >= 10)
      return { label: '偏弱', color: 'text-orange-600', icon: ArrowDown };
    return { label: '极弱', color: 'text-red-600', icon: TrendingDown };
  };

  return (
    <div className="space-y-6">
      {/* 五行力量总览 */}
      <Card className="border-2 border-teal-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            五行力量分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.elementScores).map(([element, score]) => {
              const strengthInfo = getStrengthLevel(score);
              const Icon = strengthInfo.icon;
              const colors = elementColors[element];

              return (
                <div key={element} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">
                        {elementIcons[elementNames[element]]}
                      </span>
                      <span className="font-medium">
                        {elementNames[element]}
                      </span>
                      <Badge
                        variant="outline"
                        className={`${colors.bg} ${colors.text} ${colors.border}`}
                      >
                        {score}%
                      </Badge>
                      <Icon className={`w-4 h-4 ${strengthInfo.color}`} />
                      <span className={`text-sm ${strengthInfo.color}`}>
                        {strengthInfo.label}
                      </span>
                    </div>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>
              );
            })}
          </div>

          {/* 五行平衡提示 */}
          <div className="mt-6 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border-2">
            {metrics.balance.status === 'balanced' ? (
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                <div>
                  <p className="font-medium text-green-800">五行平衡</p>
                  <p className="text-sm text-gray-600 mt-1">
                    您的五行分布较为均衡,命局稳定,易于发挥天赋。
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">五行失衡</p>
                  <div className="text-sm text-gray-700 mt-1 space-y-1">
                    {metrics.balance.excess &&
                      metrics.balance.excess.length > 0 && (
                        <p>• 过旺五行: {metrics.balance.excess.join('、')}</p>
                      )}
                    {metrics.balance.shortage &&
                      metrics.balance.shortage.length > 0 && (
                        <p>• 不足五行: {metrics.balance.shortage.join('、')}</p>
                      )}
                    <p className="mt-2 text-orange-700">
                      建议通过补足不足五行来达到平衡,可参考用神建议。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Tabs: 藏干、月令、生克关系 */}
      <Tabs defaultValue="hidden" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="hidden">地支藏干</TabsTrigger>
          <TabsTrigger value="monthly">月令分析</TabsTrigger>
          <TabsTrigger value="relations">生克关系</TabsTrigger>
        </TabsList>

        {/* 地支藏干分析 */}
        <TabsContent value="hidden" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                地支藏干详解
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {['year', 'month', 'day', 'hour'].map((pillar, index) => {
                  const pillarData =
                    base.pillars[pillar as keyof typeof base.pillars];
                  const branch = pillarData.earthlyBranch;
                  const stems = hiddenStems[branch] || [];
                  const pillarNames = ['年支', '月支', '日支', '时支'];

                  return (
                    <Card key={pillar} className="border-2">
                      <CardContent className="pt-6">
                        <div className="text-center space-y-3">
                          <div className="text-xs text-gray-500 font-medium">
                            {pillarNames[index]}
                          </div>
                          <div className="text-3xl font-bold text-blue-700">
                            {branch}
                          </div>
                          <div className="text-sm text-gray-600">藏干:</div>
                          <div className="space-y-1">
                            {stems.map((stem, idx) => (
                              <Badge
                                key={idx}
                                variant="outline"
                                className="text-sm mx-0.5"
                              >
                                {stem}
                                {idx === 0 && stems.length > 1 && ' (本气)'}
                                {idx === stems.length - 1 &&
                                  stems.length > 2 &&
                                  ' (余气)'}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {/* 藏干说明 */}
              <div className="mt-6 p-4 rounded-lg bg-purple-50 border-2 border-purple-200">
                <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  藏干解读
                </h4>
                <div className="text-sm text-gray-700 space-y-1">
                  <p>• 本气: 地支中力量最强的天干,影响最大</p>
                  <p>• 中气: 地支中力量中等的天干,辅助影响</p>
                  <p>• 余气: 地支中力量最弱的天干,轻微影响</p>
                  <p className="mt-2 text-purple-800">
                    藏干决定了地支的实际五行力量分布,对日主强弱判断至关重要。
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 月令旺相休囚死分析 */}
        <TabsContent value="monthly" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                月令旺相休囚死
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 当前季节 */}
                <div className="p-4 rounded-lg bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-amber-900 mb-2">
                      {season}季月令
                    </div>
                    <div className="text-sm text-gray-600">
                      月支: {base.pillars.month.earthlyBranch}
                    </div>
                  </div>
                </div>

                {/* 五行状态 */}
                <div className="grid grid-cols-5 gap-3">
                  {[
                    {
                      state: '旺',
                      key: 'wang',
                      desc: '当令最强',
                      color: 'bg-green-100 text-green-800 border-green-300',
                    },
                    {
                      state: '相',
                      key: 'xiang',
                      desc: '次强',
                      color: 'bg-blue-100 text-blue-800 border-blue-300',
                    },
                    {
                      state: '休',
                      key: 'xiu',
                      desc: '平常',
                      color: 'bg-gray-100 text-gray-800 border-gray-300',
                    },
                    {
                      state: '囚',
                      key: 'qiu',
                      desc: '较弱',
                      color: 'bg-orange-100 text-orange-800 border-orange-300',
                    },
                    {
                      state: '死',
                      key: 'si',
                      desc: '最弱',
                      color: 'bg-red-100 text-red-800 border-red-300',
                    },
                  ].map(({ state, key, desc, color }) => (
                    <div key={state} className="text-center">
                      <div className={`p-3 rounded-lg border-2 ${color}`}>
                        <div className="font-bold text-lg mb-1">{state}</div>
                        <div className="text-2xl mb-2">
                          {
                            elementIcons[
                              seasonalState[key as keyof typeof seasonalState]
                            ]
                          }
                        </div>
                        <div className="text-xs font-medium">
                          {seasonalState[key as keyof typeof seasonalState]}
                        </div>
                        <div className="text-xs text-gray-600 mt-1">{desc}</div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 月令影响说明 */}
                <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-200">
                  <h4 className="font-medium text-blue-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    月令对命局的影响
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>• 月令占命局力量的50%以上,是判断日主强弱的关键</p>
                    <p>• 旺相的五行得月令之助,力量倍增</p>
                    <p>• 休囚死的五行失月令之力,需其他支撑</p>
                    <p className="mt-2 text-blue-800">
                      您的日主{base.dayMaster.chinese}在{season}季
                      {seasonalState.wang ===
                      elementNames[base.dayMaster.element]
                        ? '得令而旺'
                        : seasonalState.xiang ===
                            elementNames[base.dayMaster.element]
                          ? '得生而相'
                          : seasonalState.xiu ===
                              elementNames[base.dayMaster.element]
                            ? '泄气为休'
                            : seasonalState.qiu ===
                                elementNames[base.dayMaster.element]
                              ? '受克为囚'
                              : '克令为死'}
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 五行生克关系 */}
        <TabsContent value="relations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                五行生克关系
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {/* 相生关系 */}
                <div>
                  <h4 className="font-medium text-green-800 mb-3 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" />
                    五行相生(生助关系)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                    {['wood', 'fire', 'earth', 'metal', 'water'].map(
                      (element) => {
                        const generates =
                          elementRelations.generates[
                            element as keyof typeof elementRelations.generates
                          ];
                        return (
                          <div
                            key={element}
                            className="p-3 rounded-lg bg-green-50 border border-green-200"
                          >
                            <div className="text-center space-y-1">
                              <div className="text-2xl">
                                {elementIcons[elementNames[element]]}
                              </div>
                              <div className="text-sm font-medium">
                                {elementNames[element]}
                              </div>
                              <ArrowDown className="w-4 h-4 mx-auto text-green-600" />
                              <div className="text-xs text-gray-600">生</div>
                              <div className="text-2xl">
                                {elementIcons[elementNames[generates]]}
                              </div>
                              <div className="text-sm font-medium">
                                {elementNames[generates]}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    木生火 → 火生土 → 土生金 → 金生水 → 水生木
                  </p>
                </div>

                {/* 相克关系 */}
                <div>
                  <h4 className="font-medium text-red-800 mb-3 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4" />
                    五行相克(克制关系)
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-2">
                    {['wood', 'fire', 'earth', 'metal', 'water'].map(
                      (element) => {
                        const controls =
                          elementRelations.controls[
                            element as keyof typeof elementRelations.controls
                          ];
                        return (
                          <div
                            key={element}
                            className="p-3 rounded-lg bg-red-50 border border-red-200"
                          >
                            <div className="text-center space-y-1">
                              <div className="text-2xl">
                                {elementIcons[elementNames[element]]}
                              </div>
                              <div className="text-sm font-medium">
                                {elementNames[element]}
                              </div>
                              <Zap className="w-4 h-4 mx-auto text-red-600" />
                              <div className="text-xs text-gray-600">克</div>
                              <div className="text-2xl">
                                {elementIcons[elementNames[controls]]}
                              </div>
                              <div className="text-sm font-medium">
                                {elementNames[controls]}
                              </div>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mt-3">
                    木克土 → 土克水 → 水克火 → 火克金 → 金克木
                  </p>
                </div>

                {/* 生克应用 */}
                <div className="p-4 rounded-lg bg-indigo-50 border-2 border-indigo-200">
                  <h4 className="font-medium text-indigo-900 mb-2 flex items-center gap-2">
                    <Info className="w-4 h-4" />
                    生克在命理中的应用
                  </h4>
                  <div className="text-sm text-gray-700 space-y-1">
                    <p>
                      • <strong>生我者</strong>为印星,给予支持和庇护
                    </p>
                    <p>
                      • <strong>我生者</strong>为食伤,代表才华和输出
                    </p>
                    <p>
                      • <strong>克我者</strong>为官杀,带来压力和规范
                    </p>
                    <p>
                      • <strong>我克者</strong>为财星,表示财富和管理
                    </p>
                    <p>
                      • <strong>同我者</strong>为比劫,象征竞争和助力
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
