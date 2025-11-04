/**
 * 云存储备份配置页面
 * 支持 S3、阿里云 OSS 等云存储配置
 */

'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Cloud, Save, TestTube, Upload } from 'lucide-react';
import { useState } from 'react';

export default function CloudBackupConfigPage() {
  const [enabled, setEnabled] = useState(true);
  const [provider, setProvider] = useState('s3');
  const [autoBackup, setAutoBackup] = useState(true);

  const handleSave = () => {
    alert('云存储配置已保存');
  };

  const handleTest = () => {
    alert('正在测试云存储连接...');
  };

  const handleManualBackup = () => {
    alert('正在执行手动备份...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">云存储备份配置</h1>
          <p className="text-muted-foreground">配置数据库和文件的云存储备份</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleManualBackup}>
            <Upload className="mr-2 h-4 w-4" />
            立即备份
          </Button>
          <Button variant="outline" onClick={handleTest}>
            <TestTube className="mr-2 h-4 w-4" />
            测试连接
          </Button>
          <Button onClick={handleSave}>
            <Save className="mr-2 h-4 w-4" />
            保存配置
          </Button>
        </div>
      </div>

      {/* 基础配置 */}
      <Card>
        <CardHeader>
          <CardTitle>基础配置</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>启用云备份</Label>
              <p className="text-sm text-muted-foreground">
                开启后将自动备份数据到云存储
              </p>
            </div>
            <Switch checked={enabled} onCheckedChange={setEnabled} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="provider">云存储服务商</Label>
            <Select
              value={provider}
              onValueChange={setProvider}
              disabled={!enabled}
            >
              <SelectTrigger id="provider">
                <SelectValue placeholder="选择服务商" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="s3">Amazon S3</SelectItem>
                <SelectItem value="oss">阿里云 OSS</SelectItem>
                <SelectItem value="cos">腾讯云 COS</SelectItem>
                <SelectItem value="azure">Azure Blob Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* S3 配置 */}
      {provider === 's3' && (
        <Card>
          <CardHeader>
            <CardTitle>Amazon S3 配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="accessKeyId">Access Key ID</Label>
                <Input
                  id="accessKeyId"
                  placeholder="AKIAIOSFODNN7EXAMPLE"
                  disabled={!enabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="secretAccessKey">Secret Access Key</Label>
                <Input
                  id="secretAccessKey"
                  type="password"
                  placeholder="wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
                  disabled={!enabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="region">Region</Label>
                <Select disabled={!enabled}>
                  <SelectTrigger id="region">
                    <SelectValue placeholder="选择区域" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="us-east-1">
                      US East (N. Virginia)
                    </SelectItem>
                    <SelectItem value="us-west-2">US West (Oregon)</SelectItem>
                    <SelectItem value="ap-northeast-1">
                      Asia Pacific (Tokyo)
                    </SelectItem>
                    <SelectItem value="ap-southeast-1">
                      Asia Pacific (Singapore)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="bucket">Bucket Name</Label>
                <Input
                  id="bucket"
                  placeholder="my-backup-bucket"
                  disabled={!enabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="prefix">Prefix (可选)</Label>
              <Input
                id="prefix"
                placeholder="backups/qiflowai/"
                disabled={!enabled}
              />
              <p className="text-xs text-muted-foreground">
                备份文件在 Bucket 中的存储路径前缀
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* OSS 配置 */}
      {provider === 'oss' && (
        <Card>
          <CardHeader>
            <CardTitle>阿里云 OSS 配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ossAccessKeyId">Access Key ID</Label>
                <Input
                  id="ossAccessKeyId"
                  placeholder="LTAI5t..."
                  disabled={!enabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ossAccessKeySecret">Access Key Secret</Label>
                <Input
                  id="ossAccessKeySecret"
                  type="password"
                  disabled={!enabled}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ossEndpoint">Endpoint</Label>
                <Input
                  id="ossEndpoint"
                  placeholder="oss-cn-hangzhou.aliyuncs.com"
                  disabled={!enabled}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="ossBucket">Bucket Name</Label>
                <Input
                  id="ossBucket"
                  placeholder="qiflowai-backup"
                  disabled={!enabled}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 备份策略 */}
      <Card>
        <CardHeader>
          <CardTitle>备份策略</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>自动备份</Label>
              <p className="text-sm text-muted-foreground">
                按照设定的计划自动执行备份
              </p>
            </div>
            <Switch
              checked={autoBackup}
              onCheckedChange={setAutoBackup}
              disabled={!enabled}
            />
          </div>

          {autoBackup && (
            <>
              <div className="space-y-2">
                <Label htmlFor="schedule">备份频率</Label>
                <Select disabled={!enabled}>
                  <SelectTrigger id="schedule">
                    <SelectValue placeholder="选择频率" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hourly">每小时</SelectItem>
                    <SelectItem value="daily">每天 (凌晨 2:00)</SelectItem>
                    <SelectItem value="weekly">每周 (周日 2:00)</SelectItem>
                    <SelectItem value="monthly">每月 (1号 2:00)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="retention">保留时间</Label>
                <Select disabled={!enabled}>
                  <SelectTrigger id="retention">
                    <SelectValue placeholder="选择保留时间" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="7">7 天</SelectItem>
                    <SelectItem value="14">14 天</SelectItem>
                    <SelectItem value="30">30 天</SelectItem>
                    <SelectItem value="90">90 天</SelectItem>
                    <SelectItem value="365">1 年</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  超过保留时间的备份文件将被自动删除
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* 备份内容 */}
      <Card>
        <CardHeader>
          <CardTitle>备份内容</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">数据库备份</div>
              <div className="text-xs text-muted-foreground">
                PostgreSQL 完整备份
              </div>
            </div>
            <Switch defaultChecked disabled={!enabled} />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">上传文件备份</div>
              <div className="text-xs text-muted-foreground">
                用户上传的图片和文件
              </div>
            </div>
            <Switch defaultChecked disabled={!enabled} />
          </div>
          <div className="flex items-center justify-between p-3 border rounded">
            <div>
              <div className="font-medium">日志文件备份</div>
              <div className="text-xs text-muted-foreground">
                应用日志和错误日志
              </div>
            </div>
            <Switch disabled={!enabled} />
          </div>
        </CardContent>
      </Card>

      {/* 备份历史 */}
      <Card>
        <CardHeader>
          <CardTitle>最近备份</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {[
              {
                time: '2025-10-13 02:00:12',
                size: '2.3 GB',
                status: 'success',
              },
              {
                time: '2025-10-12 02:00:15',
                size: '2.1 GB',
                status: 'success',
              },
              {
                time: '2025-10-11 02:00:10',
                size: '2.0 GB',
                status: 'success',
              },
            ].map((backup, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 border rounded"
              >
                <div>
                  <div className="text-sm font-mono">{backup.time}</div>
                  <div className="text-xs text-muted-foreground">
                    大小: {backup.size}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-green-600">成功</span>
                  <Button variant="ghost" size="sm">
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
