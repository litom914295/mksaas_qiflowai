'use client';

import {
  type AnalysisRecord,
  deleteAnalysisRecord,
  getAnalysisHistory,
} from '@/actions/qiflow/analysis-history';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LocaleLink } from '@/i18n/navigation';
import { Eye, FileText, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useEffect, useState, useTransition } from 'react';

export default function AnalysisHistoryPage() {
  const t = useTranslations('QiFlow');
  const [baziHistory, setBaziHistory] = useState<AnalysisRecord[]>([]);
  const [xuankongHistory, setXuankongHistory] = useState<AnalysisRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    loadHistory();
  }, []);

  async function loadHistory() {
    setLoading(true);
    const result = await getAnalysisHistory();
    if (result.ok) {
      setBaziHistory(result.records.filter((r) => r.type === 'bazi'));
      setXuankongHistory(result.records.filter((r) => r.type === 'xuankong'));
    }
    setLoading(false);
  }

  async function handleDelete(id: string, type: 'bazi' | 'xuankong') {
    if (!confirm('确定要删除此记录吗？')) return;

    startTransition(async () => {
      const result = await deleteAnalysisRecord(id);
      if (result.ok) {
        if (type === 'bazi') {
          setBaziHistory((prev) => prev.filter((item) => item.id !== id));
        } else {
          setXuankongHistory((prev) => prev.filter((item) => item.id !== id));
        }
      } else {
        alert('错误: ' + result.error);
      }
    });
  }

  function RecordCard({ record }: { record: AnalysisRecord }) {
    return (
      <Card className="hover:shadow-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-base">
                {record.type === 'bazi' && record.name}
                {record.type === 'xuankong' && record.address}
              </CardTitle>
              <CardDescription className="text-xs mt-1">
                {new Date(record.createdAt).toLocaleString()}
              </CardDescription>
            </div>
            <Badge variant="secondary" className="text-xs">
              {record.creditsUsed} 积分
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {record.type === 'bazi' && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                出生时间: {record.birth}
              </div>
            </div>
          )}
          {record.type === 'xuankong' && (
            <div className="text-sm text-muted-foreground space-y-1">
              <div>
                朝向: {record.facing}°
              </div>
            </div>
          )}
          <div className="mt-4 flex gap-2">
            <Button asChild size="sm" variant="outline">
              <LocaleLink href={`/analysis/history/${record.id}`}>
                <Eye className="mr-1 h-4 w-4" />
                查看
              </LocaleLink>
            </Button>
            <Button asChild size="sm" variant="outline">
              <LocaleLink href={`/analysis/history/${record.id}/report`}>
                <FileText className="mr-1 h-4 w-4" />
                导出
              </LocaleLink>
            </Button>
            <Button
              size="sm"
              variant="destructive"
              onClick={() => handleDelete(record.id, record.type)}
            >
              <Trash2 className="mr-1 h-4 w-4" />
              删除
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="flex h-64 items-center justify-center">
          <div className="text-muted-foreground">加载中...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">分析历史</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          查看和管理您的八字和玄空分析历史记录
        </p>
      </div>

      <Tabs defaultValue="bazi" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="bazi">
            八字分析 ({baziHistory.length})
          </TabsTrigger>
          <TabsTrigger value="xuankong">
            玄空分析 ({xuankongHistory.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="bazi" className="mt-6 space-y-4">
          {baziHistory.length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                暂无记录
              </CardContent>
            </Card>
          ) : (
            baziHistory.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          )}
        </TabsContent>

        <TabsContent value="xuankong" className="mt-6 space-y-4">
          {xuankongHistory.length === 0 ? (
            <Card>
              <CardContent className="flex h-32 items-center justify-center text-sm text-muted-foreground">
                暂无记录
              </CardContent>
            </Card>
          ) : (
            xuankongHistory.map((record) => (
              <RecordCard key={record.id} record={record} />
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
