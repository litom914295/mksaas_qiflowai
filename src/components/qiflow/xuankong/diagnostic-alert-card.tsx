'use client';

/**
 * 诊断预警卡片组件 (v6.0)
 *
 * 五级预警展示：
 * - 极严重 (critical)
 * - 严重 (high)
 * - 中等 (medium)
 * - 轻微 (low)
 * - 安全 (safe)
 */

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Info,
  Shield,
} from 'lucide-react';
import React from 'react';

// 预警级别类型
export type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'safe';

// 预警数据结构
export interface DiagnosticAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  affectedArea: string; // 影响区域（如"坎宫"、"乾位"）
  issue: string; // 具体问题
  impact: {
    health?: string;
    wealth?: string;
    career?: string;
    relationship?: string;
  };
  score: number; // 0-100，分数越低问题越严重
  recommendations: string[];
  urgency?: 'immediate' | 'soon' | 'planned'; // 紧急程度
}

// 预警卡片属性
interface DiagnosticAlertCardProps {
  alert: DiagnosticAlert;
  onViewDetails?: () => void;
  className?: string;
}

// 严重程度配置
const SEVERITY_CONFIG = {
  critical: {
    label: '极严重',
    color: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-950/30',
    borderColor: 'border-red-200 dark:border-red-800',
    badgeVariant: 'destructive' as const,
    icon: AlertTriangle,
    iconColor: 'text-red-600',
  },
  high: {
    label: '严重',
    color: 'text-orange-600 dark:text-orange-400',
    bgColor: 'bg-orange-50 dark:bg-orange-950/30',
    borderColor: 'border-orange-200 dark:border-orange-800',
    badgeVariant: 'destructive' as const,
    icon: AlertCircle,
    iconColor: 'text-orange-600',
  },
  medium: {
    label: '中等',
    color: 'text-yellow-600 dark:text-yellow-400',
    bgColor: 'bg-yellow-50 dark:bg-yellow-950/30',
    borderColor: 'border-yellow-200 dark:border-yellow-800',
    badgeVariant: 'secondary' as const,
    icon: Info,
    iconColor: 'text-yellow-600',
  },
  low: {
    label: '轻微',
    color: 'text-blue-600 dark:text-blue-400',
    bgColor: 'bg-blue-50 dark:bg-blue-950/30',
    borderColor: 'border-blue-200 dark:border-blue-800',
    badgeVariant: 'secondary' as const,
    icon: Info,
    iconColor: 'text-blue-600',
  },
  safe: {
    label: '安全',
    color: 'text-green-600 dark:text-green-400',
    bgColor: 'bg-green-50 dark:bg-green-950/30',
    borderColor: 'border-green-200 dark:border-green-800',
    badgeVariant: 'secondary' as const,
    icon: CheckCircle,
    iconColor: 'text-green-600',
  },
};

// 紧急程度配置
const URGENCY_CONFIG = {
  immediate: { label: '立即处理', color: 'text-red-600' },
  soon: { label: '近期处理', color: 'text-orange-600' },
  planned: { label: '计划处理', color: 'text-blue-600' },
};

/**
 * 诊断预警卡片组件
 */
