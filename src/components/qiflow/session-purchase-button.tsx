'use client';

import { createChatSessionAction } from '@/actions/chat/create-chat-session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { QIFLOW_PRICING } from '@/config/qiflow-pricing';
import { useToast } from '@/hooks/use-toast';
import { AlertCircle, Clock, Zap } from 'lucide-react';
import { useState } from 'react';

interface SessionPurchaseButtonProps {
  userCredits: number;
  onPurchaseSuccess?: (sessionData: {
    sessionId: string;
    expiresAt: string;
    creditsUsed: number;
  }) => void;
  onInsufficientCredits?: () => void;
  className?: string;
}

export function SessionPurchaseButton({
  userCredits,
  onPurchaseSuccess,
  onInsufficientCredits,
  className,
}: SessionPurchaseButtonProps) {
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const { toast } = useToast();

  const sessionPrice = QIFLOW_PRICING.chatSession15Min;
  const hasEnoughCredits = userCredits >= sessionPrice;

  const handlePurchase = async () => {
    if (!hasEnoughCredits) {
      onInsufficientCredits?.();
      toast({
        title: '积分不足',
        description: `购买会话需要 ${sessionPrice} 积分，您当前有 ${userCredits} 积分`,
        variant: 'destructive',
      });
      return;
    }

    setIsPurchasing(true);

    try {
      // 调用 server action 创建会话
      const result = await createChatSessionAction();

      if (!result.success) {
        // 处理积分不足情况
        if (result.errorCode === 'INSUFFICIENT_CREDITS') {
          toast({
            title: '积分不足',
            description: `需要 ${result.required} 积分，当前余额 ${result.current}`,
            variant: 'destructive',
          });
          onInsufficientCredits?.();
          return;
        }

        throw new Error(result.error || '购买失败');
      }

      if (result.data) {
        toast({
          title: '购买成功！',
          description: `15分钟无限畅聊会话已激活，消耗 ${sessionPrice} 积分`,
        });

        onPurchaseSuccess?.({
          sessionId: result.data.sessionId,
          expiresAt: result.data.expiresAt,
          creditsUsed: sessionPrice,
        });

        setIsConfirmOpen(false);
      }
    } catch (error) {
      console.error('Purchase error:', error);
      toast({
        title: '购买失败',
        description: error instanceof Error ? error.message : '请稍后重试',
        variant: 'destructive',
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsConfirmOpen(true)}
        className={className}
        size="lg"
        disabled={!hasEnoughCredits}
      >
        <Zap className="mr-2 h-5 w-5" />
        开启15分钟畅聊
        <Badge variant="secondary" className="ml-2">
          {sessionPrice} 积分
        </Badge>
      </Button>

      <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-500" />
              确认购买聊天会话
            </DialogTitle>
            <DialogDescription>
              购买后可在15分钟内无限次对话，不额外消耗积分
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* 会话详情 */}
            <div className="rounded-lg border bg-muted/50 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">会话时长</span>
                <span className="text-lg font-bold text-blue-600">15 分钟</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">消耗积分</span>
                <span className="text-lg font-bold text-orange-600">
                  {sessionPrice} 积分
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">单价</span>
                <span className="text-sm text-muted-foreground">
                  1 积分/分钟
                </span>
              </div>
            </div>

            {/* 用户积分余额 */}
            <div className="flex items-center justify-between rounded-lg border p-3">
              <span className="text-sm">当前积分余额</span>
              <span
                className={`font-bold ${
                  hasEnoughCredits ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {userCredits} 积分
              </span>
            </div>

            {/* 积分不足警告 */}
            {!hasEnoughCredits && (
              <div className="flex items-start gap-2 rounded-lg bg-red-50 dark:bg-red-950/20 p-3">
                <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700 dark:text-red-300">
                  <p className="font-medium">积分不足</p>
                  <p className="mt-1">
                    还需要 {sessionPrice - userCredits} 积分才能购买此会话
                  </p>
                </div>
              </div>
            )}

            {/* 会话特点 */}
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground font-medium">
                会话特点：
              </p>
              <ul className="text-xs text-muted-foreground space-y-1 pl-4">
                <li>• 15分钟内无限次提问，不额外扣费</li>
                <li>• 支持八字、风水等所有类型咨询</li>
                <li>• 超时后可重新购买新会话</li>
                <li>• 每分钟仅需1积分，超值优惠</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmOpen(false)}
              disabled={isPurchasing}
            >
              取消
            </Button>
            <Button
              onClick={handlePurchase}
              disabled={!hasEnoughCredits || isPurchasing}
              className="min-w-[100px]"
            >
              {isPurchasing ? '购买中...' : '确认购买'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
