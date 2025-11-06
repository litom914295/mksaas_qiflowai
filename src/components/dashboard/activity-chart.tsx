'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { useIsMobile } from '@/hooks/use-mobile';
import { useQuery } from '@tanstack/react-query';
import { format, subDays } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import * as React from 'react';
import { Area, AreaChart, CartesianGrid, XAxis } from 'recharts';

type ActivityData = {
  date: string;
  baziAnalysis: number;
  fengshuiAnalysis: number;
  aiChat: number;
};

const chartConfig = {
  baziAnalysis: {
    label: '八字分析',
    color: 'hsl(var(--chart-1))',
  },
  fengshuiAnalysis: {
    label: '风水分析',
    color: 'hsl(var(--chart-2))',
  },
  aiChat: {
    label: 'AI对话',
    color: 'hsl(var(--chart-3))',
  },
} satisfies ChartConfig;

export function ActivityChart() {
  const isMobile = useIsMobile();
  const [timeRange, setTimeRange] = React.useState('30d');

  React.useEffect(() => {
    if (isMobile) {
      setTimeRange('7d');
    }
  }, [isMobile]);

  const { data, isLoading } = useQuery<ActivityData[]>({
    queryKey: ['activity-chart', timeRange],
    queryFn: async () => {
      const response = await fetch(`/api/dashboard/activity?range=${timeRange}`);
      if (!response.ok) throw new Error('Failed to fetch activity data');
      return response.json();
    },
  });

  const filteredData = data || [];

  // 计算总计
  const totals = React.useMemo(() => {
    if (!filteredData.length) return { bazi: 0, fengshui: 0, aiChat: 0 };
    return filteredData.reduce(
      (acc, item) => ({
        bazi: acc.bazi + item.baziAnalysis,
        fengshui: acc.fengshui + item.fengshuiAnalysis,
        aiChat: acc.aiChat + item.aiChat,
      }),
      { bazi: 0, fengshui: 0, aiChat: 0 }
    );
  }, [filteredData]);

  if (isLoading) {
    return <ActivityChartSkeleton />;
  }

  return (
    <Card className="@container/card">
      <CardHeader className="flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1.5">
          <CardTitle>活动趋势</CardTitle>
          <CardDescription>
            <span className="hidden @[540px]/card:block">
              近{timeRange === '7d' ? '7天' : timeRange === '30d' ? '30天' : '90天'}的使用统计
            </span>
            <span className="@[540px]/card:hidden">
              {timeRange === '7d' ? '最近7天' : timeRange === '30d' ? '最近30天' : '最近90天'}
            </span>
          </CardDescription>
        </div>
        <div className="flex items-center gap-2">
          <ToggleGroup
            type="single"
            value={timeRange}
            onValueChange={setTimeRange}
            variant="outline"
            className="hidden *:data-[slot=toggle-group-item]:!px-4 @[767px]/card:flex"
          >
            <ToggleGroupItem value="90d">最近90天</ToggleGroupItem>
            <ToggleGroupItem value="30d">最近30天</ToggleGroupItem>
            <ToggleGroupItem value="7d">最近7天</ToggleGroupItem>
          </ToggleGroup>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger
              className="flex w-40 **:data-[slot=select-value]:block **:data-[slot=select-value]:truncate @[767px]/card:hidden"
              size="sm"
              aria-label="选择时间范围"
            >
              <SelectValue placeholder="最近30天" />
            </SelectTrigger>
            <SelectContent className="rounded-xl">
              <SelectItem value="90d" className="rounded-lg">
                最近90天
              </SelectItem>
              <SelectItem value="30d" className="rounded-lg">
                最近30天
              </SelectItem>
              <SelectItem value="7d" className="rounded-lg">
                最近7天
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="px-2 pt-4 sm:px-6 sm:pt-6">
        {/* 统计摘要 */}
        <div className="mb-6 grid grid-cols-3 gap-4 text-center">
          <div>
            <div className="text-2xl font-bold text-purple-600">{totals.bazi}</div>
            <div className="text-xs text-muted-foreground">八字分析</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{totals.fengshui}</div>
            <div className="text-xs text-muted-foreground">风水分析</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{totals.aiChat}</div>
            <div className="text-xs text-muted-foreground">AI对话</div>
          </div>
        </div>

        <ChartContainer
          config={chartConfig}
          className="aspect-auto h-[250px] w-full"
        >
          <AreaChart data={filteredData}>
            <defs>
              <linearGradient id="fillBazi" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-baziAnalysis)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-baziAnalysis)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillFengshui" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-fengshuiAnalysis)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-fengshuiAnalysis)"
                  stopOpacity={0.1}
                />
              </linearGradient>
              <linearGradient id="fillAiChat" x1="0" y1="0" x2="0" y2="1">
                <stop
                  offset="5%"
                  stopColor="var(--color-aiChat)"
                  stopOpacity={0.8}
                />
                <stop
                  offset="95%"
                  stopColor="var(--color-aiChat)"
                  stopOpacity={0.1}
                />
              </linearGradient>
            </defs>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              minTickGap={32}
              tickFormatter={(value) => {
                const date = new Date(value);
                return format(date, 'MM-dd', { locale: zhCN });
              }}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  labelFormatter={(value) => {
                    return format(new Date(value), 'yyyy年MM月dd日', {
                      locale: zhCN,
                    });
                  }}
                  indicator="dot"
                />
              }
            />
            <Area
              dataKey="baziAnalysis"
              type="natural"
              fill="url(#fillBazi)"
              stroke="var(--color-baziAnalysis)"
              stackId="a"
            />
            <Area
              dataKey="fengshuiAnalysis"
              type="natural"
              fill="url(#fillFengshui)"
              stroke="var(--color-fengshuiAnalysis)"
              stackId="a"
            />
            <Area
              dataKey="aiChat"
              type="natural"
              fill="url(#fillAiChat)"
              stroke="var(--color-aiChat)"
              stackId="a"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function ActivityChartSkeleton() {
  return (
    <Card className="@container/card">
      <CardHeader>
        <Skeleton className="h-6 w-32" />
        <Skeleton className="h-4 w-48" />
      </CardHeader>
      <CardContent>
        <Skeleton className="h-[250px] w-full" />
      </CardContent>
    </Card>
  );
}
