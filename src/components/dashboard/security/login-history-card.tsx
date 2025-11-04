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
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import {
  AlertCircleIcon,
  CheckCircleIcon,
  HistoryIcon,
  MapPinIcon,
  MonitorIcon,
  RefreshCwIcon,
  SmartphoneIcon,
  TabletIcon,
} from 'lucide-react';
import { useEffect, useState } from 'react';

interface LoginHistoryCardProps {
  className?: string;
}

interface LoginRecord {
  id: string;
  timestamp: string;
  ipAddress: string;
  location: string;
  device: string;
  browser: string;
  success: boolean;
  riskLevel: 'low' | 'medium' | 'high';
}

/**
 * Login history card showing recent login activities
 */
export function LoginHistoryCard({ className }: LoginHistoryCardProps) {
  const [loginHistory, setLoginHistory] = useState<LoginRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const fetchLoginHistory = async () => {
      setIsLoading(true);
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const mockData: LoginRecord[] = [
        {
          id: '1',
          timestamp: '2024-01-16T10:30:00Z',
          ipAddress: '192.168.1.100',
          location: '北京市, 中国',
          device: 'Desktop',
          browser: 'Chrome 120',
          success: true,
          riskLevel: 'low',
        },
        {
          id: '2',
          timestamp: '2024-01-15T15:45:00Z',
          ipAddress: '192.168.1.100',
          location: '北京市, 中国',
          device: 'Mobile',
          browser: 'Safari 17',
          success: true,
          riskLevel: 'low',
        },
        {
          id: '3',
          timestamp: '2024-01-15T09:20:00Z',
          ipAddress: '203.208.60.1',
          location: '上海市, 中国',
          device: 'Desktop',
          browser: 'Firefox 121',
          success: false,
          riskLevel: 'high',
        },
        {
          id: '4',
          timestamp: '2024-01-14T18:15:00Z',
          ipAddress: '192.168.1.100',
          location: '北京市, 中国',
          device: 'Tablet',
          browser: 'Chrome 120',
          success: true,
          riskLevel: 'low',
        },
        {
          id: '5',
          timestamp: '2024-01-14T12:00:00Z',
          ipAddress: '10.0.0.1',
          location: '广州市, 中国',
          device: 'Desktop',
          browser: 'Edge 120',
          success: true,
          riskLevel: 'medium',
        },
      ];

      setLoginHistory(mockData);
      setIsLoading(false);
    };

    fetchLoginHistory();
  }, []);

  const getDeviceIcon = (device: string) => {
    switch (device.toLowerCase()) {
      case 'mobile':
        return SmartphoneIcon;
      case 'tablet':
        return TabletIcon;
      default:
        return MonitorIcon;
    }
  };

  const getRiskBadgeColor = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'high':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskText = (riskLevel: string) => {
    switch (riskLevel) {
      case 'low':
        return '安全';
      case 'medium':
        return '注意';
      case 'high':
        return '异常';
      default:
        return '未知';
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    // Simulate refresh
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <HistoryIcon className="h-5 w-5 text-primary" />
              登录历史
            </CardTitle>
            <CardDescription>查看最近的登录活动和安全状态</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCwIcon
              className={cn('h-3 w-3 mr-1', isLoading && 'animate-spin')}
            />
            刷新
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          // Loading skeleton
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className="flex items-center gap-4 p-3 border rounded-lg"
              >
                <Skeleton className="h-8 w-8" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
                <Skeleton className="h-6 w-12" />
              </div>
            ))}
          </div>
        ) : loginHistory.length === 0 ? (
          // Empty state
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <HistoryIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">暂无登录记录</h3>
              <p className="text-sm text-muted-foreground">
                登录记录将显示在这里
              </p>
            </div>
          </div>
        ) : (
          // Login history list
          <div className="space-y-4">
            {loginHistory.map((record) => {
              const DeviceIcon = getDeviceIcon(record.device);
              return (
                <div
                  key={record.id}
                  className={cn(
                    'flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors',
                    {
                      'border-red-200 bg-red-50/50':
                        record.riskLevel === 'high',
                      'border-yellow-200 bg-yellow-50/50':
                        record.riskLevel === 'medium',
                    }
                  )}
                >
                  {/* Device Icon */}
                  <div
                    className={cn(
                      'p-2 rounded-full',
                      record.success ? 'bg-green-100' : 'bg-red-100'
                    )}
                  >
                    <DeviceIcon
                      className={cn(
                        'h-4 w-4',
                        record.success ? 'text-green-600' : 'text-red-600'
                      )}
                    />
                  </div>

                  {/* Login Details */}
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {format(new Date(record.timestamp), 'MM月dd日 HH:mm', {
                          locale: zhCN,
                        })}
                      </span>
                      {record.success ? (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      ) : (
                        <AlertCircleIcon className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-xs text-muted-foreground">
                        {record.success ? '登录成功' : '登录失败'}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <MapPinIcon className="h-3 w-3" />
                        {record.location}
                      </div>
                      <div>IP: {record.ipAddress}</div>
                      <div>
                        {record.browser} • {record.device}
                      </div>
                    </div>
                  </div>

                  {/* Risk Level Badge */}
                  <Badge
                    variant="secondary"
                    className={cn(
                      'text-xs',
                      getRiskBadgeColor(record.riskLevel)
                    )}
                  >
                    {getRiskText(record.riskLevel)}
                  </Badge>
                </div>
              );
            })}

            {/* Security Tips */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-blue-900">
                    安全提示
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• 如发现异常登录活动，请立即修改密码</li>
                    <li>• 建议启用两步验证增强账号安全</li>
                    <li>• 避免在公共网络上登录重要账号</li>
                    <li>• 定期检查登录历史确保账号安全</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
