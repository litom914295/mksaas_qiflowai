'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import React from 'react';

interface FengshuiAnalysisProps {
  data?: any;
  loading?: boolean;
}

export default function ReportFengshuiAnalysis({
  data,
  loading = false,
}: FengshuiAnalysisProps) {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>风水分析中...</CardTitle>
          <CardDescription>正在进行环境能量解读</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4" />
            <div className="h-4 bg-gray-200 rounded w-1/2" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>风水分析报告</CardTitle>
        <CardDescription>居住环境的能量分析与改善建议</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <p className="text-muted-foreground">
            风水分析组件正在开发中，敬请期待...
          </p>
          {data && (
            <pre className="text-xs bg-gray-50 p-4 rounded overflow-auto">
              {JSON.stringify(data, null, 2)}
            </pre>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
