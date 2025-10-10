'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { EnhancedBaziResult } from '@/lib/qiflow/bazi';
import {
  Activity,
  Calendar,
  Droplet,
  Flame,
  Mountain,
  Star,
  TrendingUp,
  Wind,
  Zap,
} from 'lucide-react';

interface BaziResultDisplayProps {
  result: EnhancedBaziResult;
  userName?: string;
}

const elementIcons: Record<string, any> = {
  WOOD: Wind,
  FIRE: Flame,
  EARTH: Mountain,
  METAL: Zap,
  WATER: Droplet,
};

const elementColors: Record<string, string> = {
  WOOD: 'text-green-500 bg-green-50',
  FIRE: 'text-red-500 bg-red-50',
  EARTH: 'text-yellow-600 bg-yellow-50',
  METAL: 'text-gray-500 bg-gray-50',
  WATER: 'text-blue-500 bg-blue-50',
};

export function BaziResultDisplay({
  result,
  userName,
}: BaziResultDisplayProps) {
  const { pillars, elements, yongshen, luckPillars, dayMasterStrength } =
    result;

  return (
    <div className="space-y-6">
      {/* 标题 */}
      <div className="text-center">
        <h2 className="text-3xl font-bold text-white mb-2">
          {userName ? `${userName}的` : ''}八字命理分析报告
        </h2>
        <p className="text-slate-300">基于传统命理学的专业分析</p>
      </div>

      {/* 四柱八字 */}
      <Card className="bg-slate-900/80 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            四柱八字
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {Object.entries(pillars).map(([key, pillar]: [string, any]) => {
              const Icon = elementIcons[pillar.element] || Star;
              const colorClass =
                elementColors[pillar.element] || 'text-gray-500';

              return (
                <div
                  key={key}
                  className="text-center p-4 bg-slate-800/50 rounded-lg"
                >
                  <div className="text-sm text-slate-400 mb-2 capitalize">
                    {key === 'year'
                      ? '年柱'
                      : key === 'month'
                        ? '月柱'
                        : key === 'day'
                          ? '日柱'
                          : '时柱'}
                  </div>
                  <div className="text-2xl font-bold text-white mb-2">
                    {pillar.chinese ||
                      `${pillar.heavenlyStem}${pillar.earthlyBranch}`}
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <Icon className={`w-4 h-4 ${colorClass.split(' ')[0]}`} />
                    <span className="text-xs text-slate-400">
                      {pillar.element === 'WOOD'
                        ? '木'
                        : pillar.element === 'FIRE'
                          ? '火'
                          : pillar.element === 'EARTH'
                            ? '土'
                            : pillar.element === 'METAL'
                              ? '金'
                              : '水'}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {pillar.animal}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 五行分析 */}
      <Card className="bg-slate-900/80 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Activity className="w-5 h-5" />
            五行分布
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(elements).map(([element, value]: [string, any]) => {
              const percentage = (value / 100) * 100;
              const elementName =
                element === 'wood'
                  ? '木'
                  : element === 'fire'
                    ? '火'
                    : element === 'earth'
                      ? '土'
                      : element === 'metal'
                        ? '金'
                        : '水';

              return (
                <div key={element} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-300">{elementName}</span>
                    <span className="text-slate-400">{value}%</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        element === 'wood'
                          ? 'bg-green-500'
                          : element === 'fire'
                            ? 'bg-red-500'
                            : element === 'earth'
                              ? 'bg-yellow-500'
                              : element === 'metal'
                                ? 'bg-gray-400'
                                : 'bg-blue-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 日主强弱 */}
      {dayMasterStrength && (
        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Star className="w-5 h-5" />
              日主分析
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-slate-300">日主强弱</span>
                <Badge
                  variant={
                    dayMasterStrength.strength === 'strong'
                      ? 'default'
                      : dayMasterStrength.strength === 'weak'
                        ? 'secondary'
                        : 'outline'
                  }
                  className="text-lg"
                >
                  {dayMasterStrength.strength === 'strong'
                    ? '身强'
                    : dayMasterStrength.strength === 'weak'
                      ? '身弱'
                      : '中和'}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-300">综合评分</span>
                <span
                  className={`text-xl font-bold ${
                    dayMasterStrength.score > 0
                      ? 'text-green-400'
                      : 'text-red-400'
                  }`}
                >
                  {dayMasterStrength.score}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 用神喜忌 */}
      {yongshen && (
        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Zap className="w-5 h-5" />
              用神喜忌
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {yongshen.favorable && yongshen.favorable.length > 0 && (
                <div>
                  <div className="text-sm text-slate-400 mb-2">喜用神</div>
                  <div className="flex flex-wrap gap-2">
                    {yongshen.favorable
                      .filter(Boolean)
                      .map((item: any, index: number) => (
                        <Badge
                          key={index}
                          className="bg-green-500/20 text-green-300 border-green-500"
                        >
                          {item}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
              {yongshen.unfavorable && yongshen.unfavorable.length > 0 && (
                <div>
                  <div className="text-sm text-slate-400 mb-2">忌神</div>
                  <div className="flex flex-wrap gap-2">
                    {yongshen.unfavorable
                      .filter(Boolean)
                      .map((item: any, index: number) => (
                        <Badge
                          key={index}
                          className="bg-red-500/20 text-red-300 border-red-500"
                        >
                          {item}
                        </Badge>
                      ))}
                  </div>
                </div>
              )}
              {yongshen.commentary && (
                <div className="mt-4 p-4 bg-slate-800/50 rounded-lg">
                  <p className="text-sm text-slate-300">
                    {yongshen.commentary}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 大运流年 */}
      {luckPillars && luckPillars.length > 0 && (
        <Card className="bg-slate-900/80 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              大运流年
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {luckPillars.slice(0, 6).map((pillar: any, index: number) => (
                <div key={index} className="p-3 bg-slate-800/50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-bold text-white">
                      {pillar.heavenlyStem}
                      {pillar.earthlyBranch}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {pillar.startAge}-{pillar.endAge}岁
                    </Badge>
                  </div>
                  <div className="text-xs text-slate-400">
                    第{pillar.period + 1}大运
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 提示信息 */}
      <Card className="bg-blue-900/20 border-blue-700">
        <CardContent className="pt-6">
          <p className="text-sm text-blue-200 text-center">
            💡
            以上分析基于传统八字命理学，仅供参考。人生发展受多种因素影响，应理性对待。
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
