'use client';

import { useSearchParams } from 'next/navigation';
import { Card } from '@/components/ui/enhanced-card';
import { Button } from '@/components/ui/button';
import { CheckCircle, Download, Home, MessageCircle } from 'lucide-react';
import Link from 'next/link';
import { useEffect } from 'react';
import confetti from 'canvas-confetti';

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get('orderId');

  useEffect(() => {
    // 触发庆祝动画
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center px-4">
      <Card variant="elevated" className="max-w-lg w-full p-8 text-center">
        <div className="mb-6">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold mb-2">支付成功！</h1>
          <p className="text-gray-600">
            订单号：{orderId || 'XXXXXXXXXXXX'}
          </p>
        </div>

        <div className="bg-green-50 rounded-lg p-4 mb-6">
          <h2 className="font-semibold mb-2">您已成功升级到专业版</h2>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>✅ 完整八字命理分析报告</li>
            <li>✅ 详细风水布局指导</li>
            <li>✅ 个性化改运方案</li>
            <li>✅ 12个月流年运势预测</li>
            <li>✅ 无限次AI大师咨询</li>
            <li>✅ PDF报告下载</li>
          </ul>
        </div>

        <div className="space-y-3">
          <Button className="w-full bg-gradient-to-r from-purple-600 to-pink-600" asChild>
            <Link href="/">
              <Home className="w-4 h-4 mr-2" />
              返回首页查看完整报告
            </Link>
          </Button>
          
          <Button variant="outline" className="w-full" asChild>
            <Link href="/report">
              <Download className="w-4 h-4 mr-2" />
              下载PDF报告
            </Link>
          </Button>
          
          <Button variant="ghost" className="w-full">
            <MessageCircle className="w-4 h-4 mr-2" />
            联系客服
          </Button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          如有任何问题，请联系客服：support@qiflow-ai.com
        </p>
      </Card>
    </div>
  );
}