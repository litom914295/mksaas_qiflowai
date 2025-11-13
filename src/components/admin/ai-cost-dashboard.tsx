'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  Calendar,
  CheckCircle,
  DollarSign,
  Download,
  RefreshCcw,
  TrendingDown,
  TrendingUp,
  Zap,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface CostData {
  daily: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  monthly: {
    used: number;
    limit: number;
    remaining: number;
    percentage: number;
  };
  nearLimit: boolean;
  overLimit: boolean;
  trends: {
    dailyChange: number;
    monthlyProjection: number;
  };
  topModels: Array<{
    model: string;
    requests: number;
    cost: number;
    percentage: number;
  }>;
}

export function AICostDashboard() {
  const [costData, setCostData] = useState<CostData | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  useEffect(() => {
    fetchCostData();
    // 每分钟自动刷新
    const interval = setInterval(fetchCostData, 60000);
    return () => clearInterval(interval);
  }, []);

  const fetchCostData = async () => {
    try {
      const response = await fetch('/api/admin/ai-cost/dashboard');
      const data = await response.json();

      if (data.success) {
        setCostData(data.data);
        setLastUpdate(new Date());
      }
    } catch (error) {
      console.error('Failed to fetch cost data:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = async () => {
    try {
      const response = await fetch('/api/admin/ai-cost/export', {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-cost-report-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Failed to export report:', error);
    }
  };

  if (loading || !costData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="h-32 bg-gray-200 dark:bg-gray-700 rounded"
              />
            ))}
          </div>
        </div>
      </Card>
    );
  }

  const { daily, monthly, nearLimit, overLimit, trends, topModels } = costData;

  return (
    <div className="space-y-6">
      {/* 警告横幅 */}
      {overLimit && (
        <Card className="border-red-500 bg-red-50 dark:bg-red-950/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">
                预算已超限
              </h3>
              <p className="text-sm text-red-700 dark:text-red-300 mt-1">
                AI成本已超过设定的预算限制，请立即检查并采取措施
              </p>
            </div>
          </div>
        </Card>
      )}

      {nearLimit && !overLimit && (
        <Card className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950/20 p-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-yellow-900 dark:text-yellow-100">
                接近预算限制
              </h3>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                AI成本已达到预算的80%以上，请注意控制使用量
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* 标题栏 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">AI成本监控</h2>
          <p className="text-sm text-muted-foreground mt-1">
            最后更新: {lastUpdate.toLocaleTimeString('zh-CN')}
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={fetchCostData}
            disabled={loading}
          >
            <RefreshCcw
              className={cn('h-4 w-4 mr-2', loading && 'animate-spin')}
            />
            刷新
          </Button>
          <Button variant="outline" size="sm" onClick={exportReport}>
            <Download className="h-4 w-4 mr-2" />
            导出报告
          </Button>
        </div>
      </div>

      {/* 核心指标卡片 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* 今日成本 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                今日成本
              </p>
              <p className="text-2xl font-bold mt-1">
                ${daily.used.toFixed(4)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                限额: ${daily.limit.toFixed(2)}
              </p>
            </div>
            <div
              className={cn(
                'p-3 rounded-full',
                daily.percentage > 80
                  ? 'bg-red-100 dark:bg-red-950/20'
                  : 'bg-blue-100 dark:bg-blue-950/20'
              )}
            >
              <DollarSign
                className={cn(
                  'h-6 w-6',
                  daily.percentage > 80 ? 'text-red-600' : 'text-blue-600'
                )}
              />
            </div>
          </div>
          <div className="mt-4">
            <Progress
              value={daily.percentage}
              className={cn(
                'h-2',
                daily.percentage > 80 && 'bg-red-200 dark:bg-red-900'
              )}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {daily.percentage.toFixed(1)}% 已使用
            </p>
          </div>
        </Card>

        {/* 本月成本 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                本月成本
              </p>
              <p className="text-2xl font-bold mt-1">
                ${monthly.used.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                限额: ${monthly.limit.toFixed(2)}
              </p>
            </div>
            <div
              className={cn(
                'p-3 rounded-full',
                monthly.percentage > 80
                  ? 'bg-red-100 dark:bg-red-950/20'
                  : 'bg-green-100 dark:bg-green-950/20'
              )}
            >
              <Calendar
                className={cn(
                  'h-6 w-6',
                  monthly.percentage > 80 ? 'text-red-600' : 'text-green-600'
                )}
              />
            </div>
          </div>
          <div className="mt-4">
            <Progress
              value={monthly.percentage}
              className={cn(
                'h-2',
                monthly.percentage > 80 && 'bg-red-200 dark:bg-red-900'
              )}
            />
            <p className="text-xs text-muted-foreground mt-2">
              {monthly.percentage.toFixed(1)}% 已使用
            </p>
          </div>
        </Card>

        {/* 日变化 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                日变化
              </p>
              <p className="text-2xl font-bold mt-1">
                {trends.dailyChange > 0 ? '+' : ''}
                {(trends.dailyChange * 100).toFixed(1)}%
              </p>
              <p className="text-xs text-muted-foreground mt-1">较昨日</p>
            </div>
            <div
              className={cn(
                'p-3 rounded-full',
                trends.dailyChange > 0
                  ? 'bg-orange-100 dark:bg-orange-950/20'
                  : 'bg-green-100 dark:bg-green-950/20'
              )}
            >
              {trends.dailyChange > 0 ? (
                <TrendingUp className="h-6 w-6 text-orange-600" />
              ) : (
                <TrendingDown className="h-6 w-6 text-green-600" />
              )}
            </div>
          </div>
          <div className="mt-4">
            <Badge
              variant={trends.dailyChange > 0.2 ? 'destructive' : 'secondary'}
            >
              {trends.dailyChange > 0.2 ? '增长较快' : '正常'}
            </Badge>
          </div>
        </Card>

        {/* 月度预测 */}
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">
                月度预测
              </p>
              <p className="text-2xl font-bold mt-1">
                ${trends.monthlyProjection.toFixed(2)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">预计本月总计</p>
            </div>
            <div className="p-3 rounded-full bg-purple-100 dark:bg-purple-950/20">
              <Zap className="h-6 w-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-4">
            {trends.monthlyProjection > monthly.limit ? (
              <Badge variant="destructive">预算超支风险</Badge>
            ) : (
              <Badge
                variant="outline"
                className="bg-green-50 dark:bg-green-950/20"
              >
                <CheckCircle className="h-3 w-3 mr-1" />
                预算内
              </Badge>
            )}
          </div>
        </Card>
      </div>

      {/* 模型使用分布 */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">模型使用分布</h3>
        <div className="space-y-4">
          {topModels.map((model) => (
            <div key={model.model} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="font-medium">{model.model}</span>
                  <Badge variant="outline">{model.requests} 次请求</Badge>
                </div>
                <span className="font-bold">${model.cost.toFixed(4)}</span>
              </div>
              <Progress value={model.percentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {model.percentage.toFixed(1)}% 总成本
              </p>
            </div>
          ))}
        </div>
      </Card>

      {/* 成本控制建议 */}
      <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
          <Zap className="h-5 w-5 text-blue-600" />
          成本控制建议
        </h3>
        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• 优先使用成本更低的模型（如 gpt-4o-mini, deepseek-chat）</li>
          <li>• 实施用户级别的速率限制，防止滥用</li>
          <li>• 使用缓存减少重复请求</li>
          <li>• 设置自动告警，成本超过阈值时通知管理员</li>
          <li>• 定期审查高成本用户和异常使用模式</li>
        </ul>
      </Card>
    </div>
  );
}
