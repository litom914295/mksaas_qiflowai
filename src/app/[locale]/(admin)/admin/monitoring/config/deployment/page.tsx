/**
 * Staging 环境部署管理页面
 * 管理环境变量、部署历史、健康检查
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  EyeOff,
  GitBranch,
  Plus,
  Rocket,
  Settings,
  Trash2,
  XCircle,
} from 'lucide-react';
import { useState } from 'react';

export default function DeploymentPage() {
  const [showSecrets, setShowSecrets] = useState(false);

  // 模拟部署历史
  const deployments = [
    {
      id: 1,
      version: 'v1.2.3',
      branch: 'staging',
      commit: 'abc123f',
      time: '2025-10-13 14:30:25',
      status: 'success',
      duration: '3m 45s',
      deployer: 'admin@example.com',
    },
    {
      id: 2,
      version: 'v1.2.2',
      branch: 'staging',
      commit: 'def456a',
      time: '2025-10-12 16:20:10',
      status: 'success',
      duration: '3m 52s',
      deployer: 'admin@example.com',
    },
    {
      id: 3,
      version: 'v1.2.1',
      branch: 'staging',
      commit: 'ghi789b',
      time: '2025-10-11 10:15:30',
      status: 'failed',
      duration: '1m 20s',
      deployer: 'admin@example.com',
    },
  ];

  // 模拟环境变量
  const [envVars, setEnvVars] = useState([
    {
      key: 'DATABASE_URL',
      value: 'postgresql://user:****@localhost:5432/staging_db',
      isSecret: true,
    },
    {
      key: 'NEXT_PUBLIC_API_URL',
      value: 'https://staging-api.qiflowai.com',
      isSecret: false,
    },
    {
      key: 'OPENAI_API_KEY',
      value: 'sk-************************************',
      isSecret: true,
    },
    {
      key: 'STRIPE_SECRET_KEY',
      value: 'sk_test_****************************',
      isSecret: true,
    },
    { key: 'NODE_ENV', value: 'staging', isSecret: false },
  ]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-600 animate-spin" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'success':
        return (
          <Badge variant="default" className="bg-green-600">
            成功
          </Badge>
        );
      case 'failed':
        return <Badge variant="destructive">失败</Badge>;
      case 'pending':
        return <Badge variant="outline">进行中</Badge>;
      default:
        return <Badge variant="secondary">未知</Badge>;
    }
  };

  const handleDeploy = () => {
    alert('正在部署到 Staging 环境...');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">部署管理</h1>
          <p className="text-muted-foreground">管理 Staging 环境的部署和配置</p>
        </div>
        <Button onClick={handleDeploy}>
          <Rocket className="mr-2 h-4 w-4" />
          部署到 Staging
        </Button>
      </div>

      {/* 环境状态概览 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">当前版本</CardTitle>
            <GitBranch className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">v1.2.3</div>
            <p className="text-xs text-muted-foreground">staging 分支</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最后部署</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2小时前</div>
            <p className="text-xs text-muted-foreground">2025-10-13 14:30</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">部署成功率</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">95%</div>
            <p className="text-xs text-muted-foreground">过去30天</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">环境状态</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">正常</div>
            <p className="text-xs text-muted-foreground">所有服务运行中</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="deployments" className="space-y-4">
        <TabsList>
          <TabsTrigger value="deployments">部署历史</TabsTrigger>
          <TabsTrigger value="env-vars">环境变量</TabsTrigger>
          <TabsTrigger value="health">健康检查</TabsTrigger>
        </TabsList>

        {/* 部署历史 */}
        <TabsContent value="deployments" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>部署历史</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deployments.map((deployment) => (
                  <div
                    key={deployment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {getStatusIcon(deployment.status)}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold">
                            {deployment.version}
                          </span>
                          <Badge variant="outline">{deployment.branch}</Badge>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          Commit:{' '}
                          <span className="font-mono">{deployment.commit}</span>{' '}
                          | {deployment.time} | 耗时: {deployment.duration}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          部署者: {deployment.deployer}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(deployment.status)}
                      <Button variant="ghost" size="sm">
                        查看日志
                      </Button>
                      {deployment.status === 'success' && (
                        <Button variant="outline" size="sm">
                          回滚
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 环境变量 */}
        <TabsContent value="env-vars" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>环境变量</CardTitle>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSecrets(!showSecrets)}
                  >
                    {showSecrets ? (
                      <EyeOff className="mr-2 h-4 w-4" />
                    ) : (
                      <Eye className="mr-2 h-4 w-4" />
                    )}
                    {showSecrets ? '隐藏' : '显示'}敏感信息
                  </Button>
                  <Button size="sm">
                    <Plus className="mr-2 h-4 w-4" />
                    添加变量
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {envVars.map((envVar, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 border rounded"
                  >
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          变量名
                        </Label>
                        <div className="font-mono text-sm">{envVar.key}</div>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">
                          值
                        </Label>
                        <div className="font-mono text-sm">
                          {envVar.isSecret && !showSecrets
                            ? envVar.value
                            : envVar.value.replace(
                                /\*+/g,
                                'actual_secret_value'
                              )}
                        </div>
                      </div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Settings className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-red-600">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <Button variant="outline" className="w-full">
                  保存环境变量
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>环境变量说明</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm space-y-2 text-muted-foreground">
                <p>
                  • 以{' '}
                  <code className="bg-muted px-1 py-0.5 rounded">
                    NEXT_PUBLIC_
                  </code>{' '}
                  开头的变量会暴露到客户端
                </p>
                <p>• 修改环境变量后需要重新部署才能生效</p>
                <p>• 敏感信息（如 API 密钥）将被加密存储</p>
                <p>
                  • 建议使用环境变量管理工具（如 Vercel、AWS Secrets Manager）
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* 健康检查 */}
        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>健康检查端点</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    endpoint: '/api/health',
                    status: 'healthy',
                    responseTime: '45ms',
                    lastCheck: '1分钟前',
                  },
                  {
                    endpoint: '/api/health/db',
                    status: 'healthy',
                    responseTime: '120ms',
                    lastCheck: '1分钟前',
                  },
                  {
                    endpoint: '/api/health/redis',
                    status: 'healthy',
                    responseTime: '8ms',
                    lastCheck: '1分钟前',
                  },
                  {
                    endpoint: '/api/health/ai',
                    status: 'healthy',
                    responseTime: '350ms',
                    lastCheck: '2分钟前',
                  },
                ].map((check, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded"
                  >
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-600" />
                      <div>
                        <div className="font-mono text-sm">
                          {check.endpoint}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          最后检查: {check.lastCheck}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm font-semibold">
                          {check.responseTime}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          响应时间
                        </div>
                      </div>
                      <Badge variant="default" className="bg-green-600">
                        正常
                      </Badge>
                      <Button variant="outline" size="sm">
                        测试
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
