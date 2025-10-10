'use client';

import { Alert } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  type EnhancedBaziResult,
  type EnhancedBirthData,
  computeBaziSmart,
  createBaziCalculator,
} from '@/lib/bazi';
import {
  type PatternAnalysis,
  analyzePattern,
} from '@/lib/bazi/pattern-analysis';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  Info,
  MapPin,
  Star,
  Target,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import { EnhancedDayunAnalysis } from './enhanced-dayun-analysis';

interface BaziAnalysisResultProps {
  birthData: {
    datetime: string;
    gender: 'male' | 'female';
    timezone?: string;
    isTimeKnown?: boolean;
  };
  onAnalysisComplete?: (result: EnhancedBaziResult | null) => void;
}

export function BaziAnalysisResult({
  birthData,
  onAnalysisComplete,
}: BaziAnalysisResultProps) {
  const [result, setResult] = useState<EnhancedBaziResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculator, setCalculator] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  const analyzeBazi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Prepare enhanced birth data
      const enhancedBirthData: EnhancedBirthData = {
        ...birthData,
        timezone: birthData.timezone || 'Asia/Shanghai',
        isTimeKnown: birthData.isTimeKnown ?? true,
        preferredLocale: 'zh-CN',
      };

      // Execute intelligent Bazi calculation
      const analysisResult = await computeBaziSmart(enhancedBirthData);

      if (analysisResult) {
        setResult(analysisResult);

        // Create calculator instance for subsequent analysis
        const calc = createBaziCalculator(enhancedBirthData);
        setCalculator(calc);
      }

      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Bazi analysis failed');
    } finally {
      setLoading(false);
    }
  }, [
    birthData.datetime,
    birthData.gender,
    birthData.timezone,
    birthData.isTimeKnown,
    onAnalysisComplete,
  ]);

  useEffect(() => {
    analyzeBazi();
  }, [analyzeBazi]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <div className="text-center space-y-4">
          <LoadingSpinner className="w-8 h-8 mx-auto" />
          <p className="text-gray-600">正在进行深度八字分析...</p>
          <p className="text-sm text-gray-500">这可能需要几秒钟时间</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert className="border-red-200 bg-red-50">
        <AlertCircle className="h-4 w-4 text-red-600" />
        <div>
          <h3 className="font-medium text-red-800">分析失败</h3>
          <p className="text-sm text-red-700 mt-1">{error}</p>
          <Button
            onClick={analyzeBazi}
            variant="outline"
            size="sm"
            className="mt-3"
          >
            重新分析
          </Button>
        </div>
      </Alert>
    );
  }

  if (!result) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <Info className="h-4 w-4 text-yellow-600" />
        <div>
          <h3 className="font-medium text-yellow-800">无法获取分析结果</h3>
          <p className="text-sm text-yellow-700 mt-1">请检查输入信息是否完整</p>
        </div>
      </Alert>
    );
  }

  const tabs = [
    { id: 'overview', label: '总览', labelEn: 'Overview', icon: BarChart3 },
    { id: 'pillars', label: '四柱', labelEn: 'Four Pillars', icon: Calendar },
    { id: 'patterns', label: '格局', labelEn: 'Patterns', icon: Zap },
    { id: 'elements', label: '五行', labelEn: 'Five Elements', icon: Activity },
    { id: 'gods', label: '神煞', labelEn: 'Gods & Evils', icon: Star },
    { id: 'luck', label: '大运', labelEn: 'Luck Cycles', icon: TrendingUp },
    { id: 'daily', label: '今日运势', labelEn: 'Daily Fortune', icon: Clock },
    { id: 'insights', label: '洞察', labelEn: 'Insights', icon: Target },
  ];

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* 标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold text-gray-900">
          深度八字命理分析 / Deep Bazi Analysis
        </h2>
        <p className="text-gray-600">
          基于专业算法的个性化命理洞察 / Personalized insights based on
          professional algorithms
        </p>

        {/* 显示出生信息 */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">姓名 / Name:</span>
              <span className="ml-2 text-gray-900">
                {(birthData as any).displayName || '未知'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">
                性别 / Gender:
              </span>
              <span className="ml-2 text-gray-900">
                {birthData.gender === 'male' ? '男 / Male' : '女 / Female'}
              </span>
            </div>
            <div>
              <span className="font-semibold text-gray-700">
                出生时间 / Birth Time:
              </span>
              <span className="ml-2 text-gray-900">
                {(birthData as any).birthTime || '未知'}
              </span>
            </div>
          </div>
          <div className="mt-2 text-sm">
            <span className="font-semibold text-gray-700">
              公历 / Gregorian:
            </span>
            <span className="ml-2 text-gray-900">
              {(birthData as any).birthDate || '未知'}
            </span>
            <span className="ml-4 font-semibold text-gray-700">
              农历 / Lunar:
            </span>
            <span className="ml-2 text-gray-900">
              待计算 / To be calculated
            </span>
          </div>
        </div>
      </div>

      {/* 标签页导航 */}
      <div className="flex flex-wrap gap-2 p-1 bg-gray-100 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <div className="text-left">
                <div>{tab.label}</div>
                <div className="text-xs text-gray-500">{tab.labelEn}</div>
              </div>
            </button>
          );
        })}
      </div>

      {/* 内容区域 */}
      <div className="space-y-6">
        {activeTab === 'overview' && <OverviewTab result={result} />}
        {activeTab === 'pillars' && (
          <PillarsTab result={result} calculator={calculator} />
        )}
        {activeTab === 'patterns' && (
          <PatternAnalysisTab result={result} calculator={calculator} />
        )}
        {activeTab === 'elements' && <ElementsTab result={result} />}
        {activeTab === 'gods' && (
          <GodsAndEvilsTab result={result} calculator={calculator} />
        )}
        {activeTab === 'luck' && <LuckPillarsTab calculator={calculator} />}
        {activeTab === 'daily' && <DailyFortuneTab calculator={calculator} />}
        {activeTab === 'insights' && <InsightsTab result={result} />}
      </div>
    </div>
  );
}

