/**
 * 错误监控页面
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

export default function ErrorsPage() {
  const errors = [
    {
      id: '1',
      message: 'TypeError: Cannot read property of undefined',
      count: 15,
      lastSeen: '5分钟前',
      severity: 'error',
      environment: 'production',
    },
    {
      id: '2',
      message: 'API timeout: /api/users',
      count: 8,
      lastSeen: '1小时前',
      severity: 'warning',
      environment: 'production',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">错误监控</h1>
          <p className="text-muted-foreground mt-2">查看和分析系统错误</p>
        </div>
        <Button>查看 Sentry Dashboard</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">总错误数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">最近24小时</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">错误率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0.02%</div>
            <p className="text-xs text-muted-foreground">相比昨天 -15%</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">影响用户</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">独立用户</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>最近错误</CardTitle>
          <CardDescription>按发生频率排序</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {errors.map((error) => (
              <div
                key={error.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge
                      variant={
                        error.severity === 'error' ? 'destructive' : 'default'
                      }
                    >
                      {error.severity}
                    </Badge>
                    <span className="text-sm text-muted-foreground">
                      {error.environment}
                    </span>
                  </div>
                  <p className="font-mono text-sm">{error.message}</p>
                  <div className="flex gap-4 mt-2 text-sm text-muted-foreground">
                    <span>出现 {error.count} 次</span>
                    <span>最后发生: {error.lastSeen}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  查看详情
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
