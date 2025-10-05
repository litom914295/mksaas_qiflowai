'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Compass as CompassIcon, Navigation } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useCallback, useEffect, useState } from 'react';

export default function CompassToolPage() {
  const t = useTranslations('QiFlow');
  const [heading, setHeading] = useState<number>(0);
  const [accuracy, setAccuracy] = useState<number>(0);
  const [supported, setSupported] = useState<boolean>(true);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>(
    'prompt'
  );
  const [measuring, setMeasuring] = useState(false);
  const [calibrating, setCalibrating] = useState(false);

  useEffect(() => {
    // 检查浏览器是否支持设备方向 API
    if (!('DeviceOrientationEvent' in window)) {
      setSupported(false);
      return;
    }

    // 请求权限（iOS 13+）
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: string) => {
          setPermission(response as any);
          if (response === 'granted') {
            startMeasuring();
          }
        })
        .catch(console.error);
    } else {
      setPermission('granted');
    }
  }, []);

  const handleOrientation = useCallback((event: DeviceOrientationEvent) => {
    const alpha = event.alpha; // 0-360
    const beta = event.beta; // -180 to 180
    const gamma = event.gamma; // -90 to 90

    if (alpha !== null) {
      // 转换为罗盘方位（北为0度）
      let compassHeading = 360 - alpha;
      if (compassHeading >= 360) compassHeading -= 360;
      setHeading(compassHeading);

      // 简单的精度估算（基于设备倾斜程度）
      const tilt = Math.abs(beta || 0) + Math.abs(gamma || 0);
      const estimatedAccuracy = Math.max(1, Math.min(20, tilt / 2));
      setAccuracy(estimatedAccuracy);
    }
  }, []);

  function startMeasuring() {
    setMeasuring(true);
    window.addEventListener('deviceorientation', handleOrientation);
  }

  function stopMeasuring() {
    setMeasuring(false);
    window.removeEventListener('deviceorientation', handleOrientation);
  }

  function requestPermission() {
    if (
      typeof (DeviceOrientationEvent as any).requestPermission === 'function'
    ) {
      (DeviceOrientationEvent as any)
        .requestPermission()
        .then((response: string) => {
          setPermission(response as any);
          if (response === 'granted') {
            startMeasuring();
          }
        })
        .catch(console.error);
    } else {
      startMeasuring();
    }
  }

  function getDirection(degrees: number): string {
    const directions = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
    const index = Math.round(degrees / 45) % 8;
    return directions[index];
  }

  function getConfidenceLevel(): 'high' | 'medium' | 'low' {
    if (accuracy < 5) return 'high';
    if (accuracy < 15) return 'medium';
    return 'low';
  }

  if (!supported) {
    return (
      <div className="mx-auto max-w-2xl p-6">
        <Alert variant="destructive">
          <AlertDescription>
            您的设备不支持方向传感器
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl p-4 sm:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">风水罗盘</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          使用设备传感器测量当前方位，用于玄空风水分析
        </p>
      </div>

      {permission === 'denied' && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>
            需要您授权访问设备方向传感器
          </AlertDescription>
        </Alert>
      )}

      {permission === 'prompt' && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>需要授权</CardTitle>
            <CardDescription>需要访问设备方向传感器以测量方位</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={requestPermission}>授予权限</Button>
          </CardContent>
        </Card>
      )}

      {permission === 'granted' && (
        <>
          <Card className="mb-6">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>当前方位</CardTitle>
                <Badge variant={measuring ? 'default' : 'secondary'}>
                  {measuring ? '测量中' : '已停止'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              {/* 罗盘可视化 */}
              <div className="relative mx-auto mb-6 h-64 w-64">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className="relative h-56 w-56 rounded-full border-8 border-primary/20 bg-gradient-to-br from-background to-muted transition-transform duration-300"
                    style={{ transform: `rotate(${-heading}deg)` }}
                  >
                    <Navigation className="absolute left-1/2 top-4 h-8 w-8 -translate-x-1/2 text-red-500" />
                    <div className="absolute left-1/2 top-0 h-full w-0.5 bg-primary/30" />
                    <div className="absolute left-0 top-1/2 h-0.5 w-full bg-primary/30" />
                  </div>
                </div>
                <CompassIcon className="absolute left-1/2 top-1/2 h-12 w-12 -translate-x-1/2 -translate-y-1/2 text-primary" />
              </div>

              {/* 数据显示 */}
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <span className="text-sm text-muted-foreground">方位</span>
                  <span className="text-xl font-bold">
                    {getDirection(heading)}
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <span className="text-sm text-muted-foreground">度数</span>
                  <span className="font-mono text-xl font-bold">
                    {heading.toFixed(1)}°
                  </span>
                </div>
                <div className="flex items-center justify-between rounded-lg border bg-card p-3">
                  <span className="text-sm text-muted-foreground">精度</span>
                  <Badge
                    variant={
                      getConfidenceLevel() === 'high'
                        ? 'default'
                        : getConfidenceLevel() === 'medium'
                          ? 'secondary'
                          : 'destructive'
                    }
                  >
                    {getConfidenceLevel() === 'high' && '高'}
                    {getConfidenceLevel() === 'medium' && '中'}
                    {getConfidenceLevel() === 'low' && '低'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-3">
            {!measuring ? (
              <Button onClick={startMeasuring} className="flex-1">
                开始测量
              </Button>
            ) : (
              <Button
                onClick={stopMeasuring}
                variant="destructive"
                className="flex-1"
              >
                停止测量
              </Button>
            )}
            <Button
              onClick={() => setCalibrating(!calibrating)}
              variant="outline"
              className="flex-1"
            >
              {calibrating ? '停止校准' : '校准罗盘'}
            </Button>
          </div>

          {calibrating && (
            <Alert className="mt-6">
              <AlertDescription>
                <p className="font-medium mb-2">校准步骤：</p>
                <ol className="list-decimal list-inside space-y-1 text-sm">
                  <li>将设备平放在水平面上</li>
                  <li>缓慢旋转设备 360 度</li>
                  <li>重复旋转 2-3 次</li>
                  <li>完成后点击"停止校准"</li>
                </ol>
              </AlertDescription>
            </Alert>
          )}

          {accuracy > 15 && (
            <Alert variant="destructive" className="mt-6">
              <AlertDescription>
                检测到磁场干扰，请远离金属物体和电子设备
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}
