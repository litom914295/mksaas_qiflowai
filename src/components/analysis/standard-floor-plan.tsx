'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Home, MapPin, Upload } from 'lucide-react';
import { useState } from 'react';

interface StandardFloorPlanProps {
  onFloorPlanSelect: (floorPlan: any) => void;
  selectedFloorPlan?: any;
}

// Standard floor plan data
const standardFloorPlans = [
  {
    id: 'standard-3room',
    name: 'Standard 3-Bedroom',
    description:
      'South-facing, 3 bedrooms, 2 living rooms, 2 bathrooms, ~120㎡',
    rooms: [
      {
        id: 'living',
        name: 'Living Room',
        type: 'living',
        position: { x: 0, y: 0 },
        size: { width: 6, height: 4 },
      },
      {
        id: 'master',
        name: 'Master Bedroom',
        type: 'bedroom',
        position: { x: 0, y: 4 },
        size: { width: 3, height: 3 },
      },
      {
        id: 'bedroom2',
        name: 'Secondary Bedroom',
        type: 'bedroom',
        position: { x: 3, y: 4 },
        size: { width: 3, height: 3 },
      },
      {
        id: 'bedroom3',
        name: 'Study',
        type: 'study',
        position: { x: 6, y: 4 },
        size: { width: 3, height: 3 },
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        type: 'kitchen',
        position: { x: 0, y: 7 },
        size: { width: 3, height: 2 },
      },
      {
        id: 'bathroom1',
        name: 'Master Bathroom',
        type: 'bathroom',
        position: { x: 3, y: 7 },
        size: { width: 2, height: 2 },
      },
      {
        id: 'bathroom2',
        name: 'Secondary Bathroom',
        type: 'bathroom',
        position: { x: 5, y: 7 },
        size: { width: 2, height: 2 },
      },
      {
        id: 'dining',
        name: 'Dining Room',
        type: 'dining',
        position: { x: 7, y: 7 },
        size: { width: 2, height: 2 },
      },
    ],
    orientation: 180, // South-facing
    totalArea: 120,
  },
  {
    id: 'standard-2room',
    name: 'Standard 2-Bedroom',
    description: 'South-facing, 2 bedrooms, 1 living room, 1 bathroom, ~80㎡',
    rooms: [
      {
        id: 'living',
        name: 'Living Room',
        type: 'living',
        position: { x: 0, y: 0 },
        size: { width: 5, height: 4 },
      },
      {
        id: 'bedroom1',
        name: 'Master Bedroom',
        type: 'bedroom',
        position: { x: 0, y: 4 },
        size: { width: 3, height: 3 },
      },
      {
        id: 'bedroom2',
        name: 'Secondary Bedroom',
        type: 'bedroom',
        position: { x: 3, y: 4 },
        size: { width: 2, height: 3 },
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        type: 'kitchen',
        position: { x: 5, y: 0 },
        size: { width: 2, height: 2 },
      },
      {
        id: 'bathroom',
        name: 'Bathroom',
        type: 'bathroom',
        position: { x: 5, y: 2 },
        size: { width: 2, height: 2 },
      },
      {
        id: 'dining',
        name: 'Dining Room',
        type: 'dining',
        position: { x: 5, y: 4 },
        size: { width: 2, height: 3 },
      },
    ],
    orientation: 180,
    totalArea: 80,
  },
  {
    id: 'standard-4room',
    name: 'Standard 4-Bedroom',
    description:
      'South-facing, 4 bedrooms, 2 living rooms, 3 bathrooms, ~150㎡',
    rooms: [
      {
        id: 'living',
        name: 'Living Room',
        type: 'living',
        position: { x: 0, y: 0 },
        size: { width: 7, height: 4 },
      },
      {
        id: 'master',
        name: 'Master Bedroom',
        type: 'bedroom',
        position: { x: 0, y: 4 },
        size: { width: 4, height: 4 },
      },
      {
        id: 'bedroom2',
        name: 'Secondary Bedroom',
        type: 'bedroom',
        position: { x: 4, y: 4 },
        size: { width: 3, height: 3 },
      },
      {
        id: 'bedroom3',
        name: 'Study',
        type: 'study',
        position: { x: 7, y: 4 },
        size: { width: 3, height: 3 },
      },
      {
        id: 'bedroom4',
        name: 'Guest Bedroom',
        type: 'bedroom',
        position: { x: 4, y: 7 },
        size: { width: 3, height: 3 },
      },
      {
        id: 'kitchen',
        name: 'Kitchen',
        type: 'kitchen',
        position: { x: 0, y: 8 },
        size: { width: 3, height: 2 },
      },
      {
        id: 'bathroom1',
        name: 'Master Bathroom',
        type: 'bathroom',
        position: { x: 3, y: 8 },
        size: { width: 2, height: 2 },
      },
      {
        id: 'bathroom2',
        name: 'Secondary Bathroom',
        type: 'bathroom',
        position: { x: 5, y: 8 },
        size: { width: 2, height: 2 },
      },
      {
        id: 'bathroom3',
        name: 'Guest Bathroom',
        type: 'bathroom',
        position: { x: 7, y: 8 },
        size: { width: 2, height: 2 },
      },
      {
        id: 'dining',
        name: 'Dining Room',
        type: 'dining',
        position: { x: 7, y: 7 },
        size: { width: 3, height: 1 },
      },
    ],
    orientation: 180,
    totalArea: 150,
  },
];

