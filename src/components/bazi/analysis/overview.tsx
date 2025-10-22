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
  Info,
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
              <Badge variant="outline" className={getScoreColor(metrics.overall.score)}>
                {metrics.overall.level}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-end gap-2">
                <span className={`text-3xl font-bold ${getScoreColor(metrics.overall.score)}`}>
                  {metrics.overall.score}
                </span>
                <span className="text-gray-500 text-sm mb-1">/ 100分</span>
              </div>
              <Progress 
                value={metrics.overall.score} 
                className="h-2"
              />
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
                  variant={metrics.dayMasterStrength.level === 'balanced' ? 'default' : 'secondary'}
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
                {metrics.dayMasterStrength.description || '日主能量处于适中状态'}
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
              <Badge variant="outline">
                稳定度 {patterns.stability}%
              </Badge>
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
                  次格局: {patterns.secondary.map(p => p.chinese || p.name).join('、')}
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
                  <Progress
                    value={score}
                    className="h-3"
                  />
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
                      {metrics.balance.excess && metrics.balance.excess.length > 0 && (
                        <p className="text-orange-700">
                          过旺: {metrics.balance.excess.join('、')}
                        </p>
                      )}
                      {metrics.balance.shortage && metrics.balance.shortage.length > 0 && (
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
                        {elem.suggestions.colors?.slice(0, 2).map(color => (
                          <span key={color} className="text-xs px-1.5 py-0.5 bg-white rounded">
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
                  <p className="text-sm font-medium text-gray-800">{remedy.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{remedy.description}</p>
                </div>
              </div>
            ))}
            {useful.avoidance.slice(0, 2).map((avoid, idx) => (
              <div key={idx} className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-medium text-gray-800">{avoid.title}</p>
                  <p className="text-xs text-gray-600 mt-0.5">{avoid.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}