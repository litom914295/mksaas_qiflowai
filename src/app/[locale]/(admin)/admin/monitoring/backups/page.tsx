/**
 * 备份管理页面
 */

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Database, Download, PlayCircle, Settings } from 'lucide-react';

export default function BackupsPage() {
  const backups = [
    {
      id: '1',
      filename: 'backup_2025-01-13T00-00-00.sql.gz',
      size: '245 MB',
      created: '2小时前',
      type: 'auto',
      status: 'success',
    },
    {
      id: '2',
      filename: 'backup_2025-01-12T00-00-00.sql.gz',
      size: '243 MB',
      created: '1天前',
      type: 'auto',
      status: 'success',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">备份管理</h1>
          <p className="text-muted-foreground mt-2">数据库备份和恢复</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="mr-2 h-4 w-4" />
            配置备份
          </Button>
          <Button>
            <PlayCircle className="mr-2 h-4 w-4" />
            立即备份
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">总备份数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">最近备份</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2小时前</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">总大小</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6.8 GB</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">保留策略</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">30天</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>备份文件列表</CardTitle>
          <CardDescription>按时间倒序排列</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {backups.map((backup) => (
              <div
                key={backup.id}
                className="flex items-center justify-between p-4 border rounded-lg"
              >
                <div className="flex items-center gap-4">
                  <Database className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <p className="font-mono text-sm font-medium">
                      {backup.filename}
                    </p>
                    <div className="flex gap-4 mt-1 text-sm text-muted-foreground">
                      <span>{backup.size}</span>
                      <span>{backup.created}</span>
                      <Badge
                        variant={
                          backup.type === 'auto' ? 'secondary' : 'default'
                        }
                      >
                        {backup.type === 'auto' ? '自动' : '手动'}
                      </Badge>
                      <Badge
                        variant={
                          backup.status === 'success'
                            ? 'default'
                            : 'destructive'
                        }
                      >
                        {backup.status === 'success' ? '成功' : '失败'}
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Download className="mr-2 h-4 w-4" />
                    下载
                  </Button>
                  <Button variant="outline" size="sm">
                    恢复
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
