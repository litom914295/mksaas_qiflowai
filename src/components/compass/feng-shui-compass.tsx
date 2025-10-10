'use client';

import {
  type CompassThemeKey,
  compassThemeKeys,
  compassThemes,
  defaultCompassTheme,
} from '@/lib/compass/themes';
import type React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

interface FengShuiCompassProps {
  width?: number;
  height?: number;
  onDirectionChange?: (direction: number) => void;
  theme?: CompassThemeKey;
  interactive?: boolean;
  enableAnimation?: boolean;
  showDetailedInfo?: boolean;
}

const MOUNTAIN_NAMES: readonly string[] = [
  '子',
  '癸',
  '丑',
  '艮',
  '寅',
  '甲',
  '卯',
  '乙',
  '辰',
  '巽',
  '巳',
  '丙',
  '午',
  '丁',
  '未',
  '坤',
  '申',
  '庚',
  '酉',
  '辛',
  '戌',
  '乾',
  '亥',
  '壬',
] as const;

const ORIENTATION_LABEL_MAP = {
  requesting: '正在请求方向权限...',
  granted: '方向传感器已启用',
  denied: '无法访问方向权限',
  unknown: '启用方向传感器',
} as const;

const ORIENTATION_HELPER_MAP = {
  granted: '已接入设备方向传感器，罗盘会随着设备移动实时更新。',
  denied: '尚未获得方向传感器权限，请检查浏览器设置或尝试手动旋转。',
  unknown: '尚未启用方向传感器，点击上方按钮尝试授权。',
  requesting: '正在请求设备方向权限，请在弹出的对话框中允许访问。',
} as const;

const POINTER_SHADOW = 'drop-shadow(0 6px 10px rgba(0,0,0,0.4))';

function normalizeAngle(angle: number): number {
  const value = angle % 360;
  return value < 0 ? value + 360 : value;
}

function getClosestDiff(from: number, to: number): number {
  const diff = normalizeAngle(to) - normalizeAngle(from);
  return ((diff + 540) % 360) - 180;
}

