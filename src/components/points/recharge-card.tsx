'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { motion } from 'framer-motion';
import {
  AlertCircle,
  Check,
  Coins,
  CreditCard,
  Smartphone,
  Sparkles,
} from 'lucide-react';
import { useState } from 'react';

type RechargePackage = {
  id: string;
  amount: number;
  bonus: number;
  price: number;
  popular?: boolean;
  tag?: string;
};

const rechargePackages: RechargePackage[] = [
  { id: '1', amount: 100, bonus: 0, price: 10, tag: '入门' },
  { id: '2', amount: 500, bonus: 50, price: 50, popular: true, tag: '热门' },
  { id: '3', amount: 1000, bonus: 150, price: 100, tag: '超值' },
  { id: '4', amount: 2000, bonus: 400, price: 200, tag: '豪华' },
  { id: '5', amount: 5000, bonus: 1200, price: 500, tag: 'VIP' },
];

export default function RechargeCard() {
  const [selectedPackage, setSelectedPackage] = useState<string>('2');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'wechat' | 'alipay'>(
    'wechat'
  );

  const selectedPkg = rechargePackages.find(
    (pkg) => pkg.id === selectedPackage
  );

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader>
        <div className="flex items-center gap-2">
          <div className="rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 p-2 text-white">
            <Coins className="h-6 w-6" />
          </div>
          <div>
            <CardTitle className="text-xl">积分充值</CardTitle>
            <CardDescription>选择充值套餐获取更多积分</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <Tabs defaultValue="package" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="package">套餐充值</TabsTrigger>
            <TabsTrigger value="custom">自定义金额</TabsTrigger>
          </TabsList>

          {/* 套餐充值 */}
          <TabsContent value="package" className="space-y-4">
            <RadioGroup
              value={selectedPackage}
              onValueChange={setSelectedPackage}
              className="grid gap-3"
            >
              {rechargePackages.map((pkg, index) => (
                <motion.div
                  key={pkg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Label
                    htmlFor={pkg.id}
                    className={`relative flex cursor-pointer items-center justify-between rounded-lg border-2 p-4 transition-all hover:border-primary ${
                      selectedPackage === pkg.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <RadioGroupItem
                        value={pkg.id}
                        id={pkg.id}
                        className="shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="text-2xl font-bold">{pkg.amount}</p>
                          {pkg.bonus > 0 && (
                            <>
                              <span className="text-lg text-muted-foreground">
                                +
                              </span>
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-700"
                              >
                                <Sparkles className="mr-1 h-3 w-3" />
                                赠送 {pkg.bonus}
                              </Badge>
                            </>
                          )}
                          {pkg.tag && (
                            <Badge
                              variant={pkg.popular ? 'default' : 'outline'}
                              className="text-xs"
                            >
                              {pkg.tag}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-muted-foreground">
                          实得 {pkg.amount + pkg.bonus} 积分
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-primary">
                        ¥{pkg.price}
                      </p>
                      {pkg.bonus > 0 && (
                        <p className="text-xs text-muted-foreground">
                          优惠 {((pkg.bonus / pkg.amount) * 100).toFixed(0)}%
                        </p>
                      )}
                    </div>
                    {pkg.popular && (
                      <div className="absolute -right-1 -top-1 rounded-full bg-gradient-to-r from-orange-500 to-red-500 px-2 py-1 text-xs font-medium text-white shadow-lg">
                        最受欢迎
                      </div>
                    )}
                  </Label>
                </motion.div>
              ))}
            </RadioGroup>

            {/* 活动提示 */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-800 dark:bg-blue-900/20"
            >
              <div className="flex items-start gap-2">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
                <div className="text-sm text-blue-900 dark:text-blue-300">
                  <p className="font-medium">限时优惠</p>
                  <p className="mt-1">
                    首次充值额外赠送20%积分！活动截止时间：2024年3月31日
                  </p>
                </div>
              </div>
            </motion.div>
          </TabsContent>

          {/* 自定义金额 */}
          <TabsContent value="custom" className="space-y-4">
            <div>
              <Label htmlFor="custom-amount" className="mb-2 block">
                充值金额（¥）
              </Label>
              <Input
                id="custom-amount"
                type="number"
                placeholder="请输入充值金额（最低¥10）"
                value={customAmount}
                onChange={(e) => setCustomAmount(e.target.value)}
                min={10}
              />
              {customAmount && Number(customAmount) >= 10 && (
                <p className="mt-2 text-sm text-muted-foreground">
                  将获得{' '}
                  <span className="font-semibold text-primary">
                    {Number(customAmount) * 10}
                  </span>{' '}
                  积分
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {/* 支付方式 */}
        <div className="space-y-3">
          <Label className="text-base font-medium">选择支付方式</Label>
          <RadioGroup
            value={paymentMethod}
            onValueChange={(v) => setPaymentMethod(v as any)}
            className="grid grid-cols-2 gap-3"
          >
            <Label
              htmlFor="wechat"
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                paymentMethod === 'wechat'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                  : 'border-border hover:border-green-300'
              }`}
            >
              <RadioGroupItem value="wechat" id="wechat" className="shrink-0" />
              <Smartphone className="h-5 w-5 text-green-600" />
              <span className="font-medium">微信支付</span>
            </Label>
            <Label
              htmlFor="alipay"
              className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                paymentMethod === 'alipay'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-border hover:border-blue-300'
              }`}
            >
              <RadioGroupItem value="alipay" id="alipay" className="shrink-0" />
              <CreditCard className="h-5 w-5 text-blue-600" />
              <span className="font-medium">支付宝</span>
            </Label>
          </RadioGroup>
        </div>

        {/* 充值按钮 */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            size="lg"
            className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-lg font-semibold hover:from-purple-600 hover:to-pink-600"
            disabled={!selectedPkg && !customAmount}
          >
            <Check className="mr-2 h-5 w-5" />
            立即支付 ¥{selectedPkg?.price || Number(customAmount) || 0}
          </Button>
          <p className="mt-2 text-center text-xs text-muted-foreground">
            支付即代表您同意{' '}
            <span className="text-primary underline">《充值协议》</span>
          </p>
        </motion.div>

        {/* 安全提示 */}
        <div className="rounded-lg bg-muted/50 p-3">
          <div className="flex items-start gap-2 text-sm text-muted-foreground">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
            <div className="space-y-1">
              <p>✓ 支付安全加密，保障资金安全</p>
              <p>✓ 充值即时到账，无需等待</p>
              <p>✓ 7×24小时客服支持</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