// 总览标签页
function OverviewTab({ result }: { result: EnhancedBaziResult }) {
  const dayMasterStrength = result.dayMasterStrength;
  const favorableElements = result.favorableElements;
  const fiveElements: Record<string, number> =
    (result as any).fiveElements || (result as any).elements || {};

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* 日主强度卡片 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-2 rounded-full ${
              dayMasterStrength?.strength === 'strong'
                ? 'bg-green-100'
                : dayMasterStrength?.strength === 'weak'
                  ? 'bg-red-100'
                  : 'bg-yellow-100'
            }`}
          >
            <Zap
              className={`w-5 h-5 ${
                dayMasterStrength?.strength === 'strong'
                  ? 'text-green-600'
                  : dayMasterStrength?.strength === 'weak'
                    ? 'text-red-600'
                    : 'text-yellow-600'
              }`}
            />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">日主强度</h3>
            <p className="text-sm text-gray-600">命局整体强度</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">强度等级</span>
            <span
              className={`font-medium ${
                dayMasterStrength?.strength === 'strong'
                  ? 'text-green-600'
                  : dayMasterStrength?.strength === 'weak'
                    ? 'text-red-600'
                    : 'text-yellow-600'
              }`}
            >
              {dayMasterStrength?.strength === 'strong'
                ? '强'
                : dayMasterStrength?.strength === 'weak'
                  ? '弱'
                  : '平衡'}
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">强度分数</span>
            <span className="font-medium">
              {dayMasterStrength?.score || 0}/100
            </span>
          </div>
        </div>
      </Card>

      {/* 有利元素卡片 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-100">
            <Heart className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">有利五行</h3>
            <p className="text-sm text-gray-600">增强运势的元素</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {favorableElements?.primary?.map((element, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
              >
                {element}
              </span>
            ))}
          </div>
          {favorableElements?.explanation && (
            <p className="text-sm text-gray-600 mt-2">
              {favorableElements.explanation}
            </p>
          )}
        </div>
      </Card>

      {/* 不利元素卡片 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-red-100">
            <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">不利五行</h3>
            <p className="text-sm text-gray-600">需要避免的元素</p>
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-1">
            {favorableElements?.unfavorable?.map((element, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full"
              >
                {element}
              </span>
            ))}
          </div>
        </div>
      </Card>

      {/* 五行分布图 */}
      <Card className="p-6 md:col-span-2 lg:col-span-3">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-purple-100">
            <BarChart3 className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">五行分布</h3>
            <p className="text-sm text-gray-600">各五行元素的强度对比</p>
          </div>
        </div>
        <div className="grid grid-cols-5 gap-4">
          {Object.entries(fiveElements).map(([element, value]) => (
            <div key={element} className="text-center">
              <div className="text-lg font-medium text-gray-900 capitalize">
                {element}
              </div>
              <div className="text-2xl font-bold text-blue-600">{value}</div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div
                  className="bg-blue-600 h-2 rounded-full"
                  style={{
                    width: `${Math.min((Number(value) / 50) * 100, 100)}%`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// 四柱标签页
function PillarsTab({
  result,
  calculator,
}: { result: EnhancedBaziResult; calculator: any }) {
  const pillars = [
    { key: 'year', label: '年柱', labelEn: 'Year Pillar', icon: Calendar },
    { key: 'month', label: '月柱', labelEn: 'Month Pillar', icon: Calendar },
    { key: 'day', label: '日柱', labelEn: 'Day Pillar', icon: Star },
    { key: 'hour', label: '时柱', labelEn: 'Hour Pillar', icon: Clock },
  ];

  // 天干地支对照表
  const heavenlyStems = {
    甲: 'Jia',
    乙: 'Yi',
    丙: 'Bing',
    丁: 'Ding',
    戊: 'Wu',
    己: 'Ji',
    庚: 'Geng',
    辛: 'Xin',
    壬: 'Ren',
    癸: 'Gui',
  };

  const earthlyBranches = {
    子: 'Zi',
    丑: 'Chou',
    寅: 'Yin',
    卯: 'Mao',
    辰: 'Chen',
    巳: 'Si',
    午: 'Wu',
    未: 'Wei',
    申: 'Shen',
    酉: 'You',
    戌: 'Xu',
    亥: 'Hai',
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          生辰八字 / Birth Chart
        </h3>
        <p className="text-gray-600">
          您的四柱信息及五行属性 / Your Four Pillars and Five Elements
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {pillars.map(({ key, label, labelEn, icon: Icon }) => {
          const raw = (result.pillars as any)?.[key];
          if (!raw) return null;

          // 兼容更多来源字段
          let stem: any = (raw as any).stem || (raw as any).heavenlyStem || '';
          let branch: any =
            (raw as any).branch || (raw as any).earthlyBranch || '';
          const chinese =
            (raw as any).chinese ?? (raw as any).ganZhi ?? (raw as any).text;
          if ((!stem || !branch) && chinese) {
            if (typeof chinese === 'string' && chinese.length >= 2) {
              stem = stem || chinese[0];
              branch = branch || chinese[1];
            } else if (Array.isArray(chinese) && chinese.length >= 2) {
              stem = stem || chinese[0];
              branch = branch || chinese[1];
            }
          }
          if ((!stem || !branch) && (result as any)?.fourPillars?.[key]) {
            const c = String((result as any).fourPillars[key] || '');
            if (c.length >= 2) {
              stem = stem || c[0];
              branch = branch || c[1];
            }
          }

          const hasAny = stem || branch || chinese;
          if (!hasAny) return null;

          const stemEn =
            heavenlyStems[stem as keyof typeof heavenlyStems] || stem;
          const branchEn =
            earthlyBranches[branch as keyof typeof earthlyBranches] || branch;

          return (
            <Card key={key} className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2 rounded-full bg-blue-100">
                  <Icon className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">{label}</h3>
                  <p className="text-xs text-gray-500">{labelEn}</p>
                  <p className="text-sm text-gray-600">
                    {stem || ''}
                    {branch || ''}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">
                    天干 / Heavenly Stem：
                  </span>
                  <span className="font-medium text-gray-900">
                    {stem || '—'}
                  </span>
                  <span className="ml-2 text-sm text-blue-600">({stemEn})</span>
                </div>
                <div>
                  <span className="text-sm text-gray-600">
                    地支 / Earthly Branch：
                  </span>
                  <span className="font-medium text-gray-900">
                    {branch || '—'}
                  </span>
                  <span className="ml-2 text-sm text-blue-600">
                    ({branchEn})
                  </span>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 互动分析 */}
      {result.interactions && result.interactions.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-orange-100">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">四柱互动</h3>
              <p className="text-sm text-gray-600">天干地支之间的关系分析</p>
            </div>
          </div>

          <div className="space-y-3">
            {result.interactions.map((interaction, index) => {
              const typeMap: Record<string, string> = {
                clash: '相冲',
                combination: '合',
                punishment: '刑',
                destruction: '破',
              };
              const impactMap: Record<string, string> = {
                positive: '有利',
                negative: '不利',
                neutral: '中性',
              };
              const strengthMap: Record<string, string> = {
                strong: '强',
                weak: '弱',
              };
              const zhType =
                typeMap[interaction.type as string] || interaction.type;
              const zhImpact =
                impactMap[interaction.impact as string] || interaction.impact;
              const zhStrength =
                strengthMap[interaction.strength as string] ||
                interaction.strength;
              return (
                <div
                  key={index}
                  className={`p-3 rounded-lg border ${
                    interaction.impact === 'positive'
                      ? 'bg-green-50 border-green-200'
                      : interaction.impact === 'negative'
                        ? 'bg-red-50 border-red-200'
                        : 'bg-gray-50 border-gray-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-gray-900">
                      {zhType}{' '}
                      <span className="text-xs text-gray-500">
                        ({interaction.type})
                      </span>
                    </span>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          interaction.strength === 'strong'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {zhStrength}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          interaction.impact === 'positive'
                            ? 'bg-green-100 text-green-800'
                            : interaction.impact === 'negative'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {zhImpact}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2">
                    {interaction.description}
                  </p>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}

// 五行标签页
function ElementsTab({ result }: { result: EnhancedBaziResult }) {
  const elements = [
    {
      name: 'wood',
      label: '木',
      color: 'green',
      description: '生长、创造、灵活',
    },
    {
      name: 'fire',
      label: '火',
      color: 'red',
      description: '热情、行动、领导',
    },
    {
      name: 'earth',
      label: '土',
      color: 'yellow',
      description: '稳定、包容、务实',
    },
    {
      name: 'metal',
      label: '金',
      color: 'gray',
      description: '坚韧、公正、变革',
    },
    {
      name: 'water',
      label: '水',
      color: 'blue',
      description: '智慧、适应、和谐',
    },
  ];

  const fiveElements: Record<string, number> =
    (result as any).fiveElements || (result as any).elements || {};

  const totalElements = Object.values(fiveElements).reduce(
    (sum, value) => sum + value,
    0
  );
  const maxElement = Object.entries(fiveElements).reduce((max, [key, value]) =>
    value > fiveElements[max[0] as keyof typeof fiveElements]
      ? [key, value]
      : max
  );

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">五行分析</h3>
        <p className="text-gray-600">五行平衡度及个性特征分析</p>
      </div>

      {/* 五行强度图 */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {elements.map(({ name, label, color, description }) => {
          const value = fiveElements[name as keyof typeof fiveElements] || 0;
          const percentage =
            totalElements > 0 ? (value / totalElements) * 100 : 0;

          return (
            <Card key={name} className="p-4">
              <div className="text-center mb-3">
                <div
                  className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center mx-auto mb-2`}
                >
                  <span className={`text-2xl font-bold text-${color}-600`}>
                    {label}
                  </span>
                </div>
                <div className="text-lg font-semibold text-gray-900">
                  {value}
                </div>
                <div className="text-sm text-gray-600">{description}</div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className="text-center text-xs text-gray-500 mt-1">
                {percentage.toFixed(1)}%
              </div>
            </Card>
          );
        })}
      </div>

      {/* 五行平衡分析 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-purple-100">
            <Target className="w-5 h-5 text-purple-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">五行平衡分析</h3>
            <p className="text-sm text-gray-600">基于您的八字五行分布</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">主导五行</h4>
            <p className="text-blue-800">
              您的八字中<strong>{maxElement[0]}</strong>元素最旺盛，
              这意味着您具有{maxElement[0]}相关的性格特征。
            </p>
          </div>

          {result.favorableElements && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  有利五行
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.favorableElements.primary?.map((element, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {element}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-900 mb-2 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  不利五行
                </h4>
                <div className="flex flex-wrap gap-2">
                  {result.favorableElements.unfavorable?.map(
                    (element, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                      >
                        {element}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// 大运标签页 - 使用增强版大运分析组件
function LuckPillarsTab({ calculator }: { calculator: any }) {
  return <EnhancedDayunAnalysis calculator={calculator} />;
}

// 每日运势标签页
function DailyFortuneTab({ calculator }: { calculator: any }) {
  const [dailyFortune, setDailyFortune] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (calculator) {
      loadDailyFortune();
    }
  }, [calculator]);

  const loadDailyFortune = async () => {
    try {
      setLoading(true);
      const today = new Date();
      const fortune = await calculator.getDailyAnalysis(today);
      setDailyFortune(fortune);
    } catch (error) {
      console.error('加载每日运势失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner className="w-6 h-6" />
        <span className="ml-2 text-gray-600">分析今日运势...</span>
      </div>
    );
  }

  if (!dailyFortune) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <Info className="h-4 w-4 text-yellow-600" />
        <div>
          <h3 className="font-medium text-yellow-800">无法获取今日运势</h3>
          <p className="text-sm text-yellow-700 mt-1">请稍后重试</p>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">今日运势</h3>
        <p className="text-gray-600">基于您的八字分析今日运势</p>
      </div>

      {/* 运势评分 */}
      <Card className="p-6 text-center">
        <div className="mb-4">
          <div
            className={`text-6xl font-bold mb-2 ${
              dailyFortune.overallRating >= 8
                ? 'text-green-600'
                : dailyFortune.overallRating >= 6
                  ? 'text-yellow-600'
                  : 'text-red-600'
            }`}
          >
            {dailyFortune.overallRating}
          </div>
          <div className="text-xl text-gray-600">/10</div>
        </div>

        <div className="text-lg font-medium text-gray-900 mb-2">
          {dailyFortune.overallRating >= 8
            ? '运势极佳'
            : dailyFortune.overallRating >= 6
              ? '运势良好'
              : dailyFortune.overallRating >= 4
                ? '运势一般'
                : '运势较弱'}
        </div>

        <p className="text-gray-600">{dailyFortune.recommendation}</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 吉利活动 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-green-100">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">吉利活动</h3>
              <p className="text-sm text-gray-600">适合今日进行的活动</p>
            </div>
          </div>

          <div className="space-y-2">
            {dailyFortune.luckyActivities?.map(
              (activity: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-green-50 rounded"
                >
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="text-sm text-green-800">{activity}</span>
                </div>
              )
            )}
          </div>
        </Card>

        {/* 不利活动 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">不利活动</h3>
              <p className="text-sm text-gray-600">今日应避免的活动</p>
            </div>
          </div>

          <div className="space-y-2">
            {dailyFortune.unluckyActivities?.map(
              (activity: string, index: number) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-2 bg-red-50 rounded"
                >
                  <AlertCircle className="w-4 h-4 text-red-600 flex-shrink-0" />
                  <span className="text-sm text-red-800">{activity}</span>
                </div>
              )
            )}
          </div>
        </Card>

        {/* 吉利方向 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-blue-100">
              <MapPin className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">吉利方向</h3>
              <p className="text-sm text-gray-600">今日适合的方位</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            {dailyFortune.luckyDirections?.map(
              (direction: string, index: number) => (
                <span
                  key={index}
                  className="px-3 py-2 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                >
                  {direction}
                </span>
              )
            )}
          </div>
        </Card>

        {/* 今日建议 */}
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-purple-100">
              <Target className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">今日建议</h3>
              <p className="text-sm text-gray-600">基于八字的个性化指导</p>
            </div>
          </div>

          <div className="space-y-2">
            {dailyFortune.recommendations?.map(
              (recommendation: string, index: number) => (
                <div
                  key={index}
                  className="flex items-start gap-2 p-2 bg-purple-50 rounded"
                >
                  <Info className="w-4 h-4 text-purple-600 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-purple-800">
                    {recommendation}
                  </span>
                </div>
              )
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}

// 洞察标签页
function InsightsTab({ result }: { result: EnhancedBaziResult }) {
  const insights = generateInsights(result);

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">命理洞察</h3>
        <p className="text-gray-600">基于您的八字特征的专业建议</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {insights.map((insight, index) => (
          <Card key={index} className="p-6">
            <div className={'flex items-center gap-3 mb-4'}>
              <div
                className={`p-2 rounded-full ${
                  insight.type === 'strength'
                    ? 'bg-green-100'
                    : insight.type === 'caution'
                      ? 'bg-yellow-100'
                      : 'bg-blue-100'
                }`}
              >
                {insight.type === 'strength' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : insight.type === 'caution' ? (
                  <AlertCircle className="w-5 h-5 text-yellow-600" />
                ) : (
                  <Target className="w-5 h-5 text-blue-600" />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                <p className="text-sm text-gray-600">{insight.category}</p>
              </div>
            </div>

            <p className="text-gray-700 mb-3">{insight.description}</p>

            {insight.suggestions && insight.suggestions.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900 text-sm">建议：</h4>
                <ul className="space-y-1">
                  {insight.suggestions.map((suggestion, idx) => (
                    <li
                      key={idx}
                      className="flex items-start gap-2 text-sm text-gray-600"
                    >
                      <span className="text-blue-500 mt-1">•</span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// 生成洞察
function generateInsights(result: EnhancedBaziResult) {
  const insights = [];

  // 日主强度洞察
  if (result.dayMasterStrength) {
    const strength = result.dayMasterStrength;
    if (strength.strength === 'strong') {
      insights.push({
        type: 'strength',
        title: '日主强旺',
        category: '命局优势',
        description: '您的命局日主较为强旺，具有较强的自我主宰能力和行动力。',
        suggestions: strength.recommendations,
      });
    } else if (strength.strength === 'weak') {
      insights.push({
        type: 'caution',
        title: '日主偏弱',
        category: '命局特点',
        description: '您的命局日主相对较弱，需要更多外力支持和资源辅助。',
        suggestions: strength.recommendations,
      });
    }
  }

  // 五行平衡洞察（兼容 elements/fiveElements）
  const elements: Record<string, number> =
    (result as any).fiveElements || (result as any).elements || {};
  const entries = Object.entries(elements);
  if (entries.length > 0) {
    const maxElement = entries.reduce((max, [key, value]) =>
      value > elements[max[0] as keyof typeof elements] ? [key, value] : max
    );

    insights.push({
      type: 'insight',
      title: `${maxElement[0]}元素主导`,
      category: '五行特征',
      description: `您的八字中${maxElement[0]}元素最为旺盛，这反映了您性格中的某些特质。`,
      suggestions: [
        `加强${maxElement[0]}相关的活动和环境`,
        '注意与其他五行的平衡',
        `利用${maxElement[0]}元素的优势`,
      ],
    });
  }

  // 互动洞察
  if (result.interactions && result.interactions.length > 0) {
    const positiveInteractions = result.interactions.filter(
      (i) => i.impact === 'positive'
    ).length;
    const negativeInteractions = result.interactions.filter(
      (i) => i.impact === 'negative'
    ).length;

    if (positiveInteractions > negativeInteractions) {
      insights.push({
        type: 'strength',
        title: '互动和谐',
        category: '八字关系',
        description: '您的八字中正向互动较多，整体运势较为稳定。',
        suggestions: [
          '保持现有的生活方式',
          '注重人际关系的维护',
          '把握有利时机',
        ],
      });
    } else {
      insights.push({
        type: 'caution',
        title: '互动复杂',
        category: '八字关系',
        description: '您的八字中存在较多冲突，需要注意化解不利因素。',
        suggestions: [
          '谨慎处理重要事务',
          '寻求专业咨询建议',
          '注意人身和财产安全',
        ],
      });
    }
  }

  return insights;
}

// 格局分析标签页
function PatternAnalysisTab({
  result,
  calculator,
}: { result: EnhancedBaziResult; calculator: any }) {
  const [patternAnalysis, setPatternAnalysis] =
    useState<PatternAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (calculator && result.pillars) {
      try {
        setLoading(true);
        const analysis = analyzePattern(result.pillars);
        setPatternAnalysis(analysis);
      } catch (error) {
        console.error('格局分析失败:', error);
      } finally {
        setLoading(false);
      }
    }
  }, [calculator, result.pillars]);

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner className="w-6 h-6" />
        <span className="ml-2 text-gray-600">分析格局中...</span>
      </div>
    );
  }

  if (!patternAnalysis) {
    return (
      <Alert className="border-yellow-200 bg-yellow-50">
        <Info className="h-4 w-4 text-yellow-600" />
        <div>
          <h3 className="font-medium text-yellow-800">格局分析失败</h3>
          <p className="text-sm text-yellow-700 mt-1">无法获取格局信息</p>
        </div>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">格局分析</h3>
        <p className="text-gray-600">基于传统命理学的格局判断与解析</p>
      </div>

      {/* 主格局信息 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div
            className={`p-3 rounded-full ${
              patternAnalysis.isValid ? 'bg-green-100' : 'bg-red-100'
            }`}
          >
            <Zap
              className={`w-6 h-6 ${
                patternAnalysis.isValid ? 'text-green-600' : 'text-red-600'
              }`}
            />
          </div>
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              {patternAnalysis.primaryPattern}
            </h3>
            <p className="text-sm text-gray-600">
              {patternAnalysis.patternType === 'standard' && '正格八格'}
              {patternAnalysis.patternType === 'follow' && '从格'}
              {patternAnalysis.patternType === 'transform' && '化格'}
              {patternAnalysis.patternType === 'special' && '特殊格局'}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                patternAnalysis.strength === 'strong'
                  ? 'bg-green-100 text-green-800'
                  : patternAnalysis.strength === 'medium'
                    ? 'bg-yellow-100 text-yellow-800'
                    : 'bg-red-100 text-red-800'
              }`}
            >
              {patternAnalysis.strength === 'strong' && '强旺'}
              {patternAnalysis.strength === 'medium' && '中等'}
              {patternAnalysis.strength === 'weak' && '偏弱'}
            </div>
            <div
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                patternAnalysis.purity === 'pure'
                  ? 'bg-blue-100 text-blue-800'
                  : patternAnalysis.purity === 'mixed'
                    ? 'bg-purple-100 text-purple-800'
                    : 'bg-gray-100 text-gray-800'
              }`}
            >
              {patternAnalysis.purity === 'pure' && '纯正'}
              {patternAnalysis.purity === 'mixed' && '杂格'}
              {patternAnalysis.purity === 'broken' && '破格'}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {patternAnalysis.theoretical.confidence}%
            </div>
            <div className="text-sm text-gray-600">置信度</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {patternAnalysis.monthlyOrder.element}
            </div>
            <div className="text-sm text-gray-600">月令五行</div>
          </div>
          <div className="text-center p-3 bg-gray-50 rounded-lg">
            <div className="text-lg font-bold text-gray-900">
              {patternAnalysis.monthlyOrder.god}
            </div>
            <div className="text-sm text-gray-600">月令十神</div>
          </div>
        </div>
      </Card>

      {/* 成格条件 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-green-100">
            <CheckCircle className="w-5 h-5 text-green-600" />
          </div>
          <h3 className="font-semibold text-gray-900">成格条件</h3>
        </div>
        <div className="space-y-2">
          {patternAnalysis.formation.map((condition, index) => (
            <div key={index} className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
              <span className="text-sm text-gray-700">{condition}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 破格因素 */}
      {patternAnalysis.destruction.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-red-100">
              <AlertCircle className="w-5 h-5 text-red-600" />
            </div>
            <h3 className="font-semibold text-gray-900">破格因素</h3>
          </div>
          <div className="space-y-2">
            {patternAnalysis.destruction.map((issue, index) => (
              <div key={index} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <span className="text-sm text-gray-700">{issue}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* 用神分析 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-100">
            <Target className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900">用神分析</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-900 mb-3">喜用神</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm font-medium text-gray-700">
                  主用神：
                </span>
                <div className="flex flex-wrap gap-2 mt-1">
                  {patternAnalysis.usefulGod.primary.map((god, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                    >
                      {god}
                    </span>
                  ))}
                </div>
              </div>
              {patternAnalysis.usefulGod.secondary.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-700">
                    辅用神：
                  </span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {patternAnalysis.usefulGod.secondary.map((god, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                      >
                        {god}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
          <div>
            <h4 className="font-medium text-gray-900 mb-3">忌神</h4>
            <div className="flex flex-wrap gap-2">
              {patternAnalysis.usefulGod.avoidance
                .slice(0, 6)
                .map((god, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full"
                  >
                    {god}
                  </span>
                ))}
            </div>
          </div>
        </div>
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-sm text-blue-800">
            <span className="font-medium">用神说明：</span>
            {patternAnalysis.usefulGod.explanation}
          </p>
        </div>
      </Card>

      {/* 格局特征 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-purple-100">
            <Info className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">格局特征</h3>
        </div>
        <div className="space-y-2">
          {patternAnalysis.characteristics.map((characteristic, index) => (
            <div key={index} className="flex items-start gap-2">
              <span className="text-purple-500 mt-1">•</span>
              <span className="text-sm text-gray-700">{characteristic}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* 季节调候 */}
      {patternAnalysis.seasonalAdjustment?.needed && (
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2 rounded-full bg-orange-100">
              <Activity className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold text-gray-900">季节调候</h3>
          </div>
          <div className="p-3 bg-orange-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2 py-1 bg-orange-100 text-orange-800 text-sm rounded-full font-medium">
                {patternAnalysis.seasonalAdjustment.element}
              </span>
              <span className="text-sm font-medium text-orange-900">
                调候用神
              </span>
            </div>
            <p className="text-sm text-orange-800">
              {patternAnalysis.seasonalAdjustment.reason}
            </p>
          </div>
        </Card>
      )}

      {/* 理论依据 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-gray-100">
            <Info className="w-5 h-5 text-gray-600" />
          </div>
          <h3 className="font-semibold text-gray-900">理论依据</h3>
        </div>
        <div className="space-y-3">
          <div>
            <span className="text-sm font-medium text-gray-700">
              经典出处：
            </span>
            <span className="ml-2 text-sm text-gray-600">
              {patternAnalysis.theoretical.classic}
            </span>
          </div>
          <div>
            <span className="text-sm font-medium text-gray-700">
              判断原理：
            </span>
            <p className="text-sm text-gray-600 mt-1">
              {patternAnalysis.theoretical.principle}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
}

// 神煞分析标签页
function GodsAndEvilsTab({
  result,
  calculator,
}: { result: EnhancedBaziResult; calculator: any }) {
  const [godsAndEvils, setGodsAndEvils] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (calculator) {
      loadGodsAndEvils();
    }
  }, [calculator]);

  const loadGodsAndEvils = async () => {
    try {
      setLoading(true);
      // 这里应该调用calculator的神煞分析方法
      // 暂时使用模拟数据
      const mockGodsAndEvils = [
        {
          name: '天德贵人',
          type: 'noble',
          description: '天德贵人主逢凶化吉，遇难呈祥，一生多得贵人相助。',
          effect: 'positive',
          strength: 'strong',
          location: '年支',
          suggestion: '多行善事，积德行善，自然贵人相助。',
        },
        {
          name: '桃花',
          type: 'romance',
          description: '桃花星主异性缘分，感情运势较佳，但需注意感情纠纷。',
          effect: 'mixed',
          strength: 'medium',
          location: '日支',
          suggestion: '感情上要慎重选择，避免多角关系。',
        },
        {
          name: '驿马',
          type: 'movement',
          description: '驿马星主奔波劳碌，变动较多，利于远行和变迁。',
          effect: 'neutral',
          strength: 'medium',
          location: '时支',
          suggestion: '把握机会，勇于变化，但要稳中求进。',
        },
        {
          name: '华盖',
          type: 'wisdom',
          description: '华盖星主聪明智慧，具有艺术天赋，但略显孤傲。',
          effect: 'positive',
          strength: 'strong',
          location: '月支',
          suggestion: '发挥才华，投身艺术或学术领域。',
        },
        {
          name: '劫煞',
          type: 'caution',
          description: '劫煞主意外损失，需要防范盗贼和意外伤害。',
          effect: 'negative',
          strength: 'weak',
          location: '年支',
          suggestion: '注意安全防护，避免涉险，谨慎理财。',
        },
      ];
      setGodsAndEvils(mockGodsAndEvils);
    } catch (error) {
      console.error('加载神煞数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-12">
        <LoadingSpinner className="w-6 h-6" />
        <span className="ml-2 text-gray-600">分析神煞中...</span>
      </div>
    );
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'noble':
        return Star;
      case 'romance':
        return Heart;
      case 'movement':
        return Activity;
      case 'wisdom':
        return Target;
      case 'caution':
        return AlertCircle;
      default:
        return Info;
    }
  };

  const getTypeColor = (effect: string) => {
    switch (effect) {
      case 'positive':
        return 'green';
      case 'negative':
        return 'red';
      case 'mixed':
        return 'yellow';
      default:
        return 'blue';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">神煞分析</h3>
        <p className="text-gray-600">八字中的吉凶神煞及其影响分析</p>
      </div>

      {/* 神煞总览 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center bg-green-50 border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {godsAndEvils.filter((g) => g.effect === 'positive').length}
          </div>
          <div className="text-sm text-green-700">吉神</div>
        </Card>
        <Card className="p-4 text-center bg-red-50 border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {godsAndEvils.filter((g) => g.effect === 'negative').length}
          </div>
          <div className="text-sm text-red-700">凶煞</div>
        </Card>
        <Card className="p-4 text-center bg-yellow-50 border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">
            {godsAndEvils.filter((g) => g.effect === 'mixed').length}
          </div>
          <div className="text-sm text-yellow-700">半吉半凶</div>
        </Card>
        <Card className="p-4 text-center bg-blue-50 border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {godsAndEvils.length}
          </div>
          <div className="text-sm text-blue-700">神煞总数</div>
        </Card>
      </div>

      {/* 神煞详情 */}
      <div className="space-y-4">
        {godsAndEvils.map((god, index) => {
          const Icon = getTypeIcon(god.type);
          const color = getTypeColor(god.effect);

          return (
            <Card key={index} className={`p-6 border-l-4 border-${color}-300`}>
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-full bg-${color}-100`}>
                    <Icon className={`w-5 h-5 text-${color}-600`} />
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">
                      {god.name}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span
                        className={`px-2 py-1 bg-${color}-100 text-${color}-800 text-xs rounded-full`}
                      >
                        {god.effect === 'positive'
                          ? '吉神'
                          : god.effect === 'negative'
                            ? '凶煞'
                            : god.effect === 'mixed'
                              ? '半吉半凶'
                              : '中性'}
                      </span>
                      <span className="text-sm text-gray-600">
                        位于{god.location}
                      </span>
                      <span
                        className={`text-xs px-2 py-1 rounded ${
                          god.strength === 'strong'
                            ? 'bg-gray-200 text-gray-800'
                            : 'bg-gray-100 text-gray-600'
                        }`}
                      >
                        {god.strength === 'strong' ? '力量强' : '力量弱'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <h5 className="text-sm font-medium text-gray-900 mb-1">
                    含义解释：
                  </h5>
                  <p className="text-sm text-gray-700">{god.description}</p>
                </div>

                <div className={`p-3 bg-${color}-50 rounded-lg`}>
                  <h5 className={`text-sm font-medium text-${color}-900 mb-1`}>
                    建议：
                  </h5>
                  <p className={`text-sm text-${color}-800`}>
                    {god.suggestion}
                  </p>
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      {/* 神煞组合效应 */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-purple-100">
            <Activity className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900">组合效应分析</h3>
        </div>

        <div className="space-y-3">
          <div className="p-3 bg-blue-50 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">整体评价</h4>
            <p className="text-sm text-blue-800">
              您的八字中吉神较多，整体神煞配置较为理想。
              {godsAndEvils.filter((g) => g.effect === 'positive').length >
              godsAndEvils.filter((g) => g.effect === 'negative').length
                ? '吉神力量大于凶煞，运势总体向好。'
                : '需要注意化解凶煞的不利影响。'}
            </p>
          </div>

          {godsAndEvils.filter((g) => g.effect === 'positive').length > 0 && (
            <div className="p-3 bg-green-50 rounded-lg">
              <h4 className="font-medium text-green-900 mb-2">吉神助力</h4>
              <p className="text-sm text-green-800">
                天德、贵人等吉神能够为您带来贵人相助，遇难呈祥的效果。
                建议多行善事，培养品德，以增强吉神的力量。
              </p>
            </div>
          )}

          {godsAndEvils.filter((g) => g.effect === 'negative').length > 0 && (
            <div className="p-3 bg-red-50 rounded-lg">
              <h4 className="font-medium text-red-900 mb-2">凶煞化解</h4>
              <p className="text-sm text-red-800">
                命中凶煞需要通过调整环境、改变行为方式等方法来化解。
                建议寻求专业指导，采取相应的化解措施。
              </p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
