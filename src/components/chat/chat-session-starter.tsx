'use client';

import { createChatSessionAction } from '@/actions/chat/create-chat-session';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Clock, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function ChatSessionStarter({ userId }: { userId: string }) {
  const router = useRouter();
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);

  async function handleStartSession() {
    setIsCreating(true);

    try {
      const result = await createChatSessionAction();

      if (!result.success) {
        if (result.errorCode === 'INSUFFICIENT_CREDITS') {
          toast({
            title: '积分不足',
            description: '您的积分余额不足，请先充值',
            variant: 'destructive',
          });
          router.push('/credits/buy');
          return;
        }

        toast({
          title: '创建会话失败',
          description: result.error,
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: '会话已创建',
        description: '开始与 AI 大师对话吧',
      });

      router.push(`/chat/${result.data.sessionId}`);
    } catch (error) {
      console.error('Start session error:', error);
      toast({
        title: '系统错误',
        description: '创建会话失败，请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Card className="max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl flex items-center gap-2">
          <Sparkles className="w-6 h-6" />
          开启 AI 八字风水对话
        </CardTitle>
        <CardDescription>
          与 AI 大师进行深度对话，获取个性化命理分析与建议
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span>会话时长：15 分钟</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Sparkles className="w-4 h-4" />
            <span>费用：40 积分/次</span>
          </div>
        </div>

        <ul className="space-y-2 text-sm text-muted-foreground">
          <li>• 15 分钟内无限次对话</li>
          <li>• 可随时续费延长时间</li>
          <li>• 支持上传图片与文件</li>
          <li>• 获得个性化分析建议</li>
        </ul>

        <Button
          onClick={handleStartSession}
          disabled={isCreating}
          className="w-full"
          size="lg"
        >
          {isCreating ? '创建中...' : '开始对话 (40 积分)'}
        </Button>
      </CardContent>
    </Card>
  );
}
