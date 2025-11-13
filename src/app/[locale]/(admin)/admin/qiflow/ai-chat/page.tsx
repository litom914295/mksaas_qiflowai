'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertCircle, Bot, Calendar, MessageSquare, Zap } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function AIChatManagementPage() {
  const [stats, setStats] = useState<any>(null);
  const [notice, setNotice] = useState('');

  useEffect(() => {
    fetch('/api/admin/qiflow/ai-chat?type=stats')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setStats(data.data);
          setNotice(data.data.notice || '');
        }
      });
  }, []);

  return (
    <div className="space-y-6 p-6">
      <div>
        <h1 className="text-3xl font-bold">AI 对话管理</h1>
        <p className="text-muted-foreground">AI咨询记录、模型配置、质量监控</p>
      </div>

      {notice && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{notice}</AlertDescription>
        </Alert>
      )}

      {stats && (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <MessageSquare className="h-4 w-4 text-indigo-500" />
                  总会话数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalSessions}</div>
                <p className="text-xs text-muted-foreground">
                  今日 {stats.todaySessions}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Bot className="h-4 w-4" />
                  总消息数
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalMessages}</div>
                <p className="text-xs text-muted-foreground">
                  平均 {stats.avgMessagesPerSession.toFixed(1)} 条/会话
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Token 消耗
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalTokens}</div>
                <p className="text-xs text-muted-foreground">总计</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  本月会话
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {stats.thisMonthSessions}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>模型使用分布</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-purple-500">
                    {stats.models.gpt4}
                  </div>
                  <div className="text-sm text-muted-foreground">GPT-4</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-blue-500">
                    {stats.models.gpt35}
                  </div>
                  <div className="text-sm text-muted-foreground">GPT-3.5</div>
                </div>
                <div className="text-center p-4 border rounded-lg">
                  <div className="text-2xl font-bold text-orange-500">
                    {stats.models.claude}
                  </div>
                  <div className="text-sm text-muted-foreground">Claude</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>功能说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>
                💬 <strong>对话记录查看</strong>: 查看所有AI对话会话和消息内容
              </p>
              <p>
                📊 <strong>质量监控</strong>: 监控AI回复质量和用户满意度
              </p>
              <p>
                ⚡ <strong>Token统计</strong>: 追踪各模型的Token消耗
              </p>
              <p>
                🛡️ <strong>敏感词过滤</strong>: 审核对话内容,确保合规
              </p>
              <p>
                ⚙️ <strong>模型配置</strong>: 切换和配置不同的AI模型
              </p>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
