'use client';

/**
 * 分析详情客户端组件
 * 显示单个分析记录的详细内容
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { AnalysisHistory } from '@/db/schema/analysis';
import {
  CalendarIcon,
  DownloadIcon,
  EyeIcon,
  MapPinIcon,
  ShareIcon,
  StarIcon,
} from 'lucide-react';
// import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

interface AnalysisDetailClientProps {
  analysisId: string;
}

export function AnalysisDetailClient({
  analysisId,
}: AnalysisDetailClientProps) {
  // const t = useTranslations('common');
  const t = (key: string) => key;
  const [record, setRecord] = useState<AnalysisHistory | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 获取分析详情
  useEffect(() => {
    const fetchRecord = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/analysis/history/${analysisId}`);

        if (!response.ok) {
          throw new Error('Failed to fetch record');
        }

        const result = await response.json();
        setRecord(result.data);
      } catch (error) {
        console.error('Failed to fetch analysis record:', error);
        setError(error instanceof Error ? error.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecord();
  }, [analysisId]);

  // 格式化日期
  const formatDate = (date: string | Date) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      weekday: 'long',
    });
  };

  // 分享功能
  const shareRecord = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${record?.name || '未命名'} 的分析报告`,
          text: record?.aiEnhancedAnalysis?.slice(0, 100) + '...',
          url: window.location.href,
        });
      } catch (error) {
        console.error('Failed to share:', error);
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
      alert('链接已复制到剪贴板');
    }
  };

  // 导出功能
  const exportRecord = async () => {
    // TODO: 实现导出功能
    console.log('Export record:', record);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-48" />
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <Skeleton className="h-6 w-32" />
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (error || !record) {
    return (
      <Card>
        <CardContent className="py-12">
          <div className="text-center text-muted-foreground">
            <p className="text-lg font-medium">错误</p>
            <p className="text-sm mt-1">{error || '找不到分析记录'}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>
              重试
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const hasBazi = record.baziResult;
  const hasFengshui = record.fengshuiResult;

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">
            {record.name || '未命名'} 的分析报告
          </h1>
          <p className="text-muted-foreground mt-1">
            {formatDate(record.createdAt)}
          </p>
        </div>

        <div className="flex gap-2">
          <Button variant="outline" onClick={shareRecord}>
            <ShareIcon className="w-4 h-4 mr-2" />
            分享
          </Button>
          <Button variant="outline" onClick={exportRecord}>
            <DownloadIcon className="w-4 h-4 mr-2" />
            导出
          </Button>
          <Button variant="outline">
            <StarIcon className="w-4 h-4 mr-2" />
            收藏
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 主内容 */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="overview" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">总览</TabsTrigger>
              <TabsTrigger value="bazi" disabled={!hasBazi}>
                八字命理
              </TabsTrigger>
              <TabsTrigger value="fengshui" disabled={!hasFengshui}>
                风水分析
              </TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <Card>
                <CardHeader>
                  <CardTitle>分析概览</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* 个人信息 */}
                  <div>
                    <h3 className="font-medium mb-3">个人信息</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">姓名:</span>
                        <span className="ml-2">{record.name}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">性别:</span>
                        <span className="ml-2">
                          {record.gender === 'male' ? '男' : '女'}
                        </span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">出生日期:</span>
                        <span className="ml-2">{record.birthDate}</span>
                      </div>
                      {record.birthTime && (
                        <div>
                          <span className="text-muted-foreground">
                            出生时间:
                          </span>
                          <span className="ml-2">{record.birthTime}</span>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-muted-foreground">出生地点:</span>
                        <span className="ml-2">{record.location}</span>
                      </div>
                    </div>
                  </div>

                  {/* 房屋信息 */}
                  {(record.houseAddress || record.houseOrientation) && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-3">房屋信息</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                          {record.houseAddress && (
                            <div className="col-span-2">
                              <span className="text-muted-foreground">
                                房屋地址:
                              </span>
                              <span className="ml-2">
                                {record.houseAddress}
                              </span>
                            </div>
                          )}
                          {record.houseOrientation && (
                            <div>
                              <span className="text-muted-foreground">
                                朝向:
                              </span>
                              <span className="ml-2">
                                {record.houseOrientation}°
                              </span>
                            </div>
                          )}
                          {record.houseFloor && (
                            <div>
                              <span className="text-muted-foreground">
                                楼层:
                              </span>
                              <span className="ml-2">{record.houseFloor}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* AI增强分析 */}
                  {record.aiEnhancedAnalysis && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="font-medium mb-3">AI分析结果</h3>
                        <div className="prose prose-sm max-w-none">
                          <p className="text-sm leading-relaxed whitespace-pre-wrap">
                            {record.aiEnhancedAnalysis}
                          </p>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="bazi">
              <Card>
                <CardHeader>
                  <CardTitle>八字命理</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasBazi ? (
                    <div className="space-y-4">
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(record.baziResult, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">暂无八字数据</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="fengshui">
              <Card>
                <CardHeader>
                  <CardTitle>风水分析</CardTitle>
                </CardHeader>
                <CardContent>
                  {hasFengshui ? (
                    <div className="space-y-4">
                      <pre className="text-sm bg-muted p-4 rounded-lg overflow-auto">
                        {JSON.stringify(record.fengshuiResult, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">暂无风水数据</p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* 侧边栏 */}
        <div className="space-y-6">
          {/* 分析类型 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">分析类型</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {hasBazi ? (
                <Badge variant="secondary" className="mr-2">
                  八字命理
                </Badge>
              ) : null}
              {hasFengshui ? <Badge variant="outline">风水分析</Badge> : null}
            </CardContent>
          </Card>

          {/* 统计信息 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">统计信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <EyeIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">浏览次数</span>
                </div>
                <span className="text-sm font-medium">
                  {record.viewCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShareIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">分享次数</span>
                </div>
                <span className="text-sm font-medium">
                  {record.shareCount || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">创建时间</span>
                </div>
                <span className="text-sm font-medium">
                  {new Date(record.createdAt).toLocaleDateString('zh-CN')}
                </span>
              </div>

              {record.updatedAt !== record.createdAt && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm">更新时间</span>
                  </div>
                  <span className="text-sm font-medium">
                    {new Date(record.updatedAt).toLocaleDateString('zh-CN')}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 位置信息 */}
          {record.location && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">位置信息</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2">
                  <MapPinIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm">{record.location}</span>
                </div>
                {record.houseAddress && (
                  <div className="mt-2 text-xs text-muted-foreground">
                    {record.houseAddress}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
