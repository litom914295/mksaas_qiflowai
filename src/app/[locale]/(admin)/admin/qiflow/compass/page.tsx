'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, Calendar, Compass, Smartphone } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function CompassStatsPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetch('/api/admin/qiflow/compass?type=stats')
      .then((res) => res.json())
      .then((data) => data.success && setStats(data.data));
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">罗盘使用统计</h1>
        <p className="text-muted-foreground">智能罗盘调用统计和设备分析</p>
      </div>

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Compass className="h-4 w-4 text-teal-500" />
                  总调用次数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.total}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  今日调用
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.today}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  本月调用
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.thisMonth}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Smartphone className="h-4 w-4" />
                  设备分布
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm">
                  <div>iOS: {stats.devices.ios}</div>
                  <div>Android: {stats.devices.android}</div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>最近7天调用趋势</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[200px] flex items-end space-x-2">
                {stats.trend.map((item: any, index: number) => (
                  <div
                    key={index}
                    className="flex-1 flex flex-col items-center"
                  >
                    <div
                      className="w-full bg-teal-500 rounded-t"
                      style={{
                        height: `${(item.count / Math.max(...stats.trend.map((t: any) => t.count))) * 180}px`,
                        minHeight: '10px',
                      }}
                    />
                    <div className="text-xs mt-2 text-muted-foreground">
                      {item.date.split('-')[2]}
                    </div>
                    <div className="text-xs font-semibold">{item.count}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>设备分布饼图</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-center h-[200px]">
                <div className="grid grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="text-3xl font-bold text-blue-500">
                      {stats.devices.ios}
                    </div>
                    <div className="text-sm text-muted-foreground">iOS</div>
                    <div className="text-xs">
                      {((stats.devices.ios / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-500">
                      {stats.devices.android}
                    </div>
                    <div className="text-sm text-muted-foreground">Android</div>
                    <div className="text-xs">
                      {((stats.devices.android / stats.total) * 100).toFixed(1)}
                      %
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-gray-500">
                      {stats.devices.other}
                    </div>
                    <div className="text-sm text-muted-foreground">其他</div>
                    <div className="text-xs">
                      {((stats.devices.other / stats.total) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
