'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import confetti from 'canvas-confetti';
import { CheckCircle, Loader2 } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useEffect, useState } from 'react';

function PaymentCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams?.get('session_id');
  const callbackUrl = searchParams?.get('callback');
  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      // 没有session ID,跳转到首页
      router.push('/');
      return;
    }

    // 触发庆祝动画
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // 延迟2秒后跳转到回调URL或默认页面
    const timer = setTimeout(() => {
      setIsRedirecting(true);
      if (callbackUrl) {
        router.push(callbackUrl);
      } else {
        router.push('/dashboard');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [sessionId, callbackUrl, router]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <Card className="max-w-lg w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">支付成功!</h1>
          <p className="text-muted-foreground">感谢您的购买,交易已完成</p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-green-800">
            {isRedirecting ? (
              <span className="flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                正在跳转...
              </span>
            ) : (
              '即将自动跳转,请稍候...'
            )}
          </p>
        </div>

        <div className="space-y-3">
          <Button
            className="w-full"
            onClick={() => {
              if (callbackUrl) {
                router.push(callbackUrl);
              } else {
                router.push('/dashboard');
              }
            }}
            disabled={isRedirecting}
          >
            {isRedirecting ? '跳转中...' : '立即查看'}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-6">
          订单 ID: {sessionId?.substring(0, 20)}...
        </p>
      </Card>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-muted-foreground">处理支付中...</p>
          </div>
        </div>
      }
    >
      <PaymentCallbackInner />
    </Suspense>
  );
}
