'use client';

import { AIChatInterface } from '@/components/qiflow/ai/ai-chat-interface';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useState } from 'react';

export default function TestAIChatPage() {
  const [withContext, setWithContext] = useState(false);

  const mockContext = {
    bazi: {
      year: '1990',
      month: '01',
      day: '15',
      hour: '08',
      gender: '男',
    },
    xuankong: {
      facing: 180,
      period: 9,
      address: '北京市朝阳区',
    },
    house: {
      rooms: 3,
      layout: '三室一厅',
    },
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 标题 */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">AI对话功能测试</h1>
          <p className="text-muted-foreground">
            测试智能助手的算法优先策略和上下文感知能力
          </p>
        </div>

        {/* 测试说明 */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">功能特点</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>
                <strong>算法优先</strong>：检测问题类型，基于已有数据智能回答
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>
                <strong>上下文感知</strong>：显示可用数据状态（八字/风水/房屋）
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>
                <strong>缺失数据提示</strong>：自动识别并请求所需信息
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>
                <strong>数据来源标注</strong>：显示回答基于哪些数据生成
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-primary font-bold">✓</span>
              <span>
                <strong>快捷问题</strong>：提供常见问题快速输入
              </span>
            </li>
          </ul>
        </Card>

        {/* 模式切换 */}
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-semibold">测试模式</h3>
              <p className="text-sm text-muted-foreground">
                {withContext
                  ? '有数据上下文（模拟已完成分析）'
                  : '无数据上下文（初始状态）'}
              </p>
            </div>
            <Button onClick={() => setWithContext(!withContext)}>
              切换到{withContext ? '无' : '有'}数据模式
            </Button>
          </div>
        </Card>

        {/* AI对话组件 */}
        <AIChatInterface context={withContext ? mockContext : undefined} />

        {/* 测试指南 */}
        <Card className="p-6 space-y-4">
          <h2 className="text-xl font-semibold">测试指南</h2>

          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-sm mb-2">测试1：无数据状态</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>确保处于"无数据模式"</li>
                <li>输入问题："我的八字五行如何？"</li>
                <li>AI应提示需要八字信息</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">测试2：有数据状态</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>切换到"有数据模式"</li>
                <li>观察数据Badge变为绿色打勾状态</li>
                <li>输入同样的问题</li>
                <li>AI应基于提供的数据给出回答</li>
                <li>回答上方显示使用的数据来源Badge</li>
              </ol>
            </div>

            <div>
              <h3 className="font-semibold text-sm mb-2">测试3：混合问题</h3>
              <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                <li>在有数据模式下</li>
                <li>输入："根据我的八字和房屋风水，如何提升财运？"</li>
                <li>AI应综合使用八字和风水数据回答</li>
                <li>显示两个数据来源Badge</li>
              </ol>
            </div>
          </div>
        </Card>

        {/* 预期效果 */}
        <Card className="p-6 bg-blue-50 dark:bg-blue-950/20 border-blue-200">
          <h2 className="text-xl font-semibold mb-4">预期效果</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h3 className="font-semibold mb-2">✅ 应该看到</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• 消息气泡流畅滚动</li>
                <li>• 上下文Badge正确显示</li>
                <li>• 数据来源标签清晰</li>
                <li>• 快捷问题可点击</li>
                <li>• 响应延迟约1秒</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">❌ 不应该出现</h3>
              <ul className="space-y-1 text-muted-foreground">
                <li>• JavaScript错误</li>
                <li>• 样式错乱</li>
                <li>• 消息重复</li>
                <li>• 滚动卡顿</li>
                <li>• 按钮无响应</li>
              </ul>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
