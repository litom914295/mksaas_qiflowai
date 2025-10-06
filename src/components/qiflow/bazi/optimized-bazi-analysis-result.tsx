'use client';

import { ReportExportShare } from '@/components/reports/report-export-share';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import {
  computeBaziSmart,
  createBaziCalculator,
  type EnhancedBaziResult,
  type EnhancedBirthData
} from '@/lib/qiflow/bazi';
import { analyzeLuckPillars, type LuckPillarAnalysis } from '@/lib/qiflow/bazi/luck-pillars';
import type { BaziReportData } from '@/lib/qiflow/reports/types';
import {
  Activity,
  AlertCircle,
  BarChart3,
  Calendar,
  CheckCircle,
  Clock,
  Heart,
  Info,
  Lightbulb,
  Star,
  Target,
  TrendingUp,
  Zap
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

interface OptimizedBaziAnalysisResultProps {
  birthData: {
    datetime: string;
    gender: 'male' | 'female';
    timezone?: string;
    isTimeKnown?: boolean;
  };
  onAnalysisComplete?: (result: EnhancedBaziResult | null) => void;
}

// 标签页配置
const tabs = [
  { id: 'overview', label: '总览', labelEn: 'Overview', icon: BarChart3 },
  { id: 'pillars', label: '四柱', labelEn: 'Four Pillars', icon: Calendar },
  { id: 'patterns', label: '格局', labelEn: 'Patterns', icon: Target },
  { id: 'elements', label: '五行', labelEn: 'Five Elements', icon: Activity },
  { id: 'gods', label: '神煞', labelEn: 'Gods & Evils', icon: Star },
  { id: 'luck', label: '大运', labelEn: 'Luck Pillars', icon: TrendingUp },
  { id: 'daily', label: '流年', labelEn: 'Daily Fortune', icon: Clock },
  { id: 'insights', label: '洞察', labelEn: 'Insights', icon: Lightbulb },
];



// 总览标签页
function OverviewTab({ result }: { result: EnhancedBaziResult }) {
  const dayMasterStrength = result.dayMasterStrength;
  const favorableElements = result.favorableElements;
  const fiveElements: Record<string, number> =
    (result as any).fiveElements || (result as any).elements || {};

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6'>
      {/* 日主强度卡片 */}
      <Card className='p-6'>
        <div className='flex items-center gap-3 mb-4'>
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
            <h3 className='font-semibold text-gray-900'>日主强度</h3>
            <p className='text-sm text-gray-600'>命局整体强度</p>
          </div>
        </div>
        <div className='space-y-2'>
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-600'>强度等级</span>
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
          <div className='flex justify-between items-center'>
            <span className='text-sm text-gray-600'>强度分数</span>
            <span className='font-medium'>
              {dayMasterStrength?.score || 0}/100
            </span>
          </div>
        </div>
      </Card>

      {/* 有利元素卡片 */}
      <Card className='p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 rounded-full bg-blue-100'>
            <Heart className='w-5 h-5 text-blue-600' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900'>有利五行</h3>
            <p className='text-sm text-gray-600'>增强运势的元素</p>
          </div>
        </div>
        <div className='space-y-2'>
          <div className='flex flex-wrap gap-1'>
          {favorableElements?.primary?.map((element, index) => (
            <span
              key={index}
                className='px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full'
            >
              {element}
            </span>
          ))}
        </div>
          {favorableElements?.explanation && (
            <p className='text-sm text-gray-600 mt-2'>
              {favorableElements.explanation}
            </p>
          )}
        </div>
      </Card>

      {/* 不利元素卡片 */}
      <Card className='p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 rounded-full bg-red-100'>
            <AlertCircle className='w-5 h-5 text-red-600' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900'>不利五行</h3>
            <p className='text-sm text-gray-600'>需要避免的元素</p>
          </div>
        </div>
        <div className='space-y-2'>
          <div className='flex flex-wrap gap-1'>
            {favorableElements?.unfavorable?.map((element, index) => (
            <span
              key={index}
                className='px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full'
            >
              {element}
            </span>
          ))}
        </div>
        </div>
      </Card>

      {/* 五行分布图 */}
      <Card className='p-6 md:col-span-2 lg:col-span-3'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 rounded-full bg-purple-100'>
            <BarChart3 className='w-5 h-5 text-purple-600' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900'>五行分布</h3>
            <p className='text-sm text-gray-600'>各五行元素的强度对比</p>
          </div>
        </div>
        <div className='grid grid-cols-5 gap-4'>
          {Object.entries(fiveElements).map(([element, value]) => (
            <div key={element} className='text-center'>
              <div className='text-lg font-medium text-gray-900 capitalize'>
                {element}
              </div>
              <div className='text-2xl font-bold text-blue-600'>{value}</div>
              <div className='w-full bg-gray-200 rounded-full h-2 mt-2'>
                <div
                  className='bg-blue-600 h-2 rounded-full'
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
function PillarsTab({ result, calculator }: { result: EnhancedBaziResult; calculator: any }) {
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
    <div className='space-y-6'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold text-gray-900 mb-2'>
          生辰八字 / Birth Chart
        </h3>
        <p className='text-gray-600'>
          您的四柱信息及五行属性 / Your Four Pillars and Five Elements
        </p>
      </div>

      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6'>
        {pillars.map(({ key, label, labelEn, icon: Icon }) => {
          const raw = (result.pillars as any)?.[key];

          // 兼容多种字段：stem/heavenlyStem/chinese[0] 与 branch/earthlyBranch/chinese[1]
          let stem: any = raw?.stem || raw?.heavenlyStem || '';
          let branch: any = raw?.branch || raw?.earthlyBranch || '';

          // chinese 可能是字符串（“甲子”）或数组(["甲","子"])，或对象
          const chinese = (raw as any)?.chinese ?? (raw as any)?.ganZhi ?? (raw as any)?.text;
          if ((!stem || !branch) && chinese) {
            if (typeof chinese === 'string' && chinese.length >= 2) {
              stem = stem || chinese[0];
              branch = branch || chinese[1];
            } else if (Array.isArray(chinese) && chinese.length >= 2) {
              stem = stem || chinese[0];
              branch = branch || chinese[1];
            }
          }

          // 最后兜底：从四柱字符串结果提取（如存在）
          if ((!stem || !branch) && (result as any)?.fourPillars?.[key]) {
            const c = String((result as any).fourPillars[key] || '');
            if (c.length >= 2) {
              stem = stem || c[0];
              branch = branch || c[1];
            }
          }

          const hasAny = stem || branch || raw?.chinese;
          if (!hasAny) {
            return (
              <Card key={key} className='p-6'>
                <div className='flex items-center gap-3 mb-2'>
                  <div className='p-2 rounded-full bg-blue-50'>
                    <Icon className='w-5 h-5 text-blue-400' />
                  </div>
                  <div>
                    <h3 className='font-semibold text-gray-900'>{label}</h3>
                    <p className='text-xs text-gray-500'>{labelEn}</p>
                  </div>
                </div>
                <div className='text-sm text-gray-500'>数据暂缺</div>
              </Card>
            );
          }

          const stemEn =
            heavenlyStems[(stem as keyof typeof heavenlyStems)] || stem || '';
          const branchEn =
            earthlyBranches[(branch as keyof typeof earthlyBranches)] || branch || '';

          return (
            <Card key={key} className='p-6'>
              <div className='flex items-center gap-3 mb-4'>
                <div className='p-2 rounded-full bg-blue-100'>
                  <Icon className='w-5 h-5 text-blue-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>{label}</h3>
                  <p className='text-xs text-gray-500'>{labelEn}</p>
                  <p className='text-sm text-gray-600'>{(stem || '')}{(branch || '')}</p>
                </div>
              </div>

              <div className='space-y-3'>
                <div>
                  <span className='text-sm text-gray-600'>
                    天干 / Heavenly Stem：
                  </span>
                  <span className='font-medium text-gray-900'>
                    {stem || '—'}
                  </span>
                  <span className='ml-2 text-sm text-blue-600'>({stemEn})</span>
                  <span className='ml-2 text-sm text-gray-500'>
                    ({stem || '—'})
                  </span>
                </div>
                <div>
                  <span className='text-sm text-gray-600'>
                    地支 / Earthly Branch：
                  </span>
                  <span className='font-medium text-gray-900'>
                    {branch || '—'}
                  </span>
                  <span className='ml-2 text-sm text-blue-600'>
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
        <Card className='p-6'>
          <div className='flex items-center gap-3 mb-4'>
            <div className='p-2 rounded-full bg-orange-100'>
              <Activity className='w-5 h-5 text-orange-600' />
            </div>
            <div>
              <h3 className='font-semibold text-gray-900'>四柱互动</h3>
              <p className='text-sm text-gray-600'>天干地支之间的关系分析</p>
            </div>
          </div>

          <div className='space-y-3'>
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
              const zhType = typeMap[interaction.type as string] || interaction.type;
              const zhImpact = impactMap[interaction.impact as string] || interaction.impact;
              const zhStrength = strengthMap[interaction.strength as string] || interaction.strength;
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
                <div className='flex items-center justify-between'>
                  <span className='font-medium text-gray-900'>
                    {zhType} <span className='text-xs text-gray-500'>({interaction.type})</span>
                  </span>
                  <div className='flex items-center gap-2'>
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
                <p className='text-sm text-gray-600 mt-2'>
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
    <div className='space-y-6'>
      <div className='text-center'>
        <h3 className='text-2xl font-bold text-gray-900 mb-2'>五行分析</h3>
        <p className='text-gray-600'>五行平衡度及个性特征分析</p>
      </div>

      {/* 五行强度图 */}
      <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 md:gap-4'>
        {elements.map(({ name, label, color, description }) => {
          const value = fiveElements[name as keyof typeof fiveElements] || 0;
          const percentage =
            totalElements > 0 ? (value / totalElements) * 100 : 0;

          return (
            <Card key={name} className='p-4'>
              <div className='text-center mb-3'>
                <div
                  className={`w-12 h-12 rounded-full bg-${color}-100 flex items-center justify-center mx-auto mb-2`}
                >
                  <span className={`text-2xl font-bold text-${color}-600`}>
                    {label}
                  </span>
            </div>
                <div className='text-lg font-semibold text-gray-900'>
                  {value}
                </div>
                <div className='text-sm text-gray-600'>{description}</div>
              </div>
              <div className='w-full bg-gray-200 rounded-full h-2'>
                <div
                  className={`bg-${color}-600 h-2 rounded-full transition-all duration-500`}
                  style={{ width: `${percentage}%` }}
                />
              </div>
              <div className='text-center text-xs text-gray-500 mt-1'>
                {percentage.toFixed(1)}%
              </div>
            </Card>
          );
        })}
      </div>

      {/* 五行平衡分析 */}
      <Card className='p-6'>
        <div className='flex items-center gap-3 mb-4'>
          <div className='p-2 rounded-full bg-purple-100'>
            <Target className='w-5 h-5 text-purple-600' />
          </div>
          <div>
            <h3 className='font-semibold text-gray-900'>五行平衡分析</h3>
            <p className='text-sm text-gray-600'>基于您的八字五行分布</p>
          </div>
        </div>

        <div className='space-y-4'>
          <div className='p-4 bg-blue-50 rounded-lg'>
            <h4 className='font-medium text-blue-900 mb-2'>主导五行</h4>
            <p className='text-blue-800'>
              您的八字中<strong>{maxElement[0]}</strong>元素最旺盛，
              这意味着您具有{maxElement[0]}相关的性格特征。
            </p>
          </div>

          {result.favorableElements && (
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='p-4 bg-green-50 rounded-lg'>
                <h4 className='font-medium text-green-900 mb-2 flex items-center gap-2'>
                  <CheckCircle className='w-4 h-4' />
                  有利五行
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {result.favorableElements.primary?.map((element, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 bg-green-100 text-green-800 text-sm rounded-full'
                    >
                      {element}
                    </span>
              ))}
            </div>
          </div>

              <div className='p-4 bg-red-50 rounded-lg'>
                <h4 className='font-medium text-red-900 mb-2 flex items-center gap-2'>
                  <AlertCircle className='w-4 h-4' />
                  不利五行
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {result.favorableElements.unfavorable?.map((element, index) => (
                    <span
                      key={index}
                      className='px-2 py-1 bg-red-100 text-red-800 text-sm rounded-full'
                    >
                      {element}
                    </span>
        ))}
      </div>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

// 其他标签页的占位符组件
function PatternAnalysisTab({ result, calculator }: { result: EnhancedBaziResult; calculator: any }) {
  return (
    <div className='text-center p-8'>
      <Target className='w-12 h-12 text-gray-400 mx-auto mb-4' />
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>格局分析</h3>
      <p className='text-gray-600'>格局分析功能正在开发中...</p>
    </div>
  );
}

function GodsAndEvilsTab({ result, calculator }: { result: EnhancedBaziResult; calculator: any }) {
  return (
    <div className='text-center p-8'>
      <Star className='w-12 h-12 text-gray-400 mx-auto mb-4' />
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>神煞分析</h3>
      <p className='text-gray-600'>神煞分析功能正在开发中...</p>
    </div>
  );
}

function LuckPillarsTab({ calculator }: { calculator: any }) {
  return (
    <div className='text-center p-8'>
      <TrendingUp className='w-12 h-12 text-gray-400 mx-auto mb-4' />
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>大运分析</h3>
      <p className='text-gray-600'>大运分析功能正在开发中...</p>
    </div>
  );
}

function DailyFortuneTab({ calculator }: { calculator: any }) {
  return (
    <div className='text-center p-8'>
      <Clock className='w-12 h-12 text-gray-400 mx-auto mb-4' />
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>流年分析</h3>
      <p className='text-gray-600'>流年分析功能正在开发中...</p>
    </div>
  );
}

function InsightsTab({ result }: { result: EnhancedBaziResult }) {
  return (
    <div className='text-center p-8'>
      <Lightbulb className='w-12 h-12 text-gray-400 mx-auto mb-4' />
      <h3 className='text-lg font-semibold text-gray-900 mb-2'>深度洞察</h3>
      <p className='text-gray-600'>深度洞察功能正在开发中...</p>
    </div>
  );
}


export function OptimizedBaziAnalysisResult({
  birthData,
  onAnalysisComplete,
}: OptimizedBaziAnalysisResultProps) {
  const t = useTranslations();
  const locale = useLocale();
  const [result, setResult] = useState<EnhancedBaziResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [calculator, setCalculator] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [luckPillarsAnalysis, setLuckPillarsAnalysis] = useState<LuckPillarAnalysis[] | null>(null);
  const [reportData, setReportData] = useState<BaziReportData | null>(null);

  const analyzeBazi = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const enhancedBirthData: EnhancedBirthData = {
        ...birthData,
        timezone: birthData.timezone || 'Asia/Shanghai',
        isTimeKnown: birthData.isTimeKnown ?? true,
        preferredLocale: locale as string,
      };

      const analysisResult = await computeBaziSmart(enhancedBirthData);
      
      if (analysisResult) {
        setResult(analysisResult);
        
        // 创建计算器实例以便后续分析
        const calc = createBaziCalculator(enhancedBirthData);
        setCalculator(calc);

        // 计算大运分析供报告使用
        try {
          const luck = await analyzeLuckPillars(enhancedBirthData as any);
          setLuckPillarsAnalysis(luck);
        } catch (e) {
          console.warn('大运分析失败，报告将不包含大运章节:', e);
          setLuckPillarsAnalysis([]);
        }

        // 生成报告数据结构
        const dt = new Date(enhancedBirthData.datetime);
        const birthDate = isNaN(dt.getTime()) ? '' : dt.toISOString().slice(0, 10);
        const birthTime = isNaN(dt.getTime()) ? '' : dt.toTimeString().slice(0, 5);
        const data: BaziReportData = {
          personalInfo: {
            name: '访客',
            gender: enhancedBirthData.gender,
            birthDate,
            birthTime,
            birthLocation: enhancedBirthData.timezone || 'Asia/Shanghai',
          },
          baziAnalysis: analysisResult,
          luckPillarsAnalysis: [],
          generatedAt: new Date(),
        } as BaziReportData;
        setReportData(data);
      }

      onAnalysisComplete?.(analysisResult);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('errors.calculation_error'));
    } finally {
      setLoading(false);
    }
  }, [birthData.datetime, birthData.gender, birthData.timezone, birthData.isTimeKnown, locale, onAnalysisComplete]);

  useEffect(() => {
    analyzeBazi();
  }, [analyzeBazi]);

  // 当大运分析或初始报告生成后，补充大运内容到报告数据
  useEffect(() => {
    if (reportData && luckPillarsAnalysis) {
      setReportData({
        ...reportData,
        luckPillarsAnalysis,
      });
    }
  }, [luckPillarsAnalysis]);


  if (loading) {
    return (
      <div className="flex items-center justify-center p-16">
        <div className="text-center space-y-4">
          <div className="relative">
            <LoadingSpinner className="w-12 h-12 mx-auto" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full opacity-20 animate-pulse" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-gray-900">{t('bazi.analyzing')}</h3>
            <p className="text-gray-600">{t('bazi.analysis_description')}</p>
            <div className="flex justify-center space-x-2 mt-4">
              <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-xl p-8 text-center">
        <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-red-900 mb-2">{t('errors.calculation_error')}</h3>
        <p className="text-red-700 mb-4">{error}</p>
        <Button
          onClick={analyzeBazi}
          variant="outline"
          className="border-red-300 text-red-700 hover:bg-red-50"
        >
          {t('common.retry')}
        </Button>
      </div>
    );
  }

  if (!result) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-8 text-center">
        <Info className="w-12 h-12 text-yellow-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">{t('errors.calculation_error')}</h3>
        <p className="text-yellow-700">{t('errors.try_again_later')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* 标题区域 */}
      <div className="text-center bg-gradient-to-r from-blue-50 via-purple-50 to-pink-50 rounded-2xl p-8">
        <div className="flex items-center justify-center gap-3 mb-4">
          <Star className="w-8 h-8 text-blue-600" />
          <Heart className="w-8 h-8 text-purple-600" />
          <Lightbulb className="w-8 h-8 text-pink-600" />
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-700 to-pink-600 bg-clip-text text-transparent mb-4">
          {t('bazi.title')}
        </h2>
        <p className="text-gray-600 max-w-2xl mx-auto">
          {t('bazi.description')}
        </p>
      </div>

      {/* 标签页导航 */}
      <div className='flex flex-wrap gap-1 p-1 bg-gray-100 rounded-lg overflow-x-auto'>
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
              }`}
            >
              <Icon className='w-4 h-4 flex-shrink-0' />
              <div className='text-left hidden sm:block'>
                <div>{tab.label}</div>
                <div className='text-xs text-gray-500'>{tab.labelEn}</div>
              </div>
              <div className='text-left sm:hidden'>
                <div className='text-xs'>{tab.label}</div>
              </div>
            </button>
          );
        })}
          </div>

      {/* 内容区域 */}
      <div className='space-y-6 min-h-[400px]'>
        {activeTab === 'overview' && <OverviewTab result={result} />}
        {activeTab === 'pillars' && <PillarsTab result={result} calculator={calculator} />}
        {activeTab === 'patterns' && <PatternAnalysisTab result={result} calculator={calculator} />}
        {activeTab === 'elements' && <ElementsTab result={result} />}
        {activeTab === 'gods' && <GodsAndEvilsTab result={result} calculator={calculator} />}
        {activeTab === 'luck' && <LuckPillarsTab calculator={calculator} />}
        {activeTab === 'daily' && <DailyFortuneTab calculator={calculator} />}
        {activeTab === 'insights' && <InsightsTab result={result} />}
      </div>
      
      {/* 八字命理 - 导出与分享（紧随八字内容区域下方） */}
      {reportData && (
        <div>
          <ReportExportShare reportData={reportData} />
        </div>
      )}

      {/* 悬空风水报告导出（页面最底部） */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-full bg-blue-100">
            <BarChart3 className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">悬空风水报告导出</h3>
            <p className="text-sm text-gray-600">完整的飞星/房间/综合评估导出入口</p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => window.open('/reports', '_blank')}>
            打开报告导出中心
          </Button>
        </div>
      </Card>

      {/* 页脚提醒 */}
      <div className="text-center p-6 bg-gray-50 rounded-xl">
        <p className="text-sm text-gray-600">
          {t('bazi.disclaimer')}
        </p>
      </div>
    </div>
  );
}