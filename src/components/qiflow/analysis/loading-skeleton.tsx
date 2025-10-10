'use client';

import { Card } from '@/components/ui/card';
import { memo } from 'react';

/**
 * 表单加载骨架屏
 */
export const FormSkeleton = memo(function FormSkeleton() {
  return (
    <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
      <div className="animate-pulse space-y-6">
        {/* 标题骨架 */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-300 rounded-lg" />
            <div className="h-8 w-64 bg-gray-300 rounded" />
          </div>
          <div className="h-10 w-32 bg-gray-300 rounded" />
        </div>

        {/* 描述骨架 */}
        <div className="h-4 w-full bg-gray-300 rounded mb-4" />
        <div className="h-4 w-3/4 bg-gray-300 rounded mb-6" />

        {/* 表单字段骨架 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
            <div className="h-12 w-full bg-gray-300 rounded" />
          </div>
          <div>
            <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
            <div className="h-12 w-full bg-gray-300 rounded" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
            <div className="h-12 w-full bg-gray-300 rounded" />
          </div>
          <div>
            <div className="h-4 w-24 bg-gray-300 rounded mb-2" />
            <div className="h-12 w-full bg-gray-300 rounded" />
          </div>
        </div>

        {/* 按钮骨架 */}
        <div className="flex justify-end">
          <div className="h-12 w-40 bg-gray-300 rounded" />
        </div>
      </div>
    </Card>
  );
});

/**
 * 分析结果加载骨架屏
 */
export const AnalysisResultSkeleton = memo(function AnalysisResultSkeleton() {
  return (
    <div className="space-y-8">
      {/* 八字分析骨架 */}
      <Card className="p-8 shadow-xl bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-300 rounded-xl" />
            <div className="h-8 w-64 bg-purple-300 rounded" />
          </div>
          <div className="h-4 w-full bg-purple-200 rounded" />
          <div className="h-4 w-5/6 bg-purple-200 rounded" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-purple-200 rounded-lg" />
            ))}
          </div>
        </div>
      </Card>

      {/* 风水分析骨架 */}
      <Card className="p-8 shadow-xl bg-white/90 backdrop-blur-sm">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-48 bg-gray-300 rounded mb-4" />
          <div className="h-96 bg-gray-200 rounded-lg" />
        </div>
      </Card>
    </div>
  );
});
