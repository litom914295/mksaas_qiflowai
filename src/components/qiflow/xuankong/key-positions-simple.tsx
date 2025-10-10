'use client';

import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import {
  AlertTriangle,
  BookOpen,
  DollarSign,
  Heart,
  Target,
  Users,
} from 'lucide-react';

interface SimpleKeyPositionsProps {
  plate?: any;
  period?: number;
  className?: string;
}

// 方位名称映射
const DIRECTION_NAMES: Record<number, string> = {
  1: '北方',
  2: '西南',
  3: '东方',
  4: '东南',
  5: '中宫',
  6: '西北',
  7: '西方',
  8: '东北',
  9: '南方',
};

export function SimpleKeyPositions({
  plate,
  period = 8,
  className,
}: SimpleKeyPositionsProps) {
  // 简单的位置分析逻辑
  const analyzePositions = () => {
    const positions = {
      财位: [] as any[],
      文昌位: [] as any[],
      桃花位: [] as any[],
      凶位: [] as any[],
    };

    // 如果没有数据，使用默认分析
    const defaultPlate = plate || [
      { position: 1, yun: 1, shan: 6, xiang: 8 },
      { position: 2, yun: 2, shan: 7, xiang: 9 },
      { position: 3, yun: 3, shan: 8, xiang: 1 },
      { position: 4, yun: 4, shan: 9, xiang: 2 },
      { position: 5, yun: 5, shan: 1, xiang: 3 },
      { position: 6, yun: 6, shan: 2, xiang: 4 },
      { position: 7, yun: 7, shan: 3, xiang: 5 },
      { position: 8, yun: 8, shan: 4, xiang: 6 },
      { position: 9, yun: 9, shan: 5, xiang: 7 },
    ];

    defaultPlate.forEach((palace: any) => {
      // 财位分析（八白星）
      if (palace.yun === 8 || palace.shan === 8 || palace.xiang === 8) {
        positions.财位.push({
          position: palace.position,
          direction: DIRECTION_NAMES[palace.position],
          strength: palace.yun === 8 ? '强' : '中',
          description: '八白财星所在，利于财运',
        });
      }

      // 文昌位分析（四绿星）
      if (palace.yun === 4 || palace.shan === 4 || palace.xiang === 4) {
        positions.文昌位.push({
          position: palace.position,
          direction: DIRECTION_NAMES[palace.position],
          strength: palace.yun === 4 ? '强' : '中',
          description: '四绿文昌，利于学业',
        });
      }

      // 桃花位分析（一白星）
      if (palace.yun === 1 || palace.shan === 1 || palace.xiang === 1) {
        positions.桃花位.push({
          position: palace.position,
          direction: DIRECTION_NAMES[palace.position],
          strength: palace.yun === 1 ? '强' : '中',
          description: '一白桃花，利于人缘',
        });
      }

      // 凶位分析（五黄、二黑）
      if (palace.yun === 5 || palace.shan === 5 || palace.xiang === 5) {
        positions.凶位.push({
          position: palace.position,
          direction: DIRECTION_NAMES[palace.position],
          type: '五黄煞',
          description: '五黄大煞，需要化解',
        });
      }
      if (palace.yun === 2 || palace.shan === 2 || palace.xiang === 2) {
        positions.凶位.push({
          position: palace.position,
          direction: DIRECTION_NAMES[palace.position],
          type: '二黑病符',
          description: '二黑病符，注意健康',
        });
      }
    });

    return positions;
  };

  const positions = analyzePositions();

  // 位置卡片组件
  const PositionCard = ({ title, items, icon: Icon, color }: any) => {
    if (items.length === 0) return null;

    return (
      <Card className={cn('border-l-4', color)}>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Icon className="w-4 h-4" />
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {items.map((item: any, idx: number) => (
            <div
              key={idx}
              className="flex items-center justify-between text-sm"
            >
              <div className="flex items-center gap-2">
                <Badge variant="outline">{item.direction}</Badge>
                {item.strength && (
                  <Badge
                    variant={item.strength === '强' ? 'default' : 'secondary'}
                  >
                    {item.strength}
                  </Badge>
                )}
                {item.type && <Badge variant="destructive">{item.type}</Badge>}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                {item.description}
              </span>
            </div>
          ))}
        </CardContent>
      </Card>
    );
  };

  return (
    <div className={cn('space-y-4', className)}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <PositionCard
          title="财位"
          items={positions.财位}
          icon={DollarSign}
          color="border-l-green-500"
        />

        <PositionCard
          title="文昌位"
          items={positions.文昌位}
          icon={BookOpen}
          color="border-l-blue-500"
        />

        <PositionCard
          title="桃花位"
          items={positions.桃花位}
          icon={Heart}
          color="border-l-pink-500"
        />

        <PositionCard
          title="凶位警示"
          items={positions.凶位}
          icon={AlertTriangle}
          color="border-l-red-500"
        />
      </div>

      {/* 使用建议 */}
      <Card className="bg-blue-50 dark:bg-blue-900/20">
        <CardHeader className="pb-3">
          <CardTitle className="text-base">💡 风水布局建议</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>
            • <strong>财位</strong>：摆放聚宝盆、发财树，保持明亮通风
          </p>
          <p>
            • <strong>文昌位</strong>：设置书房，摆放文昌塔或四支富贵竹
          </p>
          <p>
            • <strong>桃花位</strong>：摆放鲜花，保持整洁美观
          </p>
          <p>
            • <strong>凶位</strong>：五黄位放铜铃化解，二黑位放铜葫芦
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
