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
import { cn } from '@/lib/utils';
import { Calendar, Download, Info, TrendingUp } from 'lucide-react';
import {
  Legend,
  PolarAngleAxis,
  PolarGrid,
  PolarRadiusAxis,
  Radar,
  RadarChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';

// 五维评分数据接口
export interface FiveScoreData {
  geju: number; // 格局得分 (30%)
  baziMatch: number; // 八字匹配度 (25%)
  liunian: number; // 流年吉凶 (20%)
  roomFunction: number; // 房间功能 (15%)
  remedy: number; // 化解措施 (10%)
}

// 评分历史记录
export interface ScoreHistory {
  date: string;
  scores: FiveScoreData;
  totalScore: number;
  rating: 'excellent' | 'good' | 'fair' | 'poor' | 'danger';
}

interface ScoreRadarChartProps {
  currentScore: FiveScoreData;
  historicalScores?: ScoreHistory[];
  comparisonScore?: FiveScoreData; // 用于对比的评分
  showComparison?: boolean;
  showLegend?: boolean;
  showTooltip?: boolean;
  className?: string;
  onExport?: () => void;
}

// 权重配置
const WEIGHTS = {
  geju: 0.3,
  baziMatch: 0.25,
  liunian: 0.2,
  roomFunction: 0.15,
  remedy: 0.1,
};

// 维度配置
const DIMENSIONS = [
  { key: 'geju', label: '格局得分', color: '#8b5cf6', weight: '30%' },
  { key: 'baziMatch', label: '八字匹配', color: '#3b82f6', weight: '25%' },
  { key: 'liunian', label: '流年吉凶', color: '#10b981', weight: '20%' },
  { key: 'roomFunction', label: '房间功能', color: '#f59e0b', weight: '15%' },
  { key: 'remedy', label: '化解措施', color: '#ef4444', weight: '10%' },
];

// 计算总分
function calculateTotalScore(scores: FiveScoreData): number {
  return (
    scores.geju * WEIGHTS.geju +
    scores.baziMatch * WEIGHTS.baziMatch +
    scores.liunian * WEIGHTS.liunian +
    scores.roomFunction * WEIGHTS.roomFunction +
    scores.remedy * WEIGHTS.remedy
  );
}

// 获取评级
function getRating(score: number): {
  label: string;
  color: string;
  bgColor: string;
} {
  if (score >= 81) {
    return { label: '优秀', color: 'text-green-600', bgColor: 'bg-green-50' };
  }
  if (score >= 61) {
    return { label: '良好', color: 'text-blue-600', bgColor: 'bg-blue-50' };
  }
  if (score >= 41) {
    return { label: '提示', color: 'text-yellow-600', bgColor: 'bg-yellow-50' };
  }
  if (score >= 21) {
    return { label: '警告', color: 'text-orange-600', bgColor: 'bg-orange-50' };
  }
  return { label: '危险', color: 'text-red-600', bgColor: 'bg-red-50' };
}

export function ScoreRadarChart({
  currentScore,
  historicalScores,
  comparisonScore,
  showComparison = false,
  showLegend = true,
  showTooltip = true,
  className,
  onExport,
}: ScoreRadarChartProps) {
  // 准备雷达图数据
  const radarData = DIMENSIONS.map((dim) => {
    const dataPoint: any = {
      dimension: dim.label,
      当前: currentScore[dim.key as keyof FiveScoreData],
      weight: dim.weight,
    };

    if (showComparison && comparisonScore) {
      dataPoint.对比 = comparisonScore[dim.key as keyof FiveScoreData];
    }

    return dataPoint;
  });

  // 计算总分
  const totalScore = calculateTotalScore(currentScore);
  const rating = getRating(totalScore);

  // 计算对比总分
  const comparisonTotalScore = comparisonScore
    ? calculateTotalScore(comparisonScore)
    : null;
  const scoreDiff = comparisonTotalScore
    ? totalScore - comparisonTotalScore
    : null;

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-background border rounded-lg p-3 shadow-lg">
          <p className="font-medium text-sm mb-2">
            {payload[0].payload.dimension}
          </p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div
                key={index}
                className="flex items-center justify-between gap-4 text-xs"
              >
                <span style={{ color: entry.color }}>{entry.name}:</span>
                <span className="font-medium">{entry.value} 分</span>
              </div>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            权重: {payload[0].payload.weight}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              五维评分雷达图
              <Badge variant="outline" className={cn('text-xs', rating.color)}>
                {rating.label}
              </Badge>
            </CardTitle>
            <CardDescription className="mt-1">
              综合评估风水格局的五个关键维度
            </CardDescription>
          </div>
          {onExport && (
            <Button variant="outline" size="sm" onClick={onExport}>
              <Download className="h-4 w-4 mr-2" />
              导出
            </Button>
          )}
        </div>

        {/* 总分卡片 */}
        <div className={cn('p-4 rounded-lg mt-4', rating.bgColor)}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">综合总分</p>
              <p className={cn('text-3xl font-bold mt-1', rating.color)}>
                {totalScore.toFixed(1)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">满分: 100.0</p>
            </div>

            {scoreDiff !== null && (
              <div className="text-right">
                <p className="text-sm text-muted-foreground">对比变化</p>
                <div className="flex items-center gap-1 mt-1">
                  {scoreDiff > 0 ? (
                    <>
                      <TrendingUp className="h-4 w-4 text-green-600" />
                      <span className="text-xl font-bold text-green-600">
                        +{scoreDiff.toFixed(1)}
                      </span>
                    </>
                  ) : (
                    <>
                      <TrendingUp className="h-4 w-4 text-red-600 rotate-180" />
                      <span className="text-xl font-bold text-red-600">
                        {scoreDiff.toFixed(1)}
                      </span>
                    </>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  较上次 {scoreDiff > 0 ? '提升' : '下降'}
                </p>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* 雷达图 */}
        <div className="w-full h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" />
              <PolarAngleAxis
                dataKey="dimension"
                tick={{ fill: '#6b7280', fontSize: 12 }}
              />
              <PolarRadiusAxis
                angle={90}
                domain={[0, 100]}
                tick={{ fill: '#9ca3af', fontSize: 10 }}
              />

              <Radar
                name="当前"
                dataKey="当前"
                stroke="#8b5cf6"
                fill="#8b5cf6"
                fillOpacity={0.6}
                strokeWidth={2}
              />

              {showComparison && comparisonScore && (
                <Radar
                  name="对比"
                  dataKey="对比"
                  stroke="#10b981"
                  fill="#10b981"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              )}

              {showTooltip && <Tooltip content={<CustomTooltip />} />}
              {showLegend && <Legend />}
            </RadarChart>
          </ResponsiveContainer>
        </div>

        {/* 维度详情 */}
        <div className="mt-6 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium mb-3">
            <Info className="h-4 w-4 text-muted-foreground" />
            <span>各维度详细得分</span>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {DIMENSIONS.map((dim) => {
              const score = currentScore[dim.key as keyof FiveScoreData];
              const compScore =
                comparisonScore?.[dim.key as keyof FiveScoreData];
              const diff = compScore ? score - compScore : null;

              return (
                <div
                  key={dim.key}
                  className="flex items-center gap-3 p-3 rounded-lg border"
                >
                  <div
                    className="w-1 h-12 rounded-full"
                    style={{ backgroundColor: dim.color }}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{dim.label}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="text-xs">
                          权重 {dim.weight}
                        </Badge>
                        <span className="text-sm font-bold">{score} 分</span>
                      </div>
                    </div>
                    <div className="h-2 bg-secondary rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${score}%`,
                          backgroundColor: dim.color,
                        }}
                      />
                    </div>
                    {diff !== null && (
                      <p
                        className={cn(
                          'text-xs mt-1',
                          diff > 0
                            ? 'text-green-600'
                            : diff < 0
                              ? 'text-red-600'
                              : 'text-muted-foreground'
                        )}
                      >
                        {diff > 0
                          ? `↑ +${diff.toFixed(1)}`
                          : diff < 0
                            ? `↓ ${diff.toFixed(1)}`
                            : '→ 0.0'}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* 历史趋势 */}
        {historicalScores && historicalScores.length > 0 && (
          <div className="mt-6 pt-6 border-t">
            <div className="flex items-center gap-2 text-sm font-medium mb-3">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>历史评分记录</span>
            </div>

            <div className="space-y-2">
              {historicalScores.slice(0, 5).map((history, index) => {
                const historyRating = getRating(history.totalScore);
                return (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 rounded hover:bg-accent transition-colors"
                  >
                    <span className="text-sm text-muted-foreground">
                      {new Date(history.date).toLocaleDateString('zh-CN')}
                    </span>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn('text-xs', historyRating.color)}
                      >
                        {historyRating.label}
                      </Badge>
                      <span className="text-sm font-medium">
                        {history.totalScore.toFixed(1)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 改善建议 */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg">
          <p className="text-sm font-medium text-blue-900 dark:text-blue-100 mb-2">
            💡 改善建议
          </p>
          <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1">
            {DIMENSIONS.filter(
              (dim) => currentScore[dim.key as keyof FiveScoreData] < 60
            ).map((dim) => (
              <li key={dim.key}>
                • <strong>{dim.label}</strong> 得分较低（
                {currentScore[dim.key as keyof FiveScoreData]}分），建议优先改善
              </li>
            ))}
            {DIMENSIONS.every(
              (dim) => currentScore[dim.key as keyof FiveScoreData] >= 60
            ) && <li>各维度得分均衡良好，保持当前状态即可</li>}
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}
