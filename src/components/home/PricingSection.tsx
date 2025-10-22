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
import { LocaleLink } from '@/i18n/navigation';
import { motion } from 'framer-motion';
import { Check, Crown, Sparkles, Zap } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface PricingPackage {
  id: string;
  name: string;
  nameKey: string;
  credits: number;
  price: number;
  originalPrice?: number;
  recommended?: boolean;
  icon: any;
  color: string;
  features: string[];
  featureKeys: string[];
}

const packages: PricingPackage[] = [
  {
    id: 'starter',
    name: '入门版',
    nameKey: 'pricing.starter.name',
    credits: 100,
    price: 9.9,
    originalPrice: 19.9,
    icon: Sparkles,
    color: 'from-green-500 to-emerald-500',
    features: [
      '100 积分',
      '约 5-10 次分析',
      '基础八字分析',
      '玄空风水查询',
      '7 天有效期',
    ],
    featureKeys: [
      'pricing.starter.features.credits',
      'pricing.starter.features.analyses',
      'pricing.starter.features.bazi',
      'pricing.starter.features.xuankong',
      'pricing.starter.features.validity',
    ],
  },
  {
    id: 'standard',
    name: '标准版',
    nameKey: 'pricing.standard.name',
    credits: 500,
    price: 39.9,
    originalPrice: 79.9,
    recommended: true,
    icon: Zap,
    color: 'from-purple-500 to-pink-500',
    features: [
      '500 积分',
      '约 25-50 次分析',
      '完整八字分析',
      '高级风水建议',
      'AI 智能咨询',
      'PDF 报告导出',
      '30 天有效期',
    ],
    featureKeys: [
      'pricing.standard.features.credits',
      'pricing.standard.features.analyses',
      'pricing.standard.features.bazi',
      'pricing.standard.features.xuankong',
      'pricing.standard.features.ai',
      'pricing.standard.features.pdf',
      'pricing.standard.features.validity',
    ],
  },
  {
    id: 'professional',
    name: '专业版',
    nameKey: 'pricing.professional.name',
    credits: 1500,
    price: 99.9,
    originalPrice: 199.9,
    icon: Crown,
    color: 'from-amber-500 to-orange-500',
    features: [
      '1500 积分',
      '约 75-150 次分析',
      '深度八字解读',
      '专业风水布局',
      '无限 AI 咨询',
      '优先技术支持',
      'VIP 专属服务',
      '90 天有效期',
    ],
    featureKeys: [
      'pricing.professional.features.credits',
      'pricing.professional.features.analyses',
      'pricing.professional.features.bazi',
      'pricing.professional.features.xuankong',
      'pricing.professional.features.ai',
      'pricing.professional.features.support',
      'pricing.professional.features.vip',
      'pricing.professional.features.validity',
    ],
  },
];

export function PricingSection() {
  const t = useTranslations('home');

  return (
    <section className="py-16 lg:py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* 标题 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-foreground mb-3">
              {t('pricing.title') || '选择适合你的套餐'}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle') ||
                '所有套餐均享首充 50% 优惠，选择更大套餐更划算'}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium">
              <Sparkles className="w-4 h-4" />
              {t('pricing.firstTimeOffer') || '首次充值额外赠送 50% 积分'}
            </div>
          </motion.div>

          {/* 定价卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {packages.map((pkg, index) => (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={pkg.recommended ? 'md:scale-110 z-10' : ''}
              >
                <Card
                  className={`relative h-full ${
                    pkg.recommended
                      ? 'border-2 border-primary shadow-xl'
                      : 'hover:border-primary/30'
                  } transition-all duration-300 hover:shadow-lg`}
                >
                  {pkg.recommended && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <Badge className="bg-primary text-primary-foreground px-4 py-1 text-sm font-bold shadow-lg">
                        🎉 {t('pricing.mostPopular') || '最受欢迎'}
                      </Badge>
                    </div>
                  )}

                  <CardHeader className="text-center pb-8 pt-8">
                    <div className="w-14 h-14 mx-auto rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                      <pkg.icon className="w-7 h-7 text-primary" />
                    </div>
                    <CardTitle className="text-xl font-bold text-card-foreground">
                      {t(pkg.nameKey as any) || pkg.name}
                    </CardTitle>
                    <CardDescription className="mt-2">
                      {pkg.credits} {t('pricing.credits') || '积分'}
                    </CardDescription>
                    <div className="mt-4">
                      {pkg.originalPrice && (
                        <p className="text-sm text-muted-foreground line-through">
                          ¥{pkg.originalPrice}
                        </p>
                      )}
                      <p className="text-4xl font-bold text-foreground">
                        ¥{pkg.price}
                      </p>
                      {pkg.originalPrice && (
                        <p className="text-sm text-primary font-medium mt-1">
                          {t('pricing.save') || '立省'} ¥
                          {(pkg.originalPrice - pkg.price).toFixed(1)}
                        </p>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* 功能列表 */}
                    <ul className="space-y-3">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-muted-foreground text-sm">
                            {t(pkg.featureKeys[idx] as any) || feature}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* 购买按钮 */}
                    <LocaleLink href="/pricing/checkout" className="block">
                      <Button
                        className="w-full mt-6"
                        size="lg"
                        variant={pkg.recommended ? 'default' : 'outline'}
                      >
                        {t('pricing.buyNow') || '立即购买'}
                      </Button>
                    </LocaleLink>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          {/* 底部说明 */}
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-12 text-center space-y-4"
          >
            <p className="text-muted-foreground">
              {t('pricing.hint') ||
                '💡 所有套餐均支持 支付宝、微信支付、信用卡等多种支付方式'}
            </p>
            <p className="text-sm text-muted-foreground/70">
              {t('pricing.refund') ||
                '7 天无理由退款 · 数据加密保护 · 安全可靠'}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
