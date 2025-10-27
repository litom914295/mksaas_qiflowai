/**
 * 八字分析 - 总览组件
 * 展示关键指标和核心分析结果
 */

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  Activity,
  AlertCircle,
  BarChart3,
  CheckCircle,
  Heart,
  Info,
  Shield,
  Sparkles,
  Star,
  Target,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';

interface BaziOverviewProps {
  data: BaziAnalysisModel;
}

export function BaziOverview({ data }: BaziOverviewProps) {
  const { metrics, useful, patterns } = data;

  // 获取分数对应的颜色
  const getScoreColor = (score: number) => {
    if (score >= 85) return 'text-green-600';
    if (score >= 70) return 'text-blue-600';
    if (score >= 60) return 'text-yellow-600';
    if (score >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  // 获取分数对应的进度条颜色
  const getProgressColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-blue-500';
    if (score >= 60) return 'bg-yellow-500';
    if (score >= 40) return 'bg-orange-500';
    return 'bg-red-500';
  };

  // 获取日主强弱对应的图标
  const getDayMasterIcon = () => {
    switch (metrics.dayMasterStrength.level) {
      case 'strong':
        return <TrendingUp className="w-5 h-5 text-blue-600" />;
      case 'weak':
        return <TrendingDown className="w-5 h-5 text-orange-600" />;
      default:
        return <Activity className="w-5 h-5 text-green-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* 命局总览雷达图 */}
      <Card className="border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Star className="w-6 h-6 text-indigo-600" />
            命局总览雷达图
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative w-full h-96 bg-white rounded-lg p-6">
            <svg
              viewBox="0 0 500 500"
              className="w-full h-full"
              style={{ maxHeight: '384px' }}
            >
              {/* 背景同心圆 */}
              {[20, 40, 60, 80, 100].map((percentage, idx) => (
                <circle
                  key={percentage}
                  cx="250"
                  cy="250"
                  r={(percentage / 100) * 180}
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="1.5"
                  opacity={0.6 - idx * 0.1}
                />
              ))}

              {/* 六条坐标轴线 */}
              {[
                { label: '总评', score: metrics.overall.score, icon: '🎯' },
                { label: '格局', score: patterns.main.score, icon: '🏆' },
                {
                  label: '五行',
                  score: metrics.balance.status === 'balanced' ? 90 : 60,
                  icon: '⚖️',
                },
                {
                  label: '日主',
                  score: metrics.dayMasterStrength.score,
                  icon: '⚡',
                },
                {
                  label: '用神',
                  score: useful.favorableElements.length > 0 ? 85 : 50,
                  icon: '✨',
                },
                { label: '运势', score: patterns.stability, icon: '📊' },
              ].map((_, idx) => {
                const angle = (idx * 60 - 90) * (Math.PI / 180);
                const x2 = 250 + Math.cos(angle) * 180;
                const y2 = 250 + Math.sin(angle) * 180;
                return (
                  <line
                    key={idx}
                    x1="250"
                    y1="250"
                    x2={x2}
                    y2={y2}
                    stroke="#9ca3af"
                    strokeWidth="2"
                  />
                );
              })}

              {/* 数据多边形 */}
              <polygon
                points={[
                  { label: '总评', score: metrics.overall.score },
                  { label: '格局', score: patterns.main.score },
                  {
                    label: '五行',
                    score: metrics.balance.status === 'balanced' ? 90 : 60,
                  },
                  { label: '日主', score: metrics.dayMasterStrength.score },
                  {
                    label: '用神',
                    score: useful.favorableElements.length > 0 ? 85 : 50,
                  },
                  { label: '运势', score: patterns.stability },
                ]
                  .map((item, idx) => {
                    const angle = (idx * 60 - 90) * (Math.PI / 180);
                    const radius = (item.score / 100) * 180;
                    const x = 250 + Math.cos(angle) * radius;
                    const y = 250 + Math.sin(angle) * radius;
                    return `${x},${y}`;
                  })
                  .join(' ')}
                fill="rgba(99, 102, 241, 0.2)"
                stroke="rgb(99, 102, 241)"
                strokeWidth="3"
              />

              {/* 数据点 */}
              {[
                {
                  label: '总评',
                  score: metrics.overall.score,
                  color: '#8b5cf6',
                },
                { label: '格局', score: patterns.main.score, color: '#6366f1' },
                {
                  label: '五行',
                  score: metrics.balance.status === 'balanced' ? 90 : 60,
                  color: '#14b8a6',
                },
                {
                  label: '日主',
                  score: metrics.dayMasterStrength.score,
                  color: '#f59e0b',
                },
                {
                  label: '用神',
                  score: useful.favorableElements.length > 0 ? 85 : 50,
                  color: '#10b981',
                },
                { label: '运势', score: patterns.stability, color: '#ec4899' },
              ].map((item, idx) => {
                const angle = (idx * 60 - 90) * (Math.PI / 180);
                const radius = (item.score / 100) * 180;
                const x = 250 + Math.cos(angle) * radius;
                const y = 250 + Math.sin(angle) * radius;

                return (
                  <g key={`point-${idx}`}>
                    <circle
                      cx={x}
                      cy={y}
                      r="6"
                      fill={item.color}
                      stroke="white"
                      strokeWidth="2.5"
                    />
                  </g>
                );
              })}

              {/* 标签 */}
              {[
                { label: '总评', score: metrics.overall.score, icon: '🎯' },
                { label: '格局', score: patterns.main.score, icon: '🏆' },
                {
                  label: '五行',
                  score: metrics.balance.status === 'balanced' ? 90 : 60,
                  icon: '⚖️',
                },
                {
                  label: '日主',
                  score: metrics.dayMasterStrength.score,
                  icon: '⚡',
                },
                {
                  label: '用神',
                  score: useful.favorableElements.length > 0 ? 85 : 50,
                  icon: '✨',
                },
                { label: '运势', score: patterns.stability, icon: '📊' },
              ].map((item, idx) => {
                const angle = (idx * 60 - 90) * (Math.PI / 180);
                const labelRadius = 210;
                const x = 250 + Math.cos(angle) * labelRadius;
                const y = 250 + Math.sin(angle) * labelRadius;

                return (
                  <g key={`label-${idx}`}>
                    <text x={x} y={y - 10} textAnchor="middle" fontSize="18">
                      {item.icon}
                    </text>
                    <text
                      x={x}
                      y={y + 10}
                      textAnchor="middle"
                      fontSize="14"
                      fontWeight="600"
                      fill="#4b5563"
                    >
                      {item.label}
                    </text>
                    <text
                      x={x}
                      y={y + 26}
                      textAnchor="middle"
                      fontSize="12"
                      fontWeight="500"
                      fill="#6b7280"
                    >
                      {item.score}%
                    </text>
                  </g>
                );
              })}

              {/* 中心标签 */}
              <circle cx="250" cy="250" r="40" fill="white" opacity="0.95" />
              <circle cx="250" cy="250" r="35" fill="#eef2ff" />
              <text
                x="250"
                y="255"
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize="16"
                fontWeight="700"
                fill="#6366f1"
              >
                命局
              </text>
            </svg>
          </div>

          {/* 图例和解读 */}
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-3 md:grid-cols-6 gap-2 text-xs">
              {[
                {
                  label: '总评',
                  color: '#8b5cf6',
                  score: metrics.overall.score,
                },
                { label: '格局', color: '#6366f1', score: patterns.main.score },
                {
                  label: '五行',
                  color: '#14b8a6',
                  score: metrics.balance.status === 'balanced' ? 90 : 60,
                },
                {
                  label: '日主',
                  color: '#f59e0b',
                  score: metrics.dayMasterStrength.score,
                },
                {
                  label: '用神',
                  color: '#10b981',
                  score: useful.favorableElements.length > 0 ? 85 : 50,
                },
                { label: '运势', color: '#ec4899', score: patterns.stability },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-gray-700">
                    {item.label} {item.score}%
                  </span>
                </div>
              ))}
            </div>

            <div className="p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-2 border-indigo-200">
              <p className="text-sm text-gray-800">
                <strong className="text-indigo-900">💡 命局解读：</strong>
                雷达图展示了您六大核心命理指标。面积越大表示命局越好。 当前您的
                <strong className="text-indigo-800">
                  {patterns.main.chinese || patterns.main.name}
                </strong>
                格局，总评{metrics.overall.score}分，
                {metrics.overall.score >= 80 && '命格优越，运势亨通。'}
                {metrics.overall.score >= 60 &&
                  metrics.overall.score < 80 &&
                  '命格良好，有发展潜力。'}
                {metrics.overall.score < 60 && '需要加强调理，把握机遇。'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 顶部核心指标卡片组 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* 整体评分卡片 */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Target className="w-5 h-5 text-purple-600" />
                整体评分
              </CardTitle>
              <Badge
                variant="outline"
                className={getScoreColor(metrics.overall.score)}
              >
                {metrics.overall.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span
                  className={`text-3xl font-bold ${getScoreColor(metrics.overall.score)}`}
                >
                  {metrics.overall.score}
                </span>
                <span className="text-gray-500 text-sm mb-1">/ 100分</span>
              </div>
              <Progress value={metrics.overall.score} className="h-2" />
              <p className="text-sm text-gray-600">
                {metrics.overall.description}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 日主强弱卡片 */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-600" />
                日主强弱
              </CardTitle>
              {getDayMasterIcon()}
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Badge
                  variant={
                    metrics.dayMasterStrength.level === 'balanced'
                      ? 'default'
                      : 'secondary'
                  }
                  className="text-base px-3 py-1"
                >
                  {metrics.dayMasterStrength.level === 'strong' && '身强'}
                  {metrics.dayMasterStrength.level === 'weak' && '身弱'}
                  {metrics.dayMasterStrength.level === 'balanced' && '中和'}
                </Badge>
                <span className="text-sm text-gray-600">
                  强度值: {metrics.dayMasterStrength.score}
                </span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                {metrics.dayMasterStrength.description ||
                  '日主能量处于适中状态'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* 主格局卡片 */}
        <Card className="border-2 hover:shadow-lg transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-indigo-600" />
                命理格局
              </CardTitle>
              <Badge variant="outline">稳定度 {patterns.stability}%</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className="text-base px-3 py-1 bg-indigo-100 text-indigo-800">
                  {patterns.main.chinese || patterns.main.name}
                </Badge>
                {patterns.main.score >= 80 && (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                )}
              </div>
              <p className="text-sm text-gray-600">
                成格度: {patterns.main.score}%
              </p>
              {patterns.secondary.length > 0 && (
                <div className="text-xs text-gray-500">
                  次格局:{' '}
                  {patterns.secondary
                    .map((p) => p.chinese || p.name)
                    .join('、')}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 五行分布图表 */}
      <Card className="border-2">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-teal-600" />
            五行能量分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Object.entries(metrics.elementScores).map(([element, score]) => {
              const elementColors: Record<string, string> = {
                wood: 'bg-green-500',
                fire: 'bg-red-500',
                earth: 'bg-yellow-600',
                metal: 'bg-gray-400',
                water: 'bg-blue-500',
              };
              const elementNames: Record<string, string> = {
                wood: '木',
                fire: '火',
                earth: '土',
                metal: '金',
                water: '水',
              };

              return (
                <div key={element} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{elementNames[element]}</span>
                    <span className="text-gray-600">{score}%</span>
                  </div>
                  <Progress value={score} className="h-3" />
                </div>
              );
            })}

            {/* 平衡状态提示 */}
            <div className="pt-2 border-t">
              <div className="flex items-start gap-2">
                {metrics.balance.status === 'balanced' ? (
                  <>
                    <CheckCircle className="w-4 h-4 text-green-600 mt-0.5" />
                    <span className="text-sm text-green-700">五行较为平衡</span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5" />
                    <div className="text-sm space-y-1">
                      {metrics.balance.excess &&
                        metrics.balance.excess.length > 0 && (
                          <p className="text-orange-700">
                            过旺: {metrics.balance.excess.join('、')}
                          </p>
                        )}
                      {metrics.balance.shortage &&
                        metrics.balance.shortage.length > 0 && (
                          <p className="text-orange-700">
                            不足: {metrics.balance.shortage.join('、')}
                          </p>
                        )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 用神分析 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 有利元素 */}
        <Card className="border-2 border-green-200 bg-green-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span className="text-green-800">有利元素（用神）</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {useful.favorableElements.slice(0, 3).map((elem, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Badge
                    variant="outline"
                    className="bg-green-100 text-green-800 border-green-300 mt-0.5"
                  >
                    {elem.chinese}
                  </Badge>
                  <div className="flex-1">
                    <p className="text-sm text-gray-700">{elem.reason}</p>
                    {elem.suggestions && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {elem.suggestions.colors?.slice(0, 2).map((color) => (
                          <span
                            key={color}
                            className="text-xs px-1.5 py-0.5 bg-white rounded"
                          >
                            {color}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* 不利元素 */}
        <Card className="border-2 border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-orange-600" />
              <span className="text-orange-800">需避免元素（忌神）</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {useful.unfavorableElements.length > 0 ? (
                useful.unfavorableElements.slice(0, 2).map((elem, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <Badge
                      variant="outline"
                      className="bg-orange-100 text-orange-800 border-orange-300 mt-0.5"
                    >
                      {elem.chinese}
                    </Badge>
                    <div className="flex-1">
                      <p className="text-sm text-gray-700">{elem.reason}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-600">暂无明显忌神</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 快速建议 */}
      <Card className="border-2 border-purple-200 bg-purple-50/50">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Info className="w-5 h-5 text-purple-600" />
            <span className="text-purple-800">快速建议</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {useful.remedies.slice(0, 2).map((remedy, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {remedy.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {remedy.description}
                  </p>
                </div>
              </div>
            ))}
            {useful.avoidance.slice(0, 2).map((avoid, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">
                    {avoid.title}
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {avoid.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
