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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Filter, RefreshCw, TrendingDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface FunnelStage {
  name: string;
  stage: string;
  count: number;
  percentage: number;
  dropOff: number;
  description: string;
}

interface FunnelData {
  stages: FunnelStage[];
  conversions: {
    clickToRegistration: { rate: number; label: string };
    registrationToActivation: { rate: number; label: string };
    overallConversion: { rate: number; label: string };
  };
  summary: {
    totalExposure: number;
    totalRegistrations: number;
    totalActivations: number;
    period: string;
  };
  fromCache?: boolean;
}

export default function FunnelAnalyticsPage() {
  const [data, setData] = useState<FunnelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchData();
  }, [period]);

  async function fetchData() {
    try {
      setLoading(true);
      const res = await fetch(`/api/admin/analytics/funnel?period=${period}`);
      const funnelData = await res.json();
      setData(funnelData);
    } catch (error) {
      toast.error('加载失败');
    } finally {
      setLoading(false);
    }
  }

  async function clearCache() {
    try {
      await fetch('/api/admin/analytics/funnel/clear-cache', {
        method: 'POST',
      });
      toast.success('缓存已清空');
      fetchData();
    } catch (error) {
      toast.error('操作失败');
    }
  }

  if (loading || !data) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-300 border-t-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">转化漏斗分析</h1>
          <p className="text-sm text-gray-600">
            用户从曝光到激活的转化路径分析
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={period} onValueChange={setPeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">近7天</SelectItem>
              <SelectItem value="30d">近30天</SelectItem>
              <SelectItem value="90d">近90天</SelectItem>
              <SelectItem value="all">全部时间</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={clearCache}>
            <RefreshCw className="mr-2 h-4 w-4" />
            清空缓存
          </Button>
          {data.fromCache && <Badge variant="secondary">缓存数据</Badge>}
        </div>
      </div>

      {/* Conversion Rates */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">点击→注册</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.conversions.clickToRegistration.rate.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">点击转化为注册率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">注册→激活</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.conversions.registrationToActivation.rate.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">注册转化为激活率</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">整体转化率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.conversions.overallConversion.rate.toFixed(2)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">从曝光到激活</p>
          </CardContent>
        </Card>
      </div>

      {/* Funnel Visualization */}
      <Card>
        <CardHeader>
          <CardTitle>转化漏斗</CardTitle>
          <CardDescription>用户在各阶段的留存和流失情况</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.stages.map((stage, index) => {
              const prevStage = index > 0 ? data.stages[index - 1] : null;
              const dropRate =
                prevStage && prevStage.count > 0
                  ? ((prevStage.count - stage.count) / prevStage.count) * 100
                  : 0;

              return (
                <div key={stage.stage} className="space-y-2">
                  {/* Stage Info */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-sm font-medium text-blue-600">
                        {index + 1}
                      </div>
                      <div>
                        <div className="font-medium">{stage.name}</div>
                        <div className="text-xs text-gray-500">
                          {stage.description}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-lg font-bold">
                        {stage.count.toLocaleString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {stage.percentage.toFixed(1)}%
                      </div>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  <div className="relative h-6 overflow-hidden rounded-full bg-gray-100">
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all"
                      style={{ width: `${stage.percentage}%` }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-gray-700">
                      {stage.count > 0 && `${stage.count.toLocaleString()} 人`}
                    </div>
                  </div>

                  {/* Drop-off Info */}
                  {index > 0 && stage.dropOff > 0 && (
                    <div className="flex items-center gap-2 text-sm text-red-600">
                      <TrendingDown className="h-4 w-4" />
                      <span>
                        流失 {stage.dropOff.toLocaleString()} 人 (
                        {dropRate.toFixed(1)}%)
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Summary */}
      <Card>
        <CardHeader>
          <CardTitle>数据摘要</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div>
              <div className="text-sm text-gray-600">总曝光</div>
              <div className="text-2xl font-bold">
                {data.summary.totalExposure.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">总注册</div>
              <div className="text-2xl font-bold">
                {data.summary.totalRegistrations.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">总激活</div>
              <div className="text-2xl font-bold text-green-600">
                {data.summary.totalActivations.toLocaleString()}
              </div>
            </div>
            <div>
              <div className="text-sm text-gray-600">统计周期</div>
              <div className="text-lg font-medium">
                {period === '7d' && '近7天'}
                {period === '30d' && '近30天'}
                {period === '90d' && '近90天'}
                {period === 'all' && '全部时间'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Optimization Suggestions */}
      <Card>
        <CardHeader>
          <CardTitle>优化建议</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {data.conversions.clickToRegistration.rate < 20 && (
              <div className="rounded-lg border-l-4 border-yellow-500 bg-yellow-50 p-4">
                <div className="font-medium text-yellow-800">
                  点击到注册转化率偏低
                </div>
                <div className="text-sm text-yellow-700 mt-1">
                  建议优化落地页体验,减少注册流程复杂度
                </div>
              </div>
            )}
            {data.conversions.registrationToActivation.rate < 50 && (
              <div className="rounded-lg border-l-4 border-orange-500 bg-orange-50 p-4">
                <div className="font-medium text-orange-800">
                  激活率有提升空间
                </div>
                <div className="text-sm text-orange-700 mt-1">
                  建议优化新手引导,提供免费积分激励首次使用
                </div>
              </div>
            )}
            {data.conversions.overallConversion.rate > 10 && (
              <div className="rounded-lg border-l-4 border-green-500 bg-green-50 p-4">
                <div className="font-medium text-green-800">
                  整体转化率表现良好
                </div>
                <div className="text-sm text-green-700 mt-1">
                  保持当前策略,可考虑扩大推广渠道
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
