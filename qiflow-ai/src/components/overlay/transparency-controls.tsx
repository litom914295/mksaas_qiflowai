/**
 * 透明度控制组件
 *
 * 提供飞星盘透明度的精确控制
 * 支持实时预览和动画效果
 */

'use client';

// import { Slider } from '@/components/ui/slider';
import React, { useCallback, useEffect, useRef, useState } from 'react';

interface TransparencyControlsProps {
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  onAnimationToggle?: (enabled: boolean) => void;
  className?: string;
}

interface AnimationState {
  enabled: boolean;
  direction: 'in' | 'out';
  speed: number;
  minOpacity: number;
  maxOpacity: number;
}

export const TransparencyControls: React.FC<TransparencyControlsProps> = ({
  opacity,
  onOpacityChange,
  onAnimationToggle,
  className = '',
}) => {
  const [animationState, setAnimationState] = useState<AnimationState>({
    enabled: false,
    direction: 'in',
    speed: 0.02,
    minOpacity: 0.3,
    maxOpacity: 0.9,
  });

  const [isDragging] = useState(false);
  const animationRef = useRef<number | null>(null);

  // 动画循环
  useEffect(() => {
    if (!animationState.enabled) {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      return;
    }

    const animate = () => {
      setAnimationState(prev => {
        const newOpacity =
          prev.direction === 'in'
            ? Math.min(prev.maxOpacity, opacity + prev.speed)
            : Math.max(prev.minOpacity, opacity - prev.speed);

        onOpacityChange(newOpacity);

        // 检查是否需要改变方向
        if (newOpacity >= prev.maxOpacity) {
          return { ...prev, direction: 'out' };
        } else if (newOpacity <= prev.minOpacity) {
          return { ...prev, direction: 'in' };
        }

        return prev;
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [animationState.enabled, opacity, onOpacityChange]);

  // 处理滑块变化
  // const handleSliderChange = useCallback(
    (value: number[]) => {
      const newOpacity = value[0] / 100;
      onOpacityChange(newOpacity);
    },
    [onOpacityChange]
  );

  // 处理预设按钮
  const handlePresetClick = useCallback(
    (presetOpacity: number) => {
      onOpacityChange(presetOpacity);
      setIsDragging(false);
    },
    [onOpacityChange]
  );

  // 处理动画切换
  const handleAnimationToggle = useCallback(() => {
    const newEnabled = !animationState.enabled;
    setAnimationState(prev => ({ ...prev, enabled: newEnabled }));

    if (onAnimationToggle) {
      onAnimationToggle(newEnabled);
    }
  }, [animationState.enabled, onAnimationToggle]);

  // 处理速度变化
  // const handleSpeedChange = useCallback((speed: number) => {
    setAnimationState(prev => ({ ...prev, speed: speed / 100 }));
  }, []);

  // 处理范围变化
  // const handleRangeChange = useCallback((min: number, max: number) => {
    setAnimationState(prev => ({
      ...prev,
      minOpacity: min / 100,
      maxOpacity: max / 100,
    }));
  }, []);

  return (
    <div className={`transparency-controls ${className}`}>
      <div className='bg-white p-4 rounded-lg shadow-lg'>
        <h3 className='text-lg font-semibold mb-4'>透明度控制</h3>

        {/* 主滑块 */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>
            飞星盘透明度: {Math.round(opacity * 100)}%
          </label>
          {/* <Slider
            value={[opacity * 100]}
            onValueChange={handleSliderChange}
            min={0}
            max={100}
            step={1}
            className='w-full'
            onPointerDown={() => setIsDragging(true)}
            onPointerUp={() => setIsDragging(false)}
          /> */}
        </div>

        {/* 预设按钮 */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>快速设置</label>
          <div className='flex gap-2'>
            {[
              { label: '透明', value: 0.2 },
              { label: '半透明', value: 0.5 },
              { label: '清晰', value: 0.8 },
              { label: '不透明', value: 1.0 },
            ].map(preset => (
              <button
                key={preset.label}
                onClick={() => handlePresetClick(preset.value)}
                className={`px-3 py-1 text-xs rounded transition-colors ${
                  Math.abs(opacity - preset.value) < 0.05
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>

        {/* 动画控制 */}
        <div className='mb-4'>
          <div className='flex items-center justify-between mb-2'>
            <label className='text-sm font-medium'>呼吸动画</label>
            <button
              onClick={handleAnimationToggle}
              className={`px-3 py-1 text-xs rounded transition-colors ${
                animationState.enabled
                  ? 'bg-green-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {animationState.enabled ? '停止' : '开始'}
            </button>
          </div>

          {animationState.enabled && (
            <div className='space-y-2'>
              <div>
                <label className='block text-xs text-gray-600 mb-1'>
                  动画速度: {Math.round(animationState.speed * 100)}%
                </label>
                {/* <Slider
                  value={[animationState.speed * 100]}
                  onValueChange={(value: number[]) => handleSpeedChange(value[0])}
                  min={1}
                  max={50}
                  step={1}
                  className='w-full'
                /> */}
              </div>

              <div className='grid grid-cols-2 gap-2'>
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    最小透明度
                  </label>
                  {/* <Slider
                    value={[animationState.minOpacity * 100]}
                    onValueChange={(value: number[]) =>
                      handleRangeChange(
                        value[0],
                        animationState.maxOpacity * 100
                      )
                    }
                    min={0}
                    max={animationState.maxOpacity * 100}
                    step={1}
                    className='w-full'
                  /> */}
                </div>
                <div>
                  <label className='block text-xs text-gray-600 mb-1'>
                    最大透明度
                  </label>
                  {/* <Slider
                    value={[animationState.maxOpacity * 100]}
                    onValueChange={(value: number[]) =>
                      handleRangeChange(
                        animationState.minOpacity * 100,
                        value[0]
                      )
                    }
                    min={animationState.minOpacity * 100}
                    max={100}
                    step={1}
                    className='w-full'
                  /> */}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 实时预览 */}
        <div className='mb-4'>
          <label className='block text-sm font-medium mb-2'>实时预览</label>
          <div className='relative w-full h-20 bg-gray-100 rounded border'>
            <div
              className='absolute inset-0 bg-blue-500 rounded transition-opacity duration-200'
              style={{ opacity: opacity }}
            />
            <div className='absolute inset-0 flex items-center justify-center text-white font-medium'>
              {Math.round(opacity * 100)}%
            </div>
          </div>
        </div>

        {/* 快捷键提示 */}
        <div className='text-xs text-gray-500'>
          <div>快捷键: 数字键 1-9 快速设置透明度</div>
          <div>鼠标滚轮: 微调透明度</div>
        </div>
      </div>
    </div>
  );
};

// 键盘快捷键处理
export const useTransparencyKeyboard = (
  onOpacityChange: (opacity: number) => void
) => {
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // 数字键 1-9 设置透明度
      if (event.key >= '1' && event.key <= '9') {
        const opacity = parseInt(event.key) / 9;
        onOpacityChange(opacity);
        event.preventDefault();
      }

      // 0 键设置为完全透明
      if (event.key === '0') {
        onOpacityChange(0);
        event.preventDefault();
      }
    };

    const handleWheel = (event: WheelEvent) => {
      if (event.ctrlKey) {
        event.preventDefault();
        const delta = event.deltaY > 0 ? -0.05 : 0.05;
        // 获取当前透明度值，这里需要从父组件传递
        onOpacityChange(Math.max(0, Math.min(1, 0.5 + delta)));
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    window.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
      window.removeEventListener('wheel', handleWheel);
    };
  }, [onOpacityChange]);
};

export default TransparencyControls;

