'use client';

import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { LocaleLink } from '@/i18n/navigation';
import { AlertCircle, Loader2, Send, Sparkles, User } from 'lucide-react';
import { useState } from 'react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  needsAction?: 'REDIRECT_TO_ANALYSIS' | 'REFRESH_ANALYSIS' | 'PROVIDE_INFO';
  actionUrl?: string;
}

interface ChatContext {
  baziData?: any;
  fengshuiData?: any;
  birthInfo?: {
    date: string;
    time: string | null;
    gender: string | null;
    hasComplete: boolean;
  };
  calculatedBazi?: any; // 计算的八字数据
}

export function AIChatDemo({ context }: { context?: ChatContext }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content:
        '您好！我是QiFlow AI智能顾问 🌟\n\n我可以为您提供：\n• 八字命理分析和运势指导\n• 风水布局优化建议\n• 易学文化知识解答\n\n请问有什么可以帮助您的吗？',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sessionId] = useState(() => `demo_${Date.now()}`);
  // 会话记忆：保存识别到的生辰信息
  const [birthInfo, setBirthInfo] = useState<ChatContext['birthInfo']>(
    context?.birthInfo
  );
  // 保存计算的八字数据
  const [calculatedBazi, setCalculatedBazi] = useState<any>(
    context?.calculatedBazi
  );

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 合并 context 和会话记忆
      const requestContext: ChatContext = {
        ...context,
        birthInfo: birthInfo || context?.birthInfo,
        calculatedBazi: calculatedBazi || context?.calculatedBazi,
      };

      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage.content,
          sessionId,
          context: requestContext,
        }),
      });

      const data = await response.json();

      if (data.success && data.data) {
        // 保存 API 返回的 birthInfo（如果有）
        if (data.data.birthInfo) {
          setBirthInfo(data.data.birthInfo);
          console.log(
            '💾 Saved birthInfo to session memory:',
            data.data.birthInfo
          );
        }

        // 保存计算的八字数据
        if (data.data.calculatedBazi) {
          setCalculatedBazi(data.data.calculatedBazi);
          console.log('🎯 Saved calculated Bazi to session memory');
        }

        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.response,
          timestamp: new Date(),
          needsAction: data.data.needsAction,
          actionUrl: data.data.actionUrl,
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || '响应失败');
      }
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '抱歉，我暂时无法回答您的问题。请稍后再试。',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 示例问题
  const sampleQuestions = [
    { text: '什么是八字命理？', type: 'general' },
    { text: '我的事业运势如何？', type: 'bazi' },
    { text: '客厅的财位在哪里？', type: 'fengshui' },
    { text: '如何改善桃花运？', type: 'bazi' },
  ];

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-500" />
          AI智能顾问
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* 示例问题 */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground mb-2">快速提问：</p>
          <div className="flex flex-wrap gap-2">
            {sampleQuestions.map((q, idx) => (
              <Button
                key={idx}
                variant="outline"
                size="sm"
                onClick={() => setInput(q.text)}
                disabled={isLoading}
              >
                {q.text}
              </Button>
            ))}
          </div>
        </div>

        {/* 聊天消息区域 */}
        <div className="space-y-4 mb-4 h-[400px] overflow-y-auto p-4 bg-muted/20 rounded-lg">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex gap-3 ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`flex gap-3 max-w-[80%] ${
                  message.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-purple-100 text-purple-700'
                  }`}
                >
                  {message.role === 'user' ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                </div>
                <div
                  className={`rounded-lg px-4 py-2 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  <div className="whitespace-pre-wrap text-sm">
                    {message.content}
                  </div>
                  {message.needsAction && message.actionUrl && (
                    <div className="mt-3 pt-3 border-t">
                      <LocaleLink href={message.actionUrl}>
                        <Button size="sm" variant="default">
                          {message.needsAction === 'REDIRECT_TO_ANALYSIS' &&
                            '开始分析'}
                          {message.needsAction === 'REFRESH_ANALYSIS' &&
                            '重新分析'}
                          {message.needsAction === 'PROVIDE_INFO' && '了解更多'}
                        </Button>
                      </LocaleLink>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="bg-background border rounded-lg px-4 py-2">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
        </div>

        {/* 生辰信息记忆提示 */}
        {birthInfo?.hasComplete && (
          <Alert className="mb-4 bg-green-50 border-green-200">
            <Sparkles className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              ✅ 已记住您的出生信息：{birthInfo.date} {birthInfo.time}{' '}
              {birthInfo.gender}
            </AlertDescription>
          </Alert>
        )}

        {/* 数据状态提示 */}
        {!context?.baziData &&
          !context?.fengshuiData &&
          !birthInfo?.hasComplete && (
            <Alert className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                您还没有进行任何分析。AI将基于您的分析数据提供个性化建议。
                <LocaleLink
                  href="/analysis/bazi"
                  className="text-primary underline ml-1"
                >
                  立即开始
                </LocaleLink>
              </AlertDescription>
            </Alert>
          )}

        {/* 输入区域 */}
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="请输入您的问题..."
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* 免责声明 */}
        <p className="text-xs text-muted-foreground text-center mt-4">
          AI建议仅供参考，不构成专业意见。涉及健康、投资等重要决策请咨询专业人士。
        </p>
      </CardContent>
    </Card>
  );
}