export function StandardFloorPlan({
  onFloorPlanSelect,
  selectedFloorPlan,
}: StandardFloorPlanProps) {
  const [showUpload, setShowUpload] = useState(false);

  const handleFloorPlanSelect = (floorPlan: any) => {
    onFloorPlanSelect(floorPlan);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Here you can handle file upload logic
      console.log('Upload floor plan:', file);
      // Mock processed floor plan data
      const uploadedFloorPlan = {
        id: 'uploaded',
        name: 'Custom Floor Plan',
        description: 'User uploaded floor plan',
        file: file,
        orientation: 180,
      };
      onFloorPlanSelect(uploadedFloorPlan);
    }
  };

  return (
    <div className="space-y-6">
      {/* 标准户型图选择 */}
      <div>
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Home className="w-5 h-5 text-blue-600" />
          选择标准户型图
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {standardFloorPlans.map((plan) => (
            <Card
              key={plan.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-lg ${
                selectedFloorPlan?.id === plan.id
                  ? 'ring-2 ring-blue-500 bg-blue-50'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleFloorPlanSelect(plan)}
            >
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-3 bg-gradient-to-br from-blue-100 to-purple-100 rounded-lg flex items-center justify-center">
                  <Home className="w-8 h-8 text-blue-600" />
                </div>
                <h5 className="font-semibold text-gray-900 mb-1">
                  {plan.name}
                </h5>
                <p className="text-sm text-gray-600 mb-2">{plan.description}</p>
                <div className="text-xs text-gray-500">
                  {plan.rooms.length}个房间 | {plan.totalArea}㎡
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* 自定义上传 */}
      <div className="border-t pt-6">
        <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Upload className="w-5 h-5 text-green-600" />
          上传自定义户型图
        </h4>

        {!showUpload ? (
          <Button
            variant="outline"
            onClick={() => setShowUpload(true)}
            className="w-full"
          >
            <Upload className="w-4 h-4 mr-2" />
            上传户型图文件
          </Button>
        ) : (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                type="file"
                accept="image/*,.pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="floor-plan-upload"
              />
              <label
                htmlFor="floor-plan-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <Upload className="w-12 h-12 text-gray-400 mb-4" />
                <p className="text-gray-600 mb-2">点击选择户型图文件</p>
                <p className="text-sm text-gray-500">支持 JPG, PNG, PDF 格式</p>
              </label>
            </div>
            <Button
              variant="outline"
              onClick={() => setShowUpload(false)}
              className="w-full"
            >
              取消上传
            </Button>
          </div>
        )}
      </div>

      {/* 已选择的户型图信息 */}
      {selectedFloorPlan && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="w-5 h-5 text-green-600" />
            <span className="font-semibold text-green-800">已选择户型图</span>
          </div>
          <p className="text-green-700">{selectedFloorPlan.name}</p>
          <p className="text-sm text-green-600">
            {selectedFloorPlan.description}
          </p>
        </div>
      )}
    </div>
  );
}
