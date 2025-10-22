/**
 * 八字分析 - 五行分析组件
 * 详细展示五行力量、平衡状态等分析
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import type { BaziAnalysisModel } from '@/lib/bazi/normalize';
import {
  Activity,
  AlertCircle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  CheckCircle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';

interface ElementsAnalysisProps {
  data: BaziAnalysisModel;
}

// 五行颜色映射
const elementColors: Record<string, {bg: string, text: string, border: string}> = {
  wood: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  fire: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  earth: { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-300' },
  metal: { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  water: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
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

export function ElementsAnalysis({ data }: ElementsAnalysisProps) {
  const { metrics } = data;

  // 计算五行相对强度
  const getStrengthLevel = (score: number): {label: string, color: string, icon: any} => {
    if (score >= 30) return { label: '极旺', color: 'text-green-600', icon: TrendingUp };
    if (score >= 20) return { label: '偏旺', color: 'text-blue-600', icon: ArrowUp };
    if (score >= 15) return { label: '平和', color: 'text-gray-600', icon: ArrowRight };
    if (score >= 10) return { label: '偏弱', color: 'text-orange-600', icon: ArrowDown };
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
                      <span className="text-lg">{elementIcons[element]}</span>
                      <span className="font-medium">{elementNames[element]}</span>
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
                    您的五行分布较为均衡，命局稳定，易于发挥天赋。
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                <div>
                  <p className="font-medium text-orange-800">五行失衡</p>
                  <div className="text-sm text-gray-700 mt-1 space-y-1">
                    {metrics.balance.excess && metrics.balance.excess.length > 0 && (
                      <p>• 过旺五行: {metrics.balance.excess.join('、')}</p>
                    )}
                    {metrics.balance.shortage && metrics.balance.shortage.length > 0 && (
                      <p>• 不足五行: {metrics.balance.shortage.join('、')}</p>
                    )}
                    <p className="mt-2 text-orange-700">
                      建议通过补足不足五行来达到平衡，可参考用神建议。
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 五行生克关系 */}
      <Card className="border-2 border-indigo-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            五行生克关系
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 rounded-lg bg-green-50 border border-green-200">
              <h4 className="font-medium text-green-900 mb-2">相生关系</h4>
              <p className="text-sm text-gray-700">
                木生火 → 火生土 → 土生金 → 金生水 → 水生木
              </p>
              <p className="text-xs text-gray-600 mt-2">
                相生表示促进、助长的关系，有利于能量的传递和转化
              </p>
            </div>

            <div className="p-4 rounded-lg bg-red-50 border border-red-200">
              <h4 className="font-medium text-red-900 mb-2">相克关系</h4>
              <p className="text-sm text-gray-700">
                木克土 → 土克水 → 水克火 → 火克金 → 金克木
              </p>
              <p className="text-xs text-gray-600 mt-2">
                相克表示制约、抑制的关系，适度相克有助于保持平衡
              </p>
            </div>

            <div className="p-4 rounded-lg bg-blue-50 border-2 border-blue-300">
              <p className="text-sm text-gray-800">
                <strong className="text-blue-900">💡 提示：</strong>
                五行生克平衡是八字命理的核心。相生过度则泄，相克过度则伤。
                最理想的状态是五行流通有情，相生相克适度，达到动态平衡。
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
