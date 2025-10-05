'use client';

import { FlyingStarGrid } from '@/components/qiflow/xuankong/flying-star-grid';
import type { PalaceIndex, Plate } from '@/lib/qiflow/xuankong/types';
import { useState } from 'react';

// 测试数据
const testPlate: Plate = [
  { palace: 1, periodStar: 1, mountainStar: 6, facingStar: 8 },
  { palace: 2, periodStar: 2, mountainStar: 7, facingStar: 3 },
  { palace: 3, periodStar: 3, mountainStar: 8, facingStar: 4 },
  { palace: 4, periodStar: 4, mountainStar: 9, facingStar: 2 },
  { palace: 5, periodStar: 5, mountainStar: 5, facingStar: 5 },
  { palace: 6, periodStar: 6, mountainStar: 1, facingStar: 9 },
  { palace: 7, periodStar: 7, mountainStar: 2, facingStar: 1 },
  { palace: 8, periodStar: 8, mountainStar: 3, facingStar: 7 },
  { palace: 9, periodStar: 9, mountainStar: 4, facingStar: 6 },
];

export default function TestFlyingStarPage() {
  const [selectedPalace, setSelectedPalace] = useState<PalaceIndex | null>(
    null
  );

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">飞星组件测试</h1>

      <div className="max-w-4xl mx-auto">
        <FlyingStarGrid
          plate={testPlate}
          selectedPalace={selectedPalace}
          onCellClick={(palace) => setSelectedPalace(palace)}
          showDetails={true}
        />
      </div>

      {selectedPalace && (
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <h2 className="font-semibold">选中的宫位：{selectedPalace}</h2>
        </div>
      )}
    </div>
  );
}
