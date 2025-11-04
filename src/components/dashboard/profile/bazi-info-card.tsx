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
import { cn } from '@/lib/utils';
import {
  CalendarDaysIcon,
  ClockIcon,
  EditIcon,
  MapPinIcon,
  PlusIcon,
  StarIcon,
} from 'lucide-react';
import { useState } from 'react';

interface BaziInfoCardProps {
  className?: string;
}

/**
 * Bazi (Eight Characters) information card component
 */
export function BaziInfoCard({ className }: BaziInfoCardProps) {
  // Mock data - in real app this would come from user profile
  const [baziInfo, setBaziInfo] = useState({
    birthDate: '1990-05-15',
    birthTime: '14:30',
    birthPlace: '北京市',
    lunarDate: '庚午年 辛巳月 甲子日',
    solarTerms: '立夏',
    tianGan: ['甲', '乙', '丙', '丁'],
    diZhi: ['子', '丑', '寅', '卯'],
    wuXing: {
      jin: 2,
      mu: 3,
      shui: 1,
      huo: 2,
      tu: 0,
    },
    lastUpdated: '2024-01-15',
  });

  const [isEditing, setIsEditing] = useState(false);
  const hasBaziInfo = !!baziInfo.birthDate;

  const wuXingNames = {
    jin: '金',
    mu: '木',
    shui: '水',
    huo: '火',
    tu: '土',
  };

  const getWuXingColor = (element: string) => {
    const colors: Record<string, string> = {
      jin: 'bg-gray-100 text-gray-800',
      mu: 'bg-green-100 text-green-800',
      shui: 'bg-blue-100 text-blue-800',
      huo: 'bg-red-100 text-red-800',
      tu: 'bg-yellow-100 text-yellow-800',
    };
    return colors[element] || 'bg-gray-100 text-gray-800';
  };

  const handleEdit = () => {
    setIsEditing(true);
    // In real app, this would open a modal or navigate to edit page
  };

  const handleAdd = () => {
    // In real app, this would open a form to add bazi information
    setIsEditing(true);
  };

  return (
    <Card className={cn('w-full', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg font-semibold flex items-center gap-2">
              <StarIcon className="h-5 w-5 text-primary" />
              八字信息
            </CardTitle>
            <CardDescription>您的生辰八字和五行分析</CardDescription>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={hasBaziInfo ? handleEdit : handleAdd}
          >
            {hasBaziInfo ? (
              <>
                <EditIcon className="h-3 w-3 mr-1" />
                编辑
              </>
            ) : (
              <>
                <PlusIcon className="h-3 w-3 mr-1" />
                添加
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasBaziInfo ? (
          <>
            {/* Basic Birth Information */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDaysIcon className="h-4 w-4" />
                  出生日期
                </div>
                <div className="font-medium">
                  {new Date(baziInfo.birthDate).toLocaleDateString('zh-CN')}
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <ClockIcon className="h-4 w-4" />
                  出生时间
                </div>
                <div className="font-medium">{baziInfo.birthTime}</div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MapPinIcon className="h-4 w-4" />
                  出生地点
                </div>
                <div className="font-medium">{baziInfo.birthPlace}</div>
              </div>
            </div>

            {/* Lunar Date and Solar Terms */}
            <div className="bg-primary/5 rounded-lg p-4 space-y-3">
              <h4 className="font-medium text-primary">农历信息</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">农历日期</div>
                  <div className="font-medium text-lg">
                    {baziInfo.lunarDate}
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="text-sm text-muted-foreground">节气</div>
                  <Badge variant="secondary" className="w-fit">
                    {baziInfo.solarTerms}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Heavenly Stems and Earthly Branches */}
            <div className="space-y-4">
              <h4 className="font-medium">天干地支</h4>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">天干</div>
                  <div className="flex gap-2">
                    {baziInfo.tianGan.map((gan, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm px-3 py-1"
                      >
                        {gan}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">地支</div>
                  <div className="flex gap-2">
                    {baziInfo.diZhi.map((zhi, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-sm px-3 py-1"
                      >
                        {zhi}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Five Elements Analysis */}
            <div className="space-y-4">
              <h4 className="font-medium">五行分析</h4>
              <div className="grid grid-cols-5 gap-2">
                {Object.entries(baziInfo.wuXing).map(([element, count]) => (
                  <div
                    key={element}
                    className="text-center p-3 rounded-lg border"
                  >
                    <div
                      className={cn(
                        'w-8 h-8 mx-auto mb-2 rounded-full flex items-center justify-center text-sm font-medium',
                        getWuXingColor(element)
                      )}
                    >
                      {wuXingNames[element as keyof typeof wuXingNames]}
                    </div>
                    <div className="text-sm text-muted-foreground">{count}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Five Elements Chart */}
            <div className="bg-muted/30 rounded-lg p-4 space-y-3">
              <h4 className="text-sm font-medium">五行平衡</h4>
              <div className="space-y-2">
                {Object.entries(baziInfo.wuXing).map(([element, count]) => (
                  <div key={element} className="flex items-center gap-3">
                    <div className="w-8 text-sm">
                      {wuXingNames[element as keyof typeof wuXingNames]}
                    </div>
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="h-full bg-primary rounded-full transition-all"
                        style={{ width: `${(count / 5) * 100}%` }}
                      />
                    </div>
                    <div className="w-6 text-sm text-muted-foreground">
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Last Updated */}
            <div className="text-xs text-muted-foreground">
              最后更新: {baziInfo.lastUpdated}
            </div>
          </>
        ) : (
          /* Empty State */
          <div className="text-center py-12 space-y-4">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center">
              <StarIcon className="h-8 w-8 text-muted-foreground" />
            </div>
            <div className="space-y-2">
              <h3 className="font-medium">还未设置八字信息</h3>
              <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                添加您的出生日期、时间和地点，获取专业的八字分析
              </p>
            </div>
            <Button onClick={handleAdd} className="mt-4">
              <PlusIcon className="h-4 w-4 mr-2" />
              添加八字信息
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
