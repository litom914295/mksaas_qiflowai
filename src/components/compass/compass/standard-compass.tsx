'use client';

import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';

interface StandardCompassProps {
  width?: number;
  height?: number;
  onDirectionChange?: (direction: number) => void;
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

function normalizeAngle(angle: number): number {
  const value = angle % 360;
  return value < 0 ? value + 360 : value;
}

function getMountainName(angle: number): string {
  const index = Math.round(angle / 15) % 24;
  return MOUNTAIN_NAMES[index];
}

function getOppositeMountain(angle: number): string {
  const oppositeAngle = normalizeAngle(angle + 180);
  return getMountainName(oppositeAngle);
}

const StandardCompass: React.FC<StandardCompassProps> = ({
  width = 400,
  height = 400,
  onDirectionChange,
  interactive = true,
  enableAnimation = true,
  showDetailedInfo = true,
}) => {
  const [compassRotation, setCompassRotation] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<
    'unknown' | 'requesting' | 'granted' | 'denied'
  >('unknown');
  const compassRef = useRef<HTMLDivElement>(null);

  const handleOrientationChange = useCallback(
    (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        const alpha = normalizeAngle(event.alpha);
        setCompassRotation(alpha);
      }
    },
    []
  );

  const startOrientationTracking = useCallback(() => {
    if (!interactive) return;

    const handleOrientation = (event: DeviceOrientationEvent) => {
      if (event.alpha !== null) {
        const alpha = normalizeAngle(event.alpha);
        setCompassRotation(alpha);
      }
    };

    window.addEventListener('deviceorientation', handleOrientation);
    return () =>
      window.removeEventListener('deviceorientation', handleOrientation);
  }, [interactive]);

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
        }
      } else {
        startOrientationTracking();
        setPermissionStatus('granted');
      }
    } catch (error) {
      console.error('请求方向权限失败:', error);
      setPermissionStatus('denied');
    }
  }, [interactive, startOrientationTracking]);

  const handleManualRotation = useCallback(() => {
    setCompassRotation((prev) => normalizeAngle(prev + 90));
  }, []);

  useEffect(() => {
    if (onDirectionChange) {
      onDirectionChange(normalizeAngle(compassRotation));
    }
  }, [compassRotation, onDirectionChange]);

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

  const currentMountain = getMountainName(compassRotation);
  const oppositeMountain = getOppositeMountain(compassRotation);

  return (
    <div className="flex flex-col items-center">
      <div className="relative flex items-center justify-center">
        {/* 罗盘容器 - 固定不旋转 */}
        <div
          ref={compassRef}
          className="relative rounded-full border-4 border-gray-800 shadow-2xl"
          style={{
            width,
            height,
            background:
              'radial-gradient(circle, rgba(20,20,25,0.95), rgba(0,0,0,0.98))',
          }}
        >
          {/* 红色十字罗经线 - 固定在屏幕上不动，横线平行屏幕，竖线垂直屏幕 */}
          <div className="absolute inset-0 pointer-events-none">
            {/* 水平线 - 平行于屏幕 */}
            <div
              className="absolute w-full h-1 bg-red-600"
              style={{
                top: '50%',
                left: 0,
                transform: 'translateY(-50%)',
                boxShadow: '0 0 8px rgba(255,0,0,0.8)',
              }}
            />
            {/* 垂直线 - 垂直于屏幕 */}
            <div
              className="absolute w-1 h-full bg-red-600"
              style={{
                left: '50%',
                top: 0,
                transform: 'translateX(-50%)',
                boxShadow: '0 0 8px rgba(255,0,0,0.8)',
              }}
            />
            {/* 中心点 */}
            <div
              className="absolute w-4 h-4 bg-red-600 rounded-full"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 12px rgba(255,0,0,0.9)',
              }}
            />
          </div>

          {/* 罗盘刻度环 - 随指南针一起旋转 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: `rotate(${-compassRotation}deg)`, // 反向旋转，保持刻度相对固定
              transition: enableAnimation ? 'transform 0.3s ease-out' : 'none',
            }}
          >
            {/* 外圈刻度 */}
            {Array.from({ length: 24 }, (_, i) => {
              const angle = i * 15;
              const rad = (angle - 90) * (Math.PI / 180);
              const radius = Math.min(width, height) / 2 - 20;
              const x = width / 2 + radius * Math.cos(rad);
              const y = height / 2 + radius * Math.sin(rad);

              return (
                <div
                  key={i}
                  className="absolute text-white font-bold text-sm"
                  style={{
                    left: x,
                    top: y,
                    transform: 'translate(-50%, -50%)',
                    textShadow: '0 0 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {i * 15}°
                </div>
              );
            })}

            {/* 24山文字 */}
            {MOUNTAIN_NAMES.map((mountain, i) => {
              const angle = i * 15;
              const rad = (angle - 90) * (Math.PI / 180);
              const radius = Math.min(width, height) / 2 - 50;
              const x = width / 2 + radius * Math.cos(rad);
              const y = height / 2 + radius * Math.sin(rad);

              return (
                <div
                  key={mountain}
                  className="absolute text-yellow-300 font-bold text-lg"
                  style={{
                    left: x,
                    top: y,
                    transform: 'translate(-50%, -50%)',
                    textShadow: '0 0 6px rgba(0,0,0,0.9)',
                  }}
                >
                  {mountain}
                </div>
              );
            })}
          </div>

          {/* 指南针指针 - 固定指向正南方，不旋转 */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              transform: 'none', // 指南针不旋转，始终指向正南方
            }}
          >
            <div
              className="absolute"
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
              }}
            >
              {/* 指南针主体 - 指向正南方 */}
              <div
                className="absolute w-0 h-0"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, -50%)',
                  borderLeft: '8px solid transparent',
                  borderRight: '8px solid transparent',
                  borderBottom: '60px solid #ff0000',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                }}
              />
              {/* 指南针尾部 */}
              <div
                className="absolute w-0 h-0"
                style={{
                  left: '50%',
                  top: '50%',
                  transform: 'translate(-50%, 20px)',
                  borderLeft: '4px solid transparent',
                  borderRight: '4px solid transparent',
                  borderTop: '20px solid #ff0000',
                  filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.6))',
                }}
              />
            </div>
          </div>
        </div>
      </div>

      {showDetailedInfo && (
        <div className="mt-6 w-full max-w-xl space-y-4">
          <div className="flex flex-wrap justify-center gap-3">
            {interactive && (
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
                {ORIENTATION_LABEL_MAP[permissionStatus]}
              </button>
            )}

            <button
              onClick={handleManualRotation}
              className="px-3 py-2 bg-zinc-700 text-white rounded-lg hover:bg-zinc-800 transition-colors text-sm"
            >
              手动旋转 90°
            </button>
          </div>

          {/* 当前方向信息 */}
          <div className="text-center space-y-2">
            <div className="text-lg font-semibold text-gray-800">
              当前方位: {Math.round(compassRotation)}°
            </div>
            <div className="text-sm text-gray-600">
              坐山: {currentMountain} | 朝向: {oppositeMountain}
            </div>
            <div className="text-xs text-gray-500">
              {ORIENTATION_HELPER_MAP[permissionStatus]}
            </div>
            {permissionStatus === 'denied' && (
              <div className="text-xs text-orange-600">
                提示:
                在iOS设备上需要在Safari设置中开启&ldquo;运动与方向访问&rdquo;权限。
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default StandardCompass;
