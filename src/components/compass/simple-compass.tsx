'use client';

import { Card } from '@/components/ui/card';

export default function SimpleCompass({
  orientation,
  onOrientationChange,
  onDirectionChange,
  theme,
  interactive,
  enableAnimation,
  showDetailedInfo,
  width,
  height,
}: {
  orientation?: number;
  onOrientationChange?: (orientation: number) => void;
  onDirectionChange?: (direction: number) => void;
  theme?: string;
  interactive?: boolean;
  enableAnimation?: boolean;
  showDetailedInfo?: boolean;
  width?: number;
  height?: number;
}) {
  return (
    <Card className="p-6">
      <div 
        className="flex flex-col items-center justify-center space-y-4"
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        }}
      >
        <div className="w-48 h-48 rounded-full border-4 border-gray-300 flex items-center justify-center">
          <div className="text-2xl font-bold">{orientation || 0}°</div>
        </div>
        <p className="text-sm text-gray-600">罗盘方向</p>
        {showDetailedInfo && (
          <div className="text-xs text-gray-500">
            主题: {theme || '默认'}
          </div>
        )}
      </div>
    </Card>
  );
}
