'use client';

import CompassThemeSelector from '@/components/compass/compass-theme-selector';
import FengShuiCompass from '@/components/compass/feng-shui-compass';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { CompassThemeKey } from '@/lib/compass/themes';
import { ArrowLeft, Check, Compass as CompassIcon, Info } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

/**
 * 独立的罗盘定位选择器页面
 * 用于在guest-analysis流程中选择房屋朝向
 */
export function CompassPicker() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // 从URL获取返回路径和当前角度
  const returnUrl = searchParams.get('returnUrl') || '/guest-analysis';
  const initialDirection = Number.parseFloat(
    searchParams.get('direction') || '0'
  );

  const [currentDirection, setCurrentDirection] =
    useState<number>(initialDirection);
  const [selectedTheme, setSelectedTheme] =
    useState<CompassThemeKey>('compass');
  const [isConfirming, setIsConfirming] = useState(false);

  // 方向名称辅助函数
  const getDirectionName = (dir: number): string => {
    const normalized = ((dir % 360) + 360) % 360;
    const directions = [
      { min: 337.5, max: 22.5, name: '正北', icon: '↑' },
      { min: 22.5, max: 67.5, name: '东北', icon: '↗' },
      { min: 67.5, max: 112.5, name: '正东', icon: '→' },
      { min: 112.5, max: 157.5, name: '东南', icon: '↘' },
      { min: 157.5, max: 202.5, name: '正南', icon: '↓' },
      { min: 202.5, max: 247.5, name: '西南', icon: '↙' },
      { min: 247.5, max: 292.5, name: '正西', icon: '←' },
      { min: 292.5, max: 337.5, name: '西北', icon: '↖' },
    ];

    for (const d of directions) {
      if (d.min > d.max) {
        if (normalized >= d.min || normalized < d.max)
          return `${d.icon} ${d.name}`;
      } else {
        if (normalized >= d.min && normalized < d.max)
          return `${d.icon} ${d.name}`;
      }
    }
    return '↑ 正北';
  };

  // 五行属性判断
  const getElement = (dir: number): string => {
    const normalized = ((dir % 360) + 360) % 360;
    if (normalized >= 315 || normalized < 45) return '水';
    if (normalized >= 45 && normalized < 135) return '木';
    if (normalized >= 135 && normalized < 225) return '火';
    if (normalized >= 225 && normalized < 315) return '金';
    return '土';
  };

  // 处理罗盘旋转
  const handleDirectionChange = useCallback((direction: number) => {
    setCurrentDirection(direction);
  }, []);

  // 处理主题变化
  const handleThemeChange = useCallback((theme: CompassThemeKey) => {
    setSelectedTheme(theme);
  }, []);

  // 确认并返回
  const handleConfirm = useCallback(() => {
    setIsConfirming(true);

    // 构建返回URL，携带选中的方向
    const url = new URL(returnUrl, window.location.origin);
    url.searchParams.set('orientation', currentDirection.toFixed(1));
    url.searchParams.set('compassUsed', 'true');

    // 延迟跳转，给用户视觉反馈
    setTimeout(() => {
      router.push(url.pathname + url.search);
    }, 300);
  }, [currentDirection, returnUrl, router]);

  // 处理返回
  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const directionName = getDirectionName(currentDirection);
  const element = getElement(currentDirection);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* 头部导航 */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            返回
          </Button>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <CompassIcon className="w-6 h-6 text-purple-600" />
            罗盘定位
          </h1>
          <div className="w-20" />
        </div>

        {/* 使用说明 */}
        <Card className="bg-blue-50/50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-blue-900">
                <p className="font-medium mb-1">使用提示</p>
                <p className="text-blue-700">
                  1. 手持设备站在房屋大门口，面向屋外
                  <br />
                  2. 旋转罗盘或设备，让指针指向北方
                  <br />
                  3. 读取当前角度，确认后将自动填入表单
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 罗盘主体 */}
        <Card className="shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
            <CardTitle className="flex items-center justify-between">
              <span>实时方位测量</span>
              <CompassThemeSelector
                currentTheme={selectedTheme}
                onThemeChange={handleThemeChange}
              />
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex flex-col items-center space-y-6">
              {/* 罗盘显示 */}
              <div className="relative">
                <FengShuiCompass
                  onDirectionChange={handleDirectionChange}
                  theme={selectedTheme}
                  width={500}
                  height={500}
                  interactive={true}
                  showDetailedInfo={true}
                />
              </div>

              {/* 当前读数 */}
              <div className="w-full max-w-lg">
                <Card className="bg-gradient-to-br from-purple-50 to-blue-50">
                  <CardContent className="p-6">
                    <div className="grid grid-cols-3 gap-4 text-center">
                      <div>
                        <div className="text-4xl font-bold text-purple-600 mb-2">
                          {currentDirection.toFixed(1)}°
                        </div>
                        <div className="text-sm text-gray-600">测量角度</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-blue-600 mb-2">
                          {directionName}
                        </div>
                        <div className="text-sm text-gray-600">方位</div>
                      </div>
                      <div>
                        <div className="text-4xl font-bold text-green-600 mb-2">
                          {element}
                        </div>
                        <div className="text-sm text-gray-600">五行</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 确认按钮 */}
        <div className="flex justify-center gap-4 pb-8">
          <Button
            size="lg"
            onClick={handleConfirm}
            disabled={isConfirming}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-6 text-lg shadow-lg"
          >
            {isConfirming ? (
              <>
                <Check className="w-5 h-5 mr-2 animate-pulse" />
                确认中...
              </>
            ) : (
              <>
                <Check className="w-5 h-5 mr-2" />
                确认此方向并返回
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
