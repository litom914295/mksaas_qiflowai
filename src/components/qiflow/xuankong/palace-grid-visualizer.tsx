'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Coins,
  BookOpen,
  Heart,
  AlertTriangle,
  Star,
  Users,
  Calendar,
  Info,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// 宫位类型
export type Palace = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

// 关键位置类型
export type KeyPositionType = 
  | 'wealth'      // 财位
  | 'wenchang'    // 文昌位
  | 'peach'       // 桃花位
  | 'illness'     // 病位
  | 'wuhuang'     // 五黄位
  | 'nobleman';   // 贵人位

// 时间维度
export type TimeDimension = 'annual' | 'monthly' | 'personal';

// 关键位置数据
export interface KeyPosition {
  type: KeyPositionType;
  palaces: Palace[];
  timeDimension: TimeDimension;
  strength: 'strong' | 'medium' | 'weak';
  description: string;
  remedySuggestions?: string[];
}

// 宫位详情
export interface PalaceDetail {
  palace: Palace;
  direction: string;
  mountainStar?: number;
  facingStar?: number;
  timeStar?: number;
  keyPositions: KeyPositionType[];
  isAuspicious: boolean;
  score: number;
}

// 位置配置
const POSITION_CONFIG = {
  wealth: {
    label: '财位',
    icon: Coins,
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-50',
    borderColor: 'border-yellow-300',
    badge: 'bg-yellow-100 text-yellow-800',
  },
  wenchang: {
    label: '文昌位',
    icon: BookOpen,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    borderColor: 'border-purple-300',
    badge: 'bg-purple-100 text-purple-800',
  },
  peach: {
    label: '桃花位',
    icon: Heart,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-300',
    badge: 'bg-pink-100 text-pink-800',
  },
  illness: {
    label: '病位',
    icon: AlertTriangle,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    borderColor: 'border-gray-300',
    badge: 'bg-gray-100 text-gray-800',
  },
  wuhuang: {
    label: '五黄位',
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-300',
    badge: 'bg-red-100 text-red-800',
  },
  nobleman: {
    label: '贵人位',
    icon: Users,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    borderColor: 'border-blue-300',
    badge: 'bg-blue-100 text-blue-800',
  },
};

// 方位标签
const DIRECTION_LABELS: Record<Palace, string> = {
  1: '正北 (坎)',
  2: '西南 (坤)',
  3: '正东 (震)',
  4: '东南 (巽)',
  5: '中宫',
  6: '西北 (乾)',
  7: '正西 (兑)',
  8: '东北 (艮)',
  9: '正南 (离)',
};

interface PalaceGridVisualizerProps {
  palaceDetails: PalaceDetail[];
  keyPositions: KeyPosition[];
  currentYear?: number;
  currentMonth?: number;
  onPalaceClick?: (palace: Palace) => void;
  onRemedyClick?: (palace: Palace) => void;
  className?: string;
}

