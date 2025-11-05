'use client';

import { createCreditCheckoutSession } from '@/actions/create-credit-checkout-session';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { websiteConfig } from '@/config/website';
import { CreditCard, Loader2Icon, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { toast } from 'sonner';

interface PaymentMethodSelectorProps {
  userId: string;
  packageId: string;
  priceId: string;
  packageName: string;
  packageAmount: number;
  packagePrice: string;
  metadata?: Record<string, string>;
  variant?:
    | 'default'
    | 'outline'
    | 'destructive'
    | 'secondary'
    | 'ghost'
    | 'link'
    | null;
  size?: 'default' | 'sm' | 'lg' | 'icon' | null;
  className?: string;
  children?: React.ReactNode;
  disabled?: boolean;
}

type PaymentMethod = 'stripe' | 'wechat' | 'alipay';

/**
 * 支付方式选择组件
 * 支持 Stripe、微信支付、支付宝三种支付方式
 */
export function PaymentMethodSelector({
  userId,
  packageId,
  priceId,
  packageName,
  packageAmount,
  packagePrice,
  metadata,
  variant = 'default',
  size = 'default',
  className,
  children,
  disabled = false,
}: PaymentMethodSelectorProps) {
  const tt = (
    useTranslations as unknown as (
      ns?: any
    ) => (key: string, values?: Record<string, any>) => string
  )('Dashboard.settings.credits.payment');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>('stripe');
  const [isLoading, setIsLoading] = useState(false);

  const handleOpenDialog = () => {
    setIsOpen(true);
  };

  const handleConfirmPayment = async () => {
    try {
      setIsLoading(true);

      // 验证 priceId
      if (!priceId || priceId === 'undefined') {
        toast.error('积分包价格 ID 未配置，请联系管理员');
        setIsLoading(false);
        return;
      }

      // 验证 userId
      if (!userId) {
        toast.error('请先登录再进行购买');
        setIsLoading(false);
        return;
      }

      const mergedMetadata = metadata ? { ...metadata } : {};

      // 添加推广代码
      if (websiteConfig.features.enablePromotekitAffiliate) {
        const promotekitReferral =
          typeof window !== 'undefined'
            ? (window as any).promotekit_referral
            : undefined;
        if (promotekitReferral) {
          mergedMetadata.promotekit_referral = promotekitReferral;
        }
      }

      if (websiteConfig.features.enableAffonsoAffiliate) {
        const affonsoReferral =
          typeof document !== 'undefined'
            ? (() => {
                const match = document.cookie.match(
                  /(?:^|; )affonso_referral=([^;]*)/
                );
                return match ? decodeURIComponent(match[1]) : null;
              })()
            : null;
        if (affonsoReferral) {
          mergedMetadata.affonso_referral = affonsoReferral;
        }
      }

      // 根据选择的支付方式处理
      if (selectedMethod === 'stripe') {
        // Stripe 支付 - 使用原有逻辑
        console.log('[PaymentMethodSelector] Creating checkout session with:', {
          userId,
          packageId,
          priceId,
          metadata: mergedMetadata,
        });

        const result = await createCreditCheckoutSession({
          userId,
          packageId,
          priceId,
          metadata:
            Object.keys(mergedMetadata).length > 0 ? mergedMetadata : undefined,
        });

        console.log('[PaymentMethodSelector] Checkout session result:', result);

        if (result?.data?.success && result.data.data?.url) {
          console.log(
            '[PaymentMethodSelector] Redirecting to:',
            result.data.data.url
          );
          window.location.href = result.data.data?.url;
        } else {
          console.error(
            '[PaymentMethodSelector] Create credit checkout session error, result:',
            JSON.stringify(result, null, 2)
          );

          // 更详细的错误信息
          if (result?.data?.error) {
            toast.error(`${tt('checkoutFailed')}: ${result.data.error}`);
          } else if (result?.serverError) {
            toast.error(`${tt('checkoutFailed')}: ${result.serverError}`);
          } else {
            toast.error(tt('checkoutFailed'));
          }
        }
      } else if (selectedMethod === 'wechat') {
        // 微信支付
        toast.error(tt('wechatNotImplemented'));
        setIsLoading(false);
        return;
        // TODO: 实现微信支付
        // const result = await fetch('/api/payment/wechat/create', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     userId,
        //     packageId,
        //     amount: packageAmount,
        //     metadata: mergedMetadata,
        //   }),
        // });
        // const data = await result.json();
        // if (data.success && data.qrCode) {
        //   const paymentUrl = `/payment/wechat?orderId=${data.orderId}&qrCode=${encodeURIComponent(data.qrCode)}`;
        //   window.location.href = paymentUrl;
        // } else {
        //   toast.error(t('wechatFailed'));
        // }
      } else if (selectedMethod === 'alipay') {
        // 支付宝支付
        toast.error(tt('alipayNotImplemented'));
        setIsLoading(false);
        return;
        // TODO: 实现支付宝支付
        // const result = await fetch('/api/payment/alipay/create', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({
        //     userId,
        //     packageId,
        //     amount: packageAmount,
        //     metadata: mergedMetadata,
        //   }),
        // });
        // const data = await result.json();
        // if (data.success && data.qrCode) {
        //   const paymentUrl = `/payment/alipay?orderId=${data.orderId}&qrCode=${encodeURIComponent(data.qrCode)}`;
        //   window.location.href = paymentUrl;
        // } else {
        //   toast.error(t('alipayFailed'));
        // }
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error(tt('paymentFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        variant={variant}
        size={size}
        className={className}
        onClick={handleOpenDialog}
        disabled={disabled}
      >
        {children}
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              {tt('title')}
            </DialogTitle>
          </DialogHeader>

          <DialogDescription>
            {tt('description', { amount: packageAmount.toLocaleString() })}
          </DialogDescription>
          <div className="space-y-6 py-4">
            {/* 套餐信息 */}
            <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600">
                      {tt('creditsLabel')}
                    </p>
                    <p className="text-2xl font-bold text-purple-600">
                      {packageAmount.toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">{tt('amountLabel')}</p>
                    <p className="text-3xl font-bold">{packagePrice}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 支付方式选择 */}
            <div className="space-y-3">
              <Label className="text-base font-semibold">
                {tt('methodLabel')}
              </Label>
              <RadioGroup
                value={selectedMethod}
                onValueChange={(value) =>
                  setSelectedMethod(value as PaymentMethod)
                }
                className="space-y-3"
              >
                {/* Stripe 信用卡支付 */}
                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition">
                  <RadioGroupItem value="stripe" id="stripe" className="mt-1" />
                  <Label htmlFor="stripe" className="flex-1 cursor-pointer">
                    <div className="flex items-center gap-2 mb-1">
                      <CreditCard className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold">{tt('stripe.name')}</span>
                      <Badge variant="secondary" className="text-xs">
                        {tt('stripe.badge')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {tt('stripe.description')}
                    </p>
                  </Label>
                </div>

                {/* 微信支付 */}
                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition opacity-50">
                  <RadioGroupItem
                    value="wechat"
                    id="wechat"
                    className="mt-1"
                    disabled
                  />
                  <Label htmlFor="wechat" className="flex-1 cursor-not-allowed">
                    <div className="flex items-center gap-2 mb-1">
                      <Smartphone className="w-5 h-5 text-green-600" />
                      <span className="font-semibold">{tt('wechat.name')}</span>
                      <Badge variant="default" className="text-xs bg-gray-400">
                        {tt('comingSoon')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {tt('wechat.description')}
                    </p>
                  </Label>
                </div>

                {/* 支付宝支付 */}
                <div className="flex items-start space-x-3 p-4 border-2 rounded-lg hover:bg-gray-50 cursor-pointer transition opacity-50">
                  <RadioGroupItem
                    value="alipay"
                    id="alipay"
                    className="mt-1"
                    disabled
                  />
                  <Label htmlFor="alipay" className="flex-1 cursor-not-allowed">
                    <div className="flex items-center gap-2 mb-1">
                      <Smartphone className="w-5 h-5 text-blue-500" />
                      <span className="font-semibold">{tt('alipay.name')}</span>
                      <Badge variant="outline" className="text-xs">
                        {tt('comingSoon')}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">
                      {tt('alipay.description')}
                    </p>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            {/* 支付说明 */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex gap-2">
                <div className="text-blue-600">ℹ️</div>
                <div className="flex-1 text-sm text-blue-800">
                  <p className="font-semibold mb-1">{tt('noticeTitle')}</p>
                  <ul className="space-y-1 text-xs">
                    <li>• {tt('notice1')}</li>
                    <li>• {tt('notice2')}</li>
                    <li>• {tt('notice3')}</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 确认按钮 */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setIsOpen(false)}
                disabled={isLoading}
              >
                {tt('cancel')}
              </Button>
              <Button
                className="flex-1"
                onClick={handleConfirmPayment}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2Icon className="mr-2 size-4 animate-spin" />
                    {tt('processing')}
                  </>
                ) : (
                  <>{tt('confirm', { price: packagePrice })}</>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
