'use client';

import { type CompassThemeKey } from '@/lib/compass/themes';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface SimpleCompassProps {
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

const SimpleCompass: React.FC<SimpleCompassProps> = ({
  width = 400,
  height = 400,
  onDirectionChange,
  theme = 'compass',
  interactive = true,
  enableAnimation = true,
  showDetailedInfo = true,
}) => {
  const [compassRotation, setCompassRotation] = useState(0);
  const [permissionStatus, setPermissionStatus] = useState<
    'unknown' | 'requesting' | 'granted' | 'denied'
  >('unknown');
  const compassRef = useRef<HTMLDivElement>(null);

  // 获取主题配置
  const themeConfigs = {
    compass: { preview: 'theme-compass-preview.png', name: '经典罗盘' },
    dark: { preview: 'theme-dark-preview.png', name: '暗夜主题' },
    simple: { preview: 'theme-polygon-preview.png', name: '简约主题' },
    polygon: { preview: 'theme-polygon-preview.png', name: '多边形主题' },
    crice: { preview: 'theme-crice.png', name: '圆规主题' },
  };
  const themeConfig = themeConfigs[theme as keyof typeof themeConfigs] || themeConfigs.compass;

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
    if (
      typeof window === 'undefined' ||
      typeof DeviceOrientationEvent === 'undefined'
    ) {
      return;
    }

    const deviceEvent = DeviceOrientationEvent as any;
    if (typeof deviceEvent?.requestPermission === 'function') {
      deviceEvent
        .requestPermission()
        .then((response: string) => {
          if (response === 'granted') {
            setPermissionStatus('granted');
            window.addEventListener(
              'deviceorientation',
              handleOrientationChange
            );
          } else {
            setPermissionStatus('denied');
          }
        })
        .catch(() => {
          setPermissionStatus('denied');
        });
    } else {
      setPermissionStatus('granted');
      window.addEventListener('deviceorientation', handleOrientationChange);
    }
  }, [handleOrientationChange]);

  const stopOrientationTracking = useCallback(() => {
    if (typeof window === 'undefined') return;
    window.removeEventListener('deviceorientation', handleOrientationChange);
  }, [handleOrientationChange]);

  const handleManualRotation = useCallback(() => {
    setCompassRotation(prev => normalizeAngle(prev + 90));
  }, []);

  const handleCalibration = useCallback(() => {
    setCompassRotation(0);
  }, []);

  // 初始化方向传感器
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

  // 通知方向变化
  useEffect(() => {
    if (onDirectionChange) {
      onDirectionChange(normalizeAngle(compassRotation));
    }
  }, [compassRotation, onDirectionChange]);

  // 清理事件监听器
  useEffect(() => {
    return () => {
      stopOrientationTracking();
    };
  }, [stopOrientationTracking]);

  const currentMountain = getMountainName(compassRotation);
  const oppositeMountain = getOppositeMountain(compassRotation);

  return (
    <div className='simple-compass-container'>
      {/* 罗盘主体 */}
      <div
        ref={compassRef}
        className='relative mx-auto'
        style={{
          width: `${width}px`,
          height: `${height}px`,
          filter: 'none',
          boxShadow: 'none',
        }}
      >
        {/* 罗盘背景图片 */}
        <div
          className='absolute inset-0 rounded-full overflow-hidden'
          style={{
            backgroundImage: `url(/compass-themes/${themeConfig.preview})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            transform: `rotate(${compassRotation}deg)`,
            transition: enableAnimation ? 'transform 0.3s ease-out' : 'none',
          }}
        />

        {/* 指南针 - 随罗盘一起旋转，指向正南方 */}
        <div
          className='absolute inset-0 pointer-events-none'
          style={{
            transform: `rotate(${compassRotation}deg)`,
            transition: enableAnimation ? 'transform 0.3s ease-out' : 'none',
          }}
        >
          {/* 指南针指针 - 指向正南方 */}
          <div
            className='absolute'
            style={{
              left: '50%',
              top: '50%',
              transform: 'translate(-50%, -50%)',
            }}
          >
            {/* 指南针主体 */}
            <div
              className='absolute w-0 h-0'
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderBottom: '60px solid #ff0000',
                filter: 'none',
              }}
            />
            {/* 指南针尾部 */}
            <div
              className='absolute w-0 h-0'
              style={{
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, 20px)',
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: '20px solid #ff0000',
                filter: 'none',
              }}
            />
          </div>
        </div>

        {/* 红色十字罗经线 - 使用Canvas绘制，完全无阴影 */}
        <canvas
          ref={canvas => {
            if (canvas) {
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // 设置canvas尺寸
                canvas.width = width;
                canvas.height = height;

                // 清除画布
                ctx.clearRect(0, 0, width, height);

                // 禁用抗锯齿
                ctx.imageSmoothingEnabled = false;

                // 设置绘制样式 - 使用更粗的线条
                ctx.strokeStyle = '#ff0000';
                ctx.fillStyle = '#ff0000';
                ctx.lineWidth = 4; // 增加线条粗细
                ctx.lineCap = 'butt'; // 使用方形末端
                ctx.lineJoin = 'miter'; // 使用尖角连接

                // 计算精确的像素位置
                const centerX = Math.floor(width / 2);
                const centerY = Math.floor(height / 2);

                // 绘制水平线 - 使用精确的像素位置
                ctx.beginPath();
                ctx.moveTo(0, centerY);
                ctx.lineTo(width, centerY);
                ctx.stroke();

                // 绘制垂直线 - 使用精确的像素位置
                ctx.beginPath();
                ctx.moveTo(centerX, 0);
                ctx.lineTo(centerX, height);
                ctx.stroke();

                // 绘制中心点 - 使用精确的像素位置
                ctx.beginPath();
                ctx.arc(centerX, centerY, 8, 0, 2 * Math.PI);
                ctx.fill();

                // 绘制额外的粗线条来覆盖抗锯齿效果
                ctx.lineWidth = 6;
                ctx.beginPath();
                ctx.moveTo(0, centerY);
                ctx.lineTo(width, centerY);
                ctx.stroke();

                ctx.beginPath();
                ctx.moveTo(centerX, 0);
                ctx.lineTo(centerX, height);
                ctx.stroke();
              }
            }
          }}
          style={{
            position: 'absolute',
            top: '0',
            left: '0',
            width: '100%',
            height: '100%',
            pointerEvents: 'none',
            zIndex: 10,
            imageRendering: 'pixelated', // 禁用图像平滑
          }}
        />
      </div>

      {/* 控制按钮和信息显示 */}
      {showDetailedInfo && (
        <div className='mt-6 space-y-4'>
          {/* 控制按钮 */}
          <div className='flex justify-center space-x-4'>
            <button
              onClick={startOrientationTracking}
              disabled={permissionStatus === 'requesting'}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                permissionStatus === 'granted'
                  ? 'bg-green-500 text-white hover:bg-green-600'
                  : permissionStatus === 'denied'
                    ? 'bg-red-500 text-white hover:bg-red-600'
                    : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}
            >
              {ORIENTATION_LABEL_MAP[permissionStatus]}
            </button>

            <button
              onClick={handleManualRotation}
              className='px-4 py-2 bg-gray-500 text-white rounded-lg text-sm font-medium hover:bg-gray-600 transition-colors'
            >
              手动旋转90°
            </button>

            <button
              onClick={handleCalibration}
              className='px-4 py-2 bg-purple-500 text-white rounded-lg text-sm font-medium hover:bg-purple-600 transition-colors'
            >
              校准归零
            </button>
          </div>

          {/* 当前方向信息 */}
          <div className='text-center space-y-2'>
            <div className='text-lg font-semibold text-gray-800'>
              当前方位: {Math.round(compassRotation)}°
            </div>
            <div className='text-sm text-gray-600'>
              坐山: {currentMountain} | 朝向: {oppositeMountain}
            </div>
            <div className='text-xs text-gray-500'>
              {ORIENTATION_HELPER_MAP[permissionStatus]}
            </div>
            {permissionStatus === 'denied' && (
              <div className='text-xs text-orange-600'>
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

export default SimpleCompass;
