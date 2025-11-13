'use client';

import { CompassDial } from '@/components/compass/compass-dial';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import {
  InMemoryDeclinationCache,
  WmmNoaaProvider,
} from '@/lib/compass/declination';
import {
  AlertTriangle,
  Compass as CompassIcon,
  Navigation,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useTheme } from 'next-themes';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

export type CompassPickerDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  value?: number; // 初始角度（0-360）
  onConfirm: (deg: number) => void;
  onChange?: (
    deg: number,
    meta?: { northRef: 'magnetic' | 'true'; declination: number }
  ) => void; // 实时回传
  snapStep?: number; // 吸附步进，默认 1°
};

function normalizeDeg(d: number) {
  return ((d % 360) + 360) % 360;
}

function bearingToLabel(d: number) {
  const dirs = ['北', '东北', '东', '东南', '南', '西南', '西', '西北'];
  const i = Math.round(normalizeDeg(d) / 45) % 8;
  return dirs[i];
}

export function CompassPickerDialog({
  open,
  onOpenChange,
  value = 0,
  onConfirm,
  onChange,
  snapStep = 1,
}: CompassPickerDialogProps) {
  const t = useTranslations('compass');
  const { resolvedTheme } = useTheme();
  const [measuring, setMeasuring] = useState(false);
  const [status, setStatus] = useState<
    'empty' | 'pending' | 'active' | 'limited' | 'timeout' | 'error'
  >('empty');
  const [deg, setDeg] = useState<number>(normalizeDeg(value));
  const [accuracy, setAccuracy] = useState<number>(0);
  const [northMode, setNorthMode] = useState<'magnetic' | 'true'>('magnetic');
  const [declination, setDeclination] = useState<number>(0);
  const [locating, setLocating] = useState(false);
  const [locErr, setLocErr] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const draggingRef = useRef<boolean>(false);
  const offsetRef = useRef<number>(0);
  const rawMagRef = useRef<number | null>(null);
  const rawTrueRef = useRef<number | null>(null);
  const declProviderRef = useRef(
    new WmmNoaaProvider({ cache: new InMemoryDeclinationCache() })
  );

  const requestPermissionAndStart = useCallback(async () => {
    setStatus('pending');
    try {
      if (
        typeof window === 'undefined' ||
        !('DeviceOrientationEvent' in window)
      ) {
        setStatus('limited');
        return;
      }
      const DOE: any = DeviceOrientationEvent as any;
      if (typeof DOE?.requestPermission === 'function') {
        const res = await DOE.requestPermission();
        if (res !== 'granted') {
          setStatus('limited');
          return;
        }
      }
      startMeasuring();
    } catch {
      setStatus('error');
    }
  }, []);

  const onOrientation = useCallback(
    (event: DeviceOrientationEvent & { webkitCompassHeading?: number }) => {
      // iOS 优先 webkitCompassHeading（已校正为真北）
      // 保留原始读数（真北或磁北）
      if (typeof event.webkitCompassHeading === 'number') {
        rawTrueRef.current = normalizeDeg(360 - event.webkitCompassHeading);
      } else if (typeof event.alpha === 'number') {
        rawMagRef.current = normalizeDeg(360 - event.alpha);
      }
      const computeDisplay = () => {
        const m = rawMagRef.current;
        const tr = rawTrueRef.current;
        if (northMode === 'true') {
          const val =
            tr != null ? tr : m != null ? normalizeDeg(m + declination) : null;
          return val;
        }
        const val =
          m != null ? m : tr != null ? normalizeDeg(tr - declination) : null;
        return val;
      };
      const disp = computeDisplay();
      if (disp != null) {
        const snapped = Math.round(normalizeDeg(disp) / snapStep) * snapStep;
        const nd = normalizeDeg(snapped);
        setDeg(nd);
        onChange?.(nd, { northRef: northMode, declination });
        setStatus('active');
        const tilt = Math.abs(event.beta || 0) + Math.abs(event.gamma || 0);
        setAccuracy(Math.max(1, Math.min(20, tilt / 2)));
        if (timerRef.current) {
          window.clearTimeout(timerRef.current);
          timerRef.current = null;
        }
      }
    },
    [snapStep]
  );

  const stopMeasuring = useCallback(() => {
    setMeasuring(false);
    window.removeEventListener('deviceorientation', onOrientation as any);
  }, [onOrientation]);

  const startMeasuring = useCallback(() => {
    setMeasuring(true);
    setStatus('pending');
    window.addEventListener('deviceorientation', onOrientation as any, {
      passive: true,
    });
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      if (status === 'pending') setStatus('timeout');
    }, 3000) as unknown as number;
  }, [onOrientation, status]);

  useEffect(() => {
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      window.removeEventListener('deviceorientation', onOrientation as any);
    };
  }, [onOrientation]);

  // 手势拖拽旋转（固定十字，盘面旋转）
  const angleFromPointer = (clientX: number, clientY: number) => {
    const el = containerRef.current;
    if (!el) return deg;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = clientX - cx;
    const dy = clientY - cy;
    const radians = Math.atan2(dx, -dy); // 以北为0°，顺时针递增
    return normalizeDeg((radians * 180) / Math.PI);
  };

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    draggingRef.current = true;
    offsetRef.current = normalizeDeg(
      angleFromPointer(e.clientX, e.clientY) - deg
    );
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return;
    const a = angleFromPointer(e.clientX, e.clientY);
    const nd = normalizeDeg(a - offsetRef.current);
    setManual(nd);
  };

  // 定位并获取磁偏角
  const computeDeclination = async () => {
    try {
      setLocating(true);
      setLocErr(null);
      await new Promise<void>((resolve, reject) => {
        if (!('geolocation' in navigator)) return reject(new Error('no geo'));
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            const { latitude, longitude } = pos.coords;
            (async () => {
              try {
                const d = await declProviderRef.current.getDeclinationDeg(
                  latitude,
                  longitude,
                  new Date()
                );
                setDeclination(d);
                // declination 变更后将当前显示角度与元数据回传
                onChange?.(deg, { northRef: northMode, declination: d });
              } catch (e: any) {
                setLocErr(String(e?.message || e));
              } finally {
                setLocating(false);
              }
            })();
            resolve();
          },
          (err) => {
            setLocErr(err?.message || 'loc failed');
            setLocating(false);
            reject(err);
          },
          { enableHighAccuracy: true, maximumAge: 60000, timeout: 8000 }
        );
      });
    } catch (e) {
      setLocErr('loc failed');
      setLocating(false);
    }
  };
  const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    try {
      (e.currentTarget as HTMLElement).releasePointerCapture(e.pointerId);
    } catch {}
    draggingRef.current = false;
  };

  // 手动调整
  const setManual = (d: number) => {
    const snapped = Math.round(normalizeDeg(d) / snapStep) * snapStep;
    const nd = normalizeDeg(snapped);
    setDeg(nd);
    onChange?.(nd, { northRef: northMode, declination });
    if (status !== 'active') setStatus('limited');
  };

  const confidence: '高' | '中' | '低' = useMemo(() => {
    if (accuracy < 5) return '高';
    if (accuracy < 15) return '中';
    return '低';
  }, [accuracy]);

  const themeVars = useMemo(() => {
    const dark = resolvedTheme === 'dark';
    return {
      ['--luopan-bg-inner' as any]: dark
        ? 'rgba(17,24,39,0.9)'
        : 'rgba(255,255,255,0.92)',
      ['--luopan-bg-outer' as any]: dark
        ? 'rgba(31,41,55,1)'
        : 'rgba(240,240,240,1)',
      ['--luopan-border' as any]: dark
        ? 'rgba(255,255,255,0.08)'
        : 'rgba(0,0,0,0.08)',
      ['--luopan-ring' as any]: dark
        ? 'rgba(255,255,255,0.2)'
        : 'rgba(0,0,0,0.15)',
      ['--luopan-tick-major' as any]: '#ef4444',
      ['--luopan-tick-mid' as any]: dark ? '#38bdf8' : '#0ea5e9',
      ['--luopan-tick-minor' as any]: dark
        ? 'rgba(255,255,255,0.35)'
        : 'rgba(0,0,0,0.35)',
      ['--luopan-text' as any]: dark ? '#e5e7eb' : '#111827',
      ['--luopan-cross' as any]: '#ef4444',
      ['--luopan-axis' as any]: '#38bdf8',
    } as React.CSSProperties;
  }, [resolvedTheme]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-xl"
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setManual(deg - snapStep);
          if (e.key === 'ArrowRight') setManual(deg + snapStep);
        }}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CompassIcon className="h-5 w-5" /> {t('pickerTitle') || '罗盘定位'}
          </DialogTitle>
          <DialogDescription>
            {t('pickerDesc') ||
              '将手机平放并缓慢旋转，或手动微调角度。完成后点击“使用此朝向”。'}
          </DialogDescription>
        </DialogHeader>

        {/* 可视化罗盘 */}
        <div
          ref={containerRef}
          className="relative mx-auto mb-4"
          style={{ width: 256, height: 256, touchAction: 'none', ...themeVars }}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
        >
          {/* 24山罗盘盘面（随 angle 旋转） */}
          <CompassDial angle={deg} size={256} />
          {/* 顶部北向指示图标（作为装饰） */}
          <Navigation className="pointer-events-none absolute left-1/2 top-1 h-6 w-6 -translate-x-1/2 text-red-500 opacity-80" />
        </div>

        {/* 参考基准 */}
        <div className="mb-2 flex items-center gap-3">
          <span className="text-xs text-muted-foreground">
            {t('reference') || '参考基准'}
          </span>
          <Select
            value={northMode}
            onValueChange={(v) => setNorthMode(v as any)}
          >
            <SelectTrigger className="h-8 w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="magnetic">
                {t('magnetic_north') || '磁北'}
              </SelectItem>
              <SelectItem value="true">{t('true_north') || '真北'}</SelectItem>
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            size="sm"
            onClick={computeDeclination}
            disabled={locating}
          >
            {locating
              ? t('locating') || '定位中…'
              : t('get_declination') || '获取磁偏角'}
          </Button>
          <span className="text-xs text-muted-foreground">
            {t('magnetic_declination') || '磁偏角'}: {declination.toFixed(1)}°
          </span>
        </div>

        {/* 当前读数 */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className="text-xs text-muted-foreground">
              {t('bearingLabel') || '方位'}
            </div>
            <div className="text-lg font-semibold">{bearingToLabel(deg)}</div>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className="text-xs text-muted-foreground">
              {t('degreeLabel') || '度数'}
            </div>
            <div className="font-mono text-lg font-bold">
              {Math.round(deg)}°
            </div>
          </div>
          <div className="rounded-lg border bg-card p-3 text-center">
            <div className="text-xs text-muted-foreground">
              {t('accuracy') || '精度'}
            </div>
            <Badge
              variant={
                confidence === '高'
                  ? 'default'
                  : confidence === '中'
                    ? 'secondary'
                    : 'destructive'
              }
            >
              {confidence}
            </Badge>
          </div>
        </div>

        {/* 控制区 */}
        <div className="space-y-3">
          <div className="flex gap-2">
            {!measuring ? (
              <Button onClick={requestPermissionAndStart} className="flex-1">
                {t('start_measurement') || '开始测量'}
              </Button>
            ) : (
              <Button
                variant="destructive"
                onClick={stopMeasuring}
                className="flex-1"
              >
                {t('stop_measurement') || '停止测量'}
              </Button>
            )}
            <Button variant="outline" onClick={() => setManual(deg - snapStep)}>
              -{snapStep}°
            </Button>
            <Button variant="outline" onClick={() => setManual(deg + snapStep)}>
              +{snapStep}°
            </Button>
          </div>

          {/* 手动输入/滑块 */}
          <div className="flex items-center gap-3">
            <Label className="whitespace-nowrap text-sm text-muted-foreground">
              {t('manual') || '手动'}
            </Label>
            <Input
              type="number"
              value={Math.round(deg)}
              min={0}
              max={360}
              onChange={(e) => setManual(Number(e.target.value || 0))}
              className="w-24"
            />
            <Slider
              value={[deg]}
              min={0}
              max={360}
              step={snapStep}
              onValueChange={(v) => setManual(v[0] ?? deg)}
              className="flex-1"
            />
          </div>
        </div>

        {/* 四态提示与免责声明 */}
        <div className="mt-3 text-xs text-muted-foreground space-y-1">
          {status === 'limited' && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>
                {t('limitedTip') || '设备不支持或权限被拒，已进入手动模式。'}
              </span>
            </div>
          )}
          {status === 'timeout' && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              <span>
                {t('timeoutTip') ||
                  '未能获取传感器数据，请尝试重新授权或使用手动模式。'}
              </span>
            </div>
          )}
          {status === 'error' && (
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-500" />
              <span>{t('errorTip') || '传感器异常，请重试或改用手动。'}</span>
            </div>
          )}
          <div>• 若权限被拒或设备不支持，请使用手动模式设置角度。</div>
          <div>• 风水仅供参考，请理性看待。</div>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {t('cancel') || '取消'}
          </Button>
          <Button onClick={() => onConfirm(Math.round(normalizeDeg(deg)))}>
            {t('use_this_bearing') || '使用此朝向'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
