'use client';

import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FlyingStarPlate, Palace } from '@/lib/qiflow/xuankong/types';
import { cn } from '@/lib/utils';
import {
  Activity,
  AlertTriangle,
  BookOpen,
  Briefcase,
  DollarSign,
  Gem,
  GraduationCap,
  Heart,
  HeartHandshake,
  Home,
  Lightbulb,
  Shield,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from 'lucide-react';

interface KeyPositionsAnalysisProps {
  plate: FlyingStarPlate;
  period: number;
  facing?: { degrees: number };
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

// 根据实战经验判断各类重要位置
function analyzeKeyPositions(plate: FlyingStarPlate, period: number) {
  const positions = {
    财位: [] as Array<{
      position: number;
      type: string;
      strength: number;
      description: string;
    }>,
    文昌位: [] as Array<{
      position: number;
      type: string;
      strength: number;
      description: string;
    }>,
    桃花位: [] as Array<{
      position: number;
      type: string;
      strength: number;
      description: string;
    }>,
    病位: [] as Array<{
      position: number;
      type: string;
      strength: number;
      description: string;
    }>,
    五黄位: [] as Array<{
      position: number;
      type: string;
      strength: number;
      description: string;
    }>,
    贵人位: [] as Array<{
      position: number;
      type: string;
      strength: number;
      description: string;
    }>,
  };

  plate.forEach((palace) => {
    // 1. 财位分析（八白当运财星）
    if (palace.yun === 8 || palace.shan === 8 || palace.xiang === 8) {
      let strength = 0;
      let description = '';

      if (palace.yun === 8) {
        strength += 40;
        description = '运星八白，正财大旺';
      }
      if (palace.shan === 8) {
        strength += 30;
        description += (description ? '；' : '') + '山星八白，财源稳固';
      }
      if (palace.xiang === 8) {
        strength += 30;
        description += (description ? '；' : '') + '向星八白，财气流通';
      }

      // 六白偏财
      if (palace.yun === 6 || palace.shan === 6 || palace.xiang === 6) {
        strength += 20;
        description += '；六白武曲同宫，偏财运佳';
      }

      // 一白同宫加分
      if (palace.yun === 1 || palace.shan === 1 || palace.xiang === 1) {
        strength += 15;
        description += '；一白水星助旺，财源广进';
      }

      positions.财位.push({
        position: palace.position,
        type: strength >= 70 ? '主财位' : '副财位',
        strength,
        description,
      });
    }

    // 2. 文昌位分析（四绿文昌星）
    if (palace.yun === 4 || palace.shan === 4 || palace.xiang === 4) {
      let strength = 0;
      let description = '';

      if (palace.yun === 4) {
        strength += 40;
        description = '运星四绿，文昌正位';
      }
      if (palace.shan === 4 || palace.xiang === 4) {
        strength += 30;
        description += (description ? '；' : '') + '四绿飞临，利学业事业';
      }

      // 一白同宫大吉（一四同宫准发科名）
      if (palace.yun === 1 || palace.shan === 1 || palace.xiang === 1) {
        strength += 30;
        description += '；一四同宫，科甲联芳';
      }

      // 六白同宫也吉
      if (palace.yun === 6 || palace.shan === 6 || palace.xiang === 6) {
        strength += 20;
        description += '；六白辅助，功名显达';
      }

      positions.文昌位.push({
        position: palace.position,
        type: strength >= 60 ? '正文昌' : '副文昌',
        strength,
        description,
      });
    }

    // 3. 桃花位分析（一白贪狼星）
    if (palace.yun === 1 || palace.shan === 1 || palace.xiang === 1) {
      let strength = 0;
      let description = '';

      if (palace.yun === 1) {
        strength += 40;
        description = '运星一白，桃花正位';
      }
      if (palace.shan === 1 || palace.xiang === 1) {
        strength += 30;
        description += (description ? '；' : '') + '一白贪狼，异性缘佳';
      }

      // 九紫同宫更旺（一九合十，婚姻美满）
      if (palace.yun === 9 || palace.shan === 9 || palace.xiang === 9) {
        strength += 30;
        description += '；九紫同宫，喜事临门';
      }

      // 四绿同宫也吉
      if (palace.yun === 4 || palace.shan === 4 || palace.xiang === 4) {
        strength += 20;
        description += '；四绿相会，人缘极佳';
      }

      positions.桃花位.push({
        position: palace.position,
        type: strength >= 60 ? '正桃花' : '偏桃花',
        strength,
        description,
      });
    }

    // 4. 病位分析（二黑病符星）
    if (palace.yun === 2 || palace.shan === 2 || palace.xiang === 2) {
      let strength = 0;
      let description = '';

      if (palace.yun === 2) {
        strength += 40;
        description = '运星二黑，病符主位';
      }
      if (palace.shan === 2 || palace.xiang === 2) {
        strength += 30;
        description += (description ? '；' : '') + '二黑巨门，健康欠佳';
      }

      // 五黄同宫更凶（二五交加必损主）
      if (palace.yun === 5 || palace.shan === 5 || palace.xiang === 5) {
        strength += 40;
        description += '；二五交加，大凶勿居！';
      }

      positions.病位.push({
        position: palace.position,
        type: strength >= 70 ? '重病位' : '轻病位',
        strength,
        description,
      });
    }

    // 5. 五黄位分析（五黄廉贞星）
    if (palace.yun === 5 || palace.shan === 5 || palace.xiang === 5) {
      let strength = 0;
      let description = '';

      if (palace.yun === 5) {
        strength += 50;
        description = '运星五黄，大煞方位';
      }
      if (palace.shan === 5) {
        strength += 25;
        description += (description ? '；' : '') + '山星五黄，宅运不稳';
      }
      if (palace.xiang === 5) {
        strength += 25;
        description += (description ? '；' : '') + '向星五黄，财运受阻';
      }

      // 二黑同宫更凶
      if (palace.yun === 2 || palace.shan === 2 || palace.xiang === 2) {
        strength += 30;
        description += '；二五交加，极凶慎防！';
      }

      positions.五黄位.push({
        position: palace.position,
        type: strength >= 75 ? '五黄大煞' : '五黄煞',
        strength,
        description,
      });
    }

    // 6. 贵人位分析（六白、八白、九紫）
    if (palace.yun === 6 || palace.shan === 6 || palace.xiang === 6) {
      let strength = 0;
      let description = '六白武曲，贵人方位';

      if (palace.yun === 6) strength += 40;
      if (palace.shan === 6 || palace.xiang === 6) strength += 30;

      // 一白同宫更吉
      if (palace.yun === 1 || palace.shan === 1 || palace.xiang === 1) {
        strength += 20;
        description += '；一六同宫，贵人扶持';
      }

      positions.贵人位.push({
        position: palace.position,
        type: '贵人位',
        strength,
        description,
      });
    }

    // 九紫贵人
    if (palace.yun === 9 || palace.shan === 9 || palace.xiang === 9) {
      let strength = 0;
      const description = '九紫右弼，喜庆贵人';

      if (palace.yun === 9) strength += 35;
      if (palace.shan === 9 || palace.xiang === 9) strength += 25;

      positions.贵人位.push({
        position: palace.position,
        type: '喜贵位',
        strength,
        description,
      });
    }
  });

  // 排序各位置（按强度降序）
  Object.keys(positions).forEach((key) => {
    positions[key as keyof typeof positions].sort(
      (a, b) => b.strength - a.strength
    );
  });

  return positions;
}

// 获取位置图标
function getPositionIcon(type: string) {
  switch (type) {
    case '财位':
      return DollarSign;
    case '文昌位':
      return BookOpen;
    case '桃花位':
      return Heart;
    case '病位':
      return Activity;
    case '五黄位':
      return AlertTriangle;
    case '贵人位':
      return Users;
    default:
      return Target;
  }
}

// 获取位置颜色
function getPositionColor(type: string, strength: number) {
  if (type === '病位' || type === '五黄位') {
    return strength >= 70
      ? 'text-red-600 bg-red-50'
      : 'text-orange-600 bg-orange-50';
  }

  return strength >= 70
    ? 'text-green-600 bg-green-50'
    : strength >= 50
      ? 'text-blue-600 bg-blue-50'
      : 'text-gray-600 bg-gray-50';
}

// 布局建议
function getLayoutSuggestions(
  positionType: string,
  strength: number
): string[] {
  const suggestions: Record<string, string[]> = {
    主财位: [
      '摆放聚宝盆、金元宝或发财树',
      '设置收银台、保险箱或财务办公室',
      '保持明亮通风，忌暗淡潮湿',
      '可摆放流水摆件，水流向内',
      '避免摆放垃圾桶或杂物',
    ],
    副财位: [
      '摆放绿色植物如发财树、富贵竹',
      '放置水晶球或紫晶洞',
      '保持整洁，定期清理',
      '可作为次要财务区域使用',
    ],
    正文昌: [
      '设置书房、学习区域',
      '摆放文昌塔或毛笔架',
      '挂四支富贵竹或文竹',
      '保持安静整洁的学习环境',
      '儿童房设在此处利学业',
    ],
    副文昌: [
      '可作为阅读角或办公区',
      '摆放书架或文房四宝',
      '挂励志字画或名人像',
    ],
    正桃花: [
      '未婚者卧室设此最佳',
      '摆放鲜花（忌假花）',
      '放置成双成对的装饰品',
      '使用粉色或浅紫色装饰',
      '保持温馨浪漫氛围',
    ],
    偏桃花: [
      '可作为会客厅或社交空间',
      '摆放圆形或心形装饰',
      '避免尖锐或破损物品',
    ],
    重病位: [
      '绝对避免作为卧室或厨房',
      '摆放铜葫芦或六帝钱化解',
      '可放置铜器或金属物品',
      '保持通风，避免潮湿阴暗',
      '定期清理，不堆放杂物',
    ],
    轻病位: ['避免老人或病人居住', '摆放健康植物如芦荟', '保持空气流通'],
    五黄大煞: [
      '必须化解！摆放铜铃或风铃',
      '放置六帝钱或五帝钱',
      '避免动土装修或钻墙',
      '不宜作为主要活动区域',
      '可用作储藏室（保持安静）',
    ],
    五黄煞: ['摆放金属物品化解', '避免红色装饰', '减少此区域活动'],
    贵人位: [
      '设置客厅或接待室',
      '摆放贵人像或福禄寿',
      '保持明亮大方的环境',
      '可作为主人房或办公室',
    ],
    喜贵位: ['适合举办喜庆活动', '摆放吉祥装饰品', '使用暖色调装饰'],
  };

  const key =
    strength >= 70 ? positionType : positionType.replace('位', '') + '位';

  return (
    suggestions[positionType] ||
    suggestions[key] || ['保持整洁干净', '确保光线充足', '定期通风换气']
  );
}

export function KeyPositionsAnalysis({
  plate,
  period,
  facing,
  className,
}: KeyPositionsAnalysisProps) {
  const positions = analyzeKeyPositions(plate, period);

  // 统计吉凶位数量
  const stats = {
    吉位:
      positions.财位.length +
      positions.文昌位.length +
      positions.桃花位.length +
      positions.贵人位.length,
    凶位: positions.病位.length + positions.五黄位.length,
    主要吉位:
      positions.财位.filter((p) => p.strength >= 70).length +
      positions.文昌位.filter((p) => p.strength >= 60).length +
      positions.桃花位.filter((p) => p.strength >= 60).length,
    主要凶位:
      positions.病位.filter((p) => p.strength >= 70).length +
      positions.五黄位.filter((p) => p.strength >= 75).length,
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="w-5 h-5" />
          关键位置分析
        </CardTitle>
        <CardDescription>识别住宅中的吉凶方位，助您趋吉避凶</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 统计概览 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {stats.吉位}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              吉位总数
            </div>
          </div>
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <div className="text-2xl font-bold text-red-600">{stats.凶位}</div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              凶位总数
            </div>
          </div>
          <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {stats.主要吉位}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              主要吉位
            </div>
          </div>
          <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
            <div className="text-2xl font-bold text-orange-600">
              {stats.主要凶位}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              需化解位
            </div>
          </div>
        </div>

        {/* 位置详情标签页 */}
        <Tabs defaultValue="财位" className="w-full">
          <TabsList className="grid grid-cols-3 lg:grid-cols-6 w-full">
            <TabsTrigger value="财位" className="text-xs">
              <DollarSign className="w-3 h-3 mr-1" />
              财位
            </TabsTrigger>
            <TabsTrigger value="文昌位" className="text-xs">
              <BookOpen className="w-3 h-3 mr-1" />
              文昌
            </TabsTrigger>
            <TabsTrigger value="桃花位" className="text-xs">
              <Heart className="w-3 h-3 mr-1" />
              桃花
            </TabsTrigger>
            <TabsTrigger value="贵人位" className="text-xs">
              <Users className="w-3 h-3 mr-1" />
              贵人
            </TabsTrigger>
            <TabsTrigger value="病位" className="text-xs">
              <Activity className="w-3 h-3 mr-1" />
              病位
            </TabsTrigger>
            <TabsTrigger value="五黄位" className="text-xs">
              <AlertTriangle className="w-3 h-3 mr-1" />
              五黄
            </TabsTrigger>
          </TabsList>

          {Object.entries(positions).map(([posType, posList]) => (
            <TabsContent
              key={posType}
              value={posType}
              className="space-y-4 mt-4"
            >
              {posList.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  未发现{posType}
                </div>
              ) : (
                posList.map((pos, index) => {
                  const Icon = getPositionIcon(posType);
                  const colorClass = getPositionColor(posType, pos.strength);
                  const suggestions = getLayoutSuggestions(
                    pos.type,
                    pos.strength
                  );

                  return (
                    <Card
                      key={index}
                      className={cn(
                        'border-l-4',
                        posType === '病位' || posType === '五黄位'
                          ? pos.strength >= 70
                            ? 'border-l-red-500'
                            : 'border-l-orange-500'
                          : pos.strength >= 70
                            ? 'border-l-green-500'
                            : pos.strength >= 50
                              ? 'border-l-blue-500'
                              : 'border-l-gray-500'
                      )}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn('p-2 rounded-lg', colorClass)}>
                              <Icon className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="font-semibold">
                                  {DIRECTION_NAMES[pos.position]}
                                </h4>
                                <Badge
                                  variant={
                                    pos.strength >= 70
                                      ? 'default'
                                      : pos.strength >= 50
                                        ? 'secondary'
                                        : 'outline'
                                  }
                                >
                                  {pos.type}
                                </Badge>
                                <Badge variant="outline" className="ml-auto">
                                  强度: {pos.strength}%
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                                {pos.description}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div>
                            <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
                              <Lightbulb className="w-4 h-4" />
                              布局建议
                            </h5>
                            <ul className="space-y-1">
                              {suggestions.map((sug, idx) => (
                                <li
                                  key={idx}
                                  className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2"
                                >
                                  <span className="text-green-500 mt-0.5">
                                    •
                                  </span>
                                  <span>{sug}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </TabsContent>
          ))}
        </Tabs>

        {/* 使用提醒 */}
        <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <div className="flex items-start gap-3">
            <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm space-y-1">
              <p className="font-medium text-blue-900 dark:text-blue-100">
                风水化解提醒
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                1. 吉位宜动，凶位宜静；吉位多用，凶位少用
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                2. 五黄二黑等凶位必须化解，可用金属物品或铜器制化
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                3. 财位忌压、忌水、忌暗；文昌忌吵、忌乱、忌污
              </p>
              <p className="text-blue-700 dark:text-blue-300">
                4. 根据个人命理和实际情况调整，切勿生搬硬套
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
