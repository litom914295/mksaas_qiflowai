'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Compass } from 'lucide-react';

export function CompassPicker() {
  return (
    <div className="container mx-auto px-4 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Compass className="w-6 h-6" />
            罗盘定位
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">罗盘功能正在开发中...</p>
            <p className="text-sm text-gray-500">敬请期待</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
