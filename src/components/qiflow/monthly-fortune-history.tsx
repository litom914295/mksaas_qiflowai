'use client';

/**
 * Phase 8: 月度运势历史列表组件
 *
 * 功能：
 * 1. 显示用户的历史运势记录
 * 2. 按时间倒序排列
 * 3. 支持快速查看和跳转
 * 4. Empty State 处理
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Calendar, Eye, Sparkles, TrendingUp } from 'lucide-react';
import Link from 'next/link';

// ==================== 类型定义 ====================

interface MonthlyFortuneHistoryProps {
  fortunes: MonthlyFortuneHistoryItem[];
  onGenerateNew?: () => void;
}

interface MonthlyFortuneHistoryItem {
  id: string;
  year: number;
  month: number;
  status: string;
  overallScore: number;
  luckyDirections: string[];
  luckyColors: string[];
  luckyNumbers: number[];
  generatedAt: Date | null;
  createdAt: Date;
}

// ==================== 主组件 ====================

export function MonthlyFortuneHistory({
  fortunes,
  onGenerateNew,
}: MonthlyFortuneHistoryProps) {
  // Empty State
  if (fortunes.length === 0) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            历史运势
          </CardTitle>
          <CardDescription>查看您之前生成的月度运势记录</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">暂无历史运势</h3>
            <p className="text-sm text-muted-foreground mb-6 max-w-sm">
              您还没有生成过月度运势。点击下方按钮生成您的第一份个性化运势分析。
            </p>
            {onGenerateNew && (
              <Button onClick={onGenerateNew}>
                <Sparkles className="mr-2 h-4 w-4" />
                生成运势
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }

  // 按时间倒序排列
  const sortedFortunes = [...fortunes].sort((a, b) => {
    if (a.year !== b.year) return b.year - a.year;
    return b.month - a.month;
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              历史运势
            </CardTitle>
            <CardDescription>共 {fortunes.length} 条记录</CardDescription>
          </div>
          {onGenerateNew && (
            <Button onClick={onGenerateNew} variant="outline" size="sm">
              <Sparkles className="mr-2 h-4 w-4" />
              生成新运势
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {sortedFortunes.map((fortune) => (
            <FortuneHistoryItem key={fortune.id} fortune={fortune} />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ==================== 历史项目组件 ====================

function FortuneHistoryItem({
  fortune,
}: { fortune: MonthlyFortuneHistoryItem }) {
  return (
    <Link href={`/qiflow/monthly-fortune/${fortune.id}`}>
      <div className="group p-4 rounded-lg border hover:border-primary hover:bg-accent transition-all cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          {/* 左侧：时间和评分 */}
          <div className="flex items-start gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex flex-col items-center justify-center">
                <div className="text-xs font-medium text-primary">
                  {fortune.year}
                </div>
                <div className="text-lg font-bold text-primary">
                  {fortune.month}月
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-2">
              <div className="flex items-center gap-3">
                <h4 className="font-semibold group-hover:text-primary transition-colors">
                  {fortune.year}年{fortune.month}月运势
                </h4>
                <Badge variant={getStatusBadgeVariant(fortune.status)}>
                  {getStatusLabel(fortune.status)}
                </Badge>
              </div>

              {/* 运势评分 */}
              {fortune.status === 'completed' && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm font-medium">
                      {fortune.overallScore}分
                    </span>
                  </div>
                  <div className="w-32 bg-secondary rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full ${getScoreColor(fortune.overallScore)}`}
                      style={{ width: `${fortune.overallScore}%` }}
                    />
                  </div>
                </div>
              )}

              {/* 吉祥元素预览 */}
              {fortune.status === 'completed' && (
                <div className="flex items-center gap-4 text-xs text-muted-foreground">
                  {fortune.luckyDirections &&
                    fortune.luckyDirections.length > 0 && (
                      <span>
                        吉方位: {fortune.luckyDirections.slice(0, 2).join('、')}
                      </span>
                    )}
                  {fortune.luckyColors && fortune.luckyColors.length > 0 && (
                    <span>
                      幸运色: {fortune.luckyColors.slice(0, 2).join('、')}
                    </span>
                  )}
                </div>
              )}

              {/* 生成时间 */}
              {fortune.generatedAt && (
                <div className="text-xs text-muted-foreground">
                  生成于{' '}
                  {new Date(fortune.generatedAt).toLocaleDateString('zh-CN', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              )}
            </div>
          </div>

          {/* 右侧：查看按钮 */}
          <div className="flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Eye className="h-4 w-4 mr-2" />
              查看
            </Button>
          </div>
        </div>
      </div>
    </Link>
  );
}

// ==================== 辅助函数 ====================

function getStatusBadgeVariant(
  status: string
): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'completed':
      return 'default';
    case 'generating':
      return 'secondary';
    case 'failed':
      return 'destructive';
    default:
      return 'outline';
  }
}

function getStatusLabel(status: string): string {
  switch (status) {
    case 'completed':
      return '已完成';
    case 'generating':
      return '生成中';
    case 'failed':
      return '失败';
    case 'pending':
      return '待生成';
    default:
      return status;
  }
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'bg-green-500';
  if (score >= 60) return 'bg-blue-500';
  if (score >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

// ==================== 导出 ====================

export type { MonthlyFortuneHistoryProps, MonthlyFortuneHistoryItem };