export function DiagnosticAlertCard({
  alert,
  onViewDetails,
  className,
}: DiagnosticAlertCardProps) {
  const config = SEVERITY_CONFIG[alert.severity];
  const Icon = config.icon;

  return (
    <Card
      className={cn(
        'transition-all hover:shadow-md',
        config.borderColor,
        config.bgColor,
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-start gap-3 flex-1">
            <div className={cn('p-2 rounded-lg', config.bgColor)}>
              <Icon className={cn('h-5 w-5', config.iconColor)} />
            </div>

            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className={cn('text-lg', config.color)}>
                  {alert.title}
                </CardTitle>
                <Badge variant={config.badgeVariant} className="text-xs">
                  {config.label}
                </Badge>
                {alert.urgency && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'text-xs',
                      URGENCY_CONFIG[alert.urgency].color
                    )}
                  >
                    {URGENCY_CONFIG[alert.urgency].label}
                  </Badge>
                )}
              </div>

              <CardDescription className="text-sm">
                影响区域：{alert.affectedArea}
              </CardDescription>
            </div>
          </div>

          {/* 评分显示 */}
          <div className="text-right min-w-[60px]">
            <div className={cn('text-2xl font-bold', config.color)}>
              {alert.score}
            </div>
            <div className="text-xs text-muted-foreground">风水评分</div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 问题描述 */}
        <div className="space-y-2">
          <p className="text-sm font-medium">问题描述</p>
          <p className="text-sm text-muted-foreground">{alert.description}</p>
          {alert.issue && (
            <Alert className="mt-2">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle className="text-sm">具体问题</AlertTitle>
              <AlertDescription className="text-xs">
                {alert.issue}
              </AlertDescription>
            </Alert>
          )}
        </div>

        {/* 影响分析 */}
        {Object.keys(alert.impact).length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">影响分析</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {alert.impact.health && (
                <ImpactItem label="健康" value={alert.impact.health} />
              )}
              {alert.impact.wealth && (
                <ImpactItem label="财运" value={alert.impact.wealth} />
              )}
              {alert.impact.career && (
                <ImpactItem label="事业" value={alert.impact.career} />
              )}
              {alert.impact.relationship && (
                <ImpactItem label="感情" value={alert.impact.relationship} />
              )}
            </div>
          </div>
        )}

        {/* 严重程度可视化 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">严重程度</span>
            <span className={cn('text-xs', config.color)}>{config.label}</span>
          </div>
          <Progress
            value={100 - alert.score}
            className={cn('h-2', config.bgColor)}
          />
        </div>

        {/* 建议 */}
        {alert.recommendations.length > 0 && (
          <div className="space-y-2">
            <p className="text-sm font-medium">化解建议</p>
            <ul className="space-y-1">
              {alert.recommendations.slice(0, 3).map((rec, idx) => (
                <li
                  key={idx}
                  className="text-xs text-muted-foreground flex items-start gap-2"
                >
                  <span className={cn('mt-1', config.color)}>•</span>
                  <span className="flex-1">{rec}</span>
                </li>
              ))}
            </ul>
            {alert.recommendations.length > 3 && onViewDetails && (
              <button
                onClick={onViewDetails}
                className={cn(
                  'text-xs underline hover:no-underline',
                  config.color
                )}
              >
                查看全部 {alert.recommendations.length} 条建议
              </button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * 影响项组件
 */
function ImpactItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2 p-2 rounded-md bg-muted/50">
      <span className="text-xs font-medium text-muted-foreground min-w-[3rem]">
        {label}
      </span>
      <span className="text-xs text-foreground flex-1">{value}</span>
    </div>
  );
}

/**
 * 预警列表组件
 */
interface DiagnosticAlertListProps {
  alerts: DiagnosticAlert[];
  onViewDetails?: (alert: DiagnosticAlert) => void;
  className?: string;
}

export function DiagnosticAlertList({
  alerts,
  onViewDetails,
  className,
}: DiagnosticAlertListProps) {
  // 按严重程度排序
  const sortedAlerts = [...alerts].sort((a, b) => {
    const severityOrder: Record<AlertSeverity, number> = {
      critical: 0,
      high: 1,
      medium: 2,
      low: 3,
      safe: 4,
    };
    return severityOrder[a.severity] - severityOrder[b.severity];
  });

  return (
    <div className={cn('space-y-4', className)}>
      {sortedAlerts.map((alert) => (
        <DiagnosticAlertCard
          key={alert.id}
          alert={alert}
          onViewDetails={() => onViewDetails?.(alert)}
        />
      ))}
    </div>
  );
}

/**
 * 预警统计组件
 */
interface AlertStatisticsProps {
  alerts: DiagnosticAlert[];
  className?: string;
}

export function AlertStatistics({ alerts, className }: AlertStatisticsProps) {
  const stats = {
    critical: alerts.filter((a) => a.severity === 'critical').length,
    high: alerts.filter((a) => a.severity === 'high').length,
    medium: alerts.filter((a) => a.severity === 'medium').length,
    low: alerts.filter((a) => a.severity === 'low').length,
    safe: alerts.filter((a) => a.severity === 'safe').length,
  };

  const total = alerts.length;
  const criticalAndHigh = stats.critical + stats.high;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          诊断统计
        </CardTitle>
        <CardDescription>
          共发现 {total} 个诊断项，其中 {criticalAndHigh} 个需要优先关注
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          {(Object.keys(stats) as AlertSeverity[]).map((severity) => {
            const config = SEVERITY_CONFIG[severity];
            const Icon = config.icon;
            const count = stats[severity];

            return (
              <div
                key={severity}
                className={cn(
                  'p-3 rounded-lg border',
                  config.bgColor,
                  config.borderColor
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Icon className={cn('h-4 w-4', config.iconColor)} />
                  <span className={cn('text-xs font-medium', config.color)}>
                    {config.label}
                  </span>
                </div>
                <div className={cn('text-2xl font-bold', config.color)}>
                  {count}
                </div>
              </div>
            );
          })}
        </div>

        {/* 整体健康度 */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">整体风水健康度</span>
            <span className="text-sm font-medium">
              {calculateOverallHealth(alerts)}%
            </span>
          </div>
          <Progress value={calculateOverallHealth(alerts)} className="h-3" />
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * 计算整体健康度
 */
function calculateOverallHealth(alerts: DiagnosticAlert[]): number {
  if (alerts.length === 0) return 100;

  const avgScore =
    alerts.reduce((sum, alert) => sum + alert.score, 0) / alerts.length;
  return Math.round(avgScore);
}
