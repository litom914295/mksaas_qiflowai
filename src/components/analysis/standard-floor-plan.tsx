'use client';

import { Card } from '@/components/ui/card';

export interface StandardFloorPlanProps {
  floorPlan?: any;
  selectedFloorPlan?: any;
  onSelect?: (floorPlan: any) => void;
  onFloorPlanSelect?: (floorPlan: any) => void;
}

export function StandardFloorPlan({ 
  floorPlan, 
  selectedFloorPlan,
  onSelect, 
  onFloorPlanSelect 
}: StandardFloorPlanProps) {
  const handleSelect = (plan: any) => {
    onSelect?.(plan);
    onFloorPlanSelect?.(plan);
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-semibold mb-4">标准户型图</h3>
      <div className="space-y-4">
        <p className="text-gray-600">户型图将显示在这里</p>
      </div>
    </Card>
  );
}
