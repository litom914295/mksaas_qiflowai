'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { 
  AlertTriangle, 
  AlertCircle, 
  Info, 
  CheckCircle2, 
  Sparkles,
  TrendingUp,
  ArrowRight,
  Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 预警级别类型
export type WarningLevel = 'danger' | 'warning' | 'caution' | 'good' | 'excellent';

// 预警配置
const WARNING_LEVELS = {
  danger: {
    label: '危险',
    range: '0-20分',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    progressColor: 'bg-red-600',
    alertVariant: 'destructive' as const,
    description: '风水格局存在严重问题，需要立即采取措施',
    actions: ['立即查看化解方案', '联系专业风水师'],
  },
  warning: {
    label: '警告',
    range: '21-40分',
    icon: AlertCircle,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    progressColor: 'bg-orange-600',
    alertVariant: 'default' as const,
    description: '风水格局需要重点关注，建议及时调整',
    actions: ['查看专业方案', '了解改善方法'],
  },
  caution: {
    label: '提示',
    range: '41-60分',
    icon: Info,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-200',
    progressColor: 'bg-yellow-600',
    alertVariant: 'default' as const,
    description: '风水格局基本正常，有部分改善空间',
    actions: ['查看优化建议', '学习风水知识'],
  },
  good: {
    label: '良好',
    range: '61-80分',
    icon: CheckCircle2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-200',
    progressColor: 'bg-blue-600',
    alertVariant: 'default' as const,
    description: '风水格局良好，可以考虑进一步优化',
    actions: ['查看高级方案', '定期检查维护'],
  },
  excellent: {
    label: '优秀',
    range: '81-100分',
    icon: Sparkles,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    borderColor: 'border-green-200',
    progressColor: 'bg-green-600',
    alertVariant: 'default' as const,
    description: '风水格局优秀，保持当前状态即可',
    actions: ['查看维护指南', '分享成功经验'],
  },
};

// 根据分数获取级别
export function getWarningLevel(score: number): WarningLevel {
  if (score >= 81) return 'excellent';
  if (score >= 61) return 'good';
  if (score >= 41) return 'caution';
  if (score >= 21) return 'warning';
  return 'danger';
}

interface WarningLevelIndicatorProps {
  score: number;
  title?: string;
  description?: string;
  showActions?: boolean;
  showDetails?: boolean;
  showProgress?: boolean;
  onActionClick?: (action: string) => void;
  className?: string;
}

export function WarningLevelIndicator({
  score,
  title = '风水评级',
  description,
  showActions = true,
  showDetails = true,
  showProgress = true,
  onActionClick,
  className,
}: WarningLevelIndicatorProps) {
  const level = getWarningLevel(score);
  const config = WARNING_LEVELS[level];
  const Icon = config.icon;

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>

      <CardContent className="space-y-4">
        {/* 主评级卡片 */}
        <div className={cn('p-6 rounded-lg border-2 transition-all', config.borderColor, config.bgColor)}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className={cn('p-3 rounded-full', config.bgColor)}>
                <Icon className={cn('h-6 w-6', config.color)} />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">当前评级</p>
                <p className={cn('text-2xl font-bold', config.color)}>
                  {config.label}
                </p>
              </div>
            </div>
            
            <div className="text-right">
              <p className="text-sm text-muted-foreground">总分</p>
              <p className={cn('text-3xl font-bold', config.color)}>
                {score.toFixed(1)}
              </p>
            </div>
          </div>

          {showProgress && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>评分范围: {config.range}</span>
                <span>{score.toFixed(1)}/100</span>
              </div>
              <Progress value={score} className="h-3" />
            </div>
          )}
        </div>

        {/* 详细说明 */}
        {showDetails && (
          <Alert variant={config.alertVariant} className={cn('border-2', config.borderColor)}>
            <Icon className="h-4 w-4" />
            <AlertTitle>{config.label}级别说明</AlertTitle>
            <AlertDescription>{config.description}</AlertDescription>
          </Alert>
        )}

        {/* 五级对照表 */}
        <div className="space-y-2">
          <p className="text-sm font-medium mb-3">评级标准</p>
          {Object.entries(WARNING_LEVELS).map(([key, levelConfig]) => {
            const LevelIcon = levelConfig.icon;
            const isCurrentLevel = key === level;
            
            return (
              <div
                key={key}
                className={cn(
                  'flex items-center justify-between p-3 rounded-lg border transition-all',
                  isCurrentLevel 
                    ? cn('border-2', levelConfig.borderColor, levelConfig.bgColor) 
                    : 'border-border bg-background opacity-50'
                )}
              >
                <div className="flex items-center gap-3">
                  <LevelIcon className={cn('h-4 w-4', levelConfig.color)} />
                  <div>
                    <span className={cn('font-medium', levelConfig.color)}>
                      {levelConfig.label}
                    </span>
                    <span className="text-xs text-muted-foreground ml-2">
                      ({levelConfig.range})
                    </span>
                  </div>
                </div>
                {isCurrentLevel && (
                  <Badge variant="secondary" className="text-xs">
                    当前级别
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* 改善趋势 */}
        {level !== 'excellent' && (
          <div className="p-4 bg-blue-50 dark:bg-blue-950/20 rounded-lg border border-blue-200">
            <div className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-sm text-blue-900 dark:text-blue-100 mb-1">
                  提升到下一级别
                </p>
                <p className="text-xs text-blue-800 dark:text-blue-200">
                  {level === 'danger' && `还需提升 ${(21 - score).toFixed(1)} 分即可达到"警告"级别`}
                  {level === 'warning' && `还需提升 ${(41 - score).toFixed(1)} 分即可达到"提示"级别`}
                  {level === 'caution' && `还需提升 ${(61 - score).toFixed(1)} 分即可达到"良好"级别`}
                  {level === 'good' && `还需提升 ${(81 - score).toFixed(1)} 分即可达到"优秀"级别`}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* 行动建议 */}
        {showActions && config.actions.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4 text-muted-foreground" />
              <p className="text-sm font-medium">推荐行动</p>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {config.actions.map((action, index) => (
                <Button
                  key={index}
                  variant={index === 0 ? 'default' : 'outline'}
                  className="w-full justify-between"
                  onClick={() => onActionClick?.(action)}
                >
                  <span>{action}</span>
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* 额外提示 */}
        {level === 'danger' && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>紧急提醒</AlertTitle>
            <AlertDescription>
              当前风水格局得分过低，强烈建议尽快咨询专业风水师，避免影响居住环境和运势。
            </AlertDescription>
          </Alert>
        )}

        {level === 'excellent' && (
          <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertTitle className="text-green-900 dark:text-green-100">
              恭喜！
            </AlertTitle>
            <AlertDescription className="text-green-800 dark:text-green-200">
              您的风水格局已达到优秀级别，继续保持当前布局，定期检查维护即可。
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  );
}

// 简化版预警指示器（用于嵌入其他组件）
interface CompactWarningIndicatorProps {
  score: number;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function CompactWarningIndicator({
  score,
  showLabel = true,
  size = 'md',
  className,
}: CompactWarningIndicatorProps) {
  const level = getWarningLevel(score);
  const config = WARNING_LEVELS[level];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const badgeSizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5',
  };

  return (
    <div className={cn('inline-flex items-center gap-2', className)}>
      <Icon className={cn(sizeClasses[size], config.color)} />
      {showLabel && (
        <Badge 
          variant="outline" 
          className={cn(badgeSizeClasses[size], config.color, config.borderColor)}
        >
          {config.label} {score.toFixed(1)}
        </Badge>
      )}
    </div>
  );
}