export function PalaceGridVisualizer({
  palaceDetails,
  keyPositions,
  currentYear = new Date().getFullYear(),
  currentMonth = new Date().getMonth() + 1,
  onPalaceClick,
  onRemedyClick,
  className,
}: PalaceGridVisualizerProps) {
  const [selectedTimeDimension, setSelectedTimeDimension] = useState<TimeDimension>('annual');
  const [selectedPositionType, setSelectedPositionType] = useState<KeyPositionType | 'all'>('all');
  const [selectedPalace, setSelectedPalace] = useState<Palace | null>(null);

  // 筛选关键位置
  const filteredPositions = keyPositions.filter(pos => {
    if (selectedTimeDimension !== 'personal' && pos.timeDimension !== selectedTimeDimension) {
      return false;
    }
    if (selectedPositionType !== 'all' && pos.type !== selectedPositionType) {
      return false;
    }
    return true;
  });

  // 获取宫位的关键位置
  const getPalacePositions = (palace: Palace): KeyPositionType[] => {
    const positions: KeyPositionType[] = [];
    filteredPositions.forEach(pos => {
      if (pos.palaces.includes(palace)) {
        positions.push(pos.type);
      }
    });
    return positions;
  };

  // 获取宫位详情
  const getPalaceDetail = (palace: Palace): PalaceDetail | undefined => {
    return palaceDetails.find(p => p.palace === palace);
  };

  // 渲染宫位单元格
  const renderPalaceCell = (palace: Palace) => {
    const detail = getPalaceDetail(palace);
    const positions = getPalacePositions(palace);
    const isSelected = selectedPalace === palace;

    if (!detail) return null;

    return (
      <button
        key={palace}
        onClick={() => {
          setSelectedPalace(palace);
          onPalaceClick?.(palace);
        }}
        className={cn(
          'relative p-4 border-2 rounded-lg transition-all duration-300',
          'hover:shadow-lg hover:scale-105 cursor-pointer',
          'flex flex-col items-center justify-center gap-2',
          'min-h-[140px]',
          isSelected ? 'ring-2 ring-primary ring-offset-2' : '',
          detail.isAuspicious ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'
        )}
      >
        {/* 宫位号和方位 */}
        <div className="text-center">
          <span className="text-2xl font-bold text-primary">{palace}</span>
          <p className="text-xs text-muted-foreground mt-1">
            {DIRECTION_LABELS[palace]}
          </p>
        </div>

        {/* 星曜 */}
        {(detail.mountainStar || detail.facingStar) && (
          <div className="flex items-center gap-2 text-xs">
            {detail.mountainStar && (
              <span className="px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded">
                山{detail.mountainStar}
              </span>
            )}
            {detail.facingStar && (
              <span className="px-1.5 py-0.5 bg-purple-100 text-purple-800 rounded">
                向{detail.facingStar}
              </span>
            )}
          </div>
        )}

        {/* 关键位置标记 */}
        {positions.length > 0 && (
          <div className="flex flex-wrap gap-1 justify-center">
            {positions.map(posType => {
              const config = POSITION_CONFIG[posType];
              const Icon = config.icon;
              return (
                <div
                  key={posType}
                  className={cn('p-1 rounded', config.bgColor)}
                  title={config.label}
                >
                  <Icon className={cn('h-3 w-3', config.color)} />
                </div>
              );
            })}
          </div>
        )}

        {/* 评分 */}
        <div className="absolute top-2 right-2">
          <Badge variant={detail.score >= 70 ? 'default' : 'secondary'} className="text-xs">
            {detail.score}
          </Badge>
        </div>

        {/* 选中指示器 */}
        {isSelected && (
          <div className="absolute -top-1 -right-1">
            <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
          </div>
        )}
      </button>
    );
  };

  // 选中宫位的详情
  const selectedDetail = selectedPalace ? getPalaceDetail(selectedPalace) : null;

  return (
    <div className={cn('space-y-6', className)}>
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-xl flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                九宫格位置标注
              </CardTitle>
              <CardDescription>
                可视化展示风水关键位置分布
              </CardDescription>
            </div>
          </div>

          {/* 筛选器 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            {/* 时间维度 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">时间维度</label>
              <Select value={selectedTimeDimension} onValueChange={(v) => setSelectedTimeDimension(v as TimeDimension)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="annual">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>流年 ({currentYear}年)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="monthly">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      <span>流月 ({currentMonth}月)</span>
                    </div>
                  </SelectItem>
                  <SelectItem value="personal">
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4" />
                      <span>本命位</span>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 位置类型 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">位置类型</label>
              <Select value={selectedPositionType} onValueChange={(v) => setSelectedPositionType(v as KeyPositionType | 'all')}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">全部位置</SelectItem>
                  {Object.entries(POSITION_CONFIG).map(([key, config]) => {
                    const Icon = config.icon;
                    return (
                      <SelectItem key={key} value={key}>
                        <div className="flex items-center gap-2">
                          <Icon className={cn('h-4 w-4', config.color)} />
                          <span>{config.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {/* 图例 */}
            <div className="space-y-2">
              <label className="text-sm font-medium">图例</label>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="bg-green-50 border-green-200">
                  吉位
                </Badge>
                <Badge variant="outline" className="bg-red-50 border-red-200">
                  凶位
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* 九宫格 */}
          <div className="grid grid-cols-3 gap-3 mb-6">
            {/* 排列顺序: 4 9 2 / 3 5 7 / 8 1 6 (洛书顺序) */}
            {[4, 9, 2, 3, 5, 7, 8, 1, 6].map(palace => renderPalaceCell(palace as Palace))}
          </div>

          {/* 关键位置统计 */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {Object.entries(POSITION_CONFIG).map(([key, config]) => {
              const Icon = config.icon;
              const count = filteredPositions.filter(p => p.type === key).length;
              
              return (
                <div key={key} className={cn('p-3 rounded-lg border', config.bgColor, config.borderColor)}>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={cn('h-4 w-4', config.color)} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </div>
                  <p className="text-2xl font-bold">{count}</p>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* 选中宫位详情 */}
      {selectedDetail && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5" />
              {selectedPalace}宫详情 - {DIRECTION_LABELS[selectedPalace!]}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="info">基本信息</TabsTrigger>
                <TabsTrigger value="positions">关键位置</TabsTrigger>
                <TabsTrigger value="remedy">化解方案</TabsTrigger>
              </TabsList>

              {/* 基本信息 */}
              <TabsContent value="info" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">吉凶性质</p>
                    <Badge variant={selectedDetail.isAuspicious ? 'default' : 'destructive'}>
                      {selectedDetail.isAuspicious ? '吉位' : '凶位'}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">综合评分</p>
                    <p className="text-2xl font-bold">{selectedDetail.score}</p>
                  </div>
                </div>

                {selectedDetail.mountainStar && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">山星</p>
                    <Badge className="bg-blue-100 text-blue-800">{selectedDetail.mountainStar}</Badge>
                  </div>
                )}

                {selectedDetail.facingStar && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">向星</p>
                    <Badge className="bg-purple-100 text-purple-800">{selectedDetail.facingStar}</Badge>
                  </div>
                )}
              </TabsContent>

              {/* 关键位置 */}
              <TabsContent value="positions" className="space-y-3">
                {selectedDetail.keyPositions.length > 0 ? (
                  selectedDetail.keyPositions.map(posType => {
                    const config = POSITION_CONFIG[posType];
                    const Icon = config.icon;
                    const position = filteredPositions.find(p => 
                      p.type === posType && p.palaces.includes(selectedPalace!)
                    );

                    return (
                      <div key={posType} className={cn('p-4 rounded-lg border', config.bgColor, config.borderColor)}>
                        <div className="flex items-start gap-3">
                          <Icon className={cn('h-5 w-5 mt-0.5', config.color)} />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">{config.label}</span>
                              {position && (
                                <Badge variant="outline" className="text-xs">
                                  {position.strength === 'strong' ? '强' : position.strength === 'medium' ? '中' : '弱'}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {position?.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    此宫位暂无特殊关键位置
                  </p>
                )}
              </TabsContent>

              {/* 化解方案 */}
              <TabsContent value="remedy" className="space-y-3">
                {selectedDetail.keyPositions.some(p => ['illness', 'wuhuang'].includes(p)) ? (
                  <div className="space-y-3">
                    {filteredPositions
                      .filter(pos => 
                        pos.palaces.includes(selectedPalace!) && 
                        pos.remedySuggestions && 
                        pos.remedySuggestions.length > 0
                      )
                      .map((pos, index) => (
                        <div key={index} className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="font-medium text-sm mb-2 flex items-center gap-2">
                            <Sparkles className="h-4 w-4 text-blue-600" />
                            {POSITION_CONFIG[pos.type].label}化解建议
                          </p>
                          <ul className="space-y-1 text-sm text-muted-foreground">
                            {pos.remedySuggestions!.map((suggestion, i) => (
                              <li key={i}>• {suggestion}</li>
                            ))}
                          </ul>
                        </div>
                      ))
                    }
                    <Button 
                      className="w-full" 
                      onClick={() => onRemedyClick?.(selectedPalace!)}
                    >
                      查看详细化解方案
                    </Button>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <CheckCircle2 className="h-12 w-12 text-green-600 mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      此宫位无需化解，保持现状即可
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}