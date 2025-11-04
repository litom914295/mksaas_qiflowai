'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale/zh-CN';
import {
  CalendarIcon,
  CheckCircleIcon,
  CrownIcon,
  MailIcon,
  PhoneIcon,
  UserIcon,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

interface AccountInfoCardProps {
  className?: string;
}

/**
 * Account information card showing user details
 */
export function AccountInfoCard({ className }: AccountInfoCardProps) {
  const t = useTranslations('Dashboard.settings.profile');
  const { data: session, isPending } = authClient.useSession();

  const user = session?.user;

  // Render loading skeleton
  if (isPending) {
    return (
      <Card className={cn('w-full', className)}>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-5 w-24" />
          </div>
          <Skeleton className="h-4 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-4 w-4" />
              <div className="space-y-1 flex-1">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-3 w-24" />
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  }

  if (!user) {
    return null;
  }

  // Format registration date
  const registrationDate = user.createdAt
    ? format(new Date(user.createdAt), 'yyyy年MM月dd日', { locale: zhCN })
    : '未知';

  // Determine user level/status
  const getUserLevel = () => {
    // This would be based on your user level logic
    if (user.email === 'admin@qiflowai.com') return '管理员';
    if (user.email?.includes('vip')) return 'VIP用户';
    return '普通用户';
  };

  const userLevel = getUserLevel();

  // Check if email is verified (you might have this field in your user object)
  const isEmailVerified = user.emailVerified !== null;

  const phone = (user as any)?.phone as string | undefined;

  const accountInfo = [
    {
      icon: UserIcon,
      label: '用户名',
      value: user.name || '未设置',
      verified: true,
    },
    {
      icon: MailIcon,
      label: '邮箱地址',
      value: user.email || '未设置',
      verified: isEmailVerified,
    },
    {
      icon: PhoneIcon,
      label: '手机号码',
      value: phone || '未绑定',
      verified: !!phone,
    },
    {
      icon: CalendarIcon,
      label: '注册时间',
      value: registrationDate,
      verified: true,
    },
  ];

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          <UserIcon className="h-5 w-5 text-primary" />
          账号信息
        </CardTitle>
        <CardDescription>查看和管理您的基本账号信息</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* User Level Badge */}
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
          <div className="flex items-center gap-2">
            <CrownIcon className="h-4 w-4 text-primary" />
            <span className="text-sm text-muted-foreground">用户等级</span>
          </div>
          <Badge variant="secondary" className="bg-primary/10 text-primary">
            {userLevel}
          </Badge>
        </div>

        {/* Account Information */}
        <div className="space-y-4">
          {accountInfo.map((info, index) => {
            const Icon = info.icon;
            return (
              <div
                key={index}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors"
              >
                <div className="flex-shrink-0">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0 space-y-1">
                  <div className="text-sm text-muted-foreground">
                    {info.label}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {info.value}
                    </span>
                    {info.verified &&
                      info.value !== '未设置' &&
                      info.value !== '未绑定' && (
                        <CheckCircleIcon className="h-4 w-4 text-green-500" />
                      )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Account Statistics */}
        <div className="bg-muted/30 rounded-lg p-4 space-y-3">
          <h4 className="text-sm font-medium">账号统计</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-1">
              <div className="text-muted-foreground">登录次数</div>
              <div className="font-medium">--</div>
            </div>
            <div className="space-y-1">
              <div className="text-muted-foreground">最后登录</div>
              <div className="font-medium">
                {user.updatedAt
                  ? format(new Date(user.updatedAt), 'MM-dd HH:mm')
                  : '--'}
              </div>
            </div>
          </div>
        </div>

        {/* Security Status */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">安全状态</h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">邮箱验证</span>
              <div className="flex items-center gap-1">
                {isEmailVerified ? (
                  <>
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span className="text-xs text-green-600">已验证</span>
                  </>
                ) : (
                  <span className="text-xs text-amber-600">待验证</span>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">两步验证</span>
              <span className="text-xs text-muted-foreground">未启用</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