const FengShuiCompass: React.FC<FengShuiCompassProps> = ({
  width = 420,
  height = 420,
  onDirectionChange,
  theme = defaultCompassTheme,
  interactive = true,
  enableAnimation = true,
  showDetailedInfo = true,
}) => {
  const orientationHandlerRef = useRef<
    ((event: DeviceOrientationEvent) => void) | null
  >(null);

  const [compassRotation, setCompassRotation] = useState<number>(0);
  const [targetRotation, setTargetRotation] = useState<number>(0);
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [permissionStatus, setPermissionStatus] = useState<
    'unknown' | 'granted' | 'denied' | 'requesting'
  >('unknown');
  const [currentTheme, setCurrentTheme] = useState<CompassThemeKey>(theme);

  const themeKeys = useMemo(() => compassThemeKeys as CompassThemeKey[], []);
  const fallbackTheme: CompassThemeKey = defaultCompassTheme;

  useEffect(() => {
    const incomingTheme = (theme ?? fallbackTheme) as CompassThemeKey;
    const nextTheme = compassThemes[incomingTheme]
      ? incomingTheme
      : fallbackTheme;
    if (currentTheme !== nextTheme) {
      setCurrentTheme(nextTheme);
    }
  }, [theme, currentTheme, fallbackTheme]);

  const activeTheme: CompassThemeKey = compassThemes[currentTheme]
    ? currentTheme
    : fallbackTheme;
  const themeConfig = compassThemes[activeTheme];
  const pointerColor = themeConfig.line?.scaleHighlightColor ?? '#f87171';

  const orientationButtonLabel = ORIENTATION_LABEL_MAP[permissionStatus];
  const orientationHelperText = ORIENTATION_HELPER_MAP[permissionStatus];

  const themePreviewUrl = themeConfig.info.preview
    ? `/compass-themes/${themeConfig.info.preview}`
    : undefined;

  const backgroundLayers = themePreviewUrl
    ? [
        themeConfig.background ??
          'radial-gradient(circle, rgba(10,10,15,0.9), rgba(0,0,0,0.98))',
        `url(${themePreviewUrl})`,
      ]
    : [
        themeConfig.background ??
          'radial-gradient(circle, rgba(10,10,15,0.9), rgba(0,0,0,0.98))',
      ];

  const containerSize = Math.min(width, height);
  const center = containerSize / 2;
  const maxRadius = center - 36;
  const layerCount = themeConfig.data.length;
  const ringSpacing = Math.max(28, maxRadius / (layerCount + 1));

  const dialStyle: React.CSSProperties = {
    width: containerSize,
    height: containerSize,
    borderRadius: '50%',
    backgroundImage: backgroundLayers.join(', '),
    backgroundSize: themePreviewUrl ? 'cover' : '100% 100%',
    backgroundPosition: 'center',
    backgroundBlendMode: themePreviewUrl ? 'overlay' : undefined,
    border: `4px solid ${themeConfig.line?.borderColor ?? '#3f3f46'}`,
    boxShadow: isRotating
      ? '0 0 34px rgba(236,72,153,0.4), inset 0 0 22px rgba(255,255,255,0.08)'
      : '0 14px 36px rgba(0,0,0,0.45), inset 0 0 20px rgba(255,255,255,0.06)',
    transform: `rotate(${compassRotation}deg)`,
    transition: enableAnimation ? 'transform 0.25s ease-out' : undefined,
  };

  const pointerStyle: React.CSSProperties = {
    position: 'absolute',
    top: 18,
    left: '50%',
    transform: 'translateX(-50%)',
    width: 0,
    height: 0,
    borderLeft: '10px solid transparent',
    borderRight: '10px solid transparent',
    borderBottom: `115px solid ${pointerColor}`,
    filter: POINTER_SHADOW,
    pointerEvents: 'none',
  };

  const centerCapStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 26,
    height: 26,
    borderRadius: '50%',
    background: '#050505',
    border: `4px solid ${pointerColor}`,
    boxShadow: '0 0 12px rgba(255,255,255,0.28)',
    pointerEvents: 'none',
  };

  const cleanupOrientationListener = useCallback(() => {
    if (orientationHandlerRef.current) {
      window.removeEventListener(
        'deviceorientation',
        orientationHandlerRef.current
      );
      orientationHandlerRef.current = null;
    }
  }, []);

  const startOrientationTracking = useCallback(() => {
    if (!interactive) {
      return;
    }
    cleanupOrientationListener();
    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        const calibrated = normalizeAngle(
          -event.alpha + (themeConfig.rotate ?? 0)
        );
        setTargetRotation(calibrated);
      }
    };
    orientationHandlerRef.current = handleOrientation;
    window.addEventListener('deviceorientation', handleOrientation);
  }, [cleanupOrientationListener, interactive, themeConfig.rotate]);

  const requestOrientationPermission = useCallback(async () => {
    if (
      !interactive ||
      typeof window === 'undefined' ||
      typeof DeviceOrientationEvent === 'undefined'
    ) {
      return;
    }
    setPermissionStatus('requesting');
    try {
      const deviceEvent = DeviceOrientationEvent as any;
      if (typeof deviceEvent?.requestPermission === 'function') {
        const result = await deviceEvent.requestPermission();
        if (result === 'granted') {
          setPermissionStatus('granted');
          startOrientationTracking();
        } else {
          setPermissionStatus('denied');
          window.alert(
            '未能获取方向传感器权限，请检查系统与浏览器的隐私设置。'
          );
        }
      } else {
        startOrientationTracking();
        setPermissionStatus('granted');
      }
    } catch (error) {
      console.error('请求方向权限失败:', error);
      setPermissionStatus('denied');
      window.alert('请求方向传感器权限时发生错误，请稍后重试。');
    }
  }, [interactive, startOrientationTracking]);

  const handleManualRotation = useCallback(() => {
    setTargetRotation((prev) => normalizeAngle(prev + 90));
  }, []);

  const switchSkin = useCallback(() => {
    if (themeKeys.length === 0) return;
    const currentIndex = themeKeys.indexOf(activeTheme);
    const nextIndex = (currentIndex + 1) % themeKeys.length;
    setCurrentTheme(themeKeys[nextIndex]);
  }, [activeTheme, themeKeys]);

  useEffect(() => {
    if (!interactive || typeof window === 'undefined') {
      return;
    }

    // 检查 DeviceOrientationEvent 是否可用
    if (typeof DeviceOrientationEvent === 'undefined') {
      setPermissionStatus('denied');
      return;
    }

    const deviceEvent = DeviceOrientationEvent as any;
    if (typeof deviceEvent?.requestPermission !== 'function') {
      setPermissionStatus('granted');
      startOrientationTracking();
    }
  }, [interactive, startOrientationTracking]);

  useEffect(() => {
    if (!enableAnimation) {
      setCompassRotation(targetRotation);
      return;
    }

    let animationFrame: number;
    const animate = () => {
      setCompassRotation((prev) => {
        const diff = getClosestDiff(prev, targetRotation);
        const step = diff * 0.12;
        if (Math.abs(diff) < 0.1) {
          setIsRotating(false);
          return normalizeAngle(targetRotation);
        }
        setIsRotating(true);
        return normalizeAngle(prev + step);
      });
      animationFrame = requestAnimationFrame(animate);
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [targetRotation, enableAnimation]);

  useEffect(() => {
    if (onDirectionChange) {
      onDirectionChange(normalizeAngle(compassRotation));
    }
  }, [compassRotation, onDirectionChange]);

  useEffect(
    () => () => cleanupOrientationListener(),
    [cleanupOrientationListener]
  );

  const getSittingDirection = useCallback((angle: number) => {
    const index =
      Math.round(normalizeAngle(angle) / 15) % MOUNTAIN_NAMES.length;
    return MOUNTAIN_NAMES[index];
  }, []);

  const getFacingDirection = useCallback((angle: number) => {
    const index =
      Math.round(normalizeAngle(angle) / 15) % MOUNTAIN_NAMES.length;
    return MOUNTAIN_NAMES[(index + 12) % MOUNTAIN_NAMES.length];
  }, []);

  const orientationAvailable = permissionStatus === 'granted';

  const renderRing = (
    radius: number,
    key: string,
    borderColor: string,
    dash?: string
  ) => (
    <div
      key={`ring-${key}-${radius}`}
      style={{
        position: 'absolute',
        width: radius * 2,
        height: radius * 2,
        left: center - radius,
        top: center - radius,
        borderRadius: '50%',
        border: `1px ${dash ? 'dashed' : 'solid'} ${borderColor}`,
        opacity: 0.55,
        pointerEvents: 'none',
      }}
    />
  );

  const renderLayerTexts = () => {
    const elements: React.ReactNode[] = [];

    themeConfig.data.forEach((layer, layerIndex) => {
      const radius = maxRadius - layerIndex * ringSpacing;
      const isGroupLayer = Array.isArray(layer.data[0]);
      const baseFontSize = layer.fontSize ?? 16;
      const scaledFontSize = Math.max(
        10,
        Math.round(
          baseFontSize * (containerSize / themeConfig.compassSize.width)
        )
      );

      if (isGroupLayer) {
        const groups = layer.data as string[][];
        const groupCount = groups.length;
        groups.forEach((group, groupIndex) => {
          const startAngle = layer.startAngle ?? 0;
          const segmentAngle = 360 / groupCount;
          const baseAngle = startAngle + groupIndex * segmentAngle;
          group.forEach((text, subIndex) => {
            const angle = baseAngle + (subIndex - (group.length - 1) / 2) * 6;
            const rad = (angle - 90) * (Math.PI / 180);
            const textRadius =
              radius - subIndex * (ringSpacing / Math.max(group.length, 2));
            const x = center + textRadius * Math.cos(rad);
            const y = center + textRadius * Math.sin(rad);
            const colors = Array.isArray(layer.textColor)
              ? (layer.textColor as string[])
              : [layer.textColor ?? '#f8fafc'];
            const color = colors[subIndex] ?? colors[0] ?? '#f8fafc';

            elements.push(
              <span
                key={`layer-${layerIndex}-group-${groupIndex}-item-${subIndex}`}
                style={{
                  position: 'absolute',
                  left: x,
                  top: y,
                  transform: `translate(-50%, -50%) rotate(${layer.vertical ? angle : 0}deg)`,
                  transformOrigin: 'center center',
                  color,
                  fontSize: scaledFontSize,
                  letterSpacing: '0.08em',
                  fontWeight: layer.vertical ? 600 : 500,
                  pointerEvents: 'none',
                  whiteSpace: 'nowrap',
                }}
              >
                {text}
              </span>
            );
          });
        });
      } else {
        const items = layer.data as string[];
        const itemCount = items.length;
        const startAngle = layer.startAngle ?? 0;
        items.forEach((text, itemIndex) => {
          const angle = startAngle + itemIndex * (360 / itemCount);
          const rad = (angle - 90) * (Math.PI / 180);
          const x = center + radius * Math.cos(rad);
          const y = center + radius * Math.sin(rad);
          const color = Array.isArray(layer.textColor)
            ? (layer.textColor as string[])[
                itemIndex % (layer.textColor as string[]).length
              ]
            : ((layer.textColor as string) ?? '#f8fafc');

          elements.push(
            <span
              key={`layer-${layerIndex}-item-${itemIndex}`}
              style={{
                position: 'absolute',
                left: x,
                top: y,
                transform: `translate(-50%, -50%) rotate(${layer.vertical ? angle : 0}deg)`,
                transformOrigin: 'center center',
                color,
                fontSize: scaledFontSize,
                letterSpacing: '0.12em',
                fontWeight: layer.vertical ? 600 : 500,
                pointerEvents: 'none',
                whiteSpace: 'nowrap',
              }}
            >
              {text}
            </span>
          );
        });
      }
    });

    return elements;
  };

  return (
    <div className="flex flex-col items-center" data-testid="feng-shui-compass">
      <div
        className="relative flex items-center justify-center"
        data-testid="compass-container"
      >
        <div
          className="relative flex items-center justify-center"
          style={dialStyle}
        >
          {Array.from({ length: layerCount }).map((_, index) =>
            renderRing(
              maxRadius - index * ringSpacing,
              `${index}`,
              themeConfig.line?.scaleColor ?? '#52525b'
            )
          )}

          {renderLayerTexts()}
        </div>

        <div style={pointerStyle} />
        <div style={centerCapStyle} />
      </div>

      <div className="mt-6 w-full max-w-xl space-y-4">
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={requestOrientationPermission}
            disabled={permissionStatus === 'requesting'}
            className={`px-3 py-2 rounded-lg font-medium transition-colors text-sm ${
              permissionStatus === 'granted'
                ? 'bg-emerald-600 text-white'
                : permissionStatus === 'denied'
                  ? 'bg-rose-600 text-white'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {orientationButtonLabel}
          </button>

          <button
            onClick={handleManualRotation}
            className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm"
          >
            手动校准
          </button>

          <button
            onClick={switchSkin}
            className="px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
          >
            切换皮肤
          </button>
        </div>

        <div className="text-center space-y-2">
          <div
            className={`text-lg font-semibold transition-colors duration-300 ${
              isRotating ? 'text-rose-600' : 'text-zinc-900'
            }`}
          >
            当前方位：{Math.round(normalizeAngle(compassRotation))}°
            {isRotating && (
              <span className="ml-2 inline-block text-sm text-rose-500">
                旋转中...
              </span>
            )}
          </div>
          <div className="text-sm text-zinc-600">
            坐山：
            <span className="font-medium text-blue-600">
              {getSittingDirection(compassRotation)}
            </span>
            <span className="mx-2 text-zinc-400">│</span>
            朝向：
            <span className="font-medium text-emerald-600">
              {getFacingDirection(compassRotation)}
            </span>
          </div>
        </div>

        {showDetailedInfo && (
          <div className="text-center text-sm text-zinc-500 space-y-2">
            {interactive ? (
              <div className="flex items-center justify-center space-x-2">
                <span
                  className={`w-2 h-2 rounded-full ${
                    orientationAvailable
                      ? 'bg-emerald-500 animate-pulse'
                      : 'bg-amber-500'
                  }`}
                />
                <span>{orientationHelperText}</span>
              </div>
            ) : (
              <div className="text-zinc-500">
                当前罗盘处于只读模式，可使用“手动旋转”按钮调整角度。
              </div>
            )}
            <div className="text-xs text-zinc-400">
              提示：在 iOS 设备上需要在 Safari 设置中开启“运动与方向访问”权限。
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FengShuiCompass;
