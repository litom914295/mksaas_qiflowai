'use client';

import { Button } from '@/components/ui/button';
import { MapPin, Navigation, RotateCcw, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface MapPickerProps {
  value?: {
    latitude?: number;
    longitude?: number;
    address?: string;
  };
  onChange?: (value: {
    latitude: number;
    longitude: number;
    address?: string;
  }) => void;
  defaultCenter?: {
    latitude: number;
    longitude: number;
  };
  zoom?: number;
  className?: string;
  disabled?: boolean;
}

// 模拟地图数据（实际项目中应该使用真实的地图库如 Google Maps 或 高德地图）
const DEFAULT_CENTER = {
  latitude: 39.9042, // 北京
  longitude: 116.4074,
};

const CHINESE_CITIES = [
  { name: '北京', lat: 39.9042, lng: 116.4074 },
  { name: '上海', lat: 31.2304, lng: 121.4737 },
  { name: '广州', lat: 23.1291, lng: 113.2644 },
  { name: '深圳', lat: 22.5429, lng: 113.9345 },
  { name: '杭州', lat: 30.2741, lng: 120.1551 },
  { name: '成都', lat: 30.5728, lng: 104.0668 },
  { name: '武汉', lat: 30.5928, lng: 114.3055 },
  { name: '西安', lat: 34.3416, lng: 108.9398 },
  { name: '南京', lat: 32.0603, lng: 118.7969 },
  { name: '重庆', lat: 29.563, lng: 106.5516 },
];

export function MapPicker({
  value,
  onChange,
  defaultCenter = DEFAULT_CENTER,
  zoom = 10,
  className = '',
  disabled = false,
}: MapPickerProps) {
  const [selectedLocation, setSelectedLocation] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(
    value
      ? {
          latitude: value.latitude || defaultCenter.latitude,
          longitude: value.longitude || defaultCenter.longitude,
          address: value.address,
        }
      : null
  );

  const [currentCenter, setCurrentCenter] = useState(defaultCenter);
  const [currentZoom, setCurrentZoom] = useState(zoom);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const mapRef = useRef<HTMLDivElement>(null);

  // 获取地址（模拟）
  const getAddressFromCoords = useCallback(
    async (lat: number, lng: number): Promise<string> => {
      // 实际项目中应该调用地图API进行逆地理编码
      // 这里使用模拟数据
      await new Promise(resolve => setTimeout(resolve, 500));

      // 找到最近的城市
      let nearestCity = '未知位置';
      let minDistance = Infinity;

      for (const city of CHINESE_CITIES) {
        const distance = Math.sqrt(
          Math.pow(lat - city.lat, 2) + Math.pow(lng - city.lng, 2)
        );
        if (distance < minDistance) {
          minDistance = distance;
          nearestCity = city.name;
        }
      }

      return `${nearestCity}附近`;
    },
    []
  );

  // 处理地图点击
  const handleMapClick = useCallback(
    async (event: React.MouseEvent<HTMLDivElement>) => {
      if (disabled || !mapRef.current) return;

      const rect = mapRef.current.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;

      // 计算点击位置对应的经纬度（简化计算）
      const mapWidth = rect.width;
      const mapHeight = rect.height;

      // 简化的经纬度计算（实际项目中需要更复杂的投影转换）
      const latOffset =
        ((y - mapHeight / 2) * 0.01) / Math.pow(2, currentZoom - 10);
      const lngOffset =
        ((x - mapWidth / 2) * 0.01) / Math.pow(2, currentZoom - 10);

      const latitude = currentCenter.latitude - latOffset;
      const longitude = currentCenter.longitude + lngOffset;

      try {
        const address = await getAddressFromCoords(latitude, longitude);
        const newLocation = { latitude, longitude, address };

        setSelectedLocation(newLocation);
        onChange?.(newLocation);
      } catch (error) {
        console.error('Failed to get address:', error);
      }
    },
    [currentCenter, currentZoom, disabled, getAddressFromCoords, onChange]
  );

  // 处理地图拖拽
  const handleMouseDown = (event: React.MouseEvent) => {
    if (disabled) return;
    setIsDragging(true);
    setDragStart({ x: event.clientX, y: event.clientY });
  };

  const handleMouseMove = useCallback(
    (event: MouseEvent) => {
      if (!isDragging || disabled || !mapRef.current) return;

      const deltaX = event.clientX - dragStart.x;
      const deltaY = event.clientY - dragStart.y;

      // 计算拖拽距离对应的经纬度偏移
      // const rect = mapRef.current.getBoundingClientRect();
      const latOffset = (deltaY * 0.001) / Math.pow(2, currentZoom - 10);
      const lngOffset = (-deltaX * 0.001) / Math.pow(2, currentZoom - 10);

      setCurrentCenter(prev => ({
        latitude: prev.latitude + latOffset,
        longitude: prev.longitude + lngOffset,
      }));

      setDragStart({ x: event.clientX, y: event.clientY });
    },
    [isDragging, dragStart, currentZoom, disabled]
  );

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 监听鼠标移动事件
  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
    return undefined;
  }, [isDragging, handleMouseMove]);

  // 缩放控制
  const handleZoom = (direction: 'in' | 'out') => {
    setCurrentZoom(prev => {
      const newZoom = direction === 'in' ? prev + 1 : prev - 1;
      return Math.max(5, Math.min(18, newZoom));
    });
  };

  // 重置视图
  const handleReset = () => {
    setCurrentCenter(defaultCenter);
    setCurrentZoom(zoom);
    if (selectedLocation) {
      setCurrentCenter({
        latitude: selectedLocation.latitude,
        longitude: selectedLocation.longitude,
      });
    }
  };

  // 定位到当前位置
  const handleLocate = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setCurrentCenter({ latitude, longitude });
          setCurrentZoom(15);
        },
        error => {
          console.error('Error getting location:', error);
          // 可以显示错误提示
        }
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      {/* 地图容器 */}
      <div
        ref={mapRef}
        className={`
          relative w-full h-64 bg-gradient-to-br from-blue-100 to-green-100 rounded-lg border-2 border-dashed
          ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-crosshair'}
          ${selectedLocation ? 'border-blue-300' : 'border-gray-300'}
        `}
        onClick={handleMapClick}
        onMouseDown={handleMouseDown}
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, rgba(59, 130, 246, 0.1) 0%, transparent 50%),
            radial-gradient(circle at 75% 75%, rgba(34, 197, 94, 0.1) 0%, transparent 50%)
          `,
        }}
      >
        {/* 地图网格 */}
        <div className='absolute inset-0 opacity-20'>
          <svg width='100%' height='100%' className='w-full h-full'>
            <defs>
              <pattern
                id='grid'
                width='20'
                height='20'
                patternUnits='userSpaceOnUse'
              >
                <path
                  d='M 20 0 L 0 0 0 20'
                  fill='none'
                  stroke='#9CA3AF'
                  strokeWidth='1'
                />
              </pattern>
            </defs>
            <rect width='100%' height='100%' fill='url(#grid)' />
          </svg>
        </div>

        {/* 城市标记 */}
        {CHINESE_CITIES.map((city, index) => {
          // 简化的坐标转换（实际项目需要真实的投影转换）
          const x =
            50 +
            ((city.lng - currentCenter.longitude) * 1000) /
              Math.pow(2, currentZoom - 10);
          const y =
            50 -
            ((city.lat - currentCenter.latitude) * 1000) /
              Math.pow(2, currentZoom - 10);

          if (x < 0 || x > 100 || y < 0 || y > 100) return null;

          return (
            <div
              key={index}
              className='absolute transform -translate-x-1/2 -translate-y-1/2'
              style={{ left: `${x}%`, top: `${y}%` }}
            >
              <div className='w-2 h-2 bg-red-500 rounded-full'></div>
              <div className='text-xs text-gray-600 whitespace-nowrap ml-3 mt-1'>
                {city.name}
              </div>
            </div>
          );
        })}

        {/* 选中的位置标记 */}
        {selectedLocation && (
          <div
            className='absolute transform -translate-x-1/2 -translate-y-full'
            style={{
              left: '50%',
              top: '50%',
            }}
          >
            <MapPin className='w-8 h-8 text-red-500 drop-shadow-lg' />
          </div>
        )}

        {/* 地图中心十字 */}
        <div className='absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'>
          <div className='w-6 h-0.5 bg-blue-500 opacity-50'></div>
          <div className='w-0.5 h-6 bg-blue-500 opacity-50 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2'></div>
        </div>
      </div>

      {/* 控制面板 */}
      <div className='absolute top-2 right-2 flex flex-col gap-1'>
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={() => handleZoom('in')}
          disabled={currentZoom >= 18}
          className='w-8 h-8 p-0'
        >
          <ZoomIn className='w-4 h-4' />
        </Button>
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={() => handleZoom('out')}
          disabled={currentZoom <= 5}
          className='w-8 h-8 p-0'
        >
          <ZoomOut className='w-4 h-4' />
        </Button>
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={handleReset}
          className='w-8 h-8 p-0'
        >
          <RotateCcw className='w-4 h-4' />
        </Button>
        <Button
          type='button'
          variant='secondary'
          size='sm'
          onClick={handleLocate}
          className='w-8 h-8 p-0'
        >
          <Navigation className='w-4 h-4' />
        </Button>
      </div>

      {/* 信息面板 */}
      <div className='mt-2 text-sm text-gray-600'>
        {selectedLocation ? (
          <div>
            <div className='font-medium'>已选择位置：</div>
            <div>经度: {selectedLocation.longitude.toFixed(6)}</div>
            <div>纬度: {selectedLocation.latitude.toFixed(6)}</div>
            {selectedLocation.address && (
              <div>地址: {selectedLocation.address}</div>
            )}
          </div>
        ) : (
          <div>点击地图选择位置</div>
        )}
      </div>

      {/* 使用提示 */}
      <div className='mt-1 text-xs text-gray-500'>
        支持拖拽地图、缩放查看，支持获取当前位置
      </div>
    </div>
  );
}